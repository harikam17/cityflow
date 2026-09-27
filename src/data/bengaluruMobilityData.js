/**
 * Bengaluru Mobility Indicators Dataset & Derivation Layer
 * 
 * Source: data/bengaluru-mobility-indicators.csv
 * Official demographic, socio-economic, and modal trip indicators for Bengaluru.
 */

export const MOBILITY_CONVERSION_ASSUMPTIONS = {
  // Peak-Hour Factor: Share of daily trips occurring in the peak traffic hour
  // Standard metropolitan transport planning reference (8%–11%)
  peakHourFactor: 0.10,

  // Vehicle Occupancy Factors (average passengers per vehicle)
  // Used only to derive equivalent peak-hour motorized vehicle demand from passenger person-trips
  occupancy: {
    carVan: 1.5,        // Private passenger car/van average occupancy
    twoWheeler: 1.2,    // Motorized 2-wheeler average occupancy
    auto: 1.6,          // Auto rickshaw average passenger occupancy
    taxiMaxiCab: 1.5,   // Taxi/cab average passenger occupancy
    bus: 40.0           // Public transit bus average passenger load
  }
};

export const BENGALURU_MOBILITY_DATASET = [
  {
    zoneName: "Bangalore West",
    population2001: 1245548,
    population2011: 1465613,
    areaSqKm: 52,
    populationDensity2011: 41905,
    employmentDensity2011: 14917,
    averageHouseholdSize: 3.56,
    averagePerCapitaIncomeINR: 8700,
    perCapitaTripRate: 1.52,
    averageTripLengthKm: 7.59,
    walkModeShare: 18,
    bicycleModeShare: 2,
    taxiMaxiCabModeShare: 0.2,
    autoModeShare: 12,
    twoWheelerModeShare: 25,
    carVanModeShare: 11,
    publicTransportModeShare: 32,
    slowMovingModeShare: 2,
    tripDurationUnder15MinPct: 14,
    tripDurationUnder30MinPct: 24,
    modeShares: {
      walk: 18,
      bicycle: 2,
      taxiMaxiCab: 0.2,
      auto: 12,
      twoWheeler: 25,
      carVan: 11,
      publicTransport: 32,
      slowMoving: 2
    }
  },
  {
    zoneName: "Bangalore East",
    population2001: 1364197,
    population2011: 1695183,
    areaSqKm: 101,
    populationDensity2011: 22541,
    employmentDensity2011: 6035,
    averageHouseholdSize: 3.12,
    averagePerCapitaIncomeINR: 7100,
    perCapitaTripRate: 1.19,
    averageTripLengthKm: 6.92,
    walkModeShare: 21,
    bicycleModeShare: 2,
    taxiMaxiCabModeShare: 1,
    autoModeShare: 13,
    twoWheelerModeShare: 23,
    carVanModeShare: 10,
    publicTransportModeShare: 30,
    slowMovingModeShare: 2,
    tripDurationUnder15MinPct: 13,
    tripDurationUnder30MinPct: 32,
    modeShares: {
      walk: 21,
      bicycle: 2,
      taxiMaxiCab: 1,
      auto: 13,
      twoWheeler: 23,
      carVan: 10,
      publicTransport: 30,
      slowMoving: 2
    }
  },
  {
    zoneName: "Bangalore South",
    population2001: 1584552,
    population2011: 1877024,
    areaSqKm: 65,
    populationDensity2011: 36801,
    employmentDensity2011: 9380,
    averageHouseholdSize: 3.35,
    averagePerCapitaIncomeINR: 6500,
    perCapitaTripRate: 1.52,
    averageTripLengthKm: 6.47,
    walkModeShare: 21,
    bicycleModeShare: 2,
    taxiMaxiCabModeShare: 1,
    autoModeShare: 11,
    twoWheelerModeShare: 24,
    carVanModeShare: 11,
    publicTransportModeShare: 30,
    slowMovingModeShare: 2,
    tripDurationUnder15MinPct: 9,
    tripDurationUnder30MinPct: 24,
    modeShares: {
      walk: 21,
      bicycle: 2,
      taxiMaxiCab: 1,
      auto: 11,
      twoWheeler: 24,
      carVan: 11,
      publicTransport: 30,
      slowMoving: 2
    }
  },
  {
    zoneName: "Byatarayanapura",
    population2001: 369679,
    population2011: 578773,
    areaSqKm: 151,
    populationDensity2011: 6379,
    employmentDensity2011: 1182,
    averageHouseholdSize: 3.95,
    averagePerCapitaIncomeINR: 6900,
    perCapitaTripRate: 1.48,
    averageTripLengthKm: 6.64,
    walkModeShare: 25,
    bicycleModeShare: 1,
    taxiMaxiCabModeShare: 0,
    autoModeShare: 10,
    twoWheelerModeShare: 26,
    carVanModeShare: 7,
    publicTransportModeShare: 31,
    slowMovingModeShare: 1,
    tripDurationUnder15MinPct: 11,
    tripDurationUnder30MinPct: 17,
    modeShares: {
      walk: 25,
      bicycle: 1,
      taxiMaxiCab: 0,
      auto: 10,
      twoWheeler: 26,
      carVan: 7,
      publicTransport: 31,
      slowMoving: 1
    }
  },
  {
    zoneName: "Mahadevapura",
    population2001: 351732,
    population2011: 534797,
    areaSqKm: 132,
    populationDensity2011: 7039,
    employmentDensity2011: 2391,
    averageHouseholdSize: 3.85,
    averagePerCapitaIncomeINR: 10800,
    perCapitaTripRate: 1.35,
    averageTripLengthKm: 6.14,
    walkModeShare: 29,
    bicycleModeShare: 3,
    taxiMaxiCabModeShare: 0,
    autoModeShare: 7,
    twoWheelerModeShare: 25,
    carVanModeShare: 6,
    publicTransportModeShare: 30,
    slowMovingModeShare: 3,
    tripDurationUnder15MinPct: 15,
    tripDurationUnder30MinPct: 22,
    modeShares: {
      walk: 29,
      bicycle: 3,
      taxiMaxiCab: 0,
      auto: 7,
      twoWheeler: 25,
      carVan: 6,
      publicTransport: 30,
      slowMoving: 3
    }
  },
  {
    zoneName: "Bommanahalli",
    population2001: 303126,
    population2011: 473205,
    areaSqKm: 141,
    populationDensity2011: 5895,
    employmentDensity2011: 1784,
    averageHouseholdSize: 3.57,
    averagePerCapitaIncomeINR: 14200,
    perCapitaTripRate: 1.51,
    averageTripLengthKm: 5.77,
    walkModeShare: 35,
    bicycleModeShare: 1,
    taxiMaxiCabModeShare: 1,
    autoModeShare: 5,
    twoWheelerModeShare: 26,
    carVanModeShare: 5,
    publicTransportModeShare: 27,
    slowMovingModeShare: 1,
    tripDurationUnder15MinPct: 13,
    tripDurationUnder30MinPct: 20,
    modeShares: {
      walk: 35,
      bicycle: 1,
      taxiMaxiCab: 1,
      auto: 5,
      twoWheeler: 26,
      carVan: 5,
      publicTransport: 27,
      slowMoving: 1
    }
  },
  {
    zoneName: "Rajarajeshwari Nagara",
    population2001: 231891,
    population2011: 404924,
    areaSqKm: 126,
    populationDensity2011: 4928,
    employmentDensity2011: 986,
    averageHouseholdSize: 3.34,
    averagePerCapitaIncomeINR: 4600,
    perCapitaTripRate: 1.27,
    averageTripLengthKm: 6.5,
    walkModeShare: 36,
    bicycleModeShare: 2,
    taxiMaxiCabModeShare: 0,
    autoModeShare: 6,
    twoWheelerModeShare: 27,
    carVanModeShare: 3,
    publicTransportModeShare: 26,
    slowMovingModeShare: 2,
    tripDurationUnder15MinPct: 18,
    tripDurationUnder30MinPct: 33,
    modeShares: {
      walk: 36,
      bicycle: 2,
      taxiMaxiCab: 0,
      auto: 6,
      twoWheeler: 27,
      carVan: 3,
      publicTransport: 26,
      slowMoving: 2
    }
  },
  {
    zoneName: "Dasarahalli",
    population2001: 180523,
    population2011: 273622,
    areaSqKm: 61,
    populationDensity2011: 4765,
    employmentDensity2011: 565,
    averageHouseholdSize: 3.64,
    averagePerCapitaIncomeINR: 5800,
    perCapitaTripRate: 1.48,
    averageTripLengthKm: 6.33,
    walkModeShare: 37,
    bicycleModeShare: 3,
    taxiMaxiCabModeShare: 0,
    autoModeShare: 4,
    twoWheelerModeShare: 25,
    carVanModeShare: 3,
    publicTransportModeShare: 28,
    slowMovingModeShare: 3,
    tripDurationUnder15MinPct: 13,
    tripDurationUnder30MinPct: 22,
    modeShares: {
      walk: 37,
      bicycle: 3,
      taxiMaxiCab: 0,
      auto: 4,
      twoWheeler: 25,
      carVan: 3,
      publicTransport: 28,
      slowMoving: 3
    }
  },
  {
    zoneName: "Bangalore North Taluk (BIAAPA)",
    population2001: 133818,
    population2011: 193058,
    areaSqKm: 296,
    populationDensity2011: 613,
    employmentDensity2011: 351,
    averageHouseholdSize: 4.33,
    averagePerCapitaIncomeINR: 8600,
    perCapitaTripRate: 1.09,
    averageTripLengthKm: 7.13,
    walkModeShare: 43,
    bicycleModeShare: 4,
    taxiMaxiCabModeShare: 0,
    autoModeShare: 2,
    twoWheelerModeShare: 25,
    carVanModeShare: 2,
    publicTransportModeShare: 23,
    slowMovingModeShare: 4,
    tripDurationUnder15MinPct: 11,
    tripDurationUnder30MinPct: 20,
    modeShares: {
      walk: 43,
      bicycle: 4,
      taxiMaxiCab: 0,
      auto: 2,
      twoWheeler: 25,
      carVan: 2,
      publicTransport: 23,
      slowMoving: 4
    }
  },
  {
    zoneName: "Devanahalli Taluk (BIAAPA)",
    population2001: 185326,
    population2011: 256787,
    areaSqKm: 457,
    populationDensity2011: 7167,
    employmentDensity2011: 274,
    averageHouseholdSize: 3.12,
    averagePerCapitaIncomeINR: 5100,
    perCapitaTripRate: 1.06,
    averageTripLengthKm: 7.03,
    walkModeShare: 45,
    bicycleModeShare: 5,
    taxiMaxiCabModeShare: 0,
    autoModeShare: 1,
    twoWheelerModeShare: 26,
    carVanModeShare: 3,
    publicTransportModeShare: 20,
    slowMovingModeShare: 5,
    tripDurationUnder15MinPct: 14,
    tripDurationUnder30MinPct: 26,
    modeShares: {
      walk: 45,
      bicycle: 5,
      taxiMaxiCab: 0,
      auto: 1,
      twoWheeler: 26,
      carVan: 3,
      publicTransport: 20,
      slowMoving: 5
    }
  },
  {
    zoneName: "Doddaballapura Taluk (BIAAPA)",
    population2001: 151611,
    population2011: 193915,
    areaSqKm: 249,
    populationDensity2011: 10985,
    employmentDensity2011: 269,
    averageHouseholdSize: 3.24,
    averagePerCapitaIncomeINR: 4600,
    perCapitaTripRate: 1.04,
    averageTripLengthKm: 4.75,
    walkModeShare: 47,
    bicycleModeShare: 4,
    taxiMaxiCabModeShare: 0,
    autoModeShare: 1,
    twoWheelerModeShare: 28,
    carVanModeShare: 1,
    publicTransportModeShare: 19,
    slowMovingModeShare: 4,
    tripDurationUnder15MinPct: 13,
    tripDurationUnder30MinPct: 23,
    modeShares: {
      walk: 47,
      bicycle: 4,
      taxiMaxiCab: 0,
      auto: 1,
      twoWheeler: 28,
      carVan: 1,
      publicTransport: 19,
      slowMoving: 4
    }
  }
];

/**
 * Calculates derived passenger mobility metrics directly from CSV figures
 * using explicit formulas.
 */
export function deriveZoneMobility(zoneRecord) {
  const population = zoneRecord.population2011;
  const tripRate = zoneRecord.perCapitaTripRate;

  // Formula: dailyTrips = population2011 * perCapitaTripRate
  const dailyTrips = Math.round(population * tripRate);

  const walkShare = zoneRecord.walkModeShare ?? zoneRecord.modeShares.walk;
  const bicycleShare = zoneRecord.bicycleModeShare ?? zoneRecord.modeShares.bicycle;
  const carShare = zoneRecord.carVanModeShare ?? zoneRecord.modeShares.carVan;
  const twoWheelerShare = zoneRecord.twoWheelerModeShare ?? zoneRecord.modeShares.twoWheeler;
  const autoShare = zoneRecord.autoModeShare ?? zoneRecord.modeShares.auto;
  const taxiShare = zoneRecord.taxiMaxiCabModeShare ?? zoneRecord.modeShares.taxiMaxiCab;
  const publicTransportShare = zoneRecord.publicTransportModeShare ?? zoneRecord.modeShares.publicTransport;
  const slowMovingShare = zoneRecord.slowMovingModeShare ?? (zoneRecord.modeShares?.slowMoving || 0);

  // Formula: transitDailyTrips = dailyTrips * (publicTransportModeShare / 100)
  const transitDailyTrips = Math.round(dailyTrips * (publicTransportShare / 100));

  // Formula: motorizedPrivateDailyTrips = dailyTrips * (carShare + twoWheelerShare + autoShare + taxiShare) / 100
  const motorizedShareTotal = carShare + twoWheelerShare + autoShare + taxiShare;
  const motorizedPrivateDailyTrips = Math.round(dailyTrips * (motorizedShareTotal / 100));

  // Individual mode daily trip derivations:
  const walkDailyTrips = Math.round(dailyTrips * (walkShare / 100));
  const bicycleDailyTrips = Math.round(dailyTrips * (bicycleShare / 100));
  const carVanTrips = Math.round(dailyTrips * (carShare / 100));
  const twoWheelerTrips = Math.round(dailyTrips * (twoWheelerShare / 100));
  const autoTrips = Math.round(dailyTrips * (autoShare / 100));
  const taxiTrips = Math.round(dailyTrips * (taxiShare / 100));
  const slowMovingTrips = Math.round(dailyTrips * (slowMovingShare / 100));

  // Derived peak-hour vehicle demand based on documented assumptions:
  const phf = MOBILITY_CONVERSION_ASSUMPTIONS.peakHourFactor;
  const occ = MOBILITY_CONVERSION_ASSUMPTIONS.occupancy;

  const peakCarVehicles = (carVanTrips * phf) / occ.carVan;
  const peakTwoWheelerVehicles = (twoWheelerTrips * phf) / occ.twoWheeler;
  const peakAutoVehicles = (autoTrips * phf) / occ.auto;
  const peakTaxiVehicles = (taxiTrips * phf) / occ.taxiMaxiCab;

  const derivedPeakHourMotorizedVehicleDemand = Math.round(
    peakCarVehicles + peakTwoWheelerVehicles + peakAutoVehicles + peakTaxiVehicles
  );

  return {
    ...zoneRecord,
    // Real CSV fields directly accessible
    population2011: zoneRecord.population2011,
    areaSqKm: zoneRecord.areaSqKm,
    populationDensity2011: zoneRecord.populationDensity2011,
    employmentDensity2011: zoneRecord.employmentDensity2011,
    averagePerCapitaIncomeINR: zoneRecord.averagePerCapitaIncomeINR,
    perCapitaTripRate: zoneRecord.perCapitaTripRate,
    averageTripLengthKm: zoneRecord.averageTripLengthKm,
    walkModeShare: walkShare,
    bicycleModeShare: bicycleShare,
    taxiMaxiCabModeShare: taxiShare,
    autoModeShare: autoShare,
    twoWheelerModeShare: twoWheelerShare,
    carVanModeShare: carShare,
    publicTransportModeShare: publicTransportShare,
    // Derived outputs
    dailyTrips,
    transitDailyTrips,
    motorizedPrivateDailyTrips,
    derivedPeakHourMotorizedVehicleDemand,
    derivedTrips: {
      totalDailyPassengerTrips: dailyTrips,
      transitDailyTrips,
      motorizedPrivateDailyTrips,
      walkTrips: walkDailyTrips,
      bicycleTrips: bicycleDailyTrips,
      twoWheelerTrips,
      carVanTrips,
      autoTrips,
      taxiTrips,
      publicTransitTrips: transitDailyTrips,
      slowMovingTrips,
      derivedPeakHourMotorizedVehicleDemand
    }
  };
}

