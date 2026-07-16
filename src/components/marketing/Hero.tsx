"use client"

import * as React from "react"
import Link from "next/link"
import { useCompany } from "@/components/marketing/CompanyContext"

export default function Hero() {
    const { company, getLinkWithCompany } = useCompany()

    return (
        <section className="text-center py-20 px-6 bg-gradient-to-b from-brand-bg-light/35 to-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Upper Badge */}
                <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">
                    {company.tagline}
                </p>

                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f172a] max-w-2xl mx-auto mb-4 tracking-tight leading-tight">
                    Recover stronger. Move better. Feel like yourself again with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">{company.name}</span>
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed font-medium">
                    {company.description}
                </p>

                {/* CTAs */}
                <div className="flex gap-4 justify-center items-center">
                    <Link 
                        href={getLinkWithCompany("/onboarding")} 
                        className="px-6 py-3 text-sm font-bold bg-brand-primary text-white rounded-full hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                        Book a session
                    </Link>
                    <a 
                        href="#services" 
                        className="px-6 py-3 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                        View services
                    </a>
                </div>
            </div>
        </section>
    )
}
