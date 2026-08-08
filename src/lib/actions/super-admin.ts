"use server";

import { revalidatePath } from "next/cache";
import {
  getSuperAdminDashboardData as fetchDashboardData,
  toggleClinicModule as toggleModuleInDb,
  updateClinicStatus as updateStatusInDb,
} from "@/services/super-admin.service";

export async function getSuperAdminDashboardData() {
  return await fetchDashboardData();
}

export async function toggleClinicModule(companyId: string, moduleKey: string, enabled: boolean) {
  try {
    await toggleModuleInDb(companyId, moduleKey, enabled);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle clinic module:", error);
    return { success: false, error: "Database offline or operation failed." };
  }
}

export async function updateClinicStatus(companyId: string, status: string) {
  try {
    await updateStatusInDb(companyId, status);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update clinic status:", error);
    return { success: false, error: "Database offline or operation failed." };
  }
}
