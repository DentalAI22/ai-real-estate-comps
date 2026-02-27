'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Download, Eye, ArrowLeft, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

const MOCK_REPORTS = [
  {
    id: 'rpt-001',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'CA',
    type: 'pro',
    valueEstimate: 735000,
    compCount: 5,
    createdAt: '2026-02-25T10:30:00Z',
    pdfUrl: null,
  },
  {
    id: 'rpt-002',
    address: '123 Oak Street',
    city: 'Los Angeles',
    state: 'CA',
    type: 'basic',
    valueEstimate: 485000,
    compCount: 4,
    createdAt: '2026-02-20T14:15:00Z',
    pdfUrl: null,
  },
  {
    id: 'rpt-003',
    address: '456 Elm Avenue',
    city: 'Beverly Hills',
    state: 'CA',
    type: 'branded',
    valueEstimate: 1250000,
    compCount: 8,
    createdAt: '2026-02-18T09:00:00Z',
    pdfUrl: null,
  },
  {
    id: 'rpt-004',
    address: '789 Pine Drive',
    city: 'Santa Monica',
    state: 'CA',
    type: 'pro',
    valueEstimate: 950000,
    compCount: 6,
    createdAt: '2026-02-15T16:45:00Z',
    pdfUrl: null,
  },
  {
    id: 'rpt-005',
    address: '321 Cedar Court',
    city: 'Pasadena',
    state: 'CA',
    type: 'basic',
    valueEstimate: 620000,
    compCount: 3,
    createdAt: '2026-02-10T11:20:00Z',
    pdfUrl: null,
  },
];

const typeBadgeClasses: Record<string, string> = {
  branded: 'bg-gold-100 text-gold-700',
  pro: 'bg-blue-100 text-blue-700',
  basic: 'bg-gray-100 text-gray-600',
};

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-900 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">My Reports</h1>
          <p className="text-gray-400 text-sm mt-1">
            {MOCK_REPORTS.length} reports generated
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {MOCK_REPORTS.length === 0 ? (
          <Card padding="lg" className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-navy-900 mb-2">No reports yet</h2>
            <p className="text-sm text-gray-600 mb-6">
              Search for an address to generate your first comp report.
            </p>
            <Link href="/search">
              <Button variant="gold">
                <Search className="w-4 h-4 mr-2" />
                Search Address
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {MOCK_REPORTS.map((report) => (
              <Card key={report.id} padding="md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-navy-900 truncate">{report.address}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                          typeBadgeClasses[report.type] || ''
                        }`}
                      >
                        {report.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {report.city}, {report.state} &middot; {report.compCount} comps &middot;{' '}
                      {formatDate(report.createdAt)}
                    </p>
                    <p className="text-sm font-semibold text-navy-900 mt-1">
                      Estimated Value: {formatCurrency(report.valueEstimate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/report/${report.id}`}>
                      <Button variant="secondary" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
