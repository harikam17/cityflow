/**
 * Engine validation: calibration, conservation and directional (monotonicity) checks
 * against the real Bengaluru dataset. Run with: npm run validate
 */
import fs from 'node:fs';
import { PRESET_SCENARIOS } from '../src/data/presetScenarios.js';
import {
  calculateCitySimulation,
  calculateZoneTrips,
  calculateSensitivity,
  calibrateGravityBeta,
  zoneNetwork,
  PRIVATE_MODES,
  SCENARIO_DEFAULTS
} from '../src/engine/simulationEngine.js';
import { generatePolicyRecommendations } from '../src/engine/recommendations.js';

const dataset = JSON.parse(
  fs.readFileSync(new URL('../src/data/generated/bengaluruDataset.json', import.meta.url), 'utf8')
);

const errors = [];
function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL  ${message}`);
    errors.push(message);
  } else {
    console.log(`ok    ${message}`);
  }
}

const run = (scenario) => calculateCitySimulation(dataset, { ...SCENARIO_DEFAULTS, ...scenario });
const baseline = run({});
const byId = (result) => Object.fromEntries(result.zones.map((z) => [z.id, z]));
const sumDemand = (result) => result.zones.reduce((s, z) => s + z.demandPcuKmPerHr, 0);

console.log('\n-- Dataset --');
assert(dataset.zones.length === 8, 'dataset has the 8 BBMP zones');
for (const z of dataset.zones) {
  const ok =
    z.demographics.populationBaseYear > 0 &&
    z.mobility.dailyTrips > 0 &&
    z.roads.majorCapacityPcuKmPerHr > 0 &&
    z.waste.generationTpd > 0 &&
    z.waste.processingCapacityTpd > 0 &&
    z.polygon.length > 3 &&
    z.neighbours.length > 0;
  assert(ok, `${z.name}: population, trips, capacity, waste, boundary and neighbours present`);
}
const jobsShareSum = dataset.zones.reduce((s, z) => s + z.demographics.jobsShare, 0);
assert(Math.abs(jobsShareSum - 1) < 1e-3, `jobs shares sum to 1 (${jobsShareSum.toFixed(4)})`);
const symmetric = dataset.zones.every((z) =>
  z.neighbours.every((n) => dataset.zones.find((o) => o.id === n).neighbours.includes(z.id))
);
assert(symmetric, 'zone adjacency is symmetric');
const census2011 = dataset.zones.reduce((s, z) => s + z.demographics.population2011, 0);
assert(Math.abs(census2011 - 8443675) < 10, `2011 population matches the BBMP ward census total (${census2011.toLocaleString('en-IN')})`);

console.log('\n-- Calibration --');
const observed = dataset.constants.observedPeakSpeedKmph.private;
assert(
  Math.abs(baseline.citySummary.peakSpeedKmph - observed) <= 0.2,
  `baseline city peak speed ${baseline.citySummary.peakSpeedKmph} km/h matches CMP 2020 observed ${observed} km/h`
);
const allFinite = baseline.zones.every((z) =>
  [z.trafficPressure, z.logisticsPressure, z.wastePressure, z.overallPressure, z.peakSpeedKmph].every(Number.isFinite)
);
assert(allFinite, 'all baseline zone outputs are finite');
const beta = calibrateGravityBeta(dataset);
assert(beta > 0 && beta < 3, `gravity distance-decay beta solved (${beta.toFixed(3)} per km)`);
const { paths } = zoneNetwork(dataset);
const connected = paths.every((row) => row.every((p) => Number.isFinite(p.km) && p.km > 0));
assert(connected, 'every zone can reach every other zone through shared boundaries');

console.log('\n-- Conservation --');
for (const zone of dataset.zones) {
  const trips = calculateZoneTrips(zone, dataset, { ...SCENARIO_DEFAULTS, busServiceModifier: 1.6, metroServiceModifier: 1.8 });
  const privateSum = PRIVATE_MODES.reduce((s, m) => s + trips.privateTrips[m], 0);
  const motorised = zone.mobility.dailyTrips * PRIVATE_MODES.reduce((s, m) => s + zone.mobility.modeShares[m], zone.mobility.modeShares.publicTransport);
  assert(
    Math.abs(privateSum + trips.busTrips + trips.metroTrips - motorised) < 1,
    `${zone.name}: bus and metro shifts conserve motorised trips`
  );
}

console.log('\n-- Direction of effects --');
const city = (s) => run(s).citySummary;
const b = baseline.citySummary;
const checks = [
  [{ privateVehicleModifier: 1.2 }, 'trafficPressure', '>', 'more private vehicles raise traffic pressure'],
  [{ privateVehicleModifier: 1.2 }, 'peakSpeedKmph', '<', 'more private vehicles lower peak speed'],
  [{ busServiceModifier: 1.5 }, 'trafficPressure', '<', 'more bus service lowers traffic pressure'],
  [{ busServiceModifier: 0.5 }, 'trafficPressure', '>', 'bus cut raises traffic pressure'],
  [{ metroServiceModifier: 2 }, 'trafficPressure', '<', 'more metro service lowers traffic pressure'],
  [{ workFromHomeShare: 0.3 }, 'trafficPressure', '<', 'work from home lowers traffic pressure'],
  [{ deliveryFreightModifier: 1.5 }, 'logisticsPressure', '>', 'more freight raises logistics pressure'],
  [{ offPeakDeliveryShare: 0.5 }, 'logisticsPressure', '<', 'night deliveries lower logistics pressure'],
  [{ offPeakDeliveryShare: 0.5 }, 'trafficPressure', '<', 'night deliveries lower peak traffic'],
  [{ addedProcessingTpd: 2000 }, 'wastePressure', '<', 'added processing capacity lowers waste pressure'],
  [{ offPeakWasteCollectionShare: 1 }, 'wastePressure', '<', 'night collection lowers waste pressure']
];
for (const [scenario, metric, dir, label] of checks) {
  const v = city(scenario)[metric];
  assert(dir === '>' ? v > b[metric] : v < b[metric], `${label} (${b[metric]} → ${v})`);
}

console.log('\n-- Corridor closures --');
for (const corridor of dataset.corridors) {
  const closedResult = run({ closedCorridorId: corridor.id });
  const closed = byId(closedResult);
  const base = byId(baseline);
  const crossed = Object.keys(corridor.zones).filter((id) => corridor.zones[id] > 0);
  const neighbours = new Set(crossed.flatMap((id) => dataset.zones.find((z) => z.id === id).neighbours));
  const crossedWorse = crossed.every((id) => closed[id].trafficPressure > base[id].trafficPressure);
  const farUnchanged = Object.keys(base)
    .filter((id) => !crossed.includes(id) && !neighbours.has(id))
    .every((id) => closed[id].trafficPressure === base[id].trafficPressure);
  const conserved = Math.abs(sumDemand(closedResult) - sumDemand(baseline)) <= dataset.zones.length;
  assert(
    crossedWorse && farUnchanged && conserved,
    `${corridor.name}: crossed zones worse, only neighbours absorb diversions, demand conserved (${crossed.length} zones)`
  );
}

console.log('\n-- Sensitivity --');
const range = calculateSensitivity(dataset, SCENARIO_DEFAULTS);
const inRange = ['trafficPressure', 'logisticsPressure', 'wastePressure'].every(
  (m) => range[m].min <= b[m] + 0.1 && b[m] - 0.1 <= range[m].max
);
assert(inRange, `baseline lies inside its sensitivity range (traffic ${range.trafficPressure.min}–${range.trafficPressure.max}%)`);

console.log('\n-- Recommendations --');
for (const preset of PRESET_SCENARIOS) {
  const result = run(preset.inputs);
  const recs = generatePolicyRecommendations(dataset, baseline, result, preset.inputs);
  assert(recs.length > 0 && recs.length <= 6, `${preset.name}: ${recs.length} recommendations`);
  if (preset.inputs.closedCorridorId) {
    assert(recs.some((r) => r.id === 'rec-corridor-closed'), `${preset.name}: corridor closure advice is kept`);
  }
  const s = result.citySummary;
  console.log(`      overall ${s.overallPressure}%  traffic ${s.trafficPressure}%  logistics ${s.logisticsPressure}%  waste ${s.wastePressure}%  speed ${s.peakSpeedKmph} km/h`);
}

// A recommended fix must actually work when applied
const hotspot = generatePolicyRecommendations(dataset, baseline, baseline, SCENARIO_DEFAULTS).find((r) => r.id === 'rec-waste');
if (hotspot) {
  const tpd = Number(hotspot.text.match(/about ([\d,]+) TPD/)[1].replace(/,/g, ''));
  const fixed = run({ addedProcessingTpd: tpd + 1 }).citySummary.wastePressure;
  assert(fixed <= 100.05, `recommended ${tpd} TPD brings waste pressure to capacity (${fixed}%)`);
}

console.log(errors.length ? `\n${errors.length} check(s) failed` : '\nAll checks passed');
process.exit(errors.length ? 1 : 0);
