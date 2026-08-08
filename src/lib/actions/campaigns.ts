"use server";

import { createMetaCampaign, type CreateMetaCampaignInput } from "@/providers/meta/campaign.service";
import {
  getCampaignsByCompanySlug,
  createCampaign,
  type CreateCampaignData,
} from "@/services/campaign.service";

export async function createMetaCampaignAction(
  companySlug: string,
  input: CreateMetaCampaignInput
) {
  try {
    const result = await createMetaCampaign(companySlug, input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in createMetaCampaignAction Server Action:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function getCampaignsAction(companySlug: string) {
  try {
    const campaigns = await getCampaignsByCompanySlug(companySlug);
    return { success: true, data: campaigns };
  } catch (error: any) {
    console.error("Error in getCampaignsAction:", error);
    return { success: false, error: error.message || "Failed to fetch campaigns." };
  }
}

export async function createCampaignAction(
  companySlug: string,
  data: CreateCampaignData
) {
  try {
    const campaign = await createCampaign(companySlug, data);
    return { success: true, data: campaign };
  } catch (error: any) {
    console.error("Error in createCampaignAction:", error);
    return { success: false, error: error.message || "Failed to create campaign." };
  }
}
