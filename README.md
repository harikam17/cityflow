# CityFlow

**A what-if simulator for Bengaluru's morning peak: traffic, freight and solid waste, zone by zone.**

Close the Outer Ring Road for metro works, cut bus service in half, or bring 60% more parcel deliveries
during a festival, and CityFlow shows which of the 8 BBMP zones go over capacity. It then works out the
smallest change to each lever that fixes the problem, in units a planner can act on: *"about 1,979 TPD of
new processing capacity"*, *"move 30% of deliveries to night hours"*.

**Live demo:** https://harikam17.github.io/cityflow/ *(after GitHub Pages is enabled, see below)*

## Why it can be trusted

- **Built from public data.** Sources: 2011 census wards, the Comprehensive Mobility Plan 2020 (CMP), OpenStreetMap
  roads, ICRA 2024 office stock, 2025 Namma Metro ridership (RTI) and BBMP waste records. Every number
  in the zone inspector is tagged *Measured*, *Derived* or *Estimated*.
- **Calibrated to what is observed.** The model reproduces the 11 km/h average peak speed measured
  in the CMP 2020 survey, and the CMP 2020 trip lengths by mode.
- **Honest about uncertainty.** Every headline figure shows its range when each key assumption is
  moved ±20%.
- **Checked on every build.** `npm run validate` runs 50+ checks: calibration, trip conservation,
  direction of every lever's effect, closure diversions, and that recommended fixes actually work.
  GitHub Actions runs it on every push.

## What it models

| System | Measure (100% = at capacity) | Levers |
|---|---|---|
| Roads | Peak demand ÷ arterial capacity, per zone | Private trips, work from home, bus service, metro service, corridor closure |
| Freight | Delivery fleet utilisation under congestion | Freight volume, deliveries at night |
| Solid waste | Waste generated ÷ processing capacity | New processing capacity, collection at night |

Trips are distributed between zones with a gravity model and routed through the zones they cross, so
through-traffic (for example on the ORR) is counted. A corridor closure pushes part of its traffic
into neighbouring zones.

## Demo storyline (5 minutes)

1. **Today (2025).** The old core (West, East, South) is over capacity at about 6–10 km/h. Waste processing is at 161%.
2. **ORR closed for metro works.** South and Mahadevapura each gain about 15 points of traffic load. The
   recommendations name the zones absorbing the diverted traffic.
3. **ORR works + mitigation plan.** 30% more buses, 20% of office staff working from home, 30% of deliveries at night.
   City peak speed recovers from 9.7 to 12.3 km/h, better than today.
4. **Copy scenario link** to share the exact scenario, or **Print briefing** for a meeting.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run validate   # engine checks
npm run build      # production bundle in dist/
```

Rebuilding the dataset needs Python 3: `pip install -r scripts/dataset/requirements.txt && npm run build:data`.

## Deploying

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main`. A repo admin enables it
once: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Learn more

[ARCHITECTURE.md](ARCHITECTURE.md) covers the data pipeline, every equation, the calibration, all
assumptions with their basis, baseline results per zone, and known limitations.
