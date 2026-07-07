"use client"

import * as React from "react"
import { Check, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { ClinicalData } from "../../clinical-data-helper"

export interface Phase {
  id: string
  name: string
  sessions: string
  focus: string
}

export interface TherapyAndPhasesProps {
  /** Optional external state for selected therapies */
  selectedTherapies?: string[]
  /** Optional callback when selected therapies change */
  onChangeTherapies?: (therapies: string[]) => void
  /** Optional external state for phases list */
  phases?: Phase[]
  /** Optional callback when phases list changes */
  onChangePhases?: (phases: Phase[]) => void
  /** Optional custom class name for the wrapper container */
  className?: string
  /** Optional clinicalData to load patient-specific phases */
  clinicalData?: ClinicalData
}

const DEFAULT_THERAPIES = [
  "Manual Therapy",
  "Exercise Therapy",
  "Electrotherapy",
  "Dry Needling",
  "Thermotherapy",
  "Taping / Strapping",
  "Hydrotherapy",
  "Rehabilitation",
]

const DEFAULT_PHASES: Phase[] = [
  { id: "1", name: "Phase 1", sessions: "1–5", focus: "Pain relief, reduce swelling" },
  { id: "2", name: "Phase 2", sessions: "6–10", focus: "ROM restoration, strengthening" },
  { id: "3", name: "Phase 3", sessions: "11–15", focus: "Functional rehab, gait training" },
]

export default function TherapyAndPhases({
  selectedTherapies: externalSelectedTherapies,
  onChangeTherapies,
  phases: externalPhases,
  onChangePhases,
  className,
  clinicalData,
}: TherapyAndPhasesProps) {
  // Derived default phases from clinicalData
  const defaultPhasesFromData = React.useMemo(() => {
    if (!clinicalData) return DEFAULT_PHASES
    return clinicalData.phases.map((phase, idx) => ({
      id: String(idx + 1),
      name: phase.name,
      sessions: phase.duration,
      focus: idx === 0 ? "Initial recovery focus" : idx === 1 ? "Intermediate strengthening" : "Functional integration"
    }))
  }, [clinicalData])

  // Use state internally if no external controls are provided
  const [internalSelectedTherapies, setInternalSelectedTherapies] = React.useState<string[]>([
    "Manual Therapy",
    "Exercise Therapy",
    "Thermotherapy",
  ])

  const [internalPhases, setInternalPhases] = React.useState<Phase[]>(DEFAULT_PHASES)

  React.useEffect(() => {
    setInternalPhases(defaultPhasesFromData)
  }, [defaultPhasesFromData])

  const selectedList = externalSelectedTherapies !== undefined ? externalSelectedTherapies : internalSelectedTherapies
  const phaseList = externalPhases !== undefined ? externalPhases : internalPhases

  // Handler for therapy multi-select
  const handleToggleTherapy = (therapy: string) => {
    let updatedList: string[]
    if (selectedList.includes(therapy)) {
      updatedList = selectedList.filter((item) => item !== therapy)
    } else {
      updatedList = [...selectedList, therapy]
    }

    if (onChangeTherapies) {
      onChangeTherapies(updatedList)
    } else {
      setInternalSelectedTherapies(updatedList)
    }
  }

  // Handler to update specific phase field
  const handleUpdatePhase = (id: string, field: keyof Phase, value: string) => {
    const updatedPhases = phaseList.map((phase) => {
      if (phase.id === id) {
        return { ...phase, [field]: value }
      }
      return phase
    })

    if (onChangePhases) {
      onChangePhases(updatedPhases)
    } else {
      setInternalPhases(updatedPhases)
    }
  }

  // Handler to add a new phase row
  const handleAddPhase = () => {
    const nextNum = phaseList.length + 1
    const newPhase: Phase = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Phase ${nextNum}`,
      sessions: `${(nextNum - 1) * 5 + 1}–${nextNum * 5}`,
      focus: "New milestone focus",
    }
    const updatedPhases = [...phaseList, newPhase]

    if (onChangePhases) {
      onChangePhases(updatedPhases)
    } else {
      setInternalPhases(updatedPhases)
    }
  }

  // Handler to delete a phase row
  const handleDeletePhase = (id: string) => {
    const updatedPhases = phaseList.filter((phase) => phase.id !== id)
    // Reindex Phase numbers for consistency if they follow the default naming pattern
    const reindexedPhases = updatedPhases.map((phase, idx) => {
      if (phase.name.startsWith("Phase ")) {
        return { ...phase, name: `Phase ${idx + 1}` }
      }
      return phase
    })

    if (onChangePhases) {
      onChangePhases(reindexedPhases)
    } else {
      setInternalPhases(reindexedPhases)
    }
  }

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm font-sans transition-all duration-200",
        className
      )}
    >
      {/* THERAPY TYPES Section */}
      <div>
        <div className="text-[9px] font-bold text-[#1a6eb5] tracking-wider uppercase mb-2.5">
          THERAPY TYPES (Multi-select)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_THERAPIES.map((type) => {
            const isSelected = selectedList.includes(type)
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleToggleTherapy(type)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all duration-150 flex items-center gap-1 active:scale-95 border",
                  isSelected
                    ? "bg-[#1a6eb5] text-white border-transparent shadow-sm"
                    : "bg-[#e3f2fd] text-[#1a6eb5] border-transparent hover:bg-[#d0e8ff]"
                )}
              >
                {isSelected && <Check className="h-3 w-3 animate-in fade-in zoom-in-75 duration-200" />}
                {type}
              </button>
            )
          })}
        </div>
      </div>

      {/* PHASE PLANNING Section */}
      <div className="pt-3 border-t border-slate-100">
        <div className="text-[9px] font-bold text-[#1a6eb5] tracking-wider uppercase mb-2.5">
          PHASE PLANNING
        </div>
        <div className="overflow-hidden border border-slate-100 rounded-md shadow-inner bg-slate-50/50">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-[#37474f] text-white text-[9px] uppercase tracking-wider">
                <th className="p-2 pl-3 w-1/4">Phase</th>
                <th className="p-2 w-1/4">Sessions</th>
                <th className="p-2 w-5/12">Focus</th>
                <th className="p-2 w-1/12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {phaseList.map((phase) => (
                <tr
                  key={phase.id}
                  className="group hover:bg-slate-50 transition-colors duration-150"
                >
                  {/* Phase name cell */}
                  <td className="p-1 pl-3 font-semibold text-slate-800">
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => handleUpdatePhase(phase.id, "name", e.target.value)}
                      className="w-full bg-transparent border-none text-[11px] font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 rounded px-1.5 py-0.5 transition-colors"
                      placeholder="Phase name"
                    />
                  </td>
                  {/* Sessions range cell */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={phase.sessions}
                      onChange={(e) => handleUpdatePhase(phase.id, "sessions", e.target.value)}
                      className="w-full bg-transparent border-none text-[11px] text-slate-600 focus:outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 rounded px-1.5 py-0.5 transition-colors"
                      placeholder="Sessions range"
                    />
                  </td>
                  {/* Focus cell */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={phase.focus}
                      onChange={(e) => handleUpdatePhase(phase.id, "focus", e.target.value)}
                      className="w-full bg-transparent border-none text-[11px] text-slate-600 focus:outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 rounded px-1.5 py-0.5 transition-colors"
                      placeholder="Phase focus description"
                    />
                  </td>
                  {/* Delete row button cell */}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeletePhase(phase.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none cursor-pointer"
                      title="Delete phase"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={handleAddPhase}
          className="mt-2.5 text-xs font-semibold text-[#1a6eb5] hover:text-[#0f4a7d] bg-transparent border-none cursor-pointer flex items-center gap-1 transition-all duration-150 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Phase
        </button>
      </div>
    </div>
  )
}
