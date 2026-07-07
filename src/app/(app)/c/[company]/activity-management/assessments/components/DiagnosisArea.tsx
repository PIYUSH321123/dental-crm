import * as React from "react"

export default function DiagnosisArea() {
    const inputClasses = "w-full text-[11px] px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-[5px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#1a6eb5] dark:focus:border-sky-500 transition-colors"

    return (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg p-3 shadow-sm space-y-3 font-sans h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] dark:text-sky-400 tracking-wider uppercase">
                DIAGNOSIS & AREA
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Diagnosis
                </label>
                <input 
                    type="text" 
                    defaultValue="Osteoarthritis – Left Knee Grade II" 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Affected Area
                </label>
                <select className={inputClasses} defaultValue="Left Knee">
                    <option value="Left Knee">Left Knee</option>
                    <option value="Right Knee">Right Knee</option>
                    <option value="Bilateral Knee">Bilateral Knee</option>
                </select>
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    ICD-10 Code
                </label>
                <input 
                    type="text" 
                    defaultValue="M17.12" 
                    placeholder="e.g. M17.12" 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Aggravating Factors
                </label>
                <textarea 
                    className={`${inputClasses} h-8 resize-none`}
                    defaultValue="Stair climbing, prolonged standing"
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Relieving Factors
                </label>
                <textarea 
                    className={`${inputClasses} h-8 resize-none`}
                    defaultValue="Rest, ice application"
                />
            </div>
        </div>
    )
}
