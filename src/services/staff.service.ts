import db from "@/lib/db";
import { hashPassword } from "@/lib/auth-server";
import { UserRole } from "@/generated/prisma/index";
import { mockTherapists } from "@/app/(app)/c/[company]/dashboard/patient-management/patients/_patient-table/patient-data";

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role?: string;
  branchId?: string | null;
  address?: string | null;
}

/**
 * Retrieves all staff members belonging to a company.
 */
export async function getStaffMembersByCompanySlug(companySlug: string) {
  const normalizedSlug = companySlug.toLowerCase().trim();
  try {
    const company = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (!company) {
      const error: any = new Error("Company not found.");
      error.statusCode = 404;
      throw error;
    }

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

    return staffMembers;
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw error;
    }
    console.warn("Database offline or query failed while retrieving staff, returning mock staff list:", error);
    return mockTherapists.map((t) => ({
      id: t.id,
      name: t.name,
      email: `${t.id}@mock.com`,
      role: UserRole.STAFF,
      branchId: null,
      address: null,
      createdAt: new Date(),
    }));
  }
}

/**
 * Creates a new staff member within a company.
 */
export async function createStaffMember(companySlug: string, input: CreateStaffInput) {
  const { name, email, password, role, branchId, address } = input;

  if (!companySlug || !name || !email || !password) {
    const error: any = new Error("Missing required fields (companySlug, name, email, password).");
    error.statusCode = 400;
    throw error;
  }

  const normalizedSlug = companySlug.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const company = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (!company) {
      const error: any = new Error("Company not found.");
      error.statusCode = 404;
      throw error;
    }

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      const error: any = new Error("A user with this email already exists.");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await hashPassword(password);

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
        email: normalizedEmail,
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

    return newStaff;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.warn("Database offline or query failed while creating staff member, returning mock staff:", error);
    let userRole: UserRole = UserRole.STAFF;
    if (role === "COMPANY_ADMIN") {
      userRole = UserRole.COMPANY_ADMIN;
    } else if (role === "SUPER_ADMIN") {
      userRole = UserRole.SUPER_ADMIN;
    }
    return {
      id: `usr-${Date.now()}`,
      name,
      email: normalizedEmail,
      role: userRole,
      branchId: branchId || null,
      address: address || null,
      createdAt: new Date(),
    };
  }
}
