/**
 * Property types for the real estate comps application.
 * Represents subject property details used in comp analysis and reports.
 */

export type PropertyType = 'SFR' | 'Condo' | 'Multi-Family' | 'Townhome';

export interface PropertyDetails {
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  lat: number;
  lng: number;
  apn: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSqft: number;
  yearBuilt: number;
  stories: number;
  garage: string;
  pool: boolean;
  assessedValue: number;
  taxAmount: number;
  lastSaleDate: string;
  lastSalePrice: number;
  ownerName?: string;
  dataSource: string;
}

export interface PropertySearchResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  propertyType: PropertyType;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
}
