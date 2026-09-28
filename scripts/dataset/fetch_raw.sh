#!/usr/bin/env bash
# Re-download every raw input for the Bengaluru dataset into data/raw/.
# Everything except the OpenStreetMap tiles is small and committed; OSM tiles (~75 MB) are gitignored,
# and data/derived/roads-by-zone.json (committed) is what the build actually needs.
set -euo pipefail
cd "$(dirname "$0")/../../data/raw"
UA="cityflow-dataset-builder/1.0"

curl -sSL -o bbmp-zones-2022.kml \
  "https://data.opencity.in/dataset/87b978d1-352e-4b90-aa2c-9991e55d3425/resource/4723f667-b02b-45e5-a8fc-2bc6ee7bd8b9/download/41480104-eb34-44d3-936d-47b9a2ff4042.kml"
curl -sSL -o bbmp-waste-processing-plants.csv \
  "https://data.opencity.in/dataset/c904b267-5369-4aee-990c-dc86047fee3c/resource/6179d0e6-d303-4ab9-a9d6-0461677d7dd8/download/0f6b5b34-0b4a-4b26-ba94-5e03ec2f76cb.csv"
curl -sSL -o bbmp-segregated-waste-collections-2020.csv \
  "https://data.opencity.in/dataset/c904b267-5369-4aee-990c-dc86047fee3c/resource/3fce725f-df30-426e-b526-04c6da3960b1/download/37141692-0898-4ad7-aa87-03fc8e2d9dd4.csv"
curl -sSL -o bmrcl-station-hourly.csv.zip \
  "https://raw.githubusercontent.com/Vonter/bmrcl-ridership-hourly/main/data/station-hourly.csv.zip"

SPARQL='SELECT ?s ?sLabel ?coord WHERE { ?line wdt:P361|wdt:P16 ?net . ?net rdfs:label "Namma Metro"@en . ?s wdt:P81 ?line ; wdt:P625 ?coord . SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }'
curl -sS -G -A "$UA" -H "Accept: application/sparql-results+json" --data-urlencode "query=$SPARQL" \
  -o wikidata-metro-stations.json https://query.wikidata.org/sparql

# OpenStreetMap roads in four tiles (the public Overpass server rejects one large request).
mkdir -p osm
i=0
for lat in "12.82,13.00" "13.00,13.15"; do
  for lon in "77.43,77.62" "77.62,77.80"; do
    i=$((i + 1))
    s=${lat%,*}; n=${lat#*,}; w=${lon%,*}; e=${lon#*,}
    Q="[out:json][timeout:180];way[\"highway\"~\"^(motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|residential|unclassified|living_street)\$\"]($s,$w,$n,$e);out tags geom;"
    for try in 1 2 3; do
      curl -sS --max-time 400 -A "$UA" -o "osm/tile$i.json" --data-urlencode "data=$Q" https://overpass-api.de/api/interpreter
      head -c 200 "osm/tile$i.json" | grep -q '"version"' && break
      echo "tile$i: Overpass busy, retry $try" >&2
      sleep 30
    done
  done
done
echo "Raw data refreshed. Next: npm run build:data"
