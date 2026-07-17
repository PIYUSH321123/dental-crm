import * as React from "react"
import { ClinicalData } from "../../clinical-data-helper"

interface DiagnosisAreaProps {
    clinicalData?: ClinicalData
}

export default function DiagnosisArea({ clinicalData }: DiagnosisAreaProps) {
    const inputClasses = "w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded-[5px] text-slate-600 bg-white focus:outline-none focus:border-[#1a6eb5] transition-colors"

    const diagnosis = clinicalData?.diagnosis ?? "Knee OA (Kellgren-Lawrence Grade II)"
    const icdCode = clinicalData?.icdCode ?? "M17.12"
    
    // Derived values
    let affectedArea = "Left Knee"
    let aggravating = "Stair climbing, prolonged standing"
    let relieving = "Rest, ice application"
    
    if (diagnosis.includes("Shoulder") || diagnosis.includes("Capsulitis")) {
        affectedArea = "Right Shoulder"
        aggravating = "Overhead movements, sleeping on affected side"
        relieving = "Rest, warm compress"
    } else if (diagnosis.includes("ACL") || diagnosis.includes("Sports Knee")) {
        affectedArea = "Left Knee"
        aggravating = "Pivoting, deep squats, prolonged walking"
        relieving = "Rest, brace application"
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-3 font-sans h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase">
                DIAGNOSIS & AREA
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Diagnosis
                </label>
                <input 
                    type="text" 
                    key={diagnosis}
                    defaultValue={diagnosis} 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Affected Area
                </label>
                <select className={inputClasses} key={affectedArea} defaultValue={affectedArea}>
                    <option value="Left Knee">Left Knee</option>
                    <option value="Right Knee">Right Knee</option>
                    <option value="Left Shoulder">Left Shoulder</option>
                    <option value="Right Shoulder">Right Shoulder</option>
                    <option value="Bilateral Knee">Bilateral Knee</option>
                </select>
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    ICD-10 Code
                </label>
                <input 
                    type="text" 
                    key={icdCode}
                    defaultValue={icdCode} 
                    placeholder="e.g. M17.12" 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Aggravating Factors
                </label>
                <textarea 
                    className={`${inputClasses} h-10 resize-none`}
                    key={aggravating}
                    defaultValue={aggravating}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Relieving Factors
                </label>
                <textarea 
                    className={`${inputClasses} h-10 resize-none`}
                    key={relieving}
                    defaultValue={relieving}
                />
            </div>
        </div>
    )
}
