import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getComparableSales } from '@/lib/data/property-api';

const compsSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radiusMiles: z.number().min(0.1).max(10).optional().default(3),
  monthsBack: z.number().min(1).max(36).optional().default(12),
  propertyType: z.string().optional(),
});

/**
 * POST /api/comps
 *
 * Receives lat/lng and search parameters, returns comparable sales
 * from the property data API (mock data for MVP).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = compsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { lat, lng, radiusMiles, monthsBack, propertyType } = parsed.data;

    const comps = await getComparableSales(
      lat,
      lng,
      radiusMiles,
      monthsBack,
      propertyType
    );

    return NextResponse.json({
      comps,
      meta: {
        total: comps.length,
        radiusMiles,
        monthsBack,
        searchCenter: { lat, lng },
      },
    });
  } catch (error) {
    console.error('Comps API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparable sales' },
      { status: 500 }
    );
  }
}
