"use server";

import { revalidatePath } from "next/cache";
import { createProject, type CreateProjectInput } from "@/services/project.service";

type ActionResult =
  | { success: true; message: string; project?: any }
  | { success: false; error: string };

/**
 * Server Action to create a new project (either under an existing company or creating a new company atomically).
 */
export async function createProjectAction(input: CreateProjectInput): Promise<ActionResult> {
  try {
    const result = await createProject(input);

    // Revalidate cache for admin projects and dashboard
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");

    const message = input.companyId
      ? `Project "${result.project.name}" created under existing company "${result.company.name}"!`
      : `Project "${result.project.name}" and company "${result.company.name}" created successfully!`;

    return {
      success: true,
      message,
      project: result.project,
    };
  } catch (error: any) {
    console.error("Error creating project server action:", error);
    return {
      success: false,
      error: error.message || "An unexpected database error occurred while creating project.",
    };
  }
}
