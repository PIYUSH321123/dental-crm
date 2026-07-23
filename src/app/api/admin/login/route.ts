import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { comparePassword, signJWT } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find the platform user and include their role
    const platformUser = await db.platformUser.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!platformUser) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!platformUser.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await comparePassword(password, platformUser.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if the user is a super admin
    if (platformUser.role.name !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access: admin privileges required" },
        { status: 403 }
      );
    }

    // Generate token
    const token = await signJWT(
      {
        userId: platformUser.id,
        email: platformUser.email,
        role: "SUPER_ADMIN",
      },
      "4h" // 4 hours admin session
    );

    // Set cookie
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
      user: {
        id: platformUser.id,
        name: platformUser.name,
        email: platformUser.email,
        role: "SUPER_ADMIN",
      },
    });
  } catch (error: any) {
    console.error("Error in super admin login:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
