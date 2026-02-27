'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import Card from '@/components/ui/Card';
import { classNames } from '@/lib/utils';
import type { BrandingFormData } from '@/components/branding/BrandingForm';

interface BrandingPreviewProps {
  branding: BrandingFormData;
  logoPreviewUrl?: string | null;
  headshotPreviewUrl?: string | null;
  className?: string;
}

export default function BrandingPreview({
  branding,
  logoPreviewUrl,
  headshotPreviewUrl,
  className,
}: BrandingPreviewProps) {
  const primaryColor = branding.primaryColor || '#0f172a';
  const secondaryColor = branding.secondaryColor || '#c69c6d';

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">
        Report Cover Preview
      </h3>
      <Card padding="none" className="overflow-hidden border-2 border-gray-200">
        {/* Cover page mockup */}
        <div
          className="relative"
          style={{ aspectRatio: '8.5/11', maxHeight: '600px' }}
        >
          {/* Top banner */}
          <div
            className="absolute top-0 left-0 right-0 h-1/4"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center justify-between h-full px-6 sm:px-8">
              {/* Logo */}
              <div className="flex-1">
                {logoPreviewUrl ? (
                  <img
                    src={logoPreviewUrl}
                    alt="Company logo"
                    className="max-h-12 max-w-[140px] object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                ) : branding.companyName ? (
                  <p
                    className="text-lg font-bold truncate"
                    style={{ color: secondaryColor }}
                  >
                    {branding.companyName}
                  </p>
                ) : (
                  <p className="text-sm text-white/40 italic">Your Company Logo</p>
                )}
              </div>
              {/* Agent headshot */}
              {headshotPreviewUrl && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                  <img
                    src={headshotPreviewUrl}
                    alt="Agent headshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="absolute top-1/4 left-0 right-0 bottom-0 bg-white flex flex-col">
            {/* Accent stripe */}
            <div className="h-1" style={{ backgroundColor: secondaryColor }} />

            {/* Report title area */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 text-center">
              <FileText
                className="w-8 h-8 mb-3"
                style={{ color: secondaryColor }}
              />
              <h2
                className="text-xl sm:text-2xl font-display font-bold leading-tight"
                style={{ color: primaryColor }}
              >
                Comparable Sales Report
              </h2>
              <p className="text-sm text-gray-500 mt-2">123 Main Street, Anytown, CA 90210</p>
              {branding.tagline && (
                <p
                  className="text-xs mt-4 italic"
                  style={{ color: secondaryColor }}
                >
                  {branding.tagline}
                </p>
              )}
            </div>

            {/* Agent info footer */}
            <div
              className="px-6 sm:px-8 py-4 border-t"
              style={{ borderColor: `${primaryColor}15` }}
            >
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold" style={{ color: primaryColor }}>
                    {branding.agentName || 'Agent Name'}
                  </p>
                  <p className="text-gray-500">
                    {branding.agentTitle}
                    {branding.licenseDisplay && ` | ${branding.licenseDisplay}`}
                  </p>
                </div>
                <div className="text-right">
                  {branding.phone && (
                    <p className="text-gray-500">{branding.phone}</p>
                  )}
                  {branding.email && (
                    <p className="text-gray-500">{branding.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            {branding.disclaimer && (
              <div className="px-6 sm:px-8 py-2 bg-gray-50">
                <p className="text-[9px] text-gray-400 leading-tight line-clamp-2">
                  {branding.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
