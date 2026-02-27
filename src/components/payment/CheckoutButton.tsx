'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { classNames } from '@/lib/utils';
import type { ReportType } from '@/types';

interface CheckoutButtonProps {
  reportType: ReportType;
  subjectAddress: string;
  price: string;
  className?: string;
}

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  branded: 'Branded',
};

export default function CheckoutButton({
  reportType,
  subjectAddress,
  price,
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          subjectAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={classNames('space-y-3', className)}>
      <Button
        variant="gold"
        size="lg"
        fullWidth
        loading={loading}
        onClick={handleCheckout}
      >
        {loading ? (
          'Redirecting to checkout...'
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Purchase {TIER_LABELS[reportType] || reportType} Report &mdash; {price}
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <p className="text-xs text-gray-400 text-center flex items-center justify-center space-x-1">
        <Lock className="w-3 h-3" />
        <span>Secure checkout powered by Stripe</span>
      </p>
    </div>
  );
}
