import * as React from "react"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { mockProjects } from "./data"
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Briefcase, Activity, Landmark, ShieldCheck } from "lucide-react"

export default function ProjectsPage() {
    const totalProjects = mockProjects.length
    const activeProjects = mockProjects.filter((p) => p.status === "Active").length
    const enterpriseProjects = mockProjects.filter((p) => p.subscription_plan === "Enterprise").length

    const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget, 0)
    const formattedBudget = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(totalBudget)

    const searchFilters = [
        { field: "project_name", label: "Project Name" },
        { field: "company_name", label: "Company Name" },
        { field: "lead_name", label: "Lead Contact" },
        { field: "subscription_plan", label: "Subscription Plan" },
    ]

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Header */}
                    <div className="px-4 lg:px-6">
                        <h1 className="text-2xl font-bold tracking-tight">Projects Directory</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Monitor client companies, subscription plans, budget allocation, and renewal metrics.
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Total Clients</CardDescription>
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight">{totalProjects}</div>
                                <p className="text-xs text-muted-foreground mt-1">Registered accounts on Sales Guru</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Active Subscriptions</CardDescription>
                                <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    {activeProjects}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Currently active accounts</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Combined Budget</CardDescription>
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight">{formattedBudget}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total contract value</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Enterprise Tier</CardDescription>
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight">{enterpriseProjects}</div>
                                <p className="text-xs text-muted-foreground mt-1">High-value enterprise clients</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div className="px-4 lg:px-6">
                        <DataTable
                            columns={columns}
                            data={mockProjects}
                            searchFilters={searchFilters}
                            defaultSearchField="project_name"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}