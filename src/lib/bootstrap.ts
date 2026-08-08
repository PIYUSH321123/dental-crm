import db from "@/lib/db";
import {
  ensureSuperAdminRoleWithPermissions,
  registerSuperAdmin,
} from "@/services/auth.service";

/**
 * Bootstraps the initial Super Admin and sets up all platform feature permissions.
 * Reads SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, and SUPER_ADMIN_NAME from process.env.
 *
 * Guarantees:
 * - Credentials are strictly accessed on the server (never exposed to client).
 * - Provisions SUPER_ADMIN platform role with full permissions across all modules and actions.
 * - Idempotency: checks if a Super Admin user already exists before attempting creation.
 * - Graceful error handling during database startup.
 */
export async function bootstrapSuperAdmin(): Promise<{ success: boolean; message: string }> {
  const email = process.env.SUPER_ADMIN_EMAIL || "admin@physioyoga.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "admin123";
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  try {
    // 1. Ensure SUPER_ADMIN role exists and has permissions to access all platform features
    const superAdminRole = await ensureSuperAdminRoleWithPermissions();
    console.log("[Bootstrap] Verified SUPER_ADMIN PlatformRole and full platform feature permissions.");

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if a PlatformUser with this email already exists
    const existingByEmail = await db.platformUser.findUnique({
      where: { email: normalizedEmail },
      include: { role: true },
    });

    if (existingByEmail) {
      const msg = `[Bootstrap] Super Admin user exists (${existingByEmail.email}, Role: ${existingByEmail.role.name}). Full feature permissions configured.`;
      console.log(msg);
      return { success: true, message: msg };
    }

    // 3. Check if any active user with SUPER_ADMIN role already exists
    const existingSuperAdmin = await db.platformUser.findFirst({
      where: { roleId: superAdminRole.id },
    });

    if (existingSuperAdmin) {
      const msg = `[Bootstrap] A Super Admin user already exists (${existingSuperAdmin.email}). Full permissions verified.`;
      console.log(msg);
      return { success: true, message: msg };
    }

    // 4. Register the new Super Admin using the unified auth service
    const newAdmin = await registerSuperAdmin({
      name,
      email: normalizedEmail,
      password,
    });

    const msg = `[Bootstrap] Super Admin successfully bootstrapped: ${newAdmin.email} (ID: ${newAdmin.id}) with full platform permissions.`;
    console.log(msg);
    return { success: true, message: msg };
  } catch (error: any) {
    const errorMsg = `[Bootstrap] Error during Super Admin bootstrap: ${error?.message || error}`;
    console.warn(errorMsg);
    return { success: false, message: errorMsg };
  }
}
