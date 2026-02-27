'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReportViewer from '@/components/report/ReportViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { GeneratedReport } from '@/types';
import { ReportType } from '@/types';
import toast from 'react-hot-toast';

/**
 * Mock report data for demonstration purposes.
 * In production, this would be fetched from the database by report ID.
 */
function getMockReport(id: string): GeneratedReport {
  return {
    id,
    subjectProperty: {
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'CA',
      zip: '90210',
      county: 'Los Angeles County',
      lat: 34.0901,
      lng: -118.4065,
      apn: '123-456-7890',
      propertyType: 'SFR',
      bedrooms: 4,
      bathrooms: 2.5,
      sqft: 2150,
      lotSqft: 6500,
      yearBuilt: 1989,
      stories: 2,
      garage: '2 Car Attached',
      pool: true,
      assessedValue: 685000,
      taxAmount: 8200,
      lastSaleDate: '2019-06-15',
      lastSalePrice: 595000,
      dataSource: 'CountyRecords',
    },
    comps: [
      {
        id: 'comp-1',
        address: '318 Maple Drive',
        city: 'Springfield',
        state: 'CA',
        zip: '90210',
        lat: 34.091,
        lng: -118.408,
        propertyType: 'SFR',
        bedrooms: 4,
        bathrooms: 2,
        sqft: 2050,
        lotSqft: 6200,
        yearBuilt: 1992,
        stories: 2,
        garage: '2 Car Attached',
        pool: false,
        salePrice: 725000,
        saleDate: '2025-11-20',
        priceSource: 'PublicRecords',
        confidenceScore: 92,
        distanceFromSubject: 0.3,
        documentType: 'Grant Deed',
        transferTax: 797,
        loanAmount: 580000,
        loanType: 'Conventional',
        adjustments: {
          sqft: 5000,
          bedrooms: 0,
          bathrooms: -3000,
          age: 1500,
          lot: -1000,
          pool: 12000,
          garage: 0,
          condition: 2000,
          location: 0,
          marketConditions: 3000,
        },
        adjustedValue: 744500,
        daysOnMarket: 18,
        listPrice: 739000,
      },
      {
        id: 'comp-2',
        address: '501 Oak Street',
        city: 'Springfield',
        state: 'CA',
        zip: '90210',
        lat: 34.088,
        lng: -118.41,
        propertyType: 'SFR',
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 1950,
        lotSqft: 7000,
        yearBuilt: 1985,
        stories: 2,
        garage: '2 Car Attached',
        pool: true,
        salePrice: 698000,
        saleDate: '2025-10-05',
        priceSource: 'CountyRecorder',
        confidenceScore: 87,
        distanceFromSubject: 0.5,
        documentType: 'Warranty Deed',
        transferTax: 768,
        loanAmount: 558000,
        loanType: 'FHA',
        adjustments: {
          sqft: 10000,
          bedrooms: 8000,
          bathrooms: 0,
          age: -2000,
          lot: 2000,
          pool: 0,
          garage: 0,
          condition: 0,
          location: -3000,
          marketConditions: 5000,
        },
        adjustedValue: 718000,
        daysOnMarket: 32,
        listPrice: 715000,
      },
      {
        id: 'comp-3',
        address: '227 Cedar Lane',
        city: 'Springfield',
        state: 'CA',
        zip: '90210',
        lat: 34.093,
        lng: -118.403,
        propertyType: 'SFR',
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2300,
        lotSqft: 5800,
        yearBuilt: 2001,
        stories: 2,
        garage: '3 Car Attached',
        pool: false,
        salePrice: 785000,
        saleDate: '2025-12-01',
        priceSource: 'PublicRecords',
        confidenceScore: 78,
        distanceFromSubject: 0.7,
        documentType: 'Grant Deed',
        transferTax: 864,
        loanAmount: null,
        loanType: 'Cash',
        adjustments: {
          sqft: -7500,
          bedrooms: 0,
          bathrooms: 3000,
          age: 5000,
          lot: -2000,
          pool: 12000,
          garage: -5000,
          condition: -3000,
          location: 2000,
          marketConditions: 0,
        },
        adjustedValue: 789500,
        daysOnMarket: 12,
        listPrice: 799000,
      },
      {
        id: 'comp-4',
        address: '614 Birch Avenue',
        city: 'Springfield',
        state: 'CA',
        zip: '90211',
        lat: 34.085,
        lng: -118.398,
        propertyType: 'SFR',
        bedrooms: 4,
        bathrooms: 2,
        sqft: 2100,
        lotSqft: 6800,
        yearBuilt: 1994,
        stories: 1,
        garage: '2 Car Attached',
        pool: true,
        salePrice: 710000,
        saleDate: '2025-09-18',
        priceSource: 'Redfin',
        confidenceScore: 84,
        distanceFromSubject: 0.9,
        documentType: 'Warranty Deed',
        transferTax: 781,
        loanAmount: 568000,
        loanType: 'Conventional',
        adjustments: {
          sqft: 2500,
          bedrooms: 0,
          bathrooms: -3000,
          age: 2500,
          lot: 1000,
          pool: 0,
          garage: 0,
          condition: 5000,
          location: -2000,
          marketConditions: 4000,
        },
        adjustedValue: 720000,
        daysOnMarket: 28,
        listPrice: 725000,
      },
      {
        id: 'comp-5',
        address: '899 Walnut Court',
        city: 'Springfield',
        state: 'CA',
        zip: '90210',
        lat: 34.094,
        lng: -118.412,
        propertyType: 'SFR',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1800,
        lotSqft: 5500,
        yearBuilt: 1978,
        stories: 1,
        garage: '1 Car Attached',
        pool: false,
        salePrice: 645000,
        saleDate: '2025-08-22',
        priceSource: 'PublicRecords',
        confidenceScore: 72,
        distanceFromSubject: 1.2,
        documentType: 'Special Warranty Deed',
        transferTax: 710,
        loanAmount: 516000,
        loanType: 'VA',
        adjustments: {
          sqft: 17500,
          bedrooms: 8000,
          bathrooms: -3000,
          age: -5000,
          lot: -3000,
          pool: 12000,
          garage: 5000,
          condition: 8000,
          location: 5000,
          marketConditions: 6000,
        },
        adjustedValue: 695500,
        daysOnMarket: 45,
        listPrice: 660000,
      },
    ],
    aiNarrative:
      'Based on analysis of 5 comparable sales within 1.2 miles of the subject property, the AI-estimated market value of 742 Evergreen Terrace is approximately $735,000. The subject property is a well-maintained 4-bedroom, 2.5-bathroom single-family residence built in 1989 with 2,150 square feet of living space and a pool.\n\nThe comparable sales range from $645,000 to $785,000, with the closest and most similar property (318 Maple Drive) selling for $725,000 in November 2025. After adjusting for differences in square footage, bedroom/bathroom count, age, lot size, pool presence, and market conditions, the adjusted comp values range from $695,500 to $789,500.\n\nThe Springfield market is currently experiencing moderate seller favorability, with homes selling within 27 days on average and a sale-to-list ratio of approximately 98.5%. Year-over-year appreciation in this area has been approximately 4.2%, suggesting continued value growth.\n\nThe subject property benefits from its pool amenity (adding approximately $12,000 in value versus comparable non-pool homes) and its favorable lot size. The AI confidence level of 85% reflects good data availability and comp similarity in this area.',
    valueLow: 705000,
    valueHigh: 770000,
    valueEstimate: 735000,
    aiConfidence: 85,
    neighborhoodData: {
      medianIncome: 92000,
      medianAge: 38,
      population: 42500,
      populationDensity: 5200,
      medianHomeValue: 720000,
      homeOwnershipRate: 0.62,
      walkScore: 72,
      transitScore: 55,
      bikeScore: 65,
      nearbyAmenities: [
        { name: 'Springfield Park', type: 'Park', distance: 0.3 },
        { name: 'Whole Foods Market', type: 'Grocery', distance: 0.8 },
        { name: 'Springfield Medical Center', type: 'Hospital', distance: 1.5 },
      ],
    },
    schoolData: [
      { name: 'Springfield Elementary', type: 'Elementary', rating: 8, distance: 0.4, enrollment: 520, grades: 'K-5' },
      { name: 'Springfield Middle School', type: 'Middle', rating: 7, distance: 0.9, enrollment: 680, grades: '6-8' },
      { name: 'Springfield High', type: 'High', rating: 8, distance: 1.2, enrollment: 1250, grades: '9-12' },
    ],
    crimeData: {
      crimeIndex: 32,
      violentCrimeRate: 2.1,
      propertyCrimeRate: 18.5,
      comparedToNational: 'lower',
      year: 2025,
    },
    marketTrends: {
      trends: [
        { date: '2025-01-01', medianPrice: 685000, medianPricePerSqft: 318, inventoryCount: 145, daysOnMarket: 32, listToSaleRatio: 0.975 },
        { date: '2025-02-01', medianPrice: 690000, medianPricePerSqft: 320, inventoryCount: 138, daysOnMarket: 30, listToSaleRatio: 0.978 },
        { date: '2025-03-01', medianPrice: 698000, medianPricePerSqft: 324, inventoryCount: 125, daysOnMarket: 28, listToSaleRatio: 0.982 },
        { date: '2025-04-01', medianPrice: 705000, medianPricePerSqft: 327, inventoryCount: 118, daysOnMarket: 25, listToSaleRatio: 0.985 },
        { date: '2025-05-01', medianPrice: 712000, medianPricePerSqft: 331, inventoryCount: 110, daysOnMarket: 22, listToSaleRatio: 0.988 },
        { date: '2025-06-01', medianPrice: 718000, medianPricePerSqft: 334, inventoryCount: 105, daysOnMarket: 20, listToSaleRatio: 0.99 },
        { date: '2025-07-01', medianPrice: 722000, medianPricePerSqft: 336, inventoryCount: 102, daysOnMarket: 19, listToSaleRatio: 0.992 },
        { date: '2025-08-01', medianPrice: 725000, medianPricePerSqft: 337, inventoryCount: 108, daysOnMarket: 21, listToSaleRatio: 0.99 },
        { date: '2025-09-01', medianPrice: 720000, medianPricePerSqft: 335, inventoryCount: 115, daysOnMarket: 24, listToSaleRatio: 0.988 },
        { date: '2025-10-01', medianPrice: 718000, medianPricePerSqft: 334, inventoryCount: 120, daysOnMarket: 26, listToSaleRatio: 0.985 },
        { date: '2025-11-01', medianPrice: 722000, medianPricePerSqft: 336, inventoryCount: 118, daysOnMarket: 25, listToSaleRatio: 0.986 },
        { date: '2025-12-01', medianPrice: 728000, medianPricePerSqft: 338, inventoryCount: 112, daysOnMarket: 27, listToSaleRatio: 0.985 },
      ],
      appreciationRate12Month: 4.2,
      appreciationRate36Month: 14.5,
      forecastAppreciation12Month: 3.8,
      marketType: 'sellers',
      averageDaysOnMarket: 27,
      monthsOfSupply: 2.8,
    },
    pdfUrl: null,
    reportType: ReportType.Pro,
    config: {
      searchRadius: 3,
      dateRange: 12,
      addressedTo: '',
      customNotes: '',
      brandingId: null,
      maxComps: 15,
      includeSchoolData: true,
      includeCrimeData: true,
      includeMarketTrends: true,
      includeNeighborhoodData: true,
      includeAINarrative: true,
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    addressedTo: '',
    customNotes: '',
  };
}

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setReport(getMockReport(reportId));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [reportId]);

  const handleDownloadPDF = async () => {
    toast.success('PDF generation coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Report not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReportViewer report={report} />
      </div>
    </div>
  );
}
