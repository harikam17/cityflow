import React from 'react';
import { MOBILITY_CONVERSION_ASSUMPTIONS } from '../data/bengaluruMobilityData';

export default function DataProvenance() {
  return (
    <section aria-labelledby="provenance-heading" className="panel data-provenance-panel">
      <div className="provenance-header">
        <div>
          <h2 id="provenance-heading" className="provenance-title">Bengaluru mobility baseline</h2>
          <span className="provenance-source">Source: bengaluru-mobility-indicators.csv</span>
        </div>
        <span className="badge badge-info">Empirical Dataset & Calibrated Model</span>
      </div>

      <p className="provenance-description">
        Passenger mobility indicators are based on the supplied dataset. Road, freight, waste and map geometry inputs remain modelled unless separately sourced.
      </p>

      <div className="provenance-grid">
        <div className="provenance-card">
          <h3 className="provenance-card-title">Real Empirical Baseline (CSV Sourced)</h3>
          <ul className="provenance-list">
            <li><strong>Demographics:</strong> Population (2011 & 2001 Census), Ward Area (km²), Population Density, Employment Density.</li>
            <li><strong>Travel Behaviour:</strong> Per Capita Trip Rate, Average Trip Length (km), Trip Duration distributions (&lt;15m, &lt;30m).</li>
            <li><strong>Modal Split:</strong> Walk, Bicycle, 2-Wheeler, Car/Van, Auto Rickshaw, Taxi/Cab, Public Transport share percentages.</li>
            <li><strong>Mathematical Derivations:</strong> Total daily passenger trips and mode-specific trip volumes derived without external scaling.</li>
          </ul>
        </div>

        <div className="provenance-card">
          <h3 className="provenance-card-title">Modelled / Assumed Parameters</h3>
          <ul className="provenance-list">
            <li><strong>Traffic Subsystem:</strong> Road lane capacity (veh/hr), baseline hourly vehicle demand, and non-linear volume/capacity response curves.</li>
            <li><strong>Freight & Waste Subsystems:</strong> Delivery demand (tonnes/day), fleet capacity, solid waste generation, and collection throughput.</li>
            <li><strong>Peak-Hour & Occupancy Assumptions:</strong> Peak hour factor ({Math.round(MOBILITY_CONVERSION_ASSUMPTIONS.peakHourFactor * 100)}%), vehicle occupancy (Car: {MOBILITY_CONVERSION_ASSUMPTIONS.occupancy.carVan}, 2W: {MOBILITY_CONVERSION_ASSUMPTIONS.occupancy.twoWheeler}, Auto: {MOBILITY_CONVERSION_ASSUMPTIONS.occupancy.auto}).</li>
            <li><strong>Spatial Geometry:</strong> Approximate boundary polygons and centroid coordinates for Leaflet visualization.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
