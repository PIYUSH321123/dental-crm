import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/integrations/meta/auth
 * Initiates the Meta Ads OAuth Flow.
 * If credentials exist, redirects to Facebook's OAuth endpoint.
 * Otherwise, falls back to the local simulated OAuth consent flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companySlug = searchParams.get("company");

  if (!companySlug) {
    return NextResponse.json(
      { success: false, error: "Missing required query parameter: company" },
      { status: 400 }
    );
  }

  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;

  // Check if real Meta configuration is set up
  if (clientId && clientSecret) {
    const origin = request.nextUrl.origin;
    const redirectUri = process.env.META_REDIRECT_URI || `${origin}/api/integrations/meta/callback`;
    const scope = "ads_management,leads_retrieval,pages_manage_metadata,pages_show_list,pages_read_engagement";
    
    const fbOAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${companySlug}&scope=${encodeURIComponent(scope)}`;
    
    return NextResponse.redirect(fbOAuthUrl);
  } else {
    // Fallback: redirect to mock OAuth consent page in the local app
    const origin = request.nextUrl.origin;
    const mockAuthUrl = `${origin}/c/${companySlug}/dashboard/settings/integrations/meta-mock-auth?state=${companySlug}`;
    return NextResponse.redirect(mockAuthUrl);
  }
}
