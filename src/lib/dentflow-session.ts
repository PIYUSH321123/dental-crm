import * as jose from "jose";
import { DentflowRoleKey } from "@/lib/dentflow-theme";

export const DENTFLOW_SESSION_COOKIE = "dentflow_session";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secure-secret-key-at-least-32-characters-long",
);

export type DentflowAuthRole =
  | "platform_admin"
  | "owner"
  | "branch_manager"
  | "dentist"
  | "visiting"
  | "front_desk"
  | "assistant"
  | "accounts"
  | "specialist"
  | "lab"
  | "patient";

export interface DentflowSessionPayload {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: DentflowAuthRole;
  staffRoleKey?: DentflowRoleKey;
  clinicGroupName?: string;
  setupCompleted: boolean;
}

export function authRoleToStaffRoleKey(role: DentflowAuthRole): DentflowRoleKey | undefined {
  switch (role) {
    case "owner":
      return "Owner";
    case "branch_manager":
      return "Branch mgr";
    case "dentist":
      return "Dentist";
    case "visiting":
    case "specialist":
      return "Visiting";
    case "front_desk":
      return "Front desk";
    case "assistant":
      return "Assistant";
    case "accounts":
      return "Accounts";
    default:
      return undefined;
  }
}

export function getDefaultRedirectForSession(session: DentflowSessionPayload): string {
  switch (session.role) {
    case "platform_admin":
      return "/admin";
    case "owner":
      return session.setupCompleted ? "/app/group-dashboard" : "/setup";
    case "branch_manager":
    case "dentist":
    case "visiting":
    case "front_desk":
    case "assistant":
    case "accounts":
      return "/app/today";
    case "specialist":
      return "/specialist";
    case "lab":
      return "/lab";
    case "patient":
      return "/patient";
    default:
      return "/login";
  }
}

export async function signDentflowSession(payload: DentflowSessionPayload): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyDentflowSession(
  token: string | undefined,
): Promise<DentflowSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    if (!payload || typeof payload.role !== "string") return null;
    return {
      userId: String(payload.userId || "usr-1"),
      name: String(payload.name || "DentFlow User"),
      email: payload.email ? String(payload.email) : undefined,
      phone: payload.phone ? String(payload.phone) : undefined,
      role: payload.role as DentflowAuthRole,
      staffRoleKey: payload.staffRoleKey as DentflowRoleKey | undefined,
      clinicGroupName: payload.clinicGroupName ? String(payload.clinicGroupName) : undefined,
      setupCompleted: Boolean(payload.setupCompleted),
    };
  } catch {
    return null;
  }
}

