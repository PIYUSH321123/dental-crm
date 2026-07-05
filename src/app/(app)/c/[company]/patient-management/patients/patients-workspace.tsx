"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Users,
    Activity,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    DollarSign,
    ChevronLeft,
    Calendar,
    MessageSquare,
    FileText,
    Upload,
    Share2,
    Trash2,
    Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Patient, mockTherapists, initialPatients, TimelineEvent, DocumentItem, InvoiceItem } from "./_patient-table/patient-data"
import { getColumns } from "./_patient-table/patient-columns"
import { PatientDataTable } from "./_patient-table/patient-data-table"
import { AddPatientDialog } from "./add-patient-dialog"
import { CollectPaymentDialog } from "./collect-payment-dialog"

export default function PatientsWorkspace() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const [patients, setPatients] = useState<Patient[]>([])
    const [loaded, setLoaded] = useState(false)

    // View & Dialog control
    const [viewMode, setViewMode] = useState<"list" | "profile">("list")
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

    // Modal states
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

    // Load from localStorage
    useEffect(() => {
        const savedPatients = localStorage.getItem("sg-patients")
        if (savedPatients) {
            setPatients(JSON.parse(savedPatients))
        } else {
            setPatients(initialPatients)
        }
        setLoaded(true)
    }, [])

    // Sync to localStorage
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("sg-patients", JSON.stringify(patients))
        }
    }, [patients, loaded])

    // Stats calculations
    const stats = useMemo(() => {
        const total = patients.length
        const active = patients.filter(p => p.status === "Active").length
        const completed = patients.filter(p => p.status === "Completed").length
        const totalDue = patients.reduce((acc, p) => acc + p.balance, 0)
        return { total, active, completed, totalDue }
    }, [patients])

    // Add Patient handler
    const handleAddPatientSave = (newPatientData: Omit<Patient, "id" | "created_at" | "timeline" | "documents" | "invoices" | "sessions_attended" | "last_visit">) => {
        const sequentialNum = patients.length + 1
        const id = `P-0${140 + sequentialNum}`
        const timestamp = new Date().toISOString()

        const newPatient: Patient = {
            ...newPatientData,
            id,
            sessions_attended: 0,
            last_visit: "Just Joined",
            created_at: timestamp,
            documents: [],
            invoices: newPatientData.balance > 0 ? [
                {
                    id: `inv-${Date.now()}`,
                    date: timestamp.split("T")[0],
                    amount: newPatientData.balance,
                    status: "Unpaid",
                    description: `Initial diagnosis treatment package fee (${newPatientData.condition})`
                }
            ] : [],
            timeline: [
                {
                    id: `t-${Date.now()}`,
                    type: "creation",
                    title: "Patient Registered",
                    description: `Patient profile created. ID assigned: ${id}. Initial condition: ${newPatientData.condition}`,
                    timestamp,
                    operator: "Amit Verma"
                }
            ]
        }

        setPatients(prev => [newPatient, ...prev])
        setAddDialogOpen(false)
        toast.success(`Registered patient ${newPatient.name} with ID ${id}`)
    }

    // Edit Profile/Vitals handler
    const handleSaveProfileChanges = (updated: Patient) => {
        // Recalculate BMI based on height/weight updates
        let newBmi = updated.bmi
        const h = updated.height
        const w = updated.weight
        if (h > 0 && w > 0) {
            const heightM = h / 100
            const bmiValue = w / (heightM * heightM)
            const roundedBmi = bmiValue.toFixed(1)
            let category = "Normal"
            if (bmiValue < 18.5) category = "Underweight"
            else if (bmiValue >= 25 && bmiValue < 30) category = "Overweight"
            else if (bmiValue >= 30) category = "Obese"
            newBmi = `${roundedBmi} (${category})`
        }

        const timestamp = new Date().toISOString()
        const changesLog: string[] = []

        const old = patients.find(p => p.id === updated.id)
        if (old) {
            if (old.name !== updated.name) changesLog.push("Name changed")
            if (old.mobile !== updated.mobile) changesLog.push("Phone number updated")
            if (old.status !== updated.status) changesLog.push(`Status set to ${updated.status}`)
            if (old.condition !== updated.condition) changesLog.push(`Condition updated to ${updated.condition}`)
            if (old.assigned_therapist_id !== updated.assigned_therapist_id) changesLog.push("Reassigned therapist")
        }

        const newLog: TimelineEvent = {
            id: `t-${Date.now()}`,
            type: "edit",
            title: "Profile Edited",
            description: changesLog.length > 0 ? changesLog.join(". ") : "Updated clinical details/physical attributes.",
            timestamp,
            operator: "Dr. Rahul Sharma"
        }

        const finalPatient = {
            ...updated,
            bmi: newBmi,
            timeline: [newLog, ...updated.timeline]
        }

        setPatients(prev => prev.map(p => p.id === updated.id ? finalPatient : p))
        setSelectedPatient(finalPatient)
        toast.success(`Successfully saved changes for ${updated.name}`)
    }

    // Payment collection handler
    const handleCollectPaymentSubmit = (amountPaid: number, paymentMode: string, referenceDesc: string) => {
        if (!selectedPatient) return

        const timestamp = new Date().toISOString()
        const newBalance = Math.max(0, selectedPatient.balance - amountPaid)
        const isFullyPaid = newBalance === 0

        const newInvoice: InvoiceItem = {
            id: `inv-${Date.now()}`,
            date: timestamp.split("T")[0],
            amount: amountPaid,
            status: isFullyPaid ? "Paid" : "Partially Paid",
            description: `Payment received via ${paymentMode}. Ref: ${referenceDesc}`
        }

        const newLog: TimelineEvent = {
            id: `t-${Date.now()}`,
            type: "payment",
            title: `Payment Collected - ₹${amountPaid.toLocaleString()}`,
            description: `Collected via ${paymentMode}. New due balance: ₹${newBalance.toLocaleString()}.`,
            timestamp,
            operator: "Amit Verma"
        }

        const updatedPatient: Patient = {
            ...selectedPatient,
            balance: newBalance,
            invoices: [newInvoice, ...selectedPatient.invoices],
            timeline: [newLog, ...selectedPatient.timeline]
        }

        setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p))
        setSelectedPatient(updatedPatient)
        setPaymentDialogOpen(false)
        toast.success(`Payment of ₹${amountPaid.toLocaleString()} recorded for ${selectedPatient.name}`)
    }

    // Document Upload Simulation
    const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedPatient || !e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1)

        if (file.size > 50 * 1024 * 1024) {
            toast.error("File exceeds maximum upload size of 50MB.")
            return
        }

        const newDoc: DocumentItem = {
            id: `doc-${Date.now()}`,
            name: file.name,
            size: `${sizeMb} MB`,
            uploadedAt: new Date().toISOString().split("T")[0],
            type: file.name.split(".").pop()?.toUpperCase() || "PDF",
            url: "#"
        }

        const newLog: TimelineEvent = {
            id: `t-${Date.now()}`,
            type: "document",
            title: `Document Uploaded: ${newDoc.name}`,
            description: `File type: ${newDoc.type} (${newDoc.size}) uploaded. Saved securely to cloud storage.`,
            timestamp: new Date().toISOString(),
            operator: "Dr. Rahul Sharma"
        }

        const updatedPatient: Patient = {
            ...selectedPatient,
            documents: [newDoc, ...selectedPatient.documents],
            timeline: [newLog, ...selectedPatient.timeline]
        }

        setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p))
        setSelectedPatient(updatedPatient)
        toast.success(`Successfully uploaded ${newDoc.name}`)
    }

    // Document deletion
    const handleDeleteDocument = (docId: string) => {
        if (!selectedPatient) return
        const deletedDoc = selectedPatient.documents.find(d => d.id === docId)
        if (!deletedDoc) return

        const updatedPatient: Patient = {
            ...selectedPatient,
            documents: selectedPatient.documents.filter(d => d.id !== docId),
            timeline: [
                {
                    id: `t-${Date.now()}`,
                    type: "document",
                    title: `Document Deleted: ${deletedDoc.name}`,
                    description: "Removed document from patient records.",
                    timestamp: new Date().toISOString(),
                    operator: "Dr. Rahul Sharma"
                },
                ...selectedPatient.timeline
            ]
        }

        setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p))
        setSelectedPatient(updatedPatient)
        toast.success(`Deleted document ${deletedDoc.name}`)
    }

    // PDF Report Generator Simulation
    const handleShareReport = () => {
        if (!selectedPatient) return
        toast.success("Generating progress summary PDF report...")
        setTimeout(() => {
            toast.success(`Report shared to ${selectedPatient.name} via WhatsApp automatically.`)

            // Add timeline entry
            const updatedPatient: Patient = {
                ...selectedPatient,
                timeline: [
                    {
                        id: `t-${Date.now()}`,
                        type: "message",
                        title: "Progress Report Shared",
                        description: "Shared PDF report link via WhatsApp template successfully.",
                        timestamp: new Date().toISOString(),
                        operator: "Dr. Rahul Sharma"
                    },
                    ...selectedPatient.timeline
                ]
            }
            setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p))
            setSelectedPatient(updatedPatient)
        }, 1500)
    }

    // CSV/Excel Export Simulation
    const handleExportPatients = () => {
        const headers = ["Patient ID", "Name", "DOB", "Gender", "Blood Group", "Mobile", "Email", "Condition", "Therapist", "Sessions", "Balance", "Status", "Joined Date"]
        const rows = patients.map(p => {
            const therapist = mockTherapists.find(t => t.id === p.assigned_therapist_id)?.name || "Unassigned"
            return [
                p.id,
                p.name,
                p.dob,
                p.gender,
                p.blood_group,
                p.mobile,
                p.email,
                p.condition,
                therapist,
                `${p.sessions_attended}/${p.sessions_total}`,
                p.balance,
                p.status,
                p.created_at.split("T")[0]
            ]
        })

        const csvContent = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `patients_export_${new Date().toISOString().split("T")[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Exported patient register successfully.")
    }

    // Callbacks passed to columns
    const callbacks = {
        onView: (patient: Patient) => {
            setSelectedPatient(patient)
            setViewMode("profile")
        },
        onSchedule: (patient: Patient) => {
            toast.info(`Opening Appointment Scheduler modal pre-filled for ${patient.name}...`)
            setTimeout(() => {
                router.push(`/c/${company}/appointments/sessions?scheduleFor=${patient.id}`)
            }, 800)
        }
    }

    const columns = getColumns(callbacks)

    // Redirect mappings for Clinical modules
    const handleRedirect = (aspectName: string, path: string) => {
        toast.success(`Redirecting to Clinical ${aspectName}...`)
        setTimeout(() => {
            router.push(`/c/${company}${path}`)
        }, 600)
    }

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 bg-background/50">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Patient Management</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage clinical patient registers, demographical sheets, emergency records, payments, and files.
                    </p>
                </div>
            </div>

            {/* Metrics cards (Visible in List mode) */}
            {viewMode === "list" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase">Total Patients</span>
                            <Users className="h-4.5 w-4.5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold">{stats.total}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                                Registered clinical cases
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase">Active Cases</span>
                            <Activity className="h-4.5 w-4.5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold">{stats.active}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                Under ongoing therapy plans
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase">Completed Rehab</span>
                            <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold">{stats.completed}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                Discharged / Fully recovered
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase">Outstanding Dues</span>
                            <DollarSign className="h-4.5 w-4.5 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold text-destructive">₹{stats.totalDue.toLocaleString()}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                Pending billing collectibles
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* List Mode View */}
            {viewMode === "list" && (
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Wireframe Sidebar */}
                    <div className="w-full lg:w-56 shrink-0 bg-card border border-border rounded-lg p-3 space-y-1">
                        <div className="text-xs font-bold text-muted-foreground px-3.5 py-1.5 uppercase tracking-wider">Demographic Sidebar</div>
                        <Button variant="secondary" className="w-full justify-start text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 cursor-pointer">
                            🏥 Patients ›
                        </Button>
                        <div className="pl-4 space-y-1 mt-1">
                            <Button variant="ghost" className="w-full justify-start text-xs text-foreground font-semibold h-8 bg-muted/40 cursor-default">
                                Patient List
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer"
                                onClick={() => handleRedirect("Assessments", "/activity-management/assessments")}
                            >
                                Assessments
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer"
                                onClick={() => handleRedirect("Treatment Plans", "/activity-management/treatment-plans")}
                            >
                                Treatment Plans
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer"
                                onClick={() => handleRedirect("Sessions", "/appointments/sessions")}
                            >
                                Sessions
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer"
                                onClick={() => handleRedirect("Exercises", "/activity-management/exercises")}
                            >
                                Exercises
                            </Button>
                        </div>
                    </div>

                    {/* Table View */}
                    <PatientDataTable
                        columns={columns}
                        data={patients}
                        onAddPatient={() => setAddDialogOpen(true)}
                        onExport={handleExportPatients}
                    />
                </div>
            )}

            {/* Profile Detail Mode View */}
            {viewMode === "profile" && selectedPatient && (
                <div className="space-y-4">
                    {/* Back Button */}
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1 cursor-pointer pl-1 hover:bg-accent/40"
                            onClick={() => {
                                setViewMode("list")
                                setSelectedPatient(null)
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Patient Register
                        </Button>
                    </div>

                    {/* Two-Panel Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left column panel */}
                        <div className="lg:col-span-3 space-y-4">
                            <Card className="border-border bg-card p-4 shadow-sm flex flex-col items-center">
                                {/* Initials Avatar */}
                                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground font-black text-xl flex items-center justify-center shadow-inner">
                                    {selectedPatient.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </div>
                                <h3 className="font-bold text-foreground text-sm mt-3">{selectedPatient.name}</h3>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{selectedPatient.id} | {selectedPatient.status}</p>

                                <div className="w-full border-t border-dashed my-3.5" />

                                {/* Quick Stats */}
                                <div className="w-full text-left space-y-2">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Stats</div>
                                    <div className="space-y-1 text-xs text-foreground/80 font-medium">
                                        <div className="flex justify-between">
                                            <span>📅 Sessions:</span>
                                            <span className="font-mono font-bold text-foreground">{selectedPatient.sessions_attended} / {selectedPatient.sessions_total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>💰 Paid Amount:</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{(selectedPatient.sessions_attended * 1500).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>⚠️ Due Amount:</span>
                                            <span className={`font-bold ${selectedPatient.balance > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                                                ₹{selectedPatient.balance.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>⭐ Progress:</span>
                                            <span className="font-bold text-primary">
                                                {selectedPatient.sessions_total > 0 ? Math.round((selectedPatient.sessions_attended / selectedPatient.sessions_total) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>📞 Mobile:</span>
                                            <span className="font-mono text-muted-foreground">{selectedPatient.mobile}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full border-t border-dashed my-3.5" />

                                {/* Left Panel Action CTAs */}
                                <div className="w-full flex flex-col gap-2">
                                    <Button
                                        size="sm"
                                        className="w-full text-xs h-8.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                        onClick={() => callbacks.onSchedule(selectedPatient)}
                                    >
                                        + Schedule Appt.
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs h-8.5 border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50 cursor-pointer"
                                        onClick={() => {
                                            toast.info("WhatsApp trigger activated.")
                                            window.open(`https://wa.me/${selectedPatient.mobile.replace(/[\s\+]/g, "")}?text=Hello%20${encodeURIComponent(selectedPatient.name)}`, "_blank")
                                        }}
                                    >
                                        📱 WhatsApp Chat
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs h-8.5 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-900 hover:bg-amber-50/30 cursor-pointer"
                                        onClick={() => setPaymentDialogOpen(true)}
                                        disabled={selectedPatient.balance === 0}
                                    >
                                        💰 Collect Payment
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs h-8.5 cursor-pointer"
                                        onClick={handleShareReport}
                                    >
                                        📤 Share PDF Report
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Right column tabs panel */}
                        <div className="lg:col-span-9">
                            <Tabs defaultValue="profile" className="w-full space-y-4">
                                <TabsList className="bg-muted p-1 rounded-lg w-full flex overflow-x-auto justify-start border border-border h-11 shrink-0 scrollbar-none">
                                    <TabsTrigger value="profile" className="text-xs px-3.5 h-8.5 cursor-pointer rounded-md shrink-0">👤 Profile</TabsTrigger>

                                    {/* Redirect Trigger Tabs */}
                                    <button
                                        onClick={() => handleRedirect("Assessments", "/activity-management/assessments")}
                                        className="inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-foreground h-8.5 rounded-md cursor-pointer shrink-0"
                                    >
                                        🩺 Assessment
                                    </button>
                                    <button
                                        onClick={() => handleRedirect("Treatment Plans", "/activity-management/treatment-plans")}
                                        className="inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-foreground h-8.5 rounded-md cursor-pointer shrink-0"
                                    >
                                        📋 Treatment Plan
                                    </button>
                                    <button
                                        onClick={() => handleRedirect("Sessions", "/appointments/sessions")}
                                        className="inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-foreground h-8.5 rounded-md cursor-pointer shrink-0"
                                    >
                                        📆 Sessions ({selectedPatient.sessions_attended})
                                    </button>
                                    <button
                                        onClick={() => handleRedirect("Exercises", "/activity-management/exercises")}
                                        className="inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-foreground h-8.5 rounded-md cursor-pointer shrink-0"
                                    >
                                        🏃 Exercises
                                    </button>

                                    <TabsTrigger value="billing" className="text-xs px-3.5 h-8.5 cursor-pointer rounded-md shrink-0">💰 Billing</TabsTrigger>
                                    <TabsTrigger value="documents" className="text-xs px-3.5 h-8.5 cursor-pointer rounded-md shrink-0">📄 Documents ({selectedPatient.documents.length})</TabsTrigger>
                                    <TabsTrigger value="timeline" className="text-xs px-3.5 h-8.5 cursor-pointer rounded-md shrink-0">📋 Timeline</TabsTrigger>
                                </TabsList>

                                {/* Tabs Content - Profile */}
                                <TabsContent value="profile" className="space-y-4 focus-visible:ring-0">
                                    <Card className="bg-card border-border p-5">
                                        <ProfileEditForm patient={selectedPatient} onSave={handleSaveProfileChanges} />
                                    </Card>
                                </TabsContent>

                                {/* Tabs Content - Billing */}
                                <TabsContent value="billing" className="space-y-4 focus-visible:ring-0">
                                    <Card className="bg-card border-border p-5 space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Invoices & Payment History</h4>
                                            {selectedPatient.balance > 0 && (
                                                <Button size="sm" variant="outline" className="h-8 text-xs text-amber-600 border-amber-300 dark:border-amber-900 cursor-pointer" onClick={() => setPaymentDialogOpen(true)}>
                                                    Collect Outstanding
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {selectedPatient.invoices.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No invoices recorded yet.</p>
                                            ) : (
                                                selectedPatient.invoices.map((inv) => (
                                                    <div key={inv.id} className="flex justify-between items-center p-3 border border-border rounded-md bg-muted/20">
                                                        <div className="space-y-0.5">
                                                            <div className="text-xs font-semibold text-foreground">{inv.description}</div>
                                                            <div className="text-[10px] text-muted-foreground">{inv.date} | Invoice ID: {inv.id}</div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-mono font-bold text-foreground">₹{inv.amount.toLocaleString()}</span>
                                                            <Badge variant="outline" className={inv.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]" : "bg-amber-50 text-amber-600 border-amber-200 text-[10px]"}>
                                                                {inv.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </Card>
                                </TabsContent>

                                {/* Tabs Content - Documents */}
                                <TabsContent value="documents" className="space-y-4 focus-visible:ring-0">
                                    <Card className="bg-card border-border p-5 space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Uploaded Clinical Documents</h4>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="file-upload" className="h-8 px-3 border border-border rounded-md flex items-center justify-center gap-1.5 cursor-pointer text-xs font-medium bg-background hover:bg-accent">
                                                    <Upload className="h-3.5 w-3.5" />
                                                    Upload File
                                                </Label>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    onChange={handleSimulatedFileUpload}
                                                    className="hidden"
                                                    accept=".pdf,.png,.jpg,.jpeg,.dicom"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border">
                                            ⚠️ Supported files: PDF, JPG, PNG, DICOM. Max file size: 50MB. Uploads are securely indexed against patient ID.
                                        </div>
                                        <div className="space-y-2">
                                            {selectedPatient.documents.length === 0 ? (
                                                <p className="text-xs text-muted-foreground py-4 text-center">No clinical reports or X-rays uploaded yet.</p>
                                            ) : (
                                                selectedPatient.documents.map((doc) => (
                                                    <div key={doc.id} className="flex justify-between items-center p-3 border border-border rounded-md bg-muted/20">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                                                <FileText className="h-4.5 w-4.5" />
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <div className="text-xs font-semibold text-foreground">{doc.name}</div>
                                                                <div className="text-[10px] text-muted-foreground">{doc.uploadedAt} | Size: {doc.size} | Type: {doc.type}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer" onClick={() => window.open(doc.url)}>
                                                                <Share2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer" onClick={() => handleDeleteDocument(doc.id)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </Card>
                                </TabsContent>

                                {/* Tabs Content - Timeline */}
                                <TabsContent value="timeline" className="space-y-4 focus-visible:ring-0">
                                    <Card className="bg-card border-border p-5 space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2">Complete Patient Activity Timeline</h4>
                                        <div className="relative pl-6 space-y-6 border-l border-border mt-3">
                                            {selectedPatient.timeline.map((event) => {
                                                let iconColor = "bg-primary"
                                                if (event.type === "payment") iconColor = "bg-emerald-500"
                                                if (event.type === "edit") iconColor = "bg-amber-500"
                                                if (event.type === "message") iconColor = "bg-sky-500"
                                                if (event.type === "creation") iconColor = "bg-blue-600"

                                                return (
                                                    <div key={event.id} className="relative">
                                                        {/* Bullet point indicator */}
                                                        <span className={`absolute -left-[30px] top-1 flex h-4 w-4 rounded-full border-4 border-background ${iconColor}`} />

                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">{event.title}</span>
                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                                                    <Clock className="h-3 w-3" />
                                                                    {new Date(event.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{event.description}</p>
                                                            {event.operator && (
                                                                <div className="text-[9px] font-semibold text-foreground/70">
                                                                    Logged by: {event.operator}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Payment dialog rendered conditionally */}
                    <CollectPaymentDialog
                        open={paymentDialogOpen}
                        onOpenChange={setPaymentDialogOpen}
                        patient={selectedPatient}
                        onSubmit={handleCollectPaymentSubmit}
                    />
                </div>
            )}

            {/* Registration dialog */}
            <AddPatientDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onSave={handleAddPatientSave}
            />
        </div>
    )
}

/* Helper Inner Component: ProfileEditForm */
interface ProfileEditFormProps {
    patient: Patient
    onSave: (patient: Patient) => void
}

function ProfileEditForm({ patient, onSave }: ProfileEditFormProps) {
    const [name, setName] = useState(patient.name)
    const [dob, setDob] = useState(patient.dob)
    const [gender, setGender] = useState(patient.gender)
    const [bloodGroup, setBloodGroup] = useState(patient.blood_group)
    const [mobile, setMobile] = useState(patient.mobile)
    const [altMobile, setAltMobile] = useState(patient.alt_mobile || "")
    const [email, setEmail] = useState(patient.email)
    const [occupation, setOccupation] = useState(patient.occupation)
    const [address, setAddress] = useState(patient.address)
    const [height, setHeight] = useState(String(patient.height))
    const [weight, setWeight] = useState(String(patient.weight))
    const [bp, setBp] = useState(patient.bp)
    const [condition, setCondition] = useState(patient.condition)
    const [assignedTherapistId, setAssignedTherapistId] = useState(patient.assigned_therapist_id)
    const [sessionsTotal, setSessionsTotal] = useState(String(patient.sessions_total))
    const [status, setStatus] = useState(patient.status)

    // Medical history fields
    const [medConditions, setMedConditions] = useState(patient.medical_history.conditions)
    const [surgeries, setSurgeries] = useState(patient.medical_history.surgeries || "")
    const [allergies, setAllergies] = useState(patient.medical_history.allergies)
    const [medications, setMedications] = useState(patient.medical_history.medications || "")

    // Emergency contact fields
    const [emergencyName, setEmergencyName] = useState(patient.emergency_contact.name)
    const [emergencyRelation, setEmergencyRelation] = useState(patient.emergency_contact.relation)
    const [emergencyPhone, setEmergencyPhone] = useState(patient.emergency_contact.phone)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            ...patient,
            name,
            dob,
            gender,
            blood_group: bloodGroup,
            mobile,
            alt_mobile: altMobile,
            email,
            occupation,
            address,
            height: parseFloat(height) || 0,
            weight: parseFloat(weight) || 0,
            bp,
            condition,
            assigned_therapist_id: assignedTherapistId,
            sessions_total: parseInt(sessionsTotal) || 0,
            status,
            medical_history: {
                conditions: medConditions,
                surgeries,
                allergies,
                medications
            },
            emergency_contact: {
                name: emergencyName,
                relation: emergencyRelation,
                phone: emergencyPhone
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Demographic Info */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="edit-name" className="text-xs">Full Name</Label>
                        <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-dob" className="text-xs">Date of Birth</Label>
                        <Input id="edit-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} required className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-gender" className="text-xs">Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger id="edit-gender" className="h-9 text-xs cursor-pointer">
                                <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male" className="text-xs cursor-pointer">Male</SelectItem>
                                <SelectItem value="Female" className="text-xs cursor-pointer">Female</SelectItem>
                                <SelectItem value="Other" className="text-xs cursor-pointer">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-blood" className="text-xs">Blood Group</Label>
                        <Select value={bloodGroup} onValueChange={setBloodGroup}>
                            <SelectTrigger id="edit-blood" className="h-9 text-xs cursor-pointer">
                                <SelectValue placeholder="Blood Group" />
                            </SelectTrigger>
                            <SelectContent>
                                {["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"].map(bg => (
                                    <SelectItem key={bg} value={bg} className="text-xs cursor-pointer">{bg}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-mobile" className="text-xs">Mobile Phone</Label>
                        <Input id="edit-mobile" value={mobile} onChange={e => setMobile(e.target.value)} required className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-altMobile" className="text-xs">Alt. Mobile</Label>
                        <Input id="edit-altMobile" value={altMobile} onChange={e => setAltMobile(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-email" className="text-xs">Email</Label>
                        <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-occupation" className="text-xs">Occupation</Label>
                        <Input id="edit-occupation" value={occupation} onChange={e => setOccupation(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="edit-address" className="text-xs">Residential Address</Label>
                        <Input id="edit-address" value={address} onChange={e => setAddress(e.target.value)} className="h-9 text-xs" />
                    </div>
                </div>
            </div>

            {/* Vitals & Diagnosis */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">Vitals & Clinical Data</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="edit-height" className="text-xs">Height (cm)</Label>
                        <Input id="edit-height" type="number" value={height} onChange={e => setHeight(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-weight" className="text-xs">Weight (kg)</Label>
                        <Input id="edit-weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-bp" className="text-xs">Blood Pressure</Label>
                        <Input id="edit-bp" value={bp} onChange={e => setBp(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-bmi" className="text-xs">BMI (Calculated)</Label>
                        <div className="h-9 px-3 border border-border bg-muted/40 rounded-md flex items-center text-xs font-semibold text-muted-foreground">
                            {patient.bmi}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-condition" className="text-xs">Condition / Diagnosis</Label>
                        <Select value={condition} onValueChange={setCondition}>
                            <SelectTrigger id="edit-condition" className="h-9 text-xs cursor-pointer">
                                <SelectValue placeholder="Condition" />
                            </SelectTrigger>
                            <SelectContent>
                                {["Knee OA", "Frozen Shoulder", "Sports Knee", "Back Pain", "Cervical Spondylosis", "Sciatica", "Ankle Sprain"].map(c => (
                                    <SelectItem key={c} value={c} className="text-xs cursor-pointer">{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-therapist" className="text-xs">Therapist</Label>
                        <Select value={assignedTherapistId} onValueChange={setAssignedTherapistId}>
                            <SelectTrigger id="edit-therapist" className="h-9 text-xs cursor-pointer">
                                <SelectValue placeholder="Therapist" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                                {mockTherapists.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer">{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-sessions" className="text-xs">Total Sessions</Label>
                        <Input id="edit-sessions" type="number" value={sessionsTotal} onChange={e => setSessionsTotal(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-status" className="text-xs">Rehab Status</Label>
                        <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                            <SelectTrigger id="edit-status" className="h-9 text-xs cursor-pointer">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active" className="text-xs cursor-pointer">Active</SelectItem>
                                <SelectItem value="Completed" className="text-xs cursor-pointer">Completed</SelectItem>
                                <SelectItem value="On Hold" className="text-xs cursor-pointer">On Hold</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Medical History */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">Medical History</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="edit-medConditions" className="text-xs">Existing Conditions / Diseases</Label>
                        <Input id="edit-medConditions" value={medConditions} onChange={e => setMedConditions(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-surgeries" className="text-xs">Past Surgeries</Label>
                        <Input id="edit-surgeries" value={surgeries} onChange={e => setSurgeries(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-allergies" className="text-xs">Allergies</Label>
                        <Input id="edit-allergies" value={allergies} onChange={e => setAllergies(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-medications" className="text-xs">Current Medications</Label>
                        <Input id="edit-medications" value={medications} onChange={e => setMedications(e.target.value)} className="h-9 text-xs" />
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="edit-emergencyName" className="text-xs">Contact Name</Label>
                        <Input id="edit-emergencyName" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-emergencyRelation" className="text-xs">Relation</Label>
                        <Input id="edit-emergencyRelation" value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-emergencyPhone" className="text-xs">Contact Phone</Label>
                        <Input id="edit-emergencyPhone" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="h-9 text-xs" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="submit" className="h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                    💾 Save Changes
                </Button>
            </div>
        </form>
    )
}
