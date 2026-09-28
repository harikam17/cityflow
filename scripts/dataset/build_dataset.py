"""Step 2: assemble the CityFlow Bengaluru dataset from real sources.

Inputs (all under data/):
  bengaluru-mobility-indicators.csv          zone population, jobs, trip rate, trip length, mode shares
  raw/bbmp-zones-2022.kml                    BBMP zone boundaries (OpenCity)
  raw/bbmp-segregated-waste-collections-2020.csv   zone/division waste collected, TPD (OpenCity / BBMP)
  raw/bbmp-waste-processing-plants.csv       BBMP processing plant capacities, TPD (OpenCity / BBMP)
  raw/bmrcl-station-hourly.csv.zip           Namma Metro hourly boardings per station, Aug-Sep 2025 (RTI, Vonter/bmrcl-ridership-hourly)
  raw/wikidata-metro-stations.json           metro station coordinates (Wikidata)
  derived/roads-by-zone.json                 output of extract_roads.py (OpenStreetMap)
  office-clusters.csv                        Grade-A office clusters (ICRA Mar 2025 totals, cluster split estimated)

Output:
  src/data/generated/bengaluruDataset.json   consumed by the app and the simulation engine

Every number in the output is tagged as "measured", "derived" (arithmetic on measured
inputs) or "assumed" in the provenance table. Assumptions live in ASSUMPTIONS below.
"""

import csv
import io
import json
import math
import re
import zipfile
from collections import defaultdict

from shapely.geometry import Point, mapping

from zones import ZONES, ROOT, RAW, DERIVED, load_zone_polygons, area_km2

OUT = ROOT / "src" / "data" / "generated" / "bengaluruDataset.json"
BASE_YEAR = 2025

# ---------------------------------------------------------------------------
# Constants taken from published sources (not assumptions)
# ---------------------------------------------------------------------------
SOURCED = {
    # CMP 2020 household survey, average occupancy (persons per vehicle)
    "occupancy": {"twoWheeler": 1.5, "carVan": 2.3, "auto": 1.8, "taxi": 2.3, "bus": 37.5},
    # IRC:106-1990 Table 1 passenger car units
    "pcu": {"twoWheeler": 0.5, "carVan": 1.0, "auto": 1.2, "taxi": 1.0, "bus": 2.2, "lcv": 1.4, "truck": 2.2},
    # CMP 2020 average trip length by mode (km), as reported in ADB/ATO "Bengaluru Urban Transport - State of Play".
    # Auto-rickshaw has no published figure and uses each zone's survey average trip length.
    "tripLengthKm": {"twoWheeler": 9.8, "carVan": 10.2, "taxi": 13.1},
    # CMP 2020 Table 2-7: BMTC fleet operated (2018)
    "bmtcFleet": 6143,
    # CMP 2020 speed & delay survey: average peak journey speeds on major corridors (km/h)
    "observedPeakSpeedKmph": {"private": 11, "publicTransport": 8},
    # CTTP (RITES) Fig 3.3, screenline composition inside the city: truck 4.9%, LCV 3.5% of vehicles
    "goodsVehicleShare": {"truck": 0.049, "lcv": 0.035},
    # CMP 2020 Table 2-18: goods vehicles entering Bengaluru per day by type
    "inboundGoodsVehiclesPerDay": {"lcv": 8450, "truck": 17740, "mav": 4019},
    # ICRA, Commercial Real Estate - Office - Bengaluru (March 2025): Grade-A stock as of 31 Dec 2024,
    # occupancy Dec 2024, share of stock in the north-east + south-east regions
    "officeStock": {"gradeAMsf": 263, "occupancy": 0.886, "northEastSouthEastShare": 0.86, "asOf": "2024-12"},
    # Bengaluru office stock CAGR 2013-2024 (industry reports); backs out the stock already present in 2011
    "officeStockCagr": 0.075,
}

# ---------------------------------------------------------------------------
# Assumptions (explicit, each with its basis) -- surfaced in the app and ARCHITECTURE.md
# ---------------------------------------------------------------------------
ASSUMPTIONS = {
    "peakHourFactor": {"value": 0.10, "basis": "Share of daily trips in the peak hour; Indian metro planning range 8-11% (CTTP/CMP practice)."},
    "peakDirectionShare": {"value": 0.60, "basis": "60:40 directional split in the peak hour (standard design practice); peak-direction lanes carry 60% of flow on 50% of lanes."},
    "majorRoadVehicleKmShare": {"value": 0.70, "basis": "Share of peak vehicle-km carried on the arterial / sub-arterial / expressway network; collectors and local streets carry the access legs of trips."},
    "freeFlowSpeedKmph": {"value": 40, "basis": "Free-flow speed on urban arterials (IRC:106 design speeds 50-60 km/h, reduced for signal density)."},
    "bprBeta": {"value": 2, "basis": "Delay-curve exponent for signal-controlled urban networks, where delay grows closer to linearly with load than on uninterrupted highways (the original BPR value of 4)."},
    "peakWorkTripShare": {"value": 0.6, "basis": "Share of peak-hour trips going to a workplace; the rest (school, errands) are attracted in proportion to population."},
    "routeCircuity": {"value": 1.3, "basis": "Road distance / straight-line distance between zone centres (typical urban value 1.2-1.4)."},
    "busPeakSpeedKmph": {"value": 8, "basis": "CMP 2020 observed public-transport peak journey speed (measured value reused as bus operating speed)."},
    "transitServiceElasticity": {"value": 0.5, "basis": "Ridership elasticity to service frequency of about +0.5 (TCRP Report 95, Ch. 9)."},
    "payloadTonnes": {"value": {"lcv": 2.0, "truck": 9.0, "mav": 20.0}, "basis": "Typical rated payloads for Indian LCV, 2-axle truck and multi-axle vehicle."},
    "loadFactor": {"value": 0.6, "basis": "Average laden share of goods-vehicle capacity including empty backhauls."},
    "freightFleetUtilisation": {"value": 0.75, "basis": "Freight fleet sized to run at 75% utilisation under city-average baseline congestion (no public fleet-capacity data)."},
    "travelShareOfCycleTime": {"value": 0.5, "basis": "Half of a delivery / waste-collection cycle is driving; the rest is loading, unloading and handling. Congestion scales only the driving half."},
    "wasteProcessingCapacityTpd": {"value": 2750, "basis": "BBMP operational processing plants ('old sites') per BBMP plant list; 2,300 TPD of listed new sites excluded as commissioning status is unverified."},
    "overallWeights": {"value": {"traffic": 0.4, "logistics": 0.3, "waste": 0.3}, "basis": "Composite index weights; policy choice, not data. The three indices are also shown separately."},
    "sqftPerOfficeSeat": {"value": 110, "basis": "Gross leasable area per office seat; Indian Grade-A benchmark 100-125 sq ft."},
    "officeClusterSplit": {"value": "data/office-clusters.csv", "basis": "Split of ICRA's 263 msf across 15 named clusters. Region totals match ICRA (86% north-east + south-east; ORR, Whitefield and Nagavara ~36%); the split within a region is estimated. Clusters outside BBMP go to the nearest zone, whose roads carry their commute."},
    "metroServiceElasticity": {"value": 0.5, "basis": "Ridership elasticity to metro service (frequency / coverage); same TCRP Report 95 value as bus."},
    "closureDiversionShare": {"value": 0.3, "basis": "Share of a closed corridor's displaced peak traffic that reroutes through neighbouring zones; the rest diverts to parallel roads inside the zone."},
    "offPeakTravelTimeIndex": {"value": 1.3, "basis": "Travel-time index for night / off-peak runs (near free flow, with signal delay)."},
}


# Road classes forming the "major road network" that carries through traffic (CMP usage: arterial and sub-arterial)
MAJOR_CLASSES = ("expressway", "arterial", "sub_arterial")


def pct(s):
    return float(s.strip().rstrip("%")) if s.strip() else 0.0


def load_mobility_csv():
    rows = {}
    with open(ROOT / "data" / "bengaluru-mobility-indicators.csv", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            rows[r["Zone"].strip()] = r
    return rows


def load_waste_collections():
    """Sum division rows into zones (zone name only on first row of each block)."""
    april, may = defaultdict(float), defaultdict(float)
    zone = None
    with open(RAW / "bbmp-segregated-waste-collections-2020.csv", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["Zone"].strip():
                zone = r["Zone"].strip()
            if not r["Division"].strip():
                continue  # city total row
            april[zone] += float(r["Total Waste Collected (TPD) - April"])
            may[zone] += float(r["Total Waste Collected (TPD) - May"])
    return april, may


def load_metro(polys):
    """Average daily boardings per zone, from station-hourly boardings + Wikidata coordinates."""
    wd = json.loads((RAW / "wikidata-metro-stations.json").read_text(encoding="utf-8"))["results"]["bindings"]
    coords = {}
    for b in wd:
        name = re.sub(r"\s+metro station$", "", b["sLabel"]["value"], flags=re.I).strip()
        lon, lat = map(float, re.findall(r"[-\d.]+", b["coord"]["value"]))
        coords[norm(name)] = (lon, lat)

    z = zipfile.ZipFile(RAW / "bmrcl-station-hourly.csv.zip")
    rows = list(csv.DictReader(io.TextIOWrapper(z.open(z.namelist()[0]), "utf-8"), delimiter=";"))
    days = len({r["Date"] for r in rows})
    per_station = defaultdict(int)
    for r in rows:
        per_station[r["Station"]] += int(r["Ridership"])

    by_zone = defaultdict(lambda: {"stations": [], "dailyBoardings": 0})
    unmatched = []
    for station, total in per_station.items():
        c = coords.get(norm(station)) or coords.get(norm(STATION_ALIASES.get(station, "")))
        if not c:
            unmatched.append(station)
            continue
        pt = Point(c)
        for zid, poly in polys.items():
            if poly.contains(pt):
                by_zone[zid]["stations"].append(station)
                by_zone[zid]["dailyBoardings"] += total / days
                break
    city_total = sum(per_station.values()) / days
    return by_zone, city_total, days, unmatched


# BMRCL (RTI) station names -> Wikidata labels where they differ
STATION_ALIASES = {
    "Dr. B. R. Ambedkar Station, Vidhana Soudha": "Dr. B. R. Ambedkar metro station, Vidhana Soudha",
    "Nadaprabhu Kempegowda Station, Majestic": "Majestic",
    "Krantivira Sangolli Rayanna Railway Station": "City Railway Station",
    "Sir M. Visvesvaraya Stn., Central College": "Sir M. Visveshwaraya",
    "Sri Balagangadharanatha Swamiji Station, Hosahalli": "Hosahalli",
    "Mahatma Gandhi Road": "MG Road",
    "Mantri Square Sampige Road": "Sampige Road",
    "Mahakavi Kuvempu Road": "Kuvempu Road",
    "Hoodi": "Hoodi Junction",
    "Krishnarajapura": "Krishnarajapuram",
    "Whitefield (Kadugodi)": "Whitefield",
    "Garudacharpalya": "Garudacharapalya",
    "Seetharampalya": "Sitharama Palya",
    "Nallurahalli": "Nallurhalli",
    "South End Circle": "Southend Circle",
    "Jaya Prakash Nagar": "Jayaprakash Nagar",
    "Infosys Foundation Konappana Agrahara": "Konappana Agrahara",
    "Delta Electronics Bommasandra": "Bommasandra",
    "Swami Vivekananda Road": "Swami Vivekananda Road Metro Station",
    "Trinity": "Trinity Metro Station",
    "Baiyappanahalli": "Baiyappanahalli Metro Station",
    "Yeshwantpur": "Yeshwanthpur",
}


def load_office_clusters(polys):
    """Office seats added since 2011, by zone, from the Grade-A office clusters."""
    stock = SOURCED["officeStock"]
    sqft = ASSUMPTIONS["sqftPerOfficeSeat"]["value"]
    # Stock in 2011 = stock(2024) / (1 + CAGR)^13. Only seats added since then are new jobs;
    # the rest are already inside the 2011 employment density.
    new_share = 1 - 1 / (1 + SOURCED["officeStockCagr"]) ** (2024 - 2011)
    with open(ROOT / "data" / "office-clusters.csv", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    total_msf = sum(float(r["stockMsf"]) for r in rows)
    by_zone = defaultdict(float)
    clusters = []
    for r in rows:
        msf = float(r["stockMsf"]) * stock["gradeAMsf"] / total_msf
        seats = msf * 1e6 * stock["occupancy"] / sqft
        pt = Point(float(r["lon"]), float(r["lat"]))
        inside = next((zid for zid, poly in polys.items() if poly.contains(pt)), None)
        zid = inside or min(polys, key=lambda k: polys[k].distance(pt))
        by_zone[zid] += seats * new_share
        clusters.append({"name": r["cluster"], "region": r["region"], "zone": zid, "insideBbmp": inside is not None,
                         "stockMsf": round(msf, 1), "seats": round(seats), "lat": float(r["lat"]), "lon": float(r["lon"])})
    return by_zone, clusters, new_share


def load_ward_population():
    """2011 census population per BBMP zone, summed over its 198 wards (OpenCity ward data)."""
    pop = defaultdict(int)
    with open(RAW / "bbmp-ward-census-2011.csv", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["Ward_No"].strip().isdigit():  # skip the city total row
                pop[r["BBMP Zone Name"].strip()] += int(r["Population 2011"].replace(",", ""))
    return pop


def zone_adjacency(polys):
    """Zones sharing a boundary (about 100 m tolerance for digitising gaps)."""
    return {a: sorted(b for b in polys if b != a and polys[a].buffer(0.001).intersects(polys[b])) for a in polys}


def norm(s):
    s = re.sub(r"\s+metro station$", "", s or "", flags=re.I)
    return re.sub(r"[^a-z0-9]", "", s.lower())


def simplify_polygon(geom, tol=0.0008):
    """Simplified [lat, lng] rings for Leaflet (largest polygon if multipart)."""
    g = geom.simplify(tol, preserve_topology=True)
    if g.geom_type == "MultiPolygon":
        g = max(g.geoms, key=lambda p: p.area)
    return [[round(y, 5), round(x, 5)] for x, y in g.exterior.coords]


def main():
    polys = load_zone_polygons()
    mob = load_mobility_csv()
    roads = json.loads((DERIVED / "roads-by-zone.json").read_text(encoding="utf-8"))
    waste_apr, waste_may = load_waste_collections()
    metro, metro_city, metro_days, metro_unmatched = load_metro(polys)
    office_new, office_clusters, office_new_share = load_office_clusters(polys)
    ward_pop = load_ward_population()
    adjacency = zone_adjacency(polys)

    A = {k: v["value"] for k, v in ASSUMPTIONS.items()}
    occ, pcu = SOURCED["occupancy"], SOURCED["pcu"]

    zones = []
    for z in ZONES:
        r = mob[z["csvName"]]
        # Growth rate from the mobility CSV's 2001-2011 zone populations
        cagr = (float(r["Population in 2011"]) / float(r["Population in 2001"])) ** (1 / 10) - 1
        csv_area = float(r["Area (in Sq. Km)"])
        kml_area = area_km2(polys[z["id"]])
        area_ratio = kml_area / csv_area
        # 2011 population measured on the same boundary: sum of the zone's census wards
        p2011 = ward_pop[z["wardZone"]]
        p2001 = p2011 / (1 + cagr) ** 10
        p2020 = p2011 * (1 + cagr) ** 9
        p_base = p2011 * (1 + cagr) ** (BASE_YEAR - 2011)
        # The CSV describes pre-2022 zone boundaries; its employment density is applied to the 2022 area
        jobs2011 = float(r["Employment Density in 2011"]) * kml_area
        jobs = jobs2011 + office_new[z["id"]]

        raw_shares = {
            "walk": pct(r["Walk- Mode Share"]), "bicycle": pct(r["Bicycle- Mode Share"]),
            "taxi": pct(r["Taxi/Maxi Cab- Mode Share"]), "auto": pct(r["Auto- Mode Share"]),
            "twoWheeler": pct(r["Two wheeler- Mode Share"]), "carVan": pct(r["Car/Van- Mode Share"]),
            "publicTransport": pct(r["Public Transport- Mode Share"]), "slowMoving": pct(r["Slow moving vehicles share"]),
        }
        share_sum = sum(raw_shares.values())
        shares = {k: v / share_sum for k, v in raw_shares.items()}  # normalised: CSV rows sum to 101-103%

        trip_rate = float(r["Per Capita Trip Rate"])
        trip_len = float(r["Average Trip Length (km)"])
        daily_trips = p_base * trip_rate

        rz = roads["zones"][z["id"]]
        major = {k: v for k, v in rz["byClass"].items() if k in MAJOR_CLASSES}
        major_capacity = sum(v["capacityPcuKmPerHr"] for v in major.values())

        zones.append({
            "id": z["id"], "name": z["name"], "csvName": z["csvName"],
            "polygon": simplify_polygon(polys[z["id"]]),
            "center": [round(polys[z["id"]].representative_point().y, 5), round(polys[z["id"]].representative_point().x, 5)],
            "areaKm2": round(area_km2(polys[z["id"]]), 1),
            "demographics": {
                "population2001": int(p2001), "population2011": int(p2011),
                "populationGrowthRate": round(cagr, 4),
                "populationBaseYear": round(p_base),
                "csvAreaKm2": csv_area, "boundaryRescaleFactor": round(area_ratio, 3),
                "perCapitaIncomeINR": float(r["Average Per Capita Income"]),
            },
            "mobility": {
                "perCapitaTripRate": trip_rate, "averageTripLengthKm": trip_len,
                "modeSharesRaw": raw_shares, "modeShares": {k: round(v, 4) for k, v in shares.items()},
                "tripsUnder15MinPct": pct(r["Trip Duration less than 15 mins"]),
                "tripsUnder30MinPct": pct(r["Trip Duration less than 30 mins"]),
                "dailyTrips": round(daily_trips),
            },
            "roads": {
                "roadKm": rz["totalRoadKm"], "laneKm": rz["totalLaneKm"],
                "majorRoadKm": round(sum(v["km"] for v in major.values()), 1),
                "majorCapacityPcuKmPerHr": round(major_capacity),
                "byClass": rz["byClass"],
            },
            "transit": {
                "metroStations": sorted(metro[z["id"]]["stations"]),
                "metroDailyBoardings": round(metro[z["id"]]["dailyBoardings"]),
            },
            "waste": {
                "collectedTpdApril2020": waste_apr[z["wasteName"]],
                "collectedTpdMay2020": waste_may[z["wasteName"]],
                # Per-capita generation held at May-2020 level; scaled by population growth to base year
                "generationTpd": round(waste_may[z["wasteName"]] * p_base / p2020, 1),
            },
            "neighbours": adjacency[z["id"]],
            "_jobs": jobs, "_jobs2011": jobs2011, "_officeNew": office_new[z["id"]],
            "_ptTrips": daily_trips * shares["publicTransport"],
        })

    # ---- City-level quantities allocated to zones --------------------------------
    total_pop = sum(zz["demographics"]["populationBaseYear"] for zz in zones)
    total_jobs = sum(zz["_jobs"] for zz in zones)
    total_pt = sum(zz["_ptTrips"] for zz in zones)

    # Buses on road in the peak hour: operated fleet x observed PT peak speed -> bus-km/hr
    city_bus_km_hr = SOURCED["bmtcFleet"] * A["busPeakSpeedKmph"]

    # Private peak vehicles, city-wide, to size the goods-vehicle stream from screenline composition
    def private_peak_vehicles(zz):
        t, s = zz["mobility"]["dailyTrips"], zz["mobility"]["modeShares"]
        return sum(t * s[m] * A["peakHourFactor"] / occ[m] for m in ("twoWheeler", "carVan", "auto", "taxi"))

    city_private_veh = sum(private_peak_vehicles(zz) for zz in zones)
    g = SOURCED["goodsVehicleShare"]["truck"] + SOURCED["goodsVehicleShare"]["lcv"]
    city_goods_veh = g / (1 - g) * (city_private_veh + SOURCED["bmtcFleet"])
    goods_pcu = (SOURCED["goodsVehicleShare"]["truck"] * pcu["truck"] + SOURCED["goodsVehicleShare"]["lcv"] * pcu["lcv"]) / g

    inbound = SOURCED["inboundGoodsVehiclesPerDay"]
    city_freight_tpd = sum(inbound[k] * A["payloadTonnes"][k] for k in inbound) * A["loadFactor"]

    processing = A["wasteProcessingCapacityTpd"]

    for zz in zones:
        jobs_share = zz["_jobs"] / total_jobs
        pop_share = zz["demographics"]["populationBaseYear"] / total_pop
        pt_share = zz["_ptTrips"] / total_pt
        L = zz["mobility"]["averageTripLengthKm"]
        zz["transit"].update({
            "ptDailyTrips": round(zz["_ptTrips"]),
            "busPeakBusKmPerHr": round(city_bus_km_hr * pt_share),
            "busPeakPcuKmPerHr": round(city_bus_km_hr * pt_share * pcu["bus"]),
        })
        zz["freight"] = {
            "goodsPeakVehicles": round(city_goods_veh * jobs_share),
            "goodsPeakPcuKmPerHr": round(city_goods_veh * jobs_share * goods_pcu * L),
            "freightDemandTpd": round(city_freight_tpd * (0.5 * jobs_share + 0.5 * pop_share)),
        }
        zz["waste"]["processingCapacityTpd"] = round(processing * pop_share, 1)
        zz["demographics"]["jobsShare"] = round(jobs_share, 5)
        zz["demographics"]["jobsBaseline"] = round(zz["_jobs"])
        zz["demographics"]["jobs2011"] = round(zz["_jobs2011"])
        zz["demographics"]["officeJobsAdded"] = round(zz["_officeNew"])
        zz["demographics"]["officeJobsShare"] = round(zz["_officeNew"] / zz["_jobs"], 4)
        del zz["_jobs"], zz["_jobs2011"], zz["_officeNew"], zz["_ptTrips"]

    # The delay-curve alpha is calibrated by the engine (calibrateAlpha in simulationEngine.js),
    # so the model and its calibration cannot drift apart.
    target_tti = A["freeFlowSpeedKmph"] / SOURCED["observedPeakSpeedKmph"]["private"]

    dataset = {
        "meta": {
            "city": "Bengaluru (BBMP, 8 zones as delimited in 2022)",
            "baseYear": BASE_YEAR,
            "generatedBy": "scripts/dataset/build_dataset.py",
            "sources": [
                {"id": "mobility-csv", "name": "Bengaluru Mobility Indicators (zone population, jobs, trip rate, mode share)", "file": "data/bengaluru-mobility-indicators.csv", "year": "2011 census population; 2008-era household survey"},
                {"id": "bbmp-zones", "name": "BBMP Zone Boundaries 2022", "url": "https://data.opencity.in/dataset/bbmp-ward-information", "year": "2022"},
                {"id": "osm", "name": "OpenStreetMap road network (ODbL)", "url": "https://www.openstreetmap.org", "year": "2026 extract"},
                {"id": "irc106", "name": "IRC:106-1990 Guidelines for Capacity of Urban Roads in Plain Areas", "year": "1990"},
                {"id": "cmp2020", "name": "Comprehensive Mobility Plan for Bengaluru (DULT)", "url": "https://dult.karnataka.gov.in/assets/front/pdf/Comprehensive_Mobility_Plan.pdf", "year": "2020"},
                {"id": "cttp", "name": "Comprehensive Traffic & Transportation Plan for Bangalore (RITES), Ch. 3", "url": "https://data.opencity.in", "year": "c. 2010"},
                {"id": "bmrcl", "name": "BMRCL station-hourly ridership (RTI)", "url": "https://github.com/Vonter/bmrcl-ridership-hourly", "year": f"Aug-Sep 2025 ({metro_days} days)"},
                {"id": "wikidata", "name": "Wikidata metro station coordinates", "url": "https://query.wikidata.org", "year": "2026"},
                {"id": "bbmp-waste", "name": "BBMP Segregated Waste Collections Apr-May 2020", "url": "https://data.opencity.in/dataset/bbmp-solid-waste-management-data", "year": "2020"},
                {"id": "bbmp-ward-census", "name": "BBMP ward-wise data (2011 census population, 198 wards, with zone)", "url": "https://data.opencity.in/dataset/e40ab411-c575-4c90-8bde-31bcb8df575f", "year": "2011 census"},
                {"id": "ato-sop", "name": "ADB / Asian Transport Observatory, Bengaluru Urban Transport - State of Play (CMP 2020 trip lengths by mode)", "url": "https://asiantransportobservatory.org/documents/337/Bangalore_urban_state_of_play.pdf", "year": "2023"},
                {"id": "icra-office", "name": "ICRA, Commercial Real Estate - Office - Bengaluru (Grade-A stock, occupancy, regional split)", "url": "https://www.icra.in/Rating/DownloadResearchSummaryReport/6188", "year": "March 2025"},
                {"id": "bbmp-plants", "name": "BBMP Waste Processing Plants", "url": "https://data.opencity.in/dataset/bbmp-solid-waste-management-data", "year": "c. 2019"},
            ],
        },
        "constants": {**SOURCED, "assumptions": ASSUMPTIONS, "calibration": {
            "targetTravelTimeIndex": round(target_tti, 3),
            "method": "alpha solved by the engine so the demand-weighted mean zone travel-time index equals free-flow speed / CMP 2020 observed peak speed (40 / 11 km/h).",
        }},
        "city": {
            "populationBaseYear": total_pop,
            "metroDailyBoardings": round(metro_city),
            "metroStationsUnmatched": metro_unmatched,
            "freightDemandTpd": round(city_freight_tpd),
            "wasteCollectedTpdMay2020": sum(waste_may.values()),
            "busPeakBusKmPerHr": city_bus_km_hr,
            "goodsPeakVehicles": round(city_goods_veh),
            "officeClusters": office_clusters,
            "officeSeatsAddedSince2011Share": round(office_new_share, 3),
        },
        "corridors": [
            {
                "id": c["id"], "name": c["name"],
                "zones": {zid: v["corridors"][c["id"]]["capacityPcuKmPerHr"] for zid, v in roads["zones"].items() if c["id"] in v["corridors"]},
            }
            for c in roads["corridors"]
        ],
        "zones": zones,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(dataset, indent=1, ensure_ascii=False), encoding="utf-8")

    print(f"city pop {total_pop:,}  metro {metro_city:,.0f}/day  unmatched {metro_unmatched}  "
          f"office seats added since 2011 {sum(office_new.values()):,.0f}")
    for zz in zones:
        d = zz["demographics"]
        print(f'{zz["name"]:22} pop {d["populationBaseYear"]:>9,} jobs2011 {d["jobs2011"]:>9,} +office {d["officeJobsAdded"]:>9,} '
              f'jobsShare {d["jobsShare"]:.3f} metro {zz["transit"]["metroDailyBoardings"]:>7,} neighbours {zz["neighbours"]}')


if __name__ == "__main__":
    main()
