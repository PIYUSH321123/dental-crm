import db from "@/lib/db";
import { IntegrationProvider } from "@/generated/prisma/index";

const META_GRAPH_BASE = "https://graph.facebook.com";
const META_API_VERSION = "v25.0";
const META_GRAPH_URL = `${META_GRAPH_BASE}/${META_API_VERSION}`;

export interface CreateMetaCampaignInput {
  name: string;
  objective: string;
  status: "ACTIVE" | "PAUSED";
  special_ad_categories: string[];
  buying_type?: "AUCTION" | "RESERVED";
  bid_strategy?: "LOWEST_COST_WITHOUT_CAP" | "LOWEST_COST_WITH_BID_CAP" | "COST_CAP" | "LOWEST_COST_WITH_MIN_ROAS";
  daily_budget?: number;
  lifetime_budget?: number;
  spend_cap?: number;
}

export async function createMetaCampaign(
  companySlug: string,
  input: CreateMetaCampaignInput
) {
  // 1. Fetch Meta integration for the company
  const company = await db.company.findUnique({
    where: { slug: companySlug.toLowerCase() },
  });

  if (!company) {
    throw new Error(`Company not found: ${companySlug}`);
  }

  const integration = await db.integration.findFirst({
    where: {
      companyId: company.id,
      provider: IntegrationProvider.META,
      isEnabled: true,
    },
  });

  if (!integration) {
    throw new Error("Meta Ads integration is not connected or enabled.");
  }

  const config = (integration.config as any) || {};
  const { accessToken, accountId } = config;

  if (!accessToken || !accountId) {
    throw new Error("Meta Ads integration is missing configuration credentials.");
  }

  // Check if it's a mock token
  if (accessToken.startsWith("mock_")) {
    console.log("Simulating Meta Ads Campaign Creation:", { accountId, input });
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency
    
    // Extract ID suffix cleanly
    const numericId = accountId.replace("ACT-", "").replace("act_", "");
    
    return {
      id: `act_${numericId}_camp_${Date.now()}`,
      success: true,
      simulated: true,
    };
  }

  // Real Graph API call
  // Meta API expects budgets in the smallest currency unit (e.g. cents/paise).
  const params: Record<string, string> = {
    name: input.name,
    objective: input.objective,
    status: input.status,
    special_ad_categories: JSON.stringify(input.special_ad_categories),
    access_token: accessToken,
  };

  if (input.buying_type) {
    params.buying_type = input.buying_type;
  }
  if (input.bid_strategy) {
    params.bid_strategy = input.bid_strategy;
  }
  if (input.daily_budget) {
    params.daily_budget = Math.round(input.daily_budget * 100).toString();
  }
  if (input.lifetime_budget) {
    params.lifetime_budget = Math.round(input.lifetime_budget * 100).toString();
  }
  if (input.spend_cap) {
    params.spend_cap = Math.round(input.spend_cap * 100).toString();
  }

  // Meta Graph API acts on act_<AD_ACCOUNT_ID>/campaigns
  const cleanAccountId = accountId.startsWith("act_") ? accountId : `act_${accountId.replace("ACT-", "")}`;
  const url = `${META_GRAPH_URL}/${cleanAccountId}/campaigns`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Meta API error response:", data);
    throw new Error(data.error?.message || "Failed to create campaign on Meta Ads.");
  }

  return {
    id: data.id,
    success: true,
    simulated: false,
  };
}
