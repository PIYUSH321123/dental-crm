import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateCompanyStaff } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const { email, password, companySlug } = await request.json();

    if (!email || !password || !companySlug) {
      return NextResponse.json(
        { error: "Email, password, and company slug are required" },
        { status: 400 }
      );
    }

    const { user, token } = await authenticateCompanyStaff({ email, password, companySlug });

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
      user,
    });
  } catch (error: any) {
    if (error.message === "Clinic not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === "Invalid email or password") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error in company login route:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
