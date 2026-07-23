import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secure-secret-key-at-least-32-characters-long"
);

/**
 * Hash a plain text password.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare a plain text password with a hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Sign a payload into a JWT.
 * @param payload Payload to sign
 * @param expirationTime JWT expiration e.g., "4h", "7d"
 */
export async function signJWT(payload: any, expirationTime: string): Promise<string> {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT and return its payload.
 */
export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get active session for Super Admin (cookie: admin_session)
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

/**
 * Get active session for Company Admin / Staff (cookie: session)
 */
export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

/**
 * Get active session for Patient (cookie: patient_session)
 */
export async function getPatientSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("patient_session")?.value;
  if (!token) return null;
  return await verifyJWT(token);
}
