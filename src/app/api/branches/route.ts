import { NextRequest, NextResponse } from "next/server";
import {
  getBranchesByCompanySlug,
  createBranch,
} from "@/services/branch.service";

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

    const branches = await getBranchesByCompanySlug(companySlug);

    return NextResponse.json({
      success: true,
      branches,
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    console.error("Error in GET /api/branches:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companySlug, name, address } = body;

    const newBranch = await createBranch(companySlug, { name, address });

    return NextResponse.json({
      success: true,
      branch: newBranch,
    });
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error in POST /api/branches:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
