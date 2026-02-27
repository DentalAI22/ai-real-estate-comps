'use client';

import React from 'react';
import {
  Download,
  MapPin,
  Home,
  FileText,
  TrendingUp,
  Building2,
  DollarSign,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CompTable from '@/components/report/CompTable';
import MarketAnalysis from '@/components/report/MarketAnalysis';
import NeighborhoodProfile from '@/components/report/NeighborhoodProfile';
import PriceAdjustments from '@/components/report/PriceAdjustments';
import ValuationSummary from '@/components/report/ValuationSummary';
import { formatCurrency, formatNumber, formatDate, classNames } from '@/lib/utils';
import type { GeneratedReport } from '@/types';

interface ReportViewerProps {
  report: GeneratedReport;
  className?: string;
}

export default function ReportViewer({ report, className }: ReportViewerProps) {
  const { subjectProperty, comps, marketTrends, neighborhoodData, schoolData, crimeData } =
    report;

  return (
    <div className={classNames('space-y-8', className)}>
      {/* Report header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-semibold text-gold-600 uppercase tracking-wider">
              {report.reportType} Report
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-navy-900">
            Comparable Sales Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated {formatDate(report.createdAt)}
          </p>
        </div>
        {report.pdfUrl && (
          <Button
            variant="primary"
            onClick={() => window.open(report.pdfUrl!, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Executive summary */}
      <Card padding="lg">
        <h2 className="text-lg font-display font-bold text-navy-900 mb-4">
          Executive Summary
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          <p>{report.aiNarrative}</p>
        </div>
      </Card>

      {/* Subject property */}
      <Card padding="lg">
        <div className="flex items-center space-x-2 mb-4">
          <Home className="w-5 h-5 text-gold-500" />
          <h2 className="text-lg font-display font-bold text-navy-900">
            Subject Property
          </h2>
        </div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-navy-900">
            {subjectProperty.address}
          </h3>
          <p className="text-sm text-gray-500 flex items-center mt-0.5">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {subjectProperty.city}, {subjectProperty.state} {subjectProperty.zip}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-sm font-semibold text-navy-900">
              {subjectProperty.propertyType}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Beds / Baths</p>
            <p className="text-sm font-semibold text-navy-900">
              {subjectProperty.bedrooms} / {subjectProperty.bathrooms}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Sq Ft</p>
            <p className="text-sm font-semibold text-navy-900">
              {formatNumber(subjectProperty.sqft)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Lot Size</p>
            <p className="text-sm font-semibold text-navy-900">
              {formatNumber(subjectProperty.lotSqft)} sqft
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Year Built</p>
            <p className="text-sm font-semibold text-navy-900">{subjectProperty.yearBuilt}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Assessed Value</p>
            <p className="text-sm font-semibold text-navy-900">
              {formatCurrency(subjectProperty.assessedValue)}
            </p>
          </div>
        </div>
      </Card>

      {/* Valuation summary */}
      <ValuationSummary
        valueLow={report.valueLow}
        valueHigh={report.valueHigh}
        valueEstimate={report.valueEstimate}
        confidence={report.aiConfidence}
      />

      {/* Comp analysis table */}
      <Card padding="lg">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-gold-500" />
          <h2 className="text-lg font-display font-bold text-navy-900">
            Comparable Sales ({comps.length})
          </h2>
        </div>
        <CompTable comps={comps} />
      </Card>

      {/* Price adjustments */}
      {comps.length > 0 && (
        <Card padding="lg">
          <h2 className="text-lg font-display font-bold text-navy-900 mb-4">
            Price Adjustments
          </h2>
          <PriceAdjustments comps={comps} />
        </Card>
      )}

      {/* Market trends */}
      {marketTrends && (
        <Card padding="lg">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gold-500" />
            <h2 className="text-lg font-display font-bold text-navy-900">Market Trends</h2>
          </div>
          <MarketAnalysis marketTrends={marketTrends} />
        </Card>
      )}

      {/* Neighborhood profile */}
      {(neighborhoodData || schoolData || crimeData) && (
        <Card padding="lg">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-5 h-5 text-gold-500" />
            <h2 className="text-lg font-display font-bold text-navy-900">
              Neighborhood Profile
            </h2>
          </div>
          <NeighborhoodProfile
            neighborhoodData={neighborhoodData}
            schoolData={schoolData}
            crimeData={crimeData}
          />
        </Card>
      )}

      {/* Footer disclaimer */}
      <div className="text-center py-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 max-w-2xl mx-auto">
          This report is not an appraisal. It is generated from publicly available data
          sources and AI analysis. Sales data is sourced from public records and may not
          reflect all market transactions. Always consult a licensed appraiser for official
          property valuations.
        </p>
      </div>
    </div>
  );
}
