import React from 'react';
import { formatPressureScore, formatNumber, getPressureSeverity, getSeverityLabel } from '../utils/formatters';

export default function ZoneDetailsModal({ zone, onClose }) {
  if (!zone) return null;

  const severity = getPressureSeverity(zone.overallPressure);
  const severityLabel = getSeverityLabel(zone.overallPressure);

  return (
    <section aria-labelledby="zone-details-heading" className="panel zone-details-panel">
      <div className="panel-header">
        <div className="zone-header-title-group">
          <h2 id="zone-details-heading" className="panel-title">{zone.name}</h2>
          <span className="zone-type-tag">{zone.type}</span>
          <span className={`badge badge-${severity}`}>{severityLabel} ({formatPressureScore(zone.overallPressure)}/100)</span>
          {zone.isCorridorClosed && (
            <span className="badge badge-critical">⚠️ Road Closure In Effect</span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={onClose}
          aria-label={`Close details for ${zone.name}`}
        >
          Close Inspector
        </button>
      </div>

      <p className="zone-description-text">{zone.description}</p>
      <p className="model-disclaimer-inline">
        Note: Subsystem metrics below represent calibrated simulation model outputs for this scenario.
      </p>

      <div className="zone-metrics-breakdown-grid">
        {/* Traffic Domain Card */}
        <div className="zone-subsystem-card">
          <div className="subsystem-header">
            <h3 className="subsystem-title">Traffic Subsystem</h3>
            <span className={`badge badge-${getPressureSeverity(zone.trafficPressure)}`}>
              {formatPressureScore(zone.trafficPressure)}/100
            </span>
          </div>
          <div className="subsystem-data-list">
            <div className="data-row">
              <span className="data-label">Effective Demand:</span>
              <span className="data-value tabular-nums">{formatNumber(zone.trafficDemand)} veh/hr</span>
            </div>
            <div className="data-row">
              <span className="data-label">Effective Road Capacity:</span>
              <span className="data-value tabular-nums">{formatNumber(zone.roadCapacity)} veh/hr</span>
            </div>
            <div className="data-row">
              <span className="data-label">Volume / Capacity Ratio:</span>
              <span className="data-value tabular-nums">
                {zone.roadCapacity > 0 ? (zone.trafficDemand / zone.roadCapacity).toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Logistics Domain Card */}
        <div className="zone-subsystem-card">
          <div className="subsystem-header">
            <h3 className="subsystem-title">Freight & Logistics</h3>
            <span className={`badge badge-${getPressureSeverity(zone.logisticsPressure)}`}>
              {formatPressureScore(zone.logisticsPressure)}/100
            </span>
          </div>
          <div className="subsystem-data-list">
            <div className="data-row">
              <span className="data-label">Delivery Freight Demand:</span>
              <span className="data-value tabular-nums">{formatNumber(zone.deliveryDemand)} tonnes/day</span>
            </div>
            <div className="data-row">
              <span className="data-label">Fleet Handling Capacity:</span>
              <span className="data-value tabular-nums">{formatNumber(zone.fleetCapacity)} tonnes/day</span>
            </div>
            <div className="data-row">
              <span className="data-label">Logistics Strain Level:</span>
              <span className="data-value">{getSeverityLabel(zone.logisticsPressure)}</span>
            </div>
          </div>
        </div>

        {/* Waste Management Domain Card */}
        <div className="zone-subsystem-card">
          <div className="subsystem-header">
            <h3 className="subsystem-title">Municipal Solid Waste</h3>
            <span className={`badge badge-${getPressureSeverity(zone.wastePressure)}`}>
              {formatPressureScore(zone.wastePressure)}/100
            </span>
          </div>
          <div className="subsystem-data-list">
            <div className="data-row">
              <span className="data-label">Waste Generation:</span>
              <span className="data-value tabular-nums">{formatNumber(zone.wasteGeneration)} tonnes/day</span>
            </div>
            <div className="data-row">
              <span className="data-label">Base Collection Capacity:</span>
              <span className="data-value tabular-nums">{formatNumber(zone.wasteCollectionCapacity)} tonnes/day</span>
            </div>
            <div className="data-row">
              <span className="data-label">Waste Clearance Risk:</span>
              <span className="data-value">{getSeverityLabel(zone.wastePressure)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
