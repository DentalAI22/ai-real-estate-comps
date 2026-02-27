/**
 * Property data API wrapper.
 * MVP: Generates realistic mock property data seeded by address/zip.
 * Production: Swap with ATTOM, CoreLogic, or Zillow Bridge API.
 */

import type { PropertyDetails, PropertyType, CompSale, PriceSource, DocumentType, LoanType } from '@/types';
import { hashString, seededRandom, calculateDistance, generateId } from '@/lib/utils';

// ─── Embedded Price Data by Zip Prefix ─────────────────────────────────────────

/**
 * Median home prices and typical property characteristics for ~50 major US zip code prefixes.
 * Used to produce realistic mock data that varies by market.
 */
interface MarketProfile {
  medianPrice: number;
  pricePerSqft: number;
  typicalSqft: number;
  typicalBeds: number;
  typicalBaths: number;
  typicalYearBuilt: number;
  typicalLot: number;
}

const MARKET_PROFILES: Record<string, MarketProfile> = {
  '100': { medianPrice: 850000, pricePerSqft: 750, typicalSqft: 1100, typicalBeds: 2, typicalBaths: 1, typicalYearBuilt: 1940, typicalLot: 2000 },
  '102': { medianPrice: 900000, pricePerSqft: 800, typicalSqft: 1100, typicalBeds: 2, typicalBaths: 1, typicalYearBuilt: 1935, typicalLot: 1800 },
  '112': { medianPrice: 750000, pricePerSqft: 600, typicalSqft: 1200, typicalBeds: 3, typicalBaths: 1.5, typicalYearBuilt: 1950, typicalLot: 2500 },
  '200': { medianPrice: 550000, pricePerSqft: 350, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1960, typicalLot: 5000 },
  '206': { medianPrice: 600000, pricePerSqft: 380, typicalSqft: 1500, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1955, typicalLot: 4500 },
  '021': { medianPrice: 650000, pricePerSqft: 420, typicalSqft: 1500, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1945, typicalLot: 4000 },
  '191': { medianPrice: 350000, pricePerSqft: 210, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1950, typicalLot: 3500 },
  '276': { medianPrice: 380000, pricePerSqft: 185, typicalSqft: 2000, typicalBeds: 3, typicalBaths: 2.5, typicalYearBuilt: 2005, typicalLot: 8000 },
  '282': { medianPrice: 375000, pricePerSqft: 190, typicalSqft: 1950, typicalBeds: 3, typicalBaths: 2.5, typicalYearBuilt: 2003, typicalLot: 7500 },
  '294': { medianPrice: 420000, pricePerSqft: 225, typicalSqft: 1850, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1985, typicalLot: 6000 },
  '300': { medianPrice: 350000, pricePerSqft: 195, typicalSqft: 1800, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1990, typicalLot: 7000 },
  '327': { medianPrice: 350000, pricePerSqft: 200, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 2000, typicalLot: 7000 },
  '330': { medianPrice: 500000, pricePerSqft: 350, typicalSqft: 1400, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1985, typicalLot: 6000 },
  '331': { medianPrice: 450000, pricePerSqft: 300, typicalSqft: 1500, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1988, typicalLot: 6500 },
  '334': { medianPrice: 340000, pricePerSqft: 210, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1995, typicalLot: 7000 },
  '372': { medianPrice: 400000, pricePerSqft: 230, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2.5, typicalYearBuilt: 2002, typicalLot: 7500 },
  '432': { medianPrice: 280000, pricePerSqft: 155, typicalSqft: 1800, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1985, typicalLot: 8000 },
  '462': { medianPrice: 260000, pricePerSqft: 145, typicalSqft: 1800, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1980, typicalLot: 8000 },
  '481': { medianPrice: 220000, pricePerSqft: 120, typicalSqft: 1800, typicalBeds: 3, typicalBaths: 1.5, typicalYearBuilt: 1960, typicalLot: 6000 },
  '551': { medianPrice: 330000, pricePerSqft: 190, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1970, typicalLot: 7000 },
  '601': { medianPrice: 320000, pricePerSqft: 200, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1965, typicalLot: 5000 },
  '606': { medianPrice: 350000, pricePerSqft: 220, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1955, typicalLot: 4500 },
  '631': { medianPrice: 240000, pricePerSqft: 130, typicalSqft: 1850, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1970, typicalLot: 7000 },
  '641': { medianPrice: 260000, pricePerSqft: 140, typicalSqft: 1850, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1975, typicalLot: 8000 },
  '750': { medianPrice: 380000, pricePerSqft: 190, typicalSqft: 2000, typicalBeds: 3, typicalBaths: 2.5, typicalYearBuilt: 2000, typicalLot: 8000 },
  '770': { medianPrice: 320000, pricePerSqft: 160, typicalSqft: 2000, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1998, typicalLot: 7500 },
  '782': { medianPrice: 280000, pricePerSqft: 150, typicalSqft: 1850, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1995, typicalLot: 7000 },
  '787': { medianPrice: 450000, pricePerSqft: 260, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 2005, typicalLot: 7000 },
  '801': { medianPrice: 520000, pricePerSqft: 300, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1985, typicalLot: 6000 },
  '802': { medianPrice: 540000, pricePerSqft: 310, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1980, typicalLot: 6000 },
  '841': { medianPrice: 450000, pricePerSqft: 240, typicalSqft: 1900, typicalBeds: 4, typicalBaths: 2.5, typicalYearBuilt: 2000, typicalLot: 8000 },
  '850': { medianPrice: 400000, pricePerSqft: 230, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 2002, typicalLot: 7000 },
  '852': { medianPrice: 420000, pricePerSqft: 240, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 2000, typicalLot: 7000 },
  '891': { medianPrice: 380000, pricePerSqft: 220, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 2005, typicalLot: 6000 },
  '900': { medianPrice: 950000, pricePerSqft: 650, typicalSqft: 1450, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1960, typicalLot: 6500 },
  '902': { medianPrice: 750000, pricePerSqft: 550, typicalSqft: 1350, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1955, typicalLot: 5500 },
  '906': { medianPrice: 1600000, pricePerSqft: 900, typicalSqft: 1800, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1955, typicalLot: 7000 },
  '910': { medianPrice: 850000, pricePerSqft: 580, typicalSqft: 1500, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1958, typicalLot: 6000 },
  '920': { medianPrice: 750000, pricePerSqft: 480, typicalSqft: 1550, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1985, typicalLot: 6500 },
  '921': { medianPrice: 780000, pricePerSqft: 500, typicalSqft: 1550, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1990, typicalLot: 6500 },
  '940': { medianPrice: 1400000, pricePerSqft: 1000, typicalSqft: 1400, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1945, typicalLot: 5000 },
  '941': { medianPrice: 1500000, pricePerSqft: 1050, typicalSqft: 1400, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1940, typicalLot: 4500 },
  '943': { medianPrice: 2200000, pricePerSqft: 1200, typicalSqft: 1800, typicalBeds: 3, typicalBaths: 2.5, typicalYearBuilt: 1960, typicalLot: 7000 },
  '950': { medianPrice: 1300000, pricePerSqft: 800, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1970, typicalLot: 6000 },
  '951': { medianPrice: 550000, pricePerSqft: 280, typicalSqft: 1950, typicalBeds: 4, typicalBaths: 2.5, typicalYearBuilt: 2002, typicalLot: 7500 },
  '958': { medianPrice: 480000, pricePerSqft: 300, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1985, typicalLot: 6500 },
  '972': { medianPrice: 500000, pricePerSqft: 290, typicalSqft: 1700, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1975, typicalLot: 6500 },
  '980': { medianPrice: 750000, pricePerSqft: 450, typicalSqft: 1650, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1975, typicalLot: 5500 },
  '981': { medianPrice: 700000, pricePerSqft: 420, typicalSqft: 1650, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1978, typicalLot: 6000 },
};

/** Default market profile for zip codes not in our data. */
const DEFAULT_PROFILE: MarketProfile = {
  medianPrice: 350000,
  pricePerSqft: 180,
  typicalSqft: 1800,
  typicalBeds: 3,
  typicalBaths: 2,
  typicalYearBuilt: 1990,
  typicalLot: 7000,
};

/**
 * Look up the market profile for a zip code.
 */
function getMarketProfile(zip: string): MarketProfile {
  const prefix = zip.slice(0, 3);
  return MARKET_PROFILES[prefix] ?? DEFAULT_PROFILE;
}

// ─── Street Name Data for Comp Generation ──────────────────────────────────────

const STREET_NAMES = [
  'Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Park',
  'Lake', 'Hill', 'Walnut', 'Spring', 'Meadow', 'Forest', 'Ridge', 'Valley',
  'Sunset', 'Cherry', 'Highland', 'Fairview', 'Lincoln', 'Jackson', 'Franklin',
  'Adams', 'Jefferson', 'Madison', 'Monroe', 'Harrison', 'Taylor', 'Wilson',
  'Grant', 'Cleveland', 'Birch', 'Willow', 'Dogwood', 'Magnolia', 'Laurel',
  'Peach', 'Hickory', 'Cypress', 'Poplar', 'Ash', 'Chestnut', 'Holly',
];

const STREET_SUFFIXES = [
  'St', 'Ave', 'Dr', 'Ln', 'Ct', 'Way', 'Pl', 'Blvd', 'Rd', 'Cir',
];

const PROPERTY_TYPES: PropertyType[] = ['SFR', 'Condo', 'Townhome'];

const PRICE_SOURCES: PriceSource[] = [
  'PublicRecords', 'CountyRecorder', 'Redfin', 'Zillow', 'Realtor',
];

const DOCUMENT_TYPES: DocumentType[] = [
  'Warranty Deed', 'Grant Deed', 'Special Warranty Deed',
];

const LOAN_TYPES: LoanType[] = [
  'Conventional', 'FHA', 'VA', 'Jumbo', 'Cash',
];

const GARAGE_TYPES = [
  'None', '1 Car Attached', '2 Car Attached', '2 Car Detached', '3 Car Attached',
];

// ─── Transfer Tax Calculation ──────────────────────────────────────────────────

/**
 * State transfer tax rates per $1,000 of sale price.
 * Some states have county-level rates; these are rough state averages.
 */
const TRANSFER_TAX_RATES: Record<string, number> = {
  AL: 0.50, AZ: 0, AR: 3.30, CA: 1.10, CO: 0.01, CT: 7.50,
  DE: 4.00, DC: 1.45, FL: 7.00, GA: 1.00, HI: 0.10, IL: 1.00,
  IA: 1.60, KY: 0.50, MD: 5.00, MA: 4.56, MI: 8.60, MN: 3.30,
  NE: 2.25, NV: 2.55, NH: 7.50, NJ: 4.00, NY: 4.00, NC: 2.00,
  OH: 4.00, OK: 0.75, OR: 1.00, PA: 10.00, RI: 4.60, SC: 1.85,
  SD: 1.00, TN: 3.70, VT: 6.25, VA: 2.50, WA: 1.28, WV: 3.30,
  WI: 3.00,
};

/**
 * Calculate an estimated sale price from the transfer tax paid.
 * Only works in disclosure states that record transfer tax.
 *
 * @param transferTax - The dollar amount of transfer tax paid
 * @param stateCode - Two-letter state abbreviation
 * @returns Estimated sale price in dollars
 */
export function calculateSalePriceFromTransferTax(
  transferTax: number,
  stateCode: string
): number {
  const rate = TRANSFER_TAX_RATES[stateCode.toUpperCase()];
  if (!rate || rate === 0) return 0;
  // transferTax = (salePrice / 1000) * rate
  // salePrice = (transferTax / rate) * 1000
  return Math.round((transferTax / rate) * 1000);
}

/**
 * Estimate a sale price in a non-disclosure state using mortgage and assessment data.
 *
 * Uses typical LTV ratios by loan type and the assessed value as a cross-check.
 *
 * @param mortgageAmount - The recorded mortgage/deed of trust amount
 * @param loanType - The type of loan (Conventional, FHA, VA, etc.)
 * @param assessedValue - The county-assessed property value
 * @returns Estimated sale price in dollars
 */
export function estimateSalePriceNonDisclosure(
  mortgageAmount: number,
  loanType: string,
  assessedValue: number
): number {
  // Typical LTV ratios
  const ltvRatios: Record<string, number> = {
    Conventional: 0.80,
    FHA: 0.965,
    VA: 1.0,
    USDA: 1.0,
    Jumbo: 0.75,
    Cash: 0,
    SellerFinanced: 0.85,
    Unknown: 0.80,
  };

  const ltv = ltvRatios[loanType] ?? 0.80;

  if (mortgageAmount > 0 && ltv > 0) {
    const mortgageEstimate = Math.round(mortgageAmount / ltv);

    // Cross-check with assessed value (typically 80-100% of market value)
    if (assessedValue > 0) {
      const assessedEstimate = Math.round(assessedValue / 0.85);
      // Weighted average: mortgage data is more reliable
      return Math.round(mortgageEstimate * 0.7 + assessedEstimate * 0.3);
    }

    return mortgageEstimate;
  }

  // Fallback to assessed value only
  if (assessedValue > 0) {
    return Math.round(assessedValue / 0.85);
  }

  return 0;
}

// ─── Mock Data Generators ──────────────────────────────────────────────────────

/**
 * Get property details for a given address.
 *
 * MVP: Generates realistic mock data seeded by the address string.
 * Production: Query ATTOM, CoreLogic, or county records APIs.
 */
export async function getPropertyDetails(
  address: string
): Promise<PropertyDetails> {
  const hash = hashString(address);
  const rng = seededRandom(hash);

  // Extract zip from address or generate one
  const zipMatch = address.match(/\b(\d{5})\b/);
  const zip = zipMatch ? zipMatch[1] : '78701';
  const profile = getMarketProfile(zip);

  // Extract state
  const stateMatch = address.match(
    /\b(AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i
  );
  const state = stateMatch ? stateMatch[1].toUpperCase() : 'TX';

  // Extract city from address
  const parts = address.split(',').map((p) => p.trim());
  const city = parts.length >= 2 ? parts[1] : 'Austin';

  // Generate property attributes around the market profile
  const sqftVariance = 0.7 + rng() * 0.6; // 70-130% of typical
  const sqft = Math.round(profile.typicalSqft * sqftVariance / 50) * 50;
  const beds = Math.max(1, Math.round(profile.typicalBeds + (rng() - 0.5) * 2));
  const baths = Math.max(1, Math.round((profile.typicalBaths + (rng() - 0.5)) * 2) / 2);
  const yearBuilt = Math.round(profile.typicalYearBuilt + (rng() - 0.5) * 40);
  const lotSqft = Math.round(profile.typicalLot * (0.6 + rng() * 0.8) / 100) * 100;
  const stories = rng() > 0.6 ? 2 : 1;
  const pool = rng() > 0.75;
  const garageIdx = Math.floor(rng() * GARAGE_TYPES.length);
  const propertyType: PropertyType = rng() > 0.8 ? 'Condo' : rng() > 0.9 ? 'Townhome' : 'SFR';

  const assessedValue = Math.round(profile.medianPrice * (0.7 + rng() * 0.3) / 1000) * 1000;
  const taxRate = 0.008 + rng() * 0.015; // 0.8% to 2.3%
  const taxAmount = Math.round(assessedValue * taxRate);

  // Last sale in past 1-10 years
  const yearsAgo = 1 + Math.floor(rng() * 10);
  const lastSaleDate = new Date();
  lastSaleDate.setFullYear(lastSaleDate.getFullYear() - yearsAgo);
  const appreciation = 1 + yearsAgo * (0.03 + rng() * 0.04); // 3-7% per year
  const lastSalePrice = Math.round(profile.medianPrice / appreciation / 1000) * 1000;

  // Generate lat/lng deterministically from zip
  const zipHash = hashString(zip);
  const zipRng = seededRandom(zipHash);
  const baseLat = 25 + zipRng() * 22; // Rough US latitude range
  const baseLng = -(70 + zipRng() * 50); // Rough US longitude range

  return {
    address: address.trim(),
    city,
    state,
    zip,
    county: `${city} County`,
    lat: Math.round((baseLat + (rng() - 0.5) * 0.01) * 10000) / 10000,
    lng: Math.round((baseLng + (rng() - 0.5) * 0.01) * 10000) / 10000,
    apn: `${Math.floor(rng() * 900 + 100)}-${Math.floor(rng() * 900 + 100)}-${Math.floor(rng() * 9000 + 1000)}`,
    propertyType,
    bedrooms: beds,
    bathrooms: baths,
    sqft,
    lotSqft,
    yearBuilt,
    stories,
    garage: GARAGE_TYPES[garageIdx],
    pool,
    assessedValue,
    taxAmount,
    lastSaleDate: lastSaleDate.toISOString().split('T')[0],
    lastSalePrice,
    dataSource: 'MockPublicRecords',
  };
}

/**
 * Retrieve comparable sales near a given location.
 *
 * MVP: Generates 5-15 realistic comps seeded by the coordinates.
 * Comps have prices within +-15% of the area median, appropriate features,
 * sale dates spread over the specified date range, and proper distance calculations.
 *
 * @param lat - Subject property latitude
 * @param lng - Subject property longitude
 * @param radiusMiles - Search radius in miles (default 3)
 * @param monthsBack - How many months back to search (default 12)
 * @param propertyType - Filter to a specific property type (optional)
 * @returns Array of comparable sales
 */
export async function getComparableSales(
  lat: number,
  lng: number,
  radiusMiles: number = 3,
  monthsBack: number = 12,
  propertyType?: string
): Promise<CompSale[]> {
  // Seed from coordinates for determinism
  const coordSeed = hashString(`${lat.toFixed(4)},${lng.toFixed(4)}`);
  const rng = seededRandom(coordSeed);

  // Determine the market from approximate zip (reverse lookup via lat)
  // Approximate: use the coordinates to find the closest market profile
  const estimatedZipPrefix = estimateZipPrefix(lat, lng);
  const profile = MARKET_PROFILES[estimatedZipPrefix] ?? DEFAULT_PROFILE;

  const compCount = 5 + Math.floor(rng() * 11); // 5-15 comps
  const comps: CompSale[] = [];

  const now = new Date();

  for (let i = 0; i < compCount; i++) {
    const compRng = seededRandom(coordSeed + i * 7919); // Different seed per comp

    // Distance: random within radius, biased closer
    const distance = Math.round(compRng() * compRng() * radiusMiles * 100) / 100;

    // Bearing for generating lat/lng offset
    const bearing = compRng() * 2 * Math.PI;
    const milesPerDegreeLat = 69.0;
    const milesPerDegreeLng = Math.cos(lat * Math.PI / 180) * 69.0;
    const compLat = lat + (Math.cos(bearing) * distance) / milesPerDegreeLat;
    const compLng = lng + (Math.sin(bearing) * distance) / milesPerDegreeLng;

    // Sale date: random within monthsBack range
    const daysBack = Math.floor(compRng() * monthsBack * 30);
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - daysBack);

    // Property characteristics: similar to market profile with variance
    const sqftFactor = 0.7 + compRng() * 0.6;
    const sqft = Math.round(profile.typicalSqft * sqftFactor / 50) * 50;
    const beds = Math.max(1, Math.round(profile.typicalBeds + (compRng() - 0.5) * 2));
    const baths = Math.max(1, Math.round((profile.typicalBaths + (compRng() - 0.5)) * 2) / 2);
    const yearBuilt = Math.round(profile.typicalYearBuilt + (compRng() - 0.5) * 40);
    const lotSqft = Math.round(profile.typicalLot * (0.6 + compRng() * 0.8) / 100) * 100;
    const stories = compRng() > 0.6 ? 2 : 1;
    const pool = compRng() > 0.78;
    const garageIdx = Math.floor(compRng() * GARAGE_TYPES.length);

    // Sale price: within +-15% of area median, adjusted for size
    const sizeAdjustment = sqft / profile.typicalSqft;
    const priceVariance = 0.85 + compRng() * 0.30; // 85-115% of median
    const salePrice = Math.round(
      profile.medianPrice * sizeAdjustment * priceVariance / 1000
    ) * 1000;

    const pType: PropertyType = propertyType
      ? (propertyType as PropertyType)
      : PROPERTY_TYPES[Math.floor(compRng() * PROPERTY_TYPES.length)];

    // Generate a realistic address
    const streetNum = 100 + Math.floor(compRng() * 9900);
    const streetName = STREET_NAMES[Math.floor(compRng() * STREET_NAMES.length)];
    const streetSuffix = STREET_SUFFIXES[Math.floor(compRng() * STREET_SUFFIXES.length)];

    // Confidence score: higher for closer, more recent comps
    const distancePenalty = Math.max(0, 1 - distance / radiusMiles);
    const recencyBonus = Math.max(0, 1 - daysBack / (monthsBack * 30));
    const confidence = Math.round((distancePenalty * 0.4 + recencyBonus * 0.4 + compRng() * 0.2) * 100);

    const priceSource: PriceSource = PRICE_SOURCES[Math.floor(compRng() * PRICE_SOURCES.length)];
    const documentType: DocumentType = DOCUMENT_TYPES[Math.floor(compRng() * DOCUMENT_TYPES.length)];
    const loanType: LoanType = LOAN_TYPES[Math.floor(compRng() * LOAN_TYPES.length)];

    const loanAmount = loanType === 'Cash' ? null : Math.round(salePrice * (0.7 + compRng() * 0.25) / 1000) * 1000;
    const transferTax = compRng() > 0.5 ? Math.round(salePrice * 0.004 * 100) / 100 : null;

    const dom = 5 + Math.floor(compRng() * 90);
    const listPrice = Math.round(salePrice * (1 + (compRng() - 0.3) * 0.06) / 1000) * 1000;

    comps.push({
      id: generateId(),
      address: `${streetNum} ${streetName} ${streetSuffix}`,
      city: 'Nearby City',
      state: 'XX',
      zip: '00000',
      lat: Math.round(compLat * 10000) / 10000,
      lng: Math.round(compLng * 10000) / 10000,
      propertyType: pType,
      bedrooms: beds,
      bathrooms: baths,
      sqft,
      lotSqft,
      yearBuilt,
      stories,
      garage: GARAGE_TYPES[garageIdx],
      pool,
      salePrice,
      saleDate: saleDate.toISOString().split('T')[0],
      priceSource,
      confidenceScore: Math.min(confidence, 100),
      distanceFromSubject: distance,
      documentType,
      transferTax,
      loanAmount,
      loanType,
      adjustments: {
        sqft: 0,
        bedrooms: 0,
        bathrooms: 0,
        age: 0,
        lot: 0,
        pool: 0,
        garage: 0,
        condition: 0,
        location: 0,
        marketConditions: 0,
      },
      adjustedValue: salePrice,
      daysOnMarket: dom,
      listPrice,
      mlsNumber: `MLS-${Math.floor(compRng() * 9000000 + 1000000)}`,
    });
  }

  // Sort by distance
  comps.sort((a, b) => a.distanceFromSubject - b.distanceFromSubject);

  return comps;
}

/**
 * Estimate a 3-digit zip prefix from lat/lng coordinates.
 * Uses a simple nearest-metro lookup for the MVP.
 */
function estimateZipPrefix(lat: number, lng: number): string {
  const metros: { prefix: string; lat: number; lng: number }[] = [
    { prefix: '100', lat: 40.7128, lng: -74.006 },
    { prefix: '021', lat: 42.3601, lng: -71.0589 },
    { prefix: '191', lat: 39.9526, lng: -75.1652 },
    { prefix: '200', lat: 38.9072, lng: -77.0369 },
    { prefix: '282', lat: 35.2271, lng: -80.8431 },
    { prefix: '300', lat: 33.749, lng: -84.388 },
    { prefix: '330', lat: 25.7617, lng: -80.1918 },
    { prefix: '334', lat: 27.9506, lng: -82.4572 },
    { prefix: '372', lat: 36.1627, lng: -86.7816 },
    { prefix: '432', lat: 39.9612, lng: -82.9988 },
    { prefix: '462', lat: 39.7684, lng: -86.1581 },
    { prefix: '481', lat: 42.3314, lng: -83.0458 },
    { prefix: '551', lat: 44.9778, lng: -93.265 },
    { prefix: '606', lat: 41.8781, lng: -87.6298 },
    { prefix: '631', lat: 38.627, lng: -90.1994 },
    { prefix: '641', lat: 39.0997, lng: -94.5786 },
    { prefix: '750', lat: 32.7767, lng: -96.797 },
    { prefix: '770', lat: 29.7604, lng: -95.3698 },
    { prefix: '787', lat: 30.2672, lng: -97.7431 },
    { prefix: '802', lat: 39.7392, lng: -104.9903 },
    { prefix: '841', lat: 40.7608, lng: -111.891 },
    { prefix: '850', lat: 33.4484, lng: -112.074 },
    { prefix: '891', lat: 36.1699, lng: -115.1398 },
    { prefix: '900', lat: 34.0522, lng: -118.2437 },
    { prefix: '920', lat: 32.7157, lng: -117.1611 },
    { prefix: '940', lat: 37.7749, lng: -122.4194 },
    { prefix: '950', lat: 37.3382, lng: -121.8863 },
    { prefix: '958', lat: 38.5816, lng: -121.4944 },
    { prefix: '972', lat: 45.5152, lng: -122.6784 },
    { prefix: '980', lat: 47.6062, lng: -122.3321 },
  ];

  let closest = metros[0];
  let minDist = Infinity;

  for (const metro of metros) {
    const dist = calculateDistance(lat, lng, metro.lat, metro.lng);
    if (dist < minDist) {
      minDist = dist;
      closest = metro;
    }
  }

  return closest.prefix;
}
