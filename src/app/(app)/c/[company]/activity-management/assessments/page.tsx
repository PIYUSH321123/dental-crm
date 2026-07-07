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

export default function ClinicalAssessmentsPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

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

            {/* Browser-like Wireframe Container (Fully responsive & supports Dark Mode) */}
            <div className="border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-[10px] overflow-hidden max-w-[1200px] mx-auto shadow-sm transition-all duration-300">

                {/* wf-titlebar */}
                <div className="bg-[#37474f] dark:bg-slate-800 px-3.5 py-2 flex items-center gap-1.5">
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef5350" }} />
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffca28" }} />
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#66bb6a" }} />
                    <span className="text-[#cfd8dc] dark:text-slate-300 text-[11px] font-bold tracking-[0.5px] uppercase ml-2">
                        ASSESSMENT FORM
                    </span>
                </div>

                {/* wf-content */}
                <div className="p-4">
                    {/* Header */}
                    <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mb-3">
                        🩺 Initial Assessment — Ravi Kumar (P-0142)
                    </div>

                    {/* 3-Column Grid Layout for Form Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
                        <ChiefComplaint />
                        <DiagnosisArea />
                        <PhysicalTesting />
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