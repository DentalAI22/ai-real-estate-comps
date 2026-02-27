import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  Database,
  Brain,
  FileText,
  Shield,
  ArrowRight,
  CheckCircle,
  Landmark,
  Scale,
  Layers,
  Cpu,
  Gauge,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how AI Real Estate Comps generates accurate property valuations from county-recorded sold data, AI matching, and per-comp adjustments.',
};

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Enter an Address',
    description:
      'Type any US property address into our search bar. We instantly pull the property profile from public records including square footage, bedrooms, bathrooms, lot size, year built, and assessment data.',
  },
  {
    icon: Database,
    number: '02',
    title: 'We Search County Records',
    description:
      'Our system queries public deed recordings, transfer tax filings, and county assessor databases within your selected radius and date range. We pull actual recorded sale prices -- not listing prices or algorithmic estimates.',
  },
  {
    icon: Brain,
    number: '03',
    title: 'AI Matches & Adjusts',
    description:
      'Our AI engine scores each potential comp based on similarity to your subject property. It then calculates per-comp adjustments for differences in size, bedrooms, bathrooms, age, lot size, pool, garage, condition, location, and market conditions.',
  },
  {
    icon: FileText,
    number: '04',
    title: 'Generate Your Report',
    description:
      'Choose your tier (Basic, Pro, or Branded) and get a professional PDF report with value estimate, comp details, adjustments grid, market analysis, and neighborhood data. Pro and Branded tiers include an AI-written narrative summary.',
  },
];

const dataSources = [
  {
    icon: Landmark,
    name: 'County Recorder Offices',
    description: 'Deed recordings with actual sale prices and transfer taxes from county recorder offices across 38 disclosure states.',
  },
  {
    icon: Scale,
    name: 'County Assessor Data',
    description: 'Property characteristics, assessed values, tax amounts, and parcel information from county assessor databases.',
  },
  {
    icon: Layers,
    name: 'Public Deed Records',
    description: 'Warranty deeds, grant deeds, and other recorded documents that verify ownership transfers and sale terms.',
  },
  {
    icon: Cpu,
    name: 'AI Analysis Engine',
    description: 'Our proprietary AI engine matches comps, calculates adjustments, generates narratives, and produces confidence scores.',
  },
];

const methodology = [
  'Distance-weighted comp selection (closer = better)',
  'Recency scoring (more recent sales weighted higher)',
  'Per-comp feature adjustments (10 categories)',
  'Transfer tax verification in applicable states',
  'Deed type filtering (arm\'s-length transactions only)',
  'Market conditions time adjustment',
  'Outlier detection and exclusion',
  'Confidence scoring based on data quality',
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white">
            How It Works
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            From address to professional comp report in under 30 seconds.
            Here is exactly what happens behind the scenes.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-6 lg:gap-10">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-[calc(100%)] bg-gold-200" />
                )}

                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-navy-900 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-gold-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <span className="text-xs font-bold text-gold-500 tracking-wider">
                    STEP {step.number}
                  </span>
                  <h2 className="text-xl lg:text-2xl font-display font-bold text-navy-900 mt-1">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mt-3">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900">
              Our Data Sources
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              We use the same public record sources that licensed appraisers rely on.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {dataSources.map((source) => (
              <div
                key={source.name}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <source.icon className="w-8 h-8 text-gold-400 mb-3" />
                <h3 className="text-base font-semibold text-navy-900 mb-2">{source.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{source.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes a True Comp */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Gauge className="w-10 h-10 text-gold-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900">
              Our AI Methodology
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              What makes a good comp? Our AI considers multiple factors to find the
              most relevant comparable sales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {methodology.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100"
              >
                <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-navy-900">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="max-w-xl mx-auto px-4">
          <Shield className="w-10 h-10 text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-3">
            See It in Action
          </h2>
          <p className="text-gray-400 mb-8">
            Enter any US address to get a professional comp report.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-gold-400 text-navy-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-500 transition-colors"
          >
            Try It Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
