import React from 'react';
import { formatCurrency, classNames } from '@/lib/utils';
import type { CompSale } from '@/types';

interface PriceAdjustmentsProps {
  comps: CompSale[];
  className?: string;
}

interface AdjustmentLineItem {
  label: string;
  key: keyof CompSale['adjustments'];
}

const ADJUSTMENT_ITEMS: AdjustmentLineItem[] = [
  { label: 'Square Footage', key: 'sqft' },
  { label: 'Bedrooms', key: 'bedrooms' },
  { label: 'Bathrooms', key: 'bathrooms' },
  { label: 'Age / Year Built', key: 'age' },
  { label: 'Lot Size', key: 'lot' },
  { label: 'Pool', key: 'pool' },
  { label: 'Garage', key: 'garage' },
  { label: 'Condition', key: 'condition' },
  { label: 'Location', key: 'location' },
  { label: 'Market Conditions', key: 'marketConditions' },
];

function AdjustmentValue({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-gray-400">--</span>;
  }
  const isPositive = value > 0;
  return (
    <span
      className={classNames(
        'font-medium',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}
    >
      {isPositive ? '+' : ''}
      {formatCurrency(value)}
    </span>
  );
}

export default function PriceAdjustments({ comps, className }: PriceAdjustmentsProps) {
  if (comps.length === 0) return null;

  return (
    <div className={classNames('space-y-6', className)}>
      {comps.map((comp, compIndex) => {
        const totalAdjustment = Object.values(comp.adjustments).reduce(
          (sum, val) => sum + val,
          0
        );

        return (
          <div key={comp.id} className="overflow-x-auto">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-navy-900">
                Comp #{compIndex + 1}: {comp.address}
              </h4>
              <p className="text-xs text-gray-500">
                {comp.city}, {comp.state} &middot; Sale Price:{' '}
                {formatCurrency(comp.salePrice)}
              </p>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Adjustment Item
                  </th>
                  <th className="text-right py-2 pl-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {ADJUSTMENT_ITEMS.map((item) => (
                  <tr key={item.key} className="border-b border-gray-50">
                    <td className="py-2 pr-4 text-gray-700">{item.label}</td>
                    <td className="py-2 pl-4 text-right">
                      <AdjustmentValue value={comp.adjustments[item.key]} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-navy-100">
                  <td className="py-3 pr-4 font-semibold text-navy-900">
                    Net Adjustment
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <span
                      className={classNames(
                        'font-bold text-base',
                        totalAdjustment > 0
                          ? 'text-green-600'
                          : totalAdjustment < 0
                            ? 'text-red-600'
                            : 'text-navy-900'
                      )}
                    >
                      {totalAdjustment > 0 ? '+' : ''}
                      {formatCurrency(totalAdjustment)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-semibold text-navy-900">
                    Adjusted Value
                  </td>
                  <td className="py-2 pl-4 text-right">
                    <span className="font-bold text-lg text-navy-900">
                      {formatCurrency(comp.adjustedValue)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
}
