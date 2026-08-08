import db from "@/lib/db";
import { IntegrationProvider } from "@/generated/prisma/index";
import { hashPassword } from "@/lib/auth-server";

export interface CreateProjectInput {
  projectName: string;
  companyName: string;
  leadName: string;
  email: string;
  subscriptionPlan: "Basic" | "Pro" | "Growth" | "Enterprise";
  budget: number;
  adminPassword?: string;
}

/**
 * Service to provision a new project, company tenant, subscription plan, and admin user in a single transaction.
 */
export async function createProject(input: CreateProjectInput) {
  const { projectName, companyName, leadName, email, subscriptionPlan, budget, adminPassword } = input;

  if (!projectName.trim() || !companyName.trim() || !leadName.trim() || !email.trim() || !adminPassword || !adminPassword.trim()) {
    throw new Error("All fields are required, including the initial admin password.");
  }

  if (adminPassword.trim().length < 6) {
    throw new Error("Initial admin password must be at least 6 characters long.");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if the user email already exists
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw new Error(`A user with email "${email}" already exists.`);
  }

  // Generate unique slug strictly based on project name
  const slug = projectName.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!slug) {
    throw new Error("Invalid project name. A slug cannot be generated.");
  }

  const existingCompany = await db.company.findUnique({
    where: { slug },
  });

  if (existingCompany) {
    throw new Error("A project with this name or slug already exists.");
  }

  // Ensure Subscription Plan exists in the database
  let plan = await db.subscriptionPlan.findUnique({
    where: { name: subscriptionPlan },
  });

  if (!plan) {
    plan = await db.subscriptionPlan.create({
      data: {
        name: subscriptionPlan,
        price: subscriptionPlan === "Enterprise" ? 150000 : subscriptionPlan === "Growth" ? 75000 : subscriptionPlan === "Pro" ? 30000 : 15000,
        description: `${subscriptionPlan} Subscription Tier`,
      },
    });
  }

  const hashedPassword = await hashPassword(adminPassword.trim());

  // Perform database operations in a transaction
  return await db.$transaction(async (tx) => {
    // A. Create the Project
    const project = await tx.project.create({
      data: {
        name: projectName,
      },
    });

    // B. Create the Company with access to all modules by default
    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);

    const company = await tx.company.create({
      data: {
        name: companyName,
        slug,
        email: normalizedEmail,
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

    // C. Create the Company Admin User
    const user = await tx.user.create({
      data: {
        companyId: company.id,
        name: leadName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "COMPANY_ADMIN",
      },
    });

    // D. Link them via a default Integration
    const integration = await tx.integration.create({
      data: {
        companyId: company.id,
        projectId: project.id,
        provider: IntegrationProvider.GOOGLE_ANALYTICS,
        name: `${projectName} Link Integration`,
        isEnabled: true,
        config: {
          budget,
          leadName,
          notes: "Linked via admin projects directory",
        },
      },
    });

    return { project, company, user, integration };
  });
}
