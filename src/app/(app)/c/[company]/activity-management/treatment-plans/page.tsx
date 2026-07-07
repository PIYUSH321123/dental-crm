"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, ArrowLeft } from "lucide-react"

// Import custom folder layout blocks
import PlanDetails from "./components/PlanDetails"
import TherapyAndPhases from "./components/TheapyAndPhases"
import PlanActionBtns from "./components/PlanActionBtns"

import { getPatientClinicalData } from "../clinical-data-helper"

export default function TreatmentPlansPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const [activePatient, setActivePatient] = React.useState("Ravi Kumar (P-0142)")
    const clinicalData = React.useMemo(() => {
        return getPatientClinicalData(activePatient)
    }, [activePatient])

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
            
            <div className="max-w-7xl mx-auto border border-slate-300 bg-slate-50 rounded-[10px] shadow-sm overflow-hidden">
                <div className="flex flex-row items-center justify-between border-b border-slate-200 bg-white p-4 pb-4">
                    <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 bg-[#e3f2fd] text-[#1a6eb5] flex items-center justify-center rounded-md shrink-0">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-slate-800">Treatment Plan Management</div>
                            <div className="text-xs text-slate-500">Goal setting, therapy types, session planning, expected recovery timeline</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs border-slate-300 text-slate-600 hover:bg-slate-50 bg-white">View Previous Plans</Button>
                        <Button size="sm" className="text-xs bg-[#27ae60] text-white hover:bg-[#219653]">+ New Plan</Button>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5 flex-wrap">
                        <span>📋 Treatment Plan</span>
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
    )
}
