import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/autocomplete?input=...
 *
 * Proxies address autocomplete requests to Google Places Autocomplete API.
 * Returns a list of address suggestions for the search box.
 */
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input');

  if (!input || input.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    // Fallback: use Census Geocoder for free autocomplete-like behavior
    return handleCensusFallback(input);
  }

  try {
    // Use Google Places Autocomplete (New) API
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('types', 'address');
    url.searchParams.set('components', 'country:us');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return handleCensusFallback(input);
    }

    const suggestions = (data.predictions || []).map((p: any, i: number) => ({
      id: p.place_id || String(i),
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || '',
      placeId: p.place_id,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return handleCensusFallback(input);
  }
}

/**
 * Fallback: Use the free Census Bureau geocoder for address matching.
 * Not as good as Google Places but works without API keys.
 */
async function handleCensusFallback(input: string) {
  try {
    const url = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');
    url.searchParams.set('address', input);
    url.searchParams.set('benchmark', 'Public_AR_Current');
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString());
    const data = await res.json();

    const matches = data?.result?.addressMatches || [];
    const suggestions = matches.slice(0, 5).map((m: any, i: number) => ({
      id: String(i),
      description: m.matchedAddress,
      mainText: m.matchedAddress.split(',')[0] || m.matchedAddress,
      secondaryText: m.matchedAddress.split(',').slice(1).join(',').trim(),
      placeId: null,
      coordinates: m.coordinates ? {
        lat: m.coordinates.y,
        lng: m.coordinates.x,
      } : null,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Census geocoder fallback error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
