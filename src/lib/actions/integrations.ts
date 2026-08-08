"use server";

import {
  getIntegrations,
  disconnectIntegration,
  toggleIntegrationSync,
  saveMockIntegration,
} from "@/services/integration.service";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Fetches all active database integrations for a company slug
 */
export async function getIntegrationsAction(companySlug: string): Promise<ActionResult<any[]>> {
  try {
    const integrations = await getIntegrations(companySlug);
    return { success: true, data: integrations };
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
    await disconnectIntegration(companySlug, providerId);
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
    await toggleIntegrationSync(companySlug, providerId, isEnabled);
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
    const data = await saveMockIntegration(companySlug, providerId, accountName, accountId);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error in saveMockIntegrationAction:", error);
    return { success: false, error: error.message || "Failed to save mock integration." };
  }
}
