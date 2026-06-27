"use client"

import * as React from "react"
import {
    BookOpen,
    Bot,
    Box,
    Calendar,
    Command,
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
                    url: "#",
                },
                {
                    title: "Active Campaigns",
                    url: "#",
                }
            ],
        },
        {
            title: "Lead Management",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Leads",
                    url: "#",
                },
                {
                    title: "Follow Ups",
                    url: "#",
                },
                {
                    title: "Tasks",
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
                    title: "Scheduled",
                    url: "#",
                },
                {
                    title: "Completed",
                    url: "#",
                },
                {
                    title: "Missed",
                    url: "#",
                },
                {
                    title: "Cancelled",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { company } = useParams()
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
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
