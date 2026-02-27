'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, ArrowRight, Loader2 } from 'lucide-react';
import AddressSearch from '@/components/search/AddressSearch';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResults from '@/components/search/SearchResults';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { PropertyDetails, CompSale, ReportType } from '@/types';
import type { FilterState } from '@/components/search/SearchFilters';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState('');
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [comps, setComps] = useState<CompSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    radius: 1,
    dateRange: 6,
    propertyTypes: ['SFR'],
  });
  const [selectedTier, setSelectedTier] = useState<'basic' | 'pro' | 'branded'>('pro');

  const handleAddressSelect = async (address: string) => {
    setSelectedAddress(address);
    setLoading(true);
    setSearched(false);

    try {
      // Fetch property details
      const propRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const propData = await propRes.json();
      if (!propRes.ok) throw new Error(propData.error);
      setProperty(propData.property);

      // Fetch comps
      const compsRes = await fetch('/api/comps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: propData.property.lat,
          lng: propData.property.lng,
          radiusMiles: filters.radius,
          monthsBack: filters.dateRange,
          propertyType: filters.propertyTypes[0],
        }),
      });
      const compsData = await compsRes.json();
      if (!compsRes.ok) throw new Error(compsData.error);
      setComps(compsData.comps);
      setSearched(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleGenerateReport = () => {
    if (!selectedAddress) return;
    router.push(
      `/report/preview?address=${encodeURIComponent(selectedAddress)}&tier=${selectedTier}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="bg-navy-900 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
            Find Comparable Sales
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Enter any US address to find recent sold properties from county records
          </p>
          <AddressSearch
            onSelect={handleAddressSelect}
            placeholder="Enter a property address..."
            className="mx-auto"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <SearchFilters onFiltersChange={handleFiltersChange} />
          {property && (
            <Button variant="secondary" size="sm" onClick={() => handleAddressSelect(selectedAddress)}>
              <SearchIcon className="w-3.5 h-3.5 mr-1.5" />
              Re-search
            </Button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
            <span className="ml-3 text-gray-600">Searching public records...</span>
          </div>
        )}

        {/* No search yet */}
        {!loading && !searched && !property && (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              Search for an address above to find comparable sales
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && property && (
          <div className="space-y-6">
            {/* Subject property card */}
            <Card padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-1">
                    Subject Property
                  </p>
                  <h2 className="text-xl font-display font-bold text-navy-900">
                    {property.address}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {property.city}, {property.state} {property.zip}
                  </p>
                </div>
                <span className="bg-navy-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {property.propertyType}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-5 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Beds / Baths</p>
                  <p className="text-sm font-semibold text-navy-900">
                    {property.bedrooms}bd / {property.bathrooms}ba
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sq Ft</p>
                  <p className="text-sm font-semibold text-navy-900">
                    {formatNumber(property.sqft)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Year Built</p>
                  <p className="text-sm font-semibold text-navy-900">{property.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assessed Value</p>
                  <p className="text-sm font-semibold text-navy-900">
                    {formatCurrency(property.assessedValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Sale</p>
                  <p className="text-sm font-semibold text-navy-900">
                    {formatCurrency(property.lastSalePrice)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Comps found */}
            <SearchResults
              subjectProperty={property}
              compsCount={comps.length}
              onGenerateReport={(tier: ReportType) => {
                setSelectedTier(tier as 'basic' | 'pro' | 'branded');
                handleGenerateReport();
              }}
            />

            {/* Generate Report */}
            {comps.length > 0 && (
              <Card padding="lg" className="border-2 border-gold-200 bg-gold-50/30">
                <div className="text-center">
                  <h3 className="text-lg font-display font-bold text-navy-900 mb-2">
                    Generate Your Report
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Choose a tier and get your professional comp report
                  </p>

                  {/* Tier selector */}
                  <div className="flex justify-center gap-3 mb-6">
                    {(['basic', 'pro', 'branded'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          selectedTier === tier
                            ? 'bg-navy-900 text-white shadow-md'
                            : 'bg-white text-navy-900 border border-gray-200 hover:border-navy-300'
                        }`}
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        <span className="ml-1.5 text-xs opacity-70">
                          {tier === 'basic' ? '$4.99' : tier === 'pro' ? '$14.99' : '$24.99'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <Button variant="gold" size="lg" onClick={handleGenerateReport}>
                    Generate {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Report
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
