/**
 * Crime data fetcher.
 * MVP: Mock data inversely correlated with median income (via zip code).
 * Production: Swap with FBI UCR API, CrimeMapping, or NeighborhoodScout data.
 */

import type { CrimeData } from '@/types';
import { hashString, seededRandom } from '@/lib/utils';

// ─── Income Estimates by Zip Prefix ────────────────────────────────────────────

/**
 * Approximate median income by zip prefix, used to inversely correlate crime rates.
 * Higher income areas get lower crime rates.
 */
const INCOME_BY_PREFIX: Record<string, number> = {
  '100': 72000,
  '021': 80000,
  '191': 48000,
  '200': 90000,
  '276': 65000,
  '282': 62000,
  '300': 60000,
  '327': 55000,
  '330': 52000,
  '334': 55000,
  '372': 62000,
  '432': 55000,
  '462': 50000,
  '481': 42000,
  '551': 65000,
  '606': 60000,
  '631': 52000,
  '641': 55000,
  '750': 68000,
  '770': 60000,
  '787': 72000,
  '802': 75000,
  '841': 68000,
  '850': 60000,
  '891': 55000,
  '900': 62000,
  '920': 78000,
  '940': 110000,
  '950': 120000,
  '958': 65000,
  '972': 68000,
  '980': 95000,
};

const DEFAULT_INCOME = 55000;

// ─── National Baseline Rates ───────────────────────────────────────────────────

/**
 * National average crime rates per 100,000 population (approximate FBI UCR data).
 */
const NATIONAL_VIOLENT_RATE = 380; // per 100k
const NATIONAL_PROPERTY_RATE = 2100; // per 100k
const NATIONAL_CRIME_INDEX = 270; // composite index (100 = safest, 500+ = most dangerous)

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch crime statistics for a given zip code.
 *
 * MVP: Generates deterministic mock crime data inversely correlated with the
 * area's estimated median income. Higher income areas have lower crime rates,
 * with realistic variation applied per-zip.
 *
 * The crime index uses a 100-500+ scale where:
 * - Under 200: Very low crime
 * - 200-300: Below average / average
 * - 300-400: Above average
 * - 400+: High crime
 *
 * @param zip - 5-digit zip code string
 * @returns Crime statistics for the area
 */
export async function fetchCrimeData(zip: string): Promise<CrimeData> {
  const prefix = zip.slice(0, 3);
  const income = INCOME_BY_PREFIX[prefix] ?? DEFAULT_INCOME;

  const hash = hashString(`crime:${zip}`);
  const rng = seededRandom(hash);

  // Income factor: higher income = lower crime
  // Normalize income to 0-1 range (30k = 0, 130k = 1)
  const incomeFactor = Math.max(0, Math.min(1, (income - 30000) / 100000));

  // Crime multiplier: inversely correlated with income
  // Low income (factor ~0) => multiplier ~1.8
  // High income (factor ~1) => multiplier ~0.4
  const crimeMultiplier = 1.8 - incomeFactor * 1.4;

  // Apply per-zip variation (±20%)
  const variation = 0.8 + rng() * 0.4;
  const adjustedMultiplier = crimeMultiplier * variation;

  const violentCrimeRate = Math.round(
    NATIONAL_VIOLENT_RATE * adjustedMultiplier
  );
  const propertyCrimeRate = Math.round(
    NATIONAL_PROPERTY_RATE * adjustedMultiplier
  );
  const crimeIndex = Math.round(
    NATIONAL_CRIME_INDEX * adjustedMultiplier
  );

  // Determine comparison to national average
  let comparedToNational: CrimeData['comparedToNational'];
  const totalRate = violentCrimeRate + propertyCrimeRate;
  const nationalTotal = NATIONAL_VIOLENT_RATE + NATIONAL_PROPERTY_RATE;

  if (totalRate < nationalTotal * 0.85) {
    comparedToNational = 'lower';
  } else if (totalRate > nationalTotal * 1.15) {
    comparedToNational = 'higher';
  } else {
    comparedToNational = 'average';
  }

  return {
    violentCrimeRate,
    propertyCrimeRate,
    crimeIndex,
    comparedToNational,
    year: new Date().getFullYear() - 1,
  };
}
