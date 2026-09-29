/**
 * CityFlow Recommendation Engine
 *
 * Every recommendation is computed, not written in advance: for each problem the engine re-runs the
 * simulation and searches (by bisection) for the smallest change to one lever that fixes it, then
 * states that change in operational units (buses, TPD, share of deliveries).
 * Thresholds use the engine's utilisation scale (100 = at capacity).
 *
 * Deterministic: no randomness and no LLM calls, so the same scenario always gives the same advice.
 */
import { calculateCitySimulation, SCENARIO_LIMITS } from './simulationEngine.js';

const OVER = 100;
const COMFORT = 90;

/**
 * Smallest (or largest, for levers that must fall) value of `lever` that brings `metric` to `target`.
 * The metric must be monotone in the lever. Returns null when even the lever's limit is not enough.
 */
function solveLever(dataset, scenario, lever, metric, target) {
  const [lo, hi] = SCENARIO_LIMITS[lever];
  const at = (v) => metric(calculateCitySimulation(dataset, { ...scenario, [lever]: v }));
  const current = scenario[lever];
  const increasing = at(hi) < at(lo); // raising the lever lowers the metric
  const limit = increasing ? hi : lo;
  if (at(current) <= target) return current;
  if (at(limit) > target) return null;
  let a = current, b = limit;
  for (let k = 0; k < 30; k++) {
    const mid = (a + b) / 2;
    if (at(mid) <= target) b = mid; else a = mid;
  }
  return b;
}

const pct = (v) => `${Math.round(v * 100)}%`;
const num = (v) => Math.round(v).toLocaleString('en-IN');

/** Levers that can relieve road congestion, each described in operational units. */
function trafficOptions(dataset, scenario, metric, target) {
  const fleet = dataset.constants.bmtcFleet;
  const options = [];
  const bus = solveLever(dataset, scenario, 'busServiceModifier', metric, target);
  if (bus !== null && bus > scenario.busServiceModifier + 0.005) {
    options.push(`raise bus service to ${pct(bus)} (about ${num(fleet * (bus - scenario.busServiceModifier))} more buses on the road)`);
  }
  const metro = solveLever(dataset, scenario, 'metroServiceModifier', metric, target);
  if (metro !== null && metro > scenario.metroServiceModifier + 0.005) {
    options.push(`raise metro service to ${pct(metro)} of today (frequency and new lines)`);
  }
  const wfh = solveLever(dataset, scenario, 'workFromHomeShare', metric, target);
  if (wfh !== null && wfh > scenario.workFromHomeShare + 0.005) {
    options.push(`have ${pct(wfh)} of office staff work from home on a given day`);
  }
  const priv = solveLever(dataset, scenario, 'privateVehicleModifier', metric, target);
  if (priv !== null && priv < scenario.privateVehicleModifier - 0.005) {
    options.push(`cut private vehicle trips by ${pct(scenario.privateVehicleModifier - priv)} (congestion pricing, parking policy)`);
  }
  const offPeak = solveLever(dataset, scenario, 'offPeakDeliveryShare', metric, target);
  if (offPeak !== null && offPeak > scenario.offPeakDeliveryShare + 0.005) {
    options.push(`move ${pct(offPeak)} of goods deliveries to night hours`);
  }
  return options;
}

function listOptions(options) {
  if (!options.length) return 'no single lever is enough on its own; combine several.';
  if (options.length === 1) return `${options[0]}. No other single lever is enough on its own.`;
  return `any one of these is enough on its own: ${options.join('; ')}.`;
}

export function generatePolicyRecommendations(dataset, baselineResult, currentResult, scenario) {
  const recs = [];
  const city = currentResult.citySummary;
  const base = baselineResult.citySummary;
  const zones = [...currentResult.zones].sort((a, b) => b.trafficPressure - a.trafficPressure);
  const overZones = zones.filter((z) => z.trafficPressure > OVER);

  // 1. Worst traffic hotspot: what would bring it back to capacity
  const worst = zones[0];
  if (worst && worst.trafficPressure > OVER) {
    const metric = (r) => r.zones.find((z) => z.id === worst.id).trafficPressure;
    recs.push({
      id: 'rec-traffic-hotspot',
      category: 'Traffic',
      severity: 'critical',
      title: `${worst.name} is at ${Math.round(worst.trafficPressure)}% of road capacity (${worst.peakSpeedKmph} km/h at peak)`,
      text: `To bring ${worst.name} back to capacity: ${listOptions(trafficOptions(dataset, scenario, metric, OVER))}`
    });
  }

  // 2. City-wide traffic
  if (city.trafficPressure > COMFORT) {
    const metric = (r) => r.citySummary.trafficPressure;
    recs.push({
      id: 'rec-traffic-city',
      category: 'Traffic',
      severity: city.trafficPressure > OVER ? 'critical' : 'moderate',
      title: `${overZones.length} of ${zones.length} zones over capacity; city-wide traffic at ${Math.round(city.trafficPressure)}%`,
      text: `To bring the city to ${COMFORT}%: ${listOptions(trafficOptions(dataset, scenario, metric, COMFORT))}`
    });
  }

  // 3. Corridor closure: who absorbs the diverted traffic
  if (scenario.closedCorridorId) {
    const corridor = dataset.corridors.find((c) => c.id === scenario.closedCorridorId);
    const open = calculateCitySimulation(dataset, { ...scenario, closedCorridorId: null });
    const openById = Object.fromEntries(open.zones.map((z) => [z.id, z]));
    const hit = currentResult.zones
      .map((z) => ({ z, delta: z.trafficPressure - openById[z.id].trafficPressure }))
      .filter((x) => x.delta >= 1)
      .sort((a, b) => b.delta - a.delta);
    const pushedOver = hit.filter((x) => x.z.trafficPressure > OVER && openById[x.z.id].trafficPressure <= OVER);
    const worstHit = hit.slice(0, 3).map((x) => `${x.z.name} +${Math.round(x.delta)} pts`).join(', ');
    recs.push({
      id: 'rec-corridor-closed',
      category: 'Corridor',
      severity: 'critical',
      title: `${corridor?.name ?? 'Corridor'} closed: hardest hit ${worstHit || 'none'}`,
      text:
        (pushedOver.length
          ? `The closure pushes ${pushedOver.map((x) => x.z.name).join(', ')} over capacity. `
          : '') +
        'Schedule the works at night or in stages, keep at least one lane open in the peak direction, and add bus service on the diversion routes through the neighbouring zones.'
    });
  }

  // 4. Waste processing
  if (city.wastePressure > OVER) {
    const metric = (r) => r.citySummary.wastePressure;
    const tpd = solveLever(dataset, scenario, 'addedProcessingTpd', metric, OVER);
    const offPeak = solveLever(dataset, scenario, 'offPeakWasteCollectionShare', metric, OVER);
    const parts = [];
    if (tpd !== null) parts.push(`commission about ${num(tpd - scenario.addedProcessingTpd)} TPD of new processing capacity (BBMP lists 2,300 TPD at new sites whose status is unverified)`);
    if (offPeak !== null && offPeak > scenario.offPeakWasteCollectionShare + 0.005) parts.push(`move ${pct(offPeak)} of collection rounds to night hours`);
    recs.push({
      id: 'rec-waste',
      category: 'Waste',
      severity: 'critical',
      title: `Waste generated is ${Math.round(city.wastePressure)}% of processing capacity`,
      text: parts.length
        ? `To bring processing back to capacity: ${parts.join('; or ')}.`
        : 'Collection timing alone cannot close the gap; processing capacity has to be added.'
    });
  }

  // 5. Freight fleets
  if (city.logisticsPressure > 80) {
    const metric = (r) => r.citySummary.logisticsPressure;
    const offPeak = solveLever(dataset, scenario, 'offPeakDeliveryShare', metric, 80);
    recs.push({
      id: 'rec-logistics',
      category: 'Logistics',
      severity: city.logisticsPressure > OVER ? 'critical' : 'moderate',
      title: `Freight fleets at ${Math.round(city.logisticsPressure)}% utilisation`,
      text:
        offPeak !== null
          ? `Moving ${pct(offPeak)} of deliveries to night windows brings fleets back to 80%, and frees road space at the peak.`
          : 'Night deliveries alone are not enough; add fleet capacity or consolidation hubs at the city edge.'
    });
  }

  // 6. What changed relative to today
  const delta = city.overallPressure - base.overallPressure;
  if (Math.abs(delta) >= 3) {
    recs.push({
      id: delta > 0 ? 'rec-overall-increase' : 'rec-overall-decrease',
      category: 'Overall',
      severity: delta > 0 ? 'moderate' : 'safe',
      title: `Composite pressure ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta).toFixed(1)} points from today`,
      text: `Traffic ${signed(city.trafficPressure - base.trafficPressure)}, logistics ${signed(city.logisticsPressure - base.logisticsPressure)}, waste ${signed(city.wastePressure - base.wastePressure)} points; peak speed ${base.peakSpeedKmph} → ${city.peakSpeedKmph} km/h.`
    });
  }

  if (!recs.length) {
    recs.push({
      id: 'rec-within-capacity',
      category: 'Overall',
      severity: 'safe',
      title: 'Every system is within capacity in this scenario',
      text: 'No intervention is needed to keep traffic, freight and waste below capacity.'
    });
  }

  const severityRank = { critical: 0, moderate: 1, safe: 2 };
  return recs.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]).slice(0, 6);
}

const signed = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}`;
