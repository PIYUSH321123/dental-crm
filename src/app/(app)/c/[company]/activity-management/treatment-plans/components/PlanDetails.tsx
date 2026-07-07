import * as React from "react"
import { ClinicalData } from "../../clinical-data-helper"

interface PlanDetailsProps {
    clinicalData?: ClinicalData
}

export default function PlanDetails({ clinicalData }: PlanDetailsProps) {
    // Reusable field styles locked to light mode
    const fieldStyles = "w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded-[5px] text-slate-600 bg-white focus:outline-none focus:border-[#1a6eb5] transition-colors"
    const labelStyles = "text-[9px] text-slate-400 font-semibold uppercase tracking-wider block"

    const diagnosis = clinicalData?.diagnosis ?? "Knee OA (Kellgren-Lawrence Grade II)"
    
    let formattedGoals = "1. Reduce pain to ≤3/10 within 4 weeks.\n2. Restore full ROM.\n3. Return to normal gait."
    let therapist = "Dr. Ankita Kumar"
    let sessionsCount = 15
    let freqValue = "2x per week"

    if (diagnosis.includes("Shoulder") || diagnosis.includes("Capsulitis")) {
        formattedGoals = "1. Restore shoulder ROM to 160° flexion and abduction.\n2. Reduce night pain to ≤2/10.\n3. Return to daily light overhead activities."
        therapist = "Dr. Kavita Rao"
        sessionsCount = 10
        freqValue = "3x per week"
    } else if (diagnosis.includes("ACL") || diagnosis.includes("Sports Knee")) {
        formattedGoals = "1. Achieve full terminal extension (0°).\n2. Quad strength symmetry index ≥ 85%.\n3. Return to running drills without instability."
        therapist = "Dr. Ankita Kumar"
        sessionsCount = 10
        freqValue = "3x per week"
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3.5 font-sans">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase">
                PLAN DETAILS
            </div>

            {/* Diagnosis reference link (Disabled/Read-only) */}
            <div className="flex flex-col gap-1">
                <label className={labelStyles}>Diagnosis (from Assessment)</label>
                <input
                    type="text"
                    key={diagnosis}
                    className={`${fieldStyles} bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed`}
                    defaultValue={diagnosis}
                    readOnly
                />
            </div>

            {/* Treatment Goals text */}
            <div className="flex flex-col gap-1">
                <label className={labelStyles}>Treatment Goals</label>
                <textarea
                    className={`${fieldStyles} h-16 resize-none`}
                    key={formattedGoals}
                    defaultValue={formattedGoals}
                />
            </div>

            {/* Numerical parameters container */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Number of Sessions</label>
                    <input type="number" key={sessionsCount} className={fieldStyles} defaultValue={sessionsCount} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Session Frequency</label>
                    <select className={fieldStyles} key={freqValue} defaultValue={freqValue}>
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
                    <input type="date" className={fieldStyles} style={{ colorScheme: "light" }} defaultValue="2026-06-15" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Expected Recovery Date</label>
                    <input
                        type="date"
                        className={`${fieldStyles} bg-emerald-50 text-emerald-800 border-emerald-200`}
                        style={{ colorScheme: "light" }}
                        defaultValue="2026-08-30"
                    />
                </div>
            </div>

            {/* Context meta drops */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Assigned Therapist</label>
                    <select className={fieldStyles} key={therapist} defaultValue={therapist}>
                        <option value="Dr. Ankita Kumar">Dr. Ankita Kumar</option>
                        <option value="Dr. Kavita Rao">Dr. Kavita Rao</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Plan Status</label>
                    <select className={fieldStyles} defaultValue="Active">
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
