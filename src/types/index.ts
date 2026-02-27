/**
 * Central type exports for the real estate comps application.
 */

// Property types
export type { PropertyDetails, PropertySearchResult, PropertyType } from './property';

// Comp types
export type {
  CompSale,
  CompAdjustments,
  CompSearchParams,
  PriceSource,
  DocumentType,
  LoanType,
} from './comp';

// Report types
export { ReportType } from './report';
export type {
  ReportConfig,
  GeneratedReport,
  ReportSummary,
  NeighborhoodData,
  NearbyAmenity,
  SchoolData,
  CrimeData,
  MarketTrend,
  MarketTrends,
} from './report';

// User types
export type {
  UserProfile,
  UserRole,
  UserSession,
  BrandingProfile,
  SubscriptionTier,
} from './user';
