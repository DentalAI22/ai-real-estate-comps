/**
 * Property data API wrapper.
 * Uses ATTOM Data API for real property details and comparable sales.
 * Falls back to realistic mock data when ATTOM_API_KEY is not configured.
 */

import type { PropertyDetails, PropertyType, CompSale, PriceSource, DocumentType, LoanType } from '@/types';
import { hashString, seededRandom, calculateDistance, generateId } from '@/lib/utils';

// ─── ATTOM Data API ────────────────────────────────────────────────────────────

const ATTOM_BASE_URL = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

async function attomFetch(endpoint: string, params: Record<string, string>) {
  const apiKey = process.env.ATTOM_API_KEY;
  if (!apiKey) throw new Error('ATTOM_API_KEY not configured');

  const url = new URL(`${ATTOM_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'apikey': apiKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ATTOM API ${res.status}: ${text}`);
  }

  return res.json();
}

// ─── Real Property Details (ATTOM) ─────────────────────────────────────────────

async function getPropertyDetailsFromAttom(address: string): Promise<PropertyDetails> {
  // ATTOM wants address split: address1 = street, address2 = city, state zip
  const parts = address.split(',').map(p => p.trim());
  const street = parts[0] || address;
  const cityStateZip = parts.slice(1).join(', ').trim();

  const data = await attomFetch('/property/detail', {
    address1: street,
    address2: cityStateZip,
  });

  const prop = data?.property?.[0];
  if (!prop) throw new Error('No property found at ATTOM');

  const addr = prop.address || {};
  const building = prop.building || {};
  const lot = prop.lot || {};
  const assessment = prop.assessment || {};
  const sale = prop.sale || {};
  const summary = prop.summary || {};

  return {
    address: addr.oneLine || address,
    city: addr.locality || 'Unknown',
    state: addr.countrySubd || 'Unknown',
    zip: addr.postal1 || '00000',
    county: addr.countrySecSubd || 'Unknown County',
    lat: prop.location?.latitude || 0,
    lng: prop.location?.longitude || 0,
    apn: summary.abbrLegal || prop.identifier?.apn || '',
    propertyType: mapAttomPropertyType(summary.proptype || building.summary?.propclass),
    bedrooms: building.rooms?.beds || 0,
    bathrooms: building.rooms?.bathsfull || 0,
    sqft: building.size?.livingsize || building.size?.bldgsize || 0,
    lotSqft: lot.lotsize1 || lot.lotsize2 || 0,
    yearBuilt: summary.yearbuilt || building.summary?.yearbuilt || 0,
    stories: building.summary?.levels || 1,
    garage: building.parking?.prkgType || 'Unknown',
    pool: !!(building.interior?.fplccount),
    assessedValue: assessment.assessed?.assdttlvalue || 0,
    taxAmount: assessment.tax?.taxamt || 0,
    lastSaleDate: sale.salesHistory?.[0]?.amount?.salerecdate || '',
    lastSalePrice: sale.salesHistory?.[0]?.amount?.saleamt || 0,
    dataSource: 'ATTOM',
  };
}

function mapAttomPropertyType(attomType: string | undefined): PropertyType {
  if (!attomType) return 'SFR';
  const lower = attomType.toLowerCase();
  if (lower.includes('condo') || lower.includes('co-op')) return 'Condo';
  if (lower.includes('town')) return 'Townhome';
  return 'SFR';
}

// ─── Real Comparable Sales (ATTOM) ─────────────────────────────────────────────

async function getCompsFromAttom(
  lat: number,
  lng: number,
  radiusMiles: number,
  monthsBack: number,
  propertyType?: string
): Promise<CompSale[]> {
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  const data = await attomFetch('/sale/snapshot', {
    latitude: String(lat),
    longitude: String(lng),
    radius: String(radiusMiles),
    minSaleAmt: '10000',
    startSaleSearchDate: startDate.toISOString().split('T')[0],
    endSaleSearchDate: endDate.toISOString().split('T')[0],
    pagesize: '25',
  });

  const sales = data?.property || [];

  return sales.map((prop: any) => {
    const addr = prop.address || {};
    const building = prop.building || {};
    const sale = prop.sale || {};
    const amount = sale.amount || {};
    const lot = prop.lot || {};
    const location = prop.location || {};

    const compLat = location.latitude || lat;
    const compLng = location.longitude || lng;
    const distance = calculateDistance(lat, lng, compLat, compLng);

    const salePrice = amount.saleamt || 0;
    const sqft = building.size?.livingsize || building.size?.bldgsize || 0;

    // Confidence score based on distance and recency
    const saleDate = amount.salerecdate ? new Date(amount.salerecdate) : new Date();
    const daysAgo = Math.floor((Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
    const distancePenalty = Math.max(0, 1 - distance / radiusMiles);
    const recencyBonus = Math.max(0, 1 - daysAgo / (monthsBack * 30));
    const confidence = Math.round((distancePenalty * 0.5 + recencyBonus * 0.5) * 100);

    return {
      id: generateId(),
      address: addr.oneLine || `${addr.line1 || 'Unknown'}`,
      city: addr.locality || 'Unknown',
      state: addr.countrySubd || 'Unknown',
      zip: addr.postal1 || '00000',
      lat: compLat,
      lng: compLng,
      propertyType: mapAttomPropertyType(prop.summary?.proptype),
      bedrooms: building.rooms?.beds || 0,
      bathrooms: building.rooms?.bathsfull || 0,
      sqft,
      lotSqft: lot.lotsize1 || 0,
      yearBuilt: prop.summary?.yearbuilt || 0,
      stories: building.summary?.levels || 1,
      garage: building.parking?.prkgType || 'Unknown',
      pool: false,
      salePrice,
      saleDate: amount.salerecdate || '',
      priceSource: 'PublicRecords' as PriceSource,
      confidenceScore: Math.min(confidence, 100),
      distanceFromSubject: Math.round(distance * 100) / 100,
      documentType: (amount.saletranstype || 'Warranty Deed') as DocumentType,
      transferTax: null,
      loanAmount: sale.mortgage?.amount || null,
      loanType: (sale.mortgage?.loantype || 'Conventional') as LoanType,
      adjustments: {
        sqft: 0, bedrooms: 0, bathrooms: 0, age: 0,
        lot: 0, pool: 0, garage: 0, condition: 0,
        location: 0, marketConditions: 0,
      },
      adjustedValue: salePrice,
      daysOnMarket: 0,
      listPrice: salePrice,
      mlsNumber: '',
    } as CompSale;
  }).sort((a: CompSale, b: CompSale) => a.distanceFromSubject - b.distanceFromSubject);
}

// ─── Public API (with fallback to mock) ────────────────────────────────────────

/**
 * Get property details for a given address.
 * Uses ATTOM Data API when configured, falls back to mock data.
 */
export async function getPropertyDetails(address: string): Promise<PropertyDetails> {
  if (process.env.ATTOM_API_KEY) {
    try {
      return await getPropertyDetailsFromAttom(address);
    } catch (error) {
      console.error('ATTOM property lookup failed, using mock:', error);
    }
  }
  return getMockPropertyDetails(address);
}

/**
 * Retrieve comparable sales near a given location.
 * Uses ATTOM Data API when configured, falls back to mock data.
 */
export async function getComparableSales(
  lat: number,
  lng: number,
  radiusMiles: number = 3,
  monthsBack: number = 12,
  propertyType?: string
): Promise<CompSale[]> {
  if (process.env.ATTOM_API_KEY) {
    try {
      return await getCompsFromAttom(lat, lng, radiusMiles, monthsBack, propertyType);
    } catch (error) {
      console.error('ATTOM comps lookup failed, using mock:', error);
    }
  }
  return getMockComparableSales(lat, lng, radiusMiles, monthsBack, propertyType);
}

// ─── Transfer Tax Calculations (kept from original) ────────────────────────────

const TRANSFER_TAX_RATES: Record<string, number> = {
  AL: 0.50, AZ: 0, AR: 3.30, CA: 1.10, CO: 0.01, CT: 7.50,
  DE: 4.00, DC: 1.45, FL: 7.00, GA: 1.00, HI: 0.10, IL: 1.00,
  IA: 1.60, KY: 0.50, MD: 5.00, MA: 4.56, MI: 8.60, MN: 3.30,
  NE: 2.25, NV: 2.55, NH: 7.50, NJ: 4.00, NY: 4.00, NC: 2.00,
  OH: 4.00, OK: 0.75, OR: 1.00, PA: 10.00, RI: 4.60, SC: 1.85,
  SD: 1.00, TN: 3.70, VT: 6.25, VA: 2.50, WA: 1.28, WV: 3.30,
  WI: 3.00,
};

export function calculateSalePriceFromTransferTax(transferTax: number, stateCode: string): number {
  const rate = TRANSFER_TAX_RATES[stateCode.toUpperCase()];
  if (!rate || rate === 0) return 0;
  return Math.round((transferTax / rate) * 1000);
}

export function estimateSalePriceNonDisclosure(
  mortgageAmount: number, loanType: string, assessedValue: number
): number {
  const ltvRatios: Record<string, number> = {
    Conventional: 0.80, FHA: 0.965, VA: 1.0, USDA: 1.0,
    Jumbo: 0.75, Cash: 0, SellerFinanced: 0.85, Unknown: 0.80,
  };
  const ltv = ltvRatios[loanType] ?? 0.80;
  if (mortgageAmount > 0 && ltv > 0) {
    const mortgageEstimate = Math.round(mortgageAmount / ltv);
    if (assessedValue > 0) {
      const assessedEstimate = Math.round(assessedValue / 0.85);
      return Math.round(mortgageEstimate * 0.7 + assessedEstimate * 0.3);
    }
    return mortgageEstimate;
  }
  if (assessedValue > 0) return Math.round(assessedValue / 0.85);
  return 0;
}

// ─── Mock Data Generators (unchanged, used as fallback) ────────────────────────

const MARKET_PROFILES: Record<string, { medianPrice: number; pricePerSqft: number; typicalSqft: number; typicalBeds: number; typicalBaths: number; typicalYearBuilt: number; typicalLot: number }> = {
  '100': { medianPrice: 850000, pricePerSqft: 750, typicalSqft: 1100, typicalBeds: 2, typicalBaths: 1, typicalYearBuilt: 1940, typicalLot: 2000 },
  '200': { medianPrice: 550000, pricePerSqft: 350, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1960, typicalLot: 5000 },
  '300': { medianPrice: 350000, pricePerSqft: 195, typicalSqft: 1800, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1990, typicalLot: 7000 },
  '330': { medianPrice: 500000, pricePerSqft: 350, typicalSqft: 1400, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1985, typicalLot: 6000 },
  '606': { medianPrice: 350000, pricePerSqft: 220, typicalSqft: 1600, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1955, typicalLot: 4500 },
  '750': { medianPrice: 380000, pricePerSqft: 190, typicalSqft: 2000, typicalBeds: 3, typicalBaths: 2.5, typicalYearBuilt: 2000, typicalLot: 8000 },
  '770': { medianPrice: 320000, pricePerSqft: 160, typicalSqft: 2000, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1998, typicalLot: 7500 },
  '787': { medianPrice: 450000, pricePerSqft: 260, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 2005, typicalLot: 7000 },
  '850': { medianPrice: 400000, pricePerSqft: 230, typicalSqft: 1750, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 2002, typicalLot: 7000 },
  '900': { medianPrice: 950000, pricePerSqft: 650, typicalSqft: 1450, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1960, typicalLot: 6500 },
  '940': { medianPrice: 1400000, pricePerSqft: 1000, typicalSqft: 1400, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1945, typicalLot: 5000 },
  '980': { medianPrice: 750000, pricePerSqft: 450, typicalSqft: 1650, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1975, typicalLot: 5500 },
};

const DEFAULT_PROFILE = { medianPrice: 350000, pricePerSqft: 180, typicalSqft: 1800, typicalBeds: 3, typicalBaths: 2, typicalYearBuilt: 1990, typicalLot: 7000 };

const STREET_NAMES = ['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Park', 'Lake', 'Hill', 'Walnut', 'Spring', 'Meadow', 'Forest', 'Ridge', 'Valley', 'Sunset', 'Cherry', 'Highland', 'Fairview'];
const STREET_SUFFIXES = ['St', 'Ave', 'Dr', 'Ln', 'Ct', 'Way', 'Pl', 'Blvd', 'Rd', 'Cir'];
const PROPERTY_TYPES: PropertyType[] = ['SFR', 'Condo', 'Townhome'];
const PRICE_SOURCES: PriceSource[] = ['PublicRecords', 'CountyRecorder'];
const DOCUMENT_TYPES: DocumentType[] = ['Warranty Deed', 'Grant Deed', 'Special Warranty Deed'];
const LOAN_TYPES: LoanType[] = ['Conventional', 'FHA', 'VA', 'Jumbo', 'Cash'];
const GARAGE_TYPES = ['None', '1 Car Attached', '2 Car Attached', '2 Car Detached', '3 Car Attached'];

function getMarketProfile(zip: string) {
  return MARKET_PROFILES[zip.slice(0, 3)] ?? DEFAULT_PROFILE;
}

function getMockPropertyDetails(address: string): PropertyDetails {
  const hash = hashString(address);
  const rng = seededRandom(hash);
  const zipMatch = address.match(/\b(\d{5})\b/);
  const zip = zipMatch ? zipMatch[1] : '78701';
  const profile = getMarketProfile(zip);
  const stateMatch = address.match(/\b(AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i);
  const state = stateMatch ? stateMatch[1].toUpperCase() : 'TX';
  const parts = address.split(',').map(p => p.trim());
  const city = parts.length >= 2 ? parts[1] : 'Austin';
  const sqft = Math.round(profile.typicalSqft * (0.7 + rng() * 0.6) / 50) * 50;
  const beds = Math.max(1, Math.round(profile.typicalBeds + (rng() - 0.5) * 2));
  const baths = Math.max(1, Math.round((profile.typicalBaths + (rng() - 0.5)) * 2) / 2);
  const yearBuilt = Math.round(profile.typicalYearBuilt + (rng() - 0.5) * 40);
  const lotSqft = Math.round(profile.typicalLot * (0.6 + rng() * 0.8) / 100) * 100;
  const assessedValue = Math.round(profile.medianPrice * (0.7 + rng() * 0.3) / 1000) * 1000;
  const taxAmount = Math.round(assessedValue * (0.008 + rng() * 0.015));
  const yearsAgo = 1 + Math.floor(rng() * 10);
  const lastSaleDate = new Date();
  lastSaleDate.setFullYear(lastSaleDate.getFullYear() - yearsAgo);
  const lastSalePrice = Math.round(profile.medianPrice / (1 + yearsAgo * (0.03 + rng() * 0.04)) / 1000) * 1000;

  return {
    address: address.trim(), city, state, zip,
    county: `${city} County`, lat: 0, lng: 0,
    apn: `${Math.floor(rng() * 900 + 100)}-${Math.floor(rng() * 900 + 100)}-${Math.floor(rng() * 9000 + 1000)}`,
    propertyType: rng() > 0.8 ? 'Condo' : 'SFR',
    bedrooms: beds, bathrooms: baths, sqft, lotSqft, yearBuilt,
    stories: rng() > 0.6 ? 2 : 1,
    garage: GARAGE_TYPES[Math.floor(rng() * GARAGE_TYPES.length)],
    pool: rng() > 0.75, assessedValue, taxAmount,
    lastSaleDate: lastSaleDate.toISOString().split('T')[0],
    lastSalePrice,
    dataSource: 'EstimatedData',
  };
}

function getMockComparableSales(lat: number, lng: number, radiusMiles: number, monthsBack: number, propertyType?: string): CompSale[] {
  const coordSeed = hashString(`${lat.toFixed(4)},${lng.toFixed(4)}`);
  const rng = seededRandom(coordSeed);
  const compCount = 5 + Math.floor(rng() * 11);
  const comps: CompSale[] = [];
  const now = new Date();

  for (let i = 0; i < compCount; i++) {
    const compRng = seededRandom(coordSeed + i * 7919);
    const distance = Math.round(compRng() * compRng() * radiusMiles * 100) / 100;
    const bearing = compRng() * 2 * Math.PI;
    const compLat = lat + (Math.cos(bearing) * distance) / 69.0;
    const compLng = lng + (Math.sin(bearing) * distance) / (Math.cos(lat * Math.PI / 180) * 69.0);
    const daysBack = Math.floor(compRng() * monthsBack * 30);
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - daysBack);
    const sqft = Math.round(1800 * (0.7 + compRng() * 0.6) / 50) * 50;
    const beds = Math.max(1, Math.round(3 + (compRng() - 0.5) * 2));
    const baths = Math.max(1, Math.round((2 + (compRng() - 0.5)) * 2) / 2);
    const salePrice = Math.round(350000 * (sqft / 1800) * (0.85 + compRng() * 0.30) / 1000) * 1000;
    const confidence = Math.round((Math.max(0, 1 - distance / radiusMiles) * 0.4 + Math.max(0, 1 - daysBack / (monthsBack * 30)) * 0.4 + compRng() * 0.2) * 100);
    const streetNum = 100 + Math.floor(compRng() * 9900);
    const streetName = STREET_NAMES[Math.floor(compRng() * STREET_NAMES.length)];
    const streetSuffix = STREET_SUFFIXES[Math.floor(compRng() * STREET_SUFFIXES.length)];
    const dom = 5 + Math.floor(compRng() * 90);
    const listPrice = Math.round(salePrice * (1 + (compRng() - 0.3) * 0.06) / 1000) * 1000;

    comps.push({
      id: generateId(),
      address: `${streetNum} ${streetName} ${streetSuffix}`,
      city: 'Nearby', state: 'XX', zip: '00000',
      lat: Math.round(compLat * 10000) / 10000, lng: Math.round(compLng * 10000) / 10000,
      propertyType: (propertyType as PropertyType) || PROPERTY_TYPES[Math.floor(compRng() * PROPERTY_TYPES.length)],
      bedrooms: beds, bathrooms: baths, sqft,
      lotSqft: Math.round(7000 * (0.6 + compRng() * 0.8) / 100) * 100,
      yearBuilt: Math.round(1990 + (compRng() - 0.5) * 40),
      stories: compRng() > 0.6 ? 2 : 1,
      garage: GARAGE_TYPES[Math.floor(compRng() * GARAGE_TYPES.length)],
      pool: compRng() > 0.78,
      salePrice, saleDate: saleDate.toISOString().split('T')[0],
      priceSource: PRICE_SOURCES[Math.floor(compRng() * PRICE_SOURCES.length)],
      confidenceScore: Math.min(confidence, 100),
      distanceFromSubject: distance,
      documentType: DOCUMENT_TYPES[Math.floor(compRng() * DOCUMENT_TYPES.length)],
      transferTax: null,
      loanAmount: Math.round(salePrice * (0.7 + compRng() * 0.25) / 1000) * 1000,
      loanType: LOAN_TYPES[Math.floor(compRng() * LOAN_TYPES.length)],
      adjustments: { sqft: 0, bedrooms: 0, bathrooms: 0, age: 0, lot: 0, pool: 0, garage: 0, condition: 0, location: 0, marketConditions: 0 },
      adjustedValue: salePrice,
      daysOnMarket: dom, listPrice,
      mlsNumber: `MLS-${Math.floor(compRng() * 9000000 + 1000000)}`,
    });
  }

  return comps.sort((a, b) => a.distanceFromSubject - b.distanceFromSubject);
}
