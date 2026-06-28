import * as React from "react"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { mockCampaigns } from "./data"
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Megaphone, Users, Target, TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CampaignPage({ params }: { params: Promise<{ company: string }> }) {
    const { company } = await params

    const totalBudget = mockCampaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalLeads = mockCampaigns.reduce((sum, c) => sum + c.leads, 0)
    const totalConverted = mockCampaigns.reduce((sum, c) => sum + c.converted, 0)
    const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0)

    const conversionRate = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : "0.0"
    const averageRoi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0

    const formattedBudget = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(totalBudget)

    const formattedRoi = `${averageRoi >= 0 ? "+" : ""}${averageRoi.toFixed(1)}%`

    const searchFilters = [
        { field: "name", label: "Campaign Name" },
        { field: "source", label: "Source" },
        { field: "status", label: "Status" },
    ]

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Header */}
                    <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Marketing Campaigns</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Track, analyze, and optimize advertising spend, lead generation, and overall campaign ROI.
                            </p>
                        </div>
                        <Button className="shrink-0 gap-2 font-semibold shadow-xs self-start sm:self-auto">
                            <Plus className="h-4 w-4" />
                            Create Campaign
                        </Button>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Marketing Budget</CardDescription>
                                <Megaphone className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight">{formattedBudget}</div>
                                <p className="text-xs text-muted-foreground mt-1">Allocated across active channels</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Total Leads</CardDescription>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight">
                                    {new Intl.NumberFormat("en-IN").format(totalLeads)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Inbound marketing prospects</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Conversions</CardDescription>
                                <Target className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    {totalConverted}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Avg. Conversion Rate: {conversionRate}%</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Average ROI</CardDescription>
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight">
                                    {formattedRoi}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Net positive returns on ads spend</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div className="px-4 lg:px-6">
                        <DataTable
                            columns={columns}
                            data={mockCampaigns}
                            searchFilters={searchFilters}
                            defaultSearchField="name"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
