"use client"

import * as React from "react"
import { usePathname, useRouter, useParams } from "next/navigation"
import {
    X,
    MessageSquare,
    LayoutDashboard,
    Users,
    Package,
    ClipboardCheck,
    Calendar,
    CreditCard,
    Megaphone,
    UserCheck,
    Settings,
    Layers,
    Activity,
    Clock,
    Sparkles,
    DollarSign,
    TrendingUp,
    ClipboardList,
    SlidersHorizontal,
    Video,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { InboxQuickPopover } from "@/components/inbox/inbox-quick-popover"

export interface ChromeTab {
    id: string
    title: string
    href: string
    iconName: string
    isPinned?: boolean
}

// Comprehensive route segment mapping to exact section titles and icons
const ROUTE_CONFIG: { [key: string]: { title: string; iconName: string } } = {
    // CRM Sections
    "lead-management": { title: "Lead Management", iconName: "Users" },
    "leads": { title: "Leads", iconName: "Users" },
    "follow-up": { title: "Follow-ups", iconName: "Clock" },
    "patient-management": { title: "Patient Management", iconName: "UserCheck" },
    "patients": { title: "Patients Register", iconName: "UserCheck" },
    "activity-management": { title: "Activity Management", iconName: "ClipboardCheck" },
    "assessments": { title: "Clinical Assessments", iconName: "ClipboardCheck" },
    "exercise-prescription": { title: "Exercise Prescription", iconName: "Activity" },
    "treatment-plans": { title: "Treatment Plans", iconName: "Layers" },
    "ai-assesment": { title: "AI Assessment", iconName: "Sparkles" },
    "appointments": { title: "Appointments", iconName: "Calendar" },
    "timeline-calendar": { title: "Timeline Calendar", iconName: "Calendar" },
    "sessions": { title: "Therapy Sessions", iconName: "Calendar" },
    "record-management": { title: "Record Management", iconName: "Video" },
    "billing": { title: "Billing & Invoices", iconName: "CreditCard" },
    "invoices": { title: "Invoices", iconName: "CreditCard" },
    "payments": { title: "Payment Records", iconName: "DollarSign" },
    "subscriptions": { title: "Subscriptions", iconName: "Layers" },
    "product-services": { title: "Products & Services", iconName: "Package" },
    "products": { title: "Products Register", iconName: "Package" },
    "services": { title: "Clinic Services", iconName: "Activity" },
    "packages": { title: "Treatment Packages", iconName: "Layers" },
    "marketing": { title: "Marketing & Ads", iconName: "Megaphone" },
    "campaign": { title: "Marketing Campaigns", iconName: "Megaphone" },
    "ai-ad-studio": { title: "AI Ad Studio", iconName: "Sparkles" },

    // ERP & Admin Sections
    "staff": { title: "Staff Directory", iconName: "Users" },
    "erp": { title: "ERP Operations", iconName: "Layers" },
    "inventory": { title: "Inventory", iconName: "Package" },
    "analytics": { title: "Analytics", iconName: "TrendingUp" },
    "workflows": { title: "Workflows", iconName: "Layers" },
    "reports": { title: "Reports", iconName: "ClipboardList" },
    "settings": { title: "Settings", iconName: "Settings" },
    "integrations": { title: "Integrations", iconName: "SlidersHorizontal" },
    "inbox": { title: "Unified Inbox", iconName: "MessageSquare" },

    // Fallback Root
    "dashboard": { title: "Dashboard", iconName: "LayoutDashboard" }
}

const ICON_MAP: Record<string, React.ElementType> = {
    LayoutDashboard,
    Users,
    UserCheck,
    ClipboardCheck,
    Calendar,
    CreditCard,
    Package,
    Megaphone,
    Settings,
    Activity,
    Layers,
    Clock,
    Sparkles,
    DollarSign,
    TrendingUp,
    ClipboardList,
    SlidersHorizontal,
    Video
}

export function DashboardChromeTabs() {
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()
    const company = (params?.company as string) || "clinic"

    const { open, openMobile, isMobile } = useSidebar()
    const isCollapsed = isMobile ? !openMobile : !open

    // Tabs state
    const [tabs, setTabs] = React.useState<ChromeTab[]>([])
    const [isMounted, setIsMounted] = React.useState(false)

    // Helper to extract exact section tab info from path URL
    const getTabFromPath = React.useCallback((path: string): ChromeTab => {
        const cleanPath = path.split("?")[0]
        const segments = cleanPath.split("/").filter(Boolean)

        let foundTitle = ""
        let foundIcon = "LayoutDashboard"

        // Search segments from right to left (most specific section segment first)
        for (let i = segments.length - 1; i >= 0; i--) {
            const segment = segments[i]
            if (ROUTE_CONFIG[segment] && segment !== "dashboard") {
                foundTitle = ROUTE_CONFIG[segment].title
                foundIcon = ROUTE_CONFIG[segment].iconName
                break
            }
        }

        // Fallback if no specific section segment matched
        if (!foundTitle) {
            if (segments.includes("dashboard")) {
                foundTitle = "Dashboard"
                foundIcon = "LayoutDashboard"
            } else {
                foundTitle = "Section"
            }
        }

        return {
            id: cleanPath,
            title: foundTitle,
            href: cleanPath,
            iconName: foundIcon
        }
    }, [])

    // Load initial tabs from localStorage
    React.useEffect(() => {
        setIsMounted(true)
        const storageKey = `sg-chrome-tabs-${company}`

        const defaultHomeTab = {
            id: `/c/${company}/dashboard`,
            title: "Dashboard",
            href: `/c/${company}/dashboard`,
            iconName: "LayoutDashboard"
        }

        try {
            const savedTabs = localStorage.getItem(storageKey)

            let parsedTabs: ChromeTab[] = savedTabs ? JSON.parse(savedTabs) : [defaultHomeTab]
            if (!parsedTabs.length) parsedTabs = [defaultHomeTab]

            setTabs(parsedTabs)
        } catch (e) {
            setTabs([defaultHomeTab])
        }
    }, [company])

    // Update tabs list when pathname changes (adds or switches to current section tab)
    React.useEffect(() => {
        if (!isMounted || !pathname) return

        const currentTab = getTabFromPath(pathname)

        setTabs(prevTabs => {
            const exists = prevTabs.some(t => t.href === currentTab.href)
            let updated = prevTabs

            if (!exists) {
                updated = [...prevTabs, currentTab]
            } else {
                // Update title/icon if changed
                updated = prevTabs.map(t => t.href === currentTab.href ? { ...t, title: currentTab.title, iconName: currentTab.iconName } : t)
            }

            try {
                localStorage.setItem(`sg-chrome-tabs-${company}`, JSON.stringify(updated))
            } catch (e) { }

            return updated
        })
    }, [pathname, isMounted, company, getTabFromPath])

    // Close a tab
    const handleCloseTab = (e: React.MouseEvent, tabToClose: ChromeTab) => {
        e.stopPropagation()
        e.preventDefault()

        // Prevent closing the last remaining tab
        if (tabs.length === 1) return

        const newTabs = tabs.filter(t => t.id !== tabToClose.id)
        setTabs(newTabs)

        try {
            localStorage.setItem(`sg-chrome-tabs-${company}`, JSON.stringify(newTabs))
        } catch (err) { }

        // If closed tab was currently active, navigate to neighbor tab
        if (pathname === tabToClose.href) {
            const closedIndex = tabs.findIndex(t => t.id === tabToClose.id)
            const nextTab = newTabs[closedIndex] || newTabs[closedIndex - 1] || newTabs[0]
            if (nextTab) {
                router.push(nextTab.href)
            }
        }
    }



    const tabsContainerRef = React.useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = React.useState(false)
    const [canScrollRight, setCanScrollRight] = React.useState(false)

    const checkScrollState = React.useCallback(() => {
        if (!tabsContainerRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current
        setCanScrollLeft(scrollLeft > 4)
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
    }, [])

    React.useEffect(() => {
        checkScrollState()
        const el = tabsContainerRef.current
        if (el) {
            el.addEventListener("scroll", checkScrollState, { passive: true })
            window.addEventListener("resize", checkScrollState)
            return () => {
                el.removeEventListener("scroll", checkScrollState)
                window.removeEventListener("resize", checkScrollState)
            }
        }
    }, [tabs, checkScrollState])

    // Auto-scroll active tab into view when tabs or route changes
    React.useEffect(() => {
        if (!tabsContainerRef.current) return
        const timer = setTimeout(() => {
            const activeEl = tabsContainerRef.current?.querySelector<HTMLElement>('[data-active="true"]')
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
            }
            checkScrollState()
        }, 100)
        return () => clearTimeout(timer)
    }, [pathname, tabs, checkScrollState])

    const handleScrollSide = (direction: "left" | "right") => {
        if (!tabsContainerRef.current) return
        const offset = direction === "left" ? -220 : 220
        tabsContainerRef.current.scrollBy({ left: offset, behavior: "smooth" })
    }

    const handleWheelScroll = (e: React.WheelEvent) => {
        if (tabsContainerRef.current && Math.abs(e.deltaY) > 0) {
            tabsContainerRef.current.scrollLeft += e.deltaY
        }
    }

    if (!isMounted) return null

    return (
        <div className="sticky top-0 z-30 w-full max-w-full min-w-0 overflow-hidden bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-1.5 px-2 flex items-center gap-1 select-none transition-all shadow-xs">
            {/* Spacing Pad for Sidebar Trigger when collapsed */}
            <div className={`transition-[width] duration-200 ${isCollapsed ? "w-10" : "w-2"}`} />

            {/* Left Scroll Button for Tabs */}
            {canScrollLeft && (
                <button
                    onClick={() => handleScrollSide("left")}
                    className="h-7.5 w-7.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-xs cursor-pointer shrink-0 mb-1 transition-all"
                    title="Scroll tabs left"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}

            {/* Scrollable Tabs List - Horizontal scrolling strictly for tabs */}
            <div
                ref={tabsContainerRef}
                onWheel={handleWheelScroll}
                className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0 py-0.5"
            >
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (pathname.startsWith(tab.href + "/") && tab.href !== `/c/${company}/dashboard`)
                    const IconComponent = ICON_MAP[tab.iconName] || LayoutDashboard

                    return (
                        <div
                            key={tab.id}
                            data-active={isActive ? "true" : "false"}
                            onClick={() => router.push(tab.href)}
                            className={`group relative flex items-center gap-2 h-9 px-3.5 max-w-[210px] min-w-[120px] rounded-t-xl text-xs font-semibold cursor-pointer transition-all duration-150 border-t border-x shrink-0 ${isActive
                                    ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 shadow-xs z-10 -mb-[1px] pb-[1px]"
                                    : "bg-slate-200/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-200/90 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200 border-slate-300/40 dark:border-slate-700/40"
                                }`}
                            title={tab.title}
                        >
                            {/* Active Tab Accent Line */}
                            {isActive && (
                                <div className="absolute top-0 left-3 right-3 h-[2.5px] bg-primary rounded-full" />
                            )}

                            <IconComponent className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />

                            <span className="truncate flex-1">{tab.title}</span>

                            {/* Close Button (Chrome style) */}
                            {tabs.length > 1 && (
                                <button
                                    onClick={(e) => handleCloseTab(e, tab)}
                                    className={`h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all ${isActive
                                            ? "hover:bg-muted text-muted-foreground hover:text-foreground"
                                            : "opacity-0 group-hover:opacity-100 hover:bg-muted/80 text-muted-foreground"
                                        }`}
                                    title="Close tab"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Right Scroll Button for Tabs */}
            {canScrollRight && (
                <button
                    onClick={() => handleScrollSide("right")}
                    className="h-7 w-7 rounded-lg bg-card/90 hover:bg-card text-foreground border border-border flex items-center justify-center shadow-xs cursor-pointer shrink-0 mb-1 transition-all"
                    title="Scroll tabs right"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            )}

            {/* Message Inbox Quick Action */}
            <div className="flex items-center gap-1 shrink-0 pb-1 pl-1">
                <InboxQuickPopover />
            </div>
        </div>
    )
}
