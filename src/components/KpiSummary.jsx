import React from 'react';
import { formatPressureScore, getPressureSeverity, getSeverityLabel } from '../utils/formatters';

/** How far the number moves when each key assumption is changed by +/-20% (one at a time). */
function RangeNote({ range, unit }) {
  if (!range || range.max - range.min < 0.5) return null;
  return (
    <p className="kpi-range" title="Range when each key assumption is moved 20% up or down, one at a time, with the model recalibrated each time">
      Assumption range {range.min.toFixed(0)}–{range.max.toFixed(0)}{unit}
    </p>
  );
}

export default function KpiSummary({ citySummary = {}, sensitivity, observedPeakSpeedKmph }) {
  const {
    overallPressure = 0,
    trafficPressure = 0,
    logisticsPressure = 0,
    wastePressure = 0,
    peakSpeedKmph = 0
  } = citySummary;

  const kpis = [
    {
      id: 'kpi-overall',
      metric: 'overallPressure',
      label: 'COMPOSITE',
      value: formatPressureScore(overallPressure),
      score: overallPressure,
      sublabel: '40% traffic, 30% logistics, 30% waste'
    },
    {
      id: 'kpi-traffic',
      metric: 'trafficPressure',
      label: 'TRAFFIC',
      value: formatPressureScore(trafficPressure),
      score: trafficPressure,
      sublabel: 'Peak demand / arterial road capacity'
    },
    {
      id: 'kpi-logistics',
      metric: 'logisticsPressure',
      label: 'FREIGHT FLEETS',
      value: formatPressureScore(logisticsPressure),
      score: logisticsPressure,
      sublabel: 'Freight fleet utilisation under congestion'
    },
    {
      id: 'kpi-waste',
      metric: 'wastePressure',
      label: 'WASTE PROCESSING',
      value: formatPressureScore(wastePressure),
      score: wastePressure,
      sublabel: 'Waste generated / processing capacity'
    }
  ];

  return (
    <section aria-labelledby="kpi-summary-heading" className="kpi-section">
      <h2 id="kpi-summary-heading" className="sr-only">City-Level Pressure Indicators</h2>
      <div className="kpi-grid">
        {kpis.map(kpi => {
          const severity = getPressureSeverity(kpi.score);
          const label = getSeverityLabel(kpi.score);

          return (
            <div key={kpi.id} className="panel kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">{kpi.label}</span>
                <span className={`badge badge-${severity}`}>{label}</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-value tabular-nums">{kpi.value}</span>
              </div>
              <p className="kpi-sublabel">{kpi.sublabel}</p>
              {sensitivity && <RangeNote range={sensitivity[kpi.metric]} unit="%" />}
            </div>
          );
        })}

        <div className="panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">PEAK SPEED</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value tabular-nums">{peakSpeedKmph.toFixed(1)} km/h</span>
          </div>
          <p className="kpi-sublabel">
            City-wide peak-hour average (CMP 2020 observed: {observedPeakSpeedKmph} km/h)
          </p>
          {sensitivity && <RangeNote range={sensitivity.peakSpeedKmph} unit=" km/h" />}
        </div>
      </div>
    </section>
  );
}
