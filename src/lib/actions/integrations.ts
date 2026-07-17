"use server";

import db from "@/lib/db";
import { getCompanyBySlug } from "@/lib/companies-server";
import { IntegrationProvider } from "@/generated/prisma/index";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Maps frontend provider IDs to database enum values
 */
const PROVIDER_MAP: Record<string, IntegrationProvider> = {
  meta: IntegrationProvider.META,
  google: IntegrationProvider.GOOGLE_ADS,
  youtube: IntegrationProvider.YOUTUBE,
};

/**
 * Maps database enum values to frontend provider IDs
 */
const DB_PROVIDER_MAP: Record<IntegrationProvider, string> = {
  [IntegrationProvider.META]: "meta",
  [IntegrationProvider.GOOGLE_ADS]: "google",
  [IntegrationProvider.YOUTUBE]: "youtube",
  [IntegrationProvider.GOOGLE_ANALYTICS]: "google_analytics",
  [IntegrationProvider.WHATSAPP]: "whatsapp",
  [IntegrationProvider.LINKEDIN]: "linkedin",
};

/**
 * Ensures a company exists in the database.
 * If only statically defined in companies.ts, it will create a database record.
 */
async function ensureCompanyExists(slug: string) {
  const normalizedSlug = slug.toLowerCase();
  
  // Try to find the company in DB first
  let company = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!company) {
    // If not in DB, look up the static config to seed it dynamically
    const staticConfig = await getCompanyBySlug(normalizedSlug);
    if (!staticConfig) {
      throw new Error(`Company with slug "${slug}" not found in system.`);
    }

    company = await db.company.create({
      data: {
        id: staticConfig.id,
        name: staticConfig.name,
        slug: normalizedSlug,
        email: staticConfig.email || null,
        phone: staticConfig.phone || null,
      },
    });
  }

  return company;
}

/**
 * Fetches all active database integrations for a company slug
 */
export async function getIntegrationsAction(companySlug: string): Promise<ActionResult<any[]>> {
  try {
    const company = await ensureCompanyExists(companySlug);

    const dbIntegrations = await db.integration.findMany({
      where: { companyId: company.id },
    });

    const mappedIntegrations = dbIntegrations.map((integration) => {
      const config = (integration.config as any) || {};
      const providerId = DB_PROVIDER_MAP[integration.provider] || integration.provider.toLowerCase();
      
      return {
        id: providerId,
        accountId: config.accountId || "",
        accountName: config.accountName || "",
        connectedAt: config.connectedAt || new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }),
        syncEnabled: integration.isEnabled,
        leadsSyncedCount: config.leadsSyncedCount || 0,
        spendTracked: config.spendTracked || "₹0",
      };
    });

    return { success: true, data: mappedIntegrations };
  } catch (error: any) {
    console.error("Error in getIntegrationsAction:", error);
    return { success: false, error: error.message || "Failed to retrieve integrations." };
  }
}

/**
 * Disconnects / revokes an integration in the database
 */
export async function disconnectIntegrationAction(companySlug: string, providerId: string): Promise<ActionResult<void>> {
  try {
    const company = await ensureCompanyExists(companySlug);
    const provider = PROVIDER_MAP[providerId];

    if (!provider) {
      return { success: false, error: `Invalid integration provider: ${providerId}` };
    }

    // Delete matching integration record
    await db.integration.deleteMany({
      where: {
        companyId: company.id,
        provider,
      },
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Error in disconnectIntegrationAction:", error);
    return { success: false, error: error.message || "Failed to disconnect integration." };
  }
}

/**
 * Toggles the sync setting (isEnabled) for a database integration
 */
export async function toggleIntegrationSyncAction(
  companySlug: string,
  providerId: string,
  isEnabled: boolean
): Promise<ActionResult<void>> {
  try {
    const company = await ensureCompanyExists(companySlug);
    const provider = PROVIDER_MAP[providerId];

    if (!provider) {
      return { success: false, error: `Invalid integration provider: ${providerId}` };
    }

    // Find the record
    const integration = await db.integration.findFirst({
      where: {
        companyId: company.id,
        provider,
      },
    });

    if (!integration) {
      return { success: false, error: "Integration not found to toggle sync." };
    }

    await db.integration.update({
      where: { id: integration.id },
      data: { isEnabled },
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Error in toggleIntegrationSyncAction:", error);
    return { success: false, error: error.message || "Failed to toggle integration sync." };
  }
}

/**
 * Saves a mock integration (Google Ads / YouTube) details into the database
 */
export async function saveMockIntegrationAction(
  companySlug: string,
  providerId: string,
  accountName: string,
  accountId: string
): Promise<ActionResult<any>> {
  try {
    const company = await ensureCompanyExists(companySlug);
    const provider = PROVIDER_MAP[providerId];

    if (!provider) {
      return { success: false, error: `Invalid integration provider: ${providerId}` };
    }

    const connectedAt = new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
    const spendTracked = providerId === "google" ? "₹24,800" : "₹4,200";

    const config = {
      accountId,
      accountName,
      connectedAt,
      spendTracked,
      leadsSyncedCount: 0,
      accessToken: `mock_token_${providerId}_${Math.random().toString(36).substring(2, 9)}`,
    };

    const name = providerId === "google" ? "Google Ads" : "YouTube Ads";

    // Find or create
    const existing = await db.integration.findFirst({
      where: {
        companyId: company.id,
        provider,
      },
    });

    let integration;
    if (existing) {
      integration = await db.integration.update({
        where: { id: existing.id },
        data: {
          name,
          isEnabled: true,
          config,
        },
      });
    } else {
      integration = await db.integration.create({
        data: {
          companyId: company.id,
          provider,
          name,
          isEnabled: true,
          config,
        },
      });
    }

    return {
      success: true,
      data: {
        id: providerId,
        accountId: config.accountId,
        accountName: config.accountName,
        connectedAt: config.connectedAt,
        syncEnabled: true,
        leadsSyncedCount: 0,
        spendTracked: config.spendTracked,
      },
    };
  } catch (error: any) {
    console.error("Error in saveMockIntegrationAction:", error);
    return { success: false, error: error.message || "Failed to save mock integration." };
  }
}
