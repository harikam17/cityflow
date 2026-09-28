/**
 * Engine validation: calibration, conservation and directional (monotonicity) checks
 * against the real Bengaluru dataset. Run with: npm run validate
 */
import fs from 'node:fs';
import { PRESET_SCENARIOS } from '../src/data/presetScenarios.js';
import {
  calculateCitySimulation,
  calculateZoneTrips,
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

console.log('\n-- Dataset --');
assert(dataset.zones.length === 8, 'dataset has the 8 BBMP zones');
for (const z of dataset.zones) {
  const ok =
    z.demographics.populationBaseYear > 0 &&
    z.mobility.dailyTrips > 0 &&
    z.roads.majorCapacityPcuKmPerHr > 0 &&
    z.waste.generationTpd > 0 &&
    z.waste.processingCapacityTpd > 0 &&
    z.polygon.length > 3;
  assert(ok, `${z.name}: population, trips, capacity, waste and boundary present`);
}
const jobsShareSum = dataset.zones.reduce((s, z) => s + z.demographics.jobsShare, 0);
assert(Math.abs(jobsShareSum - 1) < 1e-3, `jobs shares sum to 1 (${jobsShareSum.toFixed(4)})`);

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

console.log('\n-- Conservation --');
for (const zone of dataset.zones) {
  const trips = calculateZoneTrips(zone, dataset, { ...SCENARIO_DEFAULTS, publicTransitModifier: 1.6 });
  const privateSum = PRIVATE_MODES.reduce((s, m) => s + trips.privateTrips[m], 0);
  const before = zone.mobility.dailyTrips * PRIVATE_MODES.reduce((s, m) => s + zone.mobility.modeShares[m], zone.mobility.modeShares.publicTransport);
  assert(Math.abs(privateSum + trips.ptTrips - before) < 1, `${zone.name}: transit shift conserves motorised trips`);
}

console.log('\n-- Direction of effects --');
const moreCars = run({ privateVehicleModifier: 1.2 });
assert(moreCars.citySummary.trafficPressure > baseline.citySummary.trafficPressure, 'more private vehicles raise traffic pressure');
assert(moreCars.citySummary.peakSpeedKmph < baseline.citySummary.peakSpeedKmph, 'more private vehicles lower peak speed');

const moreTransit = run({ publicTransitModifier: 1.5 });
assert(moreTransit.citySummary.trafficPressure < baseline.citySummary.trafficPressure, 'more transit service lowers traffic pressure');
const transitCut = run({ publicTransitModifier: 0.5 });
assert(transitCut.citySummary.trafficPressure > baseline.citySummary.trafficPressure, 'transit cut raises traffic pressure');

const moreFreight = run({ deliveryFreightModifier: 1.5 });
assert(moreFreight.citySummary.logisticsPressure > baseline.citySummary.logisticsPressure, 'more freight raises logistics pressure');

console.log('\n-- Corridor closures --');
for (const corridor of dataset.corridors) {
  const closed = byId(run({ closedCorridorId: corridor.id }));
  const base = byId(baseline);
  const affected = Object.keys(corridor.zones).filter((id) => corridor.zones[id] > 0);
  const affectedWorse = affected.every((id) => closed[id].trafficPressure >= base[id].trafficPressure);
  const othersSame = Object.keys(base)
    .filter((id) => !affected.includes(id))
    .every((id) => closed[id].trafficPressure === base[id].trafficPressure);
  assert(affectedWorse && othersSame, `${corridor.name}: only crossed zones lose capacity (${affected.length} zones)`);
}

console.log('\n-- Recommendations --');
assert(generatePolicyRecommendations(baseline, baseline, SCENARIO_DEFAULTS).length === 0, 'baseline produces no recommendations');
for (const preset of PRESET_SCENARIOS.filter((p) => p.id !== 'preset-baseline')) {
  const result = run(preset.inputs);
  const recs = generatePolicyRecommendations(baseline, result, preset.inputs);
  assert(recs.length > 0 && recs.length <= 5, `${preset.name}: ${recs.length} recommendations`);
  if (preset.inputs.closedCorridorId) {
    assert(recs.some((r) => r.id === 'rec-corridor-closed'), `${preset.name}: corridor closure advice is kept`);
  }
  const s = result.citySummary;
  console.log(`      overall ${s.overallPressure}%  traffic ${s.trafficPressure}%  logistics ${s.logisticsPressure}%  waste ${s.wastePressure}%  speed ${s.peakSpeedKmph} km/h`);
}

console.log(errors.length ? `\n${errors.length} check(s) failed` : '\nAll checks passed');
process.exit(errors.length ? 1 : 0);
