"use client"
import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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
                const sorted = [...patientSess].sort((a, b) => b.sessionNumber - a.sessionNumber)
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
            .sort((a, b) => a.sessionNumber - b.sessionNumber)
    }, [sessions, selectedPatientId])

    // Current active session log
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
                            <div className="relative flex items-center gap-2.5 w-full md:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toast.info("Opening Rescheduling dialogue...")}
                                    className="flex-1 md:flex-none text-xs border-slate-300 dark:border-slate-750 font-semibold"
                                >
                                    Reschedule
                                </Button>
                                <Button
                                    size="sm"
                                    disabled={!nextSessionJoinable}
                                    onClick={handleJoinSession}
                                    className="flex-1 md:flex-none text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-550 dark:hover:bg-emerald-600 text-white font-bold transition-all shadow-xs"
                                >
                                    Join Consultation
                                </Button>
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

                        {/* TAB CONTENT: PREVIOUS SESSIONS */}
                        {activeTab === "previous" && (
                            <div className="space-y-6">

                                {/* Filters Toolbar */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search previous sessions..."
                                            className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                        <input
                                            type="date"
                                            value={filterDate}
                                            onChange={(e) => setFilterDate(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={filterTherapist}
                                            onChange={(e) => setFilterTherapist(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                                        >
                                            <option value="All">All Therapists</option>
                                            <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                                            <option value="Dr. Arjun Menon">Dr. Arjun Menon</option>
                                            <option value="Dr. Ankita Kumar">Dr. Ankita Kumar</option>
                                            <option value="Dr. Kavita Rao">Dr. Kavita Rao</option>
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                                        >
                                            <option value="Latest">Sort: Newest First</option>
                                            <option value="Oldest">Sort: Oldest First</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Sessions List */}
                                <div className="space-y-3">
                                    {filteredSessions.length > 0 ? (
                                        filteredSessions.map((session) => (
                                            <div
                                                key={session.n}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <strong className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                                Session #{session.n}
                                                            </strong>
                                                            <span className="text-[10px] font-semibold bg-emerald-105 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 px-2 py-0.5 rounded-full">
                                                                {session.status}
                                                            </span>
                                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${session.hasVideo
                                                                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-450 border border-blue-100 dark:border-blue-900"
                                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                                }`}>
                                                                {session.hasVideo ? "Video Available" : "No Media"}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2">
                                                            <span><b>Date:</b> {session.date}</span>
                                                            <span className="hidden md:inline text-slate-300">|</span>
                                                            <span><b>Patient:</b> {patientName}</span>
                                                            <span className="hidden md:inline text-slate-300">|</span>
                                                            <span><b>Duration:</b> {session.duration}</span>
                                                            <span className="hidden md:inline text-slate-300">|</span>
                                                            <span><b>Pain Before:</b> {session.before}</span>
                                                            <span className="hidden md:inline text-slate-300">|</span>
                                                            <span><b>Pain After:</b> {session.after}</span>
                                                            <span className="hidden md:inline text-slate-300">|</span>
                                                            <span><b>Therapist:</b> {session.therapist}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2 md:mt-0 flex-wrap">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setView("dashboard")
                                                                setPainBefore(session.before)
                                                                setPainAfter(session.after)
                                                                setLiveActive(false)
                                                                setVideoSource(session.hasVideo ? "Recorded" : "Offline")
                                                            }}
                                                            className="text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-850 dark:hover:bg-slate-50 font-bold"
                                                        >
                                                            View Session Info
                                                        </Button>
                                                        {session.hasVideo && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setView("dashboard")
                                                                    setPainBefore(session.before)
                                                                    setPainAfter(session.after)
                                                                    setLiveActive(false)
                                                                    setVideoSource("Recorded")
                                                                    setVideoPlaying(true)
                                                                }}
                                                                className="text-xs text-primary border-primary bg-transparent hover:bg-primary/5 font-semibold"
                                                            >
                                                                Replay Recording
                                                            </Button>
                                                        )}
                                                        <button
                                                            onClick={() => toast.info(`Notes from Session #${session.n} opened`)}
                                                            className="text-xs text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 font-semibold px-2 py-1 transition-colors"
                                                        >
                                                            Notes
                                                        </button>
                                                        <button
                                                            onClick={() => toast.info(`Session #${session.n} duplicated`)}
                                                            className="text-xs text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 font-semibold px-2 py-1 transition-colors"
                                                        >
                                                            Duplicate
                                                        </button>
                                                        <button
                                                            onClick={() => toast.success("PDF session log downloaded successfully")}
                                                            className="text-xs text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 font-semibold px-2 py-1 transition-colors"
                                                        >
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                                            No previous sessions match the selected filters.
                                        </div>
                                    )}
                                </div>

                                {/* List Footer Count */}
                                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-4">
                                    <span>Showing 1–{filteredSessions.length} of 24 sessions</span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="text-xs" disabled>Previous</Button>
                                        <Button variant="outline" size="sm" className="text-xs" disabled>Next</Button>
                                    </div>
                                </div>

                                {/* Resource Modules Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    {MODULES.slice(0, 4).map((mod) => (
                                        <div key={mod.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                                            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                                {mod.title}
                                            </h4>
                                            <ul className="space-y-2">
                                                {mod.items.map((item) => (
                                                    <li key={item} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium hover:text-primary cursor-pointer transition-colors">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: CREATE NEW SESSION */}
                        {activeTab === "create" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Broadcast Video */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="h-10 w-10 bg-primary/10 rounded-xl text-primary flex items-center justify-center mb-4">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            Broadcast Existing Video
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                                            Broadcast a previously recorded rehabilitation tutorial during a telehealth call, and watch the patient perform movements side-by-side.
                                        </p>
                                        <ol className="text-xs text-slate-505 space-y-2 mb-6 pl-4 list-decimal leading-relaxed">
                                            <li>Choose exercise video from medical library</li>
                                            <li>Preview and select specific timestamps</li>
                                            <li>Configure patient portal sharing properties</li>
                                            <li>Initialize live room and start session</li>
                                        </ol>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setView("dashboard")
                                            setLiveActive(false)
                                            setVideoSource("Recorded")
                                        }}
                                        className="w-full text-xs font-bold mt-auto"
                                    >
                                        Select and Start Session
                                    </Button>
                                </div>

                                {/* Upload & Broadcast */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                        Upload New Video & Broadcast
                                    </h3>

                                    <div
                                        className="border-2 border-dashed border-primary/20 dark:border-primary/10 rounded-xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/50 transition-colors"
                                        onClick={() => toast.info("Device file manager opened")}
                                    >
                                        <span className="text-xs text-primary font-semibold block">Drag & Drop Rehab Video</span>
                                        <span className="text-[10px] text-slate-400 block mt-1">(mp4, mov, or webm formats accepted)</span>
                                    </div>

                                    {/* Uploading progress simulator */}
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-primary h-1.5 w-2/3 animate-pulse rounded-full" />
                                    </div>

                                    <input
                                        placeholder="Video Title (e.g. Posterior Capsule Stretch)"
                                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-805 dark:text-slate-100"
                                    />
                                    <textarea
                                        placeholder="Brief clinical description or instructions..."
                                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-805 dark:text-slate-100 min-h-[60px]"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                                            <option>Category: Mobility</option>
                                            <option>Strength</option>
                                            <option>Balance</option>
                                        </select>
                                        <select className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                                            <option>Privacy: Clinical Use Only</option>
                                            <option>Share to Patient Portal</option>
                                        </select>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setView("dashboard")
                                            setLiveActive(false)
                                            setVideoSource("Uploaded")
                                        }}
                                        className="w-full text-xs font-bold"
                                    >
                                        Upload and Start
                                    </Button>
                                </div>

                                {/* Live Session */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="h-10 w-10 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-xl text-emerald-500 flex items-center justify-center mb-4">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            Real-time Consultation
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                                            Start a real-time face-to-face video consultation directly within the dashboard. Choose from pre-configured integrations.
                                        </p>

                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                            Integrated Providers
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {Object.keys(PROVIDER_DETAILS).map((p) => (
                                                <span
                                                    key={p}
                                                    onClick={() => setSelectedProvider(p)}
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-150 border ${selectedProvider === p
                                                            ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900"
                                                            : "bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-805 text-slate-600 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    {p}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs mb-4">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">{selectedProvider} Integration</span>
                                            <span className="text-[10px] text-slate-550 leading-relaxed block">
                                                {PROVIDER_DETAILS[selectedProvider]}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleStartLiveConsultation}
                                        className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold"
                                    >
                                        Start Consultation Room
                                    </Button>
                                </div>

                            </div>
                        )}
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
                                    Date: {new Date(activeSession.date).toLocaleDateString()} at {new Date(activeSession.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
