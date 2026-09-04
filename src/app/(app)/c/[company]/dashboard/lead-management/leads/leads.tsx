"use client"

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
    List, 
    LayoutGrid, 
    Download, 
    Plus, 
    CalendarPlus, 
    UserCheck, 
    Users, 
    Activity, 
    Clock, 
    TrendingUp, 
    Menu
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"

import { 
    Lead, 
    ActivityLog, 
    initialLeads, 
    initialActivities, 
    mockTherapists 
} from "./_lead-data-table/lead-data"
import { getColumns } from "./_lead-data-table/lead-columns"
import { LeadDataTable } from "./_lead-data-table/lead-data-table"
import { initialPatients } from "../../patient-management/patients/_patient-table/patient-data"

// Separated Subcomponents
import { AddLeadDialog } from "./add-lead-dialog"
import { BookConsultationDialog } from "./book-consultation-dialog"
import { ConvertPatientDialog } from "./convert-patient-dialog"
import { MarkLostDialog } from "./mark-lost-dialog"
import { LeadDetailsSheet } from "./lead-details-sheet"

export default function LeadListComponent() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const [leads, setLeads] = useState<Lead[]>([])
    const [activities, setActivities] = useState<ActivityLog[]>([])
    const [loaded, setLoaded] = useState(false)
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

    // Modals Open State
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [consultationDialogOpen, setConsultationDialogOpen] = useState(false)
    const [convertDialogOpen, setConvertDialogOpen] = useState(false)
    const [lostDialogOpen, setLostDialogOpen] = useState(false)

    // Selection States
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [actionLead, setActionLead] = useState<Lead | null>(null)

    // Drag-and-drop visual states
    const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null)

    // Load from localStorage
    useEffect(() => {
        const savedLeads = localStorage.getItem("sg-leads")
        const savedActivities = localStorage.getItem("sg-activities")
        const savedView = localStorage.getItem("sg-view-preference")

        if (savedLeads) {
            setLeads(JSON.parse(savedLeads))
        } else {
            setLeads(initialLeads)
        }

        if (savedActivities) {
            setActivities(JSON.parse(savedActivities))
        } else {
            setActivities(initialActivities)
        }

        if (savedView === "list" || savedView === "kanban") {
            setViewMode(savedView)
        }

        setLoaded(true)
    }, [])

    // Sync state changes to localStorage
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("sg-leads", JSON.stringify(leads))
        }
    }, [leads, loaded])

    useEffect(() => {
        if (loaded) {
            localStorage.setItem("sg-activities", JSON.stringify(activities))
        }
    }, [activities, loaded])

    const handleViewModeToggle = (mode: "list" | "kanban") => {
        setViewMode(mode)
        localStorage.setItem("sg-view-preference", mode)
        toast.info(`Switched view to ${mode === "list" ? "List view" : "Kanban board"}`)
    }

    // Stats calculations
    const totalLeadsCount = leads.length
    const activeOpportunitiesCount = leads.filter(l => l.status === "Contacted" || l.status === "Interested").length
    const consultationsBookedCount = leads.filter(l => l.status === "Consultation Booked" || l.status === "Assessment Done").length
    const convertedCount = leads.filter(l => l.status === "Converted").length
    const conversionRate = totalLeadsCount > 0 ? ((convertedCount / totalLeadsCount) * 100).toFixed(1) : "0.0"

    // Action handlers passed to table column and Kanban card
    const handleEditLead = (lead: Lead) => {
        setSelectedLead(lead)
        setSheetOpen(true)
    }

    const handleOpenBookConsultation = (lead: Lead) => {
        setActionLead(lead)
        setConsultationDialogOpen(true)
    }

    const handleOpenConvertToPatient = (lead: Lead) => {
        setActionLead(lead)
        setConvertDialogOpen(true)
    }

    const handleOpenMarkLost = (lead: Lead) => {
        setActionLead(lead)
        setLostDialogOpen(true)
    }

    // Redirect handler for WhatsApp, SMS, Call, Followup
    const handleQuickActionRedirect = (lead: Lead, actionName: string) => {
        const timestamp = new Date().toISOString()
        const newLog: ActivityLog = {
            id: `act-${Date.now()}`,
            lead_id: lead.id,
            type: actionName === "WhatsApp" ? "whatsapp" : actionName === "SMS" ? "sms" : actionName === "Call" ? "call" : "followup",
            title: `Quick Action: ${actionName} Triggered`,
            description: `Redirecting user to follow-up page. Simulation saved.`,
            timestamp,
            operator: "Amit Verma"
        }

        setActivities(prev => [newLog, ...prev])
        toast.success(`Redirecting to follow-up page for ${lead.name}...`)
        
        setTimeout(() => {
            router.push(`/c/${company}/dashboard/lead-management/follow-up`)
        }, 800)
    }

    // Book consultation submit
    const handleBookConsultationSubmit = (date: string, time: string, therapistId: string, notes: string) => {
        if (!actionLead) return
        const therapistName = mockTherapists.find(t => t.id === therapistId)?.name || "Default Therapist"
        const timestamp = new Date().toISOString()

        setLeads(prev => prev.map(l => {
            if (l.id === actionLead.id) {
                return {
                    ...l,
                    status: "Consultation Booked",
                    assigned_therapist_id: therapistId || l.assigned_therapist_id
                }
            }
            return l
        }))

        const newActivity: ActivityLog = {
            id: `act-${Date.now()}`,
            lead_id: actionLead.id,
            type: "status_change",
            title: "Consultation Booked",
            description: `Scheduled consultation for ${date} at ${time} with ${therapistName}. Notes: ${notes || "None"}`,
            timestamp,
            operator: "Amit Verma"
        }

        setActivities(prev => [newActivity, ...prev])
        setConsultationDialogOpen(false)
        toast.success(`Consultation booked for ${actionLead.name}. Status updated.`)
    }

    // Convert patient submit
    const handleConvertPatientConfirm = () => {
        if (!actionLead) return
        const timestamp = new Date().toISOString()
        const nextIdNum = 1001 + leads.filter(l => l.status === "Converted").length
        const patientId = `P-${nextIdNum}`

        setLeads(prev => prev.map(l => {
            if (l.id === actionLead.id) {
                return {
                    ...l,
                    status: "Converted",
                    patient_id: patientId,
                    converted_at: timestamp
                }
            }
            return l
        }))

        const newActivity: ActivityLog = {
            id: `act-${Date.now()}`,
            lead_id: actionLead.id,
            type: "conversion",
            title: "Converted to Patient",
            description: `Created patient record. Auto-generated Patient ID: ${patientId}.`,
            timestamp,
            operator: "Amit Verma"
        }

        // Add new patient to sg-patients localStorage list
        const savedPatients = localStorage.getItem("sg-patients")
        let currentPatients = []
        if (savedPatients) {
            try {
                currentPatients = JSON.parse(savedPatients)
            } catch (e) {
                console.error("Error parsing sg-patients from localStorage:", e)
            }
        } else {
            currentPatients = initialPatients
        }
        
        let dob = "1990-01-01"
        if (actionLead.age) {
            const birthYear = new Date().getFullYear() - actionLead.age
            dob = `${birthYear}-01-01`
        }

        const newPatient = {
            id: patientId,
            name: actionLead.name,
            dob,
            gender: actionLead.gender || "Male",
            blood_group: "O+",
            mobile: actionLead.mobile,
            email: actionLead.email || "",
            occupation: actionLead.occupation || "",
            address: actionLead.city || "",
            height: 170,
            weight: 70,
            bmi: "24.2 (Normal)",
            bp: "120/80",
            condition: actionLead.condition || actionLead.pain_area || "General",
            assigned_therapist_id: actionLead.assigned_therapist_id || "ther-1",
            sessions_attended: 0,
            sessions_total: 10,
            last_visit: "Just Joined",
            balance: 0,
            status: "Active" as const,
            created_at: timestamp,
            medical_history: {
                conditions: "",
                surgeries: "",
                allergies: "",
                medications: ""
            },
            emergency_contact: {
                name: "",
                relation: "",
                phone: ""
            },
            documents: [],
            invoices: [],
            timeline: [
                {
                    id: `t-${Date.now()}`,
                    type: "creation" as const,
                    title: "Patient Registered",
                    description: `Patient profile created via Lead conversion. ID assigned: ${patientId}.`,
                    timestamp,
                    operator: "Amit Verma"
                }
            ]
        }
        
        try {
            localStorage.setItem("sg-patients", JSON.stringify([newPatient, ...currentPatients]))
            // Dispatch storage event so other components (e.g. PatientsWorkspace) update
            window.dispatchEvent(new Event("sg-patients-updated"))
        } catch (e) {
            console.error("Error saving new patient to localStorage:", e)
        }

        setActivities(prev => [newActivity, ...prev])
        setConvertDialogOpen(false)
        toast.success(`Successfully converted ${actionLead.name} to Patient ${patientId}`)
    }

    // Mark Lost submit
    const handleMarkLostSubmit = (reason: string, notes: string) => {
        if (!actionLead) return
        const timestamp = new Date().toISOString()
        const reasonDesc = notes ? `${reason}: ${notes}` : reason

        setLeads(prev => prev.map(l => {
            if (l.id === actionLead.id) {
                return {
                    ...l,
                    status: "Lost",
                    lost_reason: reasonDesc
                }
            }
            return l
        }))

        const newActivity: ActivityLog = {
            id: `act-${Date.now()}`,
            lead_id: actionLead.id,
            type: "status_change",
            title: "Lead Marked Lost",
            description: `Lost Reason: ${reasonDesc}`,
            timestamp,
            operator: "Amit Verma"
        }

        setActivities(prev => [newActivity, ...prev])
        setLostDialogOpen(false)
        toast.success(`${actionLead.name} marked as lost.`)
    }

    // Save lead details
    const handleSaveLeadDetails = (updatedLead: Lead) => {
        const timestamp = new Date().toISOString()

        setLeads(prev => prev.map(l => {
            if (l.id === updatedLead.id) {
                return updatedLead
            }
            return l
        }))

        const logDescParts = []
        const oldLead = leads.find(l => l.id === updatedLead.id)
        if (oldLead) {
            if (oldLead.status !== updatedLead.status) {
                logDescParts.push(`Status updated from ${oldLead.status} to ${updatedLead.status}`)
            }
            if (oldLead.name !== updatedLead.name) logDescParts.push(`Name edited`)
        }

        const newLog: ActivityLog = {
            id: `act-${Date.now()}`,
            lead_id: updatedLead.id,
            type: "edit",
            title: "Lead Profile Saved",
            description: logDescParts.length > 0 ? logDescParts.join(". ") : "Updated profile fields.",
            timestamp,
            operator: "Dr. Rahul Sharma"
        }

        setActivities(prev => [newLog, ...prev])
        toast.success(`Successfully updated lead profile for ${updatedLead.name}`)
    }

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggingLeadId(id)
        e.dataTransfer.setData("text/plain", id)
    }

    const handleDragOver = (e: React.DragEvent, status: string) => {
        e.preventDefault()
        if (dragOverStatus !== status) {
            setDragOverStatus(status)
        }
    }

    const handleDragLeave = () => {
        setDragOverStatus(null)
    }

    const handleDrop = (e: React.DragEvent, targetStatus: Lead["status"]) => {
        e.preventDefault()
        setDragOverStatus(null)
        const id = e.dataTransfer.getData("text/plain") || draggingLeadId
        if (!id) return
        
        const lead = leads.find(l => l.id === id)
        if (!lead) return
        if (lead.status === targetStatus) return

        const timestamp = new Date().toISOString()
        
        if (targetStatus === "Lost") {
            setActionLead(lead)
            setLostDialogOpen(true)
            return
        }
        if (targetStatus === "Converted") {
            setActionLead(lead)
            setConvertDialogOpen(true)
            return
        }

        setLeads(prev => prev.map(l => {
            if (l.id === id) {
                return { ...l, status: targetStatus }
            }
            return l
        }))

        const newActivity: ActivityLog = {
            id: `act-${Date.now()}`,
            lead_id: id,
            type: "status_change",
            title: "Status Dragged & Dropped",
            description: `Status updated from ${lead.status} to ${targetStatus}`,
            timestamp,
            operator: "Dr. Rahul Sharma"
        }

        setActivities(prev => [newActivity, ...prev])
        toast.success(`Updated ${lead.name} status to ${targetStatus}`)
        setDraggingLeadId(null)
    }

    // Excel export simulation
    const handleExport = () => {
        const headers = [
            "ID", "Name", "Mobile", "Email", "Age", "Gender", "City", 
            "Occupation", "Pain Area", "Condition", "Source", "Therapist ID", 
            "Status", "Lost Reason", "Notes", "Branch ID", "Created At", 
            "Converted At", "Patient ID"
        ]
        
        const rows = leads.slice(0, 5000).map(lead => [
            lead.id,
            lead.name,
            lead.mobile,
            lead.email || "",
            lead.age || "",
            lead.gender || "",
            lead.city || "",
            lead.occupation || "",
            lead.pain_area || "",
            lead.condition || "",
            lead.source,
            lead.assigned_therapist_id || "",
            lead.status,
            lead.lost_reason || "",
            lead.notes || "",
            lead.branch_id,
            lead.created_at,
            lead.converted_at || "",
            lead.patient_id || ""
        ])
        
        const csvContent = [
            headers.join(","), 
            ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        ].join("\n")
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success("Excel (.xlsx format wrapper) exported for current view. Max 5000 rows.")
    }

    // Action callbacks for table column rendering
    const callbacks = {
        onEdit: handleEditLead,
        onBookConsultation: handleOpenBookConsultation,
        onConvertToPatient: handleOpenConvertToPatient,
        onMarkLost: handleOpenMarkLost,
        onWhatsApp: (l: Lead) => handleQuickActionRedirect(l, "WhatsApp"),
        onSMS: (l: Lead) => handleQuickActionRedirect(l, "SMS"),
        onLogCall: (l: Lead) => handleQuickActionRedirect(l, "Call"),
        onScheduleFollowUp: (l: Lead) => handleQuickActionRedirect(l, "Follow-up")
    }

    const columns = getColumns(callbacks)

    // Grouping Kanban columns
    const kanbanStatuses: Lead["status"][] = [
        "New", "Contacted", "Interested", "Consultation Booked", "Assessment Done", "Converted", "Lost"
    ]

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Header Title Card with Gray Gradient Shades */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:px-6 md:py-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                        <div className="space-y-1">
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                                <Users className="h-6 w-6 text-primary shrink-0" />
                                Lead Management
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Capture, qualify, schedule, and convert clinic prospects to registered patients.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* View Toggle */}
                            <div className="flex items-center rounded-lg border bg-muted/40 p-1 shrink-0">
                                <Button 
                                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                                    size="sm" 
                                    className="h-7 px-2.5 gap-1.5"
                                    onClick={() => handleViewModeToggle("list")}
                                >
                                    <List className="h-4 w-4" />
                                    <span className="text-xs font-semibold">List</span>
                                </Button>
                                <Button 
                                    variant={viewMode === "kanban" ? "secondary" : "ghost"} 
                                    size="sm" 
                                    className="h-7 px-2.5 gap-1.5"
                                    onClick={() => handleViewModeToggle("kanban")}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="text-xs font-semibold">Kanban</span>
                                </Button>
                            </div>

                            {/* Export Button */}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 gap-1.5"
                                onClick={handleExport}
                            >
                                <Download className="h-4 w-4" />
                                <span className="text-xs">Export</span>
                            </Button>

                            {/* Primary Add Lead */}
                            <Button 
                                size="sm" 
                                className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95"
                                onClick={() => setAddDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="text-xs font-semibold">Add Lead</span>
                            </Button>
                        </div>
                    </div>

                    {/* Dashboard Metrics */}
                    <div className="grid grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 md:grid-cols-4 dark:*:data-[slot=card]:bg-card">
                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Total Leads</CardDescription>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight">{totalLeadsCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">Acquired prospects</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Active Leads</CardDescription>
                                <Activity className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-primary">{activeOpportunitiesCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">In contacted & interested state</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Consultations Booked</CardDescription>
                                <Clock className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-rose-600 dark:text-rose-400">{consultationsBookedCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">Assigned therapists pending assessments</p>
                            </CardContent>
                        </Card>

                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription className="text-sm font-medium">Conversion Rate</CardDescription>
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">{conversionRate}%</div>
                                <p className="text-xs text-muted-foreground mt-1">{convertedCount} converted patients</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* View Modes Container */}
                    <div className="px-4 lg:px-6">
                        {viewMode === "list" ? (
                            <LeadDataTable 
                                columns={columns} 
                                data={leads}
                                loading={!loaded}
                                defaultSearchField="name"
                            />
                        ) : (
                            /* KANBAN BOARD VIEW */
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 min-h-[500px]">
                                {kanbanStatuses.map((status) => {
                                    const columnLeads = leads.filter(l => l.status === status)
                                    const isTargetOver = dragOverStatus === status
                                    
                                    let statusDotColor = "bg-muted-foreground"
                                    let statusHeaderBg = "bg-muted/10 border-muted"
                                    if (status === "New") {
                                        statusDotColor = "bg-blue-500"
                                        statusHeaderBg = "bg-blue-50/40 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40"
                                    } else if (status === "Contacted") {
                                        statusDotColor = "bg-amber-500"
                                        statusHeaderBg = "bg-amber-50/40 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40"
                                    } else if (status === "Interested") {
                                        statusDotColor = "bg-purple-500"
                                        statusHeaderBg = "bg-purple-50/40 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/40"
                                    } else if (status === "Consultation Booked") {
                                        statusDotColor = "bg-rose-500"
                                        statusHeaderBg = "bg-rose-50/40 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40"
                                    } else if (status === "Assessment Done") {
                                        statusDotColor = "bg-teal-500"
                                        statusHeaderBg = "bg-teal-50/40 border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/40"
                                    } else if (status === "Converted") {
                                        statusDotColor = "bg-emerald-500"
                                        statusHeaderBg = "bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                                    } else if (status === "Lost") {
                                        statusDotColor = "bg-zinc-400"
                                        statusHeaderBg = "bg-zinc-50/40 border-zinc-100 dark:bg-zinc-900/20 dark:border-zinc-800"
                                    }

                                    return (
                                        <div 
                                            key={status}
                                            onDragOver={(e) => handleDragOver(e, status)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, status)}
                                            className={`flex flex-col rounded-xl border min-w-[280px] max-w-[320px] flex-1 bg-muted/20 pb-4 transition-all duration-200 ${
                                                isTargetOver ? "bg-muted/80 ring-2 ring-primary border-primary/50 translate-y-0.5" : ""
                                            }`}
                                        >
                                            {/* Column Header */}
                                            <div className={`flex items-center justify-between p-3 border-b rounded-t-xl font-semibold text-sm ${statusHeaderBg}`}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${statusDotColor}`} />
                                                    <span className="text-foreground text-xs md:text-sm truncate max-w-[150px]">{status}</span>
                                                </div>
                                                <span className="text-xs bg-muted border font-semibold px-2 py-0.5 rounded-full text-muted-foreground">
                                                    {columnLeads.length}
                                                </span>
                                            </div>

                                            {/* Cards Scrollable Container */}
                                            <div className="flex flex-col gap-3 p-3 overflow-y-auto max-h-[600px] flex-1">
                                                {columnLeads.length > 0 ? (
                                                    columnLeads.map((lead) => (
                                                        <div
                                                            key={lead.id}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, lead.id)}
                                                            className="rounded-xl border bg-card p-3 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing border-l-4 border-l-primary/65"
                                                        >
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h3 
                                                                    className="font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                                                                    onClick={() => handleEditLead(lead)}
                                                                >
                                                                    {lead.name}
                                                                </h3>
                                                                <span className="text-xxs px-1.5 py-0.5 bg-muted rounded font-semibold text-muted-foreground border shrink-0">
                                                                    {lead.source}
                                                                </span>
                                                            </div>
                                                            {lead.pain_area && (
                                                                <div className="text-xs bg-primary/5 border border-primary/10 text-primary px-2 py-0.5 rounded font-medium mt-2 w-fit">
                                                                    {lead.pain_area}
                                                                </div>
                                                            )}
                                                            <div className="text-xs font-mono text-muted-foreground mt-2">
                                                                {lead.mobile}
                                                            </div>
                                                            
                                                            {/* Therapist Label */}
                                                            <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs">
                                                                <span className="text-muted-foreground text-xxs font-medium">Therapist:</span>
                                                                <span className="font-semibold text-foreground">
                                                                    {mockTherapists.find(t => t.id === lead.assigned_therapist_id)?.name.split(" ")[1] || "Unassigned"}
                                                                </span>
                                                            </div>

                                                            {/* Mini Actions Bar */}
                                                            <div className="flex items-center justify-end gap-1.5 mt-3 border-t pt-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                                    onClick={() => handleEditLead(lead)}
                                                                    title="Edit Lead"
                                                                >
                                                                    <Menu className="h-3 w-3" />
                                                                </Button>
                                                                
                                                                {status !== "Converted" && status !== "Lost" && (
                                                                    <>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="h-6 w-6 text-rose-500 hover:bg-rose-50"
                                                                            onClick={() => handleOpenBookConsultation(lead)}
                                                                            title="Book Consultation"
                                                                        >
                                                                            <CalendarPlus className="h-3 w-3" />
                                                                        </Button>
                                                                        
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="h-6 w-6 text-emerald-500 hover:bg-emerald-50"
                                                                            onClick={() => handleOpenConvertToPatient(lead)}
                                                                            title="Convert to Patient"
                                                                        >
                                                                            <UserCheck className="h-3 w-3" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed rounded-xl">
                                                        Drag card here
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* + ADD LEAD DIALOG */}
            <AddLeadDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                existingLeads={leads}
                onLeadCreated={(newLead) => {
                    const timestamp = new Date().toISOString()
                    const creationActivity: ActivityLog = {
                        id: `act-${Date.now()}`,
                        lead_id: newLead.id,
                        type: "creation",
                        title: "Lead Created",
                        description: `New lead added manually by clinic operator. Assigned to ${mockTherapists.find(t => t.id === newLead.assigned_therapist_id)?.name}.`,
                        timestamp,
                        operator: "Amit Verma"
                    }

                    const whatsappActivity: ActivityLog = {
                        id: `act-${Date.now() + 1}`,
                        lead_id: newLead.id,
                        type: "whatsapp",
                        title: "WhatsApp Welcome Sent",
                        description: `Auto-triggered Welcome Message template via WhatsApp Business API. Status: Delivered.`,
                        timestamp: new Date(Date.now() + 1000).toISOString(),
                        operator: "System"
                    }

                    setLeads(prev => [newLead, ...prev])
                    setActivities(prev => [whatsappActivity, creationActivity, ...prev])
                    toast.success(`Lead for ${newLead.name} created. Assigned to default therapist & sent welcome WhatsApp!`)
                }}
            />

            {/* EDIT LEAD / VIEW DETAILS SLIDE-OVER SHEET */}
            <LeadDetailsSheet 
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                lead={selectedLead}
                activities={activities}
                onSave={handleSaveLeadDetails}
            />

            {/* BOOK CONSULTATION DIALOG */}
            <BookConsultationDialog 
                open={consultationDialogOpen}
                onOpenChange={setConsultationDialogOpen}
                lead={actionLead}
                onSubmit={handleBookConsultationSubmit}
            />

            {/* CONVERT TO PATIENT CONFIRMATION DIALOG */}
            <ConvertPatientDialog 
                open={convertDialogOpen}
                onOpenChange={setConvertDialogOpen}
                lead={actionLead}
                onConfirm={handleConvertPatientConfirm}
            />

            {/* MARK LOST REASON DIALOG */}
            <MarkLostDialog 
                open={lostDialogOpen}
                onOpenChange={setLostDialogOpen}
                lead={actionLead}
                onSubmit={handleMarkLostSubmit}
            />
        </div>
    )
}