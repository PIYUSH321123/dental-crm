import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminSession, hashPassword } from "@/lib/auth-server";

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

    const normalizedSlug = slug.toLowerCase().trim();

    // Check if Company Slug already exists
    const existingCompany = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });
    if (existingCompany) {
      return NextResponse.json(
        { error: `Company with slug "${normalizedSlug}" already exists` },
        { status: 400 }
      );
    }

    // Check if Company Admin email already exists in the system
    const existingUser = await db.user.findUnique({
      where: { email: admin.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: `User with email "${admin.email}" already exists` },
        { status: 400 }
      );
    }

    // 3. Hash Admin Password
    const hashedPassword = await hashPassword(admin.password);

    // Default access configuration if not provided
    const permissions = {
      marketing: accessConfig?.marketing ?? false,
      appointments: accessConfig?.appointments ?? false,
      billing: accessConfig?.billing ?? false,
      patientManagement: accessConfig?.patientManagement ?? false,
      leadManagement: accessConfig?.leadManagement ?? false,
      activityManagement: accessConfig?.activityManagement ?? false,
    };

    // 4. Create Company, Config, and Admin User transactionally
    const result = await db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name,
          slug: normalizedSlug,
          email,
          phone,
          accessConfig: {
            create: permissions,
          },
        },
      });

      const user = await tx.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: "COMPANY_ADMIN",
          companyId: company.id,
        },
      });

      return { company, user };
    });

    return NextResponse.json({
      success: true,
      company: {
        id: result.company.id,
        name: result.company.name,
        slug: result.company.slug,
      },
      admin: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      accessConfig: permissions,
    });
  } catch (error: any) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
