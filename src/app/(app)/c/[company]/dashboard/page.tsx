"use client"
import * as React from "react"
import { 
    Users, 
    Calendar, 
    TrendingUp, 
    Activity, 
    ArrowUpRight, 
    Clock, 
    CheckCircle2, 
    UserPlus, 
    TrendingDown, 
    ClipboardList,
    Search,
    Bell,
    Moon,
    Sun,
    ArrowUp,
    ArrowDown
} from "lucide-react"
import { useTheme } from "next-themes"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function Page() {
    const appointments = [
        {
            patient: "Alice Johnson",
            time: "09:30 AM",
            type: "Knee Rehabilitation",
            practitioner: "Dr. Anil (Physio)",
            status: "Confirmed",
            statusVariant: "success"
        },
        {
            patient: "Bob Smith",
            time: "11:00 AM",
            type: "Lower Back Flow",
            practitioner: "Dr. Ankita (Yoga)",
            status: "Pending",
            statusVariant: "warning"
        },
        {
            patient: "Clara Davis",
            time: "02:30 PM",
            type: "Post-Op Recovery",
            practitioner: "Dr. Anil (Physio)",
            status: "Confirmed",
            statusVariant: "success"
        },
        {
            patient: "Daniel Wilson",
            time: "04:00 PM",
            type: "Spine Alignment",
            practitioner: "Dr. Ankita (Yoga)",
            status: "Checked In",
            statusVariant: "secondary"
        }
    ]

    const recentLeads = [
        {
            name: "Emily Brown",
            email: "emily@example.com",
            phone: "+91 98765 00112",
            source: "Website Form",
            date: "10 mins ago"
        },
        {
            name: "John Carter",
            email: "john.c@example.com",
            phone: "+91 98765 00113",
            source: "WhatsApp Inquiry",
            date: "1 hour ago"
        },
        {
            name: "Sophia Martinez",
            email: "sophia@example.com",
            phone: "+91 98765 00114",
            source: "Google Maps",
            date: "3 hours ago"
        }
    ]

    const { theme, setTheme } = useTheme()
    const { open, openMobile, isMobile } = useSidebar()
    const isCollapsed = isMobile ? !openMobile : !open
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className={`flex-1 space-y-6 p-6 md:p-8 pt-6 ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
            {/* Page Header Title Card with Gray Gradient Shades */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:px-6 md:py-3.5 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">Dashboard</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Overview of your practice's metrics, clients, and upcoming schedule.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {/* Search Bar */}
                    <div className="relative w-56 hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full pl-8.5 pr-4 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground transition-all shadow-2xs"
                        />
                    </div>
                    {/* Notification Bell */}
                    <button className="relative h-9 w-9 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary border border-background" />
                    </button>
                    {/* Theme Toggle (Moon/Sun) */}
                    <button 
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-9 w-9 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        title="Toggle Theme"
                    >
                        {mounted && theme === "dark" ? (
                            <Sun className="h-4 w-4 text-amber-500" />
                        ) : (
                            <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                        )}
                        {!mounted && <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />}
                    </button>
                    {/* Divider */}
                    <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
                    {/* Profile */}
                    <div className="flex items-center gap-2.5">
                        <div className="text-right hidden md:block">
                            <p className="text-xs font-semibold text-foreground leading-tight">Dr. Sarah</p>
                            <p className="text-[9px] font-medium text-muted-foreground tracking-wider">Admin</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-xs">
                            DS
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Stats Grid with Gray Shades */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Patients */}
                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                Total Patients
                            </span>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white block">
                                284
                            </span>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                <span>+12.5%</span>
                                <ArrowDown className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-2xs">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Sessions */}
                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                Today's Sessions
                            </span>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white block">
                                48
                            </span>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                <span>+5.2%</span>
                                <ArrowDown className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-2xs">
                            <Calendar className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Lead Conversion */}
                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                Lead Conversion
                            </span>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white block">
                                18.4%
                            </span>
                            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                                <span>-1.8%</span>
                                <ArrowUp className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-2xs">
                            <Activity className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Active Recovery */}
                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                Active Recovery
                            </span>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white block">
                                94 Plans
                            </span>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                <span>+6.3%</span>
                                <ArrowDown className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-2xs">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Grid: Appointments & Leads */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Left Side: Appointments Table */}
                <Card className="lg:col-span-8 shadow-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between overflow-hidden">
                    <div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 bg-gradient-to-r from-slate-100/90 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Sessions</CardTitle>
                                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Today's scheduled appointments</CardDescription>
                            </div>
                            <button className="text-xs font-semibold px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs">
                                View Calendar
                            </button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <TableRow className="border-slate-200 dark:border-slate-800">
                                        <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Patient</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Time</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Service Type</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Therapist</TableHead>
                                        <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map((a, idx) => (
                                        <TableRow key={idx} className="border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                            <TableCell className="pl-6 font-semibold text-slate-950 dark:text-white text-sm py-4">{a.patient}</TableCell>
                                            <TableCell className="text-slate-500 dark:text-slate-400 text-xs font-medium py-4">{a.time}</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300 text-xs font-medium py-4">{a.type}</TableCell>
                                            <TableCell className="text-slate-500 dark:text-slate-400 text-xs font-medium py-4">{a.practitioner}</TableCell>
                                            <TableCell className="pr-6 text-right py-4">
                                                <span 
                                                    className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                                                        a.statusVariant === "success" 
                                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                                            : a.statusVariant === "warning"
                                                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                                    }`}
                                                >
                                                    {a.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </div>
                </Card>

                {/* Right Side: Recent Leads Feed */}
                <Card className="lg:col-span-4 shadow-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between overflow-hidden">
                    <div>
                        <CardHeader className="p-5 bg-gradient-to-r from-slate-100/90 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Recent Inquiries</CardTitle>
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">New leads to follow up</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y divide-slate-100 dark:divide-slate-800/60 p-0">
                            {recentLeads.map((lead, idx) => (
                                <div key={idx} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
                                        idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-purple-500" : "bg-emerald-500"
                                    }`}>
                                        {lead.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none">
                                                {lead.name}
                                            </p>
                                            <span className="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{lead.date}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-none">
                                            {lead.email}
                                        </p>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">{lead.phone}</span>
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {lead.source}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </div>
                    <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                        <a href="#" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 transition-all">
                            View All Inquiries →
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    )
}
