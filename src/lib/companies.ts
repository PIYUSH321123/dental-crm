export interface CompanyColors {
    primary: string;
    primaryHover: string;
    bgLight: string;
    bgLightHover: string;
    gradientStart: string;
    gradientEnd: string;
    textAccent: string;
}

export interface CompanyConfig {
    slug: string;
    name: string;
    logoText: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    colors: CompanyColors;
}

export type Company = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string; // e.g. "#2B5D52"
  tagline: string;
};

export const COMPANIES: Record<string, CompanyConfig> = {
    yogaplus: {
        slug: "yogaplus",
        name: "YogaPlus",
        logoText: "YogaPlus",
        tagline: "Modern Physiotherapy & Yoga",
        description: "Your personalized journey to recovery and wellness. Integrating advanced physiotherapy techniques with the holistic benefits of Yoga.",
        phone: "+91 98765 43210",
        email: "info@yogaplus.com",
        address: "12, Wellness St, New Delhi, India",
        colors: {
            primary: "#00c950",
            primaryHover: "#00b048",
            bgLight: "#f0fdf4",
            bgLightHover: "#dcfce7",
            gradientStart: "#00c950",
            gradientEnd: "#059669",
            textAccent: "#00b048",
        }

    },
    stark: {
        slug: "stark",
        name: "Stark Industries",
        logoText: "Stark Rehab",
        tagline: "State-of-the-Art Physical Rehabilitation",
        description: "Advanced clinical diagnostics, performance rehabilitation, and state-of-the-art physiotherapy using cutting-edge medical tech.",
        phone: "+1 (555) 019-9238",
        email: "wellness@stark.com",
        address: "Stark Tower, New York City, USA",
        colors: {
            primary: "#e11d48",
            primaryHover: "#be123c",
            bgLight: "#ffe4e6",
            bgLightHover: "#fecdd3",
            gradientStart: "#e11d48",
            gradientEnd: "#9f1239",
            textAccent: "#be123c",
        }
    },
    wayne: {
        slug: "wayne",
        name: "Wayne Enterprises",
        logoText: "Wayne Care",
        tagline: "Elite Athletic Therapy & Training",
        description: "Elite physical training, athletic development, and premium restorative physical therapy for top performance.",
        phone: "+1 (555) 014-2391",
        email: "rehab@waynecorp.com",
        address: "Wayne Tower, Gotham City, USA",
        colors: {
            primary: "#1e293b",
            primaryHover: "#0f172a",
            bgLight: "#f1f5f9",
            bgLightHover: "#e2e8f0",
            gradientStart: "#334155",
            gradientEnd: "#0f172a",
            textAccent: "#0f172a",
        }
    },
    hooli: {
        slug: "hooli",
        name: "Hooli Inc",
        logoText: "Hooli Health",
        tagline: "Holistic Corporate Wellness",
        description: "Holistic workplace recovery, posture correction, and mindfulness training designed for high-stress tech professionals.",
        phone: "+1 (555) 018-8422",
        email: "health@hooli.com",
        address: "Hooli Campus, Mountain View, CA",
        colors: {
            primary: "#0284c7",
            primaryHover: "#0369a1",
            bgLight: "#e0f2fe",
            bgLightHover: "#bae6fd",
            gradientStart: "#0284c7",
            gradientEnd: "#075985",
            textAccent: "#0369a1",
        }
    }
};

export const DEFAULT_COMPANY = COMPANIES.yogaplus;

export function getCompanyConfig(slug?: string | null): CompanyConfig {
    if (!slug) return DEFAULT_COMPANY;
    
    const normalizedSlug = slug.toLowerCase();
    
    // Check direct match
    if (COMPANIES[normalizedSlug]) {
        return COMPANIES[normalizedSlug];
    }
    
    // Check aliases/common names
    if (normalizedSlug === "phyiso" || normalizedSlug === "physio" || normalizedSlug === "physioyoga") {
        return COMPANIES.yogaplus;
    }
    
    // If not found, return default
    return DEFAULT_COMPANY;
}

import { cache } from "react";

export const getCompanyBySlug = cache(
  async (slug: string): Promise<Company | null> => {
    const normalizedSlug = slug.toLowerCase();
    
    // Check if it's sunrise-physio
    if (normalizedSlug === "sunrise-physio") {
      return {
        id: "cmp_1",
        slug: "sunrise-physio",
        name: "PhysioYoga",
        logoUrl: null,
        primaryColor: "#2B5D52",
        tagline: "Sign in to manage patient schedules, treatment notes and billing.",
      };
    }
    
    // Check in existing COMPANIES
    const existing = COMPANIES[normalizedSlug];
    if (existing) {
      return {
        id: `cmp_${existing.slug}`,
        slug: existing.slug,
        name: existing.name,
        logoUrl: null,
        primaryColor: existing.colors.primary,
        tagline: existing.tagline,
      };
    }
    
    // Handle aliases/common names
    if (normalizedSlug === "phyiso" || normalizedSlug === "physio" || normalizedSlug === "physioyoga") {
      const defaultCompany = COMPANIES.yogaplus;
      return {
        id: `cmp_${defaultCompany.slug}`,
        slug: defaultCompany.slug,
        name: defaultCompany.name,
        logoUrl: null,
        primaryColor: defaultCompany.colors.primary,
        tagline: defaultCompany.tagline,
      };
    }

    return null;
  }
);
