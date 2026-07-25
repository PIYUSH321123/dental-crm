import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

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

    const branches = await db.branch.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      branches,
    });
  } catch (error) {
    console.error("Error in GET /api/branches:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companySlug, name, address } = body;

    if (!companySlug || !name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: companySlug, name." },
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

    const newBranch = await db.branch.create({
      data: {
        companyId: company.id,
        name,
        address: address || null,
      },
    });

    return NextResponse.json({
      success: true,
      branch: newBranch,
    });
  } catch (error) {
    console.error("Error in POST /api/branches:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
