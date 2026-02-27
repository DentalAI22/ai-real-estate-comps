import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { geocodeAddress } from '@/lib/data/geocoder';
import { getPropertyDetails, getComparableSales } from '@/lib/data/property-api';
import { generateId } from '@/lib/utils';

const generateSchema = z.object({
  subjectAddress: z.string().min(3),
  reportType: z.enum(['basic', 'pro', 'branded']),
  config: z
    .object({
      searchRadius: z.number().optional().default(3),
      dateRange: z.number().optional().default(12),
      addressedTo: z.string().optional().default(''),
      customNotes: z.string().optional().default(''),
      brandingId: z.string().nullable().optional().default(null),
    })
    .optional(),
});

/**
 * POST /api/report/generate
 *
 * Generates a full comp report for the given subject address.
 * Includes property details, comparable sales, AI narrative,
 * and value estimates.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { subjectAddress, reportType, config } = parsed.data;
    const searchRadius = config?.searchRadius ?? 3;
    const dateRange = config?.dateRange ?? 12;

    // Geocode the address
    const geo = await geocodeAddress(subjectAddress);

    // Get property details
    const property = await getPropertyDetails(subjectAddress);
    const enrichedProperty = {
      ...property,
      lat: geo.lat,
      lng: geo.lng,
      city: geo.city !== 'Unknown' ? geo.city : property.city,
      state: geo.state !== 'Unknown' ? geo.state : property.state,
      zip: geo.zip !== '00000' ? geo.zip : property.zip,
      county: geo.county !== 'Unknown County' ? geo.county : property.county,
    };

    // Get comparable sales
    const maxComps = reportType === 'basic' ? 5 : 15;
    const allComps = await getComparableSales(
      geo.lat,
      geo.lng,
      searchRadius,
      dateRange
    );
    const comps = allComps.slice(0, maxComps);

    // Calculate value estimates from comps
    const adjustedValues = comps.map((c) => c.adjustedValue);
    const avgValue =
      adjustedValues.reduce((sum, v) => sum + v, 0) / adjustedValues.length;
    const valueLow = Math.round(
      (Math.min(...adjustedValues) * 0.95) / 1000
    ) * 1000;
    const valueHigh = Math.round(
      (Math.max(...adjustedValues) * 1.05) / 1000
    ) * 1000;
    const valueEstimate = Math.round(avgValue / 1000) * 1000;

    // Calculate confidence based on comp count and quality
    const avgConfidence =
      comps.reduce((sum, c) => sum + c.confidenceScore, 0) / comps.length;
    const aiConfidence = Math.min(
      Math.round(avgConfidence * 0.7 + Math.min(comps.length / 10, 1) * 30),
      95
    );

    // Generate AI narrative (template-based for MVP)
    const aiNarrative =
      reportType !== 'basic'
        ? `Based on analysis of ${comps.length} comparable sales within ${searchRadius} miles of the subject property, the AI-estimated market value of ${enrichedProperty.address} is approximately $${valueEstimate.toLocaleString()}.\n\nThe subject property is a ${enrichedProperty.bedrooms}-bedroom, ${enrichedProperty.bathrooms}-bathroom ${enrichedProperty.propertyType} built in ${enrichedProperty.yearBuilt} with ${enrichedProperty.sqft.toLocaleString()} square feet of living space.\n\nThe comparable sales range from $${Math.min(...comps.map((c) => c.salePrice)).toLocaleString()} to $${Math.max(...comps.map((c) => c.salePrice)).toLocaleString()}, with adjusted values between $${valueLow.toLocaleString()} and $${valueHigh.toLocaleString()}. The AI confidence level of ${aiConfidence}% reflects the quality and quantity of available comparable data.`
        : '';

    const reportId = generateId();
    const now = new Date();

    const report = {
      id: reportId,
      subjectProperty: enrichedProperty,
      comps,
      aiNarrative,
      valueLow,
      valueHigh,
      valueEstimate,
      aiConfidence,
      neighborhoodData: null,
      schoolData: null,
      crimeData: null,
      marketTrends: null,
      pdfUrl: null,
      reportType,
      config: {
        searchRadius,
        dateRange,
        addressedTo: config?.addressedTo ?? '',
        customNotes: config?.customNotes ?? '',
        brandingId: config?.brandingId ?? null,
        maxComps,
        includeSchoolData: reportType !== 'basic',
        includeCrimeData: reportType !== 'basic',
        includeMarketTrends: reportType !== 'basic',
        includeNeighborhoodData: reportType !== 'basic',
        includeAINarrative: reportType !== 'basic',
      },
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'anonymous',
      addressedTo: config?.addressedTo ?? '',
      customNotes: config?.customNotes ?? '',
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
