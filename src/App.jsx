import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import KpiSummary from './components/KpiSummary';
import SimulatorControls from './components/SimulatorControls';
import CityMap from './components/CityMap';
import ZoneDetailsModal from './components/ZoneDetailsModal';
import ScenarioImpact from './components/ScenarioImpact';
import Recommendations from './components/Recommendations';
import DataProvenance from './components/DataProvenance';
import { CITY_DATASET } from './data/cityData';
import { calculateCitySimulation, SCENARIO_DEFAULTS } from './engine/simulationEngine';
import { generatePolicyRecommendations } from './engine/recommendations';

const BASELINE_SCENARIO = SCENARIO_DEFAULTS;

export default function App() {
  const [scenario, setScenario] = useState(BASELINE_SCENARIO);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // 1. Separate baseline simulation calculation (Single source of truth)
  const baselineResult = useMemo(() => {
    return calculateCitySimulation(CITY_DATASET, BASELINE_SCENARIO);
  }, []);

  // 2. Current scenario simulation calculation
  const currentResult = useMemo(() => {
    return calculateCitySimulation(CITY_DATASET, scenario);
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

  // Popup "inspect" action: always selects (never toggles off) and brings the inspector into view
  const handleInspectZone = (zoneId) => {
    setSelectedZoneId(zoneId);
    requestAnimationFrame(() => {
      document.getElementById('zone-inspector')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleCloseInspector = () => {
    setSelectedZoneId(null);
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Modelled Environment & Data Provenance Notice */}
        <div className="disclaimer-banner" role="region" aria-label="Simulation notice">
          <span className="badge badge-info">BENGALURU {CITY_DATASET.meta.baseYear} BASELINE</span>
          <span className="disclaimer-text">
            <strong>{CITY_DATASET.meta.city}.</strong> Built from census, household-survey, OpenStreetMap, BBMP waste and Namma Metro ridership data, calibrated to the CMP 2020 observed peak speed. Pressure is shown as utilisation: 100% means demand equals capacity.
          </span>
        </div>

        {/* City-Wide KPI Summary */}
        <KpiSummary
          citySummary={currentResult.citySummary}
          observedPeakSpeedKmph={CITY_DATASET.constants.observedPeakSpeedKmph.private}
        />

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
            onInspectZone={handleInspectZone}
          />
        </div>

        {/* Selected Zone Inspector Panel (Contextual) */}
        {selectedZone && (
          <div id="zone-inspector" className="inspector-container">
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

        {/* Real Data Provenance & Model Separation Section */}
        <DataProvenance />
      </main>
    </div>
  );
}

