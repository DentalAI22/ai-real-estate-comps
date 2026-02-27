import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, handleWebhookEvent } from '@/lib/stripe';

/**
 * POST /api/webhook
 *
 * Stripe webhook handler.
 * Verifies the webhook signature and processes events.
 * Currently handles checkout.session.completed for report purchases.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature header' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Process the event
    const result = await handleWebhookEvent(event);

    switch (result.type) {
      case 'checkout.session.completed': {
        console.log('Payment completed:', {
          userId: result.userId,
          reportType: result.reportType,
          address: result.subjectAddress,
          amount: result.amountPaid,
          email: result.email,
        });

        // In production, this would:
        // 1. Mark the report as paid in the database
        // 2. Generate the report if not already generated
        // 3. Send a confirmation email with the report link
        // 4. Update the user's purchase history

        break;
      }
      default:
        console.log(`Unhandled webhook event type: ${result.type}`);
    }

    return NextResponse.json({ received: true, type: result.type });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
