/**
 * PRESET WHAT-IF SCENARIOS
 * 
 * Defined configuration parameters for testing stress conditions on urban infrastructure.
 */

export const PRESET_SCENARIOS = [
  {
    id: "preset-baseline",
    name: "Calibrated Baseline",
    description: "Standard weekday operating conditions with regular traffic flows and baseline logistics schedules.",
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
    description: "50% reduction in public transit frequency shifting commuters into private cars and ride-hails.",
    inputs: {
      privateVehicleModifier: 1.45,
      publicTransitModifier: 0.5,
      deliveryFreightModifier: 1.1,
      closedCorridorId: "corridor-east-central"
    }
  },
  {
    id: "preset-green-corridor",
    name: "High-Capacity Transit Push",
    description: "50% increase in bus/metro feeder capacity with 25% reduction in single-occupancy private cars.",
    inputs: {
      privateVehicleModifier: 0.75,
      publicTransitModifier: 1.5,
      deliveryFreightModifier: 0.9,
      closedCorridorId: null
    }
  }
];

export const AVAILABLE_CORRIDORS = [
  { id: "corridor-east-central", name: "East-Central Arterial Flyover" },
  { id: "corridor-tech-orr", name: "Mahadevapura Outer Ring Road Express Lane" }
];
