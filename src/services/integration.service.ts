import db from "@/lib/db";
import { ensureCompanyExists } from "@/services/company.service";
import { IntegrationProvider } from "@/generated/prisma/index";

const PROVIDER_MAP: Record<string, IntegrationProvider> = {
  meta: IntegrationProvider.META,
  google: IntegrationProvider.GOOGLE_ADS,
  youtube: IntegrationProvider.YOUTUBE,
};

const DB_PROVIDER_MAP: Record<IntegrationProvider, string> = {
  [IntegrationProvider.META]: "meta",
  [IntegrationProvider.GOOGLE_ADS]: "google",
  [IntegrationProvider.YOUTUBE]: "youtube",
  [IntegrationProvider.GOOGLE_ANALYTICS]: "google_analytics",
  [IntegrationProvider.WHATSAPP]: "whatsapp",
  [IntegrationProvider.LINKEDIN]: "linkedin",
};

/**
 * Fetches all integrations for a company slug.
 */
export async function getIntegrations(companySlug: string) {
  const company = await ensureCompanyExists(companySlug);

  const dbIntegrations = await db.integration.findMany({
    where: { companyId: company.id },
  });

  return dbIntegrations.map((integration) => {
    const config = (integration.config as any) || {};
    const providerId = DB_PROVIDER_MAP[integration.provider] || integration.provider.toLowerCase();

    return {
      id: providerId,
      accountId: config.accountId || "",
      accountName: config.accountName || "",
      connectedAt: config.connectedAt || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      syncEnabled: integration.isEnabled,
      leadsSyncedCount: config.leadsSyncedCount || 0,
      spendTracked: config.spendTracked || "₹0",
    };
  });
}

/**
 * Disconnects an integration for a company.
 */
export async function disconnectIntegration(companySlug: string, providerId: string) {
  const company = await ensureCompanyExists(companySlug);
  const provider = PROVIDER_MAP[providerId];

  if (!provider) {
    throw new Error(`Invalid integration provider: ${providerId}`);
  }

  await db.integration.deleteMany({
    where: {
      companyId: company.id,
      provider,
    },
  });
}

/**
 * Toggles sync status for an integration.
 */
export async function toggleIntegrationSync(companySlug: string, providerId: string, isEnabled: boolean) {
  const company = await ensureCompanyExists(companySlug);
  const provider = PROVIDER_MAP[providerId];

  if (!provider) {
    throw new Error(`Invalid integration provider: ${providerId}`);
  }

  const integration = await db.integration.findFirst({
    where: {
      companyId: company.id,
      provider,
    },
  });

  if (!integration) {
    throw new Error("Integration not found to toggle sync.");
  }

  await db.integration.update({
    where: { id: integration.id },
    data: { isEnabled },
  });
}

/**
 * Saves mock Google / YouTube integration config.
 */
export async function saveMockIntegration(
  companySlug: string,
  providerId: string,
  accountName: string,
  accountId: string
) {
  const company = await ensureCompanyExists(companySlug);
  const provider = PROVIDER_MAP[providerId];

  if (!provider) {
    throw new Error(`Invalid integration provider: ${providerId}`);
  }

  const connectedAt = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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

  const existing = await db.integration.findFirst({
    where: {
      companyId: company.id,
      provider,
    },
  });

  if (existing) {
    await db.integration.update({
      where: { id: existing.id },
      data: {
        name,
        isEnabled: true,
        config,
      },
    });
  } else {
    await db.integration.create({
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
    id: providerId,
    accountId: config.accountId,
    accountName: config.accountName,
    connectedAt: config.connectedAt,
    syncEnabled: true,
    leadsSyncedCount: 0,
    spendTracked: config.spendTracked,
  };
}

/**
 * Handles Meta Ads OAuth callback token exchange and saving into database.
 */
export async function handleMetaOAuthCallback(input: {
  companySlug: string;
  code: string;
  origin: string;
}) {
  const { companySlug, code, origin } = input;
  const normalizedSlug = companySlug.toLowerCase().trim();

  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI || `${origin}/api/integrations/meta/callback`;

  let accessToken = "";
  let accountName = "Simulated Meta Ads Account";
  let accountId = "ACT-920193481";

  if (clientId && clientSecret && !code.startsWith("mock_")) {
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${clientSecret}&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error("Meta OAuth token exchange failed");
    }

    accessToken = tokenData.access_token;

    try {
      const meResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=name,id&access_token=${accessToken}`
      );
      const meData = await meResponse.json();
      if (meResponse.ok && meData.name) {
        accountName = `${meData.name} Page (FB-ID: ${meData.id})`;
        accountId = `ACT-${meData.id}`;
      }
    } catch (meError) {
      console.warn("Failed to fetch custom Meta profile details, using defaults:", meError);
    }
  } else {
    accessToken = `mock_fb_access_token_${Math.random().toString(36).substring(2, 10)}`;
    if (normalizedSlug === "stark") {
      accountName = "Stark Wellness Page (FB-Page ID: 918239)";
    } else if (normalizedSlug === "wayne") {
      accountName = "Wayne Rehab Channel Ads (CH-ID: YT-9201384)";
    } else {
      accountName = "YogaPlus Main Ads Account (CID: 481-923-1029)";
    }
  }

  const company = await ensureCompanyExists(normalizedSlug);

  const config = {
    accessToken,
    accountName,
    accountId,
    connectedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    spendTracked: "₹18,450",
    leadsSyncedCount: 0,
  };

  const existingIntegration = await db.integration.findFirst({
    where: {
      companyId: company.id,
      provider: IntegrationProvider.META,
    },
  });

  if (existingIntegration) {
    await db.integration.update({
      where: { id: existingIntegration.id },
      data: {
        isEnabled: true,
        name: "Meta Ads Lead Sync",
        config,
      },
    });
  } else {
    await db.integration.create({
      data: {
        companyId: company.id,
        provider: IntegrationProvider.META,
        name: "Meta Ads Lead Sync",
        isEnabled: true,
        config,
      },
    });
  }

  return { success: true, companySlug: normalizedSlug };
}
