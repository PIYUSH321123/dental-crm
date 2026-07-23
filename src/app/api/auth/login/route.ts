import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { comparePassword, signJWT } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const { email, password, companySlug } = await request.json();

    if (!email || !password || !companySlug) {
      return NextResponse.json(
        { error: "Email, password, and company slug are required" },
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

    // Find the user belonging to this company
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || user.companyId !== company.id) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate session token
    const token = await signJWT(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: company.id,
        companySlug: company.slug,
      },
      "7d" // 7 days session for staff
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: company.id,
        companySlug: company.slug,
      },
    });
  } catch (error: any) {
    console.error("Error in company user login:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
