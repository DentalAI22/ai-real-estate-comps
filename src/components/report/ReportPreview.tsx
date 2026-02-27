'use client';

import React from 'react';
import {
  Lock,
  MapPin,
  Home,
  DollarSign,
  TrendingUp,
  Eye,
  CheckCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatNumber, classNames } from '@/lib/utils';
import type { PropertyDetails } from '@/types';

interface ReportPreviewProps {
  subjectProperty: PropertyDetails;
  compsCount: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  onPurchase: () => void;
  className?: string;
}

const PREVIEW_FEATURES = [
  'Full comparable sales analysis',
  'Per-comp price adjustments',
  'AI-generated narrative',
  'Market trends & statistics',
  'Neighborhood demographics',
  'Downloadable PDF report',
];

export default function ReportPreview({
  subjectProperty,
  compsCount,
  priceRangeLow,
  priceRangeHigh,
  onPurchase,
  className,
}: ReportPreviewProps) {
  return (
    <div className={classNames('space-y-6', className)}>
      {/* Subject property header */}
      <Card padding="lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-gold-600 uppercase tracking-wider">
                Report Preview
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-navy-900">
              {subjectProperty.address}
            </h2>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {subjectProperty.city}, {subjectProperty.state} {subjectProperty.zip}
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-navy-50 rounded-lg">
            <Home className="w-4 h-4 text-navy-600" />
            <span className="text-sm font-medium text-navy-900">
              {subjectProperty.propertyType}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Beds / Baths</p>
            <p className="text-sm font-semibold text-navy-900">
              {subjectProperty.bedrooms} bd / {subjectProperty.bathrooms} ba
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Sq Ft</p>
            <p className="text-sm font-semibold text-navy-900">
              {formatNumber(subjectProperty.sqft)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Year Built</p>
            <p className="text-sm font-semibold text-navy-900">{subjectProperty.yearBuilt}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Lot Size</p>
            <p className="text-sm font-semibold text-navy-900">
              {formatNumber(subjectProperty.lotSqft)} sqft
            </p>
          </div>
        </div>
      </Card>

      {/* Teaser stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="text-center">
          <DollarSign className="w-6 h-6 text-gold-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 uppercase tracking-wider">Comps Found</p>
          <p className="text-2xl font-display font-bold text-navy-900 mt-1">{compsCount}</p>
        </Card>
        <Card padding="md" className="text-center">
          <TrendingUp className="w-6 h-6 text-gold-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 uppercase tracking-wider">Sale Price Range</p>
          <p className="text-lg font-display font-bold text-navy-900 mt-1">
            {formatCurrency(priceRangeLow)} &mdash; {formatCurrency(priceRangeHigh)}
          </p>
        </Card>
        <Card padding="md" className="text-center">
          <Home className="w-6 h-6 text-gold-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 uppercase tracking-wider">Neighborhood</p>
          <p className="text-lg font-display font-bold text-navy-900 mt-1">
            {subjectProperty.city}
          </p>
        </Card>
      </div>

      {/* Blurred report mockup with overlay */}
      <Card padding="none" className="relative overflow-hidden">
        {/* Blurred content (mockup) */}
        <div className="p-8 filter blur-sm select-none pointer-events-none" aria-hidden="true">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-5 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="mt-6 h-40 bg-gray-100 rounded-lg" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-900 mb-4">
              <Lock className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-navy-900">
              Purchase to Unlock Full Report
            </h3>
            <p className="text-sm text-gray-600 mt-2 mb-6">
              Get the complete analysis including AI valuation, detailed comp adjustments,
              market trends, and a downloadable PDF.
            </p>

            <ul className="text-left space-y-2 mb-6">
              {PREVIEW_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center text-sm text-navy-900">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button variant="gold" size="lg" fullWidth onClick={onPurchase}>
              Unlock Full Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
