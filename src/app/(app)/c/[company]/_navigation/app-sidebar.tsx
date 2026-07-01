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
    Frame,
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

import { NavMain } from "@/app/(app)/c/[company]/_navigation/nav-main"
import { NavProjects } from "@/app/(app)/c/[company]/_navigation/nav-projects"
import { NavSecondary } from "@/app/(app)/c/[company]/_navigation/nav-secondary"
import { NavUser } from "@/app/(app)/c/[company]/_navigation/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
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
                    url: "/c/[company]/marketing/campaign",
                },
                {
                    title: "Active Campaigns",
                    url: "/c/[company]/marketing/campaign?status=Active",
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
                    url: "/c/[company]/lead-management",
                },
                {
                    title: "Follow Ups",
                    url: "/c/[company]/lead-management/follow-up",
                },
                {
                    title: "Tasks",
                    url: "/c/[company]/lead-management#tasks",
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
                    url: "#",
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
                    url: "#",
                },
                {
                    title: "Treatment Plans",
                    url: "#",
                },
                {
                    title: "Exercise Prescriptions",
                    url: "#",
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
                    url: "#",
                },
                {
                    title: "Schedule",
                    url: "#",
                },
                {
                    title: "Session Management",
                    url: "#",
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
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
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
            url: "#",
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

    const filteredNavMain = React.useMemo(() => {
        const companyStr = (Array.isArray(company) ? company[0] : company) || ""
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
    }, [hiddenCrmModules, company])

    const filteredProjects = React.useMemo(() => {
        return data.projects.filter((item) => !hiddenErpModules.includes(item.name))
    }, [hiddenErpModules])

    const filteredSecondary = React.useMemo(() => {
        return data.navSecondary.filter((item) => !hiddenSecondaryModules.includes(item.title))
    }, [hiddenSecondaryModules])

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{company}</span>
                                    <span className="truncate text-xs">Enterprise</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
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
