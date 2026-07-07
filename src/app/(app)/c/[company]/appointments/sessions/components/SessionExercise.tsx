"use client"
import * as React from "react"
import { ClinicalData } from "../../../activity-management/clinical-data-helper"

interface SessionExerciseProps {
    clinicalData?: ClinicalData
}

export default function SessionExercises({ clinicalData }: SessionExerciseProps) {
    const inputStyles = "w-full p-1.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200"

    // Derive exercises based on clinicalData
    const defaultExercises = React.useMemo(() => {
        if (!clinicalData) {
            return [
                { id: 1, text: "Quad Sets — 3×15 reps", checked: true },
                { id: 2, text: "SLR — 3×12 reps", checked: true },
                { id: 3, text: "Terminal Knee Ext — 3×10", checked: false },
            ]
        }
        return clinicalData.exercises.map((ex, index) => ({
            id: ex.id,
            text: `${ex.exerciseName} — ${ex.sets}×${ex.repsOrDuration}`,
            checked: index < 2 // check the first two exercises by default
        }))
    }, [clinicalData])

    // Derive session notes
    const defaultNotes = React.useMemo(() => {
        const diagnosis = clinicalData?.diagnosis ?? ""
        if (diagnosis.includes("Shoulder")) {
            return "Good compliance. Patient reports reduced night pain, able to reach 100 degrees flexion today. ROM improving."
        }
        if (diagnosis.includes("ACL")) {
            return "Excellent compliance. Quad contraction is improving. Symmetrical weight bearing achieved during ladder drills."
        }
        return "Good compliance. Patient reports improvement in stair climbing. ROM: 110° flexion today."
    }, [clinicalData])

    const [exercises, setExercises] = React.useState(defaultExercises)
    const [notes, setNotes] = React.useState(defaultNotes)

    React.useEffect(() => {
        setExercises(defaultExercises)
        setNotes(defaultNotes)
    }, [defaultExercises, defaultNotes])

    const handleToggleExercise = (id: number) => {
        setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, checked: !ex.checked } : ex))
    }

    const handleAddExercise = () => {
        const newId = Date.now()
        setExercises(prev => [...prev, { id: newId, text: "Custom Exercise — 3×10 reps", checked: false }])
    }

    return (
        <div className="bg-white border border-slate-200 rounded-[8px] p-3 space-y-2.5 shadow-sm font-sans text-slate-800 h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase">
                EXERCISES PERFORMED
            </div>
            <div className="text-[10px] text-slate-400 -mt-1.5 font-semibold uppercase tracking-wider">
                From prescribed plan:
            </div>

            {/* Checkbox Checklist Array */}
            <div className="space-y-1">
                {exercises.map((ex) => (
                    <div 
                        key={ex.id} 
                        onClick={() => handleToggleExercise(ex.id)}
                        className="flex gap-2 items-center bg-slate-50 border border-slate-200/60 p-1.5 rounded-md text-[10px] text-slate-600 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <input 
                            type="checkbox" 
                            checked={ex.checked} 
                            onChange={() => {}} // handled by parent div onClick
                            className="accent-primary cursor-pointer h-3.5 w-3.5 border-slate-300 rounded" 
                        />
                        <span>{ex.text}</span>
                    </div>
                ))}
            </div>

            <button 
                type="button" 
                onClick={handleAddExercise}
                className="text-[10px] font-bold text-[#1a6eb5] hover:text-[#0f4a7d] bg-transparent border-none cursor-pointer text-left block transition-colors"
            >
                + Add Exercise
            </button>

            {/* Notes/Remarks */}
            <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Session Notes / Remarks</label>
                <textarea 
                    className={`${inputStyles} h-[55px] resize-none`}
                    key={notes}
                    defaultValue={notes}
                />
            </div>
        </div>
    )
}
