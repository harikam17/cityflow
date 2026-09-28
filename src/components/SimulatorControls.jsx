import React from 'react';
import { PRESET_SCENARIOS, findPreset } from '../data/presetScenarios';
import { CORRIDORS } from '../data/cityData';
import { SCENARIO_LIMITS } from '../engine/simulationEngine';

const percent = (v) => `${Math.round(v * 100)}%`;
const tpd = (v) => `+${Math.round(v).toLocaleString('en-IN')} TPD`;

// Levers grouped by the system they act on. Ranges come from SCENARIO_LIMITS in the engine.
const LEVER_GROUPS = [
  {
    title: 'Travel demand',
    levers: [
      { key: 'privateVehicleModifier', label: 'Private vehicle trips', step: 0.05, format: percent, hints: ['50%', 'Today', '150%'] },
      { key: 'workFromHomeShare', label: 'Office staff working from home', step: 0.05, format: percent, hints: ['None', '', '50%'] }
    ]
  },
  {
    title: 'Public transport',
    levers: [
      { key: 'busServiceModifier', label: 'Bus service (BMTC)', step: 0.05, format: percent, hints: ['Half', '', '3×'] },
      { key: 'metroServiceModifier', label: 'Metro service (Namma Metro)', step: 0.05, format: percent, hints: ['Half', '', '3×'] }
    ]
  },
  {
    title: 'Freight',
    levers: [
      { key: 'deliveryFreightModifier', label: 'Delivery / freight volume', step: 0.05, format: percent, hints: ['50%', '', '200%'] },
      { key: 'offPeakDeliveryShare', label: 'Deliveries moved to night hours', step: 0.05, format: percent, hints: ['None', '', '60%'] }
    ]
  },
  {
    title: 'Solid waste',
    levers: [
      { key: 'addedProcessingTpd', label: 'New processing capacity', step: 100, format: tpd, hints: ['None', '', '5,000 TPD'] },
      { key: 'offPeakWasteCollectionShare', label: 'Collection rounds run at night', step: 0.05, format: percent, hints: ['None', '', 'All'] }
    ]
  }
];

function Lever({ lever, value, onChange }) {
  const [min, max] = SCENARIO_LIMITS[lever.key];
  const id = `lever-${lever.key}`;
  return (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={id}>{lever.label}</label>
        <span className="control-value tabular-nums">{lever.format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        className="range-slider"
        min={min}
        max={max}
        step={lever.step}
        value={value}
        onChange={(e) => onChange(lever.key, parseFloat(e.target.value))}
        aria-valuetext={lever.format(value)}
      />
      <div className="slider-range-hints" aria-hidden="true">
        {lever.hints.map((h, i) => <span key={i}>{h}</span>)}
      </div>
    </div>
  );
}

export default function SimulatorControls({ scenario, onChangeScenario, onResetScenario }) {
  const activePreset = findPreset(scenario);
  const setLever = (key, value) => onChangeScenario({ ...scenario, [key]: value });

  return (
    <section aria-labelledby="simulator-controls-heading" className="panel simulator-controls">
      <div className="panel-header">
        <h2 id="simulator-controls-heading" className="panel-title">What-if controls</h2>
        <button type="button" className="btn btn-sm btn-outline" onClick={onResetScenario}>
          Reset to today
        </button>
      </div>

      <div className="control-group preset-group">
        <span id="presets-label" className="control-label">Scenarios</span>
        <div className="preset-buttons" role="group" aria-labelledby="presets-label">
          {PRESET_SCENARIOS.map((preset) => {
            const isActive = activePreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`btn btn-preset ${isActive ? 'btn-preset-active' : ''}`}
                onClick={() => onChangeScenario(preset.inputs)}
                title={preset.description}
                aria-pressed={isActive}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
        {activePreset && <p className="field-hint">{activePreset.description}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="select-corridor-closure" className="form-label-simple">Close a corridor</label>
        <select
          id="select-corridor-closure"
          className="select-input"
          value={scenario.closedCorridorId || 'none'}
          onChange={(e) => setLever('closedCorridorId', e.target.value === 'none' ? null : e.target.value)}
        >
          <option value="none">None (all corridors open)</option>
          {CORRIDORS.map((corridor) => (
            <option key={corridor.id} value={corridor.id}>{corridor.name}</option>
          ))}
        </select>
        {scenario.closedCorridorId && (
          <p className="field-hint text-critical">
            Its arterial lanes are removed in every zone it crosses. Part of its traffic reroutes through neighbouring zones.
          </p>
        )}
      </div>

      {LEVER_GROUPS.map((group) => (
        <fieldset key={group.title} className="lever-group">
          <legend className="control-label">{group.title}</legend>
          {group.levers.map((lever) => (
            <Lever key={lever.key} lever={lever} value={scenario[lever.key]} onChange={setLever} />
          ))}
        </fieldset>
      ))}
    </section>
  );
}
