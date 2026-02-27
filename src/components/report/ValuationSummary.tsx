import React from 'react';
import { DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatCurrency, classNames } from '@/lib/utils';

interface ValuationSummaryProps {
  valueLow: number;
  valueHigh: number;
  valueEstimate: number;
  confidence: number;
  className?: string;
}

function getConfidenceConfig(score: number) {
  if (score >= 0.8) {
    return {
      label: 'High Confidence',
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    };
  }
  if (score >= 0.5) {
    return {
      label: 'Medium Confidence',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
    };
  }
  return {
    label: 'Low Confidence',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  };
}

export default function ValuationSummary({
  valueLow,
  valueHigh,
  valueEstimate,
  confidence,
  className,
}: ValuationSummaryProps) {
  const conf = getConfidenceConfig(confidence);
  const ConfIcon = conf.icon;

  const range = valueHigh - valueLow;
  const estimatePosition = range > 0 ? ((valueEstimate - valueLow) / range) * 100 : 50;

  return (
    <Card padding="lg" className={classNames('border-2 border-navy-100', className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-900 mb-3">
          <DollarSign className="w-6 h-6 text-gold-400" />
        </div>
        <h2 className="text-lg font-display font-bold text-navy-900">
          Estimated Market Value
        </h2>
      </div>

      {/* Large value */}
      <div className="text-center mb-8">
        <p className="text-4xl lg:text-5xl font-display font-bold text-navy-900">
          {formatCurrency(valueEstimate)}
        </p>
        <div className="mt-3 inline-flex items-center space-x-2">
          <span
            className={classNames(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
              conf.bg,
              conf.color,
              conf.border
            )}
          >
            <ConfIcon className={classNames('w-3.5 h-3.5 mr-1.5', conf.iconColor)} />
            {conf.label} ({(confidence * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Range bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Low</span>
          <span className="text-gray-500">High</span>
        </div>
        <div className="relative h-3 bg-gradient-to-r from-navy-100 via-gold-200 to-navy-100 rounded-full">
          {/* Estimate marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${Math.max(5, Math.min(95, estimatePosition))}%` }}
          >
            <div className="w-5 h-5 bg-navy-900 rounded-full border-2 border-white shadow-md" />
          </div>
        </div>
        <div className="flex justify-between text-sm font-semibold mt-2">
          <span className="text-navy-900">{formatCurrency(valueLow)}</span>
          <span className="text-navy-900">{formatCurrency(valueHigh)}</span>
        </div>
      </div>

      {/* Key factors */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-navy-900 mb-3">Key Valuation Factors</h3>
        <ul className="space-y-2">
          <li className="flex items-start space-x-2.5 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
            <span>
              Based on adjusted comparable sales within the search radius and date range
            </span>
          </li>
          <li className="flex items-start space-x-2.5 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
            <span>
              Adjustments applied for differences in size, age, features, and location
            </span>
          </li>
          <li className="flex items-start space-x-2.5 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
            <span>
              Market trend data and neighborhood characteristics considered in AI analysis
            </span>
          </li>
          <li className="flex items-start space-x-2.5 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
            <span>
              Confidence reflects data quality, number of comps, and similarity to subject
            </span>
          </li>
        </ul>
      </div>
    </Card>
  );
}
