-- ============================================================================
-- 001_initial_schema.sql
-- Complete initial schema for the Real Estate Comps application
-- Includes: tables, indexes, RLS policies, seed data for disclosure_states
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: User profiles linked to Supabase Auth
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'homeowner'
    CHECK (role IN ('homeowner', 'agent', 'broker', 'appraiser', 'investor', 'lender', 'admin')),
  license_number TEXT,
  license_state TEXT,
  reports_purchased INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- branding: Agent/broker branding for branded reports
-- ---------------------------------------------------------------------------
CREATE TABLE branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_title TEXT NOT NULL DEFAULT '',
  license_display TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT,
  logo_url TEXT,
  headshot_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#1a56db',
  secondary_color TEXT NOT NULL DEFAULT '#1c1c1e',
  tagline TEXT,
  disclaimer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ---------------------------------------------------------------------------
-- property_cache: Cached property data from external APIs
-- ---------------------------------------------------------------------------
CREATE TABLE property_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  county TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  apn TEXT,
  property_type TEXT NOT NULL
    CHECK (property_type IN ('SFR', 'Condo', 'Multi-Family', 'Townhome')),
  bedrooms INTEGER,
  bathrooms NUMERIC(4,1),
  sqft INTEGER,
  lot_sqft INTEGER,
  year_built INTEGER,
  stories INTEGER,
  garage TEXT,
  pool BOOLEAN DEFAULT FALSE,
  assessed_value NUMERIC(14,2),
  tax_amount NUMERIC(12,2),
  last_sale_date DATE,
  last_sale_price NUMERIC(14,2),
  owner_name TEXT,
  data_source TEXT NOT NULL,
  raw_response JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(address, city, state, zip)
);

-- Auto-populate the PostGIS geography column
CREATE OR REPLACE FUNCTION set_property_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_property_location
  BEFORE INSERT OR UPDATE OF lat, lng ON property_cache
  FOR EACH ROW
  EXECUTE FUNCTION set_property_location();

-- ---------------------------------------------------------------------------
-- comp_sales: Comparable sale records
-- ---------------------------------------------------------------------------
CREATE TABLE comp_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_cache_id UUID REFERENCES property_cache(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  property_type TEXT NOT NULL
    CHECK (property_type IN ('SFR', 'Condo', 'Multi-Family', 'Townhome')),
  bedrooms INTEGER,
  bathrooms NUMERIC(4,1),
  sqft INTEGER,
  lot_sqft INTEGER,
  year_built INTEGER,
  stories INTEGER,
  garage TEXT,
  pool BOOLEAN DEFAULT FALSE,
  sale_price NUMERIC(14,2) NOT NULL,
  sale_date DATE NOT NULL,
  price_source TEXT NOT NULL
    CHECK (price_source IN (
      'MLS', 'PublicRecords', 'CountyRecorder', 'TransferTax',
      'Zillow', 'Redfin', 'Realtor', 'ATTOM', 'CoreLogic', 'UserProvided'
    )),
  confidence_score NUMERIC(5,4) DEFAULT 0.0
    CHECK (confidence_score >= 0 AND confidence_score <= 1),
  document_type TEXT DEFAULT 'Unknown'
    CHECK (document_type IN (
      'Warranty Deed', 'Grant Deed', 'Quitclaim Deed', 'Special Warranty Deed',
      'Trustee Deed', 'Sheriff Deed', 'Other', 'Unknown'
    )),
  transfer_tax NUMERIC(12,2),
  loan_amount NUMERIC(14,2),
  loan_type TEXT DEFAULT 'Unknown'
    CHECK (loan_type IN (
      'Conventional', 'FHA', 'VA', 'USDA', 'Jumbo', 'Cash', 'SellerFinanced', 'Unknown'
    )),
  days_on_market INTEGER,
  list_price NUMERIC(14,2),
  mls_number TEXT,
  photo_url TEXT,
  data_source TEXT NOT NULL,
  raw_response JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(address, city, state, zip, sale_date, sale_price)
);

-- Auto-populate the PostGIS geography column for comp_sales
CREATE TRIGGER trg_set_comp_location
  BEFORE INSERT OR UPDATE OF lat, lng ON comp_sales
  FOR EACH ROW
  EXECUTE FUNCTION set_property_location();

-- ---------------------------------------------------------------------------
-- neighborhood_cache: Cached neighborhood/demographic data
-- ---------------------------------------------------------------------------
CREATE TABLE neighborhood_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip TEXT NOT NULL,
  city TEXT,
  state TEXT,
  county TEXT,
  median_income NUMERIC(12,2),
  median_age NUMERIC(5,2),
  population INTEGER,
  population_density NUMERIC(10,2),
  median_home_value NUMERIC(14,2),
  home_ownership_rate NUMERIC(5,4),
  walk_score INTEGER,
  transit_score INTEGER,
  bike_score INTEGER,
  nearby_amenities JSONB DEFAULT '[]'::jsonb,
  school_data JSONB DEFAULT '[]'::jsonb,
  crime_data JSONB,
  market_trends JSONB,
  data_source TEXT NOT NULL,
  raw_response JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '90 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(zip)
);

-- ---------------------------------------------------------------------------
-- reports: Generated comp reports
-- ---------------------------------------------------------------------------
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  branding_id UUID REFERENCES branding(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL DEFAULT 'basic'
    CHECK (report_type IN ('basic', 'pro', 'branded')),
  subject_property_id UUID REFERENCES property_cache(id) ON DELETE SET NULL,
  subject_address TEXT NOT NULL,
  subject_city TEXT NOT NULL,
  subject_state TEXT NOT NULL,
  subject_zip TEXT NOT NULL,
  subject_property JSONB NOT NULL,
  comp_ids UUID[] DEFAULT '{}',
  comps JSONB NOT NULL DEFAULT '[]'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_narrative TEXT,
  value_low NUMERIC(14,2),
  value_high NUMERIC(14,2),
  value_estimate NUMERIC(14,2),
  ai_confidence NUMERIC(5,4)
    CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1)),
  neighborhood_data JSONB,
  school_data JSONB,
  crime_data JSONB,
  market_trends JSONB,
  addressed_to TEXT,
  custom_notes TEXT,
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  stripe_payment_id TEXT,
  amount_charged NUMERIC(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '365 days'
);

-- ---------------------------------------------------------------------------
-- disclosure_states: Non-disclosure vs full-disclosure states for price data
-- ---------------------------------------------------------------------------
CREATE TABLE disclosure_states (
  state_code TEXT PRIMARY KEY,
  state_name TEXT NOT NULL,
  is_disclosure BOOLEAN NOT NULL,
  notes TEXT,
  transfer_tax_rate NUMERIC(8,6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- analytics_events: Usage tracking and analytics
-- ---------------------------------------------------------------------------
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- INDEXES
-- ============================================================================

-- profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- branding
CREATE INDEX idx_branding_user_id ON branding(user_id);

-- property_cache
CREATE INDEX idx_property_cache_address ON property_cache(address, city, state);
CREATE INDEX idx_property_cache_location ON property_cache USING GIST(location);
CREATE INDEX idx_property_cache_zip ON property_cache(zip);
CREATE INDEX idx_property_cache_type ON property_cache(property_type);
CREATE INDEX idx_property_cache_expires ON property_cache(expires_at);
CREATE INDEX idx_property_cache_apn ON property_cache(apn) WHERE apn IS NOT NULL;

-- comp_sales
CREATE INDEX idx_comp_sales_location ON comp_sales USING GIST(location);
CREATE INDEX idx_comp_sales_address ON comp_sales(address, city, state);
CREATE INDEX idx_comp_sales_zip ON comp_sales(zip);
CREATE INDEX idx_comp_sales_sale_date ON comp_sales(sale_date DESC);
CREATE INDEX idx_comp_sales_sale_price ON comp_sales(sale_price);
CREATE INDEX idx_comp_sales_type ON comp_sales(property_type);
CREATE INDEX idx_comp_sales_source ON comp_sales(price_source);
CREATE INDEX idx_comp_sales_mls ON comp_sales(mls_number) WHERE mls_number IS NOT NULL;
CREATE INDEX idx_comp_sales_property_cache ON comp_sales(property_cache_id) WHERE property_cache_id IS NOT NULL;
-- Composite index for typical comp search queries
CREATE INDEX idx_comp_sales_search ON comp_sales(property_type, sale_date DESC, sale_price);

-- neighborhood_cache
CREATE INDEX idx_neighborhood_cache_zip ON neighborhood_cache(zip);
CREATE INDEX idx_neighborhood_cache_expires ON neighborhood_cache(expires_at);

-- reports
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_subject_address ON reports(subject_address, subject_city, subject_state);
CREATE INDEX idx_reports_expires ON reports(expires_at);
CREATE INDEX idx_reports_subject_zip ON reports(subject_zip);

-- analytics_events
CREATE INDEX idx_analytics_user ON analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_session ON analytics_events(session_id) WHERE session_id IS NOT NULL;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosure_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- branding ----
CREATE POLICY "Users can view own branding"
  ON branding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own branding"
  ON branding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own branding"
  ON branding FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own branding"
  ON branding FOR DELETE
  USING (auth.uid() = user_id);

-- ---- property_cache ----
-- Property cache is readable by all authenticated users (shared resource)
CREATE POLICY "Authenticated users can read property cache"
  ON property_cache FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage property cache"
  ON property_cache FOR ALL
  USING (auth.role() = 'service_role');

-- ---- comp_sales ----
-- Comp sales are readable by all authenticated users (shared resource)
CREATE POLICY "Authenticated users can read comp sales"
  ON comp_sales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage comp sales"
  ON comp_sales FOR ALL
  USING (auth.role() = 'service_role');

-- ---- neighborhood_cache ----
CREATE POLICY "Authenticated users can read neighborhood cache"
  ON neighborhood_cache FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage neighborhood cache"
  ON neighborhood_cache FOR ALL
  USING (auth.role() = 'service_role');

-- ---- reports ----
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- disclosure_states ----
-- Public reference data, readable by everyone including anonymous
CREATE POLICY "Anyone can read disclosure states"
  ON disclosure_states FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage disclosure states"
  ON disclosure_states FOR ALL
  USING (auth.role() = 'service_role');

-- ---- analytics_events ----
CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role can manage analytics events"
  ON analytics_events FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_branding_updated_at
  BEFORE UPDATE ON branding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SEED DATA: disclosure_states (all 50 states + DC)
-- ============================================================================
-- is_disclosure = TRUE means the state requires public disclosure of sale prices.
-- Non-disclosure states restrict access to sale price data from public records.
-- Transfer tax rates are approximate and may vary by county/municipality.
-- ============================================================================

INSERT INTO disclosure_states (state_code, state_name, is_disclosure, notes, transfer_tax_rate) VALUES
  ('AL', 'Alabama',              TRUE,  'Full disclosure state. Transfer tax applies.',                         0.001000),
  ('AK', 'Alaska',               TRUE,  'Full disclosure state. No state transfer tax.',                        0.000000),
  ('AZ', 'Arizona',              TRUE,  'Full disclosure via affidavit of value.',                              0.000200),
  ('AR', 'Arkansas',             TRUE,  'Full disclosure state. Transfer tax applies.',                         0.003300),
  ('CA', 'California',           TRUE,  'Full disclosure state. Documentary transfer tax.',                     0.001100),
  ('CO', 'Colorado',             TRUE,  'Full disclosure state. Documentary fee.',                              0.000100),
  ('CT', 'Connecticut',          TRUE,  'Full disclosure state. Conveyance tax.',                               0.012500),
  ('DE', 'Delaware',             TRUE,  'Full disclosure state. Transfer tax split buyer/seller.',              0.040000),
  ('DC', 'District of Columbia', TRUE,  'Full disclosure. Deed recordation and transfer taxes.',                0.028500),
  ('FL', 'Florida',              TRUE,  'Full disclosure state. Documentary stamp tax.',                        0.007000),
  ('GA', 'Georgia',              TRUE,  'Full disclosure state. Transfer tax applies.',                         0.001000),
  ('HI', 'Hawaii',               TRUE,  'Full disclosure state. Conveyance tax tiered by value.',               0.001500),
  ('ID', 'Idaho',                FALSE, 'Non-disclosure state. Sale prices not in public records.',             NULL),
  ('IL', 'Illinois',             TRUE,  'Full disclosure state. Transfer tax + county stamps.',                 0.001000),
  ('IN', 'Indiana',              FALSE, 'Non-disclosure state. Sale prices not publicly available.',            NULL),
  ('IA', 'Iowa',                 TRUE,  'Full disclosure state. Revenue stamps required.',                      0.001600),
  ('KS', 'Kansas',               FALSE, 'Non-disclosure state. Sale prices not in public records.',             NULL),
  ('KY', 'Kentucky',             TRUE,  'Full disclosure state. Transfer tax applies.',                         0.001000),
  ('LA', 'Louisiana',            FALSE, 'Non-disclosure state. Sale prices not publicly available.',            NULL),
  ('ME', 'Maine',                TRUE,  'Full disclosure state. Transfer tax applies.',                         0.004400),
  ('MD', 'Maryland',             TRUE,  'Full disclosure state. Transfer and recordation taxes.',               0.010000),
  ('MA', 'Massachusetts',        TRUE,  'Full disclosure state. Excise stamps on deeds.',                       0.004560),
  ('MI', 'Michigan',             TRUE,  'Full disclosure state. Transfer tax on real property.',                0.008600),
  ('MN', 'Minnesota',            TRUE,  'Full disclosure state. Deed tax required.',                            0.003400),
  ('MS', 'Mississippi',          FALSE, 'Non-disclosure state. Sale prices not in public records.',             NULL),
  ('MO', 'Missouri',             TRUE,  'Full disclosure state. Transfer tax is minimal.',                      0.000000),
  ('MT', 'Montana',              FALSE, 'Non-disclosure state. Sale prices not publicly available.',            NULL),
  ('NE', 'Nebraska',             TRUE,  'Full disclosure state. Documentary stamp tax.',                        0.002250),
  ('NV', 'Nevada',               TRUE,  'Full disclosure state. Transfer tax on real property.',                0.003900),
  ('NH', 'New Hampshire',        TRUE,  'Full disclosure state. Transfer tax split buyer/seller.',              0.015000),
  ('NJ', 'New Jersey',           TRUE,  'Full disclosure state. Realty transfer fee tiered.',                   0.005000),
  ('NM', 'New Mexico',           FALSE, 'Non-disclosure state. Sale prices not in public records.',             NULL),
  ('NY', 'New York',             TRUE,  'Full disclosure state. Transfer tax + mansion tax.',                   0.004000),
  ('NC', 'North Carolina',       TRUE,  'Full disclosure state. Excise tax on conveyances.',                    0.002000),
  ('ND', 'North Dakota',         FALSE, 'Non-disclosure state. Sale prices not publicly available.',            NULL),
  ('OH', 'Ohio',                 TRUE,  'Full disclosure state. Conveyance fee required.',                      0.004000),
  ('OK', 'Oklahoma',             TRUE,  'Full disclosure state. Documentary stamp tax.',                        0.001500),
  ('OR', 'Oregon',               TRUE,  'Full disclosure state. Transfer tax in some counties.',                0.001000),
  ('PA', 'Pennsylvania',         TRUE,  'Full disclosure state. Transfer tax split state/local.',               0.010000),
  ('RI', 'Rhode Island',         TRUE,  'Full disclosure state. Transfer tax applies.',                         0.004600),
  ('SC', 'South Carolina',       TRUE,  'Full disclosure state. Deed recording fee based on value.',            0.003700),
  ('SD', 'South Dakota',         TRUE,  'Full disclosure state. Transfer tax applies.',                         0.001000),
  ('TN', 'Tennessee',            TRUE,  'Full disclosure state. Transfer tax on consideration.',                0.003700),
  ('TX', 'Texas',                FALSE, 'Non-disclosure state. Sale prices not in public records.',             NULL),
  ('UT', 'Utah',                 FALSE, 'Non-disclosure state. Sale prices not publicly available.',            NULL),
  ('VT', 'Vermont',              TRUE,  'Full disclosure state. Property transfer tax.',                        0.012500),
  ('VA', 'Virginia',             TRUE,  'Full disclosure state. Grantor tax on seller.',                        0.003330),
  ('WA', 'Washington',           TRUE,  'Full disclosure state. Real estate excise tax tiered.',                0.016000),
  ('WV', 'West Virginia',        TRUE,  'Full disclosure state. Transfer tax applies.',                         0.003300),
  ('WI', 'Wisconsin',            TRUE,  'Full disclosure state. Transfer fee required.',                        0.003000),
  ('WY', 'Wyoming',              FALSE, 'Non-disclosure state. Sale prices not in public records.',             NULL)
ON CONFLICT (state_code) DO NOTHING;
