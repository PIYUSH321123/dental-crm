import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCompanyBySlug } from "@/lib/companies-server";
import { IntegrationProvider } from "@/generated/prisma/index";

/**
 * GET /api/integrations/meta/callback
 * Handles OAuth callback from Facebook / Mock Login page.
 * Stores access tokens and config in the database.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Contains the company slug

  if (!state) {
    return NextResponse.json(
      { success: false, error: "Missing state (company slug) in callback query." },
      { status: 400 }
    );
  }

  const normalizedSlug = state.toLowerCase();

  try {
    if (!code) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/c/${normalizedSlug}/dashboard/settings/integrations?error=no_auth_code`
      );
    }

    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;
    const origin = request.nextUrl.origin;
    const redirectUri = process.env.META_REDIRECT_URI || `${origin}/api/integrations/meta/callback`;

    let accessToken = "";
    let accountName = "Simulated Meta Ads Account";
    let accountId = "ACT-920193481";

    // Detect if we should use actual Meta API or fall back to simulated token exchange
    if (clientId && clientSecret && !code.startsWith("mock_")) {
      // Exchange authorization code for access token via Graph API
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${clientSecret}&code=${code}`;

      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error("Meta OAuth token exchange failed:", tokenData);
        return NextResponse.redirect(
          `${origin}/c/${normalizedSlug}/dashboard/settings/integrations?error=oauth_exchange_failed`
        );
      }

      accessToken = tokenData.access_token;

      // Try fetching account details using the token to populate fields dynamically
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
      // Mock authorization exchange
      accessToken = `mock_fb_access_token_${Math.random().toString(36).substring(2, 10)}`;
      // Prefill mock names based on the company slug to make it look professional
      if (normalizedSlug === "stark") {
        accountName = "Stark Wellness Page (FB-Page ID: 918239)";
      } else if (normalizedSlug === "wayne") {
        accountName = "Wayne Rehab Channel Ads (CH-ID: YT-9201384)";
      } else {
        accountName = "YogaPlus Main Ads Account (CID: 481-923-1029)";
      }
    }

    // 1. Ensure the company exists in the database
    let company = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (!company) {
      const staticConfig = await getCompanyBySlug(normalizedSlug);
      if (!staticConfig) {
        return NextResponse.redirect(
          `${origin}/c/${normalizedSlug}/dashboard/settings/integrations?error=company_not_found`
        );
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

    // 2. Upsert the integration details
    const integrationConfig = {
      accessToken,
      accountId,
      accountName,
      connectedAt: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      spendTracked: "₹12,490",
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
          config: integrationConfig,
        },
      });
    } else {
      await db.integration.create({
        data: {
          companyId: company.id,
          provider: IntegrationProvider.META,
          name: "Meta Ads (Facebook & Instagram)",
          isEnabled: true,
          config: integrationConfig,
        },
      });
    }

    // Redirect user back with success parameter
    return NextResponse.redirect(
      `${origin}/c/${normalizedSlug}/dashboard/settings/integrations?success=meta`
    );
  } catch (error) {
    console.error("Unexpected error in Meta OAuth Callback route:", error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/c/${normalizedSlug}/dashboard/settings/integrations?error=unexpected_callback_error`
    );
  }
}
