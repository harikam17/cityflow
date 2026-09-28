/**
 * PRESET WHAT-IF SCENARIOS
 * 
 * Defined configuration parameters for testing stress conditions on urban infrastructure.
 */

export const PRESET_SCENARIOS = [
  {
    id: "preset-baseline",
    name: "Calibrated Baseline",
    description: "2025 weekday peak built from the Bengaluru dataset, calibrated to the CMP 2020 observed peak speed.",
    inputs: {
      privateVehicleModifier: 1.0,
      publicTransitModifier: 1.0,
      deliveryFreightModifier: 1.0,
      closedCorridorId: null
    }
  },
  {
    id: "preset-ecommerce-surge",
    name: "Festival E-Commerce Peak",
    description: "60% increase in last-mile parcel deliveries combined with 20% higher personal shopping trips.",
    inputs: {
      privateVehicleModifier: 1.2,
      publicTransitModifier: 1.0,
      deliveryFreightModifier: 1.6,
      closedCorridorId: null
    }
  },
  {
    id: "preset-transit-disruption",
    name: "Transit Service Disruption",
    description: "50% cut in bus service with commuters shifting to private vehicles, plus an Outer Ring Road closure.",
    inputs: {
      // Displaced riders move to private vehicles inside the engine; no extra private uplift here
      privateVehicleModifier: 1.0,
      publicTransitModifier: 0.5,
      deliveryFreightModifier: 1.1,
      closedCorridorId: "corridor-orr"
    }
  },
  {
    id: "preset-green-corridor",
    name: "High-Capacity Transit Push",
    description: "50% more bus service plus demand management cutting private vehicle trips by 25%.",
    inputs: {
      privateVehicleModifier: 0.75,
      publicTransitModifier: 1.5,
      deliveryFreightModifier: 0.9,
      closedCorridorId: null
    }
  }
];
