import db from "@/lib/db";
import { initialPatients, mockTherapists } from "@/app/(app)/c/[company]/dashboard/patient-management/patients/_patient-table/patient-data";

/**
 * Maps DB Patient record to Frontend format
 */
export function mapDbPatientToFrontend(dbPatient: any): any {
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

/**
 * Retrieves all patients for a company, auto-seeding mock patients if none exist.
 */
export async function getPatientsByCompanySlug(companySlug: string) {
  const normalizedSlug = companySlug.toLowerCase().trim();
  const company = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!company) {
    const error: any = new Error("Company not found.");
    error.statusCode = 404;
    throw error;
  }

  let dbPatients = await db.patient.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  // Seed database with initialPatients if no patients are found for this company
  if (dbPatients.length === 0) {
    for (const t of mockTherapists) {
      try {
        const existingUser = await db.user.findUnique({
          where: { email: `${t.id}@mock.com` },
        });
        if (!existingUser) {
          await db.user.create({
            data: {
              id: t.id,
              companyId: company.id,
              name: t.name,
              email: `${t.id}@mock.com`,
              password: "mockpasswordhashed",
              role: "STAFF",
            },
          });
        }
      } catch (err) {
        console.error(`Failed to seed mock therapist ${t.id}:`, err);
      }
    }

    for (const p of initialPatients) {
      try {
        await db.patient.create({
          data: {
            id: p.id,
            companyId: company.id,
            name: p.name,
            dob: new Date(p.dob),
            gender: p.gender || "Male",
            bloodGroup: p.blood_group || null,
            mobile: p.mobile,
            altMobile: p.alt_mobile || null,
            email: p.email || null,
            occupation: p.occupation || null,
            address: p.address || null,
            height: p.height || 0,
            weight: p.weight || 0,
            bmi: p.bmi || null,
            bp: p.bp || null,
            condition: p.condition || null,
            assignedTherapistId: p.assigned_therapist_id || null,
            sessionsAttended: p.sessions_attended || 0,
            sessionsTotal: p.sessions_total || 0,
            balance: p.balance || 0,
            status: p.status || "Active",
            medicalHistory: (p.medical_history || {}) as any,
            emergencyContact: (p.emergency_contact || {}) as any,
            documents: (p.documents || []) as any,
            timeline: (p.timeline || []) as any,
            invoices: (p.invoices || []) as any,
            createdAt: new Date(p.created_at),
          },
        });
      } catch (err) {
        console.error(`Failed to seed patient ${p.id}:`, err);
      }
    }

    dbPatients = await db.patient.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    });
  }

  return dbPatients.map(mapDbPatientToFrontend);
}

/**
 * Creates a new patient record for a company.
 */
export async function createPatient(companySlug: string, body: any) {
  const {
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
    const error: any = new Error("Missing required fields (companySlug, name, dob, mobile).");
    error.statusCode = 400;
    throw error;
  }

  const normalizedSlug = companySlug.toLowerCase().trim();
  const company = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!company) {
    const error: any = new Error("Company not found.");
    error.statusCode = 404;
    throw error;
  }

  // Check if therapist exists in this company
  if (assigned_therapist_id) {
    const therapistExists = await db.user.findFirst({
      where: {
        id: assigned_therapist_id,
        companyId: company.id,
      },
    });

    if (!therapistExists) {
      const error: any = new Error("The selected therapist/staff member does not exist in this company.");
      error.statusCode = 400;
      throw error;
    }
  }

  // Check if patient already exists
  const existingPatient = await db.patient.findFirst({
    where: {
      companyId: company.id,
      mobile,
    },
  });

  if (existingPatient) {
    const error: any = new Error("A patient with this mobile number already exists.");
    error.statusCode = 400;
    throw error;
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
      medicalHistory: (medical_history || {}) as any,
      emergencyContact: (emergency_contact || {}) as any,
      documents: (documents || []) as any,
      timeline: (timeline || []) as any,
      invoices: (invoices || []) as any,
    },
  });

  return mapDbPatientToFrontend(newPatient);
}

/**
 * Updates an existing patient record.
 */
export async function updatePatient(companySlug: string, patientId: string, updatedFields: any) {
  if (!patientId || !companySlug) {
    const error: any = new Error("patientId and companySlug are required.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedSlug = companySlug.toLowerCase().trim();
  const company = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!company) {
    const error: any = new Error("Company not found.");
    error.statusCode = 404;
    throw error;
  }

  if (
    updatedFields.assigned_therapist_id !== undefined &&
    updatedFields.assigned_therapist_id !== null &&
    updatedFields.assigned_therapist_id !== ""
  ) {
    const therapistExists = await db.user.findFirst({
      where: {
        id: updatedFields.assigned_therapist_id,
        companyId: company.id,
      },
    });

    if (!therapistExists) {
      const error: any = new Error("The selected therapist/staff member does not exist in this company.");
      error.statusCode = 400;
      throw error;
    }
  }

  const dataToUpdate: any = {};
  if (updatedFields.name !== undefined) dataToUpdate.name = updatedFields.name;
  if (updatedFields.dob !== undefined) dataToUpdate.dob = new Date(updatedFields.dob);
  if (updatedFields.gender !== undefined) dataToUpdate.gender = updatedFields.gender;
  if (updatedFields.blood_group !== undefined) dataToUpdate.bloodGroup = updatedFields.blood_group;
  if (updatedFields.mobile !== undefined) dataToUpdate.mobile = updatedFields.mobile;
  if (updatedFields.alt_mobile !== undefined) dataToUpdate.altMobile = updatedFields.alt_mobile;
  if (updatedFields.email !== undefined) dataToUpdate.email = updatedFields.email;
  if (updatedFields.occupation !== undefined) dataToUpdate.occupation = updatedFields.occupation;
  if (updatedFields.address !== undefined) dataToUpdate.address = updatedFields.address;
  if (updatedFields.height !== undefined) dataToUpdate.height = parseFloat(updatedFields.height) || 0;
  if (updatedFields.weight !== undefined) dataToUpdate.weight = parseFloat(updatedFields.weight) || 0;
  if (updatedFields.bmi !== undefined) dataToUpdate.bmi = updatedFields.bmi;
  if (updatedFields.bp !== undefined) dataToUpdate.bp = updatedFields.bp;
  if (updatedFields.condition !== undefined) dataToUpdate.condition = updatedFields.condition;
  if (updatedFields.assigned_therapist_id !== undefined) dataToUpdate.assignedTherapistId = updatedFields.assigned_therapist_id || null;
  if (updatedFields.sessions_attended !== undefined) dataToUpdate.sessionsAttended = parseInt(updatedFields.sessions_attended) || 0;
  if (updatedFields.sessions_total !== undefined) dataToUpdate.sessionsTotal = parseInt(updatedFields.sessions_total) || 0;
  if (updatedFields.balance !== undefined) dataToUpdate.balance = parseFloat(updatedFields.balance) || 0;
  if (updatedFields.status !== undefined) dataToUpdate.status = updatedFields.status;
  if (updatedFields.medical_history !== undefined) dataToUpdate.medicalHistory = updatedFields.medical_history as any;
  if (updatedFields.emergency_contact !== undefined) dataToUpdate.emergencyContact = updatedFields.emergency_contact as any;
  if (updatedFields.documents !== undefined) dataToUpdate.documents = updatedFields.documents as any;
  if (updatedFields.timeline !== undefined) dataToUpdate.timeline = updatedFields.timeline as any;
  if (updatedFields.invoices !== undefined) dataToUpdate.invoices = updatedFields.invoices as any;

  const updatedPatient = await db.patient.update({
    where: {
      id: patientId,
      companyId: company.id,
    },
    data: dataToUpdate,
  });

  return mapDbPatientToFrontend(updatedPatient);
}
