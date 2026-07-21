"use client"
import * as React from "react"
import { ClinicalData } from "../../../activity-management/clinical-data-helper"
import { PatientSession } from "./sessionInfo"

interface SessionProgressSummaryProps {
    session: PatientSession
    clinicalData?: ClinicalData
}

export default function SessionProgressSummary({ session, clinicalData }: SessionProgressSummaryProps) {
    const diagnosis = clinicalData?.diagnosis ?? ""
    
    // Calculate sessions
    const totalSessions = clinicalData?.expectedRecovery.includes("Weeks") ? 12 : 15
    const currentNum = session?.sessionNumber || 8
    const progressPercent = Math.round((currentNum / totalSessions) * 100)

    // Pain trend
    const before = session?.painBefore ?? 7
    const after = session?.painAfter ?? 4
    const diff = before - after
    const painText = `${before} → ${after} (Reduction: -${diff})`

    // ROM Trend
    let romTrend = "95° → 105° → 110°"
    if (diagnosis.includes("Shoulder")) {
        romTrend = "Abdu: 60° → 75° → 85°"
    } else if (diagnosis.includes("ACL")) {
        romTrend = "Flex: 90° → 110° → 125°"
    }

    return (
        <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded-lg p-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-[#2e7d32] font-semibold shadow-xs font-sans">
            <span className="flex items-center gap-1">📈 Overall Progress: <b className="text-slate-800 font-bold">{progressPercent}%</b></span>
            <span className="flex items-center gap-1">📉 Pain Trend: <b className="text-slate-800 font-bold">{painText}</b> <span className="text-[10px] text-[#388e3c] font-medium">{diff > 0 ? "(improving)" : "(no change)"}</span></span>
            <span className="flex items-center gap-1">🦵 ROM Trend: <b className="text-slate-800 font-bold">{romTrend}</b></span>
            <span className="flex items-center gap-1">✅ Session Number: <b className="text-slate-800 font-bold">#{currentNum} of {totalSessions}</b></span>
        </div>
    )
}
