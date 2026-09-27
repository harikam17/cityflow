/**
 * CityFlow Deterministic Policy Recommendation Engine
 * 
 * Generates transparent, rule-derived operational policies and interventions
 * based directly on calculated deltas between the current scenario and calibrated baseline.
 * 
 * Free of stochastic generation, AI/LLM calls, and marketing fluff.
 */

export function generatePolicyRecommendations(baselineResult = {}, currentResult = {}, scenario = {}) {
  const recommendations = [];

  const baseSummary = baselineResult.citySummary || {};
  const currentSummary = currentResult.citySummary || {};

  const baseOverall = baseSummary.overallPressure ?? 51.7;
  const currOverall = currentSummary.overallPressure ?? 51.7;

  const baseTraffic = baseSummary.trafficPressure ?? 49.7;
  const currTraffic = currentSummary.trafficPressure ?? 49.7;

  const baseLogistics = baseSummary.logisticsPressure ?? 53.6;
  const currLogistics = currentSummary.logisticsPressure ?? 53.6;

  const baseWaste = baseSummary.wastePressure ?? 52.4;
  const currWaste = currentSummary.wastePressure ?? 52.4;

  const deltaOverall = currOverall - baseOverall;
  const deltaTraffic = currTraffic - baseTraffic;
  const deltaLogistics = currLogistics - baseLogistics;
  const deltaWaste = currWaste - baseWaste;

  const closedCorridorId = scenario.closedCorridorId || null;
  const publicTransitModifier = typeof scenario.publicTransitModifier === 'number' ? scenario.publicTransitModifier : 1.0;
  const privateVehicleModifier = typeof scenario.privateVehicleModifier === 'number' ? scenario.privateVehicleModifier : 1.0;
  const deliveryFreightModifier = typeof scenario.deliveryFreightModifier === 'number' ? scenario.deliveryFreightModifier : 1.0;

  const isBaseline = 
    Math.abs(deltaOverall) < 0.2 &&
    Math.abs(deltaTraffic) < 0.2 &&
    Math.abs(deltaLogistics) < 0.2 &&
    Math.abs(deltaWaste) < 0.2 &&
    !closedCorridorId &&
    Math.abs(publicTransitModifier - 1.0) < 0.01 &&
    Math.abs(privateVehicleModifier - 1.0) < 0.01 &&
    Math.abs(deliveryFreightModifier - 1.0) < 0.01;

  if (isBaseline) {
    return [];
  }

  // 1. Overall System Change Rule
  if (deltaOverall >= 3.0) {
    recommendations.push({
      id: 'rec-overall-increase',
      category: 'Overall',
      severity: currOverall >= 70 ? 'critical' : 'moderate',
      text: 'The current scenario produces higher overall pressure than the calibrated baseline.'
    });
  } else if (deltaOverall <= -3.0) {
    recommendations.push({
      id: 'rec-overall-decrease',
      category: 'Overall',
      severity: 'safe',
      text: 'The current scenario produces lower overall pressure than the calibrated baseline.'
    });
  }

  // 2. Traffic Subsystem Rules
  if (currTraffic >= 70.0 || deltaTraffic >= 15.0) {
    recommendations.push({
      id: 'rec-traffic-critical',
      category: 'Traffic',
      severity: 'critical',
      text: 'Traffic pressure is approaching a critical level. Prioritize transit capacity and alternative travel modes.'
    });
  } else if (deltaTraffic >= 2.0) {
    recommendations.push({
      id: 'rec-traffic-elevated',
      category: 'Traffic',
      severity: 'moderate',
      text: 'Traffic pressure has increased relative to the baseline. Increasing public transit service or reducing private vehicle usage would reduce modeled traffic pressure.'
    });
  }

  // 3. Transit Mode-Shift Positive Impact Rule
  if (publicTransitModifier > 1.05 && deltaTraffic <= -0.8) {
    recommendations.push({
      id: 'rec-transit-relief',
      category: 'Transit',
      severity: 'safe',
      text: 'The increased transit service is reducing modeled traffic pressure.'
    });
  }

  // 4. Logistics & Freight Rules
  if (deltaLogistics >= 2.0) {
    recommendations.push({
      id: 'rec-logistics-elevated',
      category: 'Logistics',
      severity: currLogistics >= 70 ? 'critical' : 'moderate',
      text: 'Freight pressure has increased relative to the baseline. Reducing delivery volume or increasing freight-handling capacity would reduce modeled logistics pressure.'
    });
  }

  // 5. Municipal Waste Rules
  if (deltaWaste >= 2.0) {
    recommendations.push({
      id: 'rec-waste-elevated',
      category: 'Waste',
      severity: currWaste >= 70 ? 'critical' : 'moderate',
      text: 'Waste pressure has increased relative to the baseline. Increasing collection capacity would provide additional modeled collection throughput.'
    });
  }

  // 6. Corridor Closure Rule
  if (closedCorridorId) {
    recommendations.push({
      id: 'rec-corridor-closed',
      category: 'Corridor',
      severity: 'critical',
      text: 'The selected corridor closure reduces modeled road capacity and increases pressure in affected zones. Consider an alternate route or restoring corridor capacity.'
    });
  }

  // Bound to maximum 5 items
  return recommendations.slice(0, 5);
}
