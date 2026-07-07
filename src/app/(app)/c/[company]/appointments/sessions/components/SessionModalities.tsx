"use client"
import * as React from "react"
import { ClinicalData } from "../../../activity-management/clinical-data-helper"

interface SessionModalitiesProps {
    clinicalData?: ClinicalData
}

export default function SessionModalities({ clinicalData }: SessionModalitiesProps) {
    const inputStyles = "w-full p-1.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200"

    // Derive modalities and notes based on clinicalData
    const defaultSelected = React.useMemo(() => {
        const diagnosis = clinicalData?.diagnosis ?? ""
        if (diagnosis.includes("Shoulder")) {
            return ["Hot Pack", "Ultrasound", "Manual Therapy"]
        }
        if (diagnosis.includes("ACL")) {
            return ["Ice Pack", "Manual Therapy", "TENS"]
        }
        return ["Hot Pack", "IFT", "Manual Therapy"]
    }, [clinicalData])

    const defaultManualNotes = React.useMemo(() => {
        const diagnosis = clinicalData?.diagnosis ?? ""
        if (diagnosis.includes("Shoulder")) {
            return "Grade II-III glenohumeral joint mobilization applied to restore abduction and external rotation."
        }
        if (diagnosis.includes("ACL")) {
            return "Soft tissue mobilization around patella, passive knee flexion mobilization to 125 degrees."
        }
        return "Grade III mobilization applied to patellofemoral joint"
    }, [clinicalData])

    const defaultIftParams = React.useMemo(() => {
        const diagnosis = clinicalData?.diagnosis ?? ""
        if (diagnosis.includes("Shoulder") || diagnosis.includes("ACL")) {
            return "N/A"
        }
        return "80-120Hz, 15 mins, comfortable intensity"
    }, [clinicalData])

    const [selectedModalities, setSelectedModalities] = React.useState<string[]>(defaultSelected)
    const [manualNotes, setManualNotes] = React.useState(defaultManualNotes)
    const [iftParams, setIftParams] = React.useState(defaultIftParams)

    React.useEffect(() => {
        setSelectedModalities(defaultSelected)
        setManualNotes(defaultManualNotes)
        setIftParams(defaultIftParams)
    }, [defaultSelected, defaultManualNotes, defaultIftParams])

    const handleToggleModality = (item: string) => {
        setSelectedModalities(prev => 
            prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
        )
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
                    key={iftParams}
                    defaultValue={iftParams}
                    placeholder="Frequency, duration, intensity" 
                />
            </div>

            {/* Manual Therapy Notes */}
            <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Manual Therapy Notes</label>
                <textarea 
                    className={`${inputStyles} h-[55px] resize-none`}
                    key={manualNotes}
                    defaultValue={manualNotes}
                />
            </div>
        </div>
    )
}
