"use server";

import { cookies } from "next/headers";
import { staffLoginSchema, type StaffLoginInput } from "@/lib/validations/auth";
import { authenticateCompanyStaff } from "@/services/auth.service";

export async function loginStaff(input: StaffLoginInput) {
  try {
    const parsed = staffLoginSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { user, token } = await authenticateCompanyStaff({
      email: parsed.data.email,
      password: parsed.data.password,
      companySlug: parsed.data.companySlug,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, user };
  } catch (error: any) {
    if (error.message === "Clinic not found") {
      return { success: false, error: "This clinic could not be found." };
    }
    if (error.message === "Invalid email or password") {
      return { success: false, error: "Incorrect email or password." };
    }
    console.error("Staff login error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function logoutStaff() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });
  } catch (e) {
    console.error("Staff logout failed:", e);
  }
  return { success: true };
}
