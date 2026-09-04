"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { toast } from "sonner"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { mockCampaigns, Campaign } from "./data"
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Megaphone, Users, Target, TrendingUp } from "lucide-react"
import { CreateCampaignDialog } from "./create-campaign-dialog"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { getCampaignsAction } from "@/lib/actions/campaigns"

export function CampaignsClient() {
    const searchParams = useSearchParams()
    const statusParam = searchParams.get("status")

    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [isMounted, setIsMounted] = useState(false)
    const [loading, setLoading] = useState(true)

    const params = useParams()
    const companySlug = (params?.company as string) || "clinic"

    useEffect(() => {
        async function loadCampaigns() {
            setLoading(true)
            try {
                const result = await getCampaignsAction(companySlug)
                if (result.success && result.data) {
                    setCampaigns(result.data)
                } else {
                    toast.error(result.error || "Failed to load campaigns.")
                }
            } catch (err) {
                console.error("Error loading campaigns:", err)
                toast.error("Failed to load campaigns due to server error.")
            } finally {
                setIsMounted(true)
                setLoading(false)
            }
        }

        if (companySlug) {
            loadCampaigns()
        }
    }, [companySlug])

    // Filter campaigns based on status query parameter (e.g. status=Active)
    const filteredCampaigns = useMemo(() => {
        if (statusParam) {
            return campaigns.filter(c => c.status.toLowerCase() === statusParam.toLowerCase())
        }
        return campaigns
    }, [campaigns, statusParam])

    const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalLeads = filteredCampaigns.reduce((sum, c) => sum + c.leads, 0)
    const totalConverted = filteredCampaigns.reduce((sum, c) => sum + c.converted, 0)
    const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0)

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

    if (!isMounted || loading) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 animate-pulse">
                        {/* Skeleton Header */}
                        <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2">
                                <div className="h-8 w-48 bg-muted rounded-lg" />
                                <div className="h-4 w-96 bg-muted rounded-lg" />
                            </div>
                        </div>
                        {/* Skeleton Content */}
                        <div className="px-4 lg:px-6 space-y-6">
                            <div className="h-[350px] bg-muted/40 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Header Title Card with Gray Gradient Shades */}
                    <div className="mx-4 lg:mx-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:px-6 md:py-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                        <div className="space-y-1">
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                                <Megaphone className="h-6 w-6 text-primary shrink-0" />
                                {statusParam ? `${statusParam} Campaigns` : "Marketing Campaigns"}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {statusParam 
                                    ? `Track, analyze, and optimize your currently ${statusParam.toLowerCase()} advertising campaigns.`
                                    : "Track, analyze, and optimize advertising spend, lead generation, and overall campaign ROI."}
                            </p>
                        </div>
                        {campaigns.length > 0 && (
                            <CreateCampaignDialog
                                existingCampaigns={campaigns}
                                onCampaignCreated={handleCampaignCreated}
                            />
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="px-4 lg:px-6 space-y-6">
                        {campaigns.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[350px] rounded-2xl border-2 border-dashed border-muted-foreground/15 bg-card/30 p-8 text-center backdrop-blur-xs">
                                <Empty className="border-0 shadow-none bg-transparent">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon" className="bg-primary/10 text-primary h-12 w-12 rounded-xl">
                                            <Megaphone className="h-6 w-6" />
                                        </EmptyMedia>
                                        <EmptyTitle className="text-lg font-bold text-foreground mt-2">
                                            No marketing campaigns found
                                        </EmptyTitle>
                                        <EmptyDescription className="text-sm text-muted-foreground mt-1 max-w-sm">
                                            Clear default mock campaigns fallback has been applied. Launch a new campaign to track lead acquisition and performance.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent className="mt-6">
                                        <CreateCampaignDialog
                                            existingCampaigns={campaigns}
                                            onCampaignCreated={handleCampaignCreated}
                                        />
                                    </EmptyContent>
                                </Empty>
                            </div>
                        ) : (
                            <>
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
                                    data={filteredCampaigns}
                                    searchFilters={searchFilters}
                                    defaultSearchField="campaign_name"
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
