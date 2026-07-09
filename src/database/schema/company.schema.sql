-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums for Statuses and Subscription Tiers
CREATE TYPE company_status AS ENUM ('active', 'suspended', 'trialing', 'inactive');
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'growth', 'enterprise');

-- Companies (Tenants) Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE, -- For subdomain/routing, e.g. clinic1.salesguru.com
    logo_url TEXT,
    custom_domain VARCHAR(255) UNIQUE, -- Optional custom domain
    
    -- Status & Subscription
    status company_status DEFAULT 'trialing' NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- Configuration Settings
    timezone VARCHAR(100) DEFAULT 'UTC' NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL, -- Dynamic settings like UI themes, features enabled
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Company Branches Table (Since users/roles are branch-scoped)
CREATE TABLE IF NOT EXISTS company_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- e.g. "NY-01"
    phone VARCHAR(50),
    email VARCHAR(255),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_company_branches_company_id ON company_branches(company_id);

-- Auto-update updated_at timestamp function (reusable for other tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_branches_updated_at
    BEFORE UPDATE ON company_branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
