'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, classNames } from '@/lib/utils';
import type { MarketTrends } from '@/types';

interface MarketAnalysisProps {
  marketTrends: MarketTrends;
  className?: string;
}

function getMarketTypeConfig(type: MarketTrends['marketType']) {
  switch (type) {
    case 'sellers':
      return {
        label: "Seller's Market",
        color: 'text-red-700',
        bg: 'bg-red-50',
        description: 'High demand, low inventory. Prices trending upward.',
      };
    case 'buyers':
      return {
        label: "Buyer's Market",
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        description: 'More inventory than demand. Buyers have negotiating power.',
      };
    case 'balanced':
    default:
      return {
        label: 'Balanced Market',
        color: 'text-green-700',
        bg: 'bg-green-50',
        description: 'Supply and demand are roughly equal.',
      };
  }
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-navy-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
      <p className="font-medium">{label}</p>
      <p className="text-gold-400 font-semibold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function MarketAnalysis({ marketTrends, className }: MarketAnalysisProps) {
  const marketConfig = getMarketTypeConfig(marketTrends.marketType);

  const chartData = marketTrends.trends.map((trend) => ({
    month: new Date(trend.date).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    medianPrice: trend.medianPrice,
  }));

  return (
    <div className={classNames('space-y-6', className)}>
      {/* Market type indicator */}
      <div
        className={classNames(
          'flex items-start space-x-3 p-4 rounded-xl',
          marketConfig.bg
        )}
      >
        <TrendingUp className={classNames('w-5 h-5 mt-0.5 flex-shrink-0', marketConfig.color)} />
        <div>
          <p className={classNames('text-sm font-semibold', marketConfig.color)}>
            {marketConfig.label}
          </p>
          <p className="text-sm text-gray-600 mt-0.5">{marketConfig.description}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Avg Days on Market
          </p>
          <p className="text-xl font-display font-bold text-navy-900 mt-1">
            {marketTrends.averageDaysOnMarket}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Sale-to-List Ratio
          </p>
          <p className="text-xl font-display font-bold text-navy-900 mt-1">
            {marketTrends.trends.length > 0
              ? `${(marketTrends.trends[marketTrends.trends.length - 1].listToSaleRatio * 100).toFixed(1)}%`
              : 'N/A'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            12-Mo Appreciation
          </p>
          <p
            className={classNames(
              'text-xl font-display font-bold mt-1',
              marketTrends.appreciationRate12Month >= 0
                ? 'text-green-600'
                : 'text-red-600'
            )}
          >
            {marketTrends.appreciationRate12Month >= 0 ? '+' : ''}
            {(marketTrends.appreciationRate12Month * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Months of Supply
          </p>
          <p className="text-xl font-display font-bold text-navy-900 mt-1">
            {marketTrends.monthsOfSupply.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3">
            Median Sale Prices Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="medianPrice"
                  fill="#c69c6d"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Inventory trend */}
      {marketTrends.trends.length > 0 && (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            Current inventory: {marketTrends.trends[marketTrends.trends.length - 1].inventoryCount}{' '}
            active listings in area
          </span>
        </div>
      )}
    </div>
  );
}
