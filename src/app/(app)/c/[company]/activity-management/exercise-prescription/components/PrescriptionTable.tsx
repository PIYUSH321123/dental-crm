"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export interface Prescription {
  id: number
  exerciseName: string
  sets: number
  repsOrDuration: string
  frequency: string
  instructions: string
  videoUrl?: string
}

export interface PrescriptionTableProps {
  patientName?: string
  patientId?: string
  lastViewedDate?: string
  onAddExercise?: (newPrescription: Omit<Prescription, 'id'>) => void
}

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    exerciseName: "Quad Sets",
    sets: 3,
    repsOrDuration: "15 reps",
    frequency: "Daily",
    instructions: "Contract quads, hold 5s",
    videoUrl: "https://example.com/video1"
  },
  {
    id: 2,
    exerciseName: "Straight Leg Raise",
    sets: 3,
    repsOrDuration: "12 reps",
    frequency: "Daily",
    instructions: "Keep knee straight",
    videoUrl: "https://example.com/video2"
  },
  {
    id: 3,
    exerciseName: "Hamstring Stretch",
    sets: 3,
    repsOrDuration: "30 seconds",
    frequency: "2x daily",
    instructions: "Gentle stretch, no pain"
  }
]

import { getPatientClinicalData } from "../../clinical-data-helper"

export default function PrescriptionTable({
  patientName = "Ravi Kumar",
  patientId = "P-0142",
  lastViewedDate = "Jun 12, 2025 at 8:30 AM",
  onAddExercise,
}: PrescriptionTableProps) {
  const [selectedPatientId, setSelectedPatientId] = React.useState(patientId)

  React.useEffect(() => {
    setSelectedPatientId(patientId)
  }, [patientId])

  const activePatientName = React.useMemo(() => {
    if (selectedPatientId === "P-0142") return "Ravi Kumar"
    if (selectedPatientId === "P-0141") return "Meera Shah"
    if (selectedPatientId === "P-0139") return "Arjun Singh"
    return patientName
  }, [selectedPatientId, patientName])

  // Derived default exercises from selectedPatientId
  const defaultExercises = React.useMemo(() => {
    const data = getPatientClinicalData(selectedPatientId)
    return data.exercises
  }, [selectedPatientId])

  // Prescription List state to enable interactive additions and removals (CRUD)
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>(defaultExercises)

  React.useEffect(() => {
    setPrescriptions(defaultExercises)
  }, [defaultExercises])
  
  // Row inline-editing state
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [editFormData, setEditFormData] = React.useState<Omit<Prescription, "id" | "exerciseName" | "videoUrl">>({
    sets: 3,
    repsOrDuration: "",
    frequency: "",
    instructions: "",
  })

  // Start inline editing
  const startEditing = React.useCallback((item: Prescription) => {
    setEditingId(item.id)
    setEditFormData({
      sets: item.sets,
      repsOrDuration: item.repsOrDuration,
      frequency: item.frequency,
      instructions: item.instructions,
    })
  }, [])

  // Cancel inline editing
  const cancelEditing = React.useCallback(() => {
    setEditingId(null)
  }, [])

  // Save inline edits
  const saveEdits = React.useCallback((id: number) => {
    setPrescriptions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              sets: Number(editFormData.sets),
              repsOrDuration: editFormData.repsOrDuration,
              frequency: editFormData.frequency,
              instructions: editFormData.instructions,
            }
          : item
      )
    )
    setEditingId(null)
  }, [editFormData])

  // Delete row item
  const deletePrescription = React.useCallback((id: number) => {
    setPrescriptions((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // Mock adding a dynamic exercise row
  const addDynamicExercise = React.useCallback(() => {
    const defaultNew: Prescription = {
      id: Date.now(),
      exerciseName: "Hip Abduction",
      sets: 3,
      repsOrDuration: "10 reps",
      frequency: "Daily",
      instructions: "Perform slowly, align back",
      videoUrl: "https://example.com/video3"
    }

    setPrescriptions((prev) => [...prev, defaultNew])
    
    // Callback notify if needed
    if (onAddExercise) {
      onAddExercise({
        exerciseName: defaultNew.exerciseName,
        sets: defaultNew.sets,
        repsOrDuration: defaultNew.repsOrDuration,
        frequency: defaultNew.frequency,
        instructions: defaultNew.instructions,
        videoUrl: defaultNew.videoUrl,
      })
    }
  }, [onAddExercise])

  // Input styles helper
  const tableInputStyles = "w-full p-1 border border-[#cfd8dc] rounded text-[11px] bg-background text-foreground focus:outline-none"

  return (
    <div className="space-y-3">
      {/* Inline Action Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
        <div className="text-sm font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
          <span>🏃 Active Prescription</span>
          <select 
            className="px-2 py-0.5 border border-slate-300 dark:border-slate-700 rounded-[5px] text-[11px] bg-background text-foreground focus:outline-none font-semibold h-7 cursor-pointer"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            <option value="P-0142">Ravi Kumar (P-0142)</option>
            <option value="P-0141">Meera Shah (P-0141)</option>
            <option value="P-0139">Arjun Singh (P-0139)</option>
          </select>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="text-xs border-[#27ae60] text-[#27ae60] hover:bg-[#e8f5e9]">
            📱 Send via WhatsApp
          </Button>
          <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
            📧 Email PDF
          </Button>
          <Button 
            size="sm" 
            className="text-xs bg-primary text-white"
            onClick={addDynamicExercise}
          >
            + Add Dynamic Exercise
          </Button>
        </div>
      </div>

      {/* Structured Prescribed Routine Flow Dataset */}
      <div className="overflow-hidden border border-[#eceff1] rounded-md">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
              <th className="p-2 pl-3">#</th>
              <th className="p-2">Exercise</th>
              <th className="p-2">Sets</th>
              <th className="p-2">Reps / Duration</th>
              <th className="p-2">Frequency</th>
              <th className="p-2">Instructions</th>
              <th className="p-2 text-center">Video</th>
              <th className="p-2 pr-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
            {prescriptions.map((item, index) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="p-2 pl-3 text-foreground font-medium">{index + 1}</td>
                <td className="p-2 text-foreground font-bold">{item.exerciseName}</td>
                
                {/* Sets Column */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      min="1"
                      className={`${tableInputStyles} w-16`}
                      value={editFormData.sets}
                      onChange={(e) => setEditFormData({ ...editFormData, sets: Number(e.target.value) })}
                    />
                  ) : (
                    item.sets
                  )}
                </td>

                {/* Reps / Duration Column */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      className={tableInputStyles}
                      value={editFormData.repsOrDuration}
                      onChange={(e) => setEditFormData({ ...editFormData, repsOrDuration: e.target.value })}
                    />
                  ) : (
                    item.repsOrDuration
                  )}
                </td>

                {/* Frequency Column */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      className={tableInputStyles}
                      value={editFormData.frequency}
                      onChange={(e) => setEditFormData({ ...editFormData, frequency: e.target.value })}
                    />
                  ) : (
                    item.frequency
                  )}
                </td>

                {/* Instructions Column */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      className={tableInputStyles}
                      value={editFormData.instructions}
                      onChange={(e) => setEditFormData({ ...editFormData, instructions: e.target.value })}
                    />
                  ) : (
                    item.instructions
                  )}
                </td>

                {/* Video Column */}
                <td className="p-2 text-center">
                  {item.videoUrl ? (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-semibold text-[#1a6eb5] hover:underline bg-transparent border-none"
                    >
                      ▶ View
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-[9px] italic">No video</span>
                  )}
                </td>

                {/* Actions Column */}
                <td className="p-2 pr-3 text-right space-x-1">
                  {editingId === item.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdits(item.id)}
                        className="text-[10px] px-1.5 py-0.5 border border-emerald-500 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="text-[10px] px-1.5 py-0.5 border border-rose-500 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(item)}
                        className="text-[10px] px-1.5 py-0.5 border rounded bg-background hover:bg-muted text-foreground cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePrescription(item.id)}
                        className="text-[10px] px-1.5 py-0.5 border border-destructive/30 rounded text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-xs text-muted-foreground">
                  No active prescriptions. Click "+ Add Dynamic Exercise" to add an exercise.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Read-only verification alert log logic footer */}
      <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded-md p-2.5 text-[11px] text-[#2e7d32] font-medium flex items-center gap-1.5">
        <span>✅ Patient last viewed exercise sheet: <b>{lastViewedDate}</b> via mobile application.</span>
      </div>
    </div>
  )
}
