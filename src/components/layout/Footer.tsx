import React from 'react';
import Link from 'next/link';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { href: '/how-it-works', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/for-agents', label: 'For Agents' },
      { href: '/for-investors', label: 'For Investors' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/faq', label: 'FAQ' },
      { href: '/disclosure-states', label: 'Disclosure States' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/disclaimer', label: 'Disclaimer' },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-display text-xl font-bold text-white">
                AI Real Estate Comps
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              AI-powered comparable sales reports generated from public records.
              Professional-grade property valuations for everyone.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-gold-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="text-xs text-gray-500">
              &copy; {currentYear} AI Real Estate Comps. All rights reserved. Powered by AI
              Jesus.
            </p>
            <p className="text-xs text-gray-500 max-w-lg text-center sm:text-right">
              This report is not an appraisal. It is generated from publicly available data
              sources and AI analysis. Always consult a licensed appraiser for official
              property valuations.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
