"use client"
import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PatientSearchSelect } from "@/components/ui/patient-search-select"
import { ArrowLeft } from "lucide-react"

// Import custom dynamic session block parts with correct case-sensitive filenames
import SessionInfo from "./components/sessionInfo"
import SessionModalities from "./components/SessionModalities"
import SessionExercises from "./components/SessionExercise"
import SessionProgressSummary from "./components/SessionProgressSummary"
import SessionActionButtons from "./components/SessionActionBtn"

import { getPatientClinicalData } from "../../activity-management/clinical-data-helper"

const PATIENT_OPTIONS = [
    { value: "P-0142", label: "Ravi Kumar (P-0142)" },
    { value: "P-0141", label: "Meera Shah (P-0141)" },
    { value: "P-0139", label: "Arjun Singh (P-0139)" },
]

const PATIENT_NAMES: Record<string, string> = {
    "P-0142": "Ravi Kumar",
    "P-0141": "Meera Shah",
    "P-0139": "Arjun Singh",
}

const SESSION_INFO: Record<string, { sessions: string; previous: string }> = {
    "P-0142": { sessions: "Session #8 of 15", previous: "Previous Session: Jun 12 (Pain: 7 → 5 ✅)" },
    "P-0141": { sessions: "Session #5 of 10", previous: "Previous Session: Jun 14 (Pain: 8 → 6 ✅)" },
    "P-0139": { sessions: "Session #10 of 10", previous: "Previous Session: Jun 10 (Pain: 6 → 4 ✅)" },
}

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

    const patientName = PATIENT_NAMES[selectedPatientId] ?? "Ravi Kumar"
    const sessionInfoText = SESSION_INFO[selectedPatientId] ?? SESSION_INFO["P-0142"]

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                    {/* Page Header — matches lead-management pattern */}
                    <div className="px-4 lg:px-6 flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40"
                                onClick={() => router.push(`/c/${company}/patient-management/patients`)}
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Patients
                            </Button>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Session Management</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Per-session notes, pain tracking, treatment modalities used, and progress monitoring.
                        </p>
                        {/* Patient Selector — below heading */}
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs font-semibold text-muted-foreground">Patient:</span>
                            <PatientSearchSelect
                                options={PATIENT_OPTIONS}
                                value={selectedPatientId}
                                onValueChange={setSelectedPatientId}
                            />
                        </div>
                    </div>

                    {/* Session Context Bar */}
                    <div className="px-4 lg:px-6">
                        <div className="flex flex-wrap justify-between items-center text-xs gap-2 border-b border-border pb-3 text-muted-foreground">
                            <div className="text-sm font-bold text-foreground">
                                {sessionInfoText.sessions} — {patientName}
                            </div>
                            <div className="font-semibold">
                                {sessionInfoText.previous}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-4 lg:px-6 flex flex-col gap-4">
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
                    </div>
                </div>
            </div>
        </div>
    )
}
