'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BrandingForm from '@/components/branding/BrandingForm';
import BrandingPreview from '@/components/branding/BrandingPreview';
import type { BrandingProfile } from '@/types';
import toast from 'react-hot-toast';

export default function BrandingPage() {
  const [branding, setBranding] = useState<Partial<BrandingProfile>>({
    companyName: '',
    agentName: '',
    agentTitle: '',
    licenseDisplay: '',
    phone: '',
    email: '',
    website: '',
    primaryColor: '#0f172a',
    secondaryColor: '#c69c6d',
    tagline: '',
    disclaimer: '',
    logoUrl: null,
    headshotUrl: null,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (
    data: Partial<BrandingProfile>,
    logoFile?: File,
    headshotFile?: File
  ) => {
    setSaving(true);
    try {
      // In production, this would upload files and save to the database
      setBranding({ ...branding, ...data });

      // Simulate logo/headshot URL creation from files
      if (logoFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBranding((prev) => ({ ...prev, logoUrl: reader.result as string }));
        };
        reader.readAsDataURL(logoFile);
      }
      if (headshotFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBranding((prev) => ({ ...prev, headshotUrl: reader.result as string }));
        };
        reader.readAsDataURL(headshotFile);
      }

      await new Promise((r) => setTimeout(r, 800));
      toast.success('Branding saved successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-900 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
            Agent Branding
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Customize your branded report with your logo, headshot, and company details
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <BrandingForm
              initialData={branding}
              onSave={handleSave}
              loading={saving}
            />
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BrandingPreview
              branding={{
                companyName: branding.companyName || '',
                agentName: branding.agentName || '',
                agentTitle: branding.agentTitle || '',
                licenseDisplay: branding.licenseDisplay || '',
                phone: branding.phone || '',
                email: branding.email || '',
                website: branding.website || '',
                primaryColor: branding.primaryColor || '#0f172a',
                secondaryColor: branding.secondaryColor || '#c69c6d',
                tagline: branding.tagline || '',
                disclaimer: branding.disclaimer || '',
              }}
              logoPreviewUrl={branding.logoUrl}
              headshotPreviewUrl={branding.headshotUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
