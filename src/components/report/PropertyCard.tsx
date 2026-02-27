import React from 'react';
import { MapPin, Home } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatCurrency, formatDate, formatNumber, classNames } from '@/lib/utils';
import type { CompSale } from '@/types';

interface PropertyCardProps {
  comp: CompSale;
  className?: string;
}

function getConfidenceConfig(score: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  if (score >= 0.8) {
    return {
      label: 'High',
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-l-green-500',
    };
  }
  if (score >= 0.5) {
    return {
      label: 'Medium',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-l-yellow-500',
    };
  }
  return {
    label: 'Low',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-l-red-500',
  };
}

export default function PropertyCard({ comp, className }: PropertyCardProps) {
  const confidence = getConfidenceConfig(comp.confidenceScore);
  const pricePerSqft = comp.sqft > 0 ? Math.round(comp.salePrice / comp.sqft) : 0;

  return (
    <Card
      padding="none"
      className={classNames('border-l-4 overflow-hidden', confidence.border, className)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-navy-900 truncate">
              {comp.address}
            </h3>
            <p className="text-xs text-gray-500 flex items-center mt-0.5">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              {comp.city}, {comp.state} {comp.zip}
            </p>
          </div>
          <span
            className={classNames(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ml-3 flex-shrink-0',
              confidence.bg,
              confidence.color
            )}
          >
            {confidence.label}
          </span>
        </div>

        {/* Price and date */}
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-xl font-display font-bold text-navy-900">
            {formatCurrency(comp.salePrice)}
          </p>
          <p className="text-xs text-gray-500">{formatDate(comp.saleDate)}</p>
        </div>

        {/* Key details */}
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Beds</p>
            <p className="text-sm font-medium text-navy-900">{comp.bedrooms}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Baths</p>
            <p className="text-sm font-medium text-navy-900">{comp.bathrooms}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">SqFt</p>
            <p className="text-sm font-medium text-navy-900">{formatNumber(comp.sqft)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Year</p>
            <p className="text-sm font-medium text-navy-900">{comp.yearBuilt}</p>
          </div>
        </div>

        {/* Footer details */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">
              <span className="font-medium text-navy-900">${pricePerSqft}</span>/sqft
            </span>
            <span className="text-xs text-gray-500">
              <span className="font-medium text-navy-900">{comp.distanceFromSubject}</span>{' '}
              mi away
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Home className="w-3 h-3" />
            <span>{comp.propertyType}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
