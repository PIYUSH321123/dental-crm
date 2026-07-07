import * as React from "react"
import { ClinicalData } from "../../clinical-data-helper"

interface PhysicalTestingProps {
    clinicalData?: ClinicalData
}

export default function PhysicalTesting({ clinicalData }: PhysicalTestingProps) {
    const inputClasses = "w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded-[5px] text-slate-600 bg-white focus:outline-none focus:border-[#1a6eb5] transition-colors"

    const diagnosis = clinicalData?.diagnosis ?? "Knee OA (Kellgren-Lawrence Grade II)"
    
    // Derived values
    let flexion = "95°"
    let extensionLabel = "ROM — Extension"
    let extensionValue = "-5°"
    let extensionPlaceholder = "Normal: 0°"
    let strengthText = (
        <div className="flex gap-4 p-2 bg-[#eceff1] border border-slate-200 rounded-md text-[10px] font-medium justify-around text-slate-600">
            <span>Quads: <b className="text-[#1a6eb5]">3+/5</b></span>
            <span>Hams: <b className="text-[#1a6eb5]">4/5</b></span>
            <span>Calves: <b className="text-[#1a6eb5]">4/5</b></span>
        </div>
    )
    let swelling = "Grade 1 – Mild"
    let specialTests = "Patellar Grinding: +ve, Joint line tenderness: medial"
    let posture = "Mild valgus deformity, antalgic gait"

    if (diagnosis.includes("Shoulder") || diagnosis.includes("Capsulitis")) {
        flexion = "95°"
        extensionLabel = "ROM — Abduction"
        extensionValue = "85°"
        extensionPlaceholder = "Normal: 180°"
        strengthText = (
            <div className="flex gap-4 p-2 bg-[#eceff1] border border-slate-200 rounded-md text-[10px] font-medium justify-around text-slate-600">
                <span>Deltoid: <b className="text-[#1a6eb5]">4/5</b></span>
                <span>Rotator Cuff: <b className="text-[#1a6eb5]">3+/5</b></span>
                <span>Traps: <b className="text-[#1a6eb5]">4/5</b></span>
            </div>
        )
        swelling = "Grade 0 – None"
        specialTests = "Neer's Test: +ve, Hawkins-Kennedy: +ve"
        posture = "Scapular dyskinesia, rounded shoulder posture"
    } else if (diagnosis.includes("ACL") || diagnosis.includes("Sports Knee")) {
        flexion = "125°"
        extensionLabel = "ROM — Extension"
        extensionValue = "0°"
        extensionPlaceholder = "Normal: 0°"
        strengthText = (
            <div className="flex gap-4 p-2 bg-[#eceff1] border border-slate-200 rounded-md text-[10px] font-medium justify-around text-slate-600">
                <span>Quads: <b className="text-[#1a6eb5]">4-/5</b></span>
                <span>Hams: <b className="text-[#1a6eb5]">4/5</b></span>
                <span>Calves: <b className="text-[#1a6eb5]">4+/5</b></span>
            </div>
        )
        swelling = "Grade 1 – Mild"
        specialTests = "Lachman: +ve (Grade 1), Anterior Drawer: +ve"
        posture = "Quadriceps lag present, symmetrical gait with brace"
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-3 font-sans h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase">
                PHYSICAL TESTING
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Range of Motion — Flexion
                </label>
                <input 
                    type="text" 
                    key={flexion}
                    defaultValue={flexion} 
                    placeholder="Normal: 135°" 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    {extensionLabel}
                </label>
                <input 
                    type="text" 
                    key={extensionValue}
                    defaultValue={extensionValue} 
                    placeholder={extensionPlaceholder} 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Muscle Strength (0–5)
                </label>
                {strengthText}
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Swelling
                </label>
                <select className={inputClasses} key={swelling} defaultValue={swelling}>
                    <option value="Grade 0 – None">Grade 0 – None</option>
                    <option value="Grade 1 – Mild">Grade 1 – Mild</option>
                    <option value="Grade 2 – Moderate">Grade 2 – Moderate</option>
                </select>
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Special Tests
                </label>
                <input 
                    type="text" 
                    key={specialTests}
                    defaultValue={specialTests} 
                    className={inputClasses}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Posture Assessment
                </label>
                <textarea 
                    className={`${inputClasses} h-10 resize-none`}
                    key={posture}
                    defaultValue={posture}
                />
            </div>
        </div>
    )
}
