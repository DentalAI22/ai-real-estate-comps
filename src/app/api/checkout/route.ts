import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession, PRICE_TIERS } from '@/lib/stripe';

const checkoutSchema = z.object({
  reportType: z.enum(['basic', 'pro', 'branded']),
  subjectAddress: z.string().min(3),
  email: z.string().email().optional().default(''),
});

/**
 * POST /api/checkout
 *
 * Creates a Stripe checkout session for a report purchase.
 * Returns the checkout session URL for redirect.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { reportType, subjectAddress, email } = parsed.data;

    // Verify the tier exists
    if (!PRICE_TIERS[reportType]) {
      return NextResponse.json(
        { error: `Invalid report type: ${reportType}` },
        { status: 400 }
      );
    }

    // For MVP without auth, use anonymous user ID
    const userId = 'anonymous';
    const userEmail = email || 'customer@example.com';

    const { sessionId, url } = await createCheckoutSession(
      reportType,
      subjectAddress,
      userId,
      userEmail
    );

    return NextResponse.json({
      sessionId,
      url,
      tier: PRICE_TIERS[reportType],
    });
  } catch (error) {
    console.error('Checkout API error:', error);

    // Handle Stripe-specific errors
    if (error instanceof Error && error.message.includes('Stripe')) {
      return NextResponse.json(
        {
          error: 'Payment service error. Please try again.',
          details: error.message,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
