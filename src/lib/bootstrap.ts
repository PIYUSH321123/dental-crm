import db from "@/lib/db";
import { hashPassword } from "@/lib/auth-server";

/**
 * Bootstraps the initial Super Admin in the database.
 * Reads SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD from process.env.
 * 
 * Guarantees:
 * - Credentials are strictly accessed on the server (never exposed to client).
 * - Passwords are securely hashed using bcrypt.
 * - Idempotency: checks if a Super Admin user already exists before attempting creation.
 * - Graceful error handling during database startup.
 */
export async function bootstrapSuperAdmin(): Promise<{ success: boolean; message: string }> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    const msg = "[Bootstrap] SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set in environment. Skipping Super Admin bootstrap.";
    console.info(msg);
    return { success: false, message: msg };
  }

  try {
    // 1. Ensure the SUPER_ADMIN PlatformRole exists
    let superAdminRole = await db.platformRole.findFirst({
      where: { name: "SUPER_ADMIN" },
    });

    if (!superAdminRole) {
      superAdminRole = await db.platformRole.create({
        data: {
          name: "SUPER_ADMIN",
          description: "Platform Super Administrator with top-level system privileges",
        },
      });
      console.log("[Bootstrap] Created PlatformRole: SUPER_ADMIN");
    }

    // 2. Check if a PlatformUser with this email already exists
    const existingByEmail = await db.platformUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingByEmail) {
      const msg = `[Bootstrap] Super Admin already exists with email: ${existingByEmail.email}. Skipping creation.`;
      console.log(msg);
      return { success: true, message: msg };
    }

    // 3. Check if any active user with SUPER_ADMIN role already exists
    const existingSuperAdmin = await db.platformUser.findFirst({
      where: { roleId: superAdminRole.id },
    });

    if (existingSuperAdmin) {
      const msg = `[Bootstrap] A Super Admin user already exists (${existingSuperAdmin.email}). Skipping bootstrap for ${email}.`;
      console.log(msg);
      return { success: true, message: msg };
    }

    // 4. Securely hash password and create the initial Super Admin
    const hashedPassword = await hashPassword(password);

    const newAdmin = await db.platformUser.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        roleId: superAdminRole.id,
        isActive: true,
      },
    });

    const msg = `[Bootstrap] Super Admin successfully bootstrapped: ${newAdmin.email} (ID: ${newAdmin.id})`;
    console.log(msg);
    return { success: true, message: msg };
  } catch (error: any) {
    const errorMsg = `[Bootstrap] Error during Super Admin bootstrap: ${error?.message || error}`;
    console.error(errorMsg);
    return { success: false, message: errorMsg };
  }
}
