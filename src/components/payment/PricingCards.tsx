'use client';

import React from 'react';
import { CheckCircle, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { classNames } from '@/lib/utils';
import { ReportType } from '@/types';

interface PricingCardsProps {
  onSelectTier: (tier: ReportType) => void;
  className?: string;
}

interface TierConfig {
  type: ReportType;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  popular: boolean;
  features: string[];
}

const TIERS: TierConfig[] = [
  {
    type: ReportType.Basic,
    name: 'Basic',
    price: '$4.99',
    priceValue: 4.99,
    description: 'Quick property valuation for homeowners',
    popular: false,
    features: [
      'Up to 5 comparable sales',
      'AI value estimate with range',
      'Basic property details',
      'Sale price & date for each comp',
      'Price per sq ft analysis',
      'PDF download',
    ],
  },
  {
    type: ReportType.Pro,
    name: 'Pro',
    price: '$14.99',
    priceValue: 14.99,
    description: 'Complete analysis for investors & agents',
    popular: true,
    features: [
      'Up to 15 comparable sales',
      'AI value estimate with confidence score',
      'Per-comp price adjustments',
      'AI-generated narrative analysis',
      'Market trends & statistics',
      'Neighborhood demographics',
      'School ratings & crime data',
      'Days on market & sale-to-list ratio',
      'Professional PDF download',
    ],
  },
  {
    type: ReportType.Branded,
    name: 'Branded',
    price: '$24.99',
    priceValue: 24.99,
    description: 'White-label reports for professionals',
    popular: false,
    features: [
      'Everything in Pro',
      'Your logo & branding on report',
      'Agent headshot & contact info',
      'Custom colors & tagline',
      'Custom disclaimer',
      'Client-ready presentation',
      'CMA meeting companion',
      'Re-generate with new data',
    ],
  },
];

export default function PricingCards({ onSelectTier, className }: PricingCardsProps) {
  return (
    <div
      className={classNames(
        'grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start',
        className
      )}
    >
      {TIERS.map((tier) => (
        <div
          key={tier.type}
          className={classNames(
            'relative rounded-2xl border-2 bg-white transition-shadow duration-200 hover:shadow-lg',
            tier.popular
              ? 'border-gold-400 shadow-md shadow-gold-400/10'
              : 'border-gray-200'
          )}
        >
          {/* Popular badge */}
          {tier.popular && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center space-x-1 px-4 py-1 bg-gold-400 text-navy-900 text-xs font-bold rounded-full shadow-sm">
                <Star className="w-3 h-3 fill-navy-900" />
                <span>Most Popular</span>
              </span>
            </div>
          )}

          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-lg font-display font-bold text-navy-900">{tier.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-display font-bold text-navy-900">
                  {tier.price}
                </span>
                <span className="text-sm text-gray-500 ml-2">/ report</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              variant={tier.popular ? 'gold' : 'primary'}
              fullWidth
              size="lg"
              onClick={() => onSelectTier(tier.type)}
            >
              Get {tier.name} Report
            </Button>

            {/* Features */}
            <ul className="mt-6 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start space-x-2.5">
                  <CheckCircle
                    className={classNames(
                      'w-4 h-4 mt-0.5 flex-shrink-0',
                      tier.popular ? 'text-gold-500' : 'text-green-500'
                    )}
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
