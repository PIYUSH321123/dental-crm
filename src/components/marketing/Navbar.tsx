"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogIn } from "lucide-react"
import { useCompany } from "@/components/marketing/CompanyContext"

export default function Navbar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const { company, getLinkWithCompany } = useCompany()

    const navLinks = [
        { name: "Home", href: `/c/${company.slug}/home` },
        { name: "Dashboard", href: `/c/${company.slug}/dashboard` },
        { name: "Online Sessions", href: `/c/${company.slug}/home/sessions` },
        { name: "Blogs", href: `/c/${company.slug}/home/blogs` },
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md transition-all">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link href={`/c/${company.slug}/home`} className="flex items-center gap-2 text-xl font-extrabold text-brand-primary tracking-tight">
                            <img src="/logo.webp" alt={`${company.slug} Logo`} className="h-10 w-auto" />
                            <span>{company.logoText}</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href
                            const href = link.href
                            return (
                                <Link
                                    key={link.name}
                                    href={href}
                                    className={`relative py-2 text-sm font-semibold transition-colors ${isActive ? "text-brand-primary" : "text-gray-500 hover:text-brand-primary"
                                        }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 h-[2px] w-full bg-brand-primary" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right CTAs */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href={`/c/${company.slug}/home/login`}
                            className="flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-2 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 transition-all"
                        >
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </Link>
                        <Link
                            href={`/c/${company.slug}/home/onboarding`}
                            className="rounded-full bg-brand-primary px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover transition-all hover:scale-105 active:scale-95 duration-200"
                        >
                            Book Appointment
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
                        >
                            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Panel */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-2 shadow-lg">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        const href = link.href
                        return (
                            <Link
                                key={link.name}
                                href={href}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-brand-bg-light text-brand-primary" : "text-gray-600 hover:bg-gray-50 hover:text-brand-primary"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        )
                    })}
                    <div className="pt-4 flex flex-col gap-2 border-t border-gray-100">
                        <Link
                            href={`/c/${company.slug}/home/login`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 py-2.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10"
                        >
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </Link>
                        <Link
                            href={`/c/${company.slug}/home/onboarding`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-center rounded-full bg-brand-primary py-2.5 text-xs font-semibold text-white hover:bg-brand-primary-hover"
                        >
                            Book Appointment
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
