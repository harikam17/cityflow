/**
 * CityFlow Metric and String Formatters
 *
 * Pressure indices are utilisation percentages (100 = demand equals capacity).
 */

export const PRESSURE_THRESHOLDS = {
  moderate: 80, // approaching capacity
  critical: 100 // over capacity
};

export function formatPressureScore(score) {
  if (typeof score !== 'number' || isNaN(score)) return '0.0%';
  return `${score.toFixed(1)}%`;
}

export function formatDeltaValue(baseline, current) {
  if (typeof baseline !== 'number' || typeof current !== 'number') return '0.0';
  const diff = current - baseline;
  if (Math.abs(diff) < 0.05) return '0.0';
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}`;
}

export function getPressureSeverity(score) {
  if (score < PRESSURE_THRESHOLDS.moderate) return 'safe';
  if (score <= PRESSURE_THRESHOLDS.critical) return 'moderate';
  return 'critical';
}

export function getSeverityLabel(score) {
  const severity = getPressureSeverity(score);
  if (severity === 'safe') return 'Within capacity';
  if (severity === 'moderate') return 'Near capacity';
  return 'Over capacity';
}

export function getSeverityColor(score) {
  const severity = getPressureSeverity(score);
  if (severity === 'safe') return '#10b981';
  if (severity === 'moderate') return '#f59e0b';
  return '#ef4444';
}

export function formatNumber(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0';
  return Math.round(val).toLocaleString('en-IN');
}
