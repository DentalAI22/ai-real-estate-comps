/**
 * Census / demographics data fetcher.
 * MVP: Mock data correlated with zip code using embedded metro profiles.
 * Production: Swap with US Census Bureau API (api.census.gov) using ACS 5-Year data.
 */

import { hashString, seededRandom } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CensusData {
  medianIncome: number;
  medianHomeValue: number;
  population: number;
  populationGrowthPct: number;
  medianAge: number;
  collegeEducatedPct: number;
  ownerOccupiedPct: number;
  unemploymentRate: number;
  povertyRate: number;
  medianRent: number;
}

// ─── Embedded Metro Demographic Profiles ───────────────────────────────────────

interface DemographicSeed {
  medianIncome: number;
  medianHomeValue: number;
  population: number;
  populationGrowthPct: number;
  medianAge: number;
  collegeEducatedPct: number;
  ownerOccupiedPct: number;
  unemploymentRate: number;
  povertyRate: number;
  medianRent: number;
}

/**
 * Approximate demographic profiles for major US zip code prefixes.
 * Based on ACS data for the associated metro areas.
 */
const DEMOGRAPHIC_SEEDS: Record<string, DemographicSeed> = {
  '100': { medianIncome: 72000, medianHomeValue: 850000, population: 58000, populationGrowthPct: 0.3, medianAge: 36.5, collegeEducatedPct: 47, ownerOccupiedPct: 32, unemploymentRate: 5.2, povertyRate: 17.5, medianRent: 2800 },
  '021': { medianIncome: 80000, medianHomeValue: 650000, population: 42000, populationGrowthPct: 0.8, medianAge: 32.5, collegeEducatedPct: 53, ownerOccupiedPct: 38, unemploymentRate: 4.0, povertyRate: 14.0, medianRent: 2400 },
  '191': { medianIncome: 48000, medianHomeValue: 350000, population: 38000, populationGrowthPct: -0.2, medianAge: 34.0, collegeEducatedPct: 32, ownerOccupiedPct: 52, unemploymentRate: 5.8, povertyRate: 21.0, medianRent: 1400 },
  '200': { medianIncome: 90000, medianHomeValue: 550000, population: 45000, populationGrowthPct: 1.2, medianAge: 34.0, collegeEducatedPct: 58, ownerOccupiedPct: 42, unemploymentRate: 3.8, povertyRate: 12.0, medianRent: 2100 },
  '276': { medianIncome: 65000, medianHomeValue: 380000, population: 35000, populationGrowthPct: 2.5, medianAge: 35.0, collegeEducatedPct: 45, ownerOccupiedPct: 58, unemploymentRate: 3.5, povertyRate: 10.0, medianRent: 1500 },
  '282': { medianIncome: 62000, medianHomeValue: 375000, population: 40000, populationGrowthPct: 2.3, medianAge: 34.5, collegeEducatedPct: 42, ownerOccupiedPct: 55, unemploymentRate: 3.8, povertyRate: 11.0, medianRent: 1450 },
  '300': { medianIncome: 60000, medianHomeValue: 350000, population: 50000, populationGrowthPct: 1.8, medianAge: 34.0, collegeEducatedPct: 40, ownerOccupiedPct: 50, unemploymentRate: 4.5, povertyRate: 14.0, medianRent: 1500 },
  '327': { medianIncome: 55000, medianHomeValue: 350000, population: 38000, populationGrowthPct: 2.0, medianAge: 36.0, collegeEducatedPct: 35, ownerOccupiedPct: 55, unemploymentRate: 4.2, povertyRate: 13.0, medianRent: 1550 },
  '330': { medianIncome: 52000, medianHomeValue: 500000, population: 45000, populationGrowthPct: 1.5, medianAge: 40.0, collegeEducatedPct: 33, ownerOccupiedPct: 45, unemploymentRate: 4.8, povertyRate: 15.0, medianRent: 2000 },
  '334': { medianIncome: 55000, medianHomeValue: 340000, population: 36000, populationGrowthPct: 1.8, medianAge: 37.0, collegeEducatedPct: 33, ownerOccupiedPct: 58, unemploymentRate: 4.2, povertyRate: 12.5, medianRent: 1500 },
  '372': { medianIncome: 62000, medianHomeValue: 400000, population: 42000, populationGrowthPct: 2.2, medianAge: 34.0, collegeEducatedPct: 40, ownerOccupiedPct: 52, unemploymentRate: 3.5, povertyRate: 11.0, medianRent: 1600 },
  '432': { medianIncome: 55000, medianHomeValue: 280000, population: 35000, populationGrowthPct: 1.0, medianAge: 33.0, collegeEducatedPct: 38, ownerOccupiedPct: 48, unemploymentRate: 4.5, povertyRate: 15.0, medianRent: 1100 },
  '462': { medianIncome: 50000, medianHomeValue: 260000, population: 32000, populationGrowthPct: 0.8, medianAge: 34.5, collegeEducatedPct: 32, ownerOccupiedPct: 52, unemploymentRate: 4.8, povertyRate: 16.0, medianRent: 1050 },
  '481': { medianIncome: 42000, medianHomeValue: 220000, population: 30000, populationGrowthPct: -0.5, medianAge: 35.0, collegeEducatedPct: 25, ownerOccupiedPct: 55, unemploymentRate: 7.0, povertyRate: 25.0, medianRent: 950 },
  '551': { medianIncome: 65000, medianHomeValue: 330000, population: 38000, populationGrowthPct: 1.0, medianAge: 33.0, collegeEducatedPct: 45, ownerOccupiedPct: 52, unemploymentRate: 3.5, povertyRate: 12.0, medianRent: 1350 },
  '606': { medianIncome: 60000, medianHomeValue: 350000, population: 45000, populationGrowthPct: 0.2, medianAge: 34.5, collegeEducatedPct: 38, ownerOccupiedPct: 45, unemploymentRate: 5.0, povertyRate: 16.0, medianRent: 1500 },
  '631': { medianIncome: 52000, medianHomeValue: 240000, population: 28000, populationGrowthPct: -0.3, medianAge: 36.5, collegeEducatedPct: 30, ownerOccupiedPct: 58, unemploymentRate: 5.0, povertyRate: 16.5, medianRent: 1000 },
  '641': { medianIncome: 55000, medianHomeValue: 260000, population: 30000, populationGrowthPct: 0.5, medianAge: 35.5, collegeEducatedPct: 35, ownerOccupiedPct: 55, unemploymentRate: 4.2, povertyRate: 13.0, medianRent: 1100 },
  '750': { medianIncome: 68000, medianHomeValue: 380000, population: 42000, populationGrowthPct: 2.5, medianAge: 34.0, collegeEducatedPct: 42, ownerOccupiedPct: 55, unemploymentRate: 3.5, povertyRate: 10.5, medianRent: 1600 },
  '770': { medianIncome: 60000, medianHomeValue: 320000, population: 48000, populationGrowthPct: 2.0, medianAge: 33.5, collegeEducatedPct: 35, ownerOccupiedPct: 52, unemploymentRate: 4.5, povertyRate: 14.0, medianRent: 1400 },
  '787': { medianIncome: 72000, medianHomeValue: 450000, population: 45000, populationGrowthPct: 3.5, medianAge: 33.0, collegeEducatedPct: 50, ownerOccupiedPct: 48, unemploymentRate: 3.0, povertyRate: 11.0, medianRent: 1700 },
  '802': { medianIncome: 75000, medianHomeValue: 540000, population: 40000, populationGrowthPct: 1.8, medianAge: 34.0, collegeEducatedPct: 48, ownerOccupiedPct: 48, unemploymentRate: 3.5, povertyRate: 11.0, medianRent: 1800 },
  '841': { medianIncome: 68000, medianHomeValue: 450000, population: 35000, populationGrowthPct: 2.5, medianAge: 30.5, collegeEducatedPct: 38, ownerOccupiedPct: 62, unemploymentRate: 3.0, povertyRate: 9.5, medianRent: 1500 },
  '850': { medianIncome: 60000, medianHomeValue: 400000, population: 42000, populationGrowthPct: 2.2, medianAge: 35.5, collegeEducatedPct: 32, ownerOccupiedPct: 58, unemploymentRate: 4.0, povertyRate: 12.0, medianRent: 1450 },
  '891': { medianIncome: 55000, medianHomeValue: 380000, population: 40000, populationGrowthPct: 2.0, medianAge: 36.5, collegeEducatedPct: 28, ownerOccupiedPct: 52, unemploymentRate: 5.5, povertyRate: 14.0, medianRent: 1400 },
  '900': { medianIncome: 62000, medianHomeValue: 950000, population: 55000, populationGrowthPct: 0.5, medianAge: 36.0, collegeEducatedPct: 35, ownerOccupiedPct: 38, unemploymentRate: 5.5, povertyRate: 16.5, medianRent: 2500 },
  '920': { medianIncome: 78000, medianHomeValue: 750000, population: 42000, populationGrowthPct: 1.2, medianAge: 35.0, collegeEducatedPct: 42, ownerOccupiedPct: 50, unemploymentRate: 4.0, povertyRate: 10.5, medianRent: 2200 },
  '940': { medianIncome: 110000, medianHomeValue: 1400000, population: 48000, populationGrowthPct: 0.5, medianAge: 38.5, collegeEducatedPct: 55, ownerOccupiedPct: 38, unemploymentRate: 3.5, povertyRate: 10.0, medianRent: 3200 },
  '950': { medianIncome: 120000, medianHomeValue: 1300000, population: 50000, populationGrowthPct: 1.0, medianAge: 36.5, collegeEducatedPct: 52, ownerOccupiedPct: 52, unemploymentRate: 3.0, povertyRate: 8.5, medianRent: 3000 },
  '958': { medianIncome: 65000, medianHomeValue: 480000, population: 36000, populationGrowthPct: 1.5, medianAge: 35.0, collegeEducatedPct: 35, ownerOccupiedPct: 55, unemploymentRate: 4.5, povertyRate: 13.0, medianRent: 1600 },
  '972': { medianIncome: 68000, medianHomeValue: 500000, population: 40000, populationGrowthPct: 1.2, medianAge: 36.5, collegeEducatedPct: 42, ownerOccupiedPct: 52, unemploymentRate: 4.0, povertyRate: 12.0, medianRent: 1700 },
  '980': { medianIncome: 95000, medianHomeValue: 750000, population: 45000, populationGrowthPct: 1.5, medianAge: 35.5, collegeEducatedPct: 52, ownerOccupiedPct: 45, unemploymentRate: 3.5, povertyRate: 10.0, medianRent: 2200 },
};

/** Default demographics for zip codes not in our data. */
const DEFAULT_DEMOGRAPHICS: DemographicSeed = {
  medianIncome: 55000,
  medianHomeValue: 300000,
  population: 30000,
  populationGrowthPct: 0.5,
  medianAge: 37.0,
  collegeEducatedPct: 32,
  ownerOccupiedPct: 60,
  unemploymentRate: 4.5,
  povertyRate: 13.0,
  medianRent: 1200,
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch census/demographics data for a given zip code.
 *
 * MVP: Returns mock data correlated with the zip code using embedded profiles.
 * Values include small deterministic variations so different zips in the same
 * metro produce slightly different but realistic results.
 *
 * @param zip - 5-digit zip code string
 * @returns Demographics data for the area
 */
export async function fetchCensusData(zip: string): Promise<CensusData> {
  const prefix = zip.slice(0, 3);
  const base = DEMOGRAPHIC_SEEDS[prefix] ?? DEFAULT_DEMOGRAPHICS;

  // Apply small deterministic variation based on the full zip
  const hash = hashString(zip);
  const rng = seededRandom(hash);

  const vary = (value: number, pct: number): number => {
    const factor = 1 + (rng() - 0.5) * 2 * pct;
    return value * factor;
  };

  const varyInt = (value: number, pct: number): number =>
    Math.round(vary(value, pct));

  const varyPct = (value: number, spread: number): number => {
    const result = value + (rng() - 0.5) * 2 * spread;
    return Math.round(Math.max(0, Math.min(100, result)) * 10) / 10;
  };

  const varyRate = (value: number, spread: number): number => {
    const result = value + (rng() - 0.5) * 2 * spread;
    return Math.round(Math.max(0, result) * 10) / 10;
  };

  return {
    medianIncome: varyInt(base.medianIncome, 0.12),
    medianHomeValue: varyInt(base.medianHomeValue, 0.10),
    population: varyInt(base.population, 0.25),
    populationGrowthPct: varyRate(base.populationGrowthPct, 0.8),
    medianAge: Math.round(vary(base.medianAge, 0.08) * 10) / 10,
    collegeEducatedPct: varyPct(base.collegeEducatedPct, 5),
    ownerOccupiedPct: varyPct(base.ownerOccupiedPct, 5),
    unemploymentRate: varyRate(base.unemploymentRate, 1.0),
    povertyRate: varyRate(base.povertyRate, 2.0),
    medianRent: varyInt(base.medianRent, 0.10),
  };
}
