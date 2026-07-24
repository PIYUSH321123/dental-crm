"use client"

import * as React from "react"
import { useState, useTransition, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Lock, Mail, Sparkles, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { loginStaff } from "@/lib/auth/staff"
import { staffLoginSchema, type StaffLoginInput } from "@/lib/validations/auth"
import { COMPANIES, CompanyConfig } from "@/lib/companies"
import { getCompanyBySlugAction } from "@/lib/actions/companies"

export default function StaffLoginPage() {
    const params = useParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState<string | null>(null)

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

    // Form setup with React Hook Form & Zod
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<StaffLoginInput>({
        resolver: zodResolver(staffLoginSchema),
        defaultValues: {
            email: "",
            password: "",
            companySlug: companySlug
        }
    })

    // Sync companySlug when params load
    useEffect(() => {
        if (companySlug) {
            setValue("companySlug", companySlug)
        }
    }, [companySlug, setValue])

    if (loadingCompany) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!company) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="max-w-md w-full border-border">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-xl font-bold text-destructive">Clinic Not Found</CardTitle>
                        <CardDescription>
                            The clinic slug <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-xs">{companySlug}</code> does not exist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={() => router.push("/")} size="sm">
                             Return Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const onSubmit = (values: StaffLoginInput) => {
        setServerError(null)
        startTransition(async () => {
            try {
                const result = await loginStaff(values)
                if (!result.success) {
                    setServerError(result.error || "Login failed")
                    return
                }
                router.push(`/c/${companySlug}/dashboard`)
                router.refresh()
            } catch (err: any) {
                setServerError(err.message || "An unexpected error occurred.")
            }
        })
    }

    const primaryColor = company.colors?.primary || "#10b981"

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-55 dark:bg-slate-950">
            {/* Branding Panel (Left Column) */}
            <div
                className="hidden md:flex flex-col justify-between p-12 text-white relative overflow-hidden"
                style={{ backgroundColor: primaryColor }}
            >
                {/* Visual abstract overlay */}
                <div className="absolute inset-0 bg-linear-to-b from-black/5 to-black/25 pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-xl" />
                <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/95 flex items-center justify-center shadow-md">
                        <span className="font-bold text-slate-900 text-lg">
                            {company.name.charAt(0)}
                        </span>
                    </div>
                    <span className="font-bold text-lg tracking-tight">{company.name}</span>
                </div>

                <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
                        <Sparkles className="h-3 w-3" /> Staff Portal
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight leading-tight">
                        {company.tagline || "Manage patient recovery with ease."}
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed max-w-md">
                        Access scheduling, medical records, billing invoices, and lead registers.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-white/60 font-medium">
                    Powered by SalesGuru Clinic CRM
                </div>
            </div>

            {/* Login Form Panel (Right Column) */}
            <div className="flex flex-col justify-center px-6 sm:px-12 md:px-16 py-12 bg-white dark:bg-slate-900 border-l border-border/10">
                <div className="w-full max-w-md mx-auto space-y-6">
                    <div className="space-y-2">
                        <div className="md:hidden flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                {company.name.charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{company.name}</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Staff Sign In</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Enter your credentials below to access your administrator dashboard.
                        </p>
                    </div>

                    {serverError && (
                        <Alert variant="destructive" className="rounded-xl">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Hidden or read-only companySlug */}
                        <input type="hidden" {...register("companySlug")} />

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="yourname@clinic.com"
                                    autoComplete="email"
                                    disabled={isPending}
                                    className="pl-9 h-10 rounded-xl"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Password
                                </Label>
                                <a
                                    href={`/${companySlug}/forgot-password`}
                                    className="text-xs font-medium hover:underline text-muted-foreground"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={isPending}
                                    className="pl-9 h-10 rounded-xl"
                                    {...register("password")}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Company Slug (Read Only Visual indicator) */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Clinic Organization
                            </Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                                <Input
                                    value={company.name}
                                    disabled
                                    className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 opacity-80 cursor-not-allowed border-dashed"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-10 mt-6 rounded-xl font-bold cursor-pointer transition-all shadow-sm"
                            style={{ backgroundColor: primaryColor, color: "#fff" }}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </Button>
                    </form>

                    <div className="pt-2 text-center">
                        <p className="text-xs text-muted-foreground">
                            Patient?{" "}
                            <a
                                href={`/${companySlug}/patient-login`}
                                className="font-semibold underline cursor-pointer"
                                style={{ color: primaryColor }}
                            >
                                Sign in here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
