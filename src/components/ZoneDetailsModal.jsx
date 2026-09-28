import React from 'react';
import { formatPressureScore, formatNumber, getPressureSeverity, getSeverityLabel } from '../utils/formatters';

const PROVENANCE = {
  measured: { label: 'Measured', title: 'Taken directly from a published dataset' },
  derived: { label: 'Derived', title: 'Arithmetic on measured inputs' },
  estimated: { label: 'Estimated', title: 'Depends on a documented assumption (see Data sources)' }
};

function Prov({ kind }) {
  const p = PROVENANCE[kind];
  return <span className={`prov-tag prov-${kind}`} title={p.title}>{p.label}</span>;
}

function Row({ label, value, prov, highlight = false }) {
  return (
    <div className={`data-row${highlight ? ' highlight-row' : ''}`}>
      <span className="data-label">{label}</span>
      <span className="data-value tabular-nums">
        {value} {prov && <Prov kind={prov} />}
      </span>
    </div>
  );
}

const MODE_LABELS = {
  walk: 'Walk',
  bicycle: 'Bicycle',
  twoWheeler: 'Two-wheeler',
  carVan: 'Car / van',
  auto: 'Auto rickshaw',
  taxi: 'Taxi / cab',
  publicTransport: 'Public transport',
  slowMoving: 'Slow-moving vehicles'
};

export default function ZoneDetailsModal({ zone, onClose }) {
  if (!zone) return null;

  const src = zone.source;
  const { demographics: demo, mobility, roads, transit, waste } = src;
  const severity = getPressureSeverity(zone.overallPressure);

  return (
    <section aria-labelledby="zone-details-heading" className="panel zone-details-panel">
      <div className="panel-header">
        <div className="zone-header-title-group">
          <h2 id="zone-details-heading" className="panel-title">{zone.name} zone</h2>
          <span className={`badge badge-${severity}`}>
            {getSeverityLabel(zone.overallPressure)} ({formatPressureScore(zone.overallPressure)})
          </span>
          {zone.isCorridorClosed && <span className="badge badge-critical">Corridor closure in effect</span>}
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

      {/* 1. People and travel */}
      <div className="zone-empirical-section">
        <div className="zone-section-header">
          <div>
            <h3 className="zone-section-title">People and travel</h3>
            <span className="zone-section-subtitle">
              Census population and household-survey travel behaviour, rescaled onto the 2022 zone boundary.
            </span>
          </div>
        </div>

        <div className="zone-empirical-grid">
          <div className="zone-subsystem-card">
            <div className="subsystem-header">
              <h4 className="subsystem-title">Demographics</h4>
            </div>
            <div className="subsystem-data-list">
              <Row label="Population, 2011 census" value={formatNumber(demo.population2011)} prov="measured" />
              <Row label="Growth 2001–2011" value={`${(demo.populationGrowthRate * 100).toFixed(1)}% / yr`} prov="derived" />
              <Row label="Population, 2025 projection" value={formatNumber(demo.populationBaseYear)} prov="derived" />
              <Row label="Jobs (2011 employment density)" value={formatNumber(demo.jobsBaseline)} prov="derived" />
              <Row label="Zone area (2022 boundary)" value={`${src.areaKm2} km²`} prov="measured" />
              <Row label="Trips per person per day" value={mobility.perCapitaTripRate} prov="measured" />
              <Row label="Average trip length" value={`${mobility.averageTripLengthKm} km`} prov="measured" />
              <Row label="Daily trips by residents" value={formatNumber(mobility.dailyTrips)} prov="derived" highlight />
            </div>
          </div>

          <div className="zone-subsystem-card">
            <div className="subsystem-header">
              <h4 className="subsystem-title">Mode share</h4>
              <Prov kind="measured" />
            </div>
            <div className="subsystem-data-list">
              <table className="mobility-mini-table" aria-label={`Mode share and daily trips for ${zone.name}`}>
                <thead>
                  <tr>
                    <th scope="col">Mode</th>
                    <th scope="col" className="text-right">Share</th>
                    <th scope="col" className="text-right">Daily trips</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(MODE_LABELS).map(([key, label]) => (
                    <tr key={key}>
                      <td>{label}</td>
                      <td className="text-right tabular-nums">{mobility.modeSharesRaw[key]}%</td>
                      <td className="text-right tabular-nums font-semibold">
                        {formatNumber(mobility.dailyTrips * mobility.modeShares[key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="field-hint">Survey shares sum to {Object.values(mobility.modeSharesRaw).reduce((a, b) => a + b, 0)}%; trips use normalised shares.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Simulated subsystems */}
      <div className="zone-calibrated-section">
        <div className="zone-section-header">
          <div>
            <h3 className="zone-section-title">Simulated peak-hour conditions</h3>
            <span className="zone-section-subtitle">Current scenario. 100% utilisation means demand equals capacity.</span>
          </div>
        </div>

        <div className="zone-metrics-breakdown-grid">
          <div className="zone-subsystem-card">
            <div className="subsystem-header">
              <h4 className="subsystem-title">Traffic</h4>
              <span className={`badge badge-${getPressureSeverity(zone.trafficPressure)}`}>
                {formatPressureScore(zone.trafficPressure)}
              </span>
            </div>
            <div className="subsystem-data-list">
              <Row label="Peak two-wheelers (residents)" value={formatNumber(zone.peakVehicles.twoWheeler)} prov="estimated" />
              <Row label="Peak cars (residents)" value={formatNumber(zone.peakVehicles.carVan)} prov="estimated" />
              <Row label="Peak autos (residents)" value={formatNumber(zone.peakVehicles.auto)} prov="estimated" />
              <Row label="Arterial road length" value={`${formatNumber(roads.majorRoadKm)} km`} prov="measured" />
              <Row label="Peak-direction demand" value={`${formatNumber(zone.demandPcuKmPerHr)} PCU-km/h`} prov="estimated" />
              <Row label="Arterial capacity" value={`${formatNumber(zone.capacityPcuKmPerHr)} PCU-km/h`} prov="derived" />
              {zone.lostCapacityPcuKmPerHr > 0 && (
                <Row label="Capacity lost to closure" value={`${formatNumber(zone.lostCapacityPcuKmPerHr)} PCU-km/h`} prov="derived" />
              )}
              <Row label="Volume / capacity" value={zone.volumeCapacityRatio.toFixed(2)} prov="estimated" />
              <Row label="Peak speed" value={`${zone.peakSpeedKmph} km/h`} prov="estimated" highlight />
            </div>
          </div>

          <div className="zone-subsystem-card">
            <div className="subsystem-header">
              <h4 className="subsystem-title">Transit and freight</h4>
              <span className={`badge badge-${getPressureSeverity(zone.logisticsPressure)}`}>
                {formatPressureScore(zone.logisticsPressure)}
              </span>
            </div>
            <div className="subsystem-data-list">
              <Row label="Public transport trips / day" value={formatNumber(zone.ptDailyTrips)} prov="derived" />
              {zone.ptShiftTrips !== 0 && (
                <Row
                  label={zone.ptShiftTrips > 0 ? 'Trips won from private modes' : 'Trips lost to private modes'}
                  value={formatNumber(Math.abs(zone.ptShiftTrips))}
                  prov="estimated"
                />
              )}
              <Row label="Metro stations" value={transit.metroStations.length} prov="measured" />
              <Row label="Metro boardings / day (2025)" value={formatNumber(transit.metroDailyBoardings)} prov="measured" />
              <Row label="Goods vehicles, peak hour" value={formatNumber(zone.goodsPeakVehicles)} prov="estimated" />
              <Row label="Freight demand" value={`${formatNumber(zone.freightDemandTpd)} t/day`} prov="estimated" />
              <Row label="Delivery cycle stretch" value={`×${zone.cycleTimeFactor.toFixed(2)}`} prov="estimated" />
            </div>
          </div>

          <div className="zone-subsystem-card">
            <div className="subsystem-header">
              <h4 className="subsystem-title">Solid waste</h4>
              <span className={`badge badge-${getPressureSeverity(zone.wastePressure)}`}>
                {formatPressureScore(zone.wastePressure)}
              </span>
            </div>
            <div className="subsystem-data-list">
              <Row label="Collected, May 2020" value={`${formatNumber(waste.collectedTpdMay2020)} t/day`} prov="measured" />
              <Row label="Generation, 2025" value={`${formatNumber(zone.wasteGenerationTpd)} t/day`} prov="derived" />
              <Row label="Processing capacity share" value={`${formatNumber(zone.wasteProcessingCapacityTpd)} t/day`} prov="derived" />
              <Row label="Collection cycle stretch" value={`×${zone.cycleTimeFactor.toFixed(2)}`} prov="estimated" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
