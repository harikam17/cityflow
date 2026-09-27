/**
 * BENGALURU BASELINE CITY DATA
 * 
 * Sources:
 * 1. Passenger mobility, demographics, and modal split:
 *    "Bengaluru Mobility Indicators dataset" (data/bengaluru-mobility-indicators.csv)
 * 2. Infrastructure capacity, freight volume, and solid waste metrics:
 *    Calibrated urban simulation engineering models (Explicitly Modelled).
 */

import { BENGALURU_MOBILITY_DATASET, deriveZoneMobility } from './bengaluruMobilityData.js';

export const SIMULATED_CITY_METADATA = {
  cityName: "Bengaluru Metropolitan Region (BBMP Zones)",
  coordinateReference: "12.9716° N, 77.5946° E (Bengaluru City Datum)",
  dataSource: "Bengaluru Mobility Indicators dataset (Empirical Mobility) + Calibrated Infrastructure Models",
  baselineTimestamp: "2026-Q3 Model Calibrated"
};

// Find matching mobility record by zone name
const getMobilityData = (name) => {
  const record = BENGALURU_MOBILITY_DATASET.find(z => z.zoneName === name);
  return record ? deriveZoneMobility(record) : null;
};

export const BASELINE_ZONES = [
  {
    id: "zone-east",
    name: "Bangalore East",
    type: "Commercial Core & Office Corridor (MG Road / Indiranagar)",
    description: "Major commercial, retail, and office core with high transit ridership and dense commuter inflows.",
    center: [12.9784, 77.6190],
    polygon: [
      [12.9920, 77.5980],
      [12.9920, 77.6400],
      [12.9650, 77.6400],
      [12.9650, 77.5980]
    ],
    // Empirical Mobility from CSV (Bengaluru Mobility Indicators dataset)
    mobility: getMobilityData("Bangalore East"),

    // Calibrated Simulation Engine Parameters (MODELLED)
    roadCapacityVehiclesPerHour: 22000,       // Modelled road lane throughput capacity
    baselinePrivateVehiclesPerHour: 11500,    // Modelled peak hourly private vehicles
    baselineCommercialVehiclesPerHour: 2000,  // Modelled commercial delivery vehicles
    transitDailyCapacityTrips: 60000,         // Modelled transit system service capacity
    baselineTransitRidership: 45000,          // Modelled transit ridership demand
    freightDemandTonnesPerDay: 850,           // Modelled commercial freight demand
    freightFleetCapacityTonnesPerDay: 1800,   // Modelled logistics fleet capacity
    wasteGenerationTonnesPerDay: 380,         // Modelled municipal solid waste generation
    wasteCollectionCapacityTonnesPerDay: 800  // Modelled collection fleet capacity
  },
  {
    id: "zone-west",
    name: "Bangalore West",
    type: "Major Intermodal Transit Core (Majestic / Rajajinagar)",
    description: "Primary multi-modal transit exchange hub with intense bus, rail, and metro passenger movement.",
    center: [12.9850, 77.5530],
    polygon: [
      [13.0000, 77.5350],
      [13.0000, 77.5750],
      [12.9700, 77.5750],
      [12.9700, 77.5350]
    ],
    mobility: getMobilityData("Bangalore West"),

    // Calibrated Simulation Engine Parameters (MODELLED)
    roadCapacityVehiclesPerHour: 17500,
    baselinePrivateVehiclesPerHour: 8400,
    baselineCommercialVehiclesPerHour: 2600,
    transitDailyCapacityTrips: 90000,
    baselineTransitRidership: 72000,
    freightDemandTonnesPerDay: 1350,
    freightFleetCapacityTonnesPerDay: 2900,
    wasteGenerationTonnesPerDay: 460,
    wasteCollectionCapacityTonnesPerDay: 1050
  },
  {
    id: "zone-south",
    name: "Bangalore South",
    type: "High-Density Mixed Residential (Jayanagar / JP Nagar)",
    description: "Established compact residential neighborhood with high population density and municipal waste generation.",
    center: [12.9250, 77.5850],
    polygon: [
      [12.9450, 77.5650],
      [12.9450, 77.6100],
      [12.9050, 77.6100],
      [12.9050, 77.5650]
    ],
    mobility: getMobilityData("Bangalore South"),

    // Calibrated Simulation Engine Parameters (MODELLED)
    roadCapacityVehiclesPerHour: 15000,
    baselinePrivateVehiclesPerHour: 6800,
    baselineCommercialVehiclesPerHour: 1400,
    transitDailyCapacityTrips: 50000,
    baselineTransitRidership: 38000,
    freightDemandTonnesPerDay: 800,
    freightFleetCapacityTonnesPerDay: 2100,
    wasteGenerationTonnesPerDay: 560,
    wasteCollectionCapacityTonnesPerDay: 1050
  },
  {
    id: "zone-mahadevapura",
    name: "Mahadevapura",
    type: "Technology Park Corridor (Whitefield / ORR)",
    description: "High-volume suburban technology hub with heavy commuter shuttle traffic and e-commerce parcel loads.",
    center: [12.9700, 77.7100],
    polygon: [
      [12.9900, 77.6800],
      [12.9900, 77.7400],
      [12.9500, 77.7400],
      [12.9500, 77.6800]
    ],
    mobility: getMobilityData("Mahadevapura"),

    // Calibrated Simulation Engine Parameters (MODELLED)
    roadCapacityVehiclesPerHour: 19000,
    baselinePrivateVehiclesPerHour: 11200,
    baselineCommercialVehiclesPerHour: 1800,
    transitDailyCapacityTrips: 45000,
    baselineTransitRidership: 28000,
    freightDemandTonnesPerDay: 950,
    freightFleetCapacityTonnesPerDay: 2400,
    wasteGenerationTonnesPerDay: 320,
    wasteCollectionCapacityTonnesPerDay: 850
  },
  {
    id: "zone-bommanahalli",
    name: "Bommanahalli",
    type: "Industrial & Freight Hub (Electronic City / HSR)",
    description: "Major freight logistics corridor, manufacturing zone, and southern technology distribution hub.",
    center: [12.9080, 77.6320],
    polygon: [
      [12.9300, 77.6100],
      [12.9300, 77.6600],
      [12.8800, 77.6600],
      [12.8800, 77.6100]
    ],
    mobility: getMobilityData("Bommanahalli"),

    // Calibrated Simulation Engine Parameters (MODELLED)
    roadCapacityVehiclesPerHour: 18000,
    baselinePrivateVehiclesPerHour: 4500,
    baselineCommercialVehiclesPerHour: 5500,
    transitDailyCapacityTrips: 24000,
    baselineTransitRidership: 14000,
    freightDemandTonnesPerDay: 3200,
    freightFleetCapacityTonnesPerDay: 5600,
    wasteGenerationTonnesPerDay: 620,
    wasteCollectionCapacityTonnesPerDay: 1300
  }
];
