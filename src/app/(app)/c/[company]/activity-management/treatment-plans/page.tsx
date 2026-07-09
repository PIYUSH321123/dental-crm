"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PatientSearchSelect } from "@/components/ui/patient-search-select"
import { ArrowLeft, Plus, History } from "lucide-react"

// Import custom folder layout blocks
import PlanDetails from "./components/PlanDetails"
import TherapyAndPhases from "./components/TheapyAndPhases"
import PlanActionBtns from "./components/PlanActionBtns"

import { getPatientClinicalData } from "../clinical-data-helper"

const PATIENT_OPTIONS = [
    { value: "Ravi Kumar (P-0142)", label: "Ravi Kumar (P-0142)" },
    { value: "Meera Shah (P-0141)", label: "Meera Shah (P-0141)" },
    { value: "Arjun Singh (P-0139)", label: "Arjun Singh (P-0139)" },
]

export default function TreatmentPlansPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const [activePatient, setActivePatient] = React.useState("Ravi Kumar (P-0142)")
    const clinicalData = React.useMemo(() => {
        return getPatientClinicalData(activePatient)
    }, [activePatient])

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                    {/* Page Header — matches lead-management pattern */}
                    <div className="px-4 lg:px-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex flex-col gap-1">
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
                            <h1 className="text-2xl font-bold tracking-tight">Treatment Plan Management</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Goal setting, therapy types, session planning, and expected recovery timeline.
                            </p>
                            {/* Patient Selector — below heading */}
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-xs font-semibold text-muted-foreground">Patient:</span>
                                <PatientSearchSelect
                                    options={PATIENT_OPTIONS}
                                    value={activePatient}
                                    onValueChange={setActivePatient}
                                />
                            </div>
                        </div>

                        {/* Action buttons — top-right */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                                <History className="h-3.5 w-3.5" /> Previous Plans
                            </Button>
                            <Button size="sm" className="h-8 text-xs gap-1.5">
                                <Plus className="h-3.5 w-3.5" /> New Plan
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-4 lg:px-6 flex flex-col gap-4">
                        {/* Master 2-Column Side-by-Side Configuration layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <PlanDetails clinicalData={clinicalData} />
                            <TherapyAndPhases clinicalData={clinicalData} />
                        </div>

                        {/* Footer Operations Row Component */}
                        <PlanActionBtns />
                    </div>
                </div>
            </div>
        </div>
    )
}
