import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateSuperAdmin } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { user, token } = await authenticateSuperAdmin({ email, password });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 hours
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    if (error.message === "Invalid email or password") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === "Account is deactivated" || error.message?.includes("admin privileges required")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error in super admin login:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
