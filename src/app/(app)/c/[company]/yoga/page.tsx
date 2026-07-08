"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Import regional custom layout components
import BatchCardsGrid from "./components/BatchcardsGrid"
import AttendanceTable from "./components/AttendanceTable"

// Mock sub-views for new navigations
function ScheduleView() {
    return (
        <div className="space-y-4">
            <div className="text-sm font-semibold text-foreground">
                📅 Weekly Yoga Class Schedule
            </div>
            <div className="overflow-hidden border border-[#eceff1] rounded-md bg-card shadow-xs">
                <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                        <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
                            <th className="p-2.5 pl-3">Day & Time</th>
                            <th className="p-2.5">Class / Batch</th>
                            <th className="p-2.5">Instructor</th>
                            <th className="p-2.5">Room</th>
                            <th className="p-2.5 pr-3 text-right">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
                        <tr className="hover:bg-muted/30 transition-colors">
                            <td className="p-2.5 pl-3 font-medium text-foreground">Mon, Wed, Fri — 6:00 AM</td>
                            <td className="p-2.5 text-foreground font-bold">Morning Hatha (Batch A)</td>
                            <td className="p-2.5">Priya Yoga</td>
                            <td className="p-2.5">Studio 1</td>
                            <td className="p-2.5 pr-3 text-right">60 mins</td>
                        </tr>
                        <tr className="hover:bg-muted/30 transition-colors">
                            <td className="p-2.5 pl-3 font-medium text-foreground">Tue, Thu, Sat — 6:30 PM</td>
                            <td className="p-2.5 text-foreground font-bold">Evening Vinyasa (Batch B)</td>
                            <td className="p-2.5">Anil Yoga</td>
                            <td className="p-2.5">Studio 2</td>
                            <td className="p-2.5 pr-3 text-right">60 mins</td>
                        </tr>
                        <tr className="hover:bg-muted/30 transition-colors">
                            <td className="p-2.5 pl-3 font-medium text-foreground">Sat, Sun — 8:00 AM</td>
                            <td className="p-2.5 text-foreground font-bold">Prenatal Yoga (Batch C)</td>
                            <td className="p-2.5">Dr. Meena</td>
                            <td className="p-2.5">Quiet Room</td>
                            <td className="p-2.5 pr-3 text-right">60 mins</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function StudentRosterView() {
    return (
        <div className="space-y-4">
            <div className="text-sm font-semibold text-foreground">
                👥 Enrolled Yoga Students Roster
            </div>
            <div className="overflow-hidden border border-[#eceff1] rounded-md bg-card shadow-xs">
                <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                        <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
                            <th className="p-2.5 pl-3">Student Name</th>
                            <th className="p-2.5">Mobile</th>
                            <th className="p-2.5">Membership</th>
                            <th className="p-2.5">Classes Remaining</th>
                            <th className="p-2.5 pr-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
                        <tr className="hover:bg-muted/30 transition-colors">
                            <td className="p-2.5 pl-3 font-bold text-foreground">Kavita Sharma</td>
                            <td className="p-2.5">+91 98xxx</td>
                            <td className="p-2.5">Monthly</td>
                            <td className="p-2.5 text-foreground">8 left</td>
                            <td className="p-2.5 pr-3 text-right"><span className="px-1.5 py-0.5 rounded-full text-[9px] bg-green-100 text-green-800 font-semibold">Active</span></td>
                        </tr>
                        <tr className="hover:bg-muted/30 transition-colors">
                            <td className="p-2.5 pl-3 font-bold text-foreground">Anita Mehta</td>
                            <td className="p-2.5">+91 90xxx</td>
                            <td className="p-2.5">3-Month</td>
                            <td className="p-2.5 text-foreground">22 left</td>
                            <td className="p-2.5 pr-3 text-right"><span className="px-1.5 py-0.5 rounded-full text-[9px] bg-green-100 text-green-800 font-semibold">Active</span></td>
                        </tr>
                        <tr className="hover:bg-muted/30 transition-colors">
                            <td className="p-2.5 pl-3 font-bold text-foreground text-destructive">Sunita Rao</td>
                            <td className="p-2.5">+91 97xxx</td>
                            <td className="p-2.5">10-Class Pack</td>
                            <td className="p-2.5 text-destructive font-bold">3 left ⚠️</td>
                            <td className="p-2.5 pr-3 text-right"><span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-800 font-semibold">Renewal Due</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function YogaManagementPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    // Control tabs configuration matching requirements blueprint
    const [activeTab, setActiveTab] = React.useState<"batches" | "schedule" | "roster" | "attendance">("batches")

    return (
        <div className="flex-1 p-6 space-y-6">
            <div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40" 
                    onClick={() => router.push(`/c/${company}/patient-management/patients`)}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Patients
                </Button>
            </div>
            
            <Card className="max-w-7xl mx-auto border border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center border-b pb-4 gap-3">
                    <div className="h-10 w-10 bg-[#8e44ad]/10 text-[#8e44ad] flex items-center justify-center rounded-md shrink-0 text-lg shadow-2xs">
                        🧘
                    </div>
                    <div>
                        <CardTitle className="text-lg">Yoga Studio Management</CardTitle>
                        <CardDescription>Class planning, dynamic batch schedules, student tracking rosters, curriculum libraries</CardDescription>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-4 space-y-4">
                    {/* Navigation Menu Tabs Strip */}
                    <div className="flex border-b border-border text-xs font-medium">
                        <button 
                            type="button" 
                            onClick={() => setActiveTab("batches")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors cursor-pointer ${
                                activeTab === "batches" 
                                ? "border-[#8e44ad] text-[#8e44ad]" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Active Batches
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setActiveTab("schedule")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors cursor-pointer ${
                                activeTab === "schedule" 
                                ? "border-[#8e44ad] text-[#8e44ad]" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Schedule
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setActiveTab("roster")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors cursor-pointer ${
                                activeTab === "roster" 
                                ? "border-[#8e44ad] text-[#8e44ad]" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Student Roster
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setActiveTab("attendance")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors cursor-pointer ${
                                activeTab === "attendance" 
                                ? "border-[#8e44ad] text-[#8e44ad]" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Attendance
                        </button>
                    </div>

                    {/* Rendering panels depending on select filters */}
                    <div className="pt-2">
                        {activeTab === "batches" && <BatchCardsGrid />}
                        {activeTab === "schedule" && <ScheduleView />}
                        {activeTab === "roster" && <StudentRosterView />}
                        {activeTab === "attendance" && <AttendanceTable />}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
