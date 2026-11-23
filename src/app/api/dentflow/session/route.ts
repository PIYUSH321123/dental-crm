import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_DENTFLOW_STATE } from "@/lib/dentflow-data";
import { migrateDentflowState } from "@/lib/dentflow-migrations";
import {
  authRoleToStaffRoleKey,
  DENTFLOW_SESSION_COOKIE,
  DentflowAuthRole,
  DentflowSessionPayload,
  getDefaultRedirectForSession,
  signDentflowSession,
  staffRoleKeyToAuthRole,
  verifyDentflowSession,
} from "@/lib/dentflow-session";
import { ClinicSetupConfig, DentflowAppState } from "@/types/dentflow";
import { DentflowRoleKey } from "@/lib/dentflow-theme";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "dentflow-state.json");

function readState(): DentflowAppState {
  try {
    if (!fs.existsSync(STATE_FILE)) return migrateDentflowState(INITIAL_DENTFLOW_STATE);
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    return migrateDentflowState(parsed);
  } catch {
    return migrateDentflowState(INITIAL_DENTFLOW_STATE);
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
  visiting: "Dr. Farhan Ali",
  front_desk: "Anita Pawar",
  assistant: "Ravi Gaikwad",
  accounts: "Meenakshi Joshi",
  specialist: "Dr. Meera Iyer",
  lab: "Precision Dental Lab",
  patient: "Priya Deshmukh",
};

function getSafeInternalRedirect(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) {
    return url;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(DENTFLOW_SESSION_COOKIE)?.value;
  const session = await verifyDentflowSession(token);
  return NextResponse.json({ ok: true, session });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = String(body?.action || "LOGIN");
  const requestedRedirect = getSafeInternalRedirect(
    body?.redirect || body?.returnTo || body?.next || req.nextUrl.searchParams.get("redirect") || req.nextUrl.searchParams.get("returnTo") || req.nextUrl.searchParams.get("next")
  );
  let state = readState();

  if (action === "SIGNUP_OWNER") {
    const ownerName = String(body?.name || "Dr. Kavita Sharma").trim();
    const email = String(body?.email || "owner@dentalclinic.in").trim();
    const clinicGroupName = String(body?.clinicGroupName || "Nova Smile Dental").trim();

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const updatedSetup: ClinicSetupConfig = {
      ...state.clinicSetup,
      completed: false,
      clinicGroupName,
      city: String(body?.city || "Pune, Maharashtra"),
      phone: String(body?.phone || "+91 98220 44100"),
      trialInfo: {
        trialStart: now.toISOString(),
        trialEnd: trialEnd.toISOString(),
        plan: String(body?.plan || "Growth"),
        status: "trial",
      },
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
    const redirectTo = requestedRedirect || getDefaultRedirectForSession(session);
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
      redirectTo: requestedRedirect || "/app/today",
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
      redirectTo: requestedRedirect || "/patient",
    });
    res.cookies.set(DENTFLOW_SESSION_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  if (action === "UPDATE_OWNER") {
    const newName = String(body?.name || "").trim();
    const newEmail = String(body?.email || "").trim();
    if (newName) {
      state = {
        ...state,
        clinicSetup: {
          ...state.clinicSetup,
          ownerName: newName,
          ownerEmail: newEmail || state.clinicSetup.ownerEmail,
          staffRoster: (state.clinicSetup.staffRoster || []).map((s) =>
            s.role === "Owner" ? { ...s, name: newName } : s
          ),
        },
      };
      writeState(state);

      const existingToken = req.cookies.get(DENTFLOW_SESSION_COOKIE)?.value;
      const existing = await verifyDentflowSession(existingToken);
      if (existing && existing.role === "owner") {
        const session: DentflowSessionPayload = {
          ...existing,
          name: newName,
          email: newEmail || existing.email,
        };
        const token = await signDentflowSession(session);
        const res = NextResponse.json({ ok: true, session });
        res.cookies.set(DENTFLOW_SESSION_COOKIE, token, {
          httpOnly: false,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return res;
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "SWITCH_ROLE") {
    const role = (body?.role || "owner") as DentflowAuthRole;
    const staffRoleKey = (body?.staffRoleKey || authRoleToStaffRoleKey(role)) as DentflowRoleKey;
    state = {
      ...state,
      activeRole: staffRoleKey,
    };
    writeState(state);

    const existingToken = req.cookies.get(DENTFLOW_SESSION_COOKIE)?.value;
    const existing = await verifyDentflowSession(existingToken);

    const ownerName = state.clinicSetup.ownerName || "Dr. Sneha Kulkarni";
    const roleName =
      staffRoleKey === "Owner"
        ? ownerName
        : state.clinicSetup.staffRoster?.find((s) => s.role === staffRoleKey)?.name ||
          DEFAULT_NAMES[role] ||
          "DentFlow User";

    const session: DentflowSessionPayload = {
      userId: existing?.userId || `usr-${role}`,
      name: roleName,
      email: staffRoleKey === "Owner" ? state.clinicSetup.ownerEmail || existing?.email : `${role}@smilestudio.in`,
      role,
      staffRoleKey,
      clinicGroupName: state.clinicSetup.clinicGroupName,
      setupCompleted: true,
    };

    const token = await signDentflowSession(session);
    const res = NextResponse.json({ ok: true, session });
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

  const currentOwnerName = state.clinicSetup.ownerName || "Dr. Sneha Kulkarni";
  let resolvedUserName: string;
  if (role === "owner") {
    resolvedUserName =
      body?.name && body.name !== "Dr. Sneha Kulkarni"
        ? String(body.name)
        : currentOwnerName;
  } else {
    resolvedUserName = String(body?.name || DEFAULT_NAMES[role] || "DentFlow User");
  }

  const session: DentflowSessionPayload = {
    userId: `usr-${role}`,
    name: resolvedUserName,
    email: body?.email
      ? String(body.email)
      : role === "owner"
      ? state.clinicSetup.ownerEmail || "sneha@smilestudio.in"
      : undefined,
    role,
    staffRoleKey,
    clinicGroupName: state.clinicSetup.clinicGroupName,
    setupCompleted,
  };

  const token = await signDentflowSession(session);
  const redirectTo = requestedRedirect || getDefaultRedirectForSession(session);
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
  res.cookies.set(DENTFLOW_SESSION_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}

