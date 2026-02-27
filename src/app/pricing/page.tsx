import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for AI-powered comp reports. Basic from $4.99, Pro from $14.99, Branded from $24.99. No subscriptions.',
};

const features = [
  { name: 'Comparable sales', basic: '5', pro: '15', branded: '15' },
  { name: 'County-verified sold prices', basic: true, pro: true, branded: true },
  { name: 'Value estimate range', basic: true, pro: true, branded: true },
  { name: 'Downloadable PDF', basic: true, pro: true, branded: true },
  { name: 'AI-generated narrative', basic: false, pro: true, branded: true },
  { name: 'Per-comp price adjustments', basic: false, pro: true, branded: true },
  { name: 'Market trends & statistics', basic: false, pro: true, branded: true },
  { name: 'School & crime data', basic: false, pro: true, branded: true },
  { name: 'Neighborhood demographics', basic: false, pro: true, branded: true },
  { name: 'Custom agent branding', basic: false, pro: false, branded: true },
  { name: 'Logo on every page', basic: false, pro: false, branded: true },
  { name: 'Agent headshot & bio', basic: false, pro: false, branded: true },
  { name: 'Company brand colors', basic: false, pro: false, branded: true },
  { name: 'Client-ready presentation', basic: false, pro: false, branded: true },
];

const faqs = [
  {
    q: 'Is there a subscription?',
    a: 'No. You pay per report. No monthly fees, no commitments. Buy one report or a hundred — each is individually priced.',
  },
  {
    q: 'What data sources do you use?',
    a: 'We pull from county recorder offices, public deed recordings, and transfer tax records. Our data comes from the same sources appraisers use.',
  },
  {
    q: 'How accurate are the valuations?',
    a: 'Our AI valuations are based on actual sold prices and per-comp adjustments. While not a licensed appraisal, our estimates typically fall within 3-5% of appraised values in disclosure states.',
  },
  {
    q: 'Can I use this for a listing presentation?',
    a: 'Absolutely. The Branded tier is specifically designed for agents who want client-ready reports with their own branding, logo, and contact information.',
  },
  {
    q: 'Do you cover non-disclosure states?',
    a: 'We cover all 50 states, but data quality varies. In the 38 disclosure states, we have direct access to sale prices. In non-disclosure states, we estimate prices from transfer taxes and mortgage recordings.',
  },
  {
    q: 'How fast are reports generated?',
    a: 'Most reports are generated in under 30 seconds. Complex properties or areas with many comps may take slightly longer.',
  },
];

const competitors = [
  { name: 'AI Real Estate Comps', price: '$4.99-$24.99', subscription: 'No', source: 'County Records', branding: 'Yes', ai: 'Yes' },
  { name: 'PropStream', price: '$99/mo', subscription: 'Yes', source: 'MLS + Records', branding: 'No', ai: 'No' },
  { name: 'Cloud CMA', price: '$49/mo', subscription: 'Yes', source: 'MLS Only', branding: 'Yes', ai: 'No' },
  { name: 'Zillow / Redfin', price: 'Free', subscription: 'No', source: 'Algorithm', branding: 'No', ai: 'No' },
  { name: 'DIY County Records', price: 'Free', subscription: 'No', source: 'County Records', branding: 'No', ai: 'No' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 py-16 lg:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Pay per report. No subscriptions. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: 'Basic',
                price: '$4.99',
                desc: 'Quick snapshot with sold data.',
                features: ['Up to 5 comps', 'Value estimate', 'PDF download', 'County-verified prices'],
                popular: false,
                tier: 'basic',
              },
              {
                name: 'Pro',
                price: '$14.99',
                desc: 'Full analysis with AI narrative.',
                features: [
                  'Up to 15 comps',
                  'AI narrative',
                  'Price adjustments',
                  'Market trends',
                  'School & crime data',
                  'Demographics',
                  'PDF download',
                ],
                popular: true,
                tier: 'pro',
              },
              {
                name: 'Branded',
                price: '$24.99',
                desc: 'White-label for agents.',
                features: [
                  'Everything in Pro',
                  'Your logo',
                  'Agent headshot',
                  'Brand colors',
                  'Contact info',
                  'White-label PDF',
                  'Client-ready',
                ],
                popular: false,
                tier: 'branded',
              },
            ].map((t) => (
              <div
                key={t.tier}
                className={`relative rounded-2xl border-2 p-6 lg:p-8 flex flex-col bg-white ${
                  t.popular
                    ? 'border-gold-400 shadow-xl shadow-gold-400/10 scale-[1.02]'
                    : 'border-gray-200'
                }`}
              >
                {t.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-400 text-navy-900 text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-display font-bold text-navy-900">{t.name}</h3>
                <p className="text-3xl font-display font-bold text-navy-900 mt-2">{t.price}</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-4">per report</p>
                <p className="text-sm text-gray-600 mb-6">{t.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/search"
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    t.popular
                      ? 'bg-gold-400 text-navy-900 hover:bg-gold-500'
                      : 'bg-navy-900 text-white hover:bg-navy-800'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900 text-center mb-10">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 text-navy-900 font-semibold">Basic</th>
                  <th className="text-center py-3 px-4 text-navy-900 font-semibold bg-gold-50/50">
                    Pro
                  </th>
                  <th className="text-center py-3 px-4 text-navy-900 font-semibold">Branded</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f.name} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-700">{f.name}</td>
                    <td className="py-3 px-4 text-center">
                      <FeatureValue value={f.basic} />
                    </td>
                    <td className="py-3 px-4 text-center bg-gold-50/30">
                      <FeatureValue value={f.pro} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <FeatureValue value={f.branded} />
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td className="py-4 px-4 text-navy-900">Price</td>
                  <td className="py-4 px-4 text-center text-navy-900">$4.99</td>
                  <td className="py-4 px-4 text-center text-navy-900 bg-gold-50/30">$14.99</td>
                  <td className="py-4 px-4 text-center text-navy-900">$24.99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-white text-center mb-10">
            How We Compare
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Platform</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Price</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Subscription</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Data Source</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Branding</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">AI Analysis</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c, i) => (
                  <tr
                    key={c.name}
                    className={`border-b border-white/10 ${
                      i === 0 ? 'bg-white/5' : ''
                    }`}
                  >
                    <td className={`py-3 px-4 ${i === 0 ? 'text-gold-400 font-semibold' : 'text-gray-300'}`}>
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">{c.price}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{c.subscription}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{c.source}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{c.branding}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{c.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-navy-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-600 mt-2 ml-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            No account needed. Just enter an address and choose your report tier.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-gold-400 text-navy-900 px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gold-500 transition-colors"
          >
            Search an Address
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="font-semibold text-navy-900">{value}</span>;
  }
  return value ? (
    <Check className="w-4 h-4 text-gold-500 mx-auto" />
  ) : (
    <X className="w-4 h-4 text-gray-300 mx-auto" />
  );
}
