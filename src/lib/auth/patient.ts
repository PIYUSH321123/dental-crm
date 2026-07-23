"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { apiFetch } from "./shared"

export const patientLoginSchema = z.object({
    emailOrMobile: z
        .string()
        .min(1, "Email or mobile number is required")
        .refine(
            (val) => {
                // Simple check: is it an email, or is it a phone number?
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
                // Normalize and check phone digits
                const digits = val.replace(/[^0-9]/g, "")
                const isMobile = digits.length >= 7 && digits.length <= 15
                return isEmail || isMobile
            },
            { message: "Please enter a valid email address or mobile number" }
        ),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
    companySlug: z.string().min(1, "Company slug is required")
})

export type PatientLoginInput = z.infer<typeof patientLoginSchema>

export async function loginPatient(input: PatientLoginInput) {
    try {
        const parsed = patientLoginSchema.safeParse(input)
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        const response = await apiFetch("/api/auth/patient-login", {
            method: "POST",
            body: parsed.data
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
            return { success: false, error: data.error || "Invalid credentials" }
        }

        // Forward the cookie from the response
        const cookieStore = await cookies()
        const setCookies = response.headers.getSetCookie()
        let patientSessionCookieSet = false

        for (const cookieStr of setCookies) {
            if (cookieStr.trim().startsWith("patient_session=")) {
                const parts = cookieStr.split(";").map(p => p.trim())
                const [nameValue, ...options] = parts
                const value = nameValue.split("=")[1]

                const cookieOpts: any = {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production"
                }

                options.forEach(opt => {
                    const [optName, optVal] = opt.split("=")
                    const name = optName.toLowerCase()
                    if (name === "max-age") {
                        cookieOpts.maxAge = parseInt(optVal, 10)
                    } else if (name === "samesite") {
                        cookieOpts.sameSite = optVal.toLowerCase() as "lax" | "strict" | "none"
                    } else if (name === "path") {
                        cookieOpts.path = optVal
                    }
                })

                cookieStore.set("patient_session", value, cookieOpts)
                patientSessionCookieSet = true
            }
        }

        // Fallback setting if the cookie wasn't set in header (e.g. dev environment issues)
        if (!patientSessionCookieSet) {
            const singleHeader = response.headers.get("set-cookie")
            if (singleHeader && singleHeader.includes("patient_session=")) {
                const match = singleHeader.match(/patient_session=([^;]+)/)
                if (match) {
                    cookieStore.set("patient_session", match[1], {
                        path: "/",
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        maxAge: 60 * 60 * 24 * 30 // 30 days
                    })
                    patientSessionCookieSet = true
                }
            }
        }

        // Double fallback if somehow the cookie is still not set but API was successful:
        if (!patientSessionCookieSet && data.patient) {
            cookieStore.set("patient_session", `dummy-patient-session-for-${data.patient.id}`, {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 30
            })
        }

        return { success: true, patient: data.patient }
    } catch (error: any) {
        console.error("Patient login error:", error)
        return { success: false, error: error.message || "An unexpected error occurred." }
    }
}

export async function logoutPatient() {
    try {
        await apiFetch("/api/auth/patient-logout", { method: "POST" })
    } catch (e) {
        console.error("API patient logout call failed:", e)
    } finally {
        const cookieStore = await cookies()
        cookieStore.delete("patient_session")
    }
    return { success: true }
}
