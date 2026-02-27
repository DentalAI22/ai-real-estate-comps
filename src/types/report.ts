/**
 * Report types for the real estate comps application.
 * Defines report configurations, generated report structure, and supporting data.
 */

import { PropertyDetails } from './property';
import { CompSale } from './comp';

export enum ReportType {
  Basic = 'basic',
  Pro = 'pro',
  Branded = 'branded',
}

export interface ReportConfig {
  searchRadius: number;
  dateRange: number;
  addressedTo: string;
  customNotes: string;
  brandingId: string | null;
  maxComps: number;
  includeSchoolData: boolean;
  includeCrimeData: boolean;
  includeMarketTrends: boolean;
  includeNeighborhoodData: boolean;
  includeAINarrative: boolean;
}

export interface NeighborhoodData {
  medianIncome: number;
  medianAge: number;
  population: number;
  populationDensity: number;
  medianHomeValue: number;
  homeOwnershipRate: number;
  walkScore: number | null;
  transitScore: number | null;
  bikeScore: number | null;
  nearbyAmenities: NearbyAmenity[];
}

export interface NearbyAmenity {
  name: string;
  type: string;
  distance: number;
}

export interface SchoolData {
  name: string;
  type: 'Elementary' | 'Middle' | 'High' | 'Private' | 'Charter';
  rating: number | null;
  distance: number;
  enrollment: number | null;
  grades: string;
}

export interface CrimeData {
  crimeIndex: number;
  violentCrimeRate: number;
  propertyCrimeRate: number;
  comparedToNational: 'lower' | 'average' | 'higher';
  year: number;
}

export interface MarketTrend {
  date: string;
  medianPrice: number;
  medianPricePerSqft: number;
  inventoryCount: number;
  daysOnMarket: number;
  listToSaleRatio: number;
}

export interface MarketTrends {
  trends: MarketTrend[];
  appreciationRate12Month: number;
  appreciationRate36Month: number;
  forecastAppreciation12Month: number | null;
  marketType: 'buyers' | 'balanced' | 'sellers';
  averageDaysOnMarket: number;
  monthsOfSupply: number;
}

export interface GeneratedReport {
  id: string;
  subjectProperty: PropertyDetails;
  comps: CompSale[];
  aiNarrative: string;
  valueLow: number;
  valueHigh: number;
  valueEstimate: number;
  aiConfidence: number;
  neighborhoodData: NeighborhoodData | null;
  schoolData: SchoolData[] | null;
  crimeData: CrimeData | null;
  marketTrends: MarketTrends | null;
  pdfUrl: string | null;
  reportType: ReportType;
  config: ReportConfig;
  createdAt: string;
  expiresAt: string;
  userId: string;
  addressedTo: string;
  customNotes: string;
}

export interface ReportSummary {
  id: string;
  subjectAddress: string;
  subjectCity: string;
  subjectState: string;
  valueEstimate: number;
  compCount: number;
  reportType: ReportType;
  createdAt: string;
  expiresAt: string;
  pdfUrl: string | null;
}
