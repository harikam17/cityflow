import React from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { getPressureSeverity, getSeverityLabel, getSeverityColor, formatPressureScore, PRESSURE_THRESHOLDS } from '../utils/formatters';

export default function CityMap({
  zones = [],
  selectedZoneId,
  onSelectZone,
  onInspectZone
}) {
  const mapCenter = [12.970, 77.590];
  const defaultZoom = 11;

  return (
    <section aria-labelledby="city-map-heading" className="panel city-map-panel">
      <div className="panel-header">
        <div>
          <h2 id="city-map-heading" className="panel-title">Interactive City Pressure Map</h2>
          <span className="panel-subtitle">Select a zone on the map to inspect localized subsystem metrics</span>
        </div>
        <div className="map-legend" aria-label="Map pressure legend">
          <span className="legend-item"><span className="legend-color safe"></span> Within capacity (&lt;{PRESSURE_THRESHOLDS.moderate}%)</span>
          <span className="legend-item"><span className="legend-color moderate"></span> Near capacity ({PRESSURE_THRESHOLDS.moderate}–{PRESSURE_THRESHOLDS.critical}%)</span>
          <span className="legend-item"><span className="legend-color critical"></span> Over capacity (&gt;{PRESSURE_THRESHOLDS.critical}%)</span>
        </div>
      </div>

      <div className="map-container-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={defaultZoom}
          scrollWheelZoom={false}
          className="leaflet-map-view"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {zones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            const severity = getPressureSeverity(zone.overallPressure);
            const color = getSeverityColor(zone.overallPressure);
            const severityLabel = getSeverityLabel(zone.overallPressure);

            return (
              <React.Fragment key={zone.id}>
                {/* Zone Boundary Polygon */}
                {zone.polygon && (
                  <Polygon
                    positions={zone.polygon}
                    pathOptions={{
                      color: isSelected ? '#ffffff' : color,
                      weight: isSelected ? 3 : 2,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.45 : 0.25,
                      dashArray: zone.isCorridorClosed ? '6, 6' : undefined
                    }}
                    eventHandlers={{
                      click: () => onSelectZone(zone.id)
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <div className="map-tooltip-content">
                        <strong>{zone.name}</strong>
                        <br />
                        Overall: {formatPressureScore(zone.overallPressure)} ({severityLabel})
                        <br />
                        Peak speed: {zone.peakSpeedKmph} km/h
                        {zone.isCorridorClosed && <span className="tooltip-closure-tag"><br />⚠️ Road Closure Active</span>}
                      </div>
                    </Tooltip>
                  </Polygon>
                )}

                {/* Center Point Marker */}
                {zone.center && (
                  <CircleMarker
                    center={zone.center}
                    radius={isSelected ? 10 : 8}
                    pathOptions={{
                      color: isSelected ? '#ffffff' : color,
                      fillColor: color,
                      fillOpacity: 0.9,
                      weight: isSelected ? 3 : 2
                    }}
                    eventHandlers={{
                      click: () => onSelectZone(zone.id)
                    }}
                  >
                    <Popup>
                      <div className="map-popup-card">
                        <div className="popup-header">
                          <h3 className="popup-title">{zone.name}</h3>
                          <span className={`badge badge-${severity}`}>{severityLabel}</span>
                        </div>
                        <p className="popup-type">{zone.type}</p>
                        
                        <div className="popup-metrics-grid">
                          <div>
                            <span className="popup-metric-label">Overall:</span>
                            <span className="popup-metric-val tabular-nums">{formatPressureScore(zone.overallPressure)}</span>
                          </div>
                          <div>
                            <span className="popup-metric-label">Traffic:</span>
                            <span className="popup-metric-val tabular-nums">{formatPressureScore(zone.trafficPressure)}</span>
                          </div>
                          <div>
                            <span className="popup-metric-label">Logistics:</span>
                            <span className="popup-metric-val tabular-nums">{formatPressureScore(zone.logisticsPressure)}</span>
                          </div>
                          <div>
                            <span className="popup-metric-label">Waste:</span>
                            <span className="popup-metric-val tabular-nums">{formatPressureScore(zone.wastePressure)}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-primary popup-inspect-btn"
                          onClick={() => onInspectZone(zone.id)}
                        >
                          {isSelected ? 'Jump to Zone Details' : 'Inspect Zone Details'}
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
}
