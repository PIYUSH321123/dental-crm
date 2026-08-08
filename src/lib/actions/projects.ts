"use server";

import { revalidatePath } from "next/cache";
import { createProject, type CreateProjectInput } from "@/services/project.service";

export type { CreateProjectInput };

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Server Action to create a new project and associated company in the database.
 */
export async function createProjectAction(input: CreateProjectInput): Promise<ActionResult> {
  try {
    await createProject(input);

    // Revalidate cache for admin projects and dashboard
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");

    return { success: true, message: "Project, company, and admin user created successfully!" };
  } catch (error: any) {
    console.error("Error creating project server action:", error);
    return { success: false, error: error.message || "An unexpected database error occurred." };
  }
}
