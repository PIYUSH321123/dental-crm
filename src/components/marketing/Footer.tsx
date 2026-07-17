"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Heart } from "lucide-react"
import { useCompany } from "@/components/marketing/CompanyContext"

export default function Footer() {
    const { company, getLinkWithCompany } = useCompany()

    return (
        <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand column */}
                    <div>
                        <Link href={`/c/${company.slug}/home`} className="flex items-center gap-2 text-xl font-extrabold text-white tracking-tight mb-4">
                            <img src="/logo.webp" alt={`${company.name} Logo`} className="h-9 w-auto brightness-200" />
                            <span>{company.logoText}</span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-4 text-gray-400">
                            {company.description}
                        </p>
                    </div>

                    {/* Quick links column */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Explore
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href={`/c/${company.slug}/home`} className="hover:text-white transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href={`/c/${company.slug}/home/sessions`} className="hover:text-white transition-colors">Online Sessions</Link>
                            </li>
                            <li>
                                <Link href={`/c/${company.slug}/home/blogs`} className="hover:text-white transition-colors">Blogs & Insights</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Clinic links column */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Portal & Tools
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href={`/${company.slug}/login`} className="hover:text-white transition-colors">Client Sign In</Link>
                            </li>
                            <li>
                                <Link href={`/c/${company.slug}/home/onboarding`} className="hover:text-white transition-colors">Book Appointment</Link>
                            </li>
                            <li>
                                <Link href={getLinkWithCompany("/admin/dashboard")} className="hover:text-white transition-colors">Provider Dashboard</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact column */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Get in Touch
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0 text-brand-primary" />
                                <span>{company.phone}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 shrink-0 text-brand-primary" />
                                <span>{company.email}</span>
                            </li>
                            <li className="flex items-center gap-2 font-normal">
                                <MapPin className="h-4 w-4 shrink-0 text-brand-primary" />
                                <span className="leading-relaxed">{company.address}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
                    <p className="flex items-center gap-1 mt-4 sm:mt-0">
                        Made with <Heart className="h-3.5 w-3.5 fill-brand-primary stroke-brand-primary" /> for healthy living.
                    </p>
                </div>
            </div>
        </footer>
    )
}
