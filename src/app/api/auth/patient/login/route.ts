import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticatePatient } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const { emailOrMobile, password, companySlug } = await request.json();

    if (!emailOrMobile || !password || !companySlug) {
      return NextResponse.json(
        { error: "Email/Mobile, password, and company slug are required" },
        { status: 400 }
      );
    }

    const { patient, token } = await authenticatePatient({ emailOrMobile, password, companySlug });

    const cookieStore = await cookies();
    cookieStore.set("patient_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error: any) {
    if (error.message === "Clinic not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === "Invalid email/mobile or password") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error in patient login route:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
