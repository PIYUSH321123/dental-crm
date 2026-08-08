import { NextRequest, NextResponse } from "next/server";
import { handleMetaOAuthCallback } from "@/services/integration.service";

/**
 * GET /api/integrations/meta/callback
 * Handles OAuth callback from Facebook / Mock Login page.
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

    await handleMetaOAuthCallback({
      companySlug: normalizedSlug,
      code,
      origin: request.nextUrl.origin,
    });

    return NextResponse.redirect(
      `${request.nextUrl.origin}/c/${normalizedSlug}/dashboard/settings/integrations?meta_connected=true`
    );
  } catch (error: any) {
    console.error("Meta OAuth callback processing failed:", error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/c/${normalizedSlug}/dashboard/settings/integrations?error=oauth_processing_failed`
    );
  }
}
