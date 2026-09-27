/**
 * CityFlow Metric and String Formatters
 */

export function formatPressureScore(score) {
  if (typeof score !== 'number' || isNaN(score)) return '0.0';
  return score.toFixed(1);
}

export function formatDelta(baseline, simulated) {
  if (typeof baseline !== 'number' || typeof simulated !== 'number') return '+0.0%';
  const diff = simulated - baseline;
  const pct = baseline > 0 ? (diff / baseline) * 100 : 0;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatDeltaValue(baseline, current) {
  if (typeof baseline !== 'number' || typeof current !== 'number') return '0.0';
  const diff = current - baseline;
  if (Math.abs(diff) < 0.05) return '0.0';
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}`;
}

export function getPressureSeverity(score) {
  if (score < 45) return 'safe';
  if (score <= 70) return 'moderate';
  return 'critical';
}

export function getSeverityLabel(score) {
  const severity = getPressureSeverity(score);
  if (severity === 'safe') return 'Safe';
  if (severity === 'moderate') return 'Moderate';
  return 'Critical';
}

export function getSeverityColor(score) {
  const severity = getPressureSeverity(score);
  if (severity === 'safe') return '#10b981';
  if (severity === 'moderate') return '#f59e0b';
  return '#ef4444';
}

export function formatNumber(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0';
  return val.toLocaleString();
}
