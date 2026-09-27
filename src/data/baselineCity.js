/**
 * SIMULATED / MODELLED BASELINE CITY DATA
 * 
 * NOTICE:
 * All figures, capacities, and geographic bounds in this dataset are calibrated engineering models
 * designed strictly for educational and scenario-simulation purposes.
 * They do NOT represent live, empirical, or official municipal measurements.
 */

export const SIMULATED_CITY_METADATA = {
  cityName: "Simulated Metro Sector (Grid 26)",
  coordinateReference: "12.9716° N, 77.5946° E (Reference Datum)",
  modelScale: "Metropolitan District",
  baselineTimestamp: "2026-Q3 Model Calibrated"
};

export const BASELINE_ZONES = [
  {
    id: "zone-cbd",
    name: "Central Business District",
    type: "Commercial & Office Core",
    description: "High-density commercial core with peak office commuter inflow and restricted delivery windows.",
    center: [12.9735, 77.5985],
    polygon: [
      [12.9800, 77.5900],
      [12.9800, 77.6070],
      [12.9670, 77.6070],
      [12.9670, 77.5900]
    ],
    // Calibrated baseline capacities and demands (Simulated rates)
    roadCapacityVehiclesPerHour: 22000,
    baselinePrivateVehiclesPerHour: 11500,
    baselineCommercialVehiclesPerHour: 2000,
    transitDailyCapacityTrips: 60000,
    baselineTransitRidership: 45000,
    freightDemandTonnesPerDay: 850,
    freightFleetCapacityTonnesPerDay: 1800,
    wasteGenerationTonnesPerDay: 380,
    wasteCollectionCapacityTonnesPerDay: 800
  },
  {
    id: "zone-industrial-hub",
    name: "Industrial Logistics Hub",
    type: "Freight & Heavy Industrial",
    description: "Primary freight redistribution center, warehousing district, and manufacturing corridor.",
    center: [12.9920, 77.5520],
    polygon: [
      [13.0050, 77.5400],
      [13.0050, 77.5650],
      [12.9800, 77.5650],
      [12.9800, 77.5400]
    ],
    roadCapacityVehiclesPerHour: 18000,
    baselinePrivateVehiclesPerHour: 4500,
    baselineCommercialVehiclesPerHour: 5500,
    transitDailyCapacityTrips: 24000,
    baselineTransitRidership: 14000,
    freightDemandTonnesPerDay: 3200,
    freightFleetCapacityTonnesPerDay: 5600,
    wasteGenerationTonnesPerDay: 620,
    wasteCollectionCapacityTonnesPerDay: 1300
  },
  {
    id: "zone-tech-corridor",
    name: "Tech Corridor",
    type: "Suburban Technology Park",
    description: "High-volume office corridor with heavy ride-hail, shuttle traffic, and parcel deliveries.",
    center: [12.9280, 77.6830],
    polygon: [
      [12.9420, 77.6650],
      [12.9420, 77.7020],
      [12.9140, 77.7020],
      [12.9140, 77.6650]
    ],
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
    id: "zone-residential-high-density",
    name: "High-Density Residential",
    type: "Mixed Residential & Local Retail",
    description: "Compact residential neighborhood with high municipal solid waste generation and grocery e-commerce loads.",
    center: [12.9350, 77.6180],
    polygon: [
      [12.9500, 77.6050],
      [12.9500, 77.6320],
      [12.9200, 77.6320],
      [12.9200, 77.6050]
    ],
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
    id: "zone-transit-hub",
    name: "Major Transit Hub",
    type: "Intermodal Terminal & Rail Exchange",
    description: "Multi-modal rail, bus, and metro interchange with dense pedestrian and feeder vehicle circulation.",
    center: [12.9780, 77.5700],
    polygon: [
      [12.9880, 77.5600],
      [12.9880, 77.5820],
      [12.9680, 77.5820],
      [12.9680, 77.5600]
    ],
    roadCapacityVehiclesPerHour: 17500,
    baselinePrivateVehiclesPerHour: 8400,
    baselineCommercialVehiclesPerHour: 2600,
    transitDailyCapacityTrips: 90000,
    baselineTransitRidership: 72000,
    freightDemandTonnesPerDay: 1350,
    freightFleetCapacityTonnesPerDay: 2900,
    wasteGenerationTonnesPerDay: 460,
    wasteCollectionCapacityTonnesPerDay: 1050
  }
];
