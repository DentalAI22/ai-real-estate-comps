'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReportPreview from '@/components/report/ReportPreview';
import CheckoutButton from '@/components/payment/CheckoutButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import { ReportType } from '@/types';
import type { PropertyDetails } from '@/types';
import toast from 'react-hot-toast';

function ReportPreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const address = searchParams.get('address') || '';
  const tier = searchParams.get('tier') || 'pro';

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [compsCount, setCompsCount] = useState(0);
  const [priceLow, setPriceLow] = useState(0);
  const [priceHigh, setPriceHigh] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      router.push('/search');
      return;
    }

    const fetchData = async () => {
      try {
        const propRes = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
        const propData = await propRes.json();
        if (!propRes.ok) throw new Error(propData.error);
        setProperty(propData.property);

        const compsRes = await fetch('/api/comps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: propData.property.lat,
            lng: propData.property.lng,
            radiusMiles: 3,
            monthsBack: 12,
          }),
        });
        const compsData = await compsRes.json();
        if (!compsRes.ok) throw new Error(compsData.error);

        setCompsCount(compsData.comps.length);
        if (compsData.comps.length > 0) {
          const prices = compsData.comps.map((c: { salePrice: number }) => c.salePrice);
          setPriceLow(Math.min(...prices));
          setPriceHigh(Math.max(...prices));
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load preview data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner showProgress />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Property not found. Please try searching again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReportPreview
          subjectProperty={property}
          compsCount={compsCount}
          priceRangeLow={priceLow}
          priceRangeHigh={priceHigh}
          onPurchase={() => {}}
        />

        <Card padding="lg" className="mt-8 text-center">
          <h3 className="text-xl font-display font-bold text-navy-900 mb-2">
            Unlock the Full Report
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Get the complete analysis with AI valuation, detailed comp adjustments,
            market trends, and a downloadable PDF.
          </p>

          <div className="flex justify-center gap-3 mb-6">
            {(['basic', 'pro', 'branded'] as const).map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/report/preview?address=${encodeURIComponent(address)}&tier=${t}`)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tier === t
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'bg-white text-navy-900 border border-gray-200 hover:border-navy-300'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <CheckoutButton
            reportType={tier as ReportType}
            subjectAddress={address}
            price={tier === 'basic' ? '$4.99' : tier === 'pro' ? '$14.99' : '$24.99'}
          />
        </Card>
      </div>
    </div>
  );
}

export default function ReportPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner />
        </div>
      }
    >
      <ReportPreviewContent />
    </Suspense>
  );
}
