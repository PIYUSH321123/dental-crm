"use client"
import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"

import ExerciseLibrary from "./components/ExerciseLibrary"
import PrescriptionTable from "./components/PrescriptionTable"
import SessionExercises, { SessionExercise } from "../../appointments/sessions/components/SessionExercise"
import { PatientSession } from "../../appointments/sessions/components/sessionInfo"
import { getPatientClinicalData } from "../clinical-data-helper"

const createNewBlankSession = (patientId: string, nextSessionNum: number): PatientSession => {
    const clinical = getPatientClinicalData(patientId)
    const formattedExercises = clinical.exercises.map((ex: any) => ({
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

export default function ExercisePrescriptionPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()
    const searchParams = useSearchParams()

    // Explicit tab state
    const [activeTab, setActiveTab] = React.useState<"library" | "prescription" | "performed">("library")

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

            const patientSess = parsed.filter(s => s.patientId === selectedPatientId)
            if (patientSess.length > 0) {
                const sorted = [...patientSess].sort((a, b) => b.sessionNumber - a.sessionNumber)
                setActiveSessionId(sorted[0].id)
            }
        }
    }, [selectedPatientId])

    const activePatientSessions = React.useMemo(() => {
        return sessions.filter(s => s.patientId === selectedPatientId)
            .sort((a, b) => a.sessionNumber - b.sessionNumber)
    }, [sessions, selectedPatientId])

    const activeSession = React.useMemo(() => {
        return sessions.find(s => s.id === activeSessionId) || null
    }, [sessions, activeSessionId])

    const handlePatientChange = (patientId: string) => {
        setSelectedPatientId(patientId)
        const patientSess = sessions.filter(s => s.patientId === patientId)
        if (patientSess.length > 0) {
            const sorted = [...patientSess].sort((a, b) => b.sessionNumber - a.sessionNumber)
            setActiveSessionId(sorted[0].id)
        } else {
            setActiveSessionId("")
        }
    }

    const handleAddSession = () => {
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

    const updateActiveSession = (fields: { exercises?: SessionExercise[]; notes?: string }) => {
        if (!activeSessionId) return
        const updated = sessions.map(s => {
            if (s.id === activeSessionId) {
                return { ...s, ...fields }
            }
            return s
        })
        setSessions(updated)
        localStorage.setItem("sg-patient-sessions", JSON.stringify(updated))
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
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 bg-white p-4 pb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-md shrink-0">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-slate-800 font-semibold">Exercise Prescription Module</CardTitle>
                            <CardDescription className="text-xs text-slate-500">Exercise library, patient-specific prescription, WhatsApp delivery, and exercises performed log</CardDescription>
                        </div>
                    </div>

                    {/* Conditional Header Selectors for Performed Tab */}
                    {activeTab === "performed" && (
                        <div className="flex items-center gap-2 flex-wrap">
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

                            <Button
                                size="sm"
                                onClick={handleAddSession}
                                className="h-7 text-[10px] font-semibold bg-[#27ae60] text-white hover:bg-[#219653] cursor-pointer rounded-[5px] gap-1 px-2.5"
                            >
                                <Plus className="h-3 w-3" /> Add Session
                            </Button>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                    {/* JSX tab toggle switch navigation header */}
                    <div className="flex border-b border-border text-xs font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab("library")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors ${activeTab === "library"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-[#1a6eb5]"
                                }`}
                        >
                            Exercise Library
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("prescription")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors ${activeTab === "prescription"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-[#1a6eb5]"
                                }`}
                        >
                            Patient Prescriptions
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("performed")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors ${activeTab === "performed"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-[#1a6eb5]"
                                }`}
                        >
                            Exercises Performed
                        </button>
                    </div>

                    {/* Conditional rendering depending on tab selections */}
                    <div className="pt-2">
                        {activeTab === "library" && <ExerciseLibrary />}
                        {activeTab === "prescription" && <PrescriptionTable />}
                        {activeTab === "performed" && (
                            activeSession ? (
                                <div className="max-w-2xl mx-auto">
                                    <SessionExercises
                                        exercises={activeSession.exercises}
                                        notes={activeSession.notes}
                                        onChange={updateActiveSession}
                                    />
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-semibold">
                                    No session logs found. Click "+ Add Session" to create one.
                                </div>
                            )
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
