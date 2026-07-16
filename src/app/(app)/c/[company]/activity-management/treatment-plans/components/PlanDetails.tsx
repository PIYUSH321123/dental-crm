import * as React from "react"
import { ClinicalData } from "../../clinical-data-helper"

// Define unified type for treatment plans
export interface TreatmentPlan {
    id: string
    patientId: string
    date: string
    diagnosis: string
    goals: string
    status: "Active" | "Completed" | "Discontinued"
    expectedRecovery: string
    frequency: string
    therapyType: string
    primaryComplaint: string
    painScore: number
    painDuration: string
    painType: string
    rom: string
    strength: string
    specialTests: string
    icdCode: string
    clinicalNotes: string
    sessionsCount: number
    startDate: string
    recoveryDate: string
    therapist: string
    selectedTherapies: string[]
    phases: { id: string; name: string; sessions: string; focus: string }[]
}

interface PlanDetailsProps {
    plan?: TreatmentPlan
    onChange?: (plan: Partial<TreatmentPlan>) => void
    clinicalData?: ClinicalData
}

export default function PlanDetails({ plan, onChange, clinicalData }: PlanDetailsProps) {
    // Reusable field styles locked to light mode wireframe style
    const fieldStyles = "w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded-[5px] text-slate-600 bg-white focus:outline-none focus:border-[#1a6eb5] transition-colors"
    const labelStyles = "text-[9px] text-slate-400 font-semibold uppercase tracking-wider block"

    // Derive values dynamically based on which props are provided
    const diagnosis = plan ? (plan.diagnosis || "") : (clinicalData?.diagnosis || "Knee OA (Kellgren-Lawrence Grade II)")
    const goals = plan ? (plan.goals || "") : (clinicalData?.goals || "1. Reduce pain to ≤3/10 within 4 weeks.\n2. Restore full ROM.\n3. Return to normal gait.")
    const sessionsCount = plan ? (plan.sessionsCount || 10) : 15
    const frequency = plan ? (plan.frequency || "2x per week") : "2x per week"
    const startDate = plan ? (plan.startDate || "") : "2026-06-15"
    const recoveryDate = plan ? (plan.recoveryDate || "") : "2026-08-30"
    const therapistVal = plan ? (plan.therapist || "Dr. Ankita Kumar") : "Dr. Ankita Kumar"
    const statusVal = plan ? (plan.status || "Active") : "Active"

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3.5 font-sans">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase">
                PLAN DETAILS
            </div>

            {/* Diagnosis (Read-only if legacy/derived) */}
            <div className="flex flex-col gap-1">
                <label className={labelStyles}>Diagnosis (from Assessment)</label>
                <input
                    type="text"
                    className={`${fieldStyles} ${!onChange ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : ""}`}
                    value={diagnosis}
                    onChange={(e) => onChange && onChange({ diagnosis: e.target.value })}
                    readOnly={!onChange}
                    placeholder="Diagnosis description"
                />
            </div>

            {/* Treatment Goals text */}
            <div className="flex flex-col gap-1">
                <label className={labelStyles}>Treatment Goals</label>
                <textarea
                    className={`${fieldStyles} h-16 resize-none`}
                    value={goals}
                    onChange={(e) => onChange && onChange({ goals: e.target.value })}
                    readOnly={!onChange}
                    placeholder="Enter treatment goals..."
                />
            </div>

            {/* Numerical parameters container */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Number of Sessions</label>
                    <input 
                        type="number" 
                        className={fieldStyles} 
                        value={sessionsCount} 
                        onChange={(e) => onChange && onChange({ sessionsCount: parseInt(e.target.value) || 0 })} 
                        readOnly={!onChange}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Session Frequency</label>
                    <select 
                        className={fieldStyles} 
                        value={frequency}
                        onChange={(e) => onChange && onChange({ frequency: e.target.value })}
                        disabled={!onChange}
                    >
                        <option value="3x per week">3x per week</option>
                        <option value="2x per week">2x per week</option>
                        <option value="1x per week">1x per week</option>
                    </select>
                </div>
            </div>

            {/* Chronological calendar controls */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Plan Start Date</label>
                    <input 
                        type="date" 
                        className={fieldStyles} 
                        style={{ colorScheme: "light" }} 
                        value={startDate} 
                        onChange={(e) => onChange && onChange({ startDate: e.target.value })}
                        readOnly={!onChange}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Expected Recovery Date</label>
                    <input
                        type="date"
                        className={`${fieldStyles} bg-emerald-50 text-emerald-800 border-emerald-200`}
                        style={{ colorScheme: "light" }}
                        value={recoveryDate}
                        onChange={(e) => onChange && onChange({ recoveryDate: e.target.value })}
                        readOnly={!onChange}
                    />
                </div>
            </div>

            {/* Context meta drops */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Assigned Therapist</label>
                    <select 
                        className={fieldStyles} 
                        value={therapistVal}
                        onChange={(e) => onChange && onChange({ therapist: e.target.value })}
                        disabled={!onChange}
                    >
                        <option value="Dr. Ankita Kumar">Dr. Ankita Kumar</option>
                        <option value="Dr. Kavita Rao">Dr. Kavita Rao</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Plan Status</label>
                    <select 
                        className={fieldStyles} 
                        value={statusVal}
                        onChange={(e) => onChange && onChange({ status: e.target.value as any })}
                        disabled={!onChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Discontinued">Discontinued</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
