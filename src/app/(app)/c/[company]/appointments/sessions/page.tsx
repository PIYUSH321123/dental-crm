"use client"
import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, ArrowLeft } from "lucide-react"

// Import custom dynamic session block parts with correct case-sensitive filenames
import SessionInfo from "./components/sessionInfo"
import SessionModalities from "./components/SessionModalities"
import SessionExercises from "./components/SessionExercise"
import SessionProgressSummary from "./components/SessionProgressSummary"
import SessionActionButtons from "./components/SessionActionBtn"

import { getPatientClinicalData } from "../../activity-management/clinical-data-helper"

export default function SessionManagementPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Check if patient selection is pre-filled from search query
    const scheduleFor = searchParams.get("scheduleFor")
    
    const [selectedPatientId, setSelectedPatientId] = React.useState(scheduleFor || "P-0142")

    const clinicalData = React.useMemo(() => {
        return getPatientClinicalData(selectedPatientId)
    }, [selectedPatientId])

    const patientName = React.useMemo(() => {
        if (selectedPatientId === "P-0142") return "Ravi Kumar"
        if (selectedPatientId === "P-0141") return "Meera Shah"
        if (selectedPatientId === "P-0139") return "Arjun Singh"
        return "Ravi Kumar"
    }, [selectedPatientId])

    const sessionInfoText = React.useMemo(() => {
        if (selectedPatientId === "P-0142") return { sessions: "Session #8 of 15", previous: "Previous Session: Jun 12 (Pain: 7 → 5 ✅)" }
        if (selectedPatientId === "P-0141") return { sessions: "Session #5 of 10", previous: "Previous Session: Jun 14 (Pain: 8 → 6 ✅)" }
        if (selectedPatientId === "P-0139") return { sessions: "Session #10 of 10", previous: "Previous Session: Jun 10 (Pain: 6 → 4 ✅)" }
        return { sessions: "Session #8 of 15", previous: "Previous Session: Jun 12 (Pain: 7 → 5 ✅)" }
    }, [selectedPatientId])

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
            
            <Card className="max-w-7xl mx-auto border border-slate-300 bg-slate-50 rounded-[10px] shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center border-b border-slate-200 bg-white p-4 pb-4">
                    <div className="flex items-center gap-3.5 w-full justify-between flex-wrap">
                        <div className="flex items-center gap-3.5">
                            <div className="h-10 w-10 bg-[#e3f2fd] text-[#1a6eb5] flex items-center justify-center rounded-md shrink-0">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-800">Session Management</CardTitle>
                                <CardDescription className="text-xs text-slate-500">Per-session notes, pain tracking, treatment modalities used, and progress monitoring</CardDescription>
                            </div>
                        </div>
                        
                        {/* Inline Patient Selection Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">Select Patient:</span>
                            <select 
                                className="px-2 py-0.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus:outline-none font-semibold h-7 cursor-pointer"
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                            >
                                <option value="P-0142">Ravi Kumar (P-0142)</option>
                                <option value="P-0141">Meera Shah (P-0141)</option>
                                <option value="P-0139">Arjun Singh (P-0139)</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                    {/* Header Context Tracking Row */}
                    <div className="flex flex-wrap justify-between items-center text-xs gap-2 border-b border-slate-200 pb-2 text-slate-500">
                        <div className="text-sm font-bold text-slate-700">
                            {sessionInfoText.sessions} — {patientName}
                        </div>
                        <div className="font-semibold">
                            {sessionInfoText.previous}
                        </div>
                    </div>

                    {/* Master 3-Column Work Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                        <SessionInfo clinicalData={clinicalData} />
                        <SessionModalities clinicalData={clinicalData} />
                        <SessionExercises clinicalData={clinicalData} />
                    </div>

                    {/* Dynamic Real-time Calculations Summary Bar Component */}
                    <SessionProgressSummary clinicalData={clinicalData} />

                    {/* Execution Processing Action Buttons */}
                    <SessionActionButtons />
                </CardContent>
            </Card>
        </div>
    )
}
