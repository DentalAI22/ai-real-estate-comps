import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { geocodeAddress } from '@/lib/data/geocoder';
import { getPropertyDetails } from '@/lib/data/property-api';

const searchSchema = z.object({
  address: z.string().min(3, 'Address must be at least 3 characters'),
});

/**
 * POST /api/search
 *
 * Receives an address string, geocodes it, fetches property details,
 * and returns the full PropertyDetails object.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = searchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { address } = parsed.data;

    // Geocode the address
    const geo = await geocodeAddress(address);

    // Get property details
    const property = await getPropertyDetails(address);

    // Merge geocoding data with property details
    const enrichedProperty = {
      ...property,
      lat: geo.lat,
      lng: geo.lng,
      city: geo.city !== 'Unknown' ? geo.city : property.city,
      state: geo.state !== 'Unknown' ? geo.state : property.state,
      zip: geo.zip !== '00000' ? geo.zip : property.zip,
      county: geo.county !== 'Unknown County' ? geo.county : property.county,
    };

    return NextResponse.json({
      property: enrichedProperty,
      geocoding: geo,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search property' },
      { status: 500 }
    );
  }
}
