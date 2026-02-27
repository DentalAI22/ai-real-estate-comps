/**
 * User and branding types for the real estate comps application.
 * Defines user profiles, roles, and agent branding configuration.
 */

export type UserRole =
  | 'homeowner'
  | 'agent'
  | 'broker'
  | 'appraiser'
  | 'investor'
  | 'lender'
  | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  licenseNumber: string | null;
  licenseState: string | null;
  reportsPurchased: number;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId: string | null;
  subscriptionTier: SubscriptionTier | null;
  subscriptionExpiresAt: string | null;
}

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface BrandingProfile {
  id: string;
  userId: string;
  companyName: string;
  agentName: string;
  agentTitle: string;
  licenseDisplay: string;
  phone: string;
  email: string;
  website: string | null;
  logoUrl: string | null;
  headshotUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  tagline: string | null;
  disclaimer: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  user: UserProfile;
  branding: BrandingProfile | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
