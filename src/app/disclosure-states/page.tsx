import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, XCircle, Info, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclosure States Map',
  description:
    'See which US states publicly record real estate sale prices. 38 disclosure states, 12 non-disclosure states. Learn what this means for your comp report accuracy.',
};

type DisclosureLevel = 'full' | 'partial' | 'non';

interface StateInfo {
  code: string;
  name: string;
  level: DisclosureLevel;
  notes: string;
}

const states: StateInfo[] = [
  { code: 'AL', name: 'Alabama', level: 'full', notes: 'Deed stamps required' },
  { code: 'AK', name: 'Alaska', level: 'non', notes: 'No transfer tax' },
  { code: 'AZ', name: 'Arizona', level: 'full', notes: 'Affidavit of value required' },
  { code: 'AR', name: 'Arkansas', level: 'full', notes: 'Transfer tax recorded' },
  { code: 'CA', name: 'California', level: 'full', notes: 'Documentary transfer tax' },
  { code: 'CO', name: 'Colorado', level: 'full', notes: 'Real estate transfer declaration' },
  { code: 'CT', name: 'Connecticut', level: 'full', notes: 'Conveyance tax' },
  { code: 'DE', name: 'Delaware', level: 'full', notes: 'Transfer tax recorded' },
  { code: 'DC', name: 'District of Columbia', level: 'full', notes: 'Recordation tax' },
  { code: 'FL', name: 'Florida', level: 'full', notes: 'Documentary stamp tax' },
  { code: 'GA', name: 'Georgia', level: 'full', notes: 'Transfer tax recorded' },
  { code: 'HI', name: 'Hawaii', level: 'full', notes: 'Conveyance tax' },
  { code: 'ID', name: 'Idaho', level: 'non', notes: 'No disclosure requirement' },
  { code: 'IL', name: 'Illinois', level: 'full', notes: 'Transfer declaration' },
  { code: 'IN', name: 'Indiana', level: 'non', notes: 'Sales disclosure optional since 2019' },
  { code: 'IA', name: 'Iowa', level: 'full', notes: 'Declaration of value' },
  { code: 'KS', name: 'Kansas', level: 'non', notes: 'No disclosure requirement' },
  { code: 'KY', name: 'Kentucky', level: 'full', notes: 'Transfer tax stamps' },
  { code: 'LA', name: 'Louisiana', level: 'non', notes: 'No disclosure requirement' },
  { code: 'ME', name: 'Maine', level: 'non', notes: 'Transfer tax but limited access' },
  { code: 'MD', name: 'Maryland', level: 'full', notes: 'Transfer and recordation tax' },
  { code: 'MA', name: 'Massachusetts', level: 'full', notes: 'Excise tax stamps' },
  { code: 'MI', name: 'Michigan', level: 'full', notes: 'State transfer tax' },
  { code: 'MN', name: 'Minnesota', level: 'full', notes: 'Deed tax certificate' },
  { code: 'MS', name: 'Mississippi', level: 'non', notes: 'No disclosure requirement' },
  { code: 'MO', name: 'Missouri', level: 'non', notes: 'No disclosure requirement' },
  { code: 'MT', name: 'Montana', level: 'non', notes: 'No disclosure requirement' },
  { code: 'NE', name: 'Nebraska', level: 'full', notes: 'Documentary stamp tax' },
  { code: 'NV', name: 'Nevada', level: 'full', notes: 'Real property transfer tax' },
  { code: 'NH', name: 'New Hampshire', level: 'full', notes: 'Real estate transfer tax' },
  { code: 'NJ', name: 'New Jersey', level: 'full', notes: 'Realty transfer fee' },
  { code: 'NM', name: 'New Mexico', level: 'non', notes: 'No disclosure requirement' },
  { code: 'NY', name: 'New York', level: 'full', notes: 'Transfer tax recorded' },
  { code: 'NC', name: 'North Carolina', level: 'full', notes: 'Excise tax stamps' },
  { code: 'ND', name: 'North Dakota', level: 'non', notes: 'No disclosure requirement' },
  { code: 'OH', name: 'Ohio', level: 'full', notes: 'Real property conveyance fee' },
  { code: 'OK', name: 'Oklahoma', level: 'full', notes: 'Documentary stamp tax' },
  { code: 'OR', name: 'Oregon', level: 'full', notes: 'Real estate transfer tax' },
  { code: 'PA', name: 'Pennsylvania', level: 'full', notes: 'Realty transfer tax' },
  { code: 'RI', name: 'Rhode Island', level: 'full', notes: 'Real estate conveyance tax' },
  { code: 'SC', name: 'South Carolina', level: 'full', notes: 'Deed recording fee + stamps' },
  { code: 'SD', name: 'South Dakota', level: 'partial', notes: 'Transfer tax but limited' },
  { code: 'TN', name: 'Tennessee', level: 'full', notes: 'Transfer tax recorded' },
  { code: 'TX', name: 'Texas', level: 'non', notes: 'No disclosure requirement' },
  { code: 'UT', name: 'Utah', level: 'non', notes: 'No disclosure requirement' },
  { code: 'VT', name: 'Vermont', level: 'full', notes: 'Property transfer tax' },
  { code: 'VA', name: 'Virginia', level: 'full', notes: 'Grantor tax recorded' },
  { code: 'WA', name: 'Washington', level: 'full', notes: 'Real estate excise tax' },
  { code: 'WV', name: 'West Virginia', level: 'full', notes: 'Excise tax recorded' },
  { code: 'WI', name: 'Wisconsin', level: 'full', notes: 'Transfer fee recorded' },
  { code: 'WY', name: 'Wyoming', level: 'non', notes: 'No transfer tax' },
];

const levelConfig: Record<
  DisclosureLevel,
  { label: string; color: string; bg: string; icon: typeof CheckCircle; description: string }
> = {
  full: {
    label: 'Full Disclosure',
    color: 'text-green-700',
    bg: 'bg-green-50',
    icon: CheckCircle,
    description: 'Sale prices are publicly recorded and accessible.',
  },
  partial: {
    label: 'Partial Disclosure',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    icon: AlertTriangle,
    description: 'Some sale data available but with limitations.',
  },
  non: {
    label: 'Non-Disclosure',
    color: 'text-red-700',
    bg: 'bg-red-50',
    icon: XCircle,
    description: 'Sale prices are not publicly recorded.',
  },
};

export default function DisclosureStatesPage() {
  const fullCount = states.filter((s) => s.level === 'full').length;
  const partialCount = states.filter((s) => s.level === 'partial').length;
  const nonCount = states.filter((s) => s.level === 'non').length;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white">
            Disclosure States Guide
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Not all states publicly record real estate sale prices. Here is a
            complete guide to disclosure requirements across all 50 states.
          </p>
        </div>
      </section>

      {/* Summary stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-6 text-center border border-green-100">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-green-700">{fullCount}</p>
              <p className="text-sm text-green-600">Full Disclosure</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 text-center border border-yellow-100">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-yellow-700">{partialCount}</p>
              <p className="text-sm text-yellow-600">Partial Disclosure</p>
            </div>
            <div className="bg-red-50 rounded-xl p-6 text-center border border-red-100">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-red-700">{nonCount}</p>
              <p className="text-sm text-red-600">Non-Disclosure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex items-start gap-4">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">What does this mean?</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                <strong>Disclosure states</strong> require that real estate sale prices be
                publicly recorded, typically through transfer taxes or deed stamps. This means
                we can verify the exact price paid. <strong>Non-disclosure states</strong> do
                not require public recording of sale prices. In these states, we estimate
                prices using transfer tax calculations, mortgage recordings, and assessed values.
                Reports in disclosure states are generally more accurate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* State list */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-8 text-center">
            All 50 States + DC
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {states.map((state) => {
              const config = levelConfig[state.level];
              const Icon = config.icon;
              return (
                <div
                  key={state.code}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} border-opacity-50`}
                  style={{ borderColor: 'transparent' }}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.color}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-navy-900">{state.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">{state.code}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{state.notes}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
            Ready to Pull Comps?
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            We cover all 50 states with the best available data for each.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-gold-400 text-navy-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-500 transition-colors"
          >
            Search an Address
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
