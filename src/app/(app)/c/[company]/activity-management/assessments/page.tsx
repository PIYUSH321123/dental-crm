"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Import subcomponents
import ChiefComplaint from "./components/ChiefComplaint"
import DiagnosisArea from "./components/DiagnosisArea"
import PhysicalTesting from "./components/PhysicalTesting"
import DocumentUpload from "./components/DocumentUpload"
import ActionButtons from "./components/ActionButtons"

import { getPatientClinicalData } from "../clinical-data-helper"

export default function ClinicalAssessmentsPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const [activePatient, setActivePatient] = React.useState("Ravi Kumar (P-0142)")
    const clinicalData = React.useMemo(() => {
        return getPatientClinicalData(activePatient)
    }, [activePatient])

    return (
        <div className="flex-1 p-6 space-y-6 font-sans">
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

            {/* Browser-like Wireframe Container (Locked to Light Mode style as requested) */}
            <div className="border-2 border-slate-300 bg-slate-50 rounded-[10px] overflow-hidden max-w-[1200px] mx-auto shadow-sm transition-all duration-300">

                {/* wf-titlebar */}
                <div className="bg-[#37474f] px-3.5 py-2 flex items-center gap-1.5">
                    <span className="text-[#cfd8dc] text-[11px] font-bold tracking-[0.5px] uppercase ml-2">
                        ASSESSMENT FORM
                    </span>
                </div>

                {/* wf-content */}
                <div className="p-4">
                    {/* Header */}
                    <div className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-1.5 flex-wrap">
                        <span>🩺 Initial Assessment</span>
                        <select 
                            className="px-2 py-0.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus:outline-none font-semibold h-7 cursor-pointer"
                            value={activePatient}
                            onChange={(e) => setActivePatient(e.target.value)}
                        >
                            <option value="Ravi Kumar (P-0142)">Ravi Kumar (P-0142)</option>
                            <option value="Meera Shah (P-0141)">Meera Shah (P-0141)</option>
                            <option value="Arjun Singh (P-0139)">Arjun Singh (P-0139)</option>
                        </select>
                    </div>

                    {/* 3-Column Grid Layout for Form Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
                        <ChiefComplaint clinicalData={clinicalData} />
                        <DiagnosisArea clinicalData={clinicalData} />
                        <PhysicalTesting clinicalData={clinicalData} />
                    </div>

                    {/* Document Upload Area */}
                    <DocumentUpload />

                    {/* Action Buttons Row */}
                    <ActionButtons />
                </div>
            </div>
        </div>
    )
}