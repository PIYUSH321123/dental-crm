"use client"
import * as React from "react"
import { Trash2, Plus } from "lucide-react"

export interface SessionExercise {
    id: number
    exerciseName: string
    sets: number
    repsOrDuration: string
    checked: boolean
}

interface SessionExercisesProps {
    exercises: SessionExercise[]
    notes: string
    onChange: (fields: { exercises?: SessionExercise[]; notes?: string }) => void
}

export default function SessionExercises({ exercises = [], notes = "", onChange }: SessionExercisesProps) {
    const inputStyles = "w-full p-1.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200"

    const handleToggleExercise = (id: number) => {
        const updated = exercises.map(ex => ex.id === id ? { ...ex, checked: !ex.checked } : ex)
        onChange({ exercises: updated })
    }

    const handleUpdateField = (id: number, field: keyof SessionExercise, value: any) => {
        const updated = exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
        onChange({ exercises: updated })
    }

    const handleAddExercise = () => {
        const newId = Date.now()
        const newEx: SessionExercise = { id: newId, exerciseName: "Custom Exercise", sets: 3, repsOrDuration: "10 reps", checked: false }
        onChange({ exercises: [...exercises, newEx] })
    }

    const handleDeleteExercise = (id: number) => {
        const updated = exercises.filter(ex => ex.id !== id)
        onChange({ exercises: updated })
    }

    return (
        <div className="bg-white border border-slate-200 rounded-[8px] p-3 space-y-2.5 shadow-sm font-sans text-slate-800 h-full flex flex-col justify-between">
            <div className="space-y-2">
                <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase">
                    EXERCISES PERFORMED
                </div>
                <div className="text-[10px] text-slate-400 -mt-1.5 font-semibold uppercase tracking-wider">
                    Prescribed checklist (edit inline):
                </div>

                {/* Checklist with inputs */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {exercises.map((ex) => (
                        <div 
                            key={ex.id} 
                            className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 p-2 rounded-md hover:bg-slate-100/60 transition-colors"
                        >
                            <input 
                                type="checkbox" 
                                checked={ex.checked} 
                                onChange={() => handleToggleExercise(ex.id)}
                                className="accent-primary cursor-pointer h-3.5 w-3.5 border-slate-300 rounded shrink-0" 
                            />
                            {/* Exercise Name Input */}
                            <input
                                type="text"
                                value={ex.exerciseName}
                                onChange={(e) => handleUpdateField(ex.id, "exerciseName", e.target.value)}
                                className="text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-[#1a6eb5]"
                                placeholder="Exercise name"
                            />
                            {/* Sets Input */}
                            <input
                                type="number"
                                value={ex.sets}
                                onChange={(e) => handleUpdateField(ex.id, "sets", parseInt(e.target.value) || 0)}
                                className="text-[10px] text-center text-slate-600 bg-white border border-slate-200 rounded px-1 py-0.5 w-10 focus:outline-none focus:border-[#1a6eb5] shrink-0"
                                placeholder="Sets"
                            />
                            <span className="text-[10px] text-slate-400">×</span>
                            {/* Reps Input */}
                            <input
                                type="text"
                                value={ex.repsOrDuration}
                                onChange={(e) => handleUpdateField(ex.id, "repsOrDuration", e.target.value)}
                                className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded px-1 py-0.5 w-14 focus:outline-none focus:border-[#1a6eb5] shrink-0"
                                placeholder="Reps"
                            />
                            {/* Delete button */}
                            <button
                                type="button"
                                onClick={() => handleDeleteExercise(ex.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200/50 transition-colors shrink-0 cursor-pointer"
                                title="Delete Exercise"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>

                <button 
                    type="button" 
                    onClick={handleAddExercise}
                    className="text-[10px] font-bold text-[#1a6eb5] hover:text-[#0f4a7d] bg-transparent border-none cursor-pointer text-left flex items-center gap-1 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Add Exercise
                </button>
            </div>

            {/* Notes/Remarks */}
            <div className="space-y-0.5 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Session Notes / Remarks</label>
                <textarea 
                    className={`${inputStyles} h-[55px] resize-none`}
                    value={notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    placeholder="Enter session feedback..."
                />
            </div>
        </div>
    )
}
