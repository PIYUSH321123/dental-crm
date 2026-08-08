import { NextRequest, NextResponse } from "next/server";
import {
  getStaffMembersByCompanySlug,
  createStaffMember,
} from "@/services/staff.service";

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

    const staffMembers = await getStaffMembersByCompanySlug(companySlug);

    return NextResponse.json({
      success: true,
      staff: staffMembers,
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    console.error("Error in GET /api/staff:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companySlug, name, email, password, role, branchId, address } = body;

    const newStaff = await createStaffMember(companySlug, {
      name,
      email,
      password,
      role,
      branchId,
      address,
    });

    return NextResponse.json({
      success: true,
      staff: newStaff,
    });
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error in POST /api/staff:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
