/**
 * Stripe integration for payment processing.
 * Handles checkout sessions for report purchases and webhook events.
 */

import Stripe from 'stripe';
import type { ReportType } from '@/types';

// ─── Stripe Instance (lazy-initialized to avoid build-time errors) ────────────

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

// ─── Price Configuration ───────────────────────────────────────────────────────

interface PriceTier {
  reportType: ReportType;
  label: string;
  priceInCents: number;
  priceDisplay: string;
  description: string;
}

export const PRICE_TIERS: Record<string, PriceTier> = {
  basic: {
    reportType: 'basic' as ReportType,
    label: 'Basic Comp Report',
    priceInCents: 499,
    priceDisplay: '$4.99',
    description:
      'Up to 5 comps, value estimate, basic neighborhood data. PDF report.',
  },
  pro: {
    reportType: 'pro' as ReportType,
    label: 'Pro Comp Report',
    priceInCents: 1499,
    priceDisplay: '$14.99',
    description:
      'Up to 15 comps, AI narrative, market trends, school & crime data, adjustments. PDF report.',
  },
  branded: {
    reportType: 'branded' as ReportType,
    label: 'Branded Agent Report',
    priceInCents: 2499,
    priceDisplay: '$24.99',
    description:
      'Everything in Pro plus custom agent branding, logo, headshot, and company details. Client-ready PDF.',
  },
};

// ─── Checkout Session ──────────────────────────────────────────────────────────

interface CheckoutResult {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout session for a report purchase.
 *
 * @param reportType - The tier of report: 'basic', 'pro', or 'branded'
 * @param subjectAddress - The address being analyzed (shown in line item)
 * @param userId - The authenticated user's ID (stored as metadata)
 * @param email - The user's email for Stripe receipt
 * @returns The checkout session ID and redirect URL
 */
export async function createCheckoutSession(
  reportType: string,
  subjectAddress: string,
  userId: string,
  email: string
): Promise<CheckoutResult> {
  const tier = PRICE_TIERS[reportType];
  if (!tier) {
    throw new Error(`Invalid report type: ${reportType}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tier.priceInCents,
          product_data: {
            name: tier.label,
            description: `Comp report for ${subjectAddress}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      reportType,
      subjectAddress,
    },
    success_url: `${baseUrl}/report/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/report/configure?address=${encodeURIComponent(subjectAddress)}&canceled=true`,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

// ─── Webhook Handler ───────────────────────────────────────────────────────────

export interface WebhookResult {
  type: string;
  userId: string | null;
  reportType: string | null;
  subjectAddress: string | null;
  paymentIntentId: string | null;
  amountPaid: number | null;
  email: string | null;
}

/**
 * Process a Stripe webhook event.
 * Currently handles checkout.session.completed for report purchases.
 *
 * @param event - The verified Stripe webhook event
 * @returns Parsed result from the event
 */
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<WebhookResult> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      return {
        type: event.type,
        userId: (session.metadata?.userId as string) ?? null,
        reportType: (session.metadata?.reportType as string) ?? null,
        subjectAddress: (session.metadata?.subjectAddress as string) ?? null,
        paymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        amountPaid: session.amount_total,
        email:
          session.customer_email ??
          (session.customer_details?.email as string) ??
          null,
      };
    }
    default:
      return {
        type: event.type,
        userId: null,
        reportType: null,
        subjectAddress: null,
        paymentIntentId: null,
        amountPaid: null,
        email: null,
      };
  }
}

/**
 * Verify and construct a Stripe webhook event from a request body and signature.
 *
 * @param body - The raw request body as a string
 * @param signature - The Stripe-Signature header value
 * @returns The verified Stripe event
 */
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
