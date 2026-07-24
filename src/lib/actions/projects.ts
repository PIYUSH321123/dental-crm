"use server";

import db from "@/lib/db";
import { IntegrationProvider } from "@/generated/prisma/index";
import { revalidatePath } from "next/cache";
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

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Server Action to create a new project and associated company in the database.
 */
export async function createProjectAction(input: CreateProjectInput): Promise<ActionResult> {
  try {
    const { projectName, companyName, leadName, email, subscriptionPlan, budget, adminPassword } = input;

    if (!projectName.trim() || !companyName.trim() || !leadName.trim() || !email.trim() || !adminPassword || !adminPassword.trim()) {
      return { success: false, error: "All fields are required, including the initial admin password." };
    }

    if (adminPassword.trim().length < 6) {
      return { success: false, error: "Initial admin password must be at least 6 characters long." };
    }

    // Check if the user email already exists (User email is unique)
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { success: false, error: `A user with email "${email}" already exists.` };
    }

    // 1. Generate unique slug strictly based on project name
    const slug = projectName.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!slug) {
      return { success: false, error: "Invalid project name. A slug cannot be generated." };
    }

    const existingCompany = await db.company.findUnique({
      where: { slug },
    });

    if (existingCompany) {
      return { success: false, error: "A project with this name or slug already exists." };
    }

    // 2. Ensure Subscription Plan exists in the database
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

    // Hash the password outside the transaction to keep it short
    const hashedPassword = await hashPassword(adminPassword.trim());

    // 3. Perform database operations in a transaction
    await db.$transaction(async (tx) => {
      // A. Create the Project
      const project = await tx.project.create({
        data: {
          name: projectName,
        },
      });

      // B. Create the Company with access to all modules by default
      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1); // 1 year from now

      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
          email,
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
      await tx.user.create({
        data: {
          companyId: company.id,
          name: leadName,
          email: email,
          password: hashedPassword,
          role: "COMPANY_ADMIN",
        },
      });

      // D. Link them via a dummy Integration
      await tx.integration.create({
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
    });

    // 4. Revalidate cache for the admin projects page
    revalidatePath("/admin/projects");

    return { success: true, message: "Project, company, and admin user created successfully!" };
  } catch (error) {
    console.error("Error creating project server action:", error);
    return { success: false, error: "An unexpected database error occurred." };
  }
}
