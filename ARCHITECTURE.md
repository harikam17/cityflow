# CityFlow Architecture

CityFlow is a client-only React app that simulates "urban pressure" across five Bengaluru
zones. A user adjusts scenario inputs (private vehicles, transit service, freight volume,
corridor closure). A deterministic engine recomputes traffic, logistics and waste pressure
scores (0–100) per zone. The UI then compares the result against a baseline run.

There is no backend, no network I/O beyond OpenStreetMap map tiles, and no persisted state.

## Stack

| Concern      | Choice                                   |
|--------------|------------------------------------------|
| Build / dev  | Vite 5 (`npm run dev` on port 3000)      |
| UI           | React 18, plain CSS (no CSS framework)   |
| Map          | Leaflet + react-leaflet, OSM raster tiles|
| Charts       | Chart.js via react-chartjs-2             |
| Checks       | `scripts/validateEngine.js` (plain Node) |

## Directory layout

```
data/
  bengaluru-mobility-indicators.csv   Source dataset (11 zones). Not read at runtime.
scripts/
  validateEngine.js                   Assertion script for the engine + data layer
src/
  main.jsx                            React root, global CSS imports
  App.jsx                             State owner and composition root
  data/
    bengaluruMobilityData.js          CSV transcribed to JS + deriveZoneMobility()
    baselineCity.js                   The 5 simulated zones (geometry + modelled params)
    presetScenarios.js                Preset scenarios, corridors, findMatchingPreset()
  engine/
    simulationEngine.js               Pure pressure formulas
    recommendations.js                Pure rule-based recommendations
  components/                         Presentational components (props in, JSX out)
  utils/formatters.js                 Number formatting + severity thresholds/colours
  styles/                             variables.css (tokens), layout.css, components.css
```

## Layering

```
          ┌─────────────────────────── App.jsx ───────────────────────────┐
          │ state: scenario, selectedZoneId                               │
          │ derived (useMemo): baselineResult, currentResult, recs        │
          └───────┬──────────────────────┬─────────────────────┬──────────┘
                  │ props                │ calls               │ reads
                  ▼                      ▼                     ▼
          components/*            engine/*  (pure)       data/*  (static)
          (presentational)        simulationEngine  ───▶ baselineCity
                                  recommendations         └─▶ bengaluruMobilityData
```

Rules the code follows:

- **`engine/` is pure.** It has no React, DOM or side effects, so Node can import it
  directly (the validation script does this). Keep it that way.
- **`App.jsx` is the only stateful component.** Every other component is a pure function of
  its props and reports changes through callbacks (`onChangeScenario`, `onSelectZone`, …).
- **Everything is derived, nothing is cached.** Each scenario change recomputes all five zones
  synchronously in `useMemo`, which is cheap at this size.

## Data flow

1. `baselineCity.js` builds `BASELINE_ZONES` at module load. Each zone holds:
   - geometry: `center`, `polygon` (hand-drawn rectangles, approximate);
   - **modelled** engine inputs: road capacity, private/commercial veh/hr, transit capacity,
     freight demand/fleet, waste generation/collection;
   - **empirical** `mobility`: the matching CSV row run through `deriveZoneMobility()`
     (daily trips, trips per mode, derived peak-hour vehicle demand).
2. `calculateCitySimulation(zones, scenario)` maps each zone through
   `calculateZoneSimulation`, then averages the zones into `citySummary`.
3. `generatePolicyRecommendations(baseline, current, scenario)` compares the two summaries
   against fixed thresholds and returns up to 5 recommendations. At baseline it returns `[]`.
4. Components render `currentResult` (KPIs, map, zone inspector) and baseline-vs-current
   deltas (`ScenarioImpact`).

## The simulation model

All constants are in `MODEL_COEFFICIENTS` in `simulationEngine.js`.

| Output        | Formula (per zone) |
|---------------|--------------------|
| Traffic demand| `private·pMod ± transit effect + commercial·fMod` |
| Transit effect| `tMod > 1`: subtract `0.20 × extra hourly transit capacity`, floor at 35% of base private. `tMod < 1`: add `0.15 × lost hourly transit capacity` |
| Road capacity | `base × 0.70` if the zone is on the closed corridor (`CORRIDOR_ZONE_MAPPING`) |
| Traffic       | `clamp((demand/capacity)^1.4 × 100)` |
| Logistics     | `clamp(freight·fMod / fleet × (1 + 0.35·traffic/100) × 100)` |
| Waste         | `clamp(waste / (collection × (1 − min(0.85, 0.25·traffic/100))) × 100)` |
| Overall       | `0.4·traffic + 0.3·logistics + 0.3·waste` |

Traffic cascades into logistics and waste. Nothing cascades back.

Severity bands (`utils/formatters.js`): **safe** < 45 ≤ **moderate** ≤ 70 < **critical**.

## Empirical vs modelled data

Keep this boundary in mind before changing the data layer:

- The **CSV mobility data is displayed only.** Only `ZoneDetailsModal` and `DataProvenance`
  read it. The engine never reads `zone.mobility`. The pressure scores come entirely from the
  modelled parameters in `baselineCity.js`.
- The two don't agree in scale. `derivedPeakHourMotorizedVehicleDemand` comes out at roughly
  20k–100k veh/hr per zone. The modelled `baselinePrivateVehiclesPerHour` is 4.5k–11.5k.
  Wiring the CSV into the engine therefore needs a recalibration (road capacity is effectively a
  corridor-level figure, not a zone-wide one). All baseline numbers pinned in
  `validateEngine.js` would change.
- The CSV is transcribed by hand into `bengaluruMobilityData.js`, not parsed. If the CSV
  changes, update the JS as well.
- Only 5 of the CSV's 11 zones are simulated. Zones are matched to CSV rows by exact `name`.
- Known source-data quirks, kept as-is:
  - The `Slow moving vehicles share` column always equals the bicycle share, so the mode
    shares add up to 101–105%.
  - `Population Density in 2011` doesn't match population ÷ area for most rows (Devanahalli:
    7,167 in the CSV vs about 562 computed).

## Validation

`npm run validate` runs `scripts/validateEngine.js`, which checks:

- the baseline city summary is pinned (overall about 51.7) and baseline gives zero
  recommendations;
- the CSV-derived formulas and that no output is NaN or infinite;
- directional sensitivity (more cars → more traffic, more transit → less traffic, …);
- determinism;
- the pinned overall score of each preset.

If you intentionally change a coefficient or a baseline parameter, update the pinned values in
the same commit. There is no unit-test framework and no component tests.

## Extending

- **New scenario lever:** add the field to `BASELINE_SCENARIO` (App), the sanitiser in
  `calculateCitySimulation`, every preset's `inputs`, `findMatchingPreset`, and a control in
  `SimulatorControls`.
- **New zone:** add an entry to `BASELINE_ZONES` whose `name` matches a CSV `zoneName`, then
  update the zone count and pinned values in the validator.
- **New corridor:** add it to `AVAILABLE_CORRIDORS` and to `CORRIDOR_ZONE_MAPPING`.
- **New recommendation rule:** add it to `recommendations.js`. Output is capped at 5, in
  insertion order.
