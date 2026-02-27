'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

type Role = 'homeowner' | 'agent' | 'investor' | 'appraiser' | 'lender';

const roles: { value: Role; label: string }[] = [
  { value: 'homeowner', label: 'Homeowner / Consumer' },
  { value: 'agent', label: 'Real Estate Agent' },
  { value: 'investor', label: 'Investor' },
  { value: 'appraiser', label: 'Appraiser' },
  { value: 'lender', label: 'Lender' },
];

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('homeowner');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const showLicenseFields = role === 'agent' || role === 'appraiser';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!terms) {
      toast.error('Please accept the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          fullName,
          email,
          password,
          role,
          licenseNumber: showLicenseFields ? licenseNumber : undefined,
          licenseState: showLicenseFields ? licenseState : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      toast.success('Account created! Check your email to confirm.');
      window.location.href = '/dashboard';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center">
                <span className="text-gold-400 font-bold text-sm">AI</span>
              </div>
              <span className="font-display text-xl font-bold text-navy-900">
                Real Estate Comps
              </span>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-navy-900">Create Account</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sign up to save reports and set up branding
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                I am a...
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="appearance-none w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-navy-900 pr-10 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* License fields */}
            {showLicenseFields && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
                <Input
                  label="License Number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="DRE# 01234567"
                />
                <Input
                  label="License State"
                  value={licenseState}
                  onChange={(e) => setLicenseState(e.target.value)}
                  placeholder="CA"
                />
              </div>
            )}

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to the{' '}
                <Link href="#" className="text-gold-500 hover:text-gold-600">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-gold-500 hover:text-gold-600">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-gold-500 hover:text-gold-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
