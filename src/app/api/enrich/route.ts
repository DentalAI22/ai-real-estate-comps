import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashString, seededRandom } from '@/lib/utils';

const enrichSchema = z.object({
  zip: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

/**
 * POST /api/enrich
 *
 * Returns enrichment data for a given location including
 * demographics, school data, and crime statistics.
 * MVP: Generates realistic mock data based on the location.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = enrichSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { zip, lat, lng } = parsed.data;

    // Generate deterministic mock data based on location
    const seed = hashString(`${zip || ''}${lat || ''}${lng || ''}`);
    const rng = seededRandom(seed);

    const demographics = {
      medianIncome: Math.round((50000 + rng() * 100000) / 1000) * 1000,
      medianAge: Math.round(28 + rng() * 20),
      population: Math.round(10000 + rng() * 100000),
      populationDensity: Math.round(500 + rng() * 10000),
      medianHomeValue: Math.round((200000 + rng() * 800000) / 1000) * 1000,
      homeOwnershipRate: Math.round((0.3 + rng() * 0.5) * 100) / 100,
      walkScore: Math.round(20 + rng() * 80),
      transitScore: Math.round(10 + rng() * 70),
      bikeScore: Math.round(15 + rng() * 75),
      nearbyAmenities: [
        {
          name: 'City Park',
          type: 'Park',
          distance: Math.round(rng() * 2 * 10) / 10,
        },
        {
          name: 'Main Street Grocery',
          type: 'Grocery',
          distance: Math.round(rng() * 3 * 10) / 10,
        },
        {
          name: 'Community Hospital',
          type: 'Hospital',
          distance: Math.round((0.5 + rng() * 4) * 10) / 10,
        },
        {
          name: 'Public Library',
          type: 'Library',
          distance: Math.round(rng() * 2.5 * 10) / 10,
        },
      ],
    };

    const schools = [
      {
        name: 'Oakwood Elementary',
        type: 'Elementary' as const,
        rating: Math.round(3 + rng() * 7),
        distance: Math.round(rng() * 2 * 10) / 10,
        enrollment: Math.round(300 + rng() * 500),
        grades: 'K-5',
      },
      {
        name: 'Valley Middle School',
        type: 'Middle' as const,
        rating: Math.round(3 + rng() * 7),
        distance: Math.round((0.3 + rng() * 2) * 10) / 10,
        enrollment: Math.round(400 + rng() * 600),
        grades: '6-8',
      },
      {
        name: 'Central High School',
        type: 'High' as const,
        rating: Math.round(3 + rng() * 7),
        distance: Math.round((0.5 + rng() * 3) * 10) / 10,
        enrollment: Math.round(800 + rng() * 1500),
        grades: '9-12',
      },
    ];

    const crimeIndex = Math.round(15 + rng() * 70);
    const crime = {
      crimeIndex,
      violentCrimeRate: Math.round((0.5 + rng() * 5) * 10) / 10,
      propertyCrimeRate: Math.round((5 + rng() * 30) * 10) / 10,
      comparedToNational: (crimeIndex < 35
        ? 'lower'
        : crimeIndex < 55
          ? 'average'
          : 'higher') as 'lower' | 'average' | 'higher',
      year: 2025,
    };

    return NextResponse.json({
      demographics,
      schools,
      crime,
    });
  } catch (error) {
    console.error('Enrichment API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrichment data' },
      { status: 500 }
    );
  }
}
