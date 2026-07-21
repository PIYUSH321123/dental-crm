"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Printer, CalendarRange, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PlanActionBtnsProps {
  /** Callback when Cancel button is clicked */
  onCancel?: () => void
  /** Callback when Print Plan button is clicked */
  onPrint?: () => void
  /** Callback when Save & Schedule Sessions button is clicked */
  onSaveAndSchedule?: () => void
  /** Callback when Save Treatment Plan button is clicked */
  onSavePlan?: () => void
  /** Indicates if a save or submit operation is currently pending */
  isSaving?: boolean
  /** Indicates if a printing operation is currently pending */
  isPrinting?: boolean
  /** Disables all action buttons */
  disabled?: boolean
  /** Optional custom class name for the container */
  className?: string
}

export default function PlanActionBtns({
  onCancel,
  onPrint,
  onSaveAndSchedule,
  onSavePlan,
  isSaving = false,
  isPrinting = false,
  disabled = false,
  className,
}: PlanActionBtnsProps) {
  const isPending = isSaving || isPrinting || disabled

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2.5 justify-start pt-4 border-t border-slate-200 font-sans",
        className
      )}
    >
      {/* Save Treatment Plan Button */}
      <Button
        size="sm"
        onClick={onSavePlan}
        disabled={isPending}
        className="h-8 text-xs font-semibold bg-[#1a6eb5] hover:bg-[#155a96] text-white transition-all duration-200 active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
      >
        {isSaving ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="mr-1.5 h-3.5 w-3.5" />
        )}
        Save Treatment Plan
      </Button>

      {/* Save & Schedule Sessions Button */}
      <Button
        size="sm"
        onClick={onSaveAndSchedule}
        disabled={isPending}
        className="h-8 text-xs font-semibold bg-[#27ae60] hover:bg-[#219653] text-white transition-all duration-200 active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
      >
        {isSaving ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
        )}
        Save & Schedule Sessions
      </Button>

      {/* Print Plan Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onPrint}
        disabled={isPending}
        className="h-8 text-xs font-semibold border border-[#1a6eb5]/30 text-[#1a6eb5] bg-white hover:bg-[#f0f5ff] hover:text-[#0f4a7d] dark:border-[#1a6eb5]/30 dark:bg-white dark:text-[#1a6eb5] dark:hover:bg-[#f0f5ff] dark:hover:text-[#0f4a7d] transition-all duration-200 active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
      >
        {isPrinting ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Printer className="mr-1.5 h-3.5 w-3.5" />
        )}
        Print Plan
      </Button>

      {/* Cancel Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={isPending}
        className="h-8 text-xs font-semibold border border-slate-300 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:border-slate-300 dark:bg-white dark:text-slate-500 dark:hover:bg-slate-100 dark:hover:text-slate-750 transition-all duration-200 active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
      >
        Cancel
      </Button>
    </div>
  )
}
