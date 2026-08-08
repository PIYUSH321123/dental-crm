import { NextRequest, NextResponse } from "next/server";
import { createCompanySchema } from "@/lib/validations/company";
import { createCompany } from "@/services/company.service";

/**
 * Next.js Route Handler for POST /api/companies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = createCompanySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const newCompany = await createCompany(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        message: "Company created successfully",
        data: newCompany,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.statusCode === 400) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    console.error("Error creating company via API route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while creating the company.",
      },
      { status: 500 }
    );
  }
}
