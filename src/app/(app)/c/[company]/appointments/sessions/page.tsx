"use client"
import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"

import SessionInfo, { PatientSession } from "./components/sessionInfo"
import SessionModalities from "./components/SessionModalities"
import SessionProgressSummary from "./components/SessionProgressSummary"
import SessionActionButtons from "./components/SessionActionBtn"

import { getPatientClinicalData } from "../../activity-management/clinical-data-helper"

const defaultSessions: PatientSession[] = [
  {
    id: "SESS-P-0142-8",
    patientId: "P-0142", // Ravi Kumar
    sessionNumber: 8,
    date: "2026-06-14T10:30",
    therapist: "Dr. Ankita Kumar",
    duration: "45",
    painBefore: 7,
    painAfter: 4,
    selectedModalities: ["Hot Pack", "IFT", "Manual Therapy"],
    iftParams: "80-120Hz, 15 mins, comfortable intensity",
    manualNotes: "Grade III mobilization applied to patellofemoral joint.",
    exercises: [
      { id: 1, exerciseName: "Quad Sets", sets: 3, repsOrDuration: "15 reps", checked: true },
      { id: 2, exerciseName: "Straight Leg Raise", sets: 3, repsOrDuration: "12 reps", checked: true },
      { id: 3, exerciseName: "Hamstring Stretch", sets: 3, repsOrDuration: "30 seconds", checked: false }
    ],
    notes: "Good compliance. Patient reports improvement in stair climbing. ROM: 110° flexion today."
  },
  {
    id: "SESS-P-0141-5",
    patientId: "P-0141", // Meera Shah
    sessionNumber: 5,
    date: "2026-06-14T14:00",
    therapist: "Dr. Kavita Rao",
    duration: "45",
    painBefore: 6,
    painAfter: 3,
    selectedModalities: ["Hot Pack", "Ultrasound", "Manual Therapy"],
    iftParams: "N/A",
    manualNotes: "Grade II-III glenohumeral joint mobilization applied to restore abduction and external rotation.",
    exercises: [
      { id: 1, exerciseName: "Shoulder Pendulum", sets: 3, repsOrDuration: "2 minutes", checked: true },
      { id: 2, exerciseName: "Wall Climbs (Flexion)", sets: 3, repsOrDuration: "10 reps", checked: true },
      { id: 3, exerciseName: "Towel Stretch (Internal Rotation)", sets: 3, repsOrDuration: "30 seconds", checked: false }
    ],
    notes: "Good compliance. Patient reports reduced night pain, able to reach 100 degrees flexion today. ROM improving."
  },
  {
    id: "SESS-P-0139-10",
    patientId: "P-0139", // Arjun Singh
    sessionNumber: 10,
    date: "2026-06-14T16:30",
    therapist: "Dr. Ankita Kumar",
    duration: "60",
    painBefore: 3,
    painAfter: 1,
    selectedModalities: ["Ice Pack", "Manual Therapy", "TENS"],
    iftParams: "N/A",
    manualNotes: "Soft tissue mobilization around patella, passive knee flexion mobilization to 125 degrees.",
    exercises: [
      { id: 1, exerciseName: "Single Leg Squats", sets: 3, repsOrDuration: "12 reps", checked: true },
      { id: 2, exerciseName: "Agility Ladder Drills", sets: 3, repsOrDuration: "5 minutes", checked: true },
      { id: 3, exerciseName: "Balance Board Isometrics", sets: 3, repsOrDuration: "1 minute", checked: false }
    ],
    notes: "Excellent compliance. Quad contraction is improving. Symmetrical weight bearing achieved during ladder drills."
  }
];

const createNewBlankSession = (patientId: string, nextSessionNum: number): PatientSession => {
    const clinical = getPatientClinicalData(patientId)
    const formattedExercises = clinical.exercises.map(ex => ({
        id: ex.id,
        exerciseName: ex.exerciseName,
        sets: ex.sets,
        repsOrDuration: ex.repsOrDuration,
        checked: false
    }))
    
    return {
        id: `SESS-${patientId}-${nextSessionNum}-${Date.now().toString().slice(-4)}`,
        patientId,
        sessionNumber: nextSessionNum,
        date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
        therapist: "Dr. Ankita Kumar",
        duration: "45",
        painBefore: 5,
        painAfter: 3,
        selectedModalities: ["Manual Therapy"],
        iftParams: "N/A",
        manualNotes: "Standard passive/active ROM exercises applied.",
        exercises: formattedExercises,
        notes: "Session started. Initial assessment completed."
    }
}

export default function SessionManagementPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const scheduleFor = searchParams.get("scheduleFor")
    
    const [selectedPatientId, setSelectedPatientId] = React.useState(scheduleFor || "P-0142")
    const [sessions, setSessions] = React.useState<PatientSession[]>([])
    const [activeSessionId, setActiveSessionId] = React.useState<string>("")

    // Load sessions from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem("sg-patient-sessions")
        if (saved) {
            const parsed = JSON.parse(saved) as PatientSession[]
            setSessions(parsed)
            
            // Set initial active session for selected patient
            const patientSess = parsed.filter(s => s.patientId === selectedPatientId)
            if (patientSess.length > 0) {
                // sort descending by session number
                const sorted = [...patientSess].sort((a,b) => b.sessionNumber - a.sessionNumber)
                setActiveSessionId(sorted[0].id)
            }
        } else {
            localStorage.setItem("sg-patient-sessions", JSON.stringify(defaultSessions))
            setSessions(defaultSessions)
            const patientSess = defaultSessions.filter(s => s.patientId === selectedPatientId)
            if (patientSess.length > 0) {
                setActiveSessionId(patientSess[0].id)
            }
        }
    }, [selectedPatientId])

    const clinicalData = React.useMemo(() => {
        return getPatientClinicalData(selectedPatientId)
    }, [selectedPatientId])

    // Sessions belonging to selected patient
    const activePatientSessions = React.useMemo(() => {
        return sessions.filter(s => s.patientId === selectedPatientId)
            .sort((a,b) => a.sessionNumber - b.sessionNumber)
    }, [sessions, selectedPatientId])

    // Current active session log
    const activeSession = React.useMemo(() => {
        return sessions.find(s => s.id === activeSessionId) || null
    }, [sessions, activeSessionId])

    const handlePatientChange = (patientId: string) => {
        setSelectedPatientId(patientId)
        const patientSess = sessions.filter(s => s.patientId === patientId)
        if (patientSess.length > 0) {
            const sorted = [...patientSess].sort((a,b) => b.sessionNumber - a.sessionNumber)
            setActiveSessionId(sorted[0].id)
        } else {
            setActiveSessionId("")
        }
    }

    const handleAddSession = () => {
        // Determine next session number
        const currentMax = activePatientSessions.length > 0 
            ? Math.max(...activePatientSessions.map(s => s.sessionNumber)) 
            : 0
        const nextNum = currentMax + 1
        const newSess = createNewBlankSession(selectedPatientId, nextNum)
        
        const updated = [...sessions, newSess]
        localStorage.setItem("sg-patient-sessions", JSON.stringify(updated))
        setSessions(updated)
        setActiveSessionId(newSess.id)
        toast.success(`Created Session #${nextNum} for patient.`)
    }

    const updateActiveSession = (fields: Partial<PatientSession>) => {
        if (!activeSessionId) return
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                return { ...s, ...fields }
            }
            return s
        }))
    }

    const handleSaveSession = () => {
        localStorage.setItem("sg-patient-sessions", JSON.stringify(sessions))
        toast.success("Session log saved successfully.")
    }

    const handleSaveAndNext = () => {
        localStorage.setItem("sg-patient-sessions", JSON.stringify(sessions))
        toast.success("Session saved. Opening calendar scheduler...")
        setTimeout(() => {
            router.push(`/c/${company}/appointments`)
        }, 800)
    }

    const handleCancel = () => {
        // reload from localStorage
        const saved = localStorage.getItem("sg-patient-sessions")
        if (saved) {
            setSessions(JSON.parse(saved))
        }
        toast.info("Changes discarded.")
    }

    return (
        <div className="flex-1 p-6 space-y-6">
            <div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40 text-slate-500" 
                    onClick={() => router.push(`/c/${company}/patient-management/patients`)}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Patients
                </Button>
            </div>
            
            <Card className="max-w-7xl mx-auto border-2 border-slate-300 bg-slate-50 rounded-[10px] shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center border-b border-slate-200 bg-white p-4 pb-4">
                    <div className="flex items-center gap-3.5 w-full justify-between flex-wrap">
                        <div className="flex items-center gap-3.5">
                            <div className="h-10 w-10 bg-[#e3f2fd] text-[#1a6eb5] flex items-center justify-center rounded-md shrink-0">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-800">Session Management</CardTitle>
                                <CardDescription className="text-xs text-slate-500">Per-session notes, pain tracking, treatment modalities used, and progress monitoring</CardDescription>
                            </div>
                        </div>
                        
                        {/* Action buttons next to select */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Patient selection dropdown */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-500">Patient:</span>
                                <select 
                                    className="px-2 py-0.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus:outline-none font-semibold h-7 cursor-pointer"
                                    value={selectedPatientId}
                                    onChange={(e) => handlePatientChange(e.target.value)}
                                >
                                    <option value="P-0142">Ravi Kumar (P-0142)</option>
                                    <option value="P-0141">Meera Shah (P-0141)</option>
                                    <option value="P-0139">Arjun Singh (P-0139)</option>
                                </select>
                            </div>

                            {/* Session selection dropdown */}
                            {activePatientSessions.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-bold text-slate-500">Log:</span>
                                    <select 
                                        className="px-2 py-0.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus:outline-none font-semibold h-7 cursor-pointer"
                                        value={activeSessionId}
                                        onChange={(e) => setActiveSessionId(e.target.value)}
                                    >
                                        {activePatientSessions.map(s => (
                                            <option key={s.id} value={s.id}>Session #{s.sessionNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Add Session button */}
                            <Button 
                                size="sm" 
                                onClick={handleAddSession}
                                className="h-7 text-[10px] font-semibold bg-[#27ae60] text-white hover:bg-[#219653] cursor-pointer rounded-[5px] gap-1 px-2.5"
                            >
                                <Plus className="h-3 w-3" /> Add Session
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                    {activeSession ? (
                        <>
                            {/* Header Context Tracking Row */}
                            <div className="flex flex-wrap justify-between items-center text-xs gap-2 border-b border-slate-200 pb-2 text-slate-500">
                                <div className="text-sm font-bold text-slate-700">
                                    Session #{activeSession.sessionNumber} — {selectedPatientId === "P-0142" ? "Ravi Kumar" : selectedPatientId === "P-0141" ? "Meera Shah" : "Arjun Singh"}
                                </div>
                                <div className="font-semibold">
                                    Date: {new Date(activeSession.date).toLocaleDateString()} at {new Date(activeSession.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>

                            {/* Master 2-Column Work Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                <SessionInfo 
                                    session={activeSession} 
                                    onChange={updateActiveSession} 
                                />
                                <SessionModalities 
                                    session={activeSession} 
                                    onChange={updateActiveSession} 
                                />
                            </div>

                            {/* Dynamic Real-time Calculations Summary Bar Component */}
                            <SessionProgressSummary 
                                session={activeSession} 
                                clinicalData={clinicalData} 
                            />

                            {/* Execution Processing Action Buttons */}
                            <SessionActionButtons 
                                onSave={handleSaveSession}
                                onSaveNext={handleSaveAndNext}
                                onCancel={handleCancel}
                            />
                        </>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-semibold">
                            No session logs found. Click "+ Add Session" to create one.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
