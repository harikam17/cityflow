/**
 * Scenario <-> URL query string, so any scenario can be shared as a link.
 * Only levers that differ from today are written; unknown or out-of-range values are dropped
 * by sanitizeScenario when the link is opened.
 */
import { SCENARIO_DEFAULTS, sanitizeScenario } from '../engine/simulationEngine';

export function scenarioToQuery(scenario) {
  const params = new URLSearchParams();
  for (const [key, def] of Object.entries(SCENARIO_DEFAULTS)) {
    const v = scenario[key];
    if (v !== def && v !== null && v !== undefined) params.set(key, String(v));
  }
  const q = params.toString();
  return q ? `?${q}` : '';
}

export function scenarioFromQuery(search) {
  const params = new URLSearchParams(search);
  const raw = {};
  for (const [key, def] of Object.entries(SCENARIO_DEFAULTS)) {
    if (!params.has(key)) continue;
    raw[key] = typeof def === 'number' ? Number(params.get(key)) : params.get(key);
  }
  return sanitizeScenario(raw);
}
