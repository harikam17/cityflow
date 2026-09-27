import { BASELINE_ZONES } from '../src/data/baselineCity.js';
import { PRESET_SCENARIOS } from '../src/data/presetScenarios.js';
import { calculateCitySimulation } from '../src/engine/simulationEngine.js';
import { generatePolicyRecommendations } from '../src/engine/recommendations.js';

let errors = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    errors.push(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("==================================================");
console.log("RUNNING CITYFLOW ENGINE & PHASE 4 VALIDATION");
console.log("==================================================\n");

// 1. BASELINE CHECKS
const baselineScenario = {
  privateVehicleModifier: 1.0,
  publicTransitModifier: 1.0,
  deliveryFreightModifier: 1.0,
  closedCorridorId: null
};

const baseline = calculateCitySimulation(BASELINE_ZONES, baselineScenario);

assert(baseline.zones.length === 5, "Simulation returns exactly 5 zones");
assert(baseline.citySummary && typeof baseline.citySummary.overallPressure === 'number', "City summary is present and numerical");
assert(Math.abs(baseline.citySummary.overallPressure - 51.7) <= 0.2, `City baseline overall pressure is ~51.7 (actual: ${baseline.citySummary.overallPressure})`);
assert(Math.abs(baseline.citySummary.trafficPressure - 49.7) <= 0.2, `City baseline traffic pressure is ~49.7 (actual: ${baseline.citySummary.trafficPressure})`);
assert(Math.abs(baseline.citySummary.logisticsPressure - 53.6) <= 0.2, `City baseline logistics pressure is ~53.6 (actual: ${baseline.citySummary.logisticsPressure})`);
assert(Math.abs(baseline.citySummary.wastePressure - 52.4) <= 0.2, `City baseline waste pressure is ~52.4 (actual: ${baseline.citySummary.wastePressure})`);

// Check baseline recommendations (must be empty to indicate baseline state)
const baselineRecs = generatePolicyRecommendations(baseline, baseline, baselineScenario);
assert(baselineRecs.length === 0, "Baseline scenario produces zero false alerts (empty recommendations list)");

// 2. DIRECTIONAL BEHAVIOR CHECKS
const higherVehicles = calculateCitySimulation(BASELINE_ZONES, {
  privateVehicleModifier: 1.3,
  publicTransitModifier: 1.0,
  deliveryFreightModifier: 1.0,
  closedCorridorId: null
});
assert(higherVehicles.citySummary.trafficPressure >= baseline.citySummary.trafficPressure, 
  `Increasing private vehicles increases traffic pressure (${baseline.citySummary.trafficPressure} -> ${higherVehicles.citySummary.trafficPressure})`);

const higherDelivery = calculateCitySimulation(BASELINE_ZONES, {
  privateVehicleModifier: 1.0,
  publicTransitModifier: 1.0,
  deliveryFreightModifier: 1.5,
  closedCorridorId: null
});
assert(higherDelivery.citySummary.logisticsPressure >= baseline.citySummary.logisticsPressure,
  `Increasing delivery volume increases logistics pressure (${baseline.citySummary.logisticsPressure} -> ${higherDelivery.citySummary.logisticsPressure})`);

const higherTransit = calculateCitySimulation(BASELINE_ZONES, {
  privateVehicleModifier: 1.0,
  publicTransitModifier: 1.5,
  deliveryFreightModifier: 1.0,
  closedCorridorId: null
});
assert(higherTransit.citySummary.trafficPressure <= baseline.citySummary.trafficPressure,
  `Increasing transit service reduces traffic pressure (${baseline.citySummary.trafficPressure} -> ${higherTransit.citySummary.trafficPressure})`);

const closedCorridor = calculateCitySimulation(BASELINE_ZONES, {
  privateVehicleModifier: 1.0,
  publicTransitModifier: 1.0,
  deliveryFreightModifier: 1.0,
  closedCorridorId: 'corridor-cbd-north'
});
const cbdBaseline = baseline.zones.find(z => z.id === 'zone-cbd');
const cbdClosed = closedCorridor.zones.find(z => z.id === 'zone-cbd');
assert(Math.abs(cbdClosed.trafficPressure - 83.2) <= 0.2,
  `Closing CBD North corridor sets CBD traffic pressure to ~83.2 (actual: ${cbdClosed.trafficPressure})`);

// 3. DETERMINISM & STABILITY CHECKS
const runA = calculateCitySimulation(BASELINE_ZONES, { privateVehicleModifier: 1.25, publicTransitModifier: 0.8, deliveryFreightModifier: 1.3, closedCorridorId: 'corridor-ind-freight' });
const runB = calculateCitySimulation(BASELINE_ZONES, { privateVehicleModifier: 1.25, publicTransitModifier: 0.8, deliveryFreightModifier: 1.3, closedCorridorId: 'corridor-ind-freight' });
assert(JSON.stringify(runA) === JSON.stringify(runB), "Engine is 100% deterministic (Identical inputs produce identical outputs)");

// 4. PRESET SCENARIOS DIVERGENCE & PHASE 4 RECOMMENDATIONS
console.log("\n--- PRESET SCENARIOS & PHASE 4 IMPACT EVALUATION ---");
PRESET_SCENARIOS.forEach(preset => {
  const result = calculateCitySimulation(BASELINE_ZONES, preset.inputs);
  const recs = generatePolicyRecommendations(baseline, result, preset.inputs);
  console.log(`\nPreset: ${preset.name}`);
  console.log(`  City Overall Pressure: ${result.citySummary.overallPressure}`);
  console.log(`  Traffic=${result.citySummary.trafficPressure}, Logistics=${result.citySummary.logisticsPressure}, Waste=${result.citySummary.wastePressure}`);
  console.log(`  Recommendations Count: ${recs.length}`);
  recs.forEach(r => console.log(`   - [${r.category}] (${r.severity.toUpperCase()}): ${r.text}`));

  if (preset.id === 'preset-baseline') {
    assert(recs.length === 0, "Baseline preset produces 0 false alerts");
  } else {
    assert(recs.length > 0, `Preset ${preset.name} generated actionable recommendations`);
  }
});

// Verify specific preset target values
const ecommercePreset = PRESET_SCENARIOS.find(p => p.id === 'preset-ecommerce-surge');
const ecommerceResult = calculateCitySimulation(BASELINE_ZONES, ecommercePreset.inputs);
assert(Math.abs(ecommerceResult.citySummary.overallPressure - 71.9) <= 0.2, 
  `Festival E-Commerce Peak overall pressure is ~71.9 (actual: ${ecommerceResult.citySummary.overallPressure})`);

const transitDisruptPreset = PRESET_SCENARIOS.find(p => p.id === 'preset-transit-disruption');
const transitDisruptResult = calculateCitySimulation(BASELINE_ZONES, transitDisruptPreset.inputs);
assert(Math.abs(transitDisruptResult.citySummary.overallPressure - 71.1) <= 0.2, 
  `Transit Service Disruption overall pressure is ~71.1 (actual: ${transitDisruptResult.citySummary.overallPressure})`);

const greenPushPreset = PRESET_SCENARIOS.find(p => p.id === 'preset-green-corridor');
const greenPushResult = calculateCitySimulation(BASELINE_ZONES, greenPushPreset.inputs);
assert(Math.abs(greenPushResult.citySummary.overallPressure - 42.5) <= 0.2, 
  `High-Capacity Transit Push overall pressure is ~42.5 (actual: ${greenPushResult.citySummary.overallPressure})`);

console.log("\n==================================================");
if (errors.length === 0) {
  console.log("🎉 ALL VALIDATION CHECKS PASSED PERFECTLY!");
} else {
  console.error(`💥 VALIDATION FAILED WITH ${errors.length} ERRORS.`);
  process.exit(1);
}
console.log("==================================================");
