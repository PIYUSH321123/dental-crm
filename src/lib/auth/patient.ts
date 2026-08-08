"use server";

import { cookies } from "next/headers";
import { patientLoginSchema, type PatientLoginInput } from "@/lib/validations/auth";
import { authenticatePatient } from "@/services/auth.service";

export async function loginPatient(input: PatientLoginInput) {
  try {
    const parsed = patientLoginSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { patient, token } = await authenticatePatient({
      emailOrMobile: parsed.data.emailOrMobile,
      password: parsed.data.password,
      companySlug: parsed.data.companySlug,
    });

    const cookieStore = await cookies();
    cookieStore.set("patient_session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true, patient };
  } catch (error: any) {
    if (error.message === "Clinic not found") {
      return { success: false, error: "This clinic could not be found." };
    }
    if (error.message === "Invalid email/mobile or password") {
      return { success: false, error: "Incorrect email/mobile or password." };
    }
    console.error("Patient login error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function logoutPatient() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("patient_session", "", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });
  } catch (e) {
    console.error("Patient logout failed:", e);
  }
  return { success: true };
}
