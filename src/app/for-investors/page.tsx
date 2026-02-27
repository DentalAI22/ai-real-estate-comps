import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle,
  Calculator,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'For Investors',
  description:
    'Evaluate investment properties with actual sold data from county records. Make data-driven decisions with AI-powered comp reports. No more guessing.',
};

const features = [
  {
    icon: DollarSign,
    title: 'Real Sold Prices',
    description: 'See what properties actually sold for, not what sellers were hoping to get. County-recorded deed transfers, not listing data.',
  },
  {
    icon: Calculator,
    title: 'Deal Evaluation',
    description: 'Instantly compare an asking price against what comparable properties have actually sold for in the area.',
  },
  {
    icon: BarChart3,
    title: 'Market Trends',
    description: 'Track appreciation rates, days on market, months of supply, and sale-to-list ratios to time your investments.',
  },
  {
    icon: Target,
    title: 'AI Adjustments',
    description: 'Per-comp price adjustments for size, condition, age, and features. Understand the true value, not just averages.',
  },
  {
    icon: Clock,
    title: 'Fast Underwriting',
    description: 'Generate a comp report in under 30 seconds. Evaluate multiple properties in the time it takes to pull one MLS comp.',
  },
  {
    icon: Shield,
    title: 'Confidence Scoring',
    description: 'Every comp gets a confidence score based on similarity, distance, and recency. Know which data you can trust.',
  },
];

const investorBenefits = [
  'Evaluate flip potential with actual sold data',
  'Compare asking price vs. true market value',
  'Track neighborhood appreciation trends',
  'Identify undervalued properties',
  'Due diligence for multi-family acquisitions',
  'Support for refinance and BRRRR analysis',
  'ROI calculations based on real comparables',
  'No subscription -- pay per report',
];

export default function ForInvestorsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-400/10 rounded-full text-xs font-semibold text-gold-400 mb-6">
            <TrendingUp className="w-3.5 h-3.5" />
            For Real Estate Investors
          </span>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white leading-tight">
            Evaluate Deals with
            <br />
            <span className="text-gradient-gold">Actual Sold Data</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Stop guessing. Start analyzing. Get AI-powered comp reports from county
            records in seconds -- not days.
          </p>
          <div className="mt-8">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-gold-400 text-navy-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-500 transition-colors"
            >
              Analyze a Property
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900">
              Built for Smart Investors
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Every feature designed to help you make data-driven investment decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <feature.icon className="w-8 h-8 text-gold-400 mb-3" />
                <h3 className="text-base font-semibold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900">
              Investor Use Cases
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {investorBenefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100"
              >
                <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-navy-900">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h3 className="font-semibold text-red-700 mb-3">Without True Comps</h3>
              <ul className="space-y-2 text-sm text-red-600/80">
                <li>Relying on Zillow estimates</li>
                <li>Guessing based on listing prices</li>
                <li>Overpaying for properties</li>
                <li>Hours of manual research</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h3 className="font-semibold text-green-700 mb-3">With True Comps</h3>
              <ul className="space-y-2 text-sm text-green-600/80">
                <li>County-verified sold prices</li>
                <li>AI-adjusted valuations</li>
                <li>Confident offer amounts</li>
                <li>Reports in 30 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-3">
            Start Evaluating Properties
          </h2>
          <p className="text-gray-400 mb-8">
            Pro reports from $14.99 each. No subscription required.
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
