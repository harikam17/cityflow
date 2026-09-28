"""Step 1: OpenStreetMap roads -> lane-km and peak capacity per BBMP zone.

Input : data/raw/osm/tile*.json  (Overpass export, not committed: ~75 MB; see ARCHITECTURE.md to re-fetch)
Output: data/derived/roads-by-zone.json (committed; this is what build_dataset.py consumes)

Capacity is expressed as PCU-km per hour: sum over road segments of
  length_km x lanes x per-lane capacity (PCU/hr/lane)
Per-lane capacities follow IRC:106-1990 (Guidelines for Capacity of Urban Roads in
Plain Areas), which gives total two-way capacities by road type; see PER_LANE_CAPACITY.
"""

import json
from collections import defaultdict

from shapely.geometry import LineString
from shapely.strtree import STRtree

from zones import ZONES, RAW, DERIVED, load_zone_polygons, geodesic_length_km

# OSM highway class -> IRC:106 functional class
ROAD_CLASS = {
    "motorway": "expressway", "motorway_link": "expressway",
    "trunk": "arterial", "trunk_link": "arterial",
    "primary": "arterial", "primary_link": "arterial",
    "secondary": "sub_arterial", "secondary_link": "sub_arterial",
    "tertiary": "collector", "tertiary_link": "collector",
    "residential": "local", "unclassified": "local", "living_street": "local",
}

# PCU/hr/lane. IRC:106-1990 Table 2 totals divided by lane count:
#   arterial: 2-lane two-way 1500 -> 750; 4-lane divided 3600 -> 900
#   sub-arterial: 1200 -> 600; 2900 -> 725
#   collector: 900 -> 450 (no divided value given; same used)
# expressway: grade-separated (e.g. Hosur Road elevated) ~ Indo-HCM multilane expressway, 1800.
# local: not covered by IRC:106; 300 assumed for narrow residential streets with parking/frontage.
PER_LANE_CAPACITY = {
    "expressway": {"undivided": 1800, "divided": 1800},
    "arterial": {"undivided": 750, "divided": 900},
    "sub_arterial": {"undivided": 600, "divided": 725},
    "collector": {"undivided": 450, "divided": 450},
    "local": {"undivided": 300, "divided": 300},
}

# Lane count when the OSM "lanes" tag is missing (total lanes on the way).
DEFAULT_LANES = {
    ("expressway", True): 2, ("expressway", False): 4,
    ("arterial", True): 2, ("arterial", False): 4,
    ("sub_arterial", True): 2, ("sub_arterial", False): 2,
    ("collector", True): 1, ("collector", False): 2,
    ("local", True): 1, ("local", False): 2,
}

# Named corridors offered as closures in the simulator. Matched against OSM name / ref tags.
CORRIDORS = [
    {"id": "corridor-orr", "name": "Outer Ring Road", "match": ["outer ring road"]},
    {"id": "corridor-hosur", "name": "Hosur Road (NH 44 south)", "match": ["hosur road"]},
    {"id": "corridor-bellary", "name": "Bellary Road (NH 44 north)", "match": ["bellary road", "ballari road"]},
    {"id": "corridor-tumkur", "name": "Tumkur Road (NH 48)", "match": ["tumkur road", "tumakuru road"]},
    {"id": "corridor-mysore", "name": "Mysore Road", "match": ["mysore road", "mysuru road"]},
    {"id": "corridor-old-madras", "name": "Old Madras Road", "match": ["old madras road"]},
    {"id": "corridor-old-airport", "name": "Old Airport Road", "match": ["old airport road", "hal airport road"]},
    {"id": "corridor-bannerghatta", "name": "Bannerghatta Road", "match": ["bannerghatta road", "bannerghatta main road"]},
]


def parse_lanes(tags, cls, oneway):
    raw = tags.get("lanes", "")
    try:
        n = float(raw.split(";")[0])
        if 1 <= n <= 12:
            return n, True
    except ValueError:
        pass
    return DEFAULT_LANES[(cls, oneway)], False


def corridor_for(tags):
    text = " ".join(tags.get(k, "") for k in ("name", "name:en", "alt_name", "old_name")).lower()
    for c in CORRIDORS:
        if any(m in text for m in c["match"]):
            return c["id"]
    return None


def main():
    polys = load_zone_polygons()
    zone_ids = list(polys)
    tree = STRtree([polys[z] for z in zone_ids])

    seen = set()
    stats = {z: defaultdict(lambda: {"km": 0.0, "laneKm": 0.0, "capacityPcuKmPerHr": 0.0, "lanesTaggedKm": 0.0}) for z in zone_ids}
    corridor_stats = {z: defaultdict(lambda: {"laneKm": 0.0, "capacityPcuKmPerHr": 0.0}) for z in zone_ids}

    for tile in sorted((RAW / "osm").glob("tile*.json")):
        data = json.loads(tile.read_text(encoding="utf-8"))
        for el in data["elements"]:
            if el["type"] != "way" or el["id"] in seen or "geometry" not in el:
                continue
            seen.add(el["id"])
            tags = el.get("tags", {})
            cls = ROAD_CLASS.get(tags.get("highway"))
            if not cls or tags.get("access") in ("private", "no") or tags.get("area") == "yes":
                continue
            line = LineString([(p["lon"], p["lat"]) for p in el["geometry"]])
            oneway = tags.get("oneway") in ("yes", "1", "-1")
            lanes, tagged = parse_lanes(tags, cls, oneway)
            divided = "divided" if oneway else "undivided"
            per_lane = PER_LANE_CAPACITY[cls][divided]
            corridor = corridor_for(tags)

            for idx in tree.query(line, predicate="intersects"):
                zid = zone_ids[idx]
                part = line.intersection(polys[zid])
                if part.is_empty:
                    continue
                parts = getattr(part, "geoms", [part])
                km = sum(geodesic_length_km(p) for p in parts if p.geom_type == "LineString")
                s = stats[zid][cls]
                s["km"] += km
                s["laneKm"] += km * lanes
                s["capacityPcuKmPerHr"] += km * lanes * per_lane
                if tagged:
                    s["lanesTaggedKm"] += km
                # Closures remove through-capacity, so only the major-network segments of a corridor count
                if corridor and cls in ("expressway", "arterial", "sub_arterial"):
                    c = corridor_stats[zid][corridor]
                    c["laneKm"] += km * lanes
                    c["capacityPcuKmPerHr"] += km * lanes * per_lane

    out = {
        "source": "OpenStreetMap contributors (ODbL), Overpass API export",
        "method": "Road ways clipped to BBMP 2022 zone polygons; capacity = length x lanes x IRC:106 per-lane capacity",
        "perLaneCapacityPcuPerHr": PER_LANE_CAPACITY,
        "defaultLanes": {f"{k[0]}|{'oneway' if k[1] else 'twoway'}": v for k, v in DEFAULT_LANES.items()},
        "corridors": [{"id": c["id"], "name": c["name"]} for c in CORRIDORS],
        "zones": {},
    }
    for z in ZONES:
        zid = z["id"]
        byclass = {k: {kk: round(vv, 1) for kk, vv in v.items()} for k, v in stats[zid].items()}
        out["zones"][zid] = {
            "byClass": byclass,
            "totalRoadKm": round(sum(v["km"] for v in stats[zid].values()), 1),
            "totalLaneKm": round(sum(v["laneKm"] for v in stats[zid].values()), 1),
            "capacityPcuKmPerHr": round(sum(v["capacityPcuKmPerHr"] for v in stats[zid].values())),
            "corridors": {k: {kk: round(vv, 1) for kk, vv in v.items()} for k, v in corridor_stats[zid].items()},
        }

    DERIVED.mkdir(parents=True, exist_ok=True)
    (DERIVED / "roads-by-zone.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    for z in ZONES:
        d = out["zones"][z["id"]]
        print(f'{z["name"]:22} roads {d["totalRoadKm"]:7.0f} km  lane-km {d["totalLaneKm"]:7.0f}  cap {d["capacityPcuKmPerHr"]:9,} PCU-km/hr  corridors {sorted(d["corridors"])}')


if __name__ == "__main__":
    main()
