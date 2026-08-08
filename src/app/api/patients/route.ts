import { NextRequest, NextResponse } from "next/server";
import {
  getPatientsByCompanySlug,
  createPatient,
  updatePatient,
} from "@/services/patient.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("companySlug");

    if (!companySlug) {
      return NextResponse.json(
        { success: false, message: "companySlug query parameter is required." },
        { status: 400 }
      );
    }

    const patients = await getPatientsByCompanySlug(companySlug);

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    console.error("Error in GET /api/patients:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companySlug } = body;

    const patient = await createPatient(companySlug, body);

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error in POST /api/patients:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, companySlug, ...updatedFields } = body;

    const patient = await updatePatient(companySlug, id, updatedFields);

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error in PUT /api/patients:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
