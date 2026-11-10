import { NextRequest, NextResponse } from "next/server";
import {
  DENTFLOW_SESSION_COOKIE,
  getDefaultRedirectForSession,
  verifyDentflowSession,
} from "@/lib/dentflow-session";
import { canRoleAccessAppSlug } from "@/lib/dentflow-theme";

const CLINIC_AUTH_ROLES = new Set([
  "owner",
  "branch_manager",
  "dentist",
  "front_desk",
  "assistant",
  "accounts",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(DENTFLOW_SESSION_COOKIE)?.value;
  const session = await verifyDentflowSession(token);

  // 1. Auth pages: redirect already signed-in users to their home portal
  if (pathname === "/login" || pathname === "/signup") {
    if (session) {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    return NextResponse.next();
  }

  // 2. Platform Admin Portal (/admin & /admin/*)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?next=/admin", request.url));
    }
    if (session.role !== "platform_admin") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    return NextResponse.next();
  }

  // 3. One-Time Owner Setup Wizard (/setup)
  if (pathname === "/setup" || pathname.startsWith("/setup/")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?next=/setup", request.url));
    }
    if (session.role !== "owner") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    if (session.setupCompleted) {
      return NextResponse.redirect(new URL("/app/group-dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 4. Clinic & Owner Application (/app & /app/*)
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url),
      );
    }
    if (!CLINIC_AUTH_ROLES.has(session.role)) {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    // First-time clinic owner cannot skip the setup wizard
    if (session.role === "owner" && !session.setupCompleted) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }
    if (pathname === "/app") {
      return NextResponse.redirect(
        new URL(
          session.role === "owner" ? "/app/group-dashboard" : "/app/today",
          request.url,
        ),
      );
    }
    // Enforce role-based permission matrix on readable /app/* slugs
    if (session.staffRoleKey && !canRoleAccessAppSlug(session.staffRoleKey, pathname)) {
      return NextResponse.redirect(new URL("/app/today?access=denied", request.url));
    }
    return NextResponse.next();
  }

  // 5. Specialist Portal (/specialist)
  if (pathname === "/specialist" || pathname.startsWith("/specialist/")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?next=/specialist", request.url));
    }
    if (session.role !== "specialist") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    return NextResponse.next();
  }

  // 6. Dental Lab Portal (/lab)
  if (pathname === "/lab" || pathname.startsWith("/lab/")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?next=/lab", request.url));
    }
    if (session.role !== "lab") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    return NextResponse.next();
  }

  // 7. Patient App (/patient)
  if (pathname === "/patient" || pathname.startsWith("/patient/")) {
    if (pathname === "/patient/login") {
      if (session && session.role === "patient") {
        return NextResponse.redirect(new URL("/patient", request.url));
      }
      return NextResponse.next();
    }
    if (!session) {
      return NextResponse.redirect(new URL("/patient/login", request.url));
    }
    if (session.role !== "patient") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/admin/:path*",
    "/setup/:path*",
    "/specialist/:path*",
    "/lab/:path*",
    "/patient/:path*",
    "/login",
    "/signup",
  ],
};

