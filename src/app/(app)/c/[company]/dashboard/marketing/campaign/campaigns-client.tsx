"use client"

import * as React from "react"
import { useState } from "react"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { mockCampaigns, Campaign } from "./data"
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Megaphone, Users, Target, TrendingUp, Sparkles, BarChart3 } from "lucide-react"
import { CreateCampaignDialog } from "./create-campaign-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AiAdStudio } from "./ai-ad-studio"

export function CampaignsClient() {
    const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)

    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0)
    const totalConverted = campaigns.reduce((sum, c) => sum + c.converted, 0)
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)

    const conversionRate = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : "0.0"
    const averageRoi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0

    const formattedBudget = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(totalBudget)

    const formattedRoi = `${averageRoi >= 0 ? "+" : ""}${averageRoi.toFixed(1)}%`

    const searchFilters = [
        { field: "campaign_name", label: "Campaign Name" },
        { field: "source", label: "Source" },
        { field: "status", label: "Status" },
    ]

    const handleCampaignCreated = (newCampaign: Campaign) => {
        setCampaigns((prevCampaigns) => [newCampaign, ...prevCampaigns])
    }

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
                        <CreateCampaignDialog
                            existingCampaigns={campaigns}
                            onCampaignCreated={handleCampaignCreated}
                        />
                    </div>

                    {/* Tab Navigation */}
                    <div className="px-4 lg:px-6">
                        <Tabs defaultValue="overview" className="w-full space-y-6">
                            <TabsList className="grid grid-cols-2 max-w-[360px] h-9">
                                <TabsTrigger value="overview" className="flex items-center gap-1.5 cursor-pointer">
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    <span>Campaigns Overview</span>
                                </TabsTrigger>
                                <TabsTrigger value="studio" className="flex items-center gap-1.5 cursor-pointer">
                                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                                    <span className="font-semibold text-primary">AI Ad Studio</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 outline-hidden border-none p-0">
                                {/* Stats Section */}
                                <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
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
                                <DataTable
                                    columns={columns}
                                    data={campaigns}
                                    searchFilters={searchFilters}
                                    defaultSearchField="campaign_name"
                                />
                            </TabsContent>

                            <TabsContent value="studio" className="outline-hidden border-none p-0">
                                <AiAdStudio onCampaignCreated={handleCampaignCreated} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}
