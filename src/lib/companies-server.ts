import db from "@/lib/db";
import { COMPANIES, CompanyConfig } from "./companies";

/**
 * Server-only helper to fetch company configurations.
 * This runs database queries and is decoupled from client-side bundles.
 */
export async function getCompanyBySlug(slug: string): Promise<CompanyConfig | null> {
  const normalizedSlug = slug.toLowerCase();

  // 1. Check static companies first
  if (COMPANIES[normalizedSlug]) {
    return COMPANIES[normalizedSlug];
  }

  if (
    normalizedSlug === "phyiso" || 
    normalizedSlug === "physio" || 
    normalizedSlug === "physioyoga" ||
    normalizedSlug.includes("yogaplus") ||
    normalizedSlug.includes("physio")
  ) {
    return COMPANIES.yogaplus;
  }

  // 2. Query database for dynamically created companies
  try {
    const dbCompany = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (dbCompany) {
      return {
        id: dbCompany.id,
        primaryColor: COMPANIES.yogaplus.colors.primary,
        slug: dbCompany.slug,
        name: dbCompany.name,
        logoText: dbCompany.name,
        tagline: "Custom Clinic",
        description: "Dynamically registered company.",
        phone: dbCompany.phone || "",
        email: dbCompany.email || "",
        address: "",
        colors: COMPANIES.yogaplus.colors, // Fallback colors
      };
    }
  } catch (error) {
    console.error("Error in getCompanyBySlug database lookup:", error);
  }

  return null;
}
