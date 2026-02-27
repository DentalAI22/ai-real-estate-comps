'use client';

import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { formatCurrency, formatDate, formatNumber, classNames } from '@/lib/utils';
import type { CompSale } from '@/types';

interface CompTableProps {
  comps: CompSale[];
  className?: string;
}

type SortKey = 'salePrice' | 'saleDate' | 'sqft' | 'distanceFromSubject' | 'adjustedValue';
type SortDir = 'asc' | 'desc';

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'salePrice', label: 'Sale Price' },
  { key: 'saleDate', label: 'Date' },
  { key: 'sqft', label: 'Sq Ft' },
  { key: 'distanceFromSubject', label: 'Distance' },
  { key: 'adjustedValue', label: 'Adj. Value' },
];

export default function CompTable({ comps, className }: CompTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('distanceFromSubject');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...comps].sort((a, b) => {
    let aVal: number;
    let bVal: number;

    if (sortKey === 'saleDate') {
      aVal = new Date(a.saleDate).getTime();
      bVal = new Date(b.saleDate).getTime();
    } else {
      aVal = a[sortKey];
      bVal = b[sortKey];
    }

    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const pricePerSqft = (comp: CompSale) =>
    comp.sqft > 0 ? Math.round(comp.salePrice / comp.sqft) : 0;

  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Address
              </th>
              {SORT_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy-900 transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    <ChevronDown
                      className={classNames(
                        'w-3 h-3 transition-transform duration-200',
                        sortKey === col.key ? 'text-navy-900' : 'text-gray-300',
                        sortKey === col.key && sortDir === 'asc' && 'rotate-180'
                      )}
                    />
                  </div>
                </th>
              ))}
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Bed/Ba
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                $/SqFt
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((comp) => (
              <tr
                key={comp.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-3 px-3">
                  <p className="font-medium text-navy-900">{comp.address}</p>
                  <p className="text-xs text-gray-500">
                    {comp.city}, {comp.state} {comp.zip}
                  </p>
                </td>
                <td className="py-3 px-3 font-semibold text-navy-900">
                  {formatCurrency(comp.salePrice)}
                </td>
                <td className="py-3 px-3 text-gray-700">{formatDate(comp.saleDate)}</td>
                <td className="py-3 px-3 text-gray-700">{formatNumber(comp.sqft)}</td>
                <td className="py-3 px-3 text-gray-700">{comp.distanceFromSubject} mi</td>
                <td className="py-3 px-3 font-medium text-navy-900">
                  {formatCurrency(comp.adjustedValue)}
                </td>
                <td className="py-3 px-3 text-gray-700">
                  {comp.bedrooms}/{comp.bathrooms}
                </td>
                <td className="py-3 px-3 text-gray-700">${pricePerSqft(comp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {sorted.map((comp) => (
          <div
            key={comp.id}
            className="bg-gray-50 rounded-xl p-4 space-y-3"
          >
            <div>
              <p className="font-medium text-navy-900">{comp.address}</p>
              <p className="text-xs text-gray-500 flex items-center mt-0.5">
                <MapPin className="w-3 h-3 mr-1" />
                {comp.city}, {comp.state} &middot; {comp.distanceFromSubject} mi away
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Sale Price</p>
                <p className="text-sm font-semibold text-navy-900">
                  {formatCurrency(comp.salePrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-navy-900">{formatDate(comp.saleDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">$/SqFt</p>
                <p className="text-sm text-navy-900">${pricePerSqft(comp)}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Beds</p>
                <p className="text-sm text-navy-900">{comp.bedrooms}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Baths</p>
                <p className="text-sm text-navy-900">{comp.bathrooms}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">SqFt</p>
                <p className="text-sm text-navy-900">{formatNumber(comp.sqft)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Adj. Value</p>
                <p className="text-sm font-medium text-navy-900">
                  {formatCurrency(comp.adjustedValue)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
