import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // If accessing staff login page with an active session, redirect to staff dashboard
    if (pathname.endsWith("/login")) {
        const hasSession = request.cookies.has("session")
        if (hasSession) {
            const parts = pathname.split("/").filter(Boolean)
            const companySlug = parts[0]
            if (companySlug && companySlug !== "admin" && companySlug !== "c") {
                return NextResponse.redirect(new URL(`/c/${companySlug}/dashboard`, request.url))
            }
        }
    }

    // If accessing patient login page with an active patient session, redirect to patient portal
    if (pathname.endsWith("/patient-login")) {
        const hasPatientSession = request.cookies.has("patient_session")
        if (hasPatientSession) {
            const parts = pathname.split("/").filter(Boolean)
            const companySlug = parts[0]
            if (companySlug && companySlug !== "admin" && companySlug !== "c") {
                return NextResponse.redirect(new URL(`/${companySlug}/patient-portal`, request.url))
            }
        }
    }

    // Super Admin protection
    if (pathname.startsWith("/admin")) {
        const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register"
        const hasAdminSession = request.cookies.has("admin_session")

        if (isAuthPage && hasAdminSession) {
            // Already logged in, redirect to admin dashboard
            return NextResponse.redirect(new URL("/admin/dashboard", request.url))
        }

        if (!isAuthPage && !hasAdminSession) {
            // Not logged in, redirect to admin login page
            return NextResponse.redirect(new URL("/admin/login", request.url))
        }
    }

    // Check if the path contains /dashboard or /patient-portal (excluding super admin pages)
    const isDashboard = pathname.includes("/dashboard") && !pathname.startsWith("/admin")
    const isPatientPortal = pathname.includes("/patient-portal")

    if (isDashboard) {
        // Staff/Admin route: require "session" cookie
        const hasSession = request.cookies.has("session")
        if (!hasSession) {
            // Extract companySlug from the path
            // Paths are typically /[companySlug]/dashboard/... or /c/[company]/dashboard/...
            let companySlug = "yogaplus" // default fallback
            const parts = pathname.split("/").filter(Boolean)
            if (parts[0] === "c" && parts[1]) {
                companySlug = parts[1]
            } else if (parts[0]) {
                companySlug = parts[0]
            }

            const loginUrl = new URL(`/${companySlug}/login`, request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    if (isPatientPortal) {
        // Patient route: require "patient_session" cookie
        const hasPatientSession = request.cookies.has("patient_session")
        if (!hasPatientSession) {
            // Extract companySlug from the path
            let companySlug = "yogaplus" // default fallback
            const parts = pathname.split("/").filter(Boolean)
            if (parts[0]) {
                companySlug = parts[0]
            }

            const patientLoginUrl = new URL(`/${companySlug}/patient-login`, request.url)
            return NextResponse.redirect(patientLoginUrl)
        }
    }

    return NextResponse.next()
}

// Config to specify matching routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}
