import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import { formatPressureScore, formatDeltaValue } from '../utils/formatters';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function getActiveScenarioName(scenario = {}) {
  const matchingPreset = PRESET_SCENARIOS.find((preset) => {
    return (
      Math.abs(preset.inputs.privateVehicleModifier - (scenario.privateVehicleModifier ?? 1.0)) < 0.001 &&
      Math.abs(preset.inputs.publicTransitModifier - (scenario.publicTransitModifier ?? 1.0)) < 0.001 &&
      Math.abs(preset.inputs.deliveryFreightModifier - (scenario.deliveryFreightModifier ?? 1.0)) < 0.001 &&
      preset.inputs.closedCorridorId === (scenario.closedCorridorId || null)
    );
  });

  return matchingPreset ? matchingPreset.name : 'Custom Scenario';
}

export default function ScenarioImpact({
  baselineResult = {},
  currentResult = {},
  scenario = {}
}) {
  const baseSummary = baselineResult.citySummary || {
    overallPressure: 51.7,
    trafficPressure: 49.7,
    logisticsPressure: 53.6,
    wastePressure: 52.4
  };

  const currSummary = currentResult.citySummary || {
    overallPressure: 51.7,
    trafficPressure: 49.7,
    logisticsPressure: 53.6,
    wastePressure: 52.4
  };

  const baseZones = baselineResult.zones || [];
  const currZones = currentResult.zones || [];

  const activeScenarioName = getActiveScenarioName(scenario);

  // City-level metric rows
  const cityMetrics = [
    {
      id: 'overall',
      name: 'Overall Pressure',
      baseline: baseSummary.overallPressure,
      current: currSummary.overallPressure
    },
    {
      id: 'traffic',
      name: 'Traffic Pressure',
      baseline: baseSummary.trafficPressure,
      current: currSummary.trafficPressure
    },
    {
      id: 'logistics',
      name: 'Logistics Pressure',
      baseline: baseSummary.logisticsPressure,
      current: currSummary.logisticsPressure
    },
    {
      id: 'waste',
      name: 'Waste Pressure',
      baseline: baseSummary.wastePressure,
      current: currSummary.wastePressure
    }
  ];

  // Grouped Bar Chart Data
  const chartData = {
    labels: ['Overall', 'Traffic', 'Logistics', 'Waste'],
    datasets: [
      {
        label: 'Baseline',
        data: [
          baseSummary.overallPressure,
          baseSummary.trafficPressure,
          baseSummary.logisticsPressure,
          baseSummary.wastePressure
        ],
        backgroundColor: '#475569',
        borderColor: '#334155',
        borderWidth: 1,
        borderRadius: 2
      },
      {
        label: 'Current Scenario',
        data: [
          currSummary.overallPressure,
          currSummary.trafficPressure,
          currSummary.logisticsPressure,
          currSummary.wastePressure
        ],
        backgroundColor: '#2563eb',
        borderColor: '#1d4ed8',
        borderWidth: 1,
        borderRadius: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            size: 11
          },
          boxWidth: 10,
          padding: 8
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toFixed(1)} / 100`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#1e293b'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 }
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: '#1e293b'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          stepSize: 20
        },
        title: {
          display: true,
          text: 'Pressure Score (0–100)',
          color: '#64748b',
          font: { size: 11 }
        }
      }
    }
  };

  return (
    <section aria-labelledby="scenario-impact-heading" className="panel scenario-impact-section">
      <div className="panel-header">
        <div className="scenario-header-block">
          <h2 id="scenario-impact-heading" className="panel-title">Scenario Impact</h2>
          <div className="active-scenario-badge-container">
            <span className="active-scenario-tag">{activeScenarioName}</span>
          </div>
          <span className="panel-subtitle">Comparison with the calibrated baseline simulation.</span>
        </div>
      </div>

      <div className="impact-grid">
        {/* City-Level Comparison Table */}
        <div className="impact-table-container">
          <table className="impact-table" aria-label="City-level baseline vs scenario comparison">
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col" className="text-right">Baseline</th>
                <th scope="col" className="text-right">Current</th>
                <th scope="col" className="text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {cityMetrics.map((row) => {
                const diff = row.current - row.baseline;
                const deltaStr = formatDeltaValue(row.baseline, row.current);
                let deltaClass = 'delta-neutral';
                if (diff > 0.05) deltaClass = 'delta-increase';
                if (diff < -0.05) deltaClass = 'delta-decrease';

                return (
                  <tr key={row.id}>
                    <td className="metric-name">{row.name}</td>
                    <td className="text-right tabular-nums">{formatPressureScore(row.baseline)}</td>
                    <td className="text-right tabular-nums font-bold">{formatPressureScore(row.current)}</td>
                    <td className={`text-right tabular-nums font-semibold ${deltaClass}`}>
                      {deltaStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Grouped Bar Chart */}
        <div className="impact-chart-container">
          <h3 className="chart-heading">Pressure Comparison</h3>
          <div className="chart-wrapper">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Zone Impact Table */}
      <div className="zone-impact-section">
        <h3 className="zone-impact-heading">Zone Impact</h3>
        <div className="zone-table-container">
          <table className="impact-table" aria-label="Zone-level baseline vs scenario comparison">
            <thead>
              <tr>
                <th scope="col">Zone</th>
                <th scope="col" className="text-right">Baseline Overall</th>
                <th scope="col" className="text-right">Current Overall</th>
                <th scope="col" className="text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {currZones.map((zone) => {
                const baseZone = baseZones.find((b) => b.id === zone.id) || {};
                const baseScore = baseZone.overallPressure ?? zone.overallPressure;
                const currScore = zone.overallPressure;
                const diff = currScore - baseScore;
                const deltaStr = formatDeltaValue(baseScore, currScore);
                let deltaClass = 'delta-neutral';
                if (diff > 0.05) deltaClass = 'delta-increase';
                if (diff < -0.05) deltaClass = 'delta-decrease';

                return (
                  <tr key={zone.id}>
                    <td>
                      <span className="zone-name-cell">{zone.name}</span>
                      {zone.isCorridorClosed && (
                        <span className="zone-tag-closure">Closed Corridor</span>
                      )}
                    </td>
                    <td className="text-right tabular-nums">{formatPressureScore(baseScore)}</td>
                    <td className="text-right tabular-nums font-bold">{formatPressureScore(currScore)}</td>
                    <td className={`text-right tabular-nums font-semibold ${deltaClass}`}>
                      {deltaStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
