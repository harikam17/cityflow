/**
 * Preset what-if scenarios. Each preset lists only the levers it changes; the rest stay at
 * SCENARIO_DEFAULTS. The first four tell one story for a demo: today, a real disruption,
 * and what it takes to recover from it.
 */
import { SCENARIO_DEFAULTS } from '../engine/simulationEngine.js';

const preset = (id, name, description, changes) => ({
  id,
  name,
  description,
  inputs: { ...SCENARIO_DEFAULTS, ...changes }
});

export const PRESET_SCENARIOS = [
  preset(
    'preset-baseline',
    'Today (2025)',
    'Weekday morning peak as the model reproduces it: calibrated to the 11 km/h peak speed observed in the Comprehensive Mobility Plan 2020 survey.',
    {}
  ),
  preset(
    'preset-orr-works',
    'ORR closed for metro works',
    'Outer Ring Road lanes lost to Blue Line metro construction. Its traffic squeezes onto parallel roads and spills into the neighbouring zones.',
    { closedCorridorId: 'corridor-orr' }
  ),
  preset(
    'preset-orr-mitigated',
    'ORR works + mitigation plan',
    'Same closure, with 30% more buses, 20% of office staff working from home and 30% of deliveries moved to night hours.',
    { closedCorridorId: 'corridor-orr', busServiceModifier: 1.3, workFromHomeShare: 0.2, offPeakDeliveryShare: 0.3 }
  ),
  preset(
    'preset-metro-phase2',
    'Metro Phase 2 complete',
    'Metro service roughly doubled (Phase 2 lines to the airport, ORR and Hosur Road), with its riders drawn from private vehicles.',
    { metroServiceModifier: 2.0 }
  ),
  preset(
    'preset-ecommerce-surge',
    'Festival e-commerce peak',
    '60% more parcel deliveries and 10% more shopping trips by private vehicle.',
    { deliveryFreightModifier: 1.6, privateVehicleModifier: 1.1 }
  ),
  preset(
    'preset-bus-strike',
    'Half the bus fleet off the road',
    'BMTC service cut by 50% (strike or breakdowns). Displaced riders move to two-wheelers, autos and cars.',
    { busServiceModifier: 0.5 }
  ),
  preset(
    'preset-waste-plan',
    'Waste processing plan',
    'Commission the 2,300 TPD of listed new processing sites and run half of all collection rounds at night.',
    { addedProcessingTpd: 2300, offPeakWasteCollectionShare: 0.5 }
  )
];

/** The preset whose levers all match `scenario`, or undefined for a custom scenario. */
export function findPreset(scenario = {}) {
  return PRESET_SCENARIOS.find((p) =>
    Object.entries(p.inputs).every(([key, value]) =>
      typeof value === 'number'
        ? Math.abs(value - (scenario[key] ?? SCENARIO_DEFAULTS[key])) < 0.001
        : value === (scenario[key] ?? null)
    )
  );
}
