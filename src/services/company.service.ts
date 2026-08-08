import db from "@/lib/db";
import { getCompanyBySlug as getStaticCompanyBySlug } from "@/lib/companies-server";
import { hashPassword } from "@/lib/auth-server";

export interface CreateCompanyInput {
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  subscriptionPlanId?: string | null;
}

export interface RegisterCompanyWithAdminInput {
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  admin: {
    name: string;
    email: string;
    password: string;
  };
  accessConfig?: {
    marketing?: boolean;
    appointments?: boolean;
    billing?: boolean;
    patientManagement?: boolean;
    leadManagement?: boolean;
    activityManagement?: boolean;
  };
}

/**
 * Creates a standard company/clinic record in the database.
 */
export async function createCompany(input: CreateCompanyInput) {
  const { name, slug, email, phone, subscriptionPlanId } = input;
  const normalizedSlug = slug.toLowerCase().trim();

  const existingCompany = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (existingCompany) {
    const error: any = new Error("A clinic or company with this slug already exists.");
    error.statusCode = 400;
    error.errors = { slug: ["Slug is already taken"] };
    throw error;
  }

  const company = await db.company.create({
    data: {
      name,
      slug: normalizedSlug,
      email: email || null,
      phone: phone || null,
      subscriptionPlanId: subscriptionPlanId || null,
    },
  });

  return company;
}

/**
 * Creates a company with an associated company admin user and module permissions transactionally.
 */
export async function registerCompanyWithAdmin(input: RegisterCompanyWithAdminInput) {
  const { name, slug, email, phone, admin, accessConfig } = input;
  const normalizedSlug = slug.toLowerCase().trim();
  const normalizedAdminEmail = admin.email.toLowerCase().trim();

  const existingCompany = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });
  if (existingCompany) {
    const error: any = new Error(`Company with slug "${normalizedSlug}" already exists`);
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await db.user.findUnique({
    where: { email: normalizedAdminEmail },
  });
  if (existingUser) {
    const error: any = new Error(`User with email "${admin.email}" already exists`);
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(admin.password);

  const permissions = {
    marketing: accessConfig?.marketing ?? false,
    appointments: accessConfig?.appointments ?? false,
    billing: accessConfig?.billing ?? false,
    patientManagement: accessConfig?.patientManagement ?? false,
    leadManagement: accessConfig?.leadManagement ?? false,
    activityManagement: accessConfig?.activityManagement ?? false,
  };

  const result = await db.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name,
        slug: normalizedSlug,
        email: email || null,
        phone: phone || null,
        accessConfig: {
          create: permissions,
        },
      },
    });

    const user = await tx.user.create({
      data: {
        name: admin.name,
        email: normalizedAdminEmail,
        password: hashedPassword,
        role: "COMPANY_ADMIN",
        companyId: company.id,
      },
    });

    return { company, user };
  });

  return {
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
  };
}

/**
 * Resolves a company record by its slug, checking DB and static fallback.
 */
export async function getCompanyBySlug(slug: string) {
  const normalizedSlug = slug.toLowerCase().trim();
  let company = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!company) {
    const staticCompany = await getStaticCompanyBySlug(normalizedSlug);
    if (staticCompany) {
      return {
        id: staticCompany.id,
        name: staticCompany.name,
        slug: staticCompany.slug,
        email: staticCompany.email || null,
        phone: staticCompany.phone || null,
        status: "Active",
      };
    }
  }

  return company;
}

/**
 * Ensures a company exists in the database, seeding from static configuration if required.
 */
export async function ensureCompanyExists(slug: string) {
  const normalizedSlug = slug.toLowerCase().trim();

  let company = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!company) {
    const staticConfig = await getStaticCompanyBySlug(normalizedSlug);
    if (!staticConfig) {
      throw new Error(`Company with slug "${slug}" not found in system.`);
    }

    company = await db.company.create({
      data: {
        id: staticConfig.id,
        name: staticConfig.name,
        slug: normalizedSlug,
        email: staticConfig.email || null,
        phone: staticConfig.phone || null,
      },
    });
  }

  return company;
}
