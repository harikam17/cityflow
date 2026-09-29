import React from 'react';
import { formatPressureScore, formatNumber, getPressureSeverity, getSeverityLabel } from '../utils/formatters';

export default function ZoneDetailsModal({ zone, onClose }) {
  if (!zone) return null;

  const severity = getPressureSeverity(zone.overallPressure);
  const severityLabel = getSeverityLabel(zone.overallPressure);
  const mobility = zone.mobility;

  return (
    <section aria-labelledby="zone-details-heading" className="panel zone-details-panel">
      <div className="panel-header">
        <div className="zone-header-title-group">
          <h2 id="zone-details-heading" className="panel-title">{zone.name}</h2>
          <span className="zone-type-tag">{zone.type}</span>
          <span className={`badge badge-${severity}`}>{severityLabel} ({formatPressureScore(zone.overallPressure)}/100)</span>
          {zone.isCorridorClosed && (
            <span className="badge badge-critical">Road Closure In Effect</span>
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

      {/* 1. Empirical Mobility & Demographics Baseline */}
      {mobility && (
        <div className="zone-empirical-section">
          <div className="zone-section-header">
            <div>
              <h3 className="zone-section-title">Empirical Mobility & Demographics Baseline</h3>
              <span className="zone-section-subtitle">Real municipal indicators from the official dataset.</span>
            </div>
            <span className="badge badge-info">Source: Bengaluru Mobility Indicators dataset</span>
          </div>

          <div className="zone-empirical-grid">
            {/* Demographic & Trip Characteristics Card */}
            <div className="zone-subsystem-card">
              <div className="subsystem-header">
                <h4 className="subsystem-title">Demographics & Trip Indicators</h4>
              </div>
              <div className="subsystem-data-list">
                <div className="data-row">
                  <span className="data-label">Population (2011 Census):</span>
                  <span className="data-value tabular-nums">{formatNumber(mobility.population2011)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Population (2001 Census):</span>
                  <span className="data-value tabular-nums">{formatNumber(mobility.population2001)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Geographic Area:</span>
                  <span className="data-value tabular-nums">{mobility.areaSqKm} km²</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Population Density:</span>
                  <span className="data-value tabular-nums">{formatNumber(mobility.populationDensity2011)} /km²</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Employment Density:</span>
                  <span className="data-value tabular-nums">{formatNumber(mobility.employmentDensity2011)} jobs/km²</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Per Capita Trip Rate:</span>
                  <span className="data-value tabular-nums">{mobility.perCapitaTripRate} trips/day</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Average Trip Length:</span>
                  <span className="data-value tabular-nums">{mobility.averageTripLengthKm} km</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Short Trips (&lt;15m / &lt;30m):</span>
                  <span className="data-value tabular-nums">{mobility.tripDurationUnder15MinPct}% / {mobility.tripDurationUnder30MinPct}%</span>
                </div>
                <div className="data-row highlight-row">
                  <span className="data-label font-semibold">Total Daily Passenger Trips:</span>
                  <span className="data-value tabular-nums font-bold">{formatNumber(mobility.derivedTrips.totalDailyPassengerTrips)}</span>
                </div>
              </div>
            </div>

            {/* Modal Split & Derived Daily Trips Card */}
            <div className="zone-subsystem-card">
              <div className="subsystem-header">
                <h4 className="subsystem-title">Modal Split & Derived Daily Trip Volumes</h4>
              </div>
              <div className="subsystem-data-list">
                <table className="mobility-mini-table" aria-label={`Modal split and trip volume for ${zone.name}`}>
                  <thead>
                    <tr>
                      <th scope="col">Transport Mode</th>
                      <th scope="col" className="text-right">Mode Share</th>
                      <th scope="col" className="text-right">Daily Trips</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Walk</td>
                      <td className="text-right tabular-nums">{mobility.walkModeShare}%</td>
                      <td className="text-right tabular-nums font-semibold">{formatNumber(mobility.derivedTrips.walkTrips)}</td>
                    </tr>
                    <tr>
                      <td>Bicycle</td>
                      <td className="text-right tabular-nums">{mobility.bicycleModeShare}%</td>
                      <td className="text-right tabular-nums font-semibold">{formatNumber(mobility.derivedTrips.bicycleTrips)}</td>
                    </tr>
                    <tr>
                      <td>Two-Wheeler</td>
                      <td className="text-right tabular-nums">{mobility.twoWheelerModeShare}%</td>
                      <td className="text-right tabular-nums font-semibold">{formatNumber(mobility.derivedTrips.twoWheelerTrips)}</td>
                    </tr>
                    <tr>
                      <td>Car / Van</td>
                      <td className="text-right tabular-nums">{mobility.carVanModeShare}%</td>
                      <td className="text-right tabular-nums font-semibold">{formatNumber(mobility.derivedTrips.carVanTrips)}</td>
                    </tr>
                    <tr>
                      <td>Auto Rickshaw</td>
                      <td className="text-right tabular-nums">{mobility.autoModeShare}%</td>
                      <td className="text-right tabular-nums font-semibold">{formatNumber(mobility.derivedTrips.autoTrips)}</td>
                    </tr>
                    <tr>
                      <td>Taxi / Maxi Cab</td>
                      <td className="text-right tabular-nums">{mobility.taxiMaxiCabModeShare}%</td>
                      <td className="text-right tabular-nums font-semibold">{formatNumber(mobility.derivedTrips.taxiTrips)}</td>
                    </tr>
                    <tr>
                      <td>Public Transport</td>
                      <td className="text-right tabular-nums">{mobility.publicTransportModeShare}%</td>
                      <td className="text-right tabular-nums font-semibold">{formatNumber(mobility.derivedTrips.publicTransitTrips)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Derived Aggregate Aggregations */}
                <div className="data-row highlight-row" style={{ marginTop: 'var(--space-2)' }}>
                  <span className="data-label font-semibold">Motorized Private Trips (Daily):</span>
                  <span className="data-value tabular-nums font-bold">{formatNumber(mobility.motorizedPrivateDailyTrips)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Derived Peak-Hour Motorized Demand:</span>
                  <span className="data-value tabular-nums font-bold">{formatNumber(mobility.derivedPeakHourMotorizedVehicleDemand)} veh/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Calibrated Simulation Subsystems */}
      <div className="zone-calibrated-section">
        <div className="zone-section-header">
          <div>
            <h3 className="zone-section-title">Calibrated Urban Subsystems (Scenario Stress Engine)</h3>
            <span className="zone-section-subtitle">
              Calibrated engineering models for road capacity, commercial freight, and municipal solid waste.
            </span>
          </div>
          <span className="badge badge-moderate">MODELLED / CALIBRATED</span>
        </div>

        <div className="zone-metrics-breakdown-grid">
          {/* Traffic Domain Card */}
          <div className="zone-subsystem-card">
            <div className="subsystem-header">
              <h4 className="subsystem-title">Traffic Subsystem</h4>
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
              <h4 className="subsystem-title">Freight & Logistics</h4>
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
              <h4 className="subsystem-title">Municipal Solid Waste</h4>
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
      </div>
    </section>
  );
}

