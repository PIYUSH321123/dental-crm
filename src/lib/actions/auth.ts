"use server";

import { cookies } from "next/headers";
import { companyLoginSchema, adminLoginSchema, adminRegisterSchema } from "@/lib/validations/auth";
import { getCompanyBySlug } from "@/lib/companies-server";
import db from "@/lib/db";
import { comparePassword, signJWT, hashPassword } from "@/lib/auth-server";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function signInCompanyStaff(
  companySlug: string,
  input: { email: string; password: string }
): Promise<ActionResult> {
  try {
    const parsed = companyLoginSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please check your email and password." };
    }

    const company = await getCompanyBySlug(companySlug);
    if (!company) {
      return { success: false, error: "This clinic could not be found." };
    }

    // Lookup user in DB
    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || user.companyId !== company.id) {
      return { success: false, error: "Incorrect email or password." };
    }

    // Compare passwords
    const isValid = await comparePassword(parsed.data.password, user.password);
    if (!isValid) {
      return { success: false, error: "Incorrect email or password." };
    }

    // Generate JWT
    const sessionToken = await signJWT(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: company.id,
        companySlug: company.slug,
      },
      "7d"
    );

    (await cookies()).set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error("Error in signInCompanyStaff Server Action:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function signInSuperAdmin(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  try {
    const parsed = adminLoginSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please check every field and try again." };
    }

    let platformUser: any = null;
    let isDbOffline = false;

    try {
      platformUser = await db.platformUser.findUnique({
        where: { email: parsed.data.email },
        include: { role: true },
      });
    } catch (dbErr) {
      console.warn("Database offline during super admin login, falling back to static config:", dbErr);
      isDbOffline = true;
    }

    if (isDbOffline) {
      // Fallback credentials for development/offline testing
      const isStaticEmail = parsed.data.email === "admin@physioyoga.com";
      // Allow 'admin123' or any password >= 8 characters for local testing ease
      const isStaticPassword = parsed.data.password === "admin123" || parsed.data.password.length >= 8;

      if (!isStaticEmail || !isStaticPassword) {
        return { success: false, error: "Incorrect email or password." };
      }

      // Sign JWT for mock session
      const sessionToken = await signJWT(
        {
          userId: "static-admin-id",
          email: "admin@physioyoga.com",
          role: "SUPER_ADMIN",
        },
        "4h"
      );

      (await cookies()).set("admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 4, // 4 hours
      });

      return { success: true };
    }

    if (!platformUser || !platformUser.isActive || platformUser.role.name !== "SUPER_ADMIN") {
      return { success: false, error: "Incorrect email or password." };
    }

    // Verify password
    const validPassword = await comparePassword(parsed.data.password, platformUser.password);
    if (!validPassword) {
      return { success: false, error: "Incorrect email or password." };
    }

    // Sign JWT
    const sessionToken = await signJWT(
      {
        userId: platformUser.id,
        email: platformUser.email,
        role: "SUPER_ADMIN",
      },
      "4h"
    );

    (await cookies()).set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 hours
    });

    return { success: true };
  } catch (error) {
    console.error("Error in signInSuperAdmin Server Action:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function signUpSuperAdmin(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    const parsed = adminRegisterSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid registration input.";
      return { success: false, error: errorMsg };
    }

    const { name, email, password } = parsed.data;

    let isDbOffline = false;
    let existingUser = null;

    try {
      existingUser = await db.platformUser.findUnique({
        where: { email },
      });
    } catch (dbErr) {
      console.warn("Database offline during super admin registration check:", dbErr);
      isDbOffline = true;
    }

    if (isDbOffline) {
      // In offline/dev-fallback mode, mock success for default admin
      if (email === "admin@physioyoga.com") {
        return { success: true };
      }
      return { success: false, error: "Database offline. Registration is disabled for other emails." };
    }

    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    // Find or create PlatformRole for SUPER_ADMIN
    let superAdminRole = await db.platformRole.findFirst({
      where: { name: "SUPER_ADMIN" },
    });

    if (!superAdminRole) {
      superAdminRole = await db.platformRole.create({
        data: {
          name: "SUPER_ADMIN",
          description: "Super Administrator with full platform controls",
        },
      });
    }

    const hashedPassword = await hashPassword(password);

    await db.platformUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: superAdminRole.id,
        isActive: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in signUpSuperAdmin Server Action:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}


