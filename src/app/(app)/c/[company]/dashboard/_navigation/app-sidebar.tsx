"use client"

import * as React from "react"
import {
    Activity,
    BookOpen,
    Bot,
    Box,
    Calendar,
    Command,
    Contact,
    CreditCard,
    Frame,
    LayoutDashboard,
    LifeBuoy,
    Map,
    MegaphoneIcon,
    PieChart,
    Send,
    Settings2,
    SquareTerminal,
    Store,
    Users,
    Workflow,
} from "lucide-react"

import { NavMain } from "@/app/(app)/c/[company]/dashboard/_navigation/nav-main"
import { NavProjects } from "@/app/(app)/c/[company]/dashboard/_navigation/nav-projects"
import { NavSecondary } from "@/app/(app)/c/[company]/dashboard/_navigation/nav-secondary"
import { NavUser } from "@/app/(app)/c/[company]/dashboard/_navigation/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { useParams } from "next/navigation"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Marketing",
            url: "#",
            icon: MegaphoneIcon,
            isActive: true,
            items: [
                {
                    title: "Campaigns",
                    url: "/c/[company]/dashboard/marketing/campaign",
                },
                {
                    title: "Active Campaigns",
                    url: "/c/[company]/dashboard/marketing/campaign?status=Active",
                },
                {
                    title: "AI Ad Studio",
                    url: "/c/[company]/dashboard/marketing/ai-ad-studio",
                }
            ],
        },
        {
            title: "Lead Management",
            url: "#",
            icon: Contact,
            items: [
                {
                    title: "Leads",
                    url: "/c/[company]/dashboard/lead-management/leads",
                },
                {
                    title: "Follow Ups",
                    url: "/c/[company]/dashboard/lead-management/follow-up",
                },
                {
                    title: "Tasks",
                    url: "/c/[company]/dashboard/lead-management/leads#tasks",
                },
            ],
        },
        {
            title: "Patient Management",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Patients",
                    url: "/c/[company]/dashboard/patient-management/patients",
                },
            ],
        },
        {
            title: "Activity Management",
            url: "#",
            icon: Activity,
            items: [
                {
                    title: "Clinical Assesments",
                    url: "/c/[company]/dashboard/activity-management/assessments",
                },
                {
                    title: "AI Biomechanical ROM",
                    url: "/c/[company]/dashboard/activity-management/ai-assesment",
                },
                {
                    title: "Treatment Plans",
                    url: "/c/[company]/dashboard/activity-management/treatment-plans",
                },
                {
                    title: "Exercise Prescriptions",
                    url: "/c/[company]/dashboard/activity-management/exercise-prescription",
                },
            ],
        },
        {
            title: "Appoinments",
            url: "#",
            icon: Calendar,
            items: [
                {
                    title: "Timeline",
                    url: "/c/[company]/dashboard/appointments/timeline-calendar",
                },
                {
                    title: "Schedule",
                    url: "#",
                },
                {
                    title: "Session Management",
                    url: "/c/[company]/dashboard/appointments/sessions",
                },
            ],
        },
        {
            title: "Product & Services",
            url: "#",
            icon: Store,
            items: [
                {
                    title: "Products",
                    url: "#",
                },
                {
                    title: "Services",
                    url: "#",
                },
                {
                    title: "Packages",
                    url: "#",
                },
                {
                    title: "Reports",
                    url: "#",
                },
            ],
        },
        {
            title: "Billing",
            url: "#",
            icon: CreditCard,
            items: [
                {
                    title: "Invoices",
                    url: "/c/[company]/dashboard/billing/invoices",
                },
                {
                    title: "Payments",
                    url: "/c/[company]/dashboard/billing/payments",
                },
                {
                    title: "Subscriptions",
                    url: "/c/[company]/dashboard/billing/subscriptions",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Integrations / Linked Apps",
                    url: "/c/[company]/dashboard/settings/integrations",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Support",
            url: "#",
            icon: LifeBuoy,
        },
        {
            title: "Feedback",
            url: "#",
            icon: Send,
        },
    ],
    projects: [
        {
            name: "Analytics",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Inventory",
            url: "#",
            icon: Box,
        },
        {
            name: "Workflows",
            url: "#",
            icon: Workflow,
        },
        {
            name: "Staff",
            url: "/c/[company]/dashboard/erp/staff",
            icon: Users,
        },
        {
            name: "Reports",
            url: "#",
            icon: Map,
        },
    ],
}

export function AppSidebar({
    crmVisible = true,
    erpVisible = true,
    hiddenCrmModules = [],
    hiddenErpModules = [],
    hiddenSecondaryModules = [],
    ...props
}: React.ComponentProps<typeof Sidebar> & {
    crmVisible?: boolean
    erpVisible?: boolean
    hiddenCrmModules?: string[]
    hiddenErpModules?: string[]
    hiddenSecondaryModules?: string[]
}) {
    const { company } = useParams()
    const companyStr = (Array.isArray(company) ? company[0] : company) || ""

    const filteredNavMain = React.useMemo(() => {
        return data.navMain
            .filter((item) => !hiddenCrmModules.includes(item.title))
            .map((item) => ({
                ...item,
                url: item.url.replace("[company]", companyStr),
                items: item.items?.map((subItem) => ({
                    ...subItem,
                    url: subItem.url.replace("[company]", companyStr),
                })),
            }))
    }, [hiddenCrmModules, companyStr])

    const filteredProjects = React.useMemo(() => {
        return data.projects
            .filter((item) => !hiddenErpModules.includes(item.name))
            .map((item) => ({
                ...item,
                url: item.url.replace("[company]", companyStr),
            }))
    }, [hiddenErpModules, companyStr])

    const filteredSecondary = React.useMemo(() => {
        return data.navSecondary.filter((item) => !hiddenSecondaryModules.includes(item.title))
    }, [hiddenSecondaryModules])

    const { open, setOpen } = useSidebar()

    const handleLogoClick = (e: React.MouseEvent) => {
        if (!open) {
            e.preventDefault()
            setOpen(true)
        }
    }

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader className="border-b border-sidebar-border pb-2">
                <div className="flex items-center justify-between px-1">
                    <a
                        href={`/c/${companyStr}/dashboard`}
                        onClick={handleLogoClick}
                        className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center w-full"
                    >
                        <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground cursor-pointer">
                            <Command className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                            <span className="truncate font-medium">{companyStr}</span>
                            <span className="truncate text-xs text-muted-foreground">Enterprise</span>
                        </div>
                    </a>
                    <SidebarTrigger className="hidden md:flex ml-auto h-7 w-7 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground group-data-[collapsible=icon]:hidden cursor-pointer" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="pb-0">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <a href={`/c/${companyStr}/dashboard`}>
                                    <LayoutDashboard className="size-4" />
                                    <span>Dashboard</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                {crmVisible && <NavMain items={filteredNavMain} />}
                {erpVisible && <NavProjects projects={filteredProjects} />}
                <NavSecondary items={filteredSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
