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
console.log("RUNNING CITYFLOW BENGALURU ENGINE & MOBILITY VALIDATION");
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

// 2. REAL BENGALURU MOBILITY DATA INTEGRATION & FORMULA CHECKS
console.log("\n--- REAL BENGALURU MOBILITY DATA & FORMULA CHECKS ---");
baseline.zones.forEach((zone) => {
  const m = zone.mobility;
  assert(m !== null && typeof m === 'object', `${zone.name} has mobility data object`);
  
  // Real CSV raw values presence
  assert(typeof m.population2011 === 'number' && m.population2011 > 0, `${zone.name} has valid population2011 (${m.population2011})`);
  assert(typeof m.areaSqKm === 'number' && m.areaSqKm > 0, `${zone.name} has valid areaSqKm (${m.areaSqKm})`);
  assert(typeof m.populationDensity2011 === 'number' && m.populationDensity2011 > 0, `${zone.name} has valid populationDensity2011 (${m.populationDensity2011})`);
  assert(typeof m.employmentDensity2011 === 'number' && m.employmentDensity2011 > 0, `${zone.name} has valid employmentDensity2011 (${m.employmentDensity2011})`);
  assert(typeof m.averagePerCapitaIncomeINR === 'number' && m.averagePerCapitaIncomeINR > 0, `${zone.name} has valid averagePerCapitaIncomeINR (${m.averagePerCapitaIncomeINR})`);
  assert(typeof m.perCapitaTripRate === 'number' && m.perCapitaTripRate > 0, `${zone.name} has valid perCapitaTripRate (${m.perCapitaTripRate})`);
  assert(typeof m.averageTripLengthKm === 'number' && m.averageTripLengthKm > 0, `${zone.name} has valid averageTripLengthKm (${m.averageTripLengthKm})`);

  // Modal shares presence
  assert(typeof m.walkModeShare === 'number' && m.walkModeShare >= 0, `${zone.name} has walkModeShare (${m.walkModeShare}%)`);
  assert(typeof m.bicycleModeShare === 'number' && m.bicycleModeShare >= 0, `${zone.name} has bicycleModeShare (${m.bicycleModeShare}%)`);
  assert(typeof m.twoWheelerModeShare === 'number' && m.twoWheelerModeShare >= 0, `${zone.name} has twoWheelerModeShare (${m.twoWheelerModeShare}%)`);
  assert(typeof m.carVanModeShare === 'number' && m.carVanModeShare >= 0, `${zone.name} has carVanModeShare (${m.carVanModeShare}%)`);
  assert(typeof m.autoModeShare === 'number' && m.autoModeShare >= 0, `${zone.name} has autoModeShare (${m.autoModeShare}%)`);
  assert(typeof m.taxiMaxiCabModeShare === 'number' && m.taxiMaxiCabModeShare >= 0, `${zone.name} has taxiMaxiCabModeShare (${m.taxiMaxiCabModeShare}%)`);
  assert(typeof m.publicTransportModeShare === 'number' && m.publicTransportModeShare >= 0, `${zone.name} has publicTransportModeShare (${m.publicTransportModeShare}%)`);

  // Formula derivations
  const expectedDailyTrips = Math.round(m.population2011 * m.perCapitaTripRate);
  assert(m.dailyTrips === expectedDailyTrips,
    `${zone.name} dailyTrips = population2011 × perCapitaTripRate (${m.dailyTrips} === ${expectedDailyTrips})`);

  const expectedTransitTrips = Math.round(m.dailyTrips * (m.publicTransportModeShare / 100));
  assert(m.transitDailyTrips === expectedTransitTrips,
    `${zone.name} transitDailyTrips = dailyTrips × (publicTransportModeShare / 100) (${m.transitDailyTrips} === ${expectedTransitTrips})`);

  const motorizedShare = m.carVanModeShare + m.twoWheelerModeShare + m.autoModeShare + m.taxiMaxiCabModeShare;
  const expectedMotorizedTrips = Math.round(m.dailyTrips * (motorizedShare / 100));
  assert(m.motorizedPrivateDailyTrips === expectedMotorizedTrips,
    `${zone.name} motorizedPrivateDailyTrips = dailyTrips × motorizedShare (${m.motorizedPrivateDailyTrips} === ${expectedMotorizedTrips})`);

  // No NaN or Infinity checks
  assert(Number.isFinite(zone.overallPressure) && !Number.isNaN(zone.overallPressure), `${zone.name} overallPressure is finite and not NaN`);
  assert(Number.isFinite(zone.trafficPressure) && !Number.isNaN(zone.trafficPressure), `${zone.name} trafficPressure is finite and not NaN`);
  assert(Number.isFinite(zone.logisticsPressure) && !Number.isNaN(zone.logisticsPressure), `${zone.name} logisticsPressure is finite and not NaN`);
  assert(Number.isFinite(zone.wastePressure) && !Number.isNaN(zone.wastePressure), `${zone.name} wastePressure is finite and not NaN`);
});

// Check city summary finiteness
assert(Number.isFinite(baseline.citySummary.overallPressure), "City summary overallPressure is finite");
assert(Number.isFinite(baseline.citySummary.trafficPressure), "City summary trafficPressure is finite");
assert(Number.isFinite(baseline.citySummary.logisticsPressure), "City summary logisticsPressure is finite");
assert(Number.isFinite(baseline.citySummary.wastePressure), "City summary wastePressure is finite");

// 3. DIRECTIONAL BEHAVIOR CHECKS
console.log("\n--- DIRECTIONAL SENSITIVITY CHECKS ---");
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
  closedCorridorId: 'corridor-east-central'
});
const eastBaseline = baseline.zones.find(z => z.id === 'zone-east');
const eastClosed = closedCorridor.zones.find(z => z.id === 'zone-east');
assert(Math.abs(eastClosed.trafficPressure - 83.2) <= 0.2,
  `Closing East-Central corridor sets Bangalore East traffic pressure to ~83.2 (actual: ${eastClosed.trafficPressure})`);

// 4. DETERMINISM & STABILITY CHECKS
console.log("\n--- DETERMINISM & REPEATABILITY CHECKS ---");
const runA = calculateCitySimulation(BASELINE_ZONES, { privateVehicleModifier: 1.25, publicTransitModifier: 0.8, deliveryFreightModifier: 1.3, closedCorridorId: 'corridor-east-central' });
const runB = calculateCitySimulation(BASELINE_ZONES, { privateVehicleModifier: 1.25, publicTransitModifier: 0.8, deliveryFreightModifier: 1.3, closedCorridorId: 'corridor-east-central' });
assert(JSON.stringify(runA) === JSON.stringify(runB), "Engine is 100% deterministic (Identical inputs produce identical outputs)");

// 5. PRESET SCENARIOS DIVERGENCE & RECOMMENDATIONS
console.log("\n--- PRESET SCENARIOS & RECOMMENDATIONS EVALUATION ---");
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

