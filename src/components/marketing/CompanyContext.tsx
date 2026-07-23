"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { CompanyConfig, getCompanyConfig, DEFAULT_COMPANY } from "@/lib/companies"

interface CompanyContextType {
    company: CompanyConfig
    companySlug: string
    getLinkWithCompany: (href: string) => string
}

const CompanyContext = React.createContext<CompanyContextType>({
    company: DEFAULT_COMPANY,
    companySlug: DEFAULT_COMPANY.slug,
    getLinkWithCompany: (href: string) => href,
})

export function useCompany() {
    return React.useContext(CompanyContext)
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [companySlug, setCompanySlug] = React.useState<string>(DEFAULT_COMPANY.slug)

    React.useEffect(() => {
        // 1. Detect from query parameter in browser URL
        const params = new URLSearchParams(window.location.search)
        let companyParam = params.get("company") || params.get("c")

        // 2. If not in query, check if the pathname has /c/[company]
        if (!companyParam && pathname) {
            const matches = pathname.match(/^\/c\/([^/]+)/)
            if (matches && matches[1]) {
                companyParam = matches[1]
            }
        }

        // 3. Update company slug if detected and valid
        if (companyParam) {
            setCompanySlug(companyParam)
        }
    }, [pathname])

    const company = React.useMemo(() => {
        return getCompanyConfig(companySlug)
    }, [companySlug])

    // Utility function to preserve the company parameter across navigation and namespace client-facing routes
    const getLinkWithCompany = React.useCallback((href: string) => {
        if (!href) return href
        
        // Don't modify external links or anchor links
        if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
            return href
        }

        let targetHref = href

        // Client-facing landing pages need to be routed under /c/[company]/home
        const clientFacingPages = [
            "/sessions",
            "/blogs",
            "/onboarding",
            "/login",
            "/forgot-password",
            "/terms",
            "/privacy"
        ]
        
        const isClientFacing = clientFacingPages.some(page => 
            targetHref === page || targetHref.startsWith(page + "/")
        ) || targetHref === "/" || targetHref === "/home"

        if (isClientFacing) {
            const prefix = `/c/${company.slug}/home`
            if (!targetHref.startsWith(prefix)) {
                if (targetHref === "/" || targetHref === "/home") {
                    targetHref = prefix
                } else {
                    // Prepend company home prefix
                    targetHref = `${prefix}${targetHref}`
                }
            }
        }

        // If company is not the default, append query param to preserve context in non-company pathnames (like /admin)
        if (company.slug !== DEFAULT_COMPANY.slug) {
            const [path, hash] = targetHref.split("#")
            const [basePath, search] = path.split("?")
            const searchParams = new URLSearchParams(search || "")
            
            searchParams.set("company", company.slug)
            
            const newSearch = searchParams.toString()
            const newPath = newSearch ? `${basePath}?${newSearch}` : basePath
            targetHref = hash ? `${newPath}#${hash}` : newPath
        }

        return targetHref
    }, [company])

    // Dynamically build the CSS custom properties style object
    const styleVariables = React.useMemo(() => {
        return {
            "--brand-primary": company.colors.primary,
            "--brand-primary-hover": company.colors.primaryHover,
            "--brand-bg-light": company.colors.bgLight,
            "--brand-bg-light-hover": company.colors.bgLightHover,
            "--brand-gradient-start": company.colors.gradientStart,
            "--brand-gradient-end": company.colors.gradientEnd,
            "--brand-text-accent": company.colors.textAccent,
        } as React.CSSProperties
    }, [company])

    return (
        <CompanyContext.Provider value={{ company, companySlug: company.slug, getLinkWithCompany }}>
            <div style={styleVariables} className="min-h-screen flex flex-col">
                {children}
            </div>
        </CompanyContext.Provider>
    )
}
