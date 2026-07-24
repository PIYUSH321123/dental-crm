import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Helper to map DB Patient to Frontend format
function mapDbPatientToFrontend(dbPatient: any): any {
  return {
    id: dbPatient.id,
    name: dbPatient.name,
    dob: dbPatient.dob instanceof Date ? dbPatient.dob.toISOString().split("T")[0] : dbPatient.dob,
    gender: dbPatient.gender,
    blood_group: dbPatient.bloodGroup || "",
    mobile: dbPatient.mobile,
    alt_mobile: dbPatient.altMobile || "",
    email: dbPatient.email || "",
    occupation: dbPatient.occupation || "",
    address: dbPatient.address || "",
    height: dbPatient.height,
    weight: dbPatient.weight,
    bmi: dbPatient.bmi || "",
    bp: dbPatient.bp || "",
    condition: dbPatient.condition || "",
    assigned_therapist_id: dbPatient.assignedTherapistId || "",
    sessions_attended: dbPatient.sessionsAttended,
    sessions_total: dbPatient.sessionsTotal,
    last_visit: dbPatient.lastVisit ? dbPatient.lastVisit.toISOString().split("T")[0] : "Just Joined",
    balance: dbPatient.balance,
    status: dbPatient.status,
    created_at: dbPatient.createdAt.toISOString(),
    medical_history: dbPatient.medicalHistory || { conditions: "", surgeries: "", allergies: "", medications: "" },
    emergency_contact: dbPatient.emergencyContact || { name: "", relation: "", phone: "" },
    documents: dbPatient.documents || [],
    timeline: dbPatient.timeline || [],
    invoices: dbPatient.invoices || [],
  };
}

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

    const company = await db.company.findUnique({
      where: { slug: companySlug.toLowerCase() },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }

    const dbPatients = await db.patient.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    });

    const formattedPatients = dbPatients.map(mapDbPatientToFrontend);

    return NextResponse.json({
      success: true,
      patients: formattedPatients,
    });
  } catch (error) {
    console.error("Error in GET /api/patients:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companySlug,
      name,
      dob,
      gender,
      blood_group,
      mobile,
      alt_mobile,
      email,
      occupation,
      address,
      height,
      weight,
      bmi,
      bp,
      condition,
      assigned_therapist_id,
      sessions_total,
      balance,
      medical_history,
      emergency_contact,
      documents,
      timeline,
      invoices,
    } = body;

    if (!companySlug || !name || !dob || !mobile) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const company = await db.company.findUnique({
      where: { slug: companySlug.toLowerCase() },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }

    // Check if patient already exists
    const existingPatient = await db.patient.findFirst({
      where: {
        companyId: company.id,
        mobile,
      },
    });

    if (existingPatient) {
      return NextResponse.json(
        { success: false, message: "A patient with this mobile number already exists." },
        { status: 400 }
      );
    }

    const customId = `P-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPatient = await db.patient.create({
      data: {
        id: customId,
        companyId: company.id,
        name,
        dob: new Date(dob),
        gender: gender || "Male",
        bloodGroup: blood_group || null,
        mobile,
        altMobile: alt_mobile || null,
        email: email || null,
        occupation: occupation || null,
        address: address || null,
        height: parseFloat(height) || 0,
        weight: parseFloat(weight) || 0,
        bmi: bmi || null,
        bp: bp || null,
        condition: condition || null,
        assignedTherapistId: assigned_therapist_id || null,
        sessionsAttended: 0,
        sessionsTotal: parseInt(sessions_total) || 0,
        balance: parseFloat(balance) || 0,
        status: "Active",
        medicalHistory: medical_history || {},
        emergencyContact: emergency_contact || {},
        documents: documents || [],
        timeline: timeline || [],
        invoices: invoices || [],
      },
    });

    return NextResponse.json({
      success: true,
      patient: mapDbPatientToFrontend(newPatient),
    });
  } catch (error) {
    console.error("Error in POST /api/patients:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
