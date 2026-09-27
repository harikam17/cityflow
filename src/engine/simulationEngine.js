/**
 * CityFlow Deterministic Simulation Engine
 * 
 * Implements pure, transparent rule-based mathematical formulas
 * to evaluate urban pressure across traffic, logistics, and waste domains.
 * 
 * All functions are deterministic and free of external side-effects or UI dependencies.
 */

// Model Constants & Coefficients
export const MODEL_COEFFICIENTS = {
  // Congestion curve exponent based on standard civil engineering Volume-to-Capacity (V/C) formulations
  VOLUME_CAPACITY_EXPONENT: 1.4,

  // Cascade multiplier: traffic congestion impact on freight logistics turnaround and delivery delays
  TRAFFIC_LOGISTICS_CASCADE: 0.35,

  // Cascade multiplier: road congestion disruption factor on municipal waste collection routes
  TRAFFIC_WASTE_CASCADE: 0.25,

  // Capacity reduction penalty applied to road network when connected corridor is closed
  CORRIDOR_CLOSURE_PENALTY: 0.70,

  // Mode-shift coefficient: proportion of expanded public transit capacity that shifts private vehicle trips
  TRANSIT_MODE_SHIFT_EXPANSION: 0.20,

  // Spillover coefficient: proportion of lost transit riders that convert to private vehicles during transit service cuts
  TRANSIT_SPILLOVER_REDUCTION: 0.15,

  // Component weights for the composite overall pressure index
  WEIGHT_TRAFFIC: 0.40,
  WEIGHT_LOGISTICS: 0.30,
  WEIGHT_WASTE: 0.30
};

// Corridor to Zone mapping
export const CORRIDOR_ZONE_MAPPING = {
  'corridor-cbd-north': ['zone-cbd', 'zone-transit-hub'],
  'corridor-ind-freight': ['zone-industrial-hub']
};

/**
 * Utility: Clamps a numerical value within [min, max] bounds.
 */
export function clamp(val, min = 0, max = 100) {
  if (typeof val !== 'number' || isNaN(val)) return min;
  return Math.min(max, Math.max(min, val));
}

/**
 * Determines if a given zone is affected by the specified closed corridor.
 */
export function isZoneAffectedByClosure(zoneId, closedCorridorId) {
  if (!closedCorridorId) return false;
  const affectedZones = CORRIDOR_ZONE_MAPPING[closedCorridorId];
  return Array.isArray(affectedZones) && affectedZones.includes(zoneId);
}

/**
 * Calculates effective traffic demand (vehicles/hour) for a zone under scenario modifiers.
 * Models bidirectional public transit mode-shift effect deterministically.
 */
export function calculateEffectiveTrafficDemand(zone, privateMod = 1.0, transitMod = 1.0, freightMod = 1.0) {
  const basePrivate = Math.max(0, zone.baselinePrivateVehiclesPerHour || 0);
  const baseCommercial = Math.max(0, zone.baselineCommercialVehiclesPerHour || 0);
  const hourlyTransitTrips = Math.max(0, (zone.transitDailyCapacityTrips || 0) / 24);

  let adjustedPrivate = basePrivate * privateMod;

  if (transitMod > 1.0) {
    // Mode diversion: Increased transit service absorbs private car trips
    const excessTransitCapacity = (transitMod - 1.0) * hourlyTransitTrips;
    const divertedTrips = excessTransitCapacity * MODEL_COEFFICIENTS.TRANSIT_MODE_SHIFT_EXPANSION;
    // Bounded diversion: Cannot reduce private trips below 35% of baseline
    const maxDiverted = basePrivate * 0.65;
    const actualDiverted = Math.min(divertedTrips, maxDiverted);
    adjustedPrivate = Math.max(basePrivate * 0.35, adjustedPrivate - actualDiverted);
  } else if (transitMod < 1.0) {
    // Spillover: Decreased transit service pushes displaced riders onto roads as cars/ride-hails
    const lostTransitTrips = (1.0 - transitMod) * hourlyTransitTrips;
    const spilloverTrips = lostTransitTrips * MODEL_COEFFICIENTS.TRANSIT_SPILLOVER_REDUCTION;
    adjustedPrivate = adjustedPrivate + spilloverTrips;
  }

  const adjustedCommercial = baseCommercial * freightMod;
  return Math.max(0, adjustedPrivate + adjustedCommercial);
}

/**
 * Calculates effective road capacity (vehicles/hour) for a zone considering closures.
 */
export function calculateEffectiveRoadCapacity(zone, closedCorridorId = null) {
  const baseCapacity = Math.max(1, zone.roadCapacityVehiclesPerHour || 1);
  const isAffected = isZoneAffectedByClosure(zone.id, closedCorridorId);
  return isAffected
    ? baseCapacity * MODEL_COEFFICIENTS.CORRIDOR_CLOSURE_PENALTY
    : baseCapacity;
}

/**
 * Calculates traffic pressure score (0 - 100) using the non-linear volume/capacity formula.
 * Formula: clamp((Demand / Capacity)^1.4 * 100, 0, 100)
 */
export function calculateTrafficPressure(effectiveDemand, effectiveCapacity) {
  if (effectiveCapacity <= 0) return 100;
  const vcRatio = effectiveDemand / effectiveCapacity;
  const rawScore = Math.pow(vcRatio, MODEL_COEFFICIENTS.VOLUME_CAPACITY_EXPONENT) * 100;
  return clamp(rawScore, 0, 100);
}

/**
 * Calculates logistics pressure score (0 - 100) based on delivery demand, fleet capacity, and traffic delay cascade.
 * Formula: clamp((Delivery Demand / Fleet Capacity) * (1 + 0.35 * Traffic Pressure / 100) * 100, 0, 100)
 */
export function calculateLogisticsPressure(zone, freightMod = 1.0, trafficPressure = 0) {
  const baseDemand = Math.max(0, zone.freightDemandTonnesPerDay || 0);
  const fleetCapacity = Math.max(1, zone.freightFleetCapacityTonnesPerDay || 1);
  const effectiveDemand = baseDemand * freightMod;

  const demandCapacityRatio = effectiveDemand / fleetCapacity;
  const trafficImpactMultiplier = 1 + (MODEL_COEFFICIENTS.TRAFFIC_LOGISTICS_CASCADE * (trafficPressure / 100));
  const rawScore = demandCapacityRatio * trafficImpactMultiplier * 100;
  return clamp(rawScore, 0, 100);
}

/**
 * Calculates waste pressure score (0 - 100) based on waste generation and traffic-delayed collection fleet capacity.
 * Formula: Effective Collection Capacity = Base Capacity * (1 - 0.25 * Traffic Pressure / 100)
 *          Waste Pressure = clamp((Waste Generation / Effective Collection Capacity) * 100, 0, 100)
 */
export function calculateWastePressure(zone, trafficPressure = 0) {
  const wasteGen = Math.max(0, zone.wasteGenerationTonnesPerDay || 0);
  const baseCollectionCapacity = Math.max(1, zone.wasteCollectionCapacityTonnesPerDay || 1);

  // Road congestion delays waste collection truck routes, reducing effective throughput
  const disruptionFactor = Math.min(0.85, (MODEL_COEFFICIENTS.TRAFFIC_WASTE_CASCADE * trafficPressure) / 100);
  const effectiveCollectionCapacity = Math.max(1, baseCollectionCapacity * (1 - disruptionFactor));

  const rawScore = (wasteGen / effectiveCollectionCapacity) * 100;
  return clamp(rawScore, 0, 100);
}

/**
 * Calculates composite overall pressure score (0 - 100) from weighted component metrics.
 * Formula: 0.40 * Traffic + 0.30 * Logistics + 0.30 * Waste
 */
export function calculateOverallPressure(trafficPressure, logisticsPressure, wastePressure) {
  const composite = 
    (MODEL_COEFFICIENTS.WEIGHT_TRAFFIC * trafficPressure) +
    (MODEL_COEFFICIENTS.WEIGHT_LOGISTICS * logisticsPressure) +
    (MODEL_COEFFICIENTS.WEIGHT_WASTE * wastePressure);
  return clamp(composite, 0, 100);
}

/**
 * Computes complete simulation outputs for a single zone.
 */
export function calculateZoneSimulation(zone, scenario = {}) {
  const {
    privateVehicleModifier = 1.0,
    publicTransitModifier = 1.0,
    deliveryFreightModifier = 1.0,
    closedCorridorId = null
  } = scenario;

  const effectiveTrafficDemand = calculateEffectiveTrafficDemand(
    zone,
    privateVehicleModifier,
    publicTransitModifier,
    deliveryFreightModifier
  );
  const effectiveRoadCapacity = calculateEffectiveRoadCapacity(zone, closedCorridorId);

  const trafficPressure = calculateTrafficPressure(effectiveTrafficDemand, effectiveRoadCapacity);
  const logisticsPressure = calculateLogisticsPressure(zone, deliveryFreightModifier, trafficPressure);
  const wastePressure = calculateWastePressure(zone, trafficPressure);
  const overallPressure = calculateOverallPressure(trafficPressure, logisticsPressure, wastePressure);

  return {
    id: zone.id,
    name: zone.name,
    type: zone.type,
    center: zone.center,
    polygon: zone.polygon,
    description: zone.description,
    // Calculated pressure indices (0 - 100)
    trafficPressure: Number(trafficPressure.toFixed(1)),
    logisticsPressure: Number(logisticsPressure.toFixed(1)),
    wastePressure: Number(wastePressure.toFixed(1)),
    overallPressure: Number(overallPressure.toFixed(1)),
    // Internal operational demand and capacity variables
    trafficDemand: Math.round(effectiveTrafficDemand),
    roadCapacity: Math.round(effectiveRoadCapacity),
    deliveryDemand: Math.round(zone.freightDemandTonnesPerDay * deliveryFreightModifier),
    fleetCapacity: Math.round(zone.freightFleetCapacityTonnesPerDay),
    wasteGeneration: Math.round(zone.wasteGenerationTonnesPerDay),
    wasteCollectionCapacity: Math.round(zone.wasteCollectionCapacityTonnesPerDay),
    isCorridorClosed: isZoneAffectedByClosure(zone.id, closedCorridorId)
  };
}

/**
 * Computes city-wide average summary metrics from an array of zone simulation results.
 */
export function calculateCitySummary(zoneResults = []) {
  if (!zoneResults.length) {
    return {
      trafficPressure: 0,
      logisticsPressure: 0,
      wastePressure: 0,
      overallPressure: 0
    };
  }

  const count = zoneResults.length;
  const sum = zoneResults.reduce((acc, z) => ({
    traffic: acc.traffic + z.trafficPressure,
    logistics: acc.logistics + z.logisticsPressure,
    waste: acc.waste + z.wastePressure,
    overall: acc.overall + z.overallPressure
  }), { traffic: 0, logistics: 0, waste: 0, overall: 0 });

  return {
    trafficPressure: Number((sum.traffic / count).toFixed(1)),
    logisticsPressure: Number((sum.logistics / count).toFixed(1)),
    wastePressure: Number((sum.waste / count).toFixed(1)),
    overallPressure: Number((sum.overall / count).toFixed(1))
  };
}

/**
 * Main Entry Point: Runs the full city simulation for all zones given scenario inputs.
 */
export function calculateCitySimulation(zones = [], scenario = {}) {
  const sanitizedScenario = {
    privateVehicleModifier: typeof scenario.privateVehicleModifier === 'number' ? scenario.privateVehicleModifier : 1.0,
    publicTransitModifier: typeof scenario.publicTransitModifier === 'number' ? scenario.publicTransitModifier : 1.0,
    deliveryFreightModifier: typeof scenario.deliveryFreightModifier === 'number' ? scenario.deliveryFreightModifier : 1.0,
    closedCorridorId: scenario.closedCorridorId || null
  };

  const zoneResults = zones.map(zone => calculateZoneSimulation(zone, sanitizedScenario));
  const citySummary = calculateCitySummary(zoneResults);

  return {
    zones: zoneResults,
    citySummary,
    scenario: sanitizedScenario
  };
}
