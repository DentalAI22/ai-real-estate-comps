import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const pdfSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
});

/**
 * POST /api/report/pdf
 *
 * Generates a PDF for the specified report.
 * MVP: Returns a placeholder response indicating PDF generation is pending.
 * Production: Use @react-pdf/renderer to generate the actual PDF
 * and upload to Supabase Storage, returning the download URL.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = pdfSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { reportId } = parsed.data;

    // MVP: Return a placeholder response
    // In production, this would:
    // 1. Fetch the report from database
    // 2. Generate PDF using @react-pdf/renderer
    // 3. Upload to Supabase Storage
    // 4. Update the report record with the PDF URL
    // 5. Return the download URL

    return NextResponse.json({
      reportId,
      status: 'pending',
      message:
        'PDF generation is being set up. In production, this endpoint will generate and return a downloadable PDF.',
      pdfUrl: null,
      estimatedTime: '5-10 seconds',
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
