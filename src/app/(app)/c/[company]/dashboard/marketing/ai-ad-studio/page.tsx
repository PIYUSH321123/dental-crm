"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Megaphone, Users, Target, TrendingUp, Search, Plus, Eye, MousePointerClick } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/components/ui/sidebar"

interface AdSet {
    id: string
    title: string
    platforms: string
    status: "Active" | "Paused" | "Draft"
    endDate: string
    impressions: string
    clicks: string
    ctr: string
    imageSrc: string
}

const mockAdSets: AdSet[] = [
    {
        id: "adset-1",
        title: "Telehealth Launch",
        platforms: "Facebook & Instagram",
        status: "Active",
        endDate: "Ends Feb 14, 2025",
        impressions: "312,400",
        clicks: "9,372",
        ctr: "3.0%",
        imageSrc: "/physio-ad-1.png"
    },
    {
        id: "adset-2",
        title: "Heart Health App",
        platforms: "Facebook & Google Display",
        status: "Active",
        endDate: "Ends Mar 30, 2025",
        impressions: "198,750",
        clicks: "5,963",
        ctr: "3.0%",
        imageSrc: "/physio-ad-2.png"
    },
    {
        id: "adset-3",
        title: "Wellness Program Q4",
        platforms: "Instagram & Email",
        status: "Paused",
        endDate: "Ended Dec 31, 2024",
        impressions: "156,200",
        clicks: "4,218",
        ctr: "2.7%",
        imageSrc: "/physio-ad-1.png"
    },
    {
        id: "adset-4",
        title: "Prenatal Care — West Coast",
        platforms: "Facebook & Instagram",
        status: "Active",
        endDate: "Ends Apr 15, 2025",
        impressions: "89,400",
        clicks: "2,859",
        ctr: "3.2%",
        imageSrc: "/physio-ad-2.png"
    },
    {
        id: "adset-5",
        title: "Seniors 65+ — National",
        platforms: "Google Display & Email",
        status: "Draft",
        endDate: "Not started",
        impressions: "--",
        clicks: "--",
        ctr: "--",
        imageSrc: "/physio-ad-1.png"
    },
    {
        id: "adset-6",
        title: "Diabetes Care Management",
        platforms: "Facebook & Instagram",
        status: "Active",
        endDate: "Ends May 1, 2025",
        impressions: "90,541",
        clicks: "2,407",
        ctr: "2.66%",
        imageSrc: "/physio-ad-2.png"
    }
]

export default function AiAdStudioDashboardPage() {
    const router = useRouter()
    const params = useParams()
    const company = params.company as string

    const { open, openMobile, isMobile } = useSidebar()
    const isCollapsed = isMobile ? !openMobile : !open



    const handleCreateClick = () => {
        router.push(`/c/${company}/dashboard/marketing/ai-ad-studio/create`)
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Header */}
                    <div className={`pr-4 lg:pr-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-[padding] duration-200 ${isCollapsed ? "pl-16 md:pl-20" : "pl-4 lg:pl-6"}`}>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Ad Sets</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage and launch your health marketing campaigns
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-64 max-sm:w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search ad sets..."
                                    className="pl-9 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <Button
                                onClick={handleCreateClick}
                                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer font-bold px-4 py-2 gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Create New Ad
                            </Button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-4 lg:px-6 space-y-6">
                        {/* Stats Section */}
                        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                            <Card className="bg-card border-border shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0">
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Impressions</CardDescription>
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold tracking-tight">847,291</div>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                                        <span>▲ +12.4%</span>
                                        <span className="text-muted-foreground font-normal">vs last month</span>
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0">
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Clicks</CardDescription>
                                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold tracking-tight font-mono">24,819</div>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                                        <span>▲ +8.7%</span>
                                        <span className="text-muted-foreground font-normal">vs last month</span>
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0">
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg. CTR</CardDescription>
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold tracking-tight font-mono">2.93%</div>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                                        <span>▲ +0.4%</span>
                                        <span className="text-muted-foreground font-normal">vs last month</span>
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0">
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Ad Sets</CardDescription>
                                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold tracking-tight">6</div>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                                        <span>▲ +2 new</span>
                                        <span className="text-muted-foreground font-normal">this month</span>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Your Ad Sets Grid */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-bold text-slate-850 dark:text-slate-200">Your Ad Sets</h2>
                                <span className="text-xs text-muted-foreground font-medium">6 ad sets</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {/* Create New Ad Card trigger */}
                                <Link
                                    href={`/c/${company}/dashboard/marketing/ai-ad-studio/create`}
                                    className="flex flex-col h-full group"
                                >
                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 h-full min-h-[300px]">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full group-hover:scale-105 transition-transform">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-semibold text-sm mt-3 text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            Create New Ad
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
                                            Start from a template or build from scratch
                                        </p>
                                    </div>
                                </Link>

                                {/* Mock Ad Sets */}
                                {mockAdSets.map((adset) => (
                                    <Card key={adset.id} className="overflow-hidden border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between bg-card group hover:border-emerald-500/30 h-full">
                                        <div>
                                            {/* Header Image / Gradient with Status Badge */}
                                            <div className="relative h-36 w-full overflow-hidden bg-muted">
                                                <img
                                                    src={adset.imageSrc}
                                                    alt={adset.title}
                                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs border ${
                                                        adset.status === "Active"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-900/50"
                                                            : adset.status === "Paused"
                                                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-900/50"
                                                            : "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/80 dark:text-zinc-400 dark:border-zinc-800"
                                                    }`}>
                                                        {adset.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm line-clamp-1">
                                                        {adset.title}
                                                    </h3>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                                        {adset.platforms} · <span className="italic">{adset.endDate}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Stats Row */}
                                        <div className="border-t border-border bg-slate-50/50 dark:bg-slate-900/20 px-4 py-2 grid grid-cols-3 gap-2 text-center text-xs shrink-0">
                                            <div>
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Impressions</span>
                                                <div className="font-bold text-slate-850 dark:text-slate-250 mt-0.5 font-mono">{adset.impressions}</div>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Clicks</span>
                                                <div className="font-bold text-slate-850 dark:text-slate-250 mt-0.5 font-mono">{adset.clicks}</div>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">CTR</span>
                                                <div className="font-bold text-slate-850 dark:text-slate-250 mt-0.5 font-mono">{adset.ctr}</div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    )
}
