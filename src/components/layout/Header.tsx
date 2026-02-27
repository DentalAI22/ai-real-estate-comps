'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navigation from '@/components/layout/Navigation';
import { classNames } from '@/lib/utils';

const navLinks = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/for-agents', label: 'For Agents' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={classNames(
          'sticky top-0 z-30 w-full transition-all duration-300',
          'bg-navy-900 text-white',
          scrolled && 'shadow-lg shadow-navy-950/20'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="font-display text-xl lg:text-2xl font-bold text-white tracking-tight">
                AI Real Estate Comps
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="gold" size="sm">
                  Get a Report
                </Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <Navigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
