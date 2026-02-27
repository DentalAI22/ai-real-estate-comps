'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Paintbrush, Settings, ChevronRight, Download, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

type TabKey = 'reports' | 'branding' | 'account';

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
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('reports');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'reports', label: 'My Reports', icon: <FileText className="w-4 h-4" /> },
    { key: 'branding', label: 'My Branding', icon: <Paintbrush className="w-4 h-4" /> },
    { key: 'account', label: 'Account', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your reports, branding, and account settings
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-navy-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reports tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Recent Reports</h2>
              <Link href="/dashboard/reports">
                <Button variant="ghost" size="sm">
                  View all <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {MOCK_REPORTS.map((report) => (
              <Card key={report.id} padding="md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-navy-900">{report.address}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          report.type === 'branded'
                            ? 'bg-gold-100 text-gold-700'
                            : report.type === 'pro'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
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
                      Est. {formatCurrency(report.valueEstimate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/report/${report.id}`}>
                      <Button variant="secondary" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <Download className="w-3.5 h-3.5 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <div className="text-center py-4">
              <Link href="/search">
                <Button variant="gold">Generate New Report</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Branding tab */}
        {activeTab === 'branding' && (
          <Card padding="lg">
            <div className="text-center py-8">
              <Paintbrush className="w-12 h-12 text-gold-400 mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-navy-900 mb-2">
                Agent Branding
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                Set up your logo, headshot, company colors, and contact info for
                white-label branded reports.
              </p>
              <Link href="/dashboard/branding">
                <Button variant="gold">
                  Set Up Branding
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Account tab */}
        {activeTab === 'account' && (
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-navy-900 mb-6">Account Settings</h2>
            <div className="space-y-6 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-semibold text-navy-900">Demo User</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-semibold text-navy-900">demo@example.com</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-semibold text-navy-900">Agent</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reports Purchased</p>
                  <p className="text-sm font-semibold text-navy-900">3</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <Button variant="secondary" size="sm">
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
