"use client"
import * as React from "react"
import { ClinicalData } from "../../../activity-management/clinical-data-helper"

interface SessionProgressSummaryProps {
    clinicalData?: ClinicalData
    patient?: {
        sessions_attended?: number
        sessions_total?: number
    }
}

export default function SessionProgressSummary({ clinicalData, patient }: SessionProgressSummaryProps) {
    // Derive values
    const diagnosis = clinicalData?.diagnosis ?? ""
    
    let progress = "53%"
    let painTrend = "7 → 5 → 4"
    let romTrend = "95° → 105° → 110°"
    let sessionsText = "8 / 15"

    if (patient?.sessions_attended !== undefined && patient?.sessions_total !== undefined) {
        const pct = patient.sessions_total > 0 ? Math.round((patient.sessions_attended / patient.sessions_total) * 100) : 0
        progress = `${pct}%`
        sessionsText = `${patient.sessions_attended} / ${patient.sessions_total}`
    }

    if (diagnosis.includes("Shoulder")) {
        painTrend = "8 → 7 → 6"
        romTrend = "Abdu: 60° → 75° → 85°"
        if (patient?.sessions_attended === undefined) {
            progress = "50%"
            sessionsText = "5 / 10"
        }
    } else if (diagnosis.includes("ACL")) {
        painTrend = "6 → 4 → 3"
        romTrend = "Flex: 90° → 110° → 125°"
        if (patient?.sessions_attended === undefined) {
            progress = "100%"
            sessionsText = "10 / 10"
        }
    }

    return (
        <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded-lg p-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-[#2e7d32] font-semibold shadow-xs">
            <span className="flex items-center gap-1">📈 Overall Progress: <b className="text-slate-800 font-bold">{progress}</b></span>
            <span className="flex items-center gap-1">📉 Pain Trend: <b className="text-slate-800 font-bold">{painTrend}</b> <span className="text-[10px] text-[#388e3c] font-medium">(improving)</span></span>
            <span className="flex items-center gap-1">🦵 ROM: <b className="text-slate-800 font-bold">{romTrend}</b></span>
            <span className="flex items-center gap-1">✅ Sessions: <b className="text-slate-800 font-bold">{sessionsText}</b></span>
        </div>
    )
}
