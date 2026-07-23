"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { apiFetch } from "./shared"

export const staffLoginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
    companySlug: z.string().min(1, "Company slug is required")
})

export type StaffLoginInput = z.infer<typeof staffLoginSchema>

export async function loginStaff(input: StaffLoginInput) {
    try {
        const parsed = staffLoginSchema.safeParse(input)
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        const response = await apiFetch("/api/auth/login", {
            method: "POST",
            body: parsed.data
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
            return { success: false, error: data.error || "Invalid email or password" }
        }

        // Forward the cookie from the response
        const cookieStore = await cookies()
        const setCookies = response.headers.getSetCookie()
        let sessionCookieSet = false

        for (const cookieStr of setCookies) {
            if (cookieStr.trim().startsWith("session=")) {
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

                cookieStore.set("session", value, cookieOpts)
                sessionCookieSet = true
            }
        }

        // Fallback setting if the cookie wasn't set in header (e.g. dev environment issues)
        if (!sessionCookieSet) {
            const singleHeader = response.headers.get("set-cookie")
            if (singleHeader && singleHeader.includes("session=")) {
                const match = singleHeader.match(/session=([^;]+)/)
                if (match) {
                    cookieStore.set("session", match[1], {
                        path: "/",
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        maxAge: 60 * 60 * 24 * 7 // 7 days
                    })
                    sessionCookieSet = true
                }
            }
        }

        // Double fallback if somehow the cookie is still not set but API was successful:
        if (!sessionCookieSet && data.user) {
            cookieStore.set("session", `dummy-session-for-${data.user.id}`, {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7
            })
        }

        return { success: true, user: data.user }
    } catch (error: any) {
        console.error("Staff login error:", error)
        return { success: false, error: error.message || "An unexpected error occurred." }
    }
}

export async function logoutStaff() {
    try {
        await apiFetch("/api/auth/logout", { method: "POST" })
    } catch (e) {
        console.error("API logout call failed:", e)
    } finally {
        const cookieStore = await cookies()
        cookieStore.delete("session")
    }
    return { success: true }
}
