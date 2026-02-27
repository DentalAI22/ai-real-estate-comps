/**
 * Comparable sale types for the real estate comps application.
 * Represents individual comp sales with adjustments and confidence scoring.
 */

export type PriceSource =
  | 'MLS'
  | 'PublicRecords'
  | 'CountyRecorder'
  | 'TransferTax'
  | 'Zillow'
  | 'Redfin'
  | 'Realtor'
  | 'ATTOM'
  | 'CoreLogic'
  | 'UserProvided';

export type DocumentType =
  | 'Warranty Deed'
  | 'Grant Deed'
  | 'Quitclaim Deed'
  | 'Special Warranty Deed'
  | 'Trustee Deed'
  | 'Sheriff Deed'
  | 'Other'
  | 'Unknown';

export type LoanType =
  | 'Conventional'
  | 'FHA'
  | 'VA'
  | 'USDA'
  | 'Jumbo'
  | 'Cash'
  | 'SellerFinanced'
  | 'Unknown';

export interface CompAdjustments {
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  age: number;
  lot: number;
  pool: number;
  garage: number;
  condition: number;
  location: number;
  marketConditions: number;
}

export interface CompSale {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSqft: number;
  yearBuilt: number;
  stories: number;
  garage: string;
  pool: boolean;
  salePrice: number;
  saleDate: string;
  priceSource: PriceSource;
  confidenceScore: number;
  distanceFromSubject: number;
  documentType: DocumentType;
  transferTax: number | null;
  loanAmount: number | null;
  loanType: LoanType;
  adjustments: CompAdjustments;
  adjustedValue: number;
  daysOnMarket?: number;
  listPrice?: number;
  mlsNumber?: string;
  photoUrl?: string;
}

export interface CompSearchParams {
  subjectLat: number;
  subjectLng: number;
  radiusMiles: number;
  propertyType: string;
  minSqft: number;
  maxSqft: number;
  minBeds: number;
  maxBeds: number;
  minBaths: number;
  maxBaths: number;
  minYearBuilt: number;
  maxYearBuilt: number;
  saleDateFrom: string;
  saleDateTo: string;
  maxResults: number;
}
