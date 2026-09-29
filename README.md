# CityFlow — Urban Pressure Simulator

An interactive what-if simulator for traffic, logistics and waste pressure across five
Bengaluru zones. Move the sliders (or pick a preset) to see how each zone's pressure changes
against the calibrated baseline.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build to dist/
npm run validate   # engine + data sanity checks
```

## Data

Passenger mobility figures come from `data/bengaluru-mobility-indicators.csv`. Road, freight,
waste and map-geometry inputs are modelled. See [ARCHITECTURE.md](ARCHITECTURE.md) for how
the pieces fit together and which numbers are empirical and which are assumed.
