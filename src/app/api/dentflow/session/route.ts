import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_DENTFLOW_STATE } from "@/lib/dentflow-data";
import {
  authRoleToStaffRoleKey,
  DENTFLOW_SESSION_COOKIE,
  DentflowAuthRole,
  DentflowSessionPayload,
  getDefaultRedirectForSession,
  signDentflowSession,
  verifyDentflowSession,
} from "@/lib/dentflow-session";
import { ClinicSetupConfig, DentflowAppState } from "@/types/dentflow";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "dentflow-state.json");

function readState(): DentflowAppState {
  try {
    if (!fs.existsSync(STATE_FILE)) return INITIAL_DENTFLOW_STATE;
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")) as DentflowAppState;
    return { ...INITIAL_DENTFLOW_STATE, ...parsed };
  } catch {
    return INITIAL_DENTFLOW_STATE;
  }
}

function writeState(state: DentflowAppState) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // ignore read-only FS
  }
}

const DEFAULT_NAMES: Record<DentflowAuthRole, string> = {
  platform_admin: "Aarav Deshpande (Platform Admin)",
  owner: "Dr. Sneha Kulkarni",
  branch_manager: "Prakash Jha",
  dentist: "Dr. Arjun Mehta",
  front_desk: "Anita Pawar",
  assistant: "Ravi Gaikwad",
  accounts: "Meenakshi Joshi",
  specialist: "Dr. Meera Iyer",
  lab: "Precision Dental Lab",
  patient: "Priya Deshmukh",
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get(DENTFLOW_SESSION_COOKIE)?.value;
  const session = await verifyDentflowSession(token);
  return NextResponse.json({ ok: true, session });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = String(body?.action || "LOGIN");
  let state = readState();

  if (action === "SIGNUP_OWNER") {
    const ownerName = String(body?.name || "Dr. Kavita Sharma").trim();
    const email = String(body?.email || "owner@dentalclinic.in").trim();
    const clinicGroupName = String(body?.clinicGroupName || "Nova Smile Dental").trim();

    const updatedSetup: ClinicSetupConfig = {
      ...state.clinicSetup,
      completed: false,
      clinicGroupName,
      city: String(body?.city || "Pune, Maharashtra"),
      phone: String(body?.phone || "+91 98220 44100"),
    };

    state = {
      ...state,
      activeRole: "Owner",
      clinicSetup: updatedSetup,
    };
    writeState(state);

    const session: DentflowSessionPayload = {
      userId: `usr-${Date.now()}`,
      name: ownerName,
      email,
      role: "owner",
      staffRoleKey: "Owner",
      clinicGroupName,
      setupCompleted: false,
    };
    const token = await signDentflowSession(session);
    const redirectTo = getDefaultRedirectForSession(session);
    const res = NextResponse.json({ ok: true, session, redirectTo });
    res.cookies.set(DENTFLOW_SESSION_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  if (action === "COMPLETE_SETUP") {
    const existingToken = req.cookies.get(DENTFLOW_SESSION_COOKIE)?.value;
    const existing = await verifyDentflowSession(existingToken);

    const incomingSetup = (body?.clinicSetup || {}) as Partial<ClinicSetupConfig>;
    const completedSetup: ClinicSetupConfig = {
      ...state.clinicSetup,
      ...incomingSetup,
      completed: true,
    };

    state = {
      ...state,
      activeRole: "Owner",
      clinicSetup: completedSetup,
    };
    writeState(state);

    const session: DentflowSessionPayload = {
      userId: existing?.userId || "usr-owner-1",
      name: existing?.name || "Dr. Sneha Kulkarni",
      email: existing?.email || "sneha@smilestudio.in",
      role: "owner",
      staffRoleKey: "Owner",
      clinicGroupName: completedSetup.clinicGroupName,
      setupCompleted: true,
    };
    const token = await signDentflowSession(session);
    const res = NextResponse.json({
      ok: true,
      session,
      redirectTo: "/app/group-dashboard",
    });
    res.cookies.set(DENTFLOW_SESSION_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  if (action === "PATIENT_OTP") {
    const phone = String(body?.phone || "+91 98230 11210").trim();
    const patientName = String(body?.name || "Priya Deshmukh").trim();
    const session: DentflowSessionPayload = {
      userId: "pat-priya",
      name: patientName,
      phone,
      role: "patient",
      setupCompleted: true,
    };
    const token = await signDentflowSession(session);
    const res = NextResponse.json({
      ok: true,
      session,
      redirectTo: "/patient",
    });
    res.cookies.set(DENTFLOW_SESSION_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  // Default: LOGIN
  const role = (body?.role || "owner") as DentflowAuthRole;
  const setupCompleted =
    typeof body?.setupCompleted === "boolean"
      ? body.setupCompleted
      : role === "owner"
      ? state.clinicSetup.completed
      : true;

  const staffRoleKey = authRoleToStaffRoleKey(role);
  if (staffRoleKey) {
    state = {
      ...state,
      activeRole: staffRoleKey,
      clinicSetup:
        role === "owner"
          ? { ...state.clinicSetup, completed: setupCompleted }
          : state.clinicSetup,
    };
    writeState(state);
  }

  const session: DentflowSessionPayload = {
    userId: `usr-${role}`,
    name: String(body?.name || DEFAULT_NAMES[role] || "DentFlow User"),
    email: body?.email ? String(body.email) : undefined,
    role,
    staffRoleKey,
    clinicGroupName: state.clinicSetup.clinicGroupName,
    setupCompleted,
  };

  const token = await signDentflowSession(session);
  const redirectTo = getDefaultRedirectForSession(session);
  const res = NextResponse.json({ ok: true, session, redirectTo });
  res.cookies.set(DENTFLOW_SESSION_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(DENTFLOW_SESSION_COOKIE);
  return res;
}

