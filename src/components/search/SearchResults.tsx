'use client';

import React from 'react';
import { MapPin, Home, DollarSign, FileText } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatNumber, classNames } from '@/lib/utils';
import type { PropertyDetails, ReportType } from '@/types';

interface SearchResultsProps {
  subjectProperty: PropertyDetails | null;
  compsCount: number;
  onGenerateReport: (tier: ReportType) => void;
  className?: string;
}

const tiers: { type: ReportType; label: string; price: string }[] = [
  { type: 'basic' as ReportType, label: 'Basic', price: '$4.99' },
  { type: 'pro' as ReportType, label: 'Pro', price: '$14.99' },
  { type: 'branded' as ReportType, label: 'Branded', price: '$24.99' },
];

export default function SearchResults({
  subjectProperty,
  compsCount,
  onGenerateReport,
  className,
}: SearchResultsProps) {
  if (!subjectProperty) return null;

  return (
    <div className={classNames('space-y-6', className)}>
      {/* Subject property card */}
      <Card padding="lg">
        <div className="flex items-start space-x-3 mb-4">
          <div className="p-2 bg-navy-50 rounded-lg">
            <Home className="w-5 h-5 text-navy-900" />
          </div>
          <div>
            <p className="text-xs font-medium text-gold-500 uppercase tracking-wider">
              Subject Property
            </p>
            <h3 className="text-lg font-display font-bold text-navy-900 mt-0.5">
              {subjectProperty.address}
            </h3>
            <p className="text-sm text-gray-500 flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {subjectProperty.city}, {subjectProperty.state} {subjectProperty.zip}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
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
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-sm font-semibold text-navy-900">
              {subjectProperty.propertyType}
            </p>
          </div>
        </div>
      </Card>

      {/* Results summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-navy-900">
            {compsCount} Comparable Sales Found
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Within your search radius and date range
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <DollarSign className="w-4 h-4 text-gold-400" />
          <span>Prices from public records</span>
        </div>
      </div>

      {/* Map placeholder */}
      <Card padding="none" className="overflow-hidden">
        <div className="bg-navy-50 h-64 lg:h-80 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-navy-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-navy-400">Interactive Map</p>
            <p className="text-xs text-navy-300 mt-1">
              Subject property and comparable sales
            </p>
          </div>
        </div>
      </Card>

      {/* Generate report section */}
      <Card padding="lg" className="border-2 border-gold-200 bg-gold-50/30">
        <div className="text-center mb-6">
          <FileText className="w-8 h-8 text-gold-500 mx-auto mb-2" />
          <h3 className="text-lg font-display font-bold text-navy-900">
            Generate Your Report
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose your report tier to unlock the full analysis
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <button
              key={tier.type}
              onClick={() => onGenerateReport(tier.type)}
              className={classNames(
                'relative rounded-xl border-2 p-4 text-center transition-all duration-200 hover:shadow-md',
                tier.type === ('pro' as ReportType)
                  ? 'border-gold-400 bg-white shadow-sm'
                  : 'border-gray-200 bg-white hover:border-navy-200'
              )}
            >
              {tier.type === ('pro' as ReportType) && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold-400 text-navy-900 text-xs font-bold rounded-full">
                  Popular
                </span>
              )}
              <p className="text-sm font-semibold text-navy-900">{tier.label}</p>
              <p className="text-2xl font-display font-bold text-navy-900 mt-1">
                {tier.price}
              </p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
