import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword } from "@/lib/auth-server";
import { UserRole } from "@/generated/prisma/index";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("companySlug");

    if (!companySlug) {
      return NextResponse.json(
        { success: false, message: "companySlug query parameter is required." },
        { status: 400 }
      );
    }

    const company = await db.company.findUnique({
      where: { slug: companySlug.toLowerCase() },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }

    // Fetch all users for the company
    const staffMembers = await db.user.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branchId: true,
        address: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      staff: staffMembers,
    });
  } catch (error) {
    console.error("Error in GET /api/staff:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companySlug, name, email, password, role, branchId, address } = body;

    if (!companySlug || !name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const company = await db.company.findUnique({
      where: { slug: companySlug.toLowerCase() },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Map role (default to STAFF)
    let userRole: UserRole = UserRole.STAFF;
    if (role === "COMPANY_ADMIN") {
      userRole = UserRole.COMPANY_ADMIN;
    } else if (role === "SUPER_ADMIN") {
      userRole = UserRole.SUPER_ADMIN;
    }

    const newStaff = await db.user.create({
      data: {
        companyId: company.id,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userRole,
        branchId: branchId || null,
        address: address || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branchId: true,
        address: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      staff: newStaff,
    });
  } catch (error) {
    console.error("Error in POST /api/staff:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
