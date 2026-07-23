import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the path contains /dashboard or /patient-portal
    const isDashboard = pathname.includes("/dashboard")
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
