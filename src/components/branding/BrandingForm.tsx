'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LogoUploader from '@/components/branding/LogoUploader';
import HeadshotUploader from '@/components/branding/HeadshotUploader';
import { ChevronDown } from 'lucide-react';
import { classNames } from '@/lib/utils';
import type { BrandingProfile } from '@/types';

interface BrandingFormProps {
  initialData?: Partial<BrandingProfile>;
  onSave: (data: BrandingFormData) => void;
  onBrandingChange?: (data: BrandingFormData) => void;
  loading?: boolean;
  className?: string;
}

export interface BrandingFormData {
  companyName: string;
  agentName: string;
  agentTitle: string;
  licenseDisplay: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  disclaimer: string;
  logoFile?: File | null;
  headshotFile?: File | null;
}

const TITLE_OPTIONS = [
  'Real Estate Agent',
  'Realtor',
  'Broker',
  'Associate Broker',
  'Managing Broker',
  'Team Lead',
  'Appraiser',
  'Investor',
  'Other',
];

export default function BrandingForm({
  initialData,
  onSave,
  onBrandingChange,
  loading = false,
  className,
}: BrandingFormProps) {
  const [formData, setFormData] = useState<BrandingFormData>({
    companyName: initialData?.companyName || '',
    agentName: initialData?.agentName || '',
    agentTitle: initialData?.agentTitle || 'Real Estate Agent',
    licenseDisplay: initialData?.licenseDisplay || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    primaryColor: initialData?.primaryColor || '#0f172a',
    secondaryColor: initialData?.secondaryColor || '#c69c6d',
    tagline: initialData?.tagline || '',
    disclaimer: initialData?.disclaimer || '',
    logoFile: null,
    headshotFile: null,
  });

  const updateField = (field: keyof BrandingFormData, value: string | File | null) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onBrandingChange?.(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={classNames('space-y-8', className)}>
      {/* Uploads */}
      <div className="flex flex-col sm:flex-row items-start gap-8">
        <LogoUploader
          currentLogoUrl={initialData?.logoUrl}
          onUpload={(file) => updateField('logoFile', file)}
          onRemove={() => updateField('logoFile', null)}
        />
        <HeadshotUploader
          currentHeadshotUrl={initialData?.headshotUrl}
          onUpload={(file) => updateField('headshotFile', file)}
          onRemove={() => updateField('headshotFile', null)}
        />
      </div>

      {/* Agent info */}
      <div>
        <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">
          Agent Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder="ABC Realty"
          />
          <Input
            label="Agent Name"
            value={formData.agentName}
            onChange={(e) => updateField('agentName', e.target.value)}
            placeholder="Jane Smith"
          />
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">Title</label>
            <div className="relative">
              <select
                value={formData.agentTitle}
                onChange={(e) => updateField('agentTitle', e.target.value)}
                className="appearance-none w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
              >
                {TITLE_OPTIONS.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <Input
            label="License #"
            value={formData.licenseDisplay}
            onChange={(e) => updateField('licenseDisplay', e.target.value)}
            placeholder="DRE# 01234567"
          />
        </div>
      </div>

      {/* Contact info */}
      <div>
        <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="jane@abcrealty.com"
          />
          <div className="sm:col-span-2">
            <Input
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://abcrealty.com"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div>
        <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">
          Brand Colors & Messaging
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 font-mono focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                placeholder="#0f172a"
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateField('secondaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => updateField('secondaryColor', e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 font-mono focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                placeholder="#c69c6d"
                maxLength={7}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Tagline"
              value={formData.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              placeholder="Your Trusted Real Estate Partner"
              helperText="Appears on the report cover page"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Custom Disclaimer
            </label>
            <textarea
              value={formData.disclaimer}
              onChange={(e) => updateField('disclaimer', e.target.value)}
              placeholder="This report is for informational purposes only..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 resize-none"
            />
            <p className="mt-1.5 text-sm text-gray-500">
              Appears at the bottom of the report
            </p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button type="submit" variant="gold" size="lg" loading={loading}>
          Save Branding
        </Button>
      </div>
    </form>
  );
}
