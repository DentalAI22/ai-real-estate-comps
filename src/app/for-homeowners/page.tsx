import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Home,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Scale,
  TrendingUp,
  Shield,
  FileText,
  Landmark,
  Heart,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'For Homeowners',
  description:
    'Know your home\'s real value. Get accurate property valuations based on actual sold prices from county records. Perfect for selling, refinancing, or tax challenges.',
};

const useCases = [
  {
    icon: DollarSign,
    title: 'Selling Your Home',
    description: 'Know exactly what comparable homes have sold for before you list. Price your home right from day one.',
  },
  {
    icon: Landmark,
    title: 'Refinancing',
    description: 'Support your refinance application with recent sold data showing your home\'s current market value.',
  },
  {
    icon: Scale,
    title: 'Tax Assessment Challenge',
    description: 'If your property tax assessment seems too high, use actual sold data to build your appeal case.',
  },
  {
    icon: Heart,
    title: 'Curiosity',
    description: 'Just want to know what your home is worth? Get a real answer based on what your neighbors actually sold for.',
  },
];

const benefits = [
  'Actual sold prices from county records',
  'Not a guess -- real deed recordings',
  'Comparable properties matched by AI',
  'Per-property adjustments for accuracy',
  'Neighborhood demographics included',
  'School and safety data',
  'Professional PDF you can share',
  'Reports start at just $4.99',
];

export default function ForHomeownersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-400/10 rounded-full text-xs font-semibold text-gold-400 mb-6">
            <Home className="w-3.5 h-3.5" />
            For Homeowners
          </span>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white leading-tight">
            Know Your Home&apos;s
            <br />
            <span className="text-gradient-gold">Real Value</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Online estimates are guesses. We show you what homes like yours have
            actually sold for -- straight from county records.
          </p>
          <div className="mt-8">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-gold-400 text-navy-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-500 transition-colors"
            >
              Check Your Home Value
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Starting at $4.99 &middot; No subscription
          </p>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <h3 className="font-display text-xl font-bold text-red-700 mb-4">
                What Online Estimates Give You
              </h3>
              <ul className="space-y-3 text-sm text-red-600/80">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">x</span>
                  Algorithmic guesses based on limited data
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">x</span>
                  Listing prices (what sellers hope to get)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">x</span>
                  Wide ranges that are not actionable
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">x</span>
                  No adjustments for property differences
                </li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <h3 className="font-display text-xl font-bold text-green-700 mb-4">
                What We Give You
              </h3>
              <ul className="space-y-3 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Actual sold prices from county deed recordings
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  AI-matched comparable properties
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Per-comp adjustments for accuracy
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Professional PDF report you can share
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900 text-center mb-12">
            When You Need a True Value
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <uc.icon className="w-8 h-8 text-gold-400 mb-3" />
                <h3 className="text-base font-semibold text-navy-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <FileText className="w-8 h-8 text-gold-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900">
              What&apos;s in Your Report
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((benefit) => (
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

      {/* Trust */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-gold-400" />
            <TrendingUp className="w-6 h-6 text-gold-400" />
          </div>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Our reports use the same data sources that licensed appraisers rely on.
            While not a formal appraisal, our AI estimates typically fall within 3-5%
            of appraised values in disclosure states.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-3">
            Find Out What Your Home Is Worth
          </h2>
          <p className="text-gray-400 mb-8">
            Reports start at $4.99. No subscription. No account required.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-gold-400 text-navy-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-500 transition-colors"
          >
            Enter Your Address
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
