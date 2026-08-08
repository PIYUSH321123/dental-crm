"use server";

import { cookies } from "next/headers";
import {
  companyLoginSchema,
  adminLoginSchema,
  adminRegisterSchema,
  type CompanyLoginInput,
  type AdminLoginInput,
  type AdminRegisterInput,
} from "@/lib/validations/auth";
import {
  authenticateSuperAdmin,
  registerSuperAdmin,
  authenticateCompanyStaff,
} from "@/services/auth.service";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action for Company Admin and Staff login
 */
export async function signInCompanyStaff(
  companySlug: string,
  input: CompanyLoginInput
): Promise<ActionResult> {
  try {
    const parsed = companyLoginSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please check your email and password." };
    }

    const { token } = await authenticateCompanyStaff({
      email: parsed.data.email,
      password: parsed.data.password,
      companySlug,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: any) {
    if (error.message === "Clinic not found") {
      return { success: false, error: "This clinic could not be found." };
    }
    if (error.message === "Invalid email or password") {
      return { success: false, error: "Incorrect email or password." };
    }
    console.error("Error in signInCompanyStaff Server Action:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Server Action for Super Admin login
 */
export async function signInSuperAdmin(input: AdminLoginInput): Promise<ActionResult> {
  try {
    const parsed = adminLoginSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please check every field and try again." };
    }

    const { token } = await authenticateSuperAdmin({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true };
  } catch (error: any) {
    if (error.message === "Invalid email or password") {
      return { success: false, error: "Incorrect email or password." };
    }
    if (error.message === "Account is deactivated" || error.message?.includes("admin privileges required")) {
      return { success: false, error: error.message };
    }
    console.error("Error in signInSuperAdmin Server Action:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Server Action for Super Admin registration
 */
export async function signUpSuperAdmin(input: AdminRegisterInput): Promise<ActionResult> {
  try {
    const parsed = adminRegisterSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid registration input.";
      return { success: false, error: errorMsg };
    }

    await registerSuperAdmin({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in signUpSuperAdmin Server Action:", error);
    return { success: false, error: error.message || "Something went wrong. Please try again." };
  }
}
