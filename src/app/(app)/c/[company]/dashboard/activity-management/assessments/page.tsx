"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PatientSearchSelect } from "@/components/ui/patient-search-select"
import { ArrowLeft, ClipboardCheck } from "lucide-react"

// Import subcomponents
import ChiefComplaint from "./components/ChiefComplaint"
import DiagnosisArea from "./components/DiagnosisArea"
import PhysicalTesting from "./components/PhysicalTesting"
import DocumentUpload from "./components/DocumentUpload"
import ActionButtons from "./components/ActionButtons"

import { getPatientClinicalData } from "../clinical-data-helper"

const PATIENT_OPTIONS = [
    { value: "Ravi Kumar (P-0142)", label: "Ravi Kumar (P-0142)" },
    { value: "Meera Shah (P-0141)", label: "Meera Shah (P-0141)" },
    { value: "Arjun Singh (P-0139)", label: "Arjun Singh (P-0139)" },
]

export default function ClinicalAssessmentsPage({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const { open, openMobile, isMobile } = useSidebar()
    const isCollapsed = !isEmbedded && (isMobile ? !openMobile : !open)

    const [activePatient, setActivePatient] = React.useState("Ravi Kumar (P-0142)")
    const clinicalData = React.useMemo(() => {
        return getPatientClinicalData(activePatient)
    }, [activePatient])

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                    {/* Back Navigation Bar */}
                    <div className={`px-4 lg:px-6 flex items-center gap-2 mb-1 ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40 text-slate-500"
                            onClick={() => router.push(`/c/${company}/dashboard/patient-management/patients`)}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Patients
                        </Button>
                    </div>

                    {/* Page Header Banner */}
                    <div className="px-4 lg:px-6 mb-2">
                        <div className="relative overflow-hidden border border-emerald-250/80 dark:border-emerald-900/30 rounded-2xl shadow-xs bg-gradient-to-r from-emerald-50 via-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 dark:bg-emerald-950/30 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className={`relative flex items-center gap-4 ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
                                <div className="p-3 bg-emerald-500 dark:bg-emerald-900 rounded-xl text-white shadow-sm">
                                    <ClipboardCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-950 to-slate-750 dark:from-slate-550 dark:to-slate-200 bg-clip-text text-transparent">
                                        Clinical Assessments
                                    </h1>
                                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                                        Initial assessment — chief complaint, diagnosis, and physical testing.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Patient Selector */}
                            <div className="relative flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 pl-1.5">
                                    Patient:
                                </span>
                                <PatientSearchSelect
                                    options={PATIENT_OPTIONS}
                                    value={activePatient}
                                    onValueChange={setActivePatient}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-4 lg:px-6 flex flex-col gap-4">
                        {/* 3-Column Assessment Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                            <ChiefComplaint clinicalData={clinicalData} />
                            <DiagnosisArea clinicalData={clinicalData} />
                            <PhysicalTesting clinicalData={clinicalData} />
                        </div>

                        {/* Document Upload */}
                        <DocumentUpload />

                        {/* Action Buttons */}
                        <ActionButtons />
                    </div>
                </div>
            </div>
        </div>
    )
}