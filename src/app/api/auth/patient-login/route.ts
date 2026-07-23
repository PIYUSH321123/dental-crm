import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { comparePassword, signJWT } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const { emailOrMobile, password, companySlug } = await request.json();

    if (!emailOrMobile || !password || !companySlug) {
      return NextResponse.json(
        { error: "Email/Mobile, password, and company slug are required" },
        { status: 400 }
      );
    }

    const normalizedSlug = companySlug.toLowerCase().trim();

    // Find the company
    const company = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 404 }
      );
    }

    // Determine if input is email or mobile
    const isEmail = emailOrMobile.includes("@");

    // Search patient
    let patient = null;
    if (isEmail) {
      patient = await db.patient.findFirst({
        where: {
          email: emailOrMobile,
          companyId: company.id,
        },
      });
    } else {
      patient = await db.patient.findFirst({
        where: {
          mobile: emailOrMobile,
          companyId: company.id,
        },
      });
    }

    if (!patient) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await comparePassword(password, patient.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate patient session token
    const token = await signJWT(
      {
        patientId: patient.id,
        name: patient.name,
        role: "PATIENT",
        companyId: company.id,
        companySlug: company.slug,
      },
      "30d" // 30 days session for patients
    );

    // Set cookie
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
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        mobile: patient.mobile,
        companyId: company.id,
        companySlug: company.slug,
      },
    });
  } catch (error: any) {
    console.error("Error in patient login:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
