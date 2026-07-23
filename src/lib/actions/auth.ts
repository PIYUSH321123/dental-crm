"use server";

import { cookies } from "next/headers";
import { companyLoginSchema, adminLoginSchema } from "@/lib/validations/auth";
import { getCompanyBySlug } from "@/lib/companies-server";
import db from "@/lib/db";
import { comparePassword, signJWT } from "@/lib/auth-server";

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
  twoFactorCode: string;
}): Promise<ActionResult> {
  try {
    const parsed = adminLoginSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please check every field and try again." };
    }

    // Find platform user
    const platformUser = await db.platformUser.findUnique({
      where: { email: parsed.data.email },
      include: { role: true },
    });

    if (!platformUser || !platformUser.isActive || platformUser.role.name !== "SUPER_ADMIN") {
      return { success: false, error: "Incorrect email or password." };
    }

    // Verify password
    const validPassword = await comparePassword(parsed.data.password, platformUser.password);
    if (!validPassword) {
      return { success: false, error: "Incorrect email or password." };
    }

    // Verify 2FA (for now, keeping the 6 digit check as requested to ignore actual 2FA details, but we validate it exists)
    const validTwoFactor = parsed.data.twoFactorCode.length === 6;
    if (!validTwoFactor) {
      return { success: false, error: "That 2FA code is incorrect or expired." };
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

