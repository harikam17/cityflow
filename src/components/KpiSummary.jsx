import React from 'react';
import { formatPressureScore, getPressureSeverity, getSeverityLabel } from '../utils/formatters';

export default function KpiSummary({ citySummary = {}, observedPeakSpeedKmph }) {
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
      label: 'OVERALL PRESSURE',
      value: formatPressureScore(overallPressure),
      score: overallPressure,
      sublabel: 'Weighted traffic, logistics and waste utilisation'
    },
    {
      id: 'kpi-traffic',
      label: 'TRAFFIC PRESSURE',
      value: formatPressureScore(trafficPressure),
      score: trafficPressure,
      sublabel: 'Peak demand / arterial road capacity'
    },
    {
      id: 'kpi-logistics',
      label: 'LOGISTICS PRESSURE',
      value: formatPressureScore(logisticsPressure),
      score: logisticsPressure,
      sublabel: 'Freight fleet utilisation under congestion'
    },
    {
      id: 'kpi-waste',
      label: 'WASTE PRESSURE',
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
        </div>
      </div>
    </section>
  );
}
