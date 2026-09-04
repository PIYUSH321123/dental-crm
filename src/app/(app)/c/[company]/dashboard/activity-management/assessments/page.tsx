"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PatientSearchSelect } from "@/components/ui/patient-search-select"
import { ArrowLeft, ClipboardCheck, Sparkles } from "lucide-react"

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
    const [patientOptions, setPatientOptions] = React.useState(PATIENT_OPTIONS)

    React.useEffect(() => {
        const loadPatients = async () => {
            try {
                const res = await fetch(`/api/patients?companySlug=${company}`)
                const data = await res.json()
                if (data.success && data.patients && data.patients.length > 0) {
                    const dbOptions = data.patients.map((p: any) => ({
                        value: p.id,
                        label: `${p.name} (${p.id})`
                    }))
                    
                    // Merge DB options and hardcoded defaults (prevent duplicates)
                    const combined = [...dbOptions]
                    PATIENT_OPTIONS.forEach(opt => {
                        if (!combined.some(o => o.value === opt.value)) {
                            combined.push(opt)
                        }
                    })
                    setPatientOptions(combined)
                }
            } catch (error) {
                console.error("Error fetching dynamic patients:", error)
            }
        }
        loadPatients()
    }, [company])

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

                    {/* Page Header Banner with Gray Gradient Shades */}
                    <div className="px-4 lg:px-6 mb-2">
                        <div className="relative overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-4 md:px-6 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300">
                            <div className={`relative flex items-center gap-4 ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-xs shrink-0 border border-primary/20">
                                    <ClipboardCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                        Clinical Assessments
                                    </h1>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Initial assessment — chief complaint, diagnosis, and physical testing.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Patient Selector & Assess with AI */}
                            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="relative flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 pl-1.5">
                                        Patient:
                                    </span>
                                    <PatientSearchSelect
                                        options={patientOptions}
                                        value={activePatient}
                                        onValueChange={setActivePatient}
                                    />
                                </div>
                                
                                <Button
                                    onClick={() => router.push(`/c/${company}/dashboard/activity-management/ai-assesment?patientId=${encodeURIComponent(activePatient)}`)}
                                    className="gap-1.5 bg-purple-650 hover:bg-purple-750 text-white font-semibold text-xs px-3 h-9 shadow-sm cursor-pointer"
                                >
                                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                                    Assess with AI
                                </Button>
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