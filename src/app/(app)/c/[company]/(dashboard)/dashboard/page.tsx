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
    ClipboardList 
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

    return (
        <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Overview of your practice's metrics, clients, and upcoming schedule.
                    </p>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-xs border-gray-100 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Total Patients
                        </CardDescription>
                        <Users className="h-5 w-5 text-[#f97316]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">284</div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-50 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                <TrendingUp className="h-3 w-3 inline mr-0.5" />
                                +12.5%
                            </Badge>
                            <span className="text-[11px] text-gray-400">vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-gray-100 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Today's Sessions
                        </CardDescription>
                        <Calendar className="h-5 w-5 text-[#f97316]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">48</div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-50 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                <TrendingUp className="h-3 w-3 inline mr-0.5" />
                                +5.2%
                            </Badge>
                            <span className="text-[11px] text-gray-400">vs yesterday</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-gray-100 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Lead Conversion
                        </CardDescription>
                        <Activity className="h-5 w-5 text-[#f97316]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">18.4%</div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-50 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                <TrendingDown className="h-3 w-3 inline mr-0.5" />
                                -1.8%
                            </Badge>
                            <span className="text-[11px] text-gray-400">vs last week</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-gray-100 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Active Recovery
                        </CardDescription>
                        <ClipboardList className="h-5 w-5 text-[#f97316]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">94 Plans</div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-50 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                <TrendingUp className="h-3 w-3 inline mr-0.5" />
                                +6.3%
                            </Badge>
                            <span className="text-[11px] text-gray-400">vs last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Grid: Appointments & Leads */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Left Side: Appointments Table */}
                <Card className="lg:col-span-8 shadow-xs border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                    <div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Sessions</CardTitle>
                                <CardDescription className="text-xs text-gray-400">Today's scheduled appointments</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs font-semibold text-[#f97316] border-orange-200/50 hover:bg-orange-50/10">
                                View Calendar
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-100 dark:border-gray-800">
                                        <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-gray-500">Patient</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Time</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Service Type</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Therapist</TableHead>
                                        <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map((a, idx) => (
                                        <TableRow key={idx} className="border-gray-50 dark:border-gray-800/50 hover:bg-slate-50/40">
                                            <TableCell className="pl-6 font-semibold text-gray-900 dark:text-white text-sm">{a.patient}</TableCell>
                                            <TableCell className="text-gray-500 text-xs font-medium">{a.time}</TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-300 text-xs">{a.type}</TableCell>
                                            <TableCell className="text-gray-500 text-xs">{a.practitioner}</TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Badge 
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        a.statusVariant === "success" 
                                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                            : a.statusVariant === "warning"
                                                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                    }`}
                                                >
                                                    {a.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </div>
                </Card>

                {/* Right Side: Recent Leads Feed */}
                <Card className="lg:col-span-4 shadow-xs border-gray-100 dark:border-gray-800 flex flex-col">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Recent Inquiries</CardTitle>
                        <CardDescription className="text-xs text-gray-400">New leads to follow up</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1">
                        {recentLeads.map((lead, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <Avatar className="h-9 w-9 border border-orange-50 bg-orange-50/50 flex items-center justify-center text-[#f97316] font-bold text-xs shrink-0">
                                    <AvatarFallback>{lead.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                                            {lead.name}
                                        </p>
                                        <span className="text-[10px] text-gray-400">{lead.date}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {lead.email}
                                    </p>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-[10px] text-gray-500 font-semibold">{lead.phone}</span>
                                        <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 bg-slate-50 text-gray-500">
                                            {lead.source}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
