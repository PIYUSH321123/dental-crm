"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Video,
    Plus,
    Search,
    ExternalLink,
    Trash2,
    Calendar,
    UserCheck,
    Link2,
    Loader2,
    AlertCircle,
    Filter,
    Layers,
    Clock,
    User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export interface MeetingRecord {
    id: string
    appointmentId: string
    appointmentLabel?: string
    title: string
    link: string
    createdAt: string
    createdBy?: {
        id?: string
        name?: string
        email?: string
    } | null
}

interface ApptOption {
    id: string
    patientName: string
    date: string
    condition: string
}

const APPOINTMENT_OPTIONS: ApptOption[] = [
    { id: "APPT-1001", patientName: "Ravi Kumar (P-0142)", date: "14 Jun 2026 10:00 AM", condition: "Knee OA Rehab" },
    { id: "APPT-1002", patientName: "Meera Shah (P-0141)", date: "14 Jun 2026 11:30 AM", condition: "Post-Op Shoulder" },
    { id: "APPT-1003", patientName: "Arjun Singh (P-0139)", date: "15 Jun 2026 02:00 PM", condition: "ACL Rehabilitation" },
    { id: "APPT-1004", patientName: "Priya Sharma (P-0145)", date: "16 Jun 2026 04:00 PM", condition: "Spine Alignment" }
]

const INITIAL_RECORDS: MeetingRecord[] = [
    {
        id: "rec-1",
        appointmentId: "APPT-1001",
        appointmentLabel: "Ravi Kumar (P-0142) • Knee OA Rehab",
        title: "Initial Assessment & Range of Motion Video",
        link: "https://meet.google.com/abc-defg-hij",
        createdAt: "2026-06-14T10:30:00Z",
        createdBy: { name: "Dr. Sarah" }
    },
    {
        id: "rec-2",
        appointmentId: "APPT-1002",
        appointmentLabel: "Meera Shah (P-0141) • Post-Op Shoulder",
        title: "Post-Surgery Follow-up Consultation Recording",
        link: "https://zoom.us/rec/play/sample-session-meera-shah",
        createdAt: "2026-06-14T12:00:00Z",
        createdBy: { name: "Dr. Rahul Sharma" }
    },
    {
        id: "rec-3",
        appointmentId: "APPT-1003",
        appointmentLabel: "Arjun Singh (P-0139) • ACL Rehabilitation",
        title: "Gait & Strength Evaluation Cloud Recording",
        link: "https://drive.google.com/file/d/sample-arjun-rehab-video/view",
        createdAt: "2026-06-15T14:45:00Z",
        createdBy: { name: "Dr. Kavita Rao" }
    }
]

const URL_PATTERN = /^https?:\/\/.+/i

export default function RecordManagementPage() {
    const params = useParams()
    const company = (params?.company as string) || "clinic"
    const router = useRouter()

    const [records, setRecords] = React.useState<MeetingRecord[]>(INITIAL_RECORDS)
    const [selectedFilterAppt, setSelectedFilterAppt] = React.useState<string>("ALL")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isFormOpen, setIsFormOpen] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)

    // Form states
    const [formTitle, setFormTitle] = React.useState("")
    const [formLink, setFormLink] = React.useState("")
    const [formApptId, setFormApptId] = React.useState(APPOINTMENT_OPTIONS[0].id)
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

    // Load persisted records from localStorage or API
    React.useEffect(() => {
        try {
            const saved = localStorage.getItem(`sg-meeting-records-${company}`)
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setRecords(parsed)
                }
            }
        } catch (e) {}
    }, [company])

    // Save records to localStorage
    const persistRecords = (newRecords: MeetingRecord[]) => {
        setRecords(newRecords)
        try {
            localStorage.setItem(`sg-meeting-records-${company}`, JSON.stringify(newRecords))
        } catch (e) {}
    }

    // Validate form inputs
    const validateForm = (): boolean => {
        setErrorMessage(null)
        if (!formTitle.trim()) {
            setErrorMessage("Please enter a title for the recording.")
            return false
        }
        const trimmedLink = formLink.trim()
        if (!trimmedLink) {
            setErrorMessage("Please enter the meeting recording URL.")
            return false
        }
        if (!URL_PATTERN.test(trimmedLink)) {
            setErrorMessage("Invalid link URL. Link must start with http:// or https://")
            return false
        }
        return true
    }

    // Submit new record
    const handleCreateRecord = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        const targetAppt = APPOINTMENT_OPTIONS.find(a => a.id === formApptId) || APPOINTMENT_OPTIONS[0]
        const newRecord: MeetingRecord = {
            id: `rec-${Date.now()}`,
            appointmentId: formApptId,
            appointmentLabel: `${targetAppt.patientName} • ${targetAppt.condition}`,
            title: formTitle.trim(),
            link: formLink.trim(),
            createdAt: new Date().toISOString(),
            createdBy: { name: "Dr. Sarah" }
        }

        setIsSaving(true)

        // Optimistic UI update
        const updated = [newRecord, ...records]
        persistRecords(updated)

        // Reset form
        setFormTitle("")
        setFormLink("")
        setErrorMessage(null)
        setIsFormOpen(false)
        setIsSaving(false)
        toast.success(`Meeting recording "${newRecord.title}" saved successfully!`)

        // Attempt background API sync
        try {
            await fetch(`/api/appointments/${formApptId}/records`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newRecord.title, link: newRecord.link })
            })
        } catch (err) {}
    }

    // Delete a record
    const handleDeleteRecord = async (recordId: string) => {
        const target = records.find(r => r.id === recordId)
        if (!target) return

        if (!confirm(`Are you sure you want to delete "${target.title}"?`)) return

        const updated = records.filter(r => r.id !== recordId)
        persistRecords(updated)
        toast.success("Recording deleted successfully.")

        try {
            await fetch(`/api/appointments/${target.appointmentId}/records/${recordId}`, {
                method: "DELETE"
            })
        } catch (err) {}
    }

    // Helper: Identify link type / platform badge
    const getPlatformBadge = (url: string) => {
        const lower = url.toLowerCase()
        if (lower.includes("zoom.us")) {
            return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">Zoom</span>
        }
        if (lower.includes("meet.google.com")) {
            return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Google Meet</span>
        }
        if (lower.includes("drive.google.com")) {
            return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Google Drive</span>
        }
        if (lower.includes("teams.microsoft.com")) {
            return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">MS Teams</span>
        }
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground border border-border">Web Link</span>
    }

    // Filtered records
    const filteredRecords = records.filter(r => {
        const matchesAppt = selectedFilterAppt === "ALL" || r.appointmentId === selectedFilterAppt
        const matchesSearch = !searchQuery.trim() || 
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.link.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.appointmentLabel && r.appointmentLabel.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesAppt && matchesSearch
    })

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            })
        } catch (e) {
            return dateStr
        }
    }

    return (
        <div className="flex-1 space-y-6 p-6 lg:p-8 bg-background text-foreground font-sans min-w-0">
            {/* Main Header Title Card with Gray Gradient Shades */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 md:px-6 md:py-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <Video className="h-6 w-6 text-primary shrink-0" />
                        Record Management
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Store and access patient session recordings, video consultations, and cloud meeting links (Zoom, Google Meet, Drive).
                    </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <Button
                        onClick={() => {
                            setIsFormOpen(true)
                            setErrorMessage(null)
                        }}
                        size="sm"
                        className="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl cursor-pointer gap-2 shadow-xs transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Recording Link</span>
                    </Button>
                </div>
            </div>

            {/* Quick Add Recording Form Card (Revealed on click) */}
            {isFormOpen && (
                <form 
                    onSubmit={handleCreateRecord} 
                    className="bg-card border-2 border-primary/40 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-border/70">
                        <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-bold text-foreground">Add New Meeting Recording Link</h3>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsFormOpen(false)
                                setErrorMessage(null)
                            }}
                            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </div>

                    {/* Inline Error Alert */}
                    {errorMessage && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Title */}
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-xs font-bold text-foreground">
                                Recording Title <span className="text-destructive">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g. Range of Motion Assessment"
                                value={formTitle}
                                onChange={(e) => {
                                    setFormTitle(e.target.value)
                                    if (errorMessage) setErrorMessage(null)
                                }}
                                className="h-9 text-xs bg-background border-border text-foreground rounded-lg"
                            />
                        </div>

                        {/* Meeting Link URL */}
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-xs font-bold text-foreground">
                                Meeting URL Link <span className="text-destructive">*</span>
                            </label>
                            <Input
                                type="url"
                                placeholder="https://zoom.us/rec/... or https://meet.google.com/..."
                                value={formLink}
                                onChange={(e) => {
                                    setFormLink(e.target.value)
                                    if (errorMessage) setErrorMessage(null)
                                }}
                                className="h-9 text-xs bg-background border-border text-foreground rounded-lg"
                            />
                        </div>

                        {/* Associated Appointment Case */}
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-xs font-bold text-foreground">
                                Associated Appointment Case
                            </label>
                            <select
                                value={formApptId}
                                onChange={(e) => setFormApptId(e.target.value)}
                                className="w-full h-9 px-3 bg-background border border-border text-foreground text-xs font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                            >
                                {APPOINTMENT_OPTIONS.map((appt) => (
                                    <option key={appt.id} value={appt.id}>
                                        {appt.patientName} — {appt.condition}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsFormOpen(false)
                                setErrorMessage(null)
                            }}
                            className="h-8.5 px-4 text-xs font-medium cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            size="sm"
                            className="h-8.5 px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-2"
                        >
                            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>Save Recording Link</span>
                        </Button>
                    </div>
                </form>
            )}

            {/* Filter & Search Toolbar */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Search input */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search recordings or links..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 pl-9 text-xs bg-background border-border text-foreground rounded-lg"
                        />
                    </div>

                    {/* Filter by appointment dropdown */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <select
                            value={selectedFilterAppt}
                            onChange={(e) => setSelectedFilterAppt(e.target.value)}
                            className="h-9 px-3 bg-background border border-border text-foreground text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                        >
                            <option value="ALL">All Appointment Cases ({records.length})</option>
                            {APPOINTMENT_OPTIONS.map((appt) => {
                                const count = records.filter(r => r.appointmentId === appt.id).length
                                return (
                                    <option key={appt.id} value={appt.id}>
                                        {appt.patientName} ({count})
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                </div>

                <div className="text-xs font-semibold text-muted-foreground shrink-0">
                    Showing <span className="text-foreground font-bold">{filteredRecords.length}</span> recording{filteredRecords.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Meeting Records List */}
            {filteredRecords.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card/40 p-8 space-y-3">
                    <Video className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">No meeting recordings found.</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            {searchQuery || selectedFilterAppt !== "ALL" 
                                ? "No recordings match your active filter criteria." 
                                : "Click 'Add Recording Link' above to attach session videos to patient appointments."}
                        </p>
                    </div>
                    {!isFormOpen && (
                        <Button
                            onClick={() => {
                                setIsFormOpen(true)
                                setErrorMessage(null)
                            }}
                            size="sm"
                            className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg cursor-pointer gap-1.5"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add First Recording Link
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3.5">
                    {filteredRecords.map((rec) => (
                        <div
                            key={rec.id}
                            className="bg-card border border-border rounded-2xl p-4.5 shadow-xs hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm font-bold text-foreground truncate">{rec.title}</h4>
                                    {getPlatformBadge(rec.link)}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    {rec.appointmentLabel && (
                                        <div className="flex items-center gap-1 font-medium text-foreground/80">
                                            <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span>{rec.appointmentLabel}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span>{formatDate(rec.createdAt)}</span>
                                    </div>

                                    {rec.createdBy?.name && (
                                        <div className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span>Added by {rec.createdBy.name}</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-[11px] text-muted-foreground font-mono truncate max-w-xl">
                                    {rec.link}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                                <a
                                    href={rec.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer shadow-2xs"
                                >
                                    <span>Open Link</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteRecord(rec.id)}
                                    className="h-8.5 w-8.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer transition-all"
                                    title="Delete recording"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
