import React, { useState, useMemo, useEffect, useDeferredValue } from 'react';
import Header from './components/Header';
import KpiSummary from './components/KpiSummary';
import SimulatorControls from './components/SimulatorControls';
import CityMap from './components/CityMap';
import ZoneInspector from './components/ZoneInspector';
import ScenarioImpact from './components/ScenarioImpact';
import Recommendations from './components/Recommendations';
import DataProvenance from './components/DataProvenance';
import { CITY_DATASET } from './data/cityData';
import { calculateCitySimulation, calculateSensitivity, SCENARIO_DEFAULTS } from './engine/simulationEngine';
import { generatePolicyRecommendations } from './engine/recommendations';
import { scenarioFromQuery, scenarioToQuery } from './utils/scenarioUrl';

export default function App() {
  const [scenario, setScenario] = useState(() => scenarioFromQuery(window.location.search));
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Keep the address bar in sync so the current scenario is always a shareable link
  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${scenarioToQuery(scenario)}`);
  }, [scenario]);

  const baselineResult = useMemo(() => calculateCitySimulation(CITY_DATASET, SCENARIO_DEFAULTS), []);
  const currentResult = useMemo(() => calculateCitySimulation(CITY_DATASET, scenario), [scenario]);

  // The solver behind the recommendations and the sensitivity runs re-simulate many times;
  // let them lag a frame behind the sliders instead of blocking them.
  const deferredScenario = useDeferredValue(scenario);
  const recommendations = useMemo(
    () =>
      generatePolicyRecommendations(
        CITY_DATASET,
        baselineResult,
        calculateCitySimulation(CITY_DATASET, deferredScenario),
        deferredScenario
      ),
    [baselineResult, deferredScenario]
  );
  const sensitivity = useMemo(() => calculateSensitivity(CITY_DATASET, deferredScenario), [deferredScenario]);

  const selectedZone = selectedZoneId ? currentResult.zones.find((z) => z.id === selectedZoneId) ?? null : null;

  const handleSelectZone = (zoneId) => setSelectedZoneId((prev) => (prev === zoneId ? null : zoneId));

  // Popup "inspect" action: always selects (never toggles off) and brings the inspector into view
  const handleInspectZone = (zoneId) => {
    setSelectedZoneId(zoneId);
    requestAnimationFrame(() => {
      document.getElementById('zone-inspector')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="app-container">
      <Header onCopyLink={handleCopyLink} copied={copied} onPrint={() => window.print()} />

      <main className="main-content">
        <div className="disclaimer-banner" role="region" aria-label="About this simulator">
          <span className="badge badge-info">BENGALURU · {CITY_DATASET.meta.baseYear} MORNING PEAK</span>
          <span className="disclaimer-text">
            Change a lever and see how roads, delivery fleets and waste processing respond in each of the 8 BBMP zones.
            100% means demand equals capacity. The model starts from public data (census, travel survey,
            OpenStreetMap roads, office stock, metro ridership, BBMP waste) and reproduces today's observed 11 km/h peak speed.
          </span>
        </div>

        <KpiSummary
          citySummary={currentResult.citySummary}
          sensitivity={sensitivity}
          observedPeakSpeedKmph={CITY_DATASET.constants.observedPeakSpeedKmph.private}
        />

        <div className="dashboard-grid">
          <SimulatorControls
            scenario={scenario}
            onChangeScenario={setScenario}
            onResetScenario={() => setScenario(SCENARIO_DEFAULTS)}
          />
          <CityMap
            zones={currentResult.zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={handleSelectZone}
            onInspectZone={handleInspectZone}
          />
        </div>

        {selectedZone && (
          <div id="zone-inspector" className="inspector-container">
            <ZoneInspector zone={selectedZone} onClose={() => setSelectedZoneId(null)} />
          </div>
        )}

        <Recommendations recommendations={recommendations} />

        <ScenarioImpact baselineResult={baselineResult} currentResult={currentResult} scenario={scenario} />

        <DataProvenance />
      </main>
    </div>
  );
}
