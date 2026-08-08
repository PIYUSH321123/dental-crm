import db from "@/lib/db";
import { getCompanyBySlug as getStaticCompanyBySlug } from "@/lib/companies-server";
import { hashPassword } from "@/lib/auth-server";

export interface CreateCompanyInput {
  name: string;
  slug?: string;
  email?: string | null;
  phone?: string | null;
  subscriptionPlanId?: string | null;
}

export interface RegisterCompanyWithAdminInput {
  name: string;
  slug?: string;
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
 * Generates and normalizes a URL slug strictly from a project/company name.
 * Example: "Active Life Therapy" -> "active-life-therapy"
 */
export function generateSlugFromProjectName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Fetches all registered companies for selection lists and dropdowns.
 */
export async function getCompaniesList() {
  try {
    return await db.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching companies list:", error);
    return [];
  }
}

/**
 * Creates a standard company/clinic record in the database.
 */
export async function createCompany(input: CreateCompanyInput) {
  const { name, slug, email, phone, subscriptionPlanId } = input;
  const trimmedName = name.trim();
  const normalizedSlug = generateSlugFromProjectName(slug || trimmedName);

  if (!trimmedName || !normalizedSlug) {
    const error: any = new Error("Invalid company name or slug.");
    error.statusCode = 400;
    throw error;
  }

  // Check unique company name
  const existingByName = await db.company.findUnique({
    where: { name: trimmedName },
  });
  if (existingByName) {
    const error: any = new Error(`Company with name "${trimmedName}" already exists.`);
    error.statusCode = 400;
    error.errors = { name: ["Company name is already taken"] };
    throw error;
  }

  // Check unique company slug
  const existingBySlug = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });
  if (existingBySlug) {
    const error: any = new Error(`Company with slug "${normalizedSlug}" already exists.`);
    error.statusCode = 400;
    error.errors = { slug: ["Slug is already taken"] };
    throw error;
  }

  const company = await db.company.create({
    data: {
      name: trimmedName,
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
  const trimmedName = name.trim();
  const normalizedSlug = generateSlugFromProjectName(slug || trimmedName);
  const normalizedAdminEmail = admin.email.toLowerCase().trim();

  if (!trimmedName || !normalizedSlug) {
    const error: any = new Error("Invalid company name or slug.");
    error.statusCode = 400;
    throw error;
  }

  // Check unique company name
  const existingByName = await db.company.findUnique({
    where: { name: trimmedName },
  });
  if (existingByName) {
    const error: any = new Error(`Company with name "${trimmedName}" already exists.`);
    error.statusCode = 400;
    throw error;
  }

  // Check unique company slug
  const existingBySlug = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });
  if (existingBySlug) {
    const error: any = new Error(`Company with slug "${normalizedSlug}" already exists.`);
    error.statusCode = 400;
    throw error;
  }

  // Check unique user email
  const existingUser = await db.user.findUnique({
    where: { email: normalizedAdminEmail },
  });
  if (existingUser) {
    const error: any = new Error(`User with email "${admin.email}" already exists.`);
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
        name: trimmedName,
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
 * Resolves a company record by slug.
 * Supports:
 * 1. Project Slug resolution: Project.slug -> Project.company
 * 2. Direct Company Slug resolution: Company.slug
 * 3. Static fallback configuration
 */
export async function getCompanyBySlug(slug: string) {
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Try resolving slug as a Project Slug -> Company
  const project = await db.project.findUnique({
    where: { slug: normalizedSlug },
    include: {
      company: {
        include: {
          subscriptionPlan: true,
          accessConfig: true,
        },
      },
    },
  });

  if (project?.company) {
    return {
      ...project.company,
      projectId: project.id,
      projectName: project.name,
      projectSlug: project.slug,
    };
  }

  // 2. Direct Company Slug lookup
  let company = await db.company.findUnique({
    where: { slug: normalizedSlug },
    include: {
      subscriptionPlan: true,
      accessConfig: true,
    },
  });

  if (company) {
    return company;
  }

  // 3. Fallback to static mock companies for development/seeded templates
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

  return null;
}

/**
 * Ensures a company exists in the database, seeding from static configuration if required.
 */
export async function ensureCompanyExists(slug: string) {
  const normalizedSlug = slug.toLowerCase().trim();

  let company = await getCompanyBySlug(normalizedSlug);
  if (company) {
    return company;
  }

  const staticConfig = await getStaticCompanyBySlug(normalizedSlug);
  if (!staticConfig) {
    throw new Error(`Company or project with slug "${slug}" not found in system.`);
  }

  const created = await db.company.create({
    data: {
      id: staticConfig.id,
      name: staticConfig.name,
      slug: normalizedSlug,
      email: staticConfig.email || null,
      phone: staticConfig.phone || null,
    },
  });

  return created;
}
