import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import KpiSummary from './components/KpiSummary';
import SimulatorControls from './components/SimulatorControls';
import CityMap from './components/CityMap';
import ZoneDetailsModal from './components/ZoneDetailsModal';
import ScenarioImpact from './components/ScenarioImpact';
import Recommendations from './components/Recommendations';
import { BASELINE_ZONES, SIMULATED_CITY_METADATA } from './data/baselineCity';
import { calculateCitySimulation } from './engine/simulationEngine';
import { generatePolicyRecommendations } from './engine/recommendations';

const BASELINE_SCENARIO = {
  privateVehicleModifier: 1.0,
  publicTransitModifier: 1.0,
  deliveryFreightModifier: 1.0,
  closedCorridorId: null
};

export default function App() {
  const [scenario, setScenario] = useState(BASELINE_SCENARIO);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // 1. Separate baseline simulation calculation (Single source of truth)
  const baselineResult = useMemo(() => {
    return calculateCitySimulation(BASELINE_ZONES, BASELINE_SCENARIO);
  }, []);

  // 2. Current scenario simulation calculation
  const currentResult = useMemo(() => {
    return calculateCitySimulation(BASELINE_ZONES, scenario);
  }, [scenario]);

  // 3. Deterministic recommendations derived from baseline vs scenario deltas
  const recommendations = useMemo(() => {
    return generatePolicyRecommendations(baselineResult, currentResult, scenario);
  }, [baselineResult, currentResult, scenario]);

  // 4. Currently selected zone
  const selectedZone = useMemo(() => {
    if (!selectedZoneId) return null;
    return currentResult.zones.find((z) => z.id === selectedZoneId) || null;
  }, [currentResult, selectedZoneId]);

  const handleResetScenario = () => {
    setScenario(BASELINE_SCENARIO);
  };

  const handleSelectZone = (zoneId) => {
    setSelectedZoneId((prev) => (prev === zoneId ? null : zoneId));
  };

  const handleCloseInspector = () => {
    setSelectedZoneId(null);
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Modelled Environment Notice */}
        <div className="disclaimer-banner" role="region" aria-label="Simulation notice">
          <span className="badge badge-info">SIMULATED ENVIRONMENT</span>
          <span className="disclaimer-text">
            <strong>Simulation data:</strong> Baseline inputs are calibrated engineering models for scenario demonstration and are not live municipal measurements ({SIMULATED_CITY_METADATA.cityName}).
          </span>
        </div>

        {/* City-Wide KPI Summary */}
        <KpiSummary citySummary={currentResult.citySummary} />

        {/* Core Operational Grid: Map & Controls */}
        <div className="dashboard-grid">
          <SimulatorControls
            scenario={scenario}
            onChangeScenario={setScenario}
            onResetScenario={handleResetScenario}
          />
          <CityMap
            zones={currentResult.zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={handleSelectZone}
          />
        </div>

        {/* Selected Zone Inspector Panel (Contextual) */}
        {selectedZone && (
          <div className="inspector-container">
            <ZoneDetailsModal
              zone={selectedZone}
              onClose={handleCloseInspector}
            />
          </div>
        )}

        {/* Phase 4 & 5: Scenario Impact (Table, Chart, Zone Comparison, Active Scenario) */}
        <ScenarioImpact
          baselineResult={baselineResult}
          currentResult={currentResult}
          scenario={scenario}
        />

        {/* Phase 4: Rule-Based Policy Recommendations */}
        <Recommendations recommendations={recommendations} />
      </main>
    </div>
  );
}
