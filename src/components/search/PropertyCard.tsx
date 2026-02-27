'use client';

import React from 'react';
import { Home, BedDouble, Bath, Ruler, Calendar, DollarSign, MapPin } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatCurrency, formatNumber, classNames } from '@/lib/utils';
import type { PropertyDetails } from '@/types';

interface PropertyCardProps {
  property: PropertyDetails;
  className?: string;
  compact?: boolean;
}

export default function PropertyCard({ property, className, compact = false }: PropertyCardProps) {
  return (
    <Card padding={compact ? 'sm' : 'md'} className={classNames('relative', className)}>
      {/* Type badge */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-navy-900 text-white">
          {property.propertyType}
        </span>
      </div>

      {/* Address */}
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-navy-900 pr-20">
          {property.address}
        </h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          {property.city}, {property.state} {property.zip}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {property.county} County
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem
          icon={<BedDouble className="w-4 h-4" />}
          label="Bedrooms"
          value={String(property.bedrooms)}
        />
        <StatItem
          icon={<Bath className="w-4 h-4" />}
          label="Bathrooms"
          value={String(property.bathrooms)}
        />
        <StatItem
          icon={<Ruler className="w-4 h-4" />}
          label="Sq Ft"
          value={formatNumber(property.sqft)}
        />
        <StatItem
          icon={<Home className="w-4 h-4" />}
          label="Year Built"
          value={String(property.yearBuilt)}
        />
      </div>

      {!compact && (
        <>
          {/* Divider */}
          <div className="border-t border-gray-100 mt-4 pt-4" />

          {/* Financial details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatItem
              icon={<DollarSign className="w-4 h-4" />}
              label="Assessed Value"
              value={formatCurrency(property.assessedValue)}
            />
            <StatItem
              icon={<DollarSign className="w-4 h-4" />}
              label="Last Sale"
              value={formatCurrency(property.lastSalePrice)}
            />
            <StatItem
              icon={<Calendar className="w-4 h-4" />}
              label="Sale Date"
              value={property.lastSaleDate || 'N/A'}
            />
          </div>

          {/* Extra details */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-500">
            <span className="bg-gray-50 px-2 py-1 rounded">
              Lot: {formatNumber(property.lotSqft)} sqft
            </span>
            <span className="bg-gray-50 px-2 py-1 rounded">
              {property.stories} {property.stories === 1 ? 'story' : 'stories'}
            </span>
            <span className="bg-gray-50 px-2 py-1 rounded">
              Garage: {property.garage || 'None'}
            </span>
            {property.pool && (
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Pool</span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-gold-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-navy-900">{value}</p>
      </div>
    </div>
  );
}
