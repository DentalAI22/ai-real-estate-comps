import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// In-memory store for MVP (production would use Supabase)
const brandingStore = new Map<string, Record<string, unknown>>();

const brandingSchema = z.object({
  companyName: z.string().optional().default(''),
  agentName: z.string().optional().default(''),
  agentTitle: z.string().optional().default(''),
  licenseDisplay: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  website: z.string().nullable().optional().default(null),
  primaryColor: z.string().optional().default('#0f172a'),
  secondaryColor: z.string().optional().default('#c69c6d'),
  tagline: z.string().nullable().optional().default(null),
  disclaimer: z.string().nullable().optional().default(null),
});

/**
 * GET /api/branding
 *
 * Fetch the current user's branding profile.
 * MVP: Uses a hardcoded user ID since auth is not wired up.
 */
export async function GET() {
  try {
    const userId = 'demo-user'; // MVP: hardcoded
    const branding = brandingStore.get(userId);

    if (!branding) {
      return NextResponse.json({
        branding: null,
        message: 'No branding profile found',
      });
    }

    return NextResponse.json({ branding });
  } catch (error) {
    console.error('Branding GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branding
 *
 * Save or update branding profile.
 * MVP: Stores in memory. Production would save to Supabase
 * and handle file uploads for logo/headshot to Supabase Storage.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await request.formData();
      const userId = 'demo-user';

      const existing = (brandingStore.get(userId) || {}) as Record<string, unknown>;

      // Process text fields
      const fields = [
        'companyName',
        'agentName',
        'agentTitle',
        'licenseDisplay',
        'phone',
        'email',
        'website',
        'primaryColor',
        'secondaryColor',
        'tagline',
        'disclaimer',
      ];

      for (const field of fields) {
        const value = formData.get(field);
        if (value !== null) {
          existing[field] = value.toString();
        }
      }

      // Process file uploads (in production, upload to Supabase Storage)
      const logoFile = formData.get('logo') as File | null;
      const headshotFile = formData.get('headshot') as File | null;

      if (logoFile && logoFile.size > 0) {
        // MVP: Store a placeholder URL
        existing.logoUrl = `/uploads/logos/${userId}-logo.png`;
      }

      if (headshotFile && headshotFile.size > 0) {
        existing.headshotUrl = `/uploads/headshots/${userId}-headshot.png`;
      }

      existing.userId = userId;
      existing.updatedAt = new Date().toISOString();

      brandingStore.set(userId, existing);

      return NextResponse.json({
        branding: existing,
        message: 'Branding saved successfully',
      });
    }

    // Handle JSON body
    const body = await request.json();
    const parsed = brandingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const userId = 'demo-user';
    const branding = {
      ...parsed.data,
      id: userId,
      userId,
      logoUrl: null,
      headshotUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    brandingStore.set(userId, branding);

    return NextResponse.json({
      branding,
      message: 'Branding saved successfully',
    });
  } catch (error) {
    console.error('Branding POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save branding' },
      { status: 500 }
    );
  }
}
