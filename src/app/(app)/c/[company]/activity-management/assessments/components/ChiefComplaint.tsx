import * as React from "react"
import { ClinicalData } from "../../clinical-data-helper"

interface ChiefComplaintProps {
    clinicalData?: ClinicalData
}

export default function ChiefComplaint({ clinicalData }: ChiefComplaintProps) {
    const complaint = clinicalData?.primaryComplaint ?? "Pain in left knee while walking and climbing stairs"
    const scoreVal = clinicalData?.painScore ?? 7
    const duration = clinicalData?.painDuration ?? "1–6 months"
    const pType = clinicalData?.painType ?? "Dull Ache"

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-3 font-sans h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase">
                CHIEF COMPLAINT
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Primary Complaint
                </label>
                <textarea 
                    className="w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded-[5px] text-slate-600 bg-white focus:outline-none focus:border-[#1a6eb5] transition-colors h-14 resize-none"
                    key={complaint}
                    defaultValue={complaint} 
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Pain Score (0–10)
                </label>
                <div className="flex gap-1 flex-wrap mt-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                        const isActive = score === scoreVal
                        return (
                            <div 
                                key={score}
                                className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] cursor-pointer transition-colors ${
                                    isActive 
                                    ? "bg-[#e67e22] text-white font-bold shadow-sm shadow-orange-500/20" 
                                    : "bg-[#eceff1] text-slate-600 font-semibold hover:bg-slate-200"
                                }`}
                            >
                                {score}
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Pain Duration
                </label>
                <select 
                    className="w-full text-[11px] px-2 py-1.5 border border-slate-300 rounded-[5px] text-slate-600 bg-white focus:outline-none focus:border-[#1a6eb5] transition-colors"
                    value={duration}
                    onChange={() => {}}
                >
                    <option value="< 1 week">&lt; 1 week</option>
                    <option value="1–4 weeks">1–4 weeks</option>
                    <option value="1–6 months">1–6 months</option>
                    <option value="> 6 months">&gt; 6 months</option>
                </select>
            </div>
            
            <div className="flex flex-col gap-1 mt-1.5">
                <label className="text-[9px] text-slate-400 font-semibold uppercase">
                    Pain Type
                </label>
                <div className="flex gap-1 flex-wrap mt-1">
                    {["Dull Ache", "Sharp", "Burning", "Throbbing"].map((type) => {
                        const isActive = type === pType
                        return (
                            <span 
                                key={type}
                                className={`px-2 py-0.5 rounded-[10px] text-[9px] cursor-pointer transition-all hover:scale-105 ${
                                    isActive 
                                    ? "bg-[#1a6eb5] text-white font-semibold" 
                                    : "bg-[#e3f2fd] text-[#1a6eb5] font-medium"
                                }`}
                            >
                                {type}
                            </span>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}