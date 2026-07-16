"use server";

import { cookies } from "next/headers";
import { companyLoginSchema, adminLoginSchema } from "@/lib/validations/auth";
import { getCompanyBySlug } from "@/lib/companies";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function signInCompanyStaff(
  companySlug: string,
  input: { email: string; password: string }
): Promise<ActionResult> {
  const parsed = companyLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check your email and password." };
  }

  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    return { success: false, error: "This clinic could not be found." };
  }

  // TODO: replace with real credential verification scoped to company.id
  // e.g. const user = await db.staff.findUnique({ where: { email, companyId: company.id } })
  //      const valid = await bcrypt.compare(password, user.passwordHash)
  const isValid = parsed.data.email && parsed.data.password.length >= 8;

  if (!isValid) {
    return { success: false, error: "Incorrect email or password." };
  }

  // TODO: replace with a real signed JWT containing { role: "company_staff", companyId }
  const sessionToken = `demo-session-${company.id}`;

  (await cookies()).set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}

export async function signInSuperAdmin(input: {
  email: string;
  password: string;
  twoFactorCode: string;
}): Promise<ActionResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check every field and try again." };
  }

  // TODO: replace with real lookup against a dedicated super-admin table —
  // never check admin credentials against the same table as company staff.
  // e.g. const admin = await db.superAdmin.findUnique({ where: { email } })
  //      const validPassword = await bcrypt.compare(password, admin.passwordHash)
  const validPassword = parsed.data.password.length >= 8;

  if (!validPassword) {
    return { success: false, error: "Incorrect email or password." };
  }

  // TODO: verify twoFactorCode against a real TOTP secret (e.g. `otplib`),
  // not a hardcoded check like this demo placeholder.
  const validTwoFactor = parsed.data.twoFactorCode.length === 6;

  if (!validTwoFactor) {
    return { success: false, error: "That 2FA code is incorrect or expired." };
  }

  // TODO: sign a real JWT with { role: "super_admin" } and a short expiry —
  // admin sessions should live for hours, not the 7-day window used for staff.
  const sessionToken = `demo-admin-session-${Date.now()}`;

  (await cookies()).set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 hours — shorter-lived than a staff session
  });

  // TODO: write an audit log entry here (who signed in, when, from where)
  // to back the "all sign-in attempts are logged" notice shown on the page.

  return { success: true };
}
