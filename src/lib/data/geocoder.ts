/**
 * Geocoding service for address resolution.
 * MVP: Deterministic mock geocoding derived from the address string.
 * Production: Swap with Google Geocoding API, Mapbox, or Census Geocoder.
 */

import { hashString, seededRandom } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string;
  state: string;
  zip: string;
  county: string;
}

// ─── Known Metro Coordinates ───────────────────────────────────────────────────

interface MetroSeed {
  lat: number;
  lng: number;
  city: string;
  state: string;
  county: string;
}

/**
 * Seed data for major US metros, keyed by zip code prefix or state abbreviation.
 * Used to generate realistic lat/lng values for mock geocoding.
 */
const METRO_SEEDS: Record<string, MetroSeed> = {
  '100': { lat: 40.7128, lng: -74.006, city: 'New York', state: 'NY', county: 'New York County' },
  '102': { lat: 40.7128, lng: -74.006, city: 'New York', state: 'NY', county: 'New York County' },
  '112': { lat: 40.6782, lng: -73.9442, city: 'Brooklyn', state: 'NY', county: 'Kings County' },
  '200': { lat: 38.9072, lng: -77.0369, city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '206': { lat: 38.9072, lng: -77.0369, city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '300': { lat: 33.749, lng: -84.388, city: 'Atlanta', state: 'GA', county: 'Fulton County' },
  '330': { lat: 25.7617, lng: -80.1918, city: 'Miami', state: 'FL', county: 'Miami-Dade County' },
  '331': { lat: 26.1224, lng: -80.1373, city: 'Fort Lauderdale', state: 'FL', county: 'Broward County' },
  '334': { lat: 27.9506, lng: -82.4572, city: 'Tampa', state: 'FL', county: 'Hillsborough County' },
  '327': { lat: 28.5383, lng: -81.3792, city: 'Orlando', state: 'FL', county: 'Orange County' },
  '606': { lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL', county: 'Cook County' },
  '601': { lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL', county: 'Cook County' },
  '750': { lat: 32.7767, lng: -96.797, city: 'Dallas', state: 'TX', county: 'Dallas County' },
  '770': { lat: 29.7604, lng: -95.3698, city: 'Houston', state: 'TX', county: 'Harris County' },
  '782': { lat: 29.4241, lng: -98.4936, city: 'San Antonio', state: 'TX', county: 'Bexar County' },
  '787': { lat: 30.2672, lng: -97.7431, city: 'Austin', state: 'TX', county: 'Travis County' },
  '850': { lat: 33.4484, lng: -112.074, city: 'Phoenix', state: 'AZ', county: 'Maricopa County' },
  '852': { lat: 33.4484, lng: -112.074, city: 'Phoenix', state: 'AZ', county: 'Maricopa County' },
  '891': { lat: 36.1699, lng: -115.1398, city: 'Las Vegas', state: 'NV', county: 'Clark County' },
  '900': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '902': { lat: 33.8366, lng: -118.3406, city: 'Inglewood', state: 'CA', county: 'Los Angeles County' },
  '906': { lat: 34.0195, lng: -118.4912, city: 'Santa Monica', state: 'CA', county: 'Los Angeles County' },
  '910': { lat: 34.1425, lng: -118.2551, city: 'Glendale', state: 'CA', county: 'Los Angeles County' },
  '920': { lat: 32.7157, lng: -117.1611, city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '921': { lat: 32.7157, lng: -117.1611, city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '940': { lat: 37.7749, lng: -122.4194, city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '941': { lat: 37.7749, lng: -122.4194, city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '943': { lat: 37.4419, lng: -122.143, city: 'Palo Alto', state: 'CA', county: 'Santa Clara County' },
  '950': { lat: 37.3382, lng: -121.8863, city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '951': { lat: 33.9806, lng: -117.3755, city: 'Riverside', state: 'CA', county: 'Riverside County' },
  '958': { lat: 38.5816, lng: -121.4944, city: 'Sacramento', state: 'CA', county: 'Sacramento County' },
  '980': { lat: 47.6062, lng: -122.3321, city: 'Seattle', state: 'WA', county: 'King County' },
  '981': { lat: 47.6062, lng: -122.3321, city: 'Seattle', state: 'WA', county: 'King County' },
  '972': { lat: 45.5152, lng: -122.6784, city: 'Portland', state: 'OR', county: 'Multnomah County' },
  '802': { lat: 39.7392, lng: -104.9903, city: 'Denver', state: 'CO', county: 'Denver County' },
  '801': { lat: 39.7392, lng: -104.9903, city: 'Denver', state: 'CO', county: 'Denver County' },
  '551': { lat: 44.9778, lng: -93.265, city: 'Minneapolis', state: 'MN', county: 'Hennepin County' },
  '191': { lat: 39.9526, lng: -75.1652, city: 'Philadelphia', state: 'PA', county: 'Philadelphia County' },
  '021': { lat: 42.3601, lng: -71.0589, city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '481': { lat: 42.3314, lng: -83.0458, city: 'Detroit', state: 'MI', county: 'Wayne County' },
  '462': { lat: 39.7684, lng: -86.1581, city: 'Indianapolis', state: 'IN', county: 'Marion County' },
  '432': { lat: 39.9612, lng: -82.9988, city: 'Columbus', state: 'OH', county: 'Franklin County' },
  '282': { lat: 35.2271, lng: -80.8431, city: 'Charlotte', state: 'NC', county: 'Mecklenburg County' },
  '372': { lat: 36.1627, lng: -86.7816, city: 'Nashville', state: 'TN', county: 'Davidson County' },
  '631': { lat: 38.627, lng: -90.1994, city: 'St. Louis', state: 'MO', county: 'St. Louis City' },
  '641': { lat: 39.0997, lng: -94.5786, city: 'Kansas City', state: 'MO', county: 'Jackson County' },
  '841': { lat: 40.7608, lng: -111.891, city: 'Salt Lake City', state: 'UT', county: 'Salt Lake County' },
  '276': { lat: 35.7796, lng: -78.6382, city: 'Raleigh', state: 'NC', county: 'Wake County' },
  '294': { lat: 32.7765, lng: -79.9311, city: 'Charleston', state: 'SC', county: 'Charleston County' },
};

// ─── State Fallback Coordinates ────────────────────────────────────────────────

const STATE_FALLBACKS: Record<string, MetroSeed> = {
  AL: { lat: 33.5186, lng: -86.8104, city: 'Birmingham', state: 'AL', county: 'Jefferson County' },
  AR: { lat: 34.7465, lng: -92.2896, city: 'Little Rock', state: 'AR', county: 'Pulaski County' },
  CT: { lat: 41.7658, lng: -72.6734, city: 'Hartford', state: 'CT', county: 'Hartford County' },
  DE: { lat: 39.7391, lng: -75.5398, city: 'Wilmington', state: 'DE', county: 'New Castle County' },
  HI: { lat: 21.3069, lng: -157.8583, city: 'Honolulu', state: 'HI', county: 'Honolulu County' },
  IA: { lat: 41.5868, lng: -93.625, city: 'Des Moines', state: 'IA', county: 'Polk County' },
  KS: { lat: 37.6872, lng: -97.3301, city: 'Wichita', state: 'KS', county: 'Sedgwick County' },
  KY: { lat: 38.2527, lng: -85.7585, city: 'Louisville', state: 'KY', county: 'Jefferson County' },
  LA: { lat: 29.9511, lng: -90.0715, city: 'New Orleans', state: 'LA', county: 'Orleans Parish' },
  ME: { lat: 43.6591, lng: -70.2568, city: 'Portland', state: 'ME', county: 'Cumberland County' },
  MD: { lat: 39.2904, lng: -76.6122, city: 'Baltimore', state: 'MD', county: 'Baltimore City' },
  MS: { lat: 32.2988, lng: -90.1848, city: 'Jackson', state: 'MS', county: 'Hinds County' },
  MT: { lat: 46.8721, lng: -113.994, city: 'Missoula', state: 'MT', county: 'Missoula County' },
  NE: { lat: 41.2565, lng: -95.9345, city: 'Omaha', state: 'NE', county: 'Douglas County' },
  NH: { lat: 42.9956, lng: -71.4548, city: 'Manchester', state: 'NH', county: 'Hillsborough County' },
  NM: { lat: 35.0844, lng: -106.6504, city: 'Albuquerque', state: 'NM', county: 'Bernalillo County' },
  ND: { lat: 46.8772, lng: -96.7898, city: 'Fargo', state: 'ND', county: 'Cass County' },
  OK: { lat: 35.4676, lng: -97.5164, city: 'Oklahoma City', state: 'OK', county: 'Oklahoma County' },
  RI: { lat: 41.824, lng: -71.4128, city: 'Providence', state: 'RI', county: 'Providence County' },
  SD: { lat: 43.5446, lng: -96.7311, city: 'Sioux Falls', state: 'SD', county: 'Minnehaha County' },
  VT: { lat: 44.4759, lng: -73.2121, city: 'Burlington', state: 'VT', county: 'Chittenden County' },
  WV: { lat: 38.3498, lng: -81.6326, city: 'Charleston', state: 'WV', county: 'Kanawha County' },
  WI: { lat: 43.0389, lng: -87.9065, city: 'Milwaukee', state: 'WI', county: 'Milwaukee County' },
  WY: { lat: 41.14, lng: -104.8202, city: 'Cheyenne', state: 'WY', county: 'Laramie County' },
  AK: { lat: 61.2181, lng: -149.9003, city: 'Anchorage', state: 'AK', county: 'Anchorage Borough' },
  ID: { lat: 43.6187, lng: -116.2146, city: 'Boise', state: 'ID', county: 'Ada County' },
};

// ─── Address Parsing Helpers ───────────────────────────────────────────────────

const STATE_PATTERN =
  /\b(AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i;

const ZIP_PATTERN = /\b(\d{5})(?:-\d{4})?\b/;

/**
 * Extract a US state abbreviation from an address string.
 */
function extractState(address: string): string | null {
  const match = address.match(STATE_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Extract a 5-digit zip code from an address string.
 */
function extractZip(address: string): string | null {
  const match = address.match(ZIP_PATTERN);
  return match ? match[1] : null;
}

/**
 * Find the best metro seed for a given zip code by matching the first 3 digits.
 */
function findMetroSeed(zip: string | null, state: string | null): MetroSeed | null {
  if (zip) {
    const prefix = zip.slice(0, 3);
    if (METRO_SEEDS[prefix]) return METRO_SEEDS[prefix];
  }
  if (state && STATE_FALLBACKS[state]) {
    return STATE_FALLBACKS[state];
  }
  // Default to geographic center of US
  return null;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Geocode an address string to coordinates and parsed components.
 *
 * MVP Implementation: Uses deterministic mock geocoding.
 * - Extracts zip and state from the address string.
 * - Looks up the nearest metro seed from embedded data.
 * - Applies small deterministic offsets based on the address hash so
 *   different addresses in the same zip produce slightly different coordinates.
 *
 * @param address - A US street address string (e.g., "123 Main St, Austin, TX 78701")
 * @returns Geocoding result with coordinates and parsed address components
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  const zip = extractZip(address);
  const state = extractState(address);
  const metro = findMetroSeed(zip, state);

  const hash = hashString(address);
  const rng = seededRandom(hash);

  // Base coordinates from metro seed or US center
  const baseLat = metro?.lat ?? 39.8283;
  const baseLng = metro?.lng ?? -98.5795;

  // Apply small deterministic offsets (within ~0.5 miles)
  const latOffset = (rng() - 0.5) * 0.015;
  const lngOffset = (rng() - 0.5) * 0.015;

  // Parse city from address if possible, otherwise use metro city
  const parts = address.split(',').map((p) => p.trim());
  let city = metro?.city ?? 'Unknown';
  if (parts.length >= 2) {
    // The part before the state/zip is usually the city
    city = parts[parts.length - 2] || city;
    // Clean up in case city is just a number (street number)
    if (/^\d+$/.test(city) && parts.length >= 3) {
      city = metro?.city ?? 'Unknown';
    }
  }

  const county = metro?.county ?? 'Unknown County';

  return {
    lat: Math.round((baseLat + latOffset) * 10000) / 10000,
    lng: Math.round((baseLng + lngOffset) * 10000) / 10000,
    formattedAddress: address.trim(),
    city: city,
    state: state ?? metro?.state ?? 'Unknown',
    zip: zip ?? '00000',
    county,
  };
}
