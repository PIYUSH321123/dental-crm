"use server";

import db from "@/lib/db";
import { getProjectSlug } from "@/app/(admin)/admin/projects/data";
import { IntegrationProvider } from "@/generated/prisma/index";
import { revalidatePath } from "next/cache";

export interface CreateProjectInput {
  projectName: string;
  companyName: string;
  leadName: string;
  email: string;
  subscriptionPlan: "Basic" | "Pro" | "Growth" | "Enterprise";
  budget: number;
}

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Server Action to create a new project and associated company in the database.
 */
export async function createProjectAction(input: CreateProjectInput): Promise<ActionResult> {
  try {
    const { projectName, companyName, leadName, email, subscriptionPlan, budget } = input;

    if (!projectName.trim() || !companyName.trim() || !leadName.trim() || !email.trim()) {
      return { success: false, error: "All fields are required." };
    }

    // 1. Generate unique slug
    let slug = getProjectSlug(projectName, companyName);
    const existingCompany = await db.company.findUnique({
      where: { slug },
    });

    if (existingCompany) {
      // Add a suffix if slug already exists to ensure uniqueness
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
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

    // 3. Perform database operations in a transaction
    await db.$transaction(async (tx) => {
      // A. Create the Project
      const project = await tx.project.create({
        data: {
          name: projectName,
        },
      });

      // B. Create the Company (Dummy)
      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1); // 1 year from now

      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
          email,
          subscriptionPlanId: plan.id,
          subscriptionRenewalDate: renewalDate,
        },
      });

      // C. Link them via a dummy Integration
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

    return { success: true, message: "Project and dummy company created successfully!" };
  } catch (error) {
    console.error("Error creating project server action:", error);
    return { success: false, error: "An unexpected database error occurred." };
  }
}
