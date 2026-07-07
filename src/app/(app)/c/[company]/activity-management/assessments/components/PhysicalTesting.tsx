import * as React from "react"

export default function PhysicalTesting() {
    const inputClasses = "w-full text-[11px] px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-[5px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#1a6eb5] dark:focus:border-sky-500 transition-colors"

    return (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg p-3 shadow-sm space-y-3 font-sans h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] dark:text-sky-400 tracking-wider uppercase">
                PHYSICAL TESTING
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Range of Motion — Flexion
                </label>
                <input 
                    type="text" 
                    defaultValue="95°" 
                    placeholder="Normal: 135°" 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    ROM — Extension
                </label>
                <input 
                    type="text" 
                    defaultValue="-5°" 
                    placeholder="Normal: 0°" 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Muscle Strength (0–5)
                </label>
                <div className="flex gap-4 p-2 bg-[#eceff1] dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md text-[10px] font-medium justify-around text-slate-600 dark:text-slate-300">
                    <span>Quads: <b className="text-[#1a6eb5] dark:text-sky-400">3/5</b></span>
                    <span>Hams: <b className="text-[#1a6eb5] dark:text-sky-400">4/5</b></span>
                    <span>Calves: <b className="text-[#1a6eb5] dark:text-sky-400">4/5</b></span>
                </div>
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Swelling
                </label>
                <select className={inputClasses} defaultValue="Grade 1 – Mild">
                    <option value="Grade 1 – Mild">Grade 1 – Mild</option>
                </select>
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Special Tests
                </label>
                <input 
                    type="text" 
                    defaultValue="McMurray: –ve, Lachman: –ve" 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Posture Assessment
                </label>
                <textarea 
                    className={`${inputClasses} h-8 resize-none`}
                    defaultValue="Mild valgus deformity, antalgic gait"
                />
            </div>
        </div>
    )
}
