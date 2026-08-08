import db from "@/lib/db";
import { IntegrationProvider } from "@/generated/prisma/index";
import { hashPassword } from "@/lib/auth-server";
import { generateSlugFromProjectName } from "@/services/company.service";

export interface CreateProjectInput {
  projectName: string;
  // Optional: If attaching to an existing company
  companyId?: string;
  // Required if creating a new company
  companyName?: string;
  leadName?: string;
  email?: string;
  subscriptionPlan?: "Basic" | "Pro" | "Growth" | "Enterprise";
  budget?: number;
  adminPassword?: string;
}

/**
 * Service to provision a project, supporting both:
 * 1. Attaching a new project to an existing company (without duplicating credentials)
 * 2. Creating a new company + admin + subscription + project atomically
 */
export async function createProject(input: CreateProjectInput) {
  const {
    projectName,
    companyId,
    companyName,
    leadName,
    email,
    subscriptionPlan = "Basic",
    budget = 0,
    adminPassword,
  } = input;

  const trimmedProjectName = projectName?.trim();
  if (!trimmedProjectName) {
    throw new Error("Project name is required.");
  }

  // 1. Generate unique project slug
  const projectSlug = generateSlugFromProjectName(trimmedProjectName);
  if (!projectSlug) {
    throw new Error("Invalid project name. A URL slug could not be generated.");
  }

  // 2. Validate Project Name and Slug uniqueness
  const existingProjectByName = await db.project.findUnique({
    where: { name: trimmedProjectName },
  });
  if (existingProjectByName) {
    throw new Error(`A project with the name "${trimmedProjectName}" already exists.`);
  }

  const existingProjectBySlug = await db.project.findUnique({
    where: { slug: projectSlug },
  });
  if (existingProjectBySlug) {
    throw new Error(`A project with slug "${projectSlug}" already exists.`);
  }

  // =========================================================================
  // FLOW A: Existing Company Selected
  // =========================================================================
  if (companyId) {
    const existingCompany = await db.company.findUnique({
      where: { id: companyId },
      include: { users: true },
    });

    if (!existingCompany) {
      throw new Error(`Company with ID "${companyId}" not found.`);
    }

    return await db.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: trimmedProjectName,
          slug: projectSlug,
          companyId: existingCompany.id,
        },
      });

      const integration = await tx.integration.create({
        data: {
          companyId: existingCompany.id,
          projectId: project.id,
          provider: IntegrationProvider.GOOGLE_ANALYTICS,
          name: `${trimmedProjectName} Analytics Integration`,
          isEnabled: true,
          config: {
            budget,
            leadName: leadName || existingCompany.name,
            notes: "Linked under existing company",
          },
        },
      });

      return {
        project,
        company: existingCompany,
        integration,
      };
    });
  }

  // =========================================================================
  // FLOW B: New Company Creation Flow
  // =========================================================================
  const trimmedCompanyName = companyName?.trim();
  const trimmedLeadName = leadName?.trim();
  const trimmedEmail = email?.trim().toLowerCase();
  const trimmedPassword = adminPassword?.trim();

  if (!trimmedCompanyName || !trimmedLeadName || !trimmedEmail || !trimmedPassword) {
    throw new Error(
      "Company Name, Lead Contact Name, Email, and Initial Admin Password are required to create a new company."
    );
  }

  if (trimmedPassword.length < 6) {
    throw new Error("Initial admin password must be at least 6 characters long.");
  }

  // Check unique company name
  const existingCompanyByName = await db.company.findUnique({
    where: { name: trimmedCompanyName },
  });
  if (existingCompanyByName) {
    throw new Error(`A company named "${trimmedCompanyName}" already exists.`);
  }

  // Check unique company slug
  const companySlug = generateSlugFromProjectName(trimmedCompanyName);
  const existingCompanyBySlug = await db.company.findUnique({
    where: { slug: companySlug },
  });
  if (existingCompanyBySlug) {
    throw new Error(`A company with slug "${companySlug}" already exists.`);
  }

  // Check unique user email
  const existingUser = await db.user.findUnique({
    where: { email: trimmedEmail },
  });
  if (existingUser) {
    throw new Error(`A user with email "${trimmedEmail}" already exists.`);
  }

  // Ensure Subscription Plan exists in the database
  let plan = await db.subscriptionPlan.findUnique({
    where: { name: subscriptionPlan },
  });

  if (!plan) {
    plan = await db.subscriptionPlan.create({
      data: {
        name: subscriptionPlan,
        price:
          subscriptionPlan === "Enterprise"
            ? 150000
            : subscriptionPlan === "Growth"
            ? 75000
            : subscriptionPlan === "Pro"
            ? 30000
            : 15000,
        description: `${subscriptionPlan} Subscription Tier`,
      },
    });
  }

  const hashedPassword = await hashPassword(trimmedPassword);

  // Perform database operations in an atomic transaction
  return await db.$transaction(async (tx) => {
    // 1. Create the Company with access to all modules by default
    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);

    const company = await tx.company.create({
      data: {
        name: trimmedCompanyName,
        slug: companySlug,
        email: trimmedEmail,
        subscriptionPlanId: plan.id,
        subscriptionRenewalDate: renewalDate,
        accessConfig: {
          create: {
            marketing: true,
            appointments: true,
            billing: true,
            patientManagement: true,
            leadManagement: true,
            activityManagement: true,
          },
        },
      },
    });

    // 2. Create the Project linked to this company
    const project = await tx.project.create({
      data: {
        name: trimmedProjectName,
        slug: projectSlug,
        companyId: company.id,
      },
    });

    // 3. Create the Company Admin User
    const user = await tx.user.create({
      data: {
        companyId: company.id,
        name: trimmedLeadName,
        email: trimmedEmail,
        password: hashedPassword,
        role: "COMPANY_ADMIN",
      },
    });

    // 4. Link them via a default Integration
    const integration = await tx.integration.create({
      data: {
        companyId: company.id,
        projectId: project.id,
        provider: IntegrationProvider.GOOGLE_ANALYTICS,
        name: `${trimmedProjectName} Link Integration`,
        isEnabled: true,
        config: {
          budget,
          leadName: trimmedLeadName,
          notes: "Linked via admin projects directory",
        },
      },
    });

    return { project, company, user, integration };
  });
}

/**
 * Fetches all projects with company, subscription, and integration details for the directory view.
 */
export async function getAllProjectsWithDetails() {
  try {
    const projects = await db.project.findMany({
      include: {
        company: {
          include: {
            subscriptionPlan: true,
          },
        },
        integrations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects.map((p) => {
      const integration = p.integrations?.[0];
      const config = (integration?.config as any) || {};

      const statusMap: Record<string, "Active" | "Inactive" | "Pending" | "Suspended"> = {
        Active: "Active",
        Inactive: "Inactive",
        Pending: "Pending",
        Suspended: "Suspended",
      };

      const planMap: Record<string, "Basic" | "Pro" | "Growth" | "Enterprise"> = {
        Basic: "Basic",
        Pro: "Pro",
        Growth: "Growth",
        Enterprise: "Enterprise",
      };

      const status = statusMap[p.company.status] || "Active";
      const subscription_plan = planMap[p.company.subscriptionPlan?.name || "Basic"] || "Basic";

      return {
        id: p.id,
        project_name: p.name,
        slug: p.slug,
        company_name: p.company.name,
        company_slug: p.company.slug,
        status,
        subscription_plan,
        renewal_date: p.company.subscriptionRenewalDate
          ? p.company.subscriptionRenewalDate.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        budget: typeof config.budget === "number" ? config.budget : 0,
        lead_name: config.leadName || "Admin",
        email: p.company.email || `info@${p.company.slug}.com`,
        created_at: p.createdAt.toISOString().split("T")[0],
      };
    });
  } catch (error) {
    console.error("Error in getAllProjectsWithDetails:", error);
    return [];
  }
}
