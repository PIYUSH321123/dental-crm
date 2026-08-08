import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { registerCompanyWithAdmin } from "@/services/company.service";

export async function POST(request: Request) {
  try {
    // 1. Authorize - Must be Super Admin
    const adminSession = await getAdminSession();
    if (!adminSession || adminSession.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Super Admin access required" },
        { status: 403 }
      );
    }

    // 2. Parse Request Body
    const body = await request.json();
    const { name, slug, email, phone, admin, accessConfig } = body;

    // Validate Required Fields
    if (!name || !slug || !admin || !admin.name || !admin.email || !admin.password) {
      return NextResponse.json(
        { error: "Missing required fields (company name, slug, admin.name, admin.email, admin.password)" },
        { status: 400 }
      );
    }

    const result = await registerCompanyWithAdmin({
      name,
      slug,
      email,
      phone,
      admin,
      accessConfig,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    if (error.statusCode === 400) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating company in register route:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
