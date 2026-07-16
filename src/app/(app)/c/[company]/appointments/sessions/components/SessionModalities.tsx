"use client"
import * as React from "react"
import { PatientSession } from "./sessionInfo"

interface SessionModalitiesProps {
    session: PatientSession
    onChange: (fields: Partial<PatientSession>) => void
}

export default function SessionModalities({ session, onChange }: SessionModalitiesProps) {
    const inputStyles = "w-full p-1.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200"

    const selectedModalities = session?.selectedModalities || []

    const handleToggleModality = (item: string) => {
        const updated = selectedModalities.includes(item) 
            ? selectedModalities.filter(x => x !== item) 
            : [...selectedModalities, item]
        onChange({ selectedModalities: updated })
    }

    return (
        <div className="bg-white border border-slate-200 rounded-[8px] p-3 space-y-3 shadow-sm font-sans text-slate-800 h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase mb-1">
                MODALITIES USED
            </div>

            {/* Multi-select Badges */}
            <div className="flex flex-wrap gap-1.5">
                {["Hot Pack", "IFT", "Manual Therapy", "Ultrasound", "TENS", "Taping", "Ice Pack"].map((item) => {
                    const isSelected = selectedModalities.includes(item)
                    return (
                        <span
                            key={item}
                            onClick={() => handleToggleModality(item)}
                            className={`px-2.5 py-0.5 rounded-[10px] text-[9px] font-semibold cursor-pointer transition-all duration-150 active:scale-95 border ${
                                isSelected
                                ? "bg-[#1a6eb5] text-white border-transparent shadow-sm"
                                : "bg-[#e3f2fd] text-[#1a6eb5] border-transparent hover:bg-[#d0e8ff]"
                            }`}
                        >
                            {isSelected ? `✓ ${item}` : item}
                        </span>
                    )
                })}
            </div>

            {/* IFT Parameters */}
            <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">IFT Parameters</label>
                <input 
                    type="text" 
                    className={inputStyles} 
                    value={session?.iftParams || ""}
                    onChange={(e) => onChange({ iftParams: e.target.value })}
                    placeholder="Frequency, duration, intensity" 
                />
            </div>

            {/* Manual Therapy Notes */}
            <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Manual Therapy Notes</label>
                <textarea 
                    className={`${inputStyles} h-[55px] resize-none`}
                    value={session?.manualNotes || ""}
                    onChange={(e) => onChange({ manualNotes: e.target.value })}
                />
            </div>
        </div>
    )
}
