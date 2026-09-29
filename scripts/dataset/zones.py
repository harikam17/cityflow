"""Shared zone geometry helpers for the dataset build scripts.

Zone boundaries come from the BBMP 2022 zone map (OpenCity, KML). Zone names in
that file differ from the names used by the mobility-indicators CSV, so this
module is the single place that reconciles them.
"""

import re
import xml.etree.ElementTree as ET
from pathlib import Path

from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw"
DERIVED = ROOT / "data" / "derived"

# KML "Zone" attribute -> canonical zone record used throughout the app.
# csvName is the row name in data/bengaluru-mobility-indicators.csv
# (Byatarayanapura was the original name of what BBMP now calls Yelahanka zone).
# wasteName is the zone label in the BBMP waste collection CSV; wardZone the label in the ward census CSV.
ZONES = [
    {"id": "zone-west", "kml": "West", "name": "West", "csvName": "Bangalore West", "wasteName": "West", "wardZone": "West"},
    {"id": "zone-east", "kml": "East", "name": "East", "csvName": "Bangalore East", "wasteName": "East", "wardZone": "East"},
    {"id": "zone-south", "kml": "South", "name": "South", "csvName": "Bangalore South", "wasteName": "South", "wardZone": "South"},
    {"id": "zone-yelahanka", "kml": "Yelahanka", "name": "Yelahanka", "csvName": "Byatarayanapura", "wasteName": "Yelahanka", "wardZone": "Yelahanka"},
    {"id": "zone-mahadevapura", "kml": "Mahadevpura", "name": "Mahadevapura", "csvName": "Mahadevapura", "wasteName": "Mahadevapura", "wardZone": "Mahadevapura"},
    {"id": "zone-bommanahalli", "kml": "Bommanahalli", "name": "Bommanahalli", "csvName": "Bommanahalli", "wasteName": "Bommanahalli", "wardZone": "Bommanahalli"},
    {"id": "zone-rrnagar", "kml": "Raja Rajeswari Nagar", "name": "Rajarajeshwari Nagar", "csvName": "Rajarajeshwari Nagara", "wasteName": "RRNagar", "wardZone": "Rajarajeshwari"},
    {"id": "zone-dasarahalli", "kml": "Dasarahalli", "name": "Dasarahalli", "csvName": "Dasarahalli", "wasteName": "Dasarahalli", "wardZone": "Dasarahalli"},
]

_NS = {"k": "http://www.opengis.net/kml/2.2"}


def _parse_ring(text):
    pts = []
    for tok in text.split():
        lon, lat, *_ = tok.split(",")
        pts.append((float(lon), float(lat)))
    return pts


def load_zone_polygons():
    """Returns {zone_id: shapely (Multi)Polygon in lon/lat}."""
    tree = ET.parse(RAW / "bbmp-zones-2022.kml")
    by_kml = {}
    for pm in tree.getroot().iter("{http://www.opengis.net/kml/2.2}Placemark"):
        zone = None
        for sd in pm.iter("{http://www.opengis.net/kml/2.2}SimpleData"):
            if sd.get("name") == "Zone":
                zone = sd.text.strip()
        polys = []
        for poly in pm.iter("{http://www.opengis.net/kml/2.2}Polygon"):
            outer = poly.find("k:outerBoundaryIs/k:LinearRing/k:coordinates", _NS)
            inners = poly.findall("k:innerBoundaryIs/k:LinearRing/k:coordinates", _NS)
            polys.append(Polygon(_parse_ring(outer.text), [_parse_ring(i.text) for i in inners]))
        geom = unary_union(polys)
        by_kml[zone] = unary_union([by_kml[zone], geom]) if zone in by_kml else geom

    out = {}
    for z in ZONES:
        geom = by_kml[z["kml"]]
        if not geom.is_valid:
            geom = geom.buffer(0)
        out[z["id"]] = geom
    return out


def geodesic_length_km(line):
    """Length of a lon/lat LineString in km (equirectangular approximation, <0.1% error at city scale)."""
    import math
    coords = list(line.coords)
    total = 0.0
    for (x1, y1), (x2, y2) in zip(coords, coords[1:]):
        lat = math.radians((y1 + y2) / 2)
        dx = math.radians(x2 - x1) * math.cos(lat)
        dy = math.radians(y2 - y1)
        total += 6371.0088 * math.hypot(dx, dy)
    return total


def area_km2(geom):
    """Approximate area in km² for a lon/lat geometry near Bengaluru."""
    import math
    from shapely.affinity import scale
    lat0 = math.radians(geom.centroid.y)
    kx = 111.320 * math.cos(lat0)
    ky = 110.574
    return scale(geom, xfact=kx, yfact=ky, origin=(0, 0)).area
