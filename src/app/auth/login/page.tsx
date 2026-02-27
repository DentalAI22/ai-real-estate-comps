'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Chrome } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password: mode === 'password' ? password : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (mode === 'magic') {
        toast.success('Magic link sent! Check your email.');
      } else {
        toast.success('Logged in successfully!');
        window.location.href = '/dashboard';
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    toast('Google OAuth integration coming soon!');
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
          <h1 className="font-display text-2xl font-bold text-navy-900">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to access your reports and branding
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          {/* Google OAuth */}
          <button
            onClick={handleGoogleAuth}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                mode === 'password'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                mode === 'magic'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            {mode === 'password' && (
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" />}
                required
              />
            )}

            {mode === 'password' && (
              <div className="text-right">
                <Link href="#" className="text-xs text-gold-500 hover:text-gold-600">
                  Forgot password?
                </Link>
              </div>
            )}

            <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>
              {mode === 'password' ? 'Sign In' : 'Send Magic Link'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-gold-500 hover:text-gold-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
