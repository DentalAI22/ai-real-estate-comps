import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowRight,
  FileText,
  Paintbrush,
  Clock,
  DollarSign,
  Users,
  Presentation,
  Zap,
  Shield,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'For Real Estate Agents',
  description:
    'White-label branded comp reports for real estate agents. Your logo, your colors, your brand. Generate client-ready CMAs in under 30 seconds.',
};

const benefits = [
  {
    icon: Paintbrush,
    title: 'Your Brand, Every Page',
    description: 'Upload your logo, headshot, brand colors, and contact info. Every report looks like it came from your brokerage.',
  },
  {
    icon: Clock,
    title: 'Under 30 Seconds',
    description: 'Generate a full comp report faster than pulling MLS data. AI does the analysis while you focus on clients.',
  },
  {
    icon: DollarSign,
    title: 'No Subscription',
    description: 'Pay $24.99 per branded report, or $14.99 for Pro. No monthly fees. Use it when you need it.',
  },
  {
    icon: Shield,
    title: 'County-Verified Data',
    description: 'Impress clients with actual sold prices from public records, not listing-based estimates.',
  },
  {
    icon: Presentation,
    title: 'Listing Presentations',
    description: 'Walk into every listing appointment with data-backed pricing. Win more listings with confidence.',
  },
  {
    icon: Users,
    title: 'Client Engagement',
    description: 'Send comp reports to buyer and seller leads. Professional reports build trust and demonstrate expertise.',
  },
];

const useCases = [
  'Listing presentations with sold data',
  'Buyer consultations with market analysis',
  'Price reduction conversations backed by data',
  'Pre-listing market analysis',
  'Open house follow-up materials',
  'Referral-worthy reports clients share with friends',
];

export default function ForAgentsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-400/10 rounded-full text-xs font-semibold text-gold-400 mb-6">
            <FileText className="w-3.5 h-3.5" />
            For Real Estate Agents
          </span>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white leading-tight">
            Branded Comp Reports
            <br />
            <span className="text-gradient-gold">In Under 30 Seconds</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Generate white-label CMA-style reports with your logo, headshot, and
            company branding. Actual sold data from county records.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-gold-400 text-navy-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-500 transition-colors"
            >
              Try It Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/branding"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Set Up Branding
            </Link>
          </div>
        </div>
      </section>

      {/* Report Mockup + Features */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-sm mx-auto">
                <div className="bg-navy-900 p-5">
                  <div className="flex justify-between items-center">
                    <div className="bg-gold-400 px-3 py-1.5 rounded-lg text-navy-900 text-xs font-bold">
                      YOUR LOGO
                    </div>
                    <div className="w-12 h-12 bg-gold-400/30 rounded-full" />
                  </div>
                  <p className="text-white text-sm font-semibold mt-3">Your Name, REALTOR</p>
                  <p className="text-gray-400 text-xs">Your License # | Your Brokerage</p>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gold-500 font-semibold uppercase tracking-wider">
                    Comparable Sales Report
                  </p>
                  <p className="text-base font-bold text-navy-900 mt-1">
                    123 Client&apos;s Home Street
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Beverly Hills, CA 90210</p>
                  <div className="mt-4 bg-gold-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">AI Estimated Value</p>
                    <p className="text-2xl font-display font-bold text-navy-900">$1,250,000</p>
                    <p className="text-xs text-gray-400">$1.18M - $1.32M range</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
                <div className="bg-navy-900 px-5 py-2.5 flex justify-between text-[10px] text-gray-400">
                  <span>(555) 123-4567</span>
                  <span>you@broker.com</span>
                </div>
              </div>
              <div className="absolute -z-10 -top-8 -left-8 w-64 h-64 bg-gold-100 rounded-full blur-3xl opacity-40" />
            </div>

            {/* Benefits */}
            <div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900 mb-8">
                Why Agents Love It
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-navy-900">{benefit.title}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="w-8 h-8 text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900 mb-8">
            Use It For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
            {useCases.map((uc) => (
              <div key={uc} className="flex items-start gap-2.5 text-sm text-navy-900">
                <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                {uc}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-3">
            Start Generating Branded Reports
          </h2>
          <p className="text-gray-400 mb-8">
            Set up your branding once, generate reports forever. Only $24.99 per branded report.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/branding"
              className="inline-flex items-center gap-2 bg-gold-400 text-navy-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-500 transition-colors"
            >
              Set Up Branding
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
