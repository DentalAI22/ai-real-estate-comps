'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { classNames } from '@/lib/utils';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/for-agents', label: 'For Agents' },
  { href: '/for-investors', label: 'For Investors' },
];

export default function Navigation({ isOpen, onClose }: NavigationProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={classNames(
          'fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={classNames(
          'fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="font-display text-lg font-bold text-navy-900">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-navy-900 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-6 py-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block px-4 py-3 text-base font-medium text-navy-900 rounded-lg hover:bg-navy-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="px-6 space-y-3 border-t border-gray-100 pt-6">
          <Link href="/auth/login" onClick={onClose}>
            <Button variant="secondary" fullWidth>
              Log In
            </Button>
          </Link>
          <Link href="/search" onClick={onClose}>
            <Button variant="gold" fullWidth>
              Get a Report
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
