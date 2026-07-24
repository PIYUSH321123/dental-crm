"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Sparkles, Activity, ShieldCheck, Calendar, User, Loader2 } from "lucide-react"
import { logoutPatient } from "@/lib/auth/patient"
import { COMPANIES, CompanyConfig } from "@/lib/companies"
import { getCompanyBySlugAction } from "@/lib/actions/companies"

export default function PatientPortalPage() {
    const params = useParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const companySlug = (Array.isArray(params.companySlug) ? params.companySlug[0] : params.companySlug) || ""
    const [company, setCompany] = useState<CompanyConfig | undefined>(COMPANIES[companySlug])
    const [loadingCompany, setLoadingCompany] = useState(!company)

    useEffect(() => {
        if (!company && companySlug) {
            getCompanyBySlugAction(companySlug).then((cfg) => {
                if (cfg) {
                    setCompany(cfg)
                }
                setLoadingCompany(false)
            }).catch((err) => {
                console.error("Error fetching company config:", err)
                setLoadingCompany(false)
            })
        }
    }, [company, companySlug])

    const handleLogout = () => {
        startTransition(async () => {
            await logoutPatient()
            router.push(`/${companySlug}/patient-login`)
            router.refresh()
        })
    }

    const primaryColor = company?.colors?.primary || "#10b981"

    if (loadingCompany) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Patient Portal Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-base">
                            {company?.name ? company.name.charAt(0) : "P"}
                        </div>
                        <span className="font-bold tracking-tight text-slate-800 dark:text-slate-200">
                            {company?.name || "Patient Portal"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Secure Session
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={handleLogout}
                            className="h-9 text-xs gap-1.5 pl-3 border border-border cursor-pointer hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-xl"
                        >
                            <LogOut className="h-3.5 w-3.5" /> Log Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-xs font-semibold border border-emerald-250/50">
                        <Sparkles className="h-3.5 w-3.5" /> Welcome to your health portal
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Your Care Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track your clinical plans, schedule sessions, and communicate with your treatment staff.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="p-3 w-fit rounded-xl bg-emerald-500 text-white">
                            <Activity className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Treatment Plan</h3>
                        <p className="text-xs text-muted-foreground">
                            View active exercises and therapy instructions assigned by your physiotherapist.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="p-3 w-fit rounded-xl bg-blue-500 text-white">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Appointments</h3>
                        <p className="text-xs text-muted-foreground">
                            Check schedules, join video calls, or book recovery classes with clinic staff.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="p-3 w-fit rounded-xl bg-purple-500 text-white">
                            <User className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Profile & Records</h3>
                        <p className="text-xs text-muted-foreground">
                            Update demographical info, check payments, and access billing files.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
