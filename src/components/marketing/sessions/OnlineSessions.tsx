"use client"

import * as React from "react"
import Link from "next/link"
import { Video, ArrowRight } from "lucide-react"
import { useCompany } from "@/components/marketing/CompanyContext"

export default function OnlineSessions() {
    const { company, getLinkWithCompany } = useCompany()

    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end py-20 px-6">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
            
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-8 flex flex-col items-start text-left">
                        {/* Live Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                            </span>
                            Live & Upcoming
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                            Virtual Wellness Studio
                        </h2>

                        {/* Subtitle */}
                        <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed mb-8">
                            Join expert-led live classes from the comfort of your home. Whether it's yoga flows or guided physical therapy group sessions, stay active and healthy from anywhere in the world.
                        </p>

                        {/* CTA */}
                        <Link
                            href={getLinkWithCompany("/sessions")}
                            className="inline-flex items-center gap-2 bg-white text-brand-text-accent rounded-full px-8 py-3.5 text-sm font-bold hover:bg-brand-bg-light/40 transition-all hover:scale-105 active:scale-95 duration-200 shadow-md shadow-black/10"
                        >
                            Browse Full Schedule
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Right Column: Live Card */}
                    <div className="lg:col-span-4 flex justify-center lg:justify-end items-center w-full">
                        {/* Session Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-gray-100/50">
                            {/* Video Thumbnail */}
                            <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 bg-gray-900 flex items-center justify-center group">
                                <img
                                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop"
                                    alt="Morning Yoga Session"
                                    className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                                
                                {/* Video Play Center Icon */}
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg text-brand-primary absolute transition-transform duration-300 group-hover:scale-115">
                                    <Video className="h-5 w-5 fill-brand-bg-light/50" />
                                </div>
                            </div>

                            {/* Card Details */}
                            <h3 className="text-base font-bold text-gray-900 mb-1">
                                Live: Morning Flow
                            </h3>
                            <p className="text-xs text-gray-400 mb-4 font-medium">
                                Elena Rostova
                            </p>

                            {/* CTA */}
                            <Link
                                href={getLinkWithCompany("/sessions/room/morning-flow")}
                                className="w-full inline-flex items-center justify-center py-2.5 text-xs font-bold bg-brand-bg-light text-brand-text-accent rounded-xl hover:bg-brand-bg-light-hover transition-colors"
                            >
                                Join Room
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
