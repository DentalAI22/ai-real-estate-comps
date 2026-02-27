'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { classNames } from '@/lib/utils';

const faqs = [
  {
    category: 'About Our Data',
    questions: [
      {
        q: 'Where does your data come from?',
        a: 'Our data comes from county recorder offices, public deed recordings, transfer tax filings, and county assessor databases. These are the same public record sources that licensed appraisers and title companies use.',
      },
      {
        q: 'How accurate are your valuations?',
        a: 'In disclosure states (38 out of 50), our valuations are based on actual recorded sale prices and typically fall within 3-5% of formal appraisals. In non-disclosure states, we estimate prices from transfer taxes and mortgage recordings, which may be less precise.',
      },
      {
        q: 'What is a disclosure state vs. non-disclosure state?',
        a: 'Disclosure states require that real estate sale prices be publicly recorded, usually through transfer taxes or deed stamps. Non-disclosure states (like Texas, Indiana, and Kansas) do not require public recording of sale prices. We cover all 50 states but accuracy is highest in disclosure states.',
      },
      {
        q: 'How recent is your data?',
        a: 'We pull the most recent available data from public records. Recording timelines vary by county, but most transactions appear in our system within 30-60 days of closing.',
      },
      {
        q: 'Is this an appraisal?',
        a: 'No. Our reports are AI-generated comparable sales analyses based on public records. They are not licensed appraisals and should not be used as a substitute for a formal appraisal when one is required (e.g., for mortgage lending).',
      },
    ],
  },
  {
    category: 'Reports & Pricing',
    questions: [
      {
        q: 'How much do reports cost?',
        a: 'Basic reports are $4.99 (up to 5 comps), Pro reports are $14.99 (up to 15 comps with AI narrative and market data), and Branded reports are $24.99 (everything in Pro plus your custom branding).',
      },
      {
        q: 'Is there a subscription?',
        a: 'No subscriptions required. You pay per report, only when you need one. Buy one report or a hundred -- each is individually priced.',
      },
      {
        q: 'What is the difference between Basic, Pro, and Branded?',
        a: 'Basic gives you a quick snapshot with up to 5 comps and a value estimate. Pro adds AI narrative, per-comp adjustments, market trends, neighborhood data, school ratings, and crime data. Branded includes everything in Pro plus your custom logo, headshot, brand colors, and contact info on every page.',
      },
      {
        q: 'How fast are reports generated?',
        a: 'Most reports are generated in under 30 seconds. Our AI searches county records, matches comparable sales, calculates adjustments, and generates the narrative in real-time.',
      },
      {
        q: 'Can I download the report as a PDF?',
        a: 'Yes, all report tiers include a downloadable PDF. The Branded tier PDF includes your custom branding and is designed to be shared directly with clients.',
      },
      {
        q: 'Do reports expire?',
        a: 'Reports are accessible in your dashboard for 30 days after generation. You can download the PDF at any time during this period.',
      },
    ],
  },
  {
    category: 'White-Label Branding',
    questions: [
      {
        q: 'How does white-label branding work?',
        a: 'Set up your branding profile once with your logo, headshot, company name, brand colors, and contact info. Every Branded report you generate will automatically include your branding on every page of the PDF.',
      },
      {
        q: 'What can I customize?',
        a: 'You can upload your company logo and personal headshot, set primary and secondary brand colors, add your name, title, license number, phone, email, website, and a custom tagline or disclaimer.',
      },
      {
        q: 'Can I use this for listing presentations?',
        a: 'Absolutely. Many agents use our Branded reports for listing presentations, buyer consultations, and client follow-ups. The reports are designed to be professional and client-ready.',
      },
    ],
  },
  {
    category: 'Technical & Legal',
    questions: [
      {
        q: 'Do I need an account?',
        a: 'You can search for any address without an account. An account is only needed to save reports, set up branding, and track your purchase history.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. We use industry-standard encryption for all data in transit and at rest. We never store your payment information -- all payments are processed securely through Stripe.',
      },
      {
        q: 'Can I use this data for legal proceedings?',
        a: 'Our reports provide valuable market data, but they are not licensed appraisals. For legal proceedings, tax appeals, or mortgage applications that require formal appraisals, we recommend consulting with a licensed appraiser. Our reports can supplement professional opinions.',
      },
      {
        q: 'What if the data seems wrong?',
        a: 'Public records can occasionally contain errors. If you believe a comp\'s data is incorrect, please contact us. We verify our data against multiple sources, but county recording errors do occur.',
      },
    ],
  },
];

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start justify-between w-full py-4 text-left group"
      >
        <span className="text-sm font-medium text-navy-900 pr-4 group-hover:text-gold-500 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={classNames(
            'w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4 pr-8 animate-fade-in">
          <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 py-16 lg:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <HelpCircle className="w-10 h-10 text-gold-400 mx-auto mb-4" />
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Everything you need to know about our comp reports, data sources, and pricing.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                {section.category}
              </h2>
              <div className="bg-white rounded-xl border border-gray-100 px-6">
                {section.questions.map((item) => (
                  <AccordionItem
                    key={item.q}
                    question={item.q}
                    answer={item.a}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 bg-gray-50 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            We are happy to help. Reach out and we will get back to you within 24 hours.
          </p>
          <Link
            href="mailto:support@airealestatecomps.com"
            className="inline-flex items-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
