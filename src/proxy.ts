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

export function getSafeInternalRedirect(url: string | null | undefined): string | null {
  if (!url) return null;
  // Ensure the URL is an internal relative path and prevent open redirect exploits
  if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) {
    return url;
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(DENTFLOW_SESSION_COOKIE)?.value;
  const session = await verifyDentflowSession(token);

  // 1. Root landing page: http://localhost:3000/ is dedicated strictly to the landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 2. Auth pages: allow access to login and signup without force-redirecting away
  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.next();
  }

  // 3. Platform Admin Portal (/admin & /admin/*)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url),
      );
    }
    if (session.role !== "platform_admin") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    return NextResponse.next();
  }

  // 4. One-Time Owner Setup Wizard (/setup)
  if (pathname === "/setup" || pathname.startsWith("/setup/")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url),
      );
    }
    if (session.role !== "owner") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    if (session.setupCompleted) {
      return NextResponse.redirect(new URL("/Dashboard/today", request.url));
    }
    return NextResponse.next();
  }

  // 5. Clinic & Owner Dashboard Application (/Dashboard, /dashboard, /app)
  if (
    pathname === "/Dashboard" ||
    pathname.startsWith("/Dashboard/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/app" ||
    pathname.startsWith("/app/")
  ) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url),
      );
    }
    if (!CLINIC_AUTH_ROLES.has(session.role)) {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    // First-time clinic owner cannot skip the setup wizard
    if (session.role === "owner" && !session.setupCompleted) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }
    if (
      pathname === "/app/today" ||
      pathname === "/app" ||
      pathname === "/Dashboard" ||
      pathname === "/dashboard"
    ) {
      return NextResponse.redirect(new URL("/Dashboard/today", request.url));
    }
    // Enforce role-based permission matrix on readable /app/* slugs
    if (session.staffRoleKey && !canRoleAccessAppSlug(session.staffRoleKey, pathname)) {
      return NextResponse.redirect(new URL("/Dashboard/today?access=denied", request.url));
    }
    return NextResponse.next();
  }

  // 6. Specialist Portal (/specialist)
  if (pathname === "/specialist" || pathname.startsWith("/specialist/")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url),
      );
    }
    if (session.role !== "specialist") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    return NextResponse.next();
  }

  // 7. Dental Lab Portal (/lab)
  if (pathname === "/lab" || pathname.startsWith("/lab/")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url),
      );
    }
    if (session.role !== "lab") {
      return NextResponse.redirect(new URL(getDefaultRedirectForSession(session), request.url));
    }
    return NextResponse.next();
  }

  // 8. Patient App (/patient)
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
    "/",
    "/Dashboard",
    "/Dashboard/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/app",
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

