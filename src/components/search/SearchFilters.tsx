'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '@/lib/utils';
import type { PropertyType } from '@/types';

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  radius: number;
  dateRange: number;
  propertyTypes: PropertyType[];
}

const RADIUS_OPTIONS = [
  { value: 0.25, label: '0.25 mi' },
  { value: 0.5, label: '0.5 mi' },
  { value: 1, label: '1 mi' },
  { value: 2, label: '2 mi' },
];

const DATE_RANGE_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'SFR', label: 'Single Family' },
  { value: 'Condo', label: 'Condo' },
  { value: 'Multi-Family', label: 'Multi-Family' },
  { value: 'Townhome', label: 'Townhome' },
];

export default function SearchFilters({ onFiltersChange, className }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    radius: 1,
    dateRange: 6,
    propertyTypes: ['SFR'],
  });
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);

  const updateFilters = (partial: Partial<FilterState>) => {
    const updated = { ...filters, ...partial };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const togglePropertyType = (type: PropertyType) => {
    const current = filters.propertyTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    if (updated.length > 0) {
      updateFilters({ propertyTypes: updated });
    }
  };

  return (
    <div
      className={classNames(
        'flex flex-col sm:flex-row items-stretch sm:items-center gap-3',
        className
      )}
    >
      {/* Radius */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">
          Radius
        </label>
        <div className="relative">
          <select
            value={filters.radius}
            onChange={(e) => updateFilters({ radius: Number(e.target.value) })}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-9 text-sm text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 cursor-pointer w-full sm:w-auto"
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Date range */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">
          Date Range
        </label>
        <div className="relative">
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilters({ dateRange: Number(e.target.value) })}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-9 text-sm text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 cursor-pointer w-full sm:w-auto"
          >
            {DATE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Property type multi-select */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">
          Property Type
        </label>
        <button
          type="button"
          onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
          className="flex items-center justify-between w-full sm:w-auto bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
        >
          <span className="mr-2">
            {filters.propertyTypes.length === 1
              ? PROPERTY_TYPES.find((t) => t.value === filters.propertyTypes[0])?.label
              : `${filters.propertyTypes.length} types`}
          </span>
          <ChevronDown
            className={classNames(
              'w-4 h-4 text-gray-400 transition-transform duration-200',
              propertyDropdownOpen && 'rotate-180'
            )}
          />
        </button>

        {propertyDropdownOpen && (
          <div className="absolute z-20 mt-1 w-full sm:w-52 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden">
            {PROPERTY_TYPES.map((type) => {
              const isSelected = filters.propertyTypes.includes(type.value);
              return (
                <label
                  key={type.value}
                  className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePropertyType(type.value)}
                    className="w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500"
                  />
                  <span className="text-sm text-navy-900">{type.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
