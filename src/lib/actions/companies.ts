"use server";

import db from "@/lib/db";
import { createCompanySchema, CreateCompanyInput } from "@/lib/validations/company";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

/**
 * Next.js Server Action to create a company.
 * This can be imported and executed directly within React components (Client or Server).
 */
export async function createCompanyAction(
  input: CreateCompanyInput
): Promise<ActionResult<any>> {
  try {
    // 1. Validate the input against the Zod schema
    const validationResult = createCompanySchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string[]> = {};
      
      for (const [key, value] of Object.entries(errors)) {
        if (value) {
          formattedErrors[key] = value;
        }
      }

      return {
        success: false,
        error: "Validation failed. Please correct the errors and try again.",
        errors: formattedErrors,
      };
    }

    const { name, slug, email, phone, subscriptionPlanId } = validationResult.data;
    const normalizedSlug = slug.toLowerCase();

    // 2. Check if a company with this slug already exists in the database
    const existingCompany = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existingCompany) {
      return {
        success: false,
        error: "A clinic or company with this slug already exists.",
        errors: { slug: ["Slug is already taken"] },
      };
    }

    // 3. Create the company in the database using Prisma
    const company = await db.company.create({
      data: {
        name,
        slug: normalizedSlug,
        email: email || null,
        phone: phone || null,
        subscriptionPlanId: subscriptionPlanId || null,
      },
    });

    // 4. Return a success result with the company data
    return {
      success: true,
      data: company,
    };
  } catch (error) {
    console.error("Error in createCompanyAction server action:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the company. Please try again.",
    };
  }
}

import { getCompanyBySlug } from "@/lib/companies-server";

export async function checkCompanyExistsAction(slug: string): Promise<boolean> {
  if (!slug) return false;
  try {
    const company = await getCompanyBySlug(slug);
    return company !== null;
  } catch (error) {
    console.error("Error in checkCompanyExistsAction:", error);
    return false;
  }
}
