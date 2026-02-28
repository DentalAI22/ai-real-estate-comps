/**
 * Geocoding service for address resolution.
 * Uses Google Geocoding API when available, falls back to US Census Bureau geocoder (free).
 */

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

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Geocode an address string to coordinates and parsed components.
 *
 * Strategy:
 * 1. Try Google Geocoding API if GOOGLE_MAPS_API_KEY is set
 * 2. Fall back to US Census Bureau geocoder (free, no key needed)
 *
 * @param address - A US street address string (e.g., "123 Main St, Austin, TX 78701")
 * @returns Geocoding result with coordinates and parsed address components
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;

  if (googleKey) {
    try {
      return await geocodeWithGoogle(address, googleKey);
    } catch (error) {
      console.error('Google geocoding failed, falling back to Census:', error);
    }
  }

  // Fallback: Census Bureau geocoder (always free)
  try {
    return await geocodeWithCensus(address);
  } catch (error) {
    console.error('Census geocoding failed:', error);
    // Last resort: parse what we can from the address string
    return parseAddressManually(address);
  }
}

// ─── Google Geocoding ──────────────────────────────────────────────────────────

async function geocodeWithGoogle(address: string, apiKey: string): Promise<GeocodingResult> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('components', 'country:US');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error(`Google Geocoding: ${data.status} - ${data.error_message || 'No results'}`);
  }

  const result = data.results[0];
  const location = result.geometry.location;
  const components = result.address_components || [];

  // Extract address parts from Google's structured response
  const city = extractComponent(components, ['locality', 'sublocality', 'administrative_area_level_3']) || 'Unknown';
  const state = extractComponent(components, ['administrative_area_level_1'], true) || 'Unknown';
  const zip = extractComponent(components, ['postal_code']) || '00000';
  const county = extractComponent(components, ['administrative_area_level_2']) || 'Unknown County';

  return {
    lat: Math.round(location.lat * 10000) / 10000,
    lng: Math.round(location.lng * 10000) / 10000,
    formattedAddress: result.formatted_address || address,
    city,
    state,
    zip,
    county,
  };
}

/**
 * Extract a component value from Google's address_components array.
 */
function extractComponent(
  components: any[],
  types: string[],
  useShortName = false
): string | null {
  for (const type of types) {
    const comp = components.find((c: any) => c.types?.includes(type));
    if (comp) return useShortName ? comp.short_name : comp.long_name;
  }
  return null;
}

// ─── Census Bureau Geocoding (Free) ────────────────────────────────────────────

async function geocodeWithCensus(address: string): Promise<GeocodingResult> {
  const url = new URL('https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress');
  url.searchParams.set('address', address);
  url.searchParams.set('benchmark', 'Public_AR_Current');
  url.searchParams.set('vintage', 'Current_Current');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  const data = await res.json();

  const matches = data?.result?.addressMatches;
  if (!matches?.length) {
    throw new Error('Census geocoder: No address matches found');
  }

  const match = matches[0];
  const coords = match.coordinates;
  const addr = match.addressComponents || {};
  const geo = match.geographies || {};

  // Extract county from Census geographies
  let county = 'Unknown County';
  const counties = geo['Counties'] || geo['Census Tracts'];
  if (counties?.length) {
    county = counties[0].NAME || counties[0].BASENAME || 'Unknown County';
    if (!county.includes('County') && !county.includes('Parish') && !county.includes('Borough')) {
      county = `${county} County`;
    }
  }

  return {
    lat: Math.round(coords.y * 10000) / 10000,
    lng: Math.round(coords.x * 10000) / 10000,
    formattedAddress: match.matchedAddress || address,
    city: addr.city || 'Unknown',
    state: addr.state || 'Unknown',
    zip: addr.zip || '00000',
    county,
  };
}

// ─── Manual Fallback Parser ────────────────────────────────────────────────────

const STATE_PATTERN =
  /\b(AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i;

const ZIP_PATTERN = /\b(\d{5})(?:-\d{4})?\b/;

function parseAddressManually(address: string): GeocodingResult {
  const stateMatch = address.match(STATE_PATTERN);
  const zipMatch = address.match(ZIP_PATTERN);
  const parts = address.split(',').map((p) => p.trim());

  return {
    lat: 0,
    lng: 0,
    formattedAddress: address,
    city: parts.length >= 2 ? parts[parts.length - 2] : 'Unknown',
    state: stateMatch ? stateMatch[1].toUpperCase() : 'Unknown',
    zip: zipMatch ? zipMatch[1] : '00000',
    county: 'Unknown County',
  };
}
