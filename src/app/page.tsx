import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  FileText,
  BarChart3,
  Home,
  Users,
  TrendingUp,
  Building2,
  Shield,
  ChevronRight,
  CheckCircle,
  Star,
  ArrowRight,
  Landmark,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Real Estate Comps — True Sold Data, Not Listings',
  description:
    'Get accurate property valuations from actual county-recorded sold prices. AI-powered comp reports for homeowners, agents, investors, and lenders. Reports from $4.99.',
};

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

const steps = [
  {
    icon: Search,
    title: 'Search an Address',
    description:
      'Enter any US property address. We pull public record data in seconds.',
  },
  {
    icon: BarChart3,
    title: 'Find True Comps',
    description:
      'Our AI matches comparable SOLD properties from county recorder data — not listing estimates.',
  },
  {
    icon: FileText,
    title: 'Get Your Report',
    description:
      'Download a professional PDF with value estimate, comp details, adjustments, and market analysis.',
  },
];

const audiences = [
  {
    icon: Home,
    title: 'Homeowners',
    description: 'Know your home\'s real value before selling, refinancing, or challenging taxes.',
    href: '/for-homeowners',
  },
  {
    icon: Users,
    title: 'Real Estate Agents',
    description: 'Generate branded CMA-style reports for listing presentations in minutes.',
    href: '/for-agents',
  },
  {
    icon: TrendingUp,
    title: 'Investors',
    description: 'Evaluate deals with actual sold data, not inflated asking prices.',
    href: '/for-investors',
  },
  {
    icon: Landmark,
    title: 'Lenders & Appraisers',
    description: 'Quick pre-qualification value checks backed by county records.',
    href: '#',
  },
  {
    icon: Briefcase,
    title: 'Anyone',
    description: 'Curious about what a home actually sold for? We have the real data.',
    href: '/search',
  },
];

const stats = [
  { value: '38', label: 'Disclosure States' },
  { value: '158M+', label: 'Property Records' },
  { value: '99.2%', label: 'Address Coverage' },
  { value: '<30s', label: 'Report Generation' },
];

/* ────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden gradient-navy text-white">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(198,156,109,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-gold-300 mb-8">
            <Shield className="w-3.5 h-3.5" />
            County-Verified Sold Data
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]">
            The True Comps.{' '}
            <span className="text-gradient-gold">Not Listed. SOLD.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            AI-powered comp reports built from actual county-recorded sale prices.
            Not Zestimates. Not listing data.{' '}
            <span className="text-white font-medium">Real sold prices.</span>
          </p>

          {/* Search bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <Link href="/search">
              <div className="relative group cursor-pointer">
                <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 lg:py-5 transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30">
                  <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-400 text-base lg:text-lg">
                    Enter any US address to get started...
                  </span>
                  <ArrowRight className="w-5 h-5 text-gold-400 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Price tag */}
          <p className="mt-6 text-sm text-gray-400">
            Reports from{' '}
            <span className="text-gold-400 font-semibold">$4.99</span> &middot;
            No subscription required
          </p>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-navy-900">
              How It Works
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              From address to report in under 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center group">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-900 text-gold-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7" />
                </div>
                {/* Connector line (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-gold-200" />
                )}
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── WHY TRUE COMPS ───── */}
      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Explanation */}
            <div>
              <span className="text-xs font-semibold text-gold-500 uppercase tracking-wider">
                Why True Comps?
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-navy-900 mt-3">
                Listing Prices Lie.
                <br />
                <span className="text-gradient-gold">Sold Prices Don&apos;t.</span>
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Most online &ldquo;estimates&rdquo; are built from listing prices, algorithmic
                guesses, and stale MLS data. They show what sellers <em>hope</em> to get, not
                what buyers actually paid.
              </p>
              <p className="mt-3 text-gray-600 leading-relaxed">
                We go straight to county recorder offices and public deed transfers. Our
                comps are real transactions with verified sale prices, transfer taxes, and
                deed types. No listing fluff.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'County-verified deed recordings',
                  'Transfer tax reverse-engineering for price validation',
                  'AI-matched comps, not just proximity',
                  'Per-comp adjustments for size, age, condition & more',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-navy-900">
                    <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Visual comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Their data */}
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">
                  Listing-Based Estimates
                </p>
                <div className="space-y-3 text-sm text-red-700/70">
                  <div className="h-3 bg-red-200/50 rounded w-full" />
                  <div className="h-3 bg-red-200/50 rounded w-5/6" />
                  <div className="h-3 bg-red-200/50 rounded w-3/4" />
                </div>
                <p className="text-xs text-red-500 mt-4 italic">
                  &ldquo;Based on asking prices and algorithms&rdquo;
                </p>
              </div>

              {/* Our data */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
                  True Sold Data
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">123 Oak St</span>
                    <span className="font-semibold text-green-800">$485,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">456 Elm Ave</span>
                    <span className="font-semibold text-green-800">$472,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">789 Pine Dr</span>
                    <span className="font-semibold text-green-800">$498,000</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-4 italic">
                  &ldquo;County-recorded deed transfers&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── WHO IT'S FOR ───── */}
      <section className="section-padding bg-navy-900 text-white">
        <div className="container-main">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">
              Built for Everyone Who Needs the Truth
            </h2>
            <p className="mt-3 text-gray-400 max-w-xl mx-auto">
              Whether you&apos;re buying, selling, investing, or lending.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {audiences.map((audience) => (
              <Link
                key={audience.title}
                href={audience.href}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-gold-400/30 transition-all duration-300"
              >
                <audience.icon className="w-8 h-8 text-gold-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">{audience.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {audience.description}
                </p>
                <ChevronRight className="w-4 h-4 text-gold-400 mt-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── WHITE-LABEL HIGHLIGHT ───── */}
      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl shadow-navy-900/10 border border-gray-100 overflow-hidden max-w-sm mx-auto lg:mx-0">
                {/* Header */}
                <div className="bg-navy-900 p-5">
                  <div className="flex items-center justify-between">
                    <div className="bg-gold-400 px-3 py-1.5 rounded-lg text-navy-900 text-xs font-bold">
                      YOUR LOGO
                    </div>
                    <div className="w-10 h-10 bg-gold-400/30 rounded-full" />
                  </div>
                  <p className="text-white text-sm font-semibold mt-3">Jane Smith, REALTOR</p>
                  <p className="text-gray-400 text-xs">DRE# 01234567</p>
                </div>
                {/* Body */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-gold-500 font-semibold uppercase tracking-wider">
                    Comparable Sales Report
                  </p>
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                  <div className="bg-gold-50 rounded-lg p-3 text-center mt-4">
                    <p className="text-xs text-gray-500">AI Estimated Value</p>
                    <p className="text-xl font-display font-bold text-navy-900">$485,000</p>
                  </div>
                </div>
              </div>
              {/* Decorative blob */}
              <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-gold-100 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Text */}
            <div>
              <span className="text-xs font-semibold text-gold-500 uppercase tracking-wider">
                For Real Estate Professionals
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-navy-900 mt-3">
                White-Label Reports
                <br />
                <span className="text-gradient-gold">With Your Branding</span>
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Upload your logo, headshot, and company colors. Generate client-ready
                comp reports that look like they came from your own brokerage.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Your logo on every page',
                  'Agent headshot and contact info',
                  'Custom brand colors',
                  'Client-ready PDF in seconds',
                  'Perfect for listing presentations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-navy-900">
                    <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/for-agents">
                  <span className="inline-flex items-center gap-2 text-gold-500 font-semibold text-sm hover:text-gold-600 transition-colors">
                    Learn more for agents
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section className="section-padding bg-gray-50" id="pricing">
        <div className="container-main">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-navy-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Pay per report. No subscriptions. No hidden fees.
            </p>
          </div>

          {/* Inline pricing cards for the landing page */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Basic',
                price: '$4.99',
                features: ['Up to 5 comps', 'Value estimate', 'PDF download'],
                popular: false,
              },
              {
                name: 'Pro',
                price: '$14.99',
                features: [
                  'Up to 15 comps',
                  'AI narrative',
                  'Market trends',
                  'School & crime data',
                  'PDF download',
                ],
                popular: true,
              },
              {
                name: 'Branded',
                price: '$24.99',
                features: [
                  'Everything in Pro',
                  'Your logo & branding',
                  'Agent headshot',
                  'White-label PDF',
                ],
                popular: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                  tier.popular
                    ? 'border-gold-400 shadow-xl shadow-gold-400/10 bg-white'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-400 text-navy-900 text-xs font-bold rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-display font-bold text-navy-900">{tier.name}</h3>
                <p className="text-3xl font-display font-bold text-navy-900 mt-2">
                  {tier.price}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">per report</p>
                <ul className="mt-5 space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/search" className="mt-6">
                  <span
                    className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-colors ${
                      tier.popular
                        ? 'bg-gold-400 text-navy-900 hover:bg-gold-500'
                        : 'bg-navy-900 text-white hover:bg-navy-800'
                    }`}
                  >
                    Get Started
                  </span>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            <Link href="/pricing" className="text-gold-500 hover:text-gold-600 font-medium">
              View full pricing comparison
            </Link>
          </p>
        </div>
      </section>

      {/* ───── TRUST BAR ───── */}
      <section className="py-12 bg-navy-900">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-display font-bold text-gold-400">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section className="section-padding">
        <div className="container-main text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-navy-900">
            Ready to See the Real Numbers?
          </h2>
          <p className="mt-3 text-gray-600 max-w-lg mx-auto">
            Enter any US address and get a professional comp report in under 30 seconds.
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <Link href="/search">
              <span className="flex items-center justify-center gap-3 bg-navy-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20">
                <Search className="w-5 h-5" />
                Search an Address Now
              </span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            No account required to search. Pay only when you generate a report.
          </p>
        </div>
      </section>
    </>
  );
}
