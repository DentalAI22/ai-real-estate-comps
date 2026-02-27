/**
 * Comparable sale analysis engine.
 * Implements rule-based adjustments using standard appraisal methodology.
 * MVP: Pure rule-based approach (no AI dependency).
 * Production: Can be enhanced with AI for condition/location nuance.
 */

import type { PropertyDetails, CompSale, CompAdjustments } from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AdjustmentBreakdown {
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  age: number;
  lot: number;
  pool: number;
  garage: number;
  condition: number;
  location: number;
  marketConditions: number;
  total: number;
  adjustedValue: number;
  grossAdjustment: number;
  grossAdjustmentPct: number;
  qualityRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface AnalyzedComp extends CompSale {
  adjustmentBreakdown: AdjustmentBreakdown;
}

// ─── Market-Sensitive Adjustment Rates ─────────────────────────────────────────

/**
 * Determine the price-per-sqft adjustment rate based on the market price level.
 * Expensive markets get higher per-sqft adjustments.
 */
function getPerSqftRate(medianPrice: number): number {
  if (medianPrice >= 1000000) return 275;
  if (medianPrice >= 700000) return 225;
  if (medianPrice >= 500000) return 185;
  if (medianPrice >= 350000) return 150;
  if (medianPrice >= 250000) return 125;
  return 100;
}

/**
 * Determine bedroom adjustment based on market price level.
 */
function getBedroomRate(medianPrice: number): number {
  if (medianPrice >= 1000000) return 15000;
  if (medianPrice >= 500000) return 12000;
  if (medianPrice >= 300000) return 8000;
  return 5000;
}

/**
 * Determine bathroom adjustment based on market price level.
 */
function getBathroomRate(medianPrice: number): number {
  if (medianPrice >= 1000000) return 12000;
  if (medianPrice >= 500000) return 10000;
  if (medianPrice >= 300000) return 7000;
  return 5000;
}

/**
 * Determine pool adjustment based on climate (latitude as a proxy).
 */
function getPoolRate(subjectLat: number): number {
  // Sun Belt (roughly below 36N): pools are more valuable
  if (subjectLat < 33) return 28000;
  if (subjectLat < 36) return 22000;
  if (subjectLat < 40) return 15000;
  return 10000; // Northern climates: pools add less value
}

/**
 * Determine per-year age adjustment.
 * Diminishing impact for homes older than 50 years.
 */
function getAgeAdjustment(subjectYear: number, compYear: number): number {
  const diff = subjectYear - compYear; // Positive means subject is newer
  const absDiff = Math.abs(diff);

  let perYear: number;
  if (absDiff <= 5) perYear = 2000;
  else if (absDiff <= 15) perYear = 1800;
  else if (absDiff <= 30) perYear = 1500;
  else perYear = 1000; // Diminishing returns for very old homes

  // If comp is older than subject, comp needs upward adjustment (positive)
  // If comp is newer than subject, comp needs downward adjustment (negative)
  return diff * perYear;
}

/**
 * Parse garage string into number of car spaces.
 */
function parseGarageSpaces(garage: string): number {
  if (!garage || garage.toLowerCase() === 'none') return 0;
  const match = garage.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Determine garage adjustment rate.
 */
function getGarageRate(subjectLat: number): number {
  // Cold climates value garages more
  if (subjectLat > 42) return 15000;
  if (subjectLat > 38) return 12000;
  return 8000;
}

/**
 * Calculate market conditions (time) adjustment.
 * Uses a standard annual appreciation rate based on recent market trends.
 */
function getMarketConditionsAdjustment(
  salePrice: number,
  saleDate: string,
  annualAppreciationRate: number = 0.04
): number {
  const now = new Date();
  const sale = new Date(saleDate);
  const monthsElapsed =
    (now.getFullYear() - sale.getFullYear()) * 12 +
    (now.getMonth() - sale.getMonth());

  if (monthsElapsed <= 0) return 0;

  // Monthly rate from annual
  const monthlyRate = annualAppreciationRate / 12;
  const adjustment = Math.round(salePrice * monthlyRate * monthsElapsed);

  return adjustment; // Positive = older sale needs upward adjustment
}

/**
 * Estimate a location adjustment based on distance from subject.
 * Closer comps are assumed to be in more similar locations.
 */
function getLocationAdjustment(
  salePrice: number,
  distanceMiles: number
): number {
  // Very close comps (<0.5mi): no location adjustment
  if (distanceMiles < 0.5) return 0;

  // Slight adjustment for moderate distance (0.5-2 mi)
  if (distanceMiles < 2) {
    // Small random-like adjustment based on distance
    return Math.round(salePrice * (distanceMiles - 0.5) * 0.005) * -1;
  }

  // Larger adjustment for distant comps (2+ mi)
  return Math.round(salePrice * Math.min(distanceMiles * 0.01, 0.05)) * -1;
}

/**
 * Estimate lot size adjustment.
 * Uses per-sqft rate that varies with the overall market.
 */
function getLotAdjustment(
  subjectLotSqft: number,
  compLotSqft: number,
  medianPrice: number
): number {
  const diff = subjectLotSqft - compLotSqft;
  if (Math.abs(diff) < 500) return 0; // Ignore trivial differences

  // Per-sqft lot rate: higher in expensive/dense markets
  let perSqft: number;
  if (medianPrice >= 1000000) return diff * 8;
  if (medianPrice >= 500000) return diff * 5;
  if (medianPrice >= 300000) return diff * 3;
  return diff * 1.5;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Calculate a full adjustment breakdown for a single comp against the subject.
 *
 * Adjustments are made TO the comp TO make it comparable TO the subject.
 * A positive adjustment means the comp was inferior in that feature
 * (e.g., smaller, fewer beds) and needs its price adjusted upward.
 *
 * @param subject - The subject property being valued
 * @param comp - A comparable sale to analyze
 * @param annualAppreciation - Optional annual appreciation rate (default 4%)
 * @returns Detailed adjustment breakdown with quality rating
 */
export function calculateAdjustments(
  subject: PropertyDetails,
  comp: CompSale,
  annualAppreciation: number = 0.04
): AdjustmentBreakdown {
  const medianPrice = (subject.assessedValue / 0.85) || comp.salePrice;

  // 1. Square footage adjustment
  const sqftDiff = subject.sqft - comp.sqft;
  const perSqftRate = getPerSqftRate(medianPrice);
  const sqftAdj = sqftDiff * perSqftRate;

  // 2. Bedroom adjustment
  const bedDiff = subject.bedrooms - comp.bedrooms;
  const bedroomAdj = bedDiff * getBedroomRate(medianPrice);

  // 3. Bathroom adjustment
  const bathDiff = subject.bathrooms - comp.bathrooms;
  const bathroomAdj = bathDiff * getBathroomRate(medianPrice);

  // 4. Age/Year Built adjustment
  const ageAdj = getAgeAdjustment(subject.yearBuilt, comp.yearBuilt);

  // 5. Lot size adjustment
  const lotAdj = getLotAdjustment(subject.lotSqft, comp.lotSqft, medianPrice);

  // 6. Pool adjustment
  let poolAdj = 0;
  if (subject.pool && !comp.pool) {
    poolAdj = getPoolRate(subject.lat); // Comp lacks pool, adjust up
  } else if (!subject.pool && comp.pool) {
    poolAdj = -getPoolRate(subject.lat); // Comp has pool subject doesn't, adjust down
  }

  // 7. Garage adjustment
  const subjectGarageSpaces = parseGarageSpaces(subject.garage);
  const compGarageSpaces = parseGarageSpaces(comp.garage);
  const garageDiff = subjectGarageSpaces - compGarageSpaces;
  const garageAdj = garageDiff * getGarageRate(subject.lat);

  // 8. Condition adjustment
  // Estimated from age difference and price point
  // Newer homes with higher prices are assumed to be in better condition
  let conditionAdj = 0;
  const ageDiff = Math.abs(subject.yearBuilt - comp.yearBuilt);
  if (ageDiff > 20) {
    conditionAdj = subject.yearBuilt > comp.yearBuilt ? 8000 : -8000;
  } else if (ageDiff > 10) {
    conditionAdj = subject.yearBuilt > comp.yearBuilt ? 4000 : -4000;
  }

  // 9. Location adjustment
  const locationAdj = getLocationAdjustment(
    comp.salePrice,
    comp.distanceFromSubject
  );

  // 10. Market conditions (time) adjustment
  const marketAdj = getMarketConditionsAdjustment(
    comp.salePrice,
    comp.saleDate,
    annualAppreciation
  );

  // Totals
  const adjustments = [
    sqftAdj, bedroomAdj, bathroomAdj, ageAdj, lotAdj,
    poolAdj, garageAdj, conditionAdj, locationAdj, marketAdj,
  ];
  const total = adjustments.reduce((sum, adj) => sum + adj, 0);
  const grossAdjustment = adjustments.reduce(
    (sum, adj) => sum + Math.abs(adj),
    0
  );
  const grossAdjustmentPct =
    comp.salePrice > 0
      ? Math.round((grossAdjustment / comp.salePrice) * 1000) / 10
      : 0;

  const adjustedValue = comp.salePrice + total;

  // Quality rating based on gross adjustment %, distance, and recency
  let qualityRating: AdjustmentBreakdown['qualityRating'];
  const monthsAgo = getMonthsAgo(comp.saleDate);

  if (
    grossAdjustmentPct <= 10 &&
    comp.distanceFromSubject < 1 &&
    monthsAgo <= 6
  ) {
    qualityRating = 'Excellent';
  } else if (
    grossAdjustmentPct <= 20 &&
    comp.distanceFromSubject < 2 &&
    monthsAgo <= 9
  ) {
    qualityRating = 'Good';
  } else if (grossAdjustmentPct <= 30 && comp.distanceFromSubject < 3) {
    qualityRating = 'Fair';
  } else {
    qualityRating = 'Poor';
  }

  return {
    sqft: Math.round(sqftAdj),
    bedrooms: Math.round(bedroomAdj),
    bathrooms: Math.round(bathroomAdj),
    age: Math.round(ageAdj),
    lot: Math.round(lotAdj),
    pool: Math.round(poolAdj),
    garage: Math.round(garageAdj),
    condition: Math.round(conditionAdj),
    location: Math.round(locationAdj),
    marketConditions: Math.round(marketAdj),
    total: Math.round(total),
    adjustedValue: Math.round(adjustedValue),
    grossAdjustment: Math.round(grossAdjustment),
    grossAdjustmentPct,
    qualityRating,
  };
}

/**
 * Analyze all comps against the subject property.
 * Calculates adjustments for each comp and sorts by quality.
 *
 * @param subject - The subject property being valued
 * @param comps - Array of comparable sales
 * @param annualAppreciation - Optional annual appreciation rate (default 4%)
 * @returns Array of comps with adjustment breakdowns and updated adjustedValue
 */
export function analyzeComps(
  subject: PropertyDetails,
  comps: CompSale[],
  annualAppreciation: number = 0.04
): AnalyzedComp[] {
  return comps
    .map((comp) => {
      const breakdown = calculateAdjustments(
        subject,
        comp,
        annualAppreciation
      );

      // Update the comp's adjustments and adjustedValue
      const updatedComp: AnalyzedComp = {
        ...comp,
        adjustments: {
          sqft: breakdown.sqft,
          bedrooms: breakdown.bedrooms,
          bathrooms: breakdown.bathrooms,
          age: breakdown.age,
          lot: breakdown.lot,
          pool: breakdown.pool,
          garage: breakdown.garage,
          condition: breakdown.condition,
          location: breakdown.location,
          marketConditions: breakdown.marketConditions,
        },
        adjustedValue: breakdown.adjustedValue,
        adjustmentBreakdown: breakdown,
      };

      return updatedComp;
    })
    .sort((a, b) => {
      // Sort by quality: Excellent > Good > Fair > Poor
      const qualityOrder = { Excellent: 0, Good: 1, Fair: 2, Poor: 3 };
      const qDiff =
        qualityOrder[a.adjustmentBreakdown.qualityRating] -
        qualityOrder[b.adjustmentBreakdown.qualityRating];
      if (qDiff !== 0) return qDiff;

      // Within same quality, sort by gross adjustment % (lower is better)
      return (
        a.adjustmentBreakdown.grossAdjustmentPct -
        b.adjustmentBreakdown.grossAdjustmentPct
      );
    });
}

/**
 * Calculate the number of months between a date and today.
 */
function getMonthsAgo(dateStr: string): number {
  const now = new Date();
  const date = new Date(dateStr);
  return (
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth())
  );
}
