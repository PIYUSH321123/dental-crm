"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"

interface SessionActionButtonsProps {
    onCancel?: () => void
    onViewCharts?: () => void
    onSaveNext?: () => void
    onSave?: () => void
}

export default function SessionActionButtons({
    onCancel,
    onViewCharts,
    onSaveNext,
    onSave
}: SessionActionButtonsProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-start pt-4 border-t border-border w-full">
            <Button 
                size="sm" 
                className="text-xs bg-primary text-white hover:bg-[#0f4a7d] cursor-pointer"
                onClick={onSave}
            >
                💾 Save Session
            </Button>
            <Button 
                size="sm" 
                className="text-xs bg-[#27ae60] text-white hover:bg-[#219653] cursor-pointer"
                onClick={onSaveNext}
            >
                💾 Save & Next Appointment
            </Button>
            <Button 
                size="sm" 
                className="text-xs border border-primary text-primary bg-transparent hover:bg-[#f0f5ff] hover:text-primary cursor-pointer transition-colors"
                onClick={onViewCharts}
            >
                📊 View Progress Chart
            </Button>
            <Button 
                size="sm" 
                className="text-xs border border-slate-300 text-slate-500 bg-transparent hover:bg-slate-50 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={onCancel}
            >
                Cancel
            </Button>
        </div>
    )
}
