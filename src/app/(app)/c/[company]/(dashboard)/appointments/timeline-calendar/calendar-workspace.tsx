"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import { 
    ChevronLeft, 
    ChevronRight, 
    Search, 
    Plus, 
    Calendar as CalendarIcon, 
    X, 
    Clock, 
    User, 
    Activity, 
    FileText, 
    Trash, 
    Edit, 
    MessageSquare,
    CheckCircle,
    UserCheck,
    Menu,
    ChevronDown,
    DollarSign,
    Check
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

// Re-using mock therapists from Patient module
import { mockTherapists, Therapist } from "../../patient-management/patients/_patient-table/patient-data"

export interface Appointment {
    id: string
    title: string
    patientName: string
    patientId?: string
    therapistId: string
    condition: string
    start: string // ISO date-time string
    end: string   // ISO date-time string
    status: "Scheduled" | "Attended" | "Cancelled"
    notes?: string
}

// Initial mock appointments
const initialAppointments = (): Appointment[] => {
    const today = new Date()
    const getIsoDateString = (dayOffset: number, hour: number, minute: number = 0) => {
        const date = new Date(today)
        date.setDate(today.getDate() + dayOffset)
        date.setHours(hour, minute, 0, 0)
        return date.toISOString()
    }

    return [
        {
            id: "appt-1",
            title: "Ravi Kumar - Knee OA Therapy",
            patientName: "Ravi Kumar",
            patientId: "P-0142",
            therapistId: "ther-5",
            condition: "Knee OA",
            start: getIsoDateString(0, 10), // today 10:00 AM
            end: getIsoDateString(0, 11),   // today 11:00 AM
            status: "Scheduled",
            notes: "Focused on quad strengthening and knee mobilization."
        },
        {
            id: "appt-2",
            title: "Meera Shah - Shoulder Mobilization",
            patientName: "Meera Shah",
            patientId: "P-0141",
            therapistId: "ther-6",
            condition: "Frozen Shoulder",
            start: getIsoDateString(0, 14, 30), // today 2:30 PM
            end: getIsoDateString(0, 15, 30),   // today 3:30 PM
            status: "Attended",
            notes: "Targeting external rotation ranges. Patient reported pain score 4/10."
        },
        {
            id: "appt-3",
            title: "Arjun Singh - ACL Post-Op Rehab",
            patientName: "Arjun Singh",
            patientId: "P-0139",
            therapistId: "ther-5",
            condition: "Sports Knee",
            start: getIsoDateString(-1, 11), // yesterday 11:00 AM
            end: getIsoDateString(-1, 12),   // yesterday 12:00 PM
            status: "Attended",
            notes: "Final session evaluation. Discharge summary shared."
        },
        {
            id: "appt-4",
            title: "Rajesh Kumar - Back Pain Therapy",
            patientName: "Rajesh Kumar",
            therapistId: "ther-1",
            condition: "Back Pain",
            start: getIsoDateString(1, 9, 30), // tomorrow 9:30 AM
            end: getIsoDateString(1, 10, 30),  // tomorrow 10:30 AM
            status: "Scheduled",
            notes: "Intake spine evaluation. Posture analysis scheduled."
        },
        {
            id: "appt-5",
            title: "Karan Johar - Cervical Traction",
            patientName: "Karan Johar",
            therapistId: "ther-2",
            condition: "Cervical Spondylosis",
            start: getIsoDateString(2, 16), // in 2 days 4:00 PM
            end: getIsoDateString(2, 17),   // in 2 days 5:00 PM
            status: "Scheduled",
            notes: "Decompression traction therapy scheduled."
        }
    ]
}

export default function CalendarWorkspace() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const calendarRef = useRef<any>(null)

    // Core States
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loaded, setLoaded] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentTitle, setCurrentTitle] = useState("")
    const [currentView, setCurrentView] = useState("dayGridMonth") // dayGridMonth, timeGridWeek, timeGridDay, listWeek

    // Selection & Sidebar
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Modal Control
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")

    // Form inputs state
    const [formPatientName, setFormPatientName] = useState("")
    const [formPatientId, setFormPatientId] = useState("")
    const [formTherapistId, setFormTherapistId] = useState(mockTherapists[0].id)
    const [formCondition, setFormCondition] = useState("Knee OA")
    const [formDate, setFormDate] = useState("")
    const [formTimeStart, setFormTimeStart] = useState("10:00")
    const [formDuration, setFormDuration] = useState("60") // in minutes
    const [formStatus, setFormStatus] = useState<"Scheduled" | "Attended" | "Cancelled">("Scheduled")
    const [formNotes, setFormNotes] = useState("")

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("sg-appointments")
        if (saved) {
            setAppointments(JSON.parse(saved))
        } else {
            setAppointments(initialAppointments())
        }
        setLoaded(true)
    }, [])

    // Sync back to localStorage
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("sg-appointments", JSON.stringify(appointments))
        }
    }, [appointments, loaded])

    // Update Title from FullCalendar Api on view changes
    const updateHeaderTitle = () => {
        const calendarApi = calendarRef.current?.getApi()
        if (calendarApi) {
            setCurrentTitle(calendarApi.view.title)
            setCurrentView(calendarApi.view.type)
        }
    }

    // Apply title once loaded
    useEffect(() => {
        if (loaded) {
            // small delay to let fullcalendar hook up ref
            setTimeout(updateHeaderTitle, 150)
        }
    }, [loaded])

    // Search filter
    const filteredEvents = useMemo(() => {
        const q = searchQuery.toLowerCase().trim()
        
        // Map Appointment schema into FullCalendar Event object format
        return appointments
            .filter(appt => {
                if (!q) return true
                const therapistName = mockTherapists.find(t => t.id === appt.therapistId)?.name || ""
                return (
                    appt.patientName.toLowerCase().includes(q) ||
                    appt.condition.toLowerCase().includes(q) ||
                    therapistName.toLowerCase().includes(q) ||
                    (appt.patientId && appt.patientId.toLowerCase().includes(q))
                )
            })
            .map(appt => {
                // Color code based on status
                let colorClass = "bg-primary/20 text-primary border-primary"
                if (appt.status === "Attended") {
                    colorClass = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500"
                } else if (appt.status === "Cancelled") {
                    colorClass = "bg-destructive/15 text-destructive border-destructive"
                }

                return {
                    id: appt.id,
                    title: `${appt.patientName} (${appt.condition})`,
                    start: appt.start,
                    end: appt.end,
                    extendedProps: {
                        original: appt,
                        colorClass
                    }
                }
            })
    }, [appointments, searchQuery])

    // Navigation callbacks
    const handleNext = () => {
        calendarRef.current?.getApi().next()
        updateHeaderTitle()
    }
    const handlePrev = () => {
        calendarRef.current?.getApi().prev()
        updateHeaderTitle()
    }
    const handleToday = () => {
        calendarRef.current?.getApi().today()
        updateHeaderTitle()
    }
    const handleChangeView = (viewName: string) => {
        calendarRef.current?.getApi().changeView(viewName)
        updateHeaderTitle()
    }

    // Event click -> Open right details sidebar
    const handleEventClick = (clickInfo: any) => {
        const appt: Appointment = clickInfo.event.extendedProps.original
        setSelectedAppt(appt)
        setSidebarOpen(true)
    }

    // Grid cell click -> Open schedule new modal
    const handleDateSelect = (selectInfo: any) => {
        const calendarApi = calendarRef.current?.getApi()
        calendarApi.unselect() // clear selection highlight

        const dateStr = selectInfo.startStr.split("T")[0]
        let timeStr = "10:00"
        if (selectInfo.startStr.includes("T")) {
            timeStr = selectInfo.startStr.split("T")[1].substring(0, 5)
        }

        setFormPatientName("")
        setFormPatientId("")
        setFormTherapistId(mockTherapists[0].id)
        setFormCondition("Knee OA")
        setFormDate(dateStr)
        setFormTimeStart(timeStr)
        setFormDuration("60")
        setFormStatus("Scheduled")
        setFormNotes("")

        setDialogMode("create")
        setDialogOpen(true)
    }

    // Drag-and-drop appointment rescheduled
    const handleEventDropOrResize = (info: any) => {
        const targetId = info.event.id
        const appt = appointments.find(a => a.id === targetId)
        if (!appt) return

        const updatedStart = info.event.startStr
        const updatedEnd = info.event.endStr || new Date(new Date(updatedStart).getTime() + 60 * 60 * 1000).toISOString()

        const updatedAppt: Appointment = {
            ...appt,
            start: updatedStart,
            end: updatedEnd
        }

        setAppointments(prev => prev.map(a => a.id === targetId ? updatedAppt : a))
        if (selectedAppt?.id === targetId) {
            setSelectedAppt(updatedAppt)
        }

        toast.success(`Rescheduled ${appt.patientName} to ${new Date(updatedStart).toLocaleString()}`)
    }

    // Submit dialog (Create / Edit)
    const handleSaveAppointment = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formPatientName.trim() || !formDate || !formTimeStart) {
            toast.error("Please fill in patient name, date, and start time.")
            return
        }

        const startDateTime = new Date(`${formDate}T${formTimeStart}:00`)
        const endDateTime = new Date(startDateTime.getTime() + (parseInt(formDuration) || 60) * 60 * 1000)

        if (dialogMode === "create") {
            const newAppt: Appointment = {
                id: `appt-${Date.now()}`,
                title: `${formPatientName} - ${formCondition}`,
                patientName: formPatientName,
                patientId: formPatientId || undefined,
                therapistId: formTherapistId,
                condition: formCondition,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                status: formStatus,
                notes: formNotes
            }
            setAppointments(prev => [newAppt, ...prev])
            toast.success(`Scheduled appointment for ${formPatientName}`)
        } else if (dialogMode === "edit" && selectedAppt) {
            const updatedAppt: Appointment = {
                ...selectedAppt,
                title: `${formPatientName} - ${formCondition}`,
                patientName: formPatientName,
                patientId: formPatientId || undefined,
                therapistId: formTherapistId,
                condition: formCondition,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                status: formStatus,
                notes: formNotes
            }
            setAppointments(prev => prev.map(a => a.id === selectedAppt.id ? updatedAppt : a))
            setSelectedAppt(updatedAppt)
            toast.success(`Updated appointment details for ${formPatientName}`)
        }

        setDialogOpen(false)
    }

    // Trigger edit modal from sidebar
    const handleTriggerEdit = () => {
        if (!selectedAppt) return

        const startDateObj = new Date(selectedAppt.start)
        const endDateObj = new Date(selectedAppt.end)
        const durationMinutes = Math.round((endDateObj.getTime() - startDateObj.getTime()) / (60 * 1000))

        const padZero = (n: number) => String(n).padStart(2, '0')
        const localDate = `${startDateObj.getFullYear()}-${padZero(startDateObj.getMonth() + 1)}-${padZero(startDateObj.getDate())}`
        const localTime = `${padZero(startDateObj.getHours())}:${padZero(startDateObj.getMinutes())}`

        setFormPatientName(selectedAppt.patientName)
        setFormPatientId(selectedAppt.patientId || "")
        setFormTherapistId(selectedAppt.therapistId)
        setFormCondition(selectedAppt.condition)
        setFormDate(localDate)
        setFormTimeStart(localTime)
        setFormDuration(String(durationMinutes))
        setFormStatus(selectedAppt.status)
        setFormNotes(selectedAppt.notes || "")

        setDialogMode("edit")
        setDialogOpen(true)
    }

    // Cancel appointment
    const handleCancelAppointment = () => {
        if (!selectedAppt) return
        const updated: Appointment = {
            ...selectedAppt,
            status: "Cancelled"
        }
        setAppointments(prev => prev.map(a => a.id === selectedAppt.id ? updated : a))
        setSelectedAppt(updated)
        toast.info(`Appointment for ${selectedAppt.patientName} marked as Cancelled.`)
    }

    // Delete appointment
    const handleDeleteAppointment = () => {
        if (!selectedAppt) return
        if (confirm("Are you sure you want to delete this appointment?")) {
            setAppointments(prev => prev.filter(a => a.id !== selectedAppt.id))
            setSelectedAppt(null)
            setSidebarOpen(false)
            toast.success("Appointment deleted.")
        }
    }

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-var(--header-height))] min-h-0 bg-background/40 font-sans overflow-hidden">
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 bg-card border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                        <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-none">Appointments</h2>
                        <p className="text-xxs text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">Timeline Scheduler</p>
                    </div>
                </div>

                {/* Google Calendar-inspired Header Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Today & Navigation */}
                    <div className="flex items-center rounded-md border border-border bg-background p-0.5">
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-3 cursor-pointer" onClick={handleToday}>
                            Today
                        </Button>
                        <div className="w-[1px] h-4 bg-border" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground" onClick={handlePrev}>
                            <ChevronLeft className="h-4.5 w-4.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground" onClick={handleNext}>
                            <ChevronRight className="h-4.5 w-4.5" />
                        </Button>
                    </div>

                    {/* Dynamic View Date Range */}
                    <span className="text-xs font-bold text-foreground px-2 min-w-[140px] text-center md:text-left">
                        {currentTitle || "Loading date..."}
                    </span>

                    {/* Search Field */}
                    <div className="relative w-full sm:w-48">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search patient, doctor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8.5 pl-8.5 text-xs bg-background"
                        />
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center rounded-md border border-border bg-background p-0.5 shrink-0">
                        {[
                            { id: "dayGridMonth", label: "Month" },
                            { id: "timeGridWeek", label: "Week" },
                            { id: "timeGridDay", label: "Day" },
                            { id: "listWeek", label: "List" }
                        ].map((view) => (
                            <Button 
                                key={view.id}
                                variant={currentView === view.id ? "secondary" : "ghost"} 
                                size="sm" 
                                className="h-7.5 px-2.5 text-xs font-semibold rounded cursor-pointer"
                                onClick={() => handleChangeView(view.id)}
                            >
                                {view.label}
                            </Button>
                        ))}
                    </div>

                    <Button 
                        size="sm" 
                        className="h-8.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-1"
                        onClick={() => {
                            setFormPatientName("")
                            setFormPatientId("")
                            setFormTherapistId(mockTherapists[0].id)
                            setFormCondition("Knee OA")
                            // pre-fill with today's date
                            setFormDate(new Date().toISOString().split("T")[0])
                            setFormTimeStart("10:00")
                            setFormDuration("60")
                            setFormStatus("Scheduled")
                            setFormNotes("")
                            
                            setDialogMode("create")
                            setDialogOpen(true)
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        New Appointment
                    </Button>
                </div>
            </header>

            {/* Layout Canvas */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* FullCalendar Wrapper */}
                <div className="flex-1 overflow-hidden p-4 md:p-6 min-w-0 flex flex-col h-full">
                    <div className="flex-1 min-h-0 bg-card rounded-xl border border-border shadow-xs p-4 overflow-hidden flex flex-col">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                            initialView={currentView}
                            headerToolbar={false} // hide default toolbar
                            events={filteredEvents}
                            selectable={true}
                            editable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            height="100%"
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            eventDrop={handleEventDropOrResize}
                            eventResize={handleEventDropOrResize}
                            eventContent={(eventInfo) => {
                                const original = eventInfo.event.extendedProps.original
                                return (
                                    <div className={`flex flex-col h-full w-full overflow-hidden text-xxs p-1 border-l-4 rounded-r-md select-none ${eventInfo.event.extendedProps.colorClass}`}>
                                        <div className="font-bold truncate">{eventInfo.event.title}</div>
                                        {eventInfo.view.type !== "dayGridMonth" && (
                                            <div className="opacity-80 mt-0.5 flex items-center gap-0.5">
                                                <Clock className="h-2.5 w-2.5 shrink-0" />
                                                <span>{eventInfo.timeText}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </div>
                </div>

                {/* Collapsible Right Sidebar */}
                {sidebarOpen && selectedAppt && (
                    <aside className="w-80 shrink-0 border-l border-border bg-card shadow-lg flex flex-col h-full animate-in slide-in-from-right duration-200">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Appointment Detail</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Detail Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Initials & Name */}
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                    {selectedAppt.patientName.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">{selectedAppt.patientName}</h4>
                                    {selectedAppt.patientId && (
                                        <p className="text-[10px] text-muted-foreground font-mono">{selectedAppt.patientId}</p>
                                    )}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                                <div>
                                    <Badge variant="outline" className={
                                        selectedAppt.status === "Attended" 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 text-xs px-2.5 py-0.5 font-semibold"
                                            : selectedAppt.status === "Cancelled"
                                            ? "bg-destructive/10 text-destructive border-destructive/20 text-xs px-2.5 py-0.5 font-semibold"
                                            : "bg-amber-50 text-amber-600 border-amber-200 text-xs px-2.5 py-0.5 font-semibold"
                                    }>
                                        {selectedAppt.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="border-t border-dashed" />

                            {/* Date, Time, Therapist */}
                            <div className="space-y-3.5 text-xs">
                                <div className="flex items-start gap-2.5">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-foreground">
                                            {new Date(selectedAppt.start).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                            {new Date(selectedAppt.start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - {new Date(selectedAppt.end).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                            {` (${Math.round((new Date(selectedAppt.end).getTime() - new Date(selectedAppt.start).getTime()) / (60 * 1000))} mins)`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <UserCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-foreground">Therapist</div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5">
                                            {mockTherapists.find(t => t.id === selectedAppt.therapistId)?.name || "Unassigned"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <Activity className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-foreground">Condition / Therapy</div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5">{selectedAppt.condition}</div>
                                    </div>
                                </div>

                                {selectedAppt.notes && (
                                    <div className="flex items-start gap-2.5">
                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-foreground">Clinical Intake Notes</div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed italic">{selectedAppt.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-dashed" />

                            {/* Sidebar CTAs */}
                            <div className="space-y-2 pt-1">
                                <Button size="sm" className="w-full text-xs h-8.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-1" onClick={handleTriggerEdit}>
                                    <Edit className="h-3.5 w-3.5" />
                                    Edit Details
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full text-xs h-8.5 border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50 cursor-pointer gap-1"
                                    onClick={() => {
                                        window.open(`https://wa.me/919999988888?text=Hello%20${encodeURIComponent(selectedAppt.patientName)},%20this%20is%20a%20reminder%20for%20your%20appointment%20on%20${new Date(selectedAppt.start).toLocaleDateString()}%20at%20${new Date(selectedAppt.start).toLocaleTimeString()}`, "_blank")
                                    }}
                                >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    WhatsApp Reminder
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full text-xs h-8.5 text-amber-600 border-amber-300 dark:border-amber-900 hover:bg-amber-50/30 cursor-pointer"
                                    onClick={handleCancelAppointment}
                                    disabled={selectedAppt.status === "Cancelled" || selectedAppt.status === "Attended"}
                                >
                                    Cancel Session
                                </Button>
                                <Button size="sm" variant="ghost" className="w-full text-xs h-8.5 text-destructive hover:bg-destructive/10 cursor-pointer gap-1" onClick={handleDeleteAppointment}>
                                    <Trash className="h-3.5 w-3.5" />
                                    Remove Record
                                </Button>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Create / Edit Dialog Modal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl lg:max-w-[50vw] border border-border p-6 rounded-lg bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {dialogMode === "create" ? "Schedule New Appointment" : "Edit Appointment"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Select date, duration, assigned physiotherapist, and write clinical notes.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveAppointment} className="space-y-4 mt-2">
                        {/* Grids for Landscape mode */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="appt-patient" className="text-xs font-semibold">Patient Full Name *</Label>
                                <Input
                                    id="appt-patient"
                                    value={formPatientName}
                                    onChange={(e) => setFormPatientName(e.target.value)}
                                    placeholder="e.g. Vikram Aditya"
                                    required
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="appt-patientId" className="text-xs font-semibold">Patient ID (Optional)</Label>
                                <Input
                                    id="appt-patientId"
                                    value={formPatientId}
                                    onChange={(e) => setFormPatientId(e.target.value)}
                                    placeholder="e.g. P-0142"
                                    className="h-9 text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="appt-therapist" className="text-xs font-semibold">Assigned Therapist</Label>
                                <Select value={formTherapistId} onValueChange={setFormTherapistId}>
                                    <SelectTrigger id="appt-therapist" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Therapist" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60 overflow-y-auto">
                                        {mockTherapists.map((t) => (
                                            <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer">
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="appt-condition" className="text-xs font-semibold">Condition / Therapy</Label>
                                <Select value={formCondition} onValueChange={setFormCondition}>
                                    <SelectTrigger id="appt-condition" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Diagnosis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["Knee OA", "Frozen Shoulder", "Sports Knee", "Back Pain", "Cervical Spondylosis", "Sciatica", "Ankle Sprain"].map((c) => (
                                            <SelectItem key={c} value={c} className="text-xs cursor-pointer">
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="appt-status" className="text-xs font-semibold">Status</Label>
                                <Select value={formStatus} onValueChange={(val: any) => setFormStatus(val)}>
                                    <SelectTrigger id="appt-status" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Scheduled" className="text-xs cursor-pointer">Scheduled</SelectItem>
                                        <SelectItem value="Attended" className="text-xs cursor-pointer">Attended</SelectItem>
                                        <SelectItem value="Cancelled" className="text-xs cursor-pointer">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="appt-date" className="text-xs font-semibold">Date *</Label>
                                <Input
                                    id="appt-date"
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    required
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="appt-time" className="text-xs font-semibold">Start Time *</Label>
                                <Input
                                    id="appt-time"
                                    type="time"
                                    value={formTimeStart}
                                    onChange={(e) => setFormTimeStart(e.target.value)}
                                    required
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="appt-duration" className="text-xs font-semibold">Duration</Label>
                                <Select value={formDuration} onValueChange={setFormDuration}>
                                    <SelectTrigger id="appt-duration" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            { v: "15", l: "15 minutes" },
                                            { v: "30", l: "30 minutes" },
                                            { v: "45", l: "45 minutes" },
                                            { v: "60", l: "1 hour" },
                                            { v: "90", l: "1.5 hours" },
                                            { v: "120", l: "2 hours" }
                                        ].map((opt) => (
                                            <SelectItem key={opt.v} value={opt.v} className="text-xs cursor-pointer">
                                                {opt.l}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="appt-notes" className="text-xs font-semibold">Intake Details / Clinical Notes</Label>
                            <textarea
                                id="appt-notes"
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                placeholder="Specific pain points, target ROM, or referral records..."
                                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button type="button" variant="outline" className="h-9 text-xs cursor-pointer" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                                {dialogMode === "create" ? "Schedule Appointment" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
