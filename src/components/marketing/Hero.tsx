"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCompany } from "@/components/marketing/CompanyContext"
import { Button } from "@/components/ui/button"
import { Stethoscope, CalendarPlus, Play, ShieldCheck } from "lucide-react"

export default function Hero() {
    const { company, getLinkWithCompany } = useCompany()

    return (
        <section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-50/40">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />

            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 py-16 lg:grid-cols-2">
                <div className="flex flex-col gap-6 text-left">
                    <div className="flex w-fit items-center gap-2 rounded-full bg-brand-bg-light px-4 py-1.5 border border-brand-primary/10">
                        <Stethoscope className="size-4 text-brand-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                            Trusted Physiotherapy &amp; Yoga Care
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-[#0f172a]">
                        Recover stronger. Move better.{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                            Feel like yourself again.
                        </span>
                    </h1>

                    <p className="max-w-md text-lg text-gray-500 leading-relaxed font-medium">
                        At {company.name}, our therapists guide your personalized journey to recovery, blending advanced
                        physiotherapy with the healing benefits of yoga.
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        <Button className="rounded-full bg-brand-primary px-6 text-white hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" asChild>
                            <Link href={getLinkWithCompany("/onboarding")}>
                                <CalendarPlus className="size-4" /> Book a Session
                            </Link>
                        </Button>
                        <Button variant="outline" className="rounded-full border-0 px-6 cursor-pointer hover:bg-zinc-100" asChild>
                            <a href="#services">
                                <Play className="size-4" /> View Our Services
                            </a>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="mt-2 flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold">12k+</span>
                            <span className="text-sm text-zinc-500">Patients Treated</span>
                        </div>
                        <div className="h-10 w-px bg-zinc-200" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold">25+</span>
                            <span className="text-sm text-zinc-500">Expert Therapists</span>
                        </div>
                        <div className="h-10 w-px bg-zinc-200" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold">4.9★</span>
                            <span className="text-sm text-zinc-500">Patient Rating</span>
                        </div>
                    </div>
                </div>

                {/* Hero image */}
                <div className="relative w-full">
                    <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-lg aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10] max-h-[420px]">
                        <Image
                            src="https://images.unsplash.com/photo-1699523229199-fce5aa6b0ec3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                            alt="Physiotherapy session"
                            width={1200}
                            height={750}
                            className="w-full h-full object-cover"
                            priority
                        />
                    </div>

                    <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg">
                        <div className="flex size-10 items-center justify-center rounded-full bg-brand-bg-light">
                            <ShieldCheck className="size-5 text-brand-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">Certified Clinic</span>
                            <span className="text-xs text-zinc-500">Licensed &amp; Insured Care</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
