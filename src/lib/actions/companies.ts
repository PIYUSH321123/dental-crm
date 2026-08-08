"use server";

import { createCompanySchema, type CreateCompanyInput } from "@/lib/validations/company";
import {
  createCompany,
  getCompanyBySlug,
  getCompaniesList,
} from "@/services/company.service";
import type { CompanyConfig } from "@/lib/companies";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

/**
 * Server Action to create a company.
 */
export async function createCompanyAction(
  input: CreateCompanyInput
): Promise<ActionResult<any>> {
  try {
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

    const company = await createCompany(validationResult.data);

    return {
      success: true,
      data: company,
    };
  } catch (error: any) {
    if (error.statusCode === 400) {
      return {
        success: false,
        error: error.message,
        errors: error.errors,
      };
    }
    console.error("Error in createCompanyAction server action:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the company. Please try again.",
    };
  }
}

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

export async function getCompanyBySlugAction(slug: string): Promise<CompanyConfig | null> {
  if (!slug) return null;
  try {
    const company = await getCompanyBySlug(slug);
    return company as CompanyConfig | null;
  } catch (error) {
    console.error("Error in getCompanyBySlugAction:", error);
    return null;
  }
}

export async function getCompaniesListAction() {
  return await getCompaniesList();
}
