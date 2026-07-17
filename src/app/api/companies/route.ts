import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { createCompanySchema } from "@/lib/validations/company";

/**
 * Next.js Route Handler for POST /api/companies
 * This is the Next.js equivalent of an API controller method.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse the JSON body from the incoming request
    const body = await request.json();

    // 2. Validate the request data against our Zod schema
    const validationResult = createCompanySchema.safeParse(body);

    if (!validationResult.success) {
      // If validation fails, return 400 Bad Request with specific error messages
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, slug, email, phone, subscriptionPlanId } = validationResult.data;
    const normalizedSlug = slug.toLowerCase();

    // 3. Check if a company with the same slug already exists
    const existingCompany = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existingCompany) {
      return NextResponse.json(
        {
          success: false,
          message: "A clinic or company with this slug already exists.",
          errors: { slug: ["Slug is already taken"] },
        },
        { status: 400 }
      );
    }

    // 4. Create the new company record in the database
    const newCompany = await db.company.create({
      data: {
        name,
        slug: normalizedSlug,
        email: email || null,
        phone: phone || null,
        subscriptionPlanId: subscriptionPlanId || null,
      },
    });

    // 5. Return the created company with a 201 Created status
    return NextResponse.json(
      {
        success: true,
        message: "Company created successfully",
        data: newCompany,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating company via API route:", error);

    // 6. Return a generic 500 Internal Server Error for unhandled exceptions
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while creating the company.",
      },
      { status: 500 }
    );
  }
}
