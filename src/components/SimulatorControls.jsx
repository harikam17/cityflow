import React from 'react';
import { PRESET_SCENARIOS, AVAILABLE_CORRIDORS, findMatchingPreset } from '../data/presetScenarios';

export default function SimulatorControls({
  scenario = {},
  onChangeScenario,
  onResetScenario
}) {
  const {
    privateVehicleModifier = 1.0,
    publicTransitModifier = 1.0,
    deliveryFreightModifier = 1.0,
    closedCorridorId = null
  } = scenario;

  // Identify active preset if scenario matches exactly
  const activePreset = findMatchingPreset(scenario);

  const handleSliderChange = (field, value) => {
    onChangeScenario({
      ...scenario,
      [field]: parseFloat(value)
    });
  };

  const handleCorridorChange = (e) => {
    const value = e.target.value === 'none' ? null : e.target.value;
    onChangeScenario({
      ...scenario,
      closedCorridorId: value
    });
  };

  const handleApplyPreset = (preset) => {
    onChangeScenario(preset.inputs);
  };

  return (
    <section aria-labelledby="simulator-controls-heading" className="panel simulator-controls">
      <div className="panel-header">
        <h2 id="simulator-controls-heading" className="panel-title">What-If Simulator Controls</h2>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={onResetScenario}
          aria-label="Reset simulation parameters to calibrated baseline"
        >
          Reset Scenario
        </button>
      </div>

      {/* Preset Scenario Selector */}
      <div className="control-group preset-group">
        <span id="presets-label" className="control-label">
          Scenario Presets
        </span>
        <div className="preset-buttons" role="group" aria-labelledby="presets-label">
          {PRESET_SCENARIOS.map((preset) => {
            const isActive = activePreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`btn btn-preset ${isActive ? 'btn-preset-active' : ''}`}
                onClick={() => handleApplyPreset(preset)}
                title={preset.description}
                aria-pressed={isActive}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="divider" aria-hidden="true"></div>

      {/* Slider 1: Private Vehicles */}
      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="slider-private-vehicles">Private Vehicle Usage</label>
          <span className="control-value tabular-nums">
            {Math.round(privateVehicleModifier * 100)}%
          </span>
        </div>
        <input
          id="slider-private-vehicles"
          type="range"
          className="range-slider"
          min="0.5"
          max="1.5"
          step="0.05"
          value={privateVehicleModifier}
          onChange={(e) => handleSliderChange('privateVehicleModifier', e.target.value)}
          aria-valuemin="50"
          aria-valuemax="150"
          aria-valuenow={Math.round(privateVehicleModifier * 100)}
          aria-valuetext={`${Math.round(privateVehicleModifier * 100)} percent`}
        />
        <div className="slider-range-hints" aria-hidden="true">
          <span>50% (Low)</span>
          <span>100% (Base)</span>
          <span>150% (Surge)</span>
        </div>
      </div>

      {/* Slider 2: Public Transit Service */}
      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="slider-public-transit">Public Transit Service</label>
          <span className="control-value tabular-nums">
            {Math.round(publicTransitModifier * 100)}%
          </span>
        </div>
        <input
          id="slider-public-transit"
          type="range"
          className="range-slider"
          min="0.5"
          max="2.0"
          step="0.05"
          value={publicTransitModifier}
          onChange={(e) => handleSliderChange('publicTransitModifier', e.target.value)}
          aria-valuemin="50"
          aria-valuemax="200"
          aria-valuenow={Math.round(publicTransitModifier * 100)}
          aria-valuetext={`${Math.round(publicTransitModifier * 100)} percent`}
        />
        <div className="slider-range-hints" aria-hidden="true">
          <span>50% (Cut)</span>
          <span>100% (Base)</span>
          <span>200% (High Cap)</span>
        </div>
      </div>

      {/* Slider 3: Delivery Freight Volume */}
      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="slider-delivery-freight">Delivery / Freight Volume</label>
          <span className="control-value tabular-nums">
            {Math.round(deliveryFreightModifier * 100)}%
          </span>
        </div>
        <input
          id="slider-delivery-freight"
          type="range"
          className="range-slider"
          min="0.5"
          max="2.0"
          step="0.05"
          value={deliveryFreightModifier}
          onChange={(e) => handleSliderChange('deliveryFreightModifier', e.target.value)}
          aria-valuemin="50"
          aria-valuemax="200"
          aria-valuenow={Math.round(deliveryFreightModifier * 100)}
          aria-valuetext={`${Math.round(deliveryFreightModifier * 100)} percent`}
        />
        <div className="slider-range-hints" aria-hidden="true">
          <span>50% (Light)</span>
          <span>100% (Base)</span>
          <span>200% (Peak)</span>
        </div>
      </div>

      {/* Corridor Closure Dropdown */}
      <div className="form-group">
        <label htmlFor="select-corridor-closure" className="form-label-simple">
          Corridor Chokepoint / Road Closure
        </label>
        <select
          id="select-corridor-closure"
          className="select-input"
          value={closedCorridorId || 'none'}
          onChange={handleCorridorChange}
        >
          <option value="none">None (All Corridors Open)</option>
          {AVAILABLE_CORRIDORS.map((corridor) => (
            <option key={corridor.id} value={corridor.id}>
              {corridor.name} (–30% capacity)
            </option>
          ))}
        </select>
        {closedCorridorId && (
          <p className="field-hint text-critical">
            Active closure reduces road capacity in connected sectors.
          </p>
        )}
      </div>
    </section>
  );
}
