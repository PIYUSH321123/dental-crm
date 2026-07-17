"use client"
import * as React from "react"

export interface PatientSession {
    id: string
    patientId: string
    sessionNumber: number
    date: string
    therapist: string
    duration: string
    painBefore: number
    painAfter: number
    selectedModalities: string[]
    iftParams: string
    manualNotes: string
    exercises: {
        id: number
        exerciseName: string
        sets: number
        repsOrDuration: string
        checked: boolean
    }[]
    notes: string
}

interface SessionInfoProps {
    session: PatientSession
    onChange: (fields: Partial<PatientSession>) => void
}

export default function SessionInfo({ session, onChange }: SessionInfoProps) {
    const inputStyles = "w-full p-1.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200"

    const beforeScore = session?.painBefore ?? 7
    const afterScore = session?.painAfter ?? 4

    return (
        <div className="bg-white border border-slate-200 rounded-[8px] p-3 space-y-2 shadow-sm font-sans text-slate-800 h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase mb-2">
                SESSION INFO
            </div>

            {/* Date & Time */}
            <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Date & Time</label>
                <input 
                    type="datetime-local" 
                    className={inputStyles} 
                    value={session?.date || ""} 
                    onChange={(e) => onChange({ date: e.target.value })}
                    style={{ colorScheme: "light" }} 
                />
            </div>

            {/* Therapist */}
            <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Therapist</label>
                <select 
                    className={inputStyles} 
                    value={session?.therapist || "Dr. Ankita Kumar"}
                    onChange={(e) => onChange({ therapist: e.target.value })}
                >
                    <option value="Dr. Ankita Kumar">Dr. Ankita Kumar</option>
                    <option value="Dr. Kavita Rao">Dr. Kavita Rao</option>
                    <option value="Dr. Rahul Sharma">Dr. Rahul Sharma</option>
                </select>
            </div>

            {/* Duration */}
            <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Duration (mins)</label>
                <input 
                    type="text" 
                    className={inputStyles} 
                    value={session?.duration || "45"} 
                    onChange={(e) => onChange({ duration: e.target.value })}
                />
            </div>

            {/* Pain Score BEFORE */}
            <div className="space-y-1 pt-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Pain Score BEFORE</label>
                <div className="flex gap-1.5 flex-wrap mt-0.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                        const isSelected = score === beforeScore
                        return (
                            <div
                                key={score}
                                onClick={() => onChange({ painBefore: score })}
                                className={`w-[22px] h-[22px] rounded-full text-[9px] flex items-center justify-center cursor-pointer transition-all duration-150 ${
                                    isSelected 
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

            {/* Pain Score AFTER */}
            <div className="space-y-1 pt-0.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Pain Score AFTER</label>
                <div className="flex gap-1.5 flex-wrap mt-0.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                        const isSelected = score === afterScore
                        return (
                            <div
                                key={score}
                                onClick={() => onChange({ painAfter: score })}
                                className={`w-[22px] h-[22px] rounded-full text-[9px] flex items-center justify-center cursor-pointer transition-all duration-150 ${
                                    isSelected 
                                    ? "bg-[#27ae60] text-white font-bold shadow-sm shadow-green-500/20" 
                                    : "bg-[#eceff1] text-[#27ae60] font-semibold hover:bg-slate-200"
                                }`}
                            >
                                {score}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
