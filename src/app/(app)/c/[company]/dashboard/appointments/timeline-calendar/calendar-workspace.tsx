"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    Building2,
    ChevronDown,
    X,
    Check,
    Calendar as CalendarIcon,
    Plus,
    Clock,
    User,
    Sparkles
} from "lucide-react"

import { Button } from "@/components/ui/button"

// Types
export interface ChairAppointment {
    id: string
    chairId: "c1" | "c2" | "c3" | "c4"
    patientName: string
    patientMobile?: string
    procedure: string
    timeDisplay: string // e.g. "10:00 · RCT 36"
    startHour: number   // 9 to 17
    startMin: number    // 0 to 59
    durationMin: number // in minutes
    doctor: string
    doctorId: "doc-sneha" | "doc-arjun" | "doc-farhan" | "doc-karan"
    dateStr: string     // "2026-09-29"
}

export interface PatientOption {
    id: string
    name: string
    mobile: string
    anxietyScore?: number
    anxietyNote?: string
    allergies?: string[]
}

const PATIENTS_MOCK: PatientOption[] = [
    {
        id: "p1",
        name: "Priya Deshmukh",
        mobile: "98XXX XX210",
        anxietyScore: 7,
        anxietyNote: "give 15 min extra",
        allergies: ["Penicillin allergy"]
    },
    {
        id: "p2",
        name: "Rahul Verma",
        mobile: "98XXX XX542",
        allergies: ["Latex sensitivity"]
    },
    {
        id: "p3",
        name: "Rohan Mehta",
        mobile: "98XXX XX412",
        anxietyScore: 8,
        anxietyNote: "needs nitrous option",
        allergies: []
    },
    {
        id: "p4",
        name: "Meera Nair",
        mobile: "98XXX XX305",
        allergies: []
    },
    {
        id: "p5",
        name: "Kavya Reddy",
        mobile: "98XXX XX876",
        anxietyScore: 6,
        anxietyNote: "sensitive gag reflex",
        allergies: []
    }
]

const CHAIRS = [
    { id: "c1", name: "Chair 1", type: "General" },
    { id: "c2", name: "Chair 2", type: "Endo" },
    { id: "c3", name: "Chair 3", type: "Kids & ortho" },
    { id: "c4", name: "Chair 4", type: "Surgery" }
] as const

const DOCTORS = [
    {
        id: "doc-sneha",
        name: "Dr. Sneha K.",
        colorHex: "#0D9488", // emerald/teal
        dotClass: "bg-[#0D9488]",
        cardBg: "bg-[#E6F4F1] dark:bg-teal-950/40",
        cardBorder: "border-[#B2DFDB] dark:border-teal-800",
        borderAccent: "border-l-[#0D9488]"
    },
    {
        id: "doc-arjun",
        name: "Dr. Arjun M.",
        colorHex: "#2563EB", // royal blue
        dotClass: "bg-[#2563EB]",
        cardBg: "bg-[#EBF3FB] dark:bg-blue-950/40",
        cardBorder: "border-[#BFDBFE] dark:border-blue-800",
        borderAccent: "border-l-[#2563EB]"
    },
    {
        id: "doc-farhan",
        name: "Dr. Farhan A. (visiting)",
        colorHex: "#D97706", // amber/orange
        dotClass: "bg-[#D97706]",
        cardBg: "bg-[#FFF3E0] dark:bg-amber-950/40",
        cardBorder: "border-[#FED7AA] dark:border-amber-800",
        borderAccent: "border-l-[#D97706]"
    },
    {
        id: "doc-karan",
        name: "Dr. Karan S. (visiting)",
        colorHex: "#7C3AED", // purple
        dotClass: "bg-[#7C3AED]",
        cardBg: "bg-[#F3E8FF] dark:bg-purple-950/40",
        cardBorder: "border-[#E9D5FF] dark:border-purple-800",
        borderAccent: "border-l-[#7C3AED]"
    }
] as const

const PROCEDURES = [
    { id: "proc-rct-36", title: "Root canal 36 · sitting 2 — 60 min", duration: 60, defaultDoctor: "doc-sneha", defaultChair: "c2" },
    { id: "proc-comp-14", title: "Composite filling 14 — 45 min", duration: 45, defaultDoctor: "doc-arjun", defaultChair: "c1" },
    { id: "proc-scaling", title: "Scaling & polishing — 45 min", duration: 45, defaultDoctor: "doc-sneha", defaultChair: "c1" },
    { id: "proc-ext-38", title: "Extraction 38 — 60 min", duration: 60, defaultDoctor: "doc-farhan", defaultChair: "c4" },
    { id: "proc-crown-46", title: "Zirconia crown fit 46 — 60 min", duration: 60, defaultDoctor: "doc-sneha", defaultChair: "c2" },
    { id: "proc-denture", title: "Denture trial — 60 min", duration: 60, defaultDoctor: "doc-sneha", defaultChair: "c2" },
    { id: "proc-aligner", title: "Aligner check / scan — 30 min", duration: 30, defaultDoctor: "doc-karan", defaultChair: "c3" },
    { id: "proc-implant", title: "Implant review / 46 — 75 min", duration: 75, defaultDoctor: "doc-farhan", defaultChair: "c4" }
]

// Initial appointments matching the exact screenshot
const INITIAL_APPOINTMENTS: ChairAppointment[] = [
    // Chair 1 · General
    {
        id: "appt-1",
        chairId: "c1",
        patientName: "Meera Nair",
        procedure: "Scaling",
        timeDisplay: "9:30 · Scaling",
        startHour: 9,
        startMin: 30,
        durationMin: 45,
        doctor: "Dr. Sneha K.",
        doctorId: "doc-sneha",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-2",
        chairId: "c1",
        patientName: "Rahul Verma",
        procedure: "Filling 14",
        timeDisplay: "10:15 · Filling 14",
        startHour: 10,
        startMin: 15,
        durationMin: 60,
        doctor: "Dr. Arjun M.",
        doctorId: "doc-arjun",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-3",
        chairId: "c1",
        patientName: "Imran Khan",
        procedure: "Consult",
        timeDisplay: "12:30 · Consult",
        startHour: 12,
        startMin: 30,
        durationMin: 45,
        doctor: "Dr. Arjun M.",
        doctorId: "doc-arjun",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-4",
        chairId: "c1",
        patientName: "Pooja Jain",
        procedure: "RCT 26",
        timeDisplay: "3:00 · RCT 26",
        startHour: 15,
        startMin: 0,
        durationMin: 60,
        doctor: "Dr. Sneha K.",
        doctorId: "doc-sneha",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-5",
        chairId: "c1",
        patientName: "Ajay Rao",
        procedure: "Review",
        timeDisplay: "4:30 · Review",
        startHour: 16,
        startMin: 30,
        durationMin: 45,
        doctor: "Dr. Arjun M.",
        doctorId: "doc-arjun",
        dateStr: "2026-09-29"
    },

    // Chair 2 · Endo
    {
        id: "appt-6",
        chairId: "c2",
        patientName: "Priya Deshmukh",
        procedure: "RCT 36",
        timeDisplay: "10:00 · RCT 36",
        startHour: 10,
        startMin: 0,
        durationMin: 75,
        doctor: "Dr. Sneha K.",
        doctorId: "doc-sneha",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-7",
        chairId: "c2",
        patientName: "Suresh Patil",
        procedure: "Denture trial",
        timeDisplay: "11:30 · Denture trial",
        startHour: 11,
        startMin: 30,
        durationMin: 60,
        doctor: "Dr. Sneha K.",
        doctorId: "doc-sneha",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-8",
        chairId: "c2",
        patientName: "Neha Gupta",
        procedure: "Crown fit 46",
        timeDisplay: "1:00 · Crown fit 46",
        startHour: 13,
        startMin: 0,
        durationMin: 60,
        doctor: "Dr. Sneha K.",
        doctorId: "doc-sneha",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-9",
        chairId: "c2",
        patientName: "Deepak More",
        procedure: "RCT 11",
        timeDisplay: "4:30 · RCT 11",
        startHour: 16,
        startMin: 30,
        durationMin: 60,
        doctor: "Dr. Sneha K.",
        doctorId: "doc-sneha",
        dateStr: "2026-09-29"
    },

    // Chair 3 · Kids & ortho
    {
        id: "appt-10",
        chairId: "c3",
        patientName: "Aarav Joshi",
        procedure: "Sealants",
        timeDisplay: "10:30 · Sealants",
        startHour: 10,
        startMin: 30,
        durationMin: 45,
        doctor: "Dr. Arjun M.",
        doctorId: "doc-arjun",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-11",
        chairId: "c3",
        patientName: "Kavya Reddy",
        procedure: "Aligner 10",
        timeDisplay: "12:00 · Aligner 10",
        startHour: 12,
        startMin: 0,
        durationMin: 30,
        doctor: "Dr. Karan S.",
        doctorId: "doc-karan",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-12",
        chairId: "c3",
        patientName: "Tanvi Shah",
        procedure: "Braces adj.",
        timeDisplay: "12:30 · Braces adj.",
        startHour: 12,
        startMin: 30,
        durationMin: 30,
        doctor: "Dr. Karan S.",
        doctorId: "doc-karan",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-13",
        chairId: "c3",
        patientName: "Om Kulkarni",
        procedure: "Braces adj.",
        timeDisplay: "1:00 · Braces adj.",
        startHour: 13,
        startMin: 0,
        durationMin: 45,
        doctor: "Dr. Karan S.",
        doctorId: "doc-karan",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-14",
        chairId: "c3",
        patientName: "Riya Das",
        procedure: "Aligner scan",
        timeDisplay: "2:30 · Aligner scan",
        startHour: 14,
        startMin: 30,
        durationMin: 75,
        doctor: "Dr. Karan S.",
        doctorId: "doc-karan",
        dateStr: "2026-09-29"
    },

    // Chair 4 · Surgery
    {
        id: "appt-15",
        chairId: "c4",
        patientName: "Fatima Shaikh",
        procedure: "Implant review",
        timeDisplay: "11:00 · Implant review",
        startHour: 11,
        startMin: 0,
        durationMin: 45,
        doctor: "Dr. Farhan A.",
        doctorId: "doc-farhan",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-16",
        chairId: "c4",
        patientName: "Vikram Singh",
        procedure: "Extraction 38",
        timeDisplay: "2:30 · Extraction 38",
        startHour: 14,
        startMin: 30,
        durationMin: 60,
        doctor: "Dr. Farhan A.",
        doctorId: "doc-farhan",
        dateStr: "2026-09-29"
    },
    {
        id: "appt-17",
        chairId: "c4",
        patientName: "Anil Bhosale",
        procedure: "Implant 46",
        timeDisplay: "3:30 · Implant 46",
        startHour: 15,
        startMin: 30,
        durationMin: 75,
        doctor: "Dr. Farhan A.",
        doctorId: "doc-farhan",
        dateStr: "2026-09-29"
    }
]

const TIME_ROWS = [
    { label: "9 am", hour: 9 },
    { label: "10 am", hour: 10 },
    { label: "11 am", hour: 11 },
    { label: "12 pm", hour: 12 },
    { label: "1 pm", hour: 13 },
    { label: "2 pm", hour: 14 },
    { label: "3 pm", hour: 15 },
    { label: "4 pm", hour: 16 },
    { label: "5 pm", hour: 17 }
]

const ROW_HEIGHT = 86 // pixels per hour block

export default function CalendarWorkspace() {
    const params = useParams()
    const company = (params?.company as string) || "dentflow"

    // View state: "chairs" | "doctors" | "week"
    const [viewMode, setViewMode] = useState<"chairs" | "doctors" | "week">("chairs")

    // Date state
    const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 29)) // Tue, 29 September 2026

    // Search query in header
    const [searchHeader, setSearchHeader] = useState("")

    // Branch selection
    const [branch, setBranch] = useState("Station Road branch")

    // Appointments state with local persistence
    const [appointments, setAppointments] = useState<ChairAppointment[]>([])
    const [loaded, setLoaded] = useState(false)

    // Right panel state
    const [panelOpen, setPanelOpen] = useState(true)
    const [selectedPatientId, setSelectedPatientId] = useState<string>("p1")
    const [selectedProcId, setSelectedProcId] = useState<string>("proc-rct-36")
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("doc-sneha")
    const [selectedChairId, setSelectedChairId] = useState<"c1" | "c2" | "c3" | "c4">("c2")
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0)

    // Checkboxes
    const [whatsappReminder, setWhatsappReminder] = useState(true)
    const [upiDeposit, setUpiDeposit] = useState(false)
    const [preVisitForm, setPreVisitForm] = useState(true)

    // Load initial appointments
    useEffect(() => {
        const saved = localStorage.getItem("sg-dentflow-appointments")
        if (saved) {
            try {
                setAppointments(JSON.parse(saved))
            } catch (e) {
                setAppointments(INITIAL_APPOINTMENTS)
            }
        } else {
            setAppointments(INITIAL_APPOINTMENTS)
        }
        setLoaded(true)
    }, [])

    // Save changes
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("sg-dentflow-appointments", JSON.stringify(appointments))
        }
    }, [appointments, loaded])

    // Format current date display: "Tue, 29 September"
    const formattedDate = useMemo(() => {
        const weekday = currentDate.toLocaleDateString("en-US", { weekday: "short" })
        const day = currentDate.getDate()
        const month = currentDate.toLocaleDateString("en-US", { month: "long" })
        return `${weekday}, ${day} ${month}`
    }, [currentDate])

    const currentDateKey = useMemo(() => {
        const y = currentDate.getFullYear()
        const m = String(currentDate.getMonth() + 1).padStart(2, "0")
        const d = String(currentDate.getDate()).padStart(2, "0")
        return `${y}-${m}-${d}`
    }, [currentDate])

    const isToday = currentDateKey === "2026-09-29"

    // Navigate dates
    const handlePrevDay = () => {
        const next = new Date(currentDate)
        next.setDate(next.getDate() - 1)
        setCurrentDate(next)
    }

    const handleNextDay = () => {
        const next = new Date(currentDate)
        next.setDate(next.getDate() + 1)
        setCurrentDate(next)
    }

    // Selected patient details
    const selectedPatient = useMemo(() => {
        return PATIENTS_MOCK.find(p => p.id === selectedPatientId) || PATIENTS_MOCK[0]
    }, [selectedPatientId])

    // Selected procedure details
    const selectedProcedure = useMemo(() => {
        return PROCEDURES.find(p => p.id === selectedProcId) || PROCEDURES[0]
    }, [selectedProcId])

    // Anxiety buffer calculation
    const anxietyBuffer = (selectedPatient.anxietyScore && selectedPatient.anxietyScore >= 6) ? 15 : 0
    const totalSlotDuration = selectedProcedure.duration + anxietyBuffer

    // Suggested free slots
    const suggestedSlots = useMemo(() => [
        { label: "Thu 1 Oct · 10:00", hour: 10, min: 0, dateStr: "2026-10-01" },
        { label: "Thu 1 Oct · 4:00", hour: 16, min: 0, dateStr: "2026-10-01" },
        { label: "Fri 2 Oct · 9:30", hour: 9, min: 30, dateStr: "2026-10-02" },
        { label: "Sat 3 Oct · 11:00", hour: 11, min: 0, dateStr: "2026-10-03" },
        { label: "Mon 5 Oct · 10:00", hour: 10, min: 0, dateStr: "2026-10-05" },
        { label: "Mon 5 Oct · 5:00", hour: 17, min: 0, dateStr: "2026-10-05" }
    ], [])

    // When procedure changes, auto-update default doctor and chair if desired
    const handleProcedureChange = (procId: string) => {
        setSelectedProcId(procId)
        const p = PROCEDURES.find(item => item.id === procId)
        if (p) {
            setSelectedDoctorId(p.defaultDoctor)
            setSelectedChairId(p.defaultChair as any)
        }
    }

    // Book appointment handler
    const handleBookAppointment = () => {
        const slot = suggestedSlots[selectedSlotIndex]
        const docObj = DOCTORS.find(d => d.id === selectedDoctorId) || DOCTORS[0]

        // Format short time display
        const displayHour = slot.hour > 12 ? slot.hour - 12 : slot.hour
        const displayMin = slot.min === 0 ? "00" : String(slot.min)
        const timeShort = `${displayHour}:${displayMin}`

        // Extract procedure short name, e.g. "Root canal 36"
        const procShortName = selectedProcedure.title.split("—")[0].trim()

        const newAppt: ChairAppointment = {
            id: `appt-${Date.now()}`,
            chairId: selectedChairId,
            patientName: selectedPatient.name,
            patientMobile: selectedPatient.mobile,
            procedure: procShortName,
            timeDisplay: `${timeShort} · ${procShortName.replace("Root canal", "RCT")}`,
            startHour: slot.hour,
            startMin: slot.min,
            durationMin: totalSlotDuration,
            doctor: docObj.name,
            doctorId: docObj.id as any,
            dateStr: isToday ? "2026-09-29" : slot.dateStr // If currently viewing today, place onto the active grid for immediate feedback
        }

        setAppointments(prev => [...prev, newAppt])

        toast.success(
            `Booked ${selectedPatient.name} for ${selectedProcedure.title.split("—")[0].trim()} (${slot.label}) on ${CHAIRS.find(c => c.id === selectedChairId)?.name}`
        )
    }

    const handleAddToWaitlist = () => {
        toast.info(
            `Added ${selectedPatient.name} to waitlist for ${CHAIRS.find(c => c.id === selectedChairId)?.name} (${DOCTORS.find(d => d.id === selectedDoctorId)?.name})`
        )
    }

    // Red line indicator: at approx 10:15 am
    // (10:15 - 9:00 = 75 minutes. 75/60 * ROW_HEIGHT)
    const redLineTop = useMemo(() => {
        const minutesFromNine = 75 // 10:15 AM
        return (minutesFromNine / 60) * ROW_HEIGHT
    }, [])

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 bg-[#FAF9F6] dark:bg-slate-950/60 min-h-screen text-slate-800 dark:text-slate-100 font-sans">
            {/* Header: Title + Subtitle + Controls */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">
                        Calendar
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Chair view · {branch}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                    {/* Branch Dropdown */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                        <Building2 className="h-3.5 w-3.5 text-[#0E6B5E]" />
                        <span>{branch}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search patient, phone, invo..."
                            value={searchHeader}
                            onChange={(e) => setSearchHeader(e.target.value)}
                            className="h-8 pl-8 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0E6B5E] w-48 sm:w-56"
                        />
                    </div>

                    {/* Notification Icon */}
                    <button 
                        className="relative h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 shadow-2xs cursor-pointer"
                        title="Notifications"
                        onClick={() => toast.info("No unread alerts")}
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E11D48] ring-1 ring-white" />
                    </button>

                    {/* User profile */}
                    <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                        <div className="h-8 w-8 rounded-full bg-[#D1E7DD] dark:bg-teal-900/60 text-[#0E6B5E] dark:text-teal-300 font-bold text-xs flex items-center justify-center shadow-2xs">
                            AP
                        </div>
                        <div className="text-left hidden sm:block">
                            <div className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-200">Anita Pawar</div>
                            <div className="text-[10px] text-slate-500 leading-tight">Front desk</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-header Controls Bar: Date navigation | View toggle | Doctors legend */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handlePrevDay}
                            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 shadow-2xs cursor-pointer"
                            title="Previous day"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="px-3 min-w-[140px] text-center font-bold text-sm text-slate-900 dark:text-white">
                            {formattedDate}
                        </div>
                        <button
                            onClick={handleNextDay}
                            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 shadow-2xs cursor-pointer"
                            title="Next day"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* View Switcher: Chairs | Doctors | Week */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <button
                            onClick={() => setViewMode("chairs")}
                            className={`px-3.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                                viewMode === "chairs"
                                    ? "bg-[#0B3B36] text-white shadow-xs"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                        >
                            Chairs
                        </button>
                        <button
                            onClick={() => setViewMode("doctors")}
                            className={`px-3.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                                viewMode === "doctors"
                                    ? "bg-[#0B3B36] text-white shadow-xs"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                        >
                            Doctors
                        </button>
                        <button
                            onClick={() => setViewMode("week")}
                            className={`px-3.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                                viewMode === "week"
                                    ? "bg-[#0B3B36] text-white shadow-xs"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                        >
                            Week
                        </button>
                    </div>
                </div>

                {/* Doctors Legend Chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">Doctors:</span>
                    {DOCTORS.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3 py-1 rounded-full text-xs text-slate-700 dark:text-slate-300 shadow-2xs"
                        >
                            <span className={`h-2 w-2 rounded-full ${doc.dotClass}`} />
                            <span className="font-medium">{doc.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area: Chairs Grid + Right Panel */}
            <div className="flex flex-col xl:flex-row items-start gap-5 pt-1 w-full">
                {/* Left Area: Chairs Grid or Placeholders */}
                <div className="flex-1 w-full min-w-0">
                    {viewMode === "doctors" ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
                            <User className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Doctor-wise Roster View</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                Displays doctor shift timings, assigned chairs and consultation loads.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 text-xs cursor-pointer"
                                onClick={() => setViewMode("chairs")}
                            >
                                Switch back to Chairs view
                            </Button>
                        </div>
                    ) : viewMode === "week" ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
                            <CalendarIcon className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Weekly Calendar Overview</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                7-day multi-chair capacity view.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 text-xs cursor-pointer"
                                onClick={() => setViewMode("chairs")}
                            >
                                Switch back to Chairs view
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                            {/* Grid Scroll Wrapper */}
                            <div className="overflow-x-auto">
                                <div className="min-w-[760px]">
                                    {/* Chairs Column Header */}
                                    <div className="grid grid-cols-[64px_repeat(4,1fr)] border-b border-slate-200 dark:border-slate-800 bg-[#FBFBFA] dark:bg-slate-900/60 sticky top-0 z-30">
                                        <div className="p-3 border-r border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-400 text-center" />
                                        {CHAIRS.map((chair) => (
                                            <div
                                                key={chair.id}
                                                className="py-3 px-4 border-r border-slate-200/80 dark:border-slate-800 last:border-r-0 text-center font-bold text-xs text-slate-800 dark:text-slate-200"
                                            >
                                                {chair.name} · <span className="font-normal text-slate-500">{chair.type}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Time Axis + Chair Columns Container */}
                                    <div className="relative grid grid-cols-[64px_repeat(4,1fr)] select-none">
                                        {/* Red "Now" line across today */}
                                        {isToday && (
                                            <div
                                                className="absolute left-[64px] right-0 z-20 pointer-events-none flex items-center"
                                                style={{ top: `${redLineTop}px` }}
                                            >
                                                <div className="w-full border-t-2 border-[#C2410C] dark:border-[#EA580C] shadow-2xs" />
                                            </div>
                                        )}

                                        {/* Left Time Column */}
                                        <div className="border-r border-slate-200/80 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-900/30">
                                            {TIME_ROWS.map((time) => (
                                                <div
                                                    key={time.hour}
                                                    style={{ height: `${ROW_HEIGHT}px` }}
                                                    className="border-b border-slate-200/60 dark:border-slate-800/80 px-2 pt-1 text-[11px] font-medium text-slate-400 text-right pr-3"
                                                >
                                                    {time.label}
                                                </div>
                                            ))}
                                        </div>

                                        {/* 4 Chairs Columns */}
                                        {CHAIRS.map((chair) => {
                                            // Filter appointments for this chair on current date
                                            const chairAppts = appointments.filter(
                                                (a) => a.chairId === chair.id && a.dateStr === currentDateKey
                                            )

                                            return (
                                                <div
                                                    key={chair.id}
                                                    className="relative border-r border-slate-200/80 dark:border-slate-800 last:border-r-0"
                                                >
                                                    {/* Background Hour Lines */}
                                                    {TIME_ROWS.map((time) => (
                                                        <div
                                                            key={time.hour}
                                                            style={{ height: `${ROW_HEIGHT}px` }}
                                                            className="border-b border-slate-200/50 dark:border-slate-800/60 relative"
                                                        >
                                                            {/* Half-hour dashed divider */}
                                                            <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-100 dark:border-slate-800/40 pointer-events-none" />
                                                        </div>
                                                    ))}

                                                    {/* Appointments Cards Positioned by Time */}
                                                    {chairAppts.map((appt) => {
                                                        const minutesFromNine = (appt.startHour - 9) * 60 + appt.startMin
                                                        const topPx = (minutesFromNine / 60) * ROW_HEIGHT
                                                        const heightPx = Math.max((appt.durationMin / 60) * ROW_HEIGHT - 4, 32)

                                                        const docInfo = DOCTORS.find((d) => d.id === appt.doctorId) || DOCTORS[0]

                                                        return (
                                                            <div
                                                                key={appt.id}
                                                                style={{
                                                                    top: `${topPx + 2}px`,
                                                                    height: `${heightPx}px`
                                                                }}
                                                                className={`absolute left-1.5 right-1.5 rounded-lg border border-l-4 ${docInfo.borderAccent} ${docInfo.cardBorder} ${docInfo.cardBg} p-2 shadow-2xs z-10 overflow-hidden cursor-pointer hover:shadow-sm transition-all duration-150 flex flex-col justify-start`}
                                                                onClick={() => {
                                                                    toast.info(
                                                                        `${appt.patientName} · ${appt.procedure} (${appt.timeDisplay}) with ${appt.doctor}`
                                                                    )
                                                                }}
                                                            >
                                                                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate leading-tight">
                                                                    {appt.patientName}
                                                                </div>
                                                                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                                                                    {appt.timeDisplay}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: New Appointment */}
                {panelOpen ? (
                    <div className="w-full xl:w-[350px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                New appointment
                            </h2>
                            <button
                                onClick={() => setPanelOpen(false)}
                                className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                title="Close panel"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Patient Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Patient
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedPatientId}
                                    onChange={(e) => setSelectedPatientId(e.target.value)}
                                    className="w-full h-9 px-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0E6B5E] appearance-none cursor-pointer"
                                >
                                    {PATIENTS_MOCK.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} · {p.mobile}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Alert Tags */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {selectedPatient.anxietyScore && (
                                    <span className="bg-[#FFEDD5] dark:bg-amber-950/60 text-[#C2410C] dark:text-amber-400 border border-[#FDBA74]/50 rounded-full text-[11px] px-2.5 py-0.5 font-medium">
                                        Anxiety {selectedPatient.anxietyScore}/10 · {selectedPatient.anxietyNote || "give buffer"}
                                    </span>
                                )}
                                {selectedPatient.allergies?.map((allergy, i) => (
                                    <span
                                        key={i}
                                        className="bg-[#FFE4E6] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-400 border border-[#FECDD3]/50 rounded-full text-[11px] px-2.5 py-0.5 font-medium"
                                    >
                                        {allergy}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Procedure Select (sets duration) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Procedure (sets duration)
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedProcId}
                                    onChange={(e) => handleProcedureChange(e.target.value)}
                                    className="w-full h-9 px-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0E6B5E] appearance-none cursor-pointer"
                                >
                                    {PROCEDURES.map((proc) => (
                                        <option key={proc.id} value={proc.id}>
                                            {proc.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Doctor and Chair Selects */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Doctor
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedDoctorId}
                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                        className="w-full h-9 px-3 pr-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0E6B5E] appearance-none cursor-pointer"
                                    >
                                        {DOCTORS.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Chair
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedChairId}
                                        onChange={(e) => setSelectedChairId(e.target.value as any)}
                                        className="w-full h-9 px-3 pr-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0E6B5E] appearance-none cursor-pointer"
                                    >
                                        {CHAIRS.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Suggested Free Slots */}
                        <div className="space-y-2 pt-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                                Suggested free slots ({totalSlotDuration} min{anxietyBuffer > 0 ? " incl. anxiety buffer" : ""})
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {suggestedSlots.map((slot, index) => {
                                    const isSelected = selectedSlotIndex === index
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setSelectedSlotIndex(index)}
                                            className={`text-xs py-2 px-2.5 rounded-xl text-center font-medium transition-all duration-150 cursor-pointer ${
                                                isSelected
                                                    ? "bg-[#0B3B36] text-white shadow-xs font-bold"
                                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                        >
                                            {slot.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {/* Checkbox 1 */}
                            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
                                <div
                                    onClick={() => setWhatsappReminder(!whatsappReminder)}
                                    className={`h-4 w-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                        whatsappReminder
                                            ? "bg-[#0E6B5E] text-white"
                                            : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    }`}
                                >
                                    {whatsappReminder && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span>Remind on WhatsApp (24 h + 2 h)</span>
                            </label>

                            {/* Checkbox 2 */}
                            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
                                <div
                                    onClick={() => setUpiDeposit(!upiDeposit)}
                                    className={`h-4 w-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                        upiDeposit
                                            ? "bg-[#0E6B5E] text-white"
                                            : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    }`}
                                >
                                    {upiDeposit && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span>Ask ₹500 booking deposit via UPI</span>
                            </label>

                            {/* Checkbox 3 */}
                            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
                                <div
                                    onClick={() => setPreVisitForm(!preVisitForm)}
                                    className={`h-4 w-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                        preVisitForm
                                            ? "bg-[#0E6B5E] text-white"
                                            : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    }`}
                                >
                                    {preVisitForm && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span>Send pre-visit form & comfort check</span>
                            </label>
                        </div>

                        {/* Action Buttons: Add to waitlist | Book slot */}
                        <div className="flex items-center gap-2.5 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddToWaitlist}
                                className="text-xs h-9 font-semibold rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer px-3"
                            >
                                Add to waitlist
                            </Button>

                            <Button
                                type="button"
                                onClick={handleBookAppointment}
                                className="flex-1 text-xs h-9 font-semibold rounded-xl bg-[#0B3B36] hover:bg-[#0B3B36]/90 text-white cursor-pointer shadow-xs truncate px-3"
                            >
                                Book {suggestedSlots[selectedSlotIndex]?.label || "Slot"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Collapsed Panel Toggle */
                    <button
                        onClick={() => setPanelOpen(true)}
                        className="fixed bottom-6 right-6 xl:relative xl:bottom-auto xl:right-auto z-40 bg-[#0B3B36] text-white p-3 rounded-2xl shadow-lg hover:bg-[#0B3B36]/90 flex items-center gap-2 text-xs font-semibold cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New appointment</span>
                    </button>
                )}
            </div>
        </div>
    )
}
