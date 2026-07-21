"use client"
import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PatientSearchSelect } from "@/components/ui/patient-search-select"
import { 
    ArrowLeft, Video, Play, Pause, Maximize2, VolumeX, Volume2, 
    Calendar, Clock, Check, Search, Filter, SortDesc, FileText, 
    ChevronRight, Activity, Save, Info, AlertCircle, Share2, Shield, 
    Eye, Settings, Plus, RotateCcw, Link2, ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { getPatientClinicalData } from "../../activity-management/clinical-data-helper"

// ---------------------------------------------------------------------------
// Static Patient Configurations & Data Map
// ---------------------------------------------------------------------------

const PATIENT_OPTIONS = [
    { value: "P-0142", label: "Ravi Kumar (P-0142)" },
    { value: "P-0141", label: "Meera Shah (P-0141)" },
    { value: "P-0139", label: "Arjun Singh (P-0139)" },
]

const PATIENT_NAMES: Record<string, string> = {
    "P-0142": "Ravi Kumar",
    "P-0141": "Meera Shah",
    "P-0139": "Arjun Singh",
}

const SESSION_INFO: Record<string, { sessions: string; previous: string }> = {
    "P-0142": { sessions: "Session #8 of 15", previous: "Previous Session: Jun 12 (Pain: 7 → 5 ✅)" },
    "P-0141": { sessions: "Session #5 of 10", previous: "Previous Session: Jun 14 (Pain: 8 → 6 ✅)" },
    "P-0139": { sessions: "Session #10 of 10", previous: "Previous Session: Jun 10 (Pain: 6 → 4 ✅)" },
}

interface SessionRecord {
    n: number
    date: string
    duration: string
    before: number
    after: number
    status: string
    therapist: string
    hasVideo: boolean
}

// Generate previous sessions based on patient ID to make the CRM feel alive
const getPreviousSessions = (patientId: string, patientName: string): SessionRecord[] => {
    if (patientId === "P-0141") { // Meera Shah
        return [
            { n: 4, date: "2026-07-03", duration: "45m", before: 8, after: 6, status: "Completed", therapist: "Dr. Kavita Rao", hasVideo: true },
            { n: 3, date: "2026-06-26", duration: "40m", before: 9, after: 7, status: "Completed", therapist: "Dr. Ankita Kumar", hasVideo: true },
            { n: 2, date: "2026-06-19", duration: "40m", before: 9, after: 7, status: "Completed", therapist: "Dr. Ankita Kumar", hasVideo: false },
            { n: 1, date: "2026-06-12", duration: "50m", before: 9, after: 8, status: "Completed", therapist: "Dr. Kavita Rao", hasVideo: true },
        ]
    }
    if (patientId === "P-0139") { // Arjun Singh
        return [
            { n: 9, date: "2026-07-04", duration: "45m", before: 6, after: 4, status: "Completed", therapist: "Dr. Arjun Menon", hasVideo: true },
            { n: 8, date: "2026-06-27", duration: "45m", before: 7, after: 5, status: "Completed", therapist: "Dr. Ankita Kumar", hasVideo: true },
            { n: 7, date: "2026-06-20", duration: "45m", before: 7, after: 5, status: "Completed", therapist: "Dr. Ankita Kumar", hasVideo: false },
            { n: 6, date: "2026-06-13", duration: "40m", before: 8, after: 5, status: "Completed", therapist: "Dr. Arjun Menon", hasVideo: true },
            { n: 5, date: "2026-06-06", duration: "42m", before: 8, after: 6, status: "Completed", therapist: "Dr. Arjun Menon", hasVideo: true },
        ]
    }
    // Default Ravi Kumar
    return [
        { n: 7, date: "2026-07-02", duration: "42m", before: 8, after: 5, status: "Completed", therapist: "Dr. Neha Sharma", hasVideo: true },
        { n: 6, date: "2026-06-25", duration: "40m", before: 7, after: 5, status: "Completed", therapist: "Dr. Arjun Menon", hasVideo: true },
        { n: 5, date: "2026-06-18", duration: "38m", before: 7, after: 6, status: "Completed", therapist: "Dr. Arjun Menon", hasVideo: false },
        { n: 4, date: "2026-06-11", duration: "41m", before: 8, after: 6, status: "Completed", therapist: "Dr. Neha Sharma", hasVideo: true },
        { n: 3, date: "2026-06-04", duration: "45m", before: 9, after: 7, status: "Completed", therapist: "Dr. Neha Sharma", hasVideo: true },
    ]
}

const getNextSession = (patientId: string) => {
    if (patientId === "P-0141") {
        return { dateLabel: "Tomorrow", time: "11:30 AM", therapist: "Dr. Kavita Rao" }
    }
    if (patientId === "P-0139") {
        return { dateLabel: "Today", time: "5:30 PM", therapist: "Dr. Arjun Menon" }
    }
    return { dateLabel: "Tomorrow", time: "4:00 PM", therapist: "Dr. Neha Sharma" }
}

const PROVIDER_DETAILS: Record<string, string> = {
    "Google Meet": "Create Meeting • Join Existing Meeting • Meeting Link • Invite Patient",
    Zoom: "API Integration Ready • Meeting ID • Passcode • Schedule Meeting",
    "Microsoft Teams": "Tenant Connected • Calendar Slot • Invite Patient",
    "YouTube Live": "Stream Key • Preview • Broadcast Status • Latency",
    "Custom RTMP Stream": "Server URL • Stream Key • Encoder Status",
}

const MODULES = [
    { title: "Recent Broadcasts", items: ["Gait Re-education Review · 12:42", "Balance Drill Session 6 · 10:11"] },
    { title: "Favorite Videos", items: ["Quad Activation Essentials", "Sit-to-Stand Progression"] },
    { title: "Video Categories", items: ["Mobility", "Strength", "Balance"] },
    { title: "Recently Uploaded", items: ["knee-extension-demo-v2.mp4", "session-8-intro.webm"] },
    { title: "Upload History", items: ["Apr 09 · Dr. Neha", "Apr 07 · Dr. Arjun"] },
    { title: "Live Session History", items: ["Session 8 · 00:42:14", "Session 7 · 00:39:18"] },
    { title: "Meeting History", items: ["Meet link sent · 10:12 AM", "Zoom test completed · Yesterday"] },
]

export default function SessionManagementPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()
    const searchParams = useSearchParams()

    // ---------------------------------------------------------------------------
    // States & Hooks
    // ---------------------------------------------------------------------------
    const scheduleFor = searchParams.get("scheduleFor")
    const [selectedPatientId, setSelectedPatientId] = React.useState(scheduleFor || "P-0142")

    // Layout Views
    const [view, setView] = React.useState<"workflow" | "dashboard">("workflow")
    const [activeTab, setActiveTab] = React.useState<"previous" | "create">("previous")
    const [selectedProvider, setSelectedProvider] = React.useState("Google Meet")

    // Simulators / Configs
    const [liveActive, setLiveActive] = React.useState(true)
    const [portalShare, setPortalShare] = React.useState(false)
    const [nextSessionJoinable, setNextSessionJoinable] = React.useState(true)
    const [videoPlaying, setVideoPlaying] = React.useState(false)
    const [videoMuted, setVideoMuted] = React.useState(false)
    const [videoSource, setVideoSource] = React.useState("Live")

    // Dynamic Clinical Data Fetch
    const clinicalData = React.useMemo(() => {
        return getPatientClinicalData(selectedPatientId)
    }, [selectedPatientId])

    const patientName = PATIENT_NAMES[selectedPatientId] ?? "Ravi Kumar"
    const sessionInfoText = SESSION_INFO[selectedPatientId] ?? SESSION_INFO["P-0142"]

    // Dynamic Lists & Cards
    const previousSessions = React.useMemo(() => {
        return getPreviousSessions(selectedPatientId, patientName)
    }, [selectedPatientId, patientName])

    const nextSession = React.useMemo(() => {
        return getNextSession(selectedPatientId)
    }, [selectedPatientId])

    // Workflow previous session filters
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterDate, setFilterDate] = React.useState("")
    const [filterTherapist, setFilterTherapist] = React.useState("All")
    const [sortOrder, setSortOrder] = React.useState("Latest")

    // Pain Score States (linked to patient's clinicalData on load)
    const [painBefore, setPainBefore] = React.useState(7)
    const [painAfter, setPainAfter] = React.useState(4)

    // Modalities States (linked to patient's diagnosis)
    const [selectedModalities, setSelectedModalities] = React.useState<string[]>([])
    const [manualNotes, setManualNotes] = React.useState("")
    const [iftParams, setIftParams] = React.useState("")
    const [sessionRemarks, setSessionRemarks] = React.useState("")

    // Exercises Trackers & Timers
    const [exerciseList, setExerciseList] = React.useState<{ id: number; exerciseName: string; sets: number; repsOrDuration: string; checked: boolean }[]>([])
    const [timers, setTimers] = React.useState<Record<number, { seconds: number; isRunning: boolean }>>({})
    const [timelineEvents, setTimelineEvents] = React.useState<string[]>([])

    // Initialize/sync clinical data when patient changes
    React.useEffect(() => {
        if (clinicalData) {
            setPainBefore(clinicalData.painScore)
            setPainAfter(Math.max(0, clinicalData.painScore - 3)) // Estimate improvement

            // Set Modalities default selection
            const diag = clinicalData.diagnosis
            if (diag.includes("Shoulder")) {
                setSelectedModalities(["Hot Pack", "Ultrasound", "Manual Therapy"])
                setManualNotes("Grade II-III glenohumeral joint mobilization applied to restore abduction and external rotation.")
                setIftParams("N/A")
                setSessionRemarks("Good compliance. Patient reports reduced night pain, able to reach 100 degrees flexion today. ROM improving.")
            } else if (diag.includes("ACL")) {
                setSelectedModalities(["Ice Pack", "Manual Therapy", "TENS"])
                setManualNotes("Soft tissue mobilization around patella, passive knee flexion mobilization to 125 degrees.")
                setIftParams("N/A")
                setSessionRemarks("Excellent compliance. Quad contraction is improving. Symmetrical weight bearing achieved during ladder drills.")
            } else {
                setSelectedModalities(["Hot Pack", "IFT", "Manual Therapy"])
                setManualNotes("Grade III mobilization applied to patellofemoral joint")
                setIftParams("80-120Hz, 15 mins, comfortable intensity")
                setSessionRemarks("Good compliance. Patient reports improvement in stair climbing. ROM: 110° flexion today.")
            }

            // Set Exercises
            const mappedExercises = clinicalData.exercises.map((ex, idx) => ({
                id: ex.id,
                exerciseName: ex.exerciseName,
                sets: ex.sets,
                repsOrDuration: ex.repsOrDuration,
                checked: idx < 2 // check the first two exercises by default
            }))
            setExerciseList(mappedExercises)

            // Setup default timers
            const initialTimers: Record<number, { seconds: number; isRunning: boolean }> = {}
            mappedExercises.forEach((ex, idx) => {
                initialTimers[ex.id] = {
                    seconds: idx === 0 ? 764 : idx === 1 ? 1089 : 0, // 12:44, 18:09 or 0
                    isRunning: false
                }
            })
            setTimers(initialTimers)

            // Timeline
            setTimelineEvents([
                "00:00 - Warm-up sequence started",
                `03:15 - Initiated ${mappedExercises[0]?.exerciseName || "first exercise"}`,
                `12:44 - Finished ${mappedExercises[0]?.exerciseName || "first exercise"}`,
                `14:02 - Initiated ${mappedExercises[1]?.exerciseName || "second exercise"}`,
            ])
        }
    }, [clinicalData])

    // Timer effect for exercises
    React.useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => {
                const next = { ...prev }
                let changed = false
                Object.keys(next).forEach(key => {
                    const id = Number(key)
                    if (next[id]?.isRunning) {
                        next[id] = {
                            ...next[id],
                            seconds: next[id].seconds + 1
                        }
                        changed = true
                    }
                })
                return changed ? next : prev
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const formatTimer = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60
        return [
            hrs > 0 ? String(hrs).padStart(2, "0") : null,
            String(mins).padStart(2, "0"),
            String(secs).padStart(2, "0")
        ].filter(Boolean).join(":")
    }

    // ---------------------------------------------------------------------------
    // Callbacks & Handlers
    // ---------------------------------------------------------------------------
    const startTimer = (id: number) => {
        setTimers(prev => ({
            ...prev,
            [id]: { ...prev[id], isRunning: true }
        }))
        const exName = exerciseList.find(e => e.id === id)?.exerciseName
        addTimelineEvent(`Started tracking ${exName}`)
    }

    const pauseTimer = (id: number) => {
        setTimers(prev => ({
            ...prev,
            [id]: { ...prev[id], isRunning: false }
        }))
        const exName = exerciseList.find(e => e.id === id)?.exerciseName
        addTimelineEvent(`Paused tracking ${exName} at ${formatTimer(timers[id]?.seconds || 0)}`)
    }

    const addTimelineEvent = (text: string) => {
        // Simple timestamp format based on overall session elapsed time
        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
        setTimelineEvents(prev => [...prev, `${timeStr} - ${text}`])
    }

    const toggleExerciseChecked = (id: number) => {
        setExerciseList(prev => prev.map(ex => {
            if (ex.id === id) {
                const nextChecked = !ex.checked
                if (nextChecked) {
                    toast.success(`Completed exercise: ${ex.exerciseName}`)
                    addTimelineEvent(`Checked off ${ex.exerciseName}`)
                } else {
                    addTimelineEvent(`Unchecked ${ex.exerciseName}`)
                }
                return { ...ex, checked: nextChecked }
            }
            return ex
        }))
    }

    const handleAddCustomExercise = () => {
        const newId = Date.now()
        setExerciseList(prev => [...prev, {
            id: newId,
            exerciseName: "Custom Mobilization Drill",
            sets: 3,
            repsOrDuration: "10 reps",
            checked: false
        }])
        setTimers(prev => ({
            ...prev,
            [newId]: { seconds: 0, isRunning: false }
        }))
        toast.info("Custom exercise added to current session list")
        addTimelineEvent("Added custom exercise to plan")
    }

    const toggleModality = (modality: string) => {
        setSelectedModalities(prev => {
            const exists = prev.includes(modality)
            if (exists) {
                return prev.filter(m => m !== modality)
            } else {
                toast.info(`Added modality: ${modality}`)
                return [...prev, modality]
            }
        })
    }

    const handleSaveSession = () => {
        toast.success("Active telehealth session saved successfully!", {
            description: `Pain reduction: ${painBefore} → ${painAfter}. Modalities: ${selectedModalities.join(", ")}.`
        })
        setView("workflow")
    }

    const handleSaveAndNext = () => {
        toast.success("Session saved! Transitioning to next scheduled patient...", {
            description: "Loading patient records..."
        })
        // Cycle patient
        const currentIndex = PATIENT_OPTIONS.findIndex(p => p.value === selectedPatientId)
        const nextIndex = (currentIndex + 1) % PATIENT_OPTIONS.length
        setSelectedPatientId(PATIENT_OPTIONS[nextIndex].value)
        setView("workflow")
    }

    const handleJoinSession = () => {
        toast.info("Entering live consultations stream...")
        setView("dashboard")
        setLiveActive(true)
        setVideoSource("Meet")
    }

    const handleStartLiveConsultation = () => {
        toast.success(`Creating secure broadcast session via ${selectedProvider}...`)
        setView("dashboard")
        setLiveActive(true)
        setVideoSource(selectedProvider)
    }

    // ---------------------------------------------------------------------------
    // Filtered lists
    // ---------------------------------------------------------------------------
    const filteredSessions = React.useMemo(() => {
        let result = [...previousSessions]
        
        // Therapist Filter
        if (filterTherapist !== "All") {
            result = result.filter(s => s.therapist === filterTherapist)
        }
        
        // Search Filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase()
            result = result.filter(s => 
                s.therapist.toLowerCase().includes(query) ||
                s.status.toLowerCase().includes(query) ||
                s.date.includes(query)
            )
        }

        // Date Filter
        if (filterDate !== "") {
            result = result.filter(s => s.date === filterDate)
        }

        // Sort Order
        if (sortOrder === "Latest") {
            result.sort((a, b) => b.n - a.n)
        } else {
            result.sort((a, b) => a.n - b.n)
        }

        return result
    }, [previousSessions, searchQuery, filterDate, filterTherapist, sortOrder])

    // ROM calculation summary labels based on diagnosis
    const romMetricLabel = React.useMemo(() => {
        if (clinicalData?.diagnosis.includes("Shoulder")) return "Abduction ROM"
        return "Knee Flexion ROM"
    }, [clinicalData])

    // Progress details
    const overallProgressPercent = React.useMemo(() => {
        if (selectedPatientId === "P-0141") return "50%"
        if (selectedPatientId === "P-0139") return "100%"
        return "53%"
    }, [selectedPatientId])

    const painTrendString = React.useMemo(() => {
        if (selectedPatientId === "P-0141") return "8 → 7 → 6"
        if (selectedPatientId === "P-0139") return "6 → 4 → 3"
        return "7 → 5 → 4"
    }, [selectedPatientId])

    const romTrendString = React.useMemo(() => {
        if (selectedPatientId === "P-0141") return "Abdu: 60° → 75° → 85°"
        if (selectedPatientId === "P-0139") return "Flex: 90° → 110° → 125°"
        return "Flex: 95° → 105° → 110°"
    }, [selectedPatientId])

    const sessionCountText = React.useMemo(() => {
        if (selectedPatientId === "P-0141") return "5 / 10"
        if (selectedPatientId === "P-0139") return "10 / 10"
        return "8 / 15"
    }, [selectedPatientId])

    // ---------------------------------------------------------------------------
    // Render Layouts
    // ---------------------------------------------------------------------------

    return (
        <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950 font-sans min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200">
            {/* Topbar & Breadcrumb Container */}
            <div className="px-4 lg:px-6 pt-4 flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-3 bg-white dark:bg-slate-900 shadow-xs">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1.5 pl-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                            onClick={() => router.push(`/c/${company}/dashboard/patient-management/patients`)}
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Patients
                        </Button>
                    </div>

                    {/* Simulation Bar (Within Join Window Simulator) */}
                    <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-2xs">
                        <input
                            type="checkbox"
                            id="simulate-join"
                            checked={nextSessionJoinable}
                            onChange={(e) => setNextSessionJoinable(e.target.checked)}
                            className="h-3.5 w-3.5 accent-primary cursor-pointer rounded border-slate-300"
                        />
                        <label htmlFor="simulate-join" className="cursor-pointer select-none font-semibold text-slate-600 dark:text-slate-300">
                            Simulate: Within Join Window
                        </label>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-950 to-slate-750 dark:from-slate-550 dark:to-slate-200 bg-clip-text text-transparent">
                            {view === "workflow" ? "Session Management" : "Active Session Dashboard"}
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                            {view === "workflow"
                                ? "Review previous therapy sessions or configure new tele-rehabilitation workflows."
                                : `Live tracking interface for patient clinical session: ${patientName}.`}
                        </p>
                    </div>

                    {/* Patient Search & Selector */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-850 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 pl-1.5">
                            Active Patient:
                        </span>
                        <PatientSearchSelect
                            options={PATIENT_OPTIONS}
                            value={selectedPatientId}
                            onValueChange={(val) => {
                                setSelectedPatientId(val)
                                toast.info(`Patient switched to ${PATIENT_NAMES[val]}`)
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
                
                {/* ---------------------------------------------------------------------------
                    VIEW: WORKFLOW VIEW
                   --------------------------------------------------------------------------- */}
                {view === "workflow" && (
                    <div className="space-y-6">
                        
                        {/* Next Scheduled Session Banner */}
                        <div className="relative overflow-hidden border border-emerald-250/80 dark:border-emerald-900/30 rounded-2xl shadow-xs bg-gradient-to-r from-emerald-50 via-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 dark:bg-emerald-950/30 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="relative flex items-center gap-4">
                                <div className="p-3 bg-emerald-500 dark:bg-emerald-900 rounded-xl text-white shadow-sm">
                                    <Video className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                                            Next Telehealth Session
                                        </span>
                                        {nextSessionJoinable && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                                        {nextSession.dateLabel}, {nextSession.time}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Physiotherapist coordinator: <strong className="font-semibold text-slate-700 dark:text-slate-350">{nextSession.therapist}</strong>
                                    </p>
                                </div>
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

                        {/* Navigation Tabs (Previous Sessions vs Create Session) */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <button
                                className={`px-5 py-3 text-xs font-bold border-b-2 tracking-wide uppercase transition-all duration-150 ${
                                    activeTab === "previous"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                                }`}
                                onClick={() => setActiveTab("previous")}
                            >
                                Previous Sessions & Logs
                            </button>
                            <button
                                className={`px-5 py-3 text-xs font-bold border-b-2 tracking-wide uppercase transition-all duration-150 ${
                                    activeTab === "create"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                                }`}
                                onClick={() => setActiveTab("create")}
                            >
                                Create New Session / Broadcast
                            </button>
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
                                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                                session.hasVideo 
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
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-150 border ${
                                                        selectedProvider === p 
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
                )}

                {/* ---------------------------------------------------------------------------
                    VIEW: DASHBOARD VIEW
                   --------------------------------------------------------------------------- */}
                {view === "dashboard" && (
                    <div className="space-y-6">
                        
                        {/* Back button and quick headers */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setView("workflow")}
                                className="text-xs font-semibold"
                            >
                                ← Back to Workflow View
                            </Button>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-555 font-medium">Session Source:</span>
                                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
                                    {["Recorded", "Uploaded", "Live", "Meet", "Zoom", "YouTube Live"].map((src) => (
                                        <button
                                            key={src}
                                            onClick={() => {
                                                setVideoSource(src)
                                                if (src === "Live" || src === "Meet" || src === "Zoom" || src === "YouTube Live") {
                                                    setLiveActive(true)
                                                } else {
                                                    setLiveActive(false)
                                                }
                                            }}
                                            className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                                                videoSource === src 
                                                    ? "bg-slate-105 dark:bg-slate-800 text-primary" 
                                                    : "text-slate-500 hover:text-slate-805 dark:hover:text-slate-200"
                                            }`}
                                        >
                                            {src}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top KPI Cards Section */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Patient</span>
                                <span className="text-sm font-extrabold text-slate-850 dark:text-slate-100 block mt-1">{patientName}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Session</span>
                                <span className="text-sm font-extrabold text-slate-850 dark:text-slate-100 block mt-1">
                                    {selectedPatientId === "P-0142" ? "8 of 15" : selectedPatientId === "P-0141" ? "5 of 10" : "10 of 10"}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Pain Reduced</span>
                                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-450 block mt-1">
                                    {painBefore} → {painAfter}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{romMetricLabel}</span>
                                <span className="text-sm font-extrabold text-slate-850 dark:text-slate-100 block mt-1">
                                    {selectedPatientId === "P-0142" ? "110° (+10°)" : selectedPatientId === "P-0141" ? "95° (+10°)" : "125° (+15°)"}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs col-span-2 md:col-span-1">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Estimated Time</span>
                                <span className="text-sm font-extrabold text-slate-850 dark:text-slate-100 block mt-1">45 mins</span>
                            </div>
                        </div>

                        {/* Interactive Main Dashboard Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            
                            {/* LEFT TWO COLUMNS (Video call & Exercises) */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* Video Call & Telehealth Streaming Container */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-xs font-extrabold text-slate-405 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Video className="h-4 w-4 text-slate-550" />
                                            Video Consultation Interface
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-slate-555 font-semibold">Privacy:</span>
                                                <button
                                                    onClick={() => {
                                                        setPortalShare(false)
                                                        toast.success("Recording visibility set to: Internal Staff Only")
                                                    }}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        !portalShare 
                                                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" 
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                    }`}
                                                >
                                                    Internal
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPortalShare(true)
                                                        toast.success("Recording visibility set to: Shared on Patient Portal")
                                                    }}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        portalShare 
                                                            ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-900" 
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                    }`}
                                                >
                                                    Portal Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video Screen Mockup */}
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-955 border border-slate-950 shadow-inner flex flex-col justify-between p-4 group">
                                        
                                        {/* Status Overlays */}
                                        <div className="flex justify-between items-start w-full relative z-10">
                                            <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 border border-slate-800">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Source: <span className="text-slate-300 font-bold">{videoSource}</span>
                                            </div>

                                            {liveActive ? (
                                                <span className="bg-red-650/90 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-red-500 animate-pulse tracking-wide">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    LIVE BROADCAST
                                                </span>
                                            ) : (
                                                <span className="bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-700">
                                                    RECORDING PLAYBACK
                                                </span>
                                            )}
                                        </div>

                                        {/* Playback Simulation Graphic */}
                                        <div className="absolute inset-0 flex items-center justify-center z-0">
                                            {videoPlaying ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-radial-gradient">
                                                    {/* Simulated high-fidelity UI overlay inside the video player */}
                                                    <div className="relative w-full max-w-sm border border-white/10 rounded-xl bg-white/5 backdrop-blur-xs p-4 flex items-center gap-3 animate-fade-in shadow-lg">
                                                        <Activity className="h-8 w-8 text-primary animate-pulse shrink-0" />
                                                        <div className="text-left">
                                                            <span className="text-[10px] font-bold text-white/60 block uppercase tracking-wider">Active Patient Stream</span>
                                                            <strong className="text-xs font-bold text-white block">{patientName} — Joint Angle Tracking</strong>
                                                            <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">ROM Flexion: 110° · Joint load stable</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setVideoPlaying(true)
                                                        addTimelineEvent("Started telehealth video stream")
                                                    }}
                                                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/35 text-white flex items-center justify-center border border-white/25 transition-all duration-200 active:scale-95 shadow-lg group-hover:scale-105"
                                                >
                                                    <Play className="h-6 w-6 fill-white ml-1" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Bottom HUD bar */}
                                        <div className="relative z-10 bg-slate-950/85 backdrop-blur-md p-3 rounded-lg border border-slate-900 w-full flex items-center justify-between gap-4 mt-auto">
                                            <div>
                                                <strong className="text-xs font-bold text-white block">
                                                    {clinicalData?.therapyType || "Telehealth consultation"}
                                                </strong>
                                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                                    Connection: <span className="text-emerald-400 font-semibold">Stable (32ms latency)</span> • Duration: 00:42:14
                                                </span>
                                            </div>
                                            
                                            {/* Control Buttons */}
                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    onClick={() => setVideoPlaying(!videoPlaying)}
                                                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-805 text-slate-355 border border-slate-800 hover:text-white transition-colors"
                                                    title={videoPlaying ? "Pause Stream" : "Play Stream"}
                                                >
                                                    {videoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                                </button>
                                                <button 
                                                    onClick={() => setVideoMuted(!videoMuted)}
                                                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-805 text-slate-355 border border-slate-800 hover:text-white transition-colors"
                                                    title={videoMuted ? "Unmute" : "Mute"}
                                                >
                                                    {videoMuted ? <VolumeX className="h-3.5 w-3.5 text-red-400" /> : <Volume2 className="h-3.5 w-3.5" />}
                                                </button>
                                                <button 
                                                    onClick={() => toast.info("Fullscreen mode is available in full app environment")}
                                                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:text-white transition-colors"
                                                    title="Fullscreen"
                                                >
                                                    <Maximize2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Exercise Checklist & Active Timers */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                                        <div>
                                            <h3 className="text-xs font-extrabold text-slate-405 dark:text-slate-500 uppercase tracking-widest block">
                                                Exercise Compliance Checklist
                                            </h3>
                                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                                Track active sets and count duration
                                            </span>
                                        </div>
                                        <Button 
                                            size="sm"
                                            variant="outline"
                                            onClick={handleAddCustomExercise}
                                            className="text-[10px] h-7 font-bold border-dashed border-primary text-primary bg-transparent hover:bg-primary/5 pl-2 pr-2.5"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add Custom
                                        </Button>
                                    </div>

                                    {/* Exercises Loop */}
                                    <div className="space-y-2">
                                        {exerciseList.map((ex) => {
                                            const timer = timers[ex.id] || { seconds: 0, isRunning: false }
                                            return (
                                                <div 
                                                    key={ex.id}
                                                    className={`border rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors duration-200 ${
                                                        ex.checked 
                                                            ? "bg-emerald-50/20 border-emerald-200/60 dark:bg-emerald-950/5 dark:border-emerald-900/20" 
                                                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => toggleExerciseChecked(ex.id)}
                                                            className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                                                                ex.checked 
                                                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-xs" 
                                                                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary"
                                                            }`}
                                                        >
                                                            {ex.checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                                        </button>
                                                        <div>
                                                            <strong className={`text-xs font-bold block transition-all ${
                                                                ex.checked ? "text-slate-500 line-through" : "text-slate-800 dark:text-slate-100"
                                                            }`}>
                                                                {ex.exerciseName}
                                                            </strong>
                                                            <span className="text-[10px] text-slate-500 block mt-0.5">
                                                                Prescription: <strong className="font-semibold text-slate-600 dark:text-slate-350">{ex.sets} sets</strong> × {ex.repsOrDuration}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Timer Controls */}
                                                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                                                        <div className="bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-100 min-w-[70px] text-center shadow-inner">
                                                            {formatTimer(timer.seconds)}
                                                        </div>

                                                        {timer.isRunning ? (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => pauseTimer(ex.id)}
                                                                className="text-[10px] h-8 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 font-bold"
                                                            >
                                                                <Pause className="h-3 w-3 mr-1" /> Pause
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => startTimer(ex.id)}
                                                                className="text-[10px] h-8 text-primary border-primary bg-transparent hover:bg-primary/5 font-bold"
                                                            >
                                                                <Play className="h-3 w-3 mr-1" /> {timer.seconds > 0 ? "Resume" : "Log Time"}
                                                            </Button>
                                                        )}
                                                        
                                                        {timer.seconds > 0 && (
                                                            <button 
                                                                onClick={() => {
                                                                    setTimers(prev => ({
                                                                        ...prev,
                                                                        [ex.id]: { seconds: 0, isRunning: false }
                                                                    }))
                                                                    addTimelineEvent(`Reset timer for ${ex.exerciseName}`)
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                                title="Reset Timer"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Active Session Events Log */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                                    <h3 className="text-xs font-extrabold text-slate-405 dark:text-slate-500 uppercase tracking-widest mb-3 block">
                                        Live Session Timeline Events
                                    </h3>
                                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 font-mono text-[10px] text-slate-500 dark:text-slate-400 space-y-1.5 max-h-[120px] overflow-y-auto">
                                        {timelineEvents.map((evt, idx) => (
                                            <div key={idx} className="flex gap-1">
                                                <span className="text-primary font-bold">{idx + 1}.</span>
                                                <span>{evt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT STICKY SIDEBAR (Info & Metrics Panel) */}
                            <div className="space-y-6 lg:sticky lg:top-4">
                                
                                {/* Session Parameters Panel */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                                    <h3 className="text-xs font-extrabold text-slate-405 dark:text-slate-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-2">
                                        Session Properties
                                    </h3>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Datetime Scheduled</label>
                                        <input
                                            type="datetime-local"
                                            defaultValue="2026-07-14T10:30"
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:bg-white"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Assign Therapist</label>
                                        <select
                                            defaultValue="Dr. Neha Sharma"
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:bg-white"
                                        >
                                            <option>Dr. Neha Sharma</option>
                                            <option>Dr. Arjun Menon</option>
                                            <option>Dr. Ankita Kumar</option>
                                            <option>Dr. Kavita Rao</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Active Duration (mins)</label>
                                        <input
                                            type="number"
                                            defaultValue={45}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:bg-white"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <span className="inline-block text-[10px] font-bold bg-blue-50 dark:bg-blue-955 text-blue-700 dark:text-blue-450 border border-blue-100 dark:border-blue-900 rounded-full px-3 py-1 font-mono uppercase tracking-wider">
                                            {sessionInfoText.sessions}
                                        </span>
                                    </div>
                                </div>

                                {/* Pain Score Custom Interactive Card */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
                                    <h3 className="text-xs font-extrabold text-slate-405 dark:text-slate-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-2">
                                        Pain Score Evaluation
                                    </h3>

                                    {/* Before Pain Selector */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-slate-600 dark:text-slate-350">Pain BEFORE Session</span>
                                            <strong className="text-sm font-extrabold text-yellow-600 font-mono">{painBefore}/10</strong>
                                        </div>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                                                const isSelected = score === painBefore
                                                return (
                                                    <button
                                                        key={score}
                                                        onClick={() => {
                                                            setPainBefore(score)
                                                            toast.info(`Updated pain status (Before) to ${score}/10`)
                                                        }}
                                                        className={`w-[24px] h-[24px] rounded-full text-[10px] font-extrabold flex items-center justify-center transition-all ${
                                                            isSelected
                                                                ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 dark:ring-amber-800"
                                                                : "bg-slate-105 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                                                        }`}
                                                    >
                                                        {score}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* After Pain Selector */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-slate-600 dark:text-slate-355">Pain AFTER Session</span>
                                            <strong className="text-sm font-extrabold text-emerald-600 font-mono">{painAfter}/10</strong>
                                        </div>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                                                const isSelected = score === painAfter
                                                return (
                                                    <button
                                                        key={score}
                                                        onClick={() => {
                                                            setPainAfter(score)
                                                            toast.info(`Updated pain status (After) to ${score}/10`)
                                                        }}
                                                        className={`w-[24px] h-[24px] rounded-full text-[10px] font-extrabold flex items-center justify-center transition-all ${
                                                            isSelected
                                                                ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-300 dark:ring-emerald-800"
                                                                : "bg-slate-105 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                                                        }`}
                                                    >
                                                        {score}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Modalities Card */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
                                    <h3 className="text-xs font-extrabold text-slate-405 dark:text-slate-550 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-2">
                                        Modalities Treatment
                                    </h3>

                                    {/* Checklist badges */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Hot Pack", "IFT", "Manual Therapy", "Ultrasound", "TENS", "Taping", "Ice Pack"].map((item) => {
                                            const isSelected = selectedModalities.includes(item)
                                            return (
                                                <button
                                                    key={item}
                                                    onClick={() => toggleModality(item)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border ${
                                                        isSelected
                                                            ? "bg-primary border-primary text-white shadow-xs"
                                                            : "bg-sky-50 dark:bg-sky-955/20 border-transparent text-primary hover:bg-sky-100"
                                                    }`}
                                                >
                                                    {isSelected ? `✓ ${item}` : item}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Modalities details inputs */}
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">IFT Parameters</label>
                                            <input
                                                type="text"
                                                value={iftParams}
                                                onChange={(e) => setIftParams(e.target.value)}
                                                placeholder="e.g. 80-120Hz, 15 mins, comfortable intensity"
                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wider block">Manual Mobilization Notes</label>
                                            <textarea
                                                value={manualNotes}
                                                onChange={(e) => setManualNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-[60px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Active Session Dashboard Quick Actions */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
                                    <Button 
                                        onClick={handleSaveSession}
                                        className="w-full text-xs font-bold bg-primary text-white hover:bg-blue-700 shadow-xs"
                                    >
                                        💾 Save Session Logs
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={handleSaveAndNext}
                                        className="w-full text-xs font-bold text-emerald-650 border-emerald-500 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                    >
                                        💾 Save & Next Scheduled
                                    </Button>
                                </div>

                            </div>
                        </div>

                        {/* BOTTOM DETAILS ROW (Clinical Notes, ROM timeline, attachments, progress summary) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            
                            {/* Clinical Notes Card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                    Clinical Complaint & Notes
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <p className="text-slate-805 dark:text-slate-200">
                                        <strong>Diagnosis:</strong> {clinicalData?.diagnosis}
                                    </p>
                                    <p className="text-slate-500 leading-relaxed">
                                        <strong>Primary Complaint:</strong> {clinicalData?.primaryComplaint}
                                    </p>
                                    <p className="text-slate-500 leading-relaxed">
                                        <strong>Therapist Remarks:</strong> {clinicalData?.clinicalNotes}
                                    </p>
                                </div>
                            </div>

                            {/* ROM Trend Card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                    ROM Progress Timeline
                                </h4>
                                <div className="space-y-2 text-xs text-slate-500">
                                    <p className="text-slate-805 dark:text-slate-200">
                                        <strong>Current ROM:</strong> {clinicalData?.rom}
                                    </p>
                                    <p className="text-slate-805 dark:text-slate-200">
                                        <strong>Prescribed Strength:</strong> {clinicalData?.strength}
                                    </p>
                                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] leading-relaxed">
                                        <strong>ROM Trend:</strong> {romTrendString}
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                    Rehab Materials & Video links
                                </h4>
                                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                                    <li className="flex items-center justify-between hover:text-primary cursor-pointer transition-colors">
                                        <span className="flex items-center gap-1.5">
                                            <FileText className="h-3.5 w-3.5 text-red-500" />
                                            RehabPlan_Protocol.pdf
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                    </li>
                                    <li className="flex items-center justify-between hover:text-primary cursor-pointer transition-colors">
                                        <span className="flex items-center gap-1.5">
                                            <Video className="h-3.5 w-3.5 text-blue-500" />
                                            GaitRe-Ed_Review_v8.mp4
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                    </li>
                                    <li className="flex items-center justify-between hover:text-primary cursor-pointer transition-colors text-slate-550">
                                        <span className="flex items-center gap-1.5">
                                            <Link2 className="h-3.5 w-3.5" />
                                            AssessmentCharts.csv
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                    </li>
                                </ul>
                            </div>

                            {/* Progress Summary Card */}
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl p-4 shadow-xs">
                                <h4 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-450 uppercase tracking-widest mb-2">
                                    Overall Progress Summary
                                </h4>
                                <div className="space-y-2 text-xs text-emerald-800 dark:text-emerald-400">
                                    <p className="flex justify-between">
                                        <span>Overall Progress:</span> 
                                        <strong className="font-extrabold text-slate-900 dark:text-slate-100">{overallProgressPercent}</strong>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Pain Trend:</span> 
                                        <strong className="font-extrabold text-slate-900 dark:text-slate-100">{painTrendString}</strong>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Sessions Attended:</span> 
                                        <strong className="font-extrabold text-slate-900 dark:text-slate-100">{sessionCountText}</strong>
                                    </p>
                                    <div className="w-full bg-emerald-200 dark:bg-emerald-900/40 rounded-full h-2 overflow-hidden mt-3">
                                        <div 
                                            className="bg-emerald-500 h-2 rounded-full" 
                                            style={{ width: overallProgressPercent }}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
