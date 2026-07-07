"use client"
import * as React from "react"

export default function PlanDetails() {
    // Reusable field styles supporting dark mode
    const fieldStyles = "w-full text-[11px] px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-[5px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#1a6eb5] dark:focus:border-sky-500 transition-colors"
    const labelStyles = "text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block"

    return (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg p-4 shadow-sm space-y-3.5 font-sans">
            <div className="text-[10px] font-bold text-[#1a6eb5] dark:text-sky-400 tracking-wider uppercase">
                PLAN DETAILS
            </div>

            {/* Diagnosis reference link (Disabled/Read-only) */}
            <div className="flex flex-col gap-1">
                <label className={labelStyles}>Diagnosis (from Assessment)</label>
                <input
                    type="text"
                    className={`${fieldStyles} bg-slate-100 dark:bg-slate-950/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed`}
                    defaultValue="Osteoarthritis – Left Knee Grade II"
                    readOnly
                />
            </div>

            {/* Treatment Goals text */}
            <div className="flex flex-col gap-1">
                <label className={labelStyles}>Treatment Goals</label>
                <textarea
                    className={`${fieldStyles} h-16 resize-none`}
                    defaultValue={"1. Reduce pain to ≤3/10 within 4 weeks.\n2. Restore full ROM.\n3. Return to normal gait."}
                />
            </div>

            {/* Numerical parameters container */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Number of Sessions</label>
                    <input type="number" className={fieldStyles} defaultValue={15} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Session Frequency</label>
                    <select className={fieldStyles} defaultValue="2x per week">
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
                    <input type="date" className={fieldStyles} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Expected Recovery Date</label>
                    <input
                        type="date"
                        className={`${fieldStyles} bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50`}
                    />
                </div>
            </div>

            {/* Context meta drops */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>Assigned Therapist</label>
                    <select className={fieldStyles} defaultValue="Dr. Ankita Kumar">
                        <option value="Dr. Ankita Kumar">Dr. Ankita Kumar</option>
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
