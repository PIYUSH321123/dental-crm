"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ClipboardList, ArrowLeft, Users, Eye, Pencil, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { useSidebar } from "@/components/ui/sidebar"

import PlanDetails, { TreatmentPlan } from "./components/PlanDetails"
import TherapyAndPhases, { Phase } from "./components/TheapyAndPhases"
import PlanActionBtns from "./components/PlanActionBtns"

const defaultPlans: TreatmentPlan[] = [
    {
        id: "TP-001",
        patientId: "P-0142",
        date: "2026-01-15",
        diagnosis: "Acute Left Knee Patellar Tendonitis",
        goals: "Reduce localized tendon inflammation, restore pain-free squatting extension",
        status: "Completed",
        expectedRecovery: "4 Weeks",
        frequency: "3x weekly",
        therapyType: "Tendon Mobilization & Cryotherapy",
        primaryComplaint: "Severe pain at patellar tendon during knee extension.",
        painScore: 8,
        painDuration: "< 1 week",
        painType: "Sharp",
        rom: "Knee Flexion: 120°, Extension: 0°",
        strength: "Quads: 3+/5, Hamstrings: 4/5",
        specialTests: "Patellar tendon palpation: highly tender",
        icdCode: "M76.52",
        clinicalNotes: "Inflammation present. Focus on isometric quad loading first.",
        sessionsCount: 12,
        startDate: "2026-01-15",
        recoveryDate: "2026-02-12",
        therapist: "Dr. Ankita Kumar",
        selectedTherapies: ["Manual Therapy", "Exercise Therapy", "Thermotherapy"],
        phases: [
            { id: "1", name: "Phase 1", sessions: "1–4", focus: "Pain control & isometrics" },
            { id: "2", name: "Phase 2", sessions: "5–12", focus: "Eccentric strengthening & load progressions" }
        ]
    },
    {
        id: "TP-002",
        patientId: "P-0142",
        date: "2026-03-20",
        diagnosis: "Left Knee OA (Kellgren Grade I)",
        goals: "Maintain range of motion, build quadriceps resilience",
        status: "Completed",
        expectedRecovery: "6 Weeks",
        frequency: "2x weekly",
        therapyType: "Knee Decompression",
        primaryComplaint: "Dull ache after walking for more than 1 km.",
        painScore: 5,
        painDuration: "1–6 months",
        painType: "Dull Ache",
        rom: "Knee Flexion: 115°, Extension: -2°",
        strength: "Quads: 4-/5, Hamstrings: 4/5",
        specialTests: "Joint space narrowing: minimal",
        icdCode: "M17.12",
        clinicalNotes: "Early OA symptoms. Focus on low-impact cardio and glute/quad strength.",
        sessionsCount: 10,
        startDate: "2026-03-20",
        recoveryDate: "2026-04-30",
        therapist: "Dr. Ankita Kumar",
        selectedTherapies: ["Manual Therapy", "Exercise Therapy", "Hydrotherapy"],
        phases: [
            { id: "1", name: "Phase 1", sessions: "1–4", focus: "Pain reduction & joint mobility" },
            { id: "2", name: "Phase 2", sessions: "5–10", focus: "Strength & endurance loading" }
        ]
    },
    {
        id: "TP-003",
        patientId: "P-0142",
        date: "2026-06-10",
        diagnosis: "Knee OA (Kellgren-Lawrence Grade II)",
        goals: "Reduce pain, increase quad strength, improve knee flexion ROM",
        status: "Active",
        expectedRecovery: "8-12 Weeks",
        frequency: "2x weekly",
        therapyType: "Knee Joint Mobilization",
        primaryComplaint: "Pain in left knee while walking and climbing stairs.",
        painScore: 7,
        painDuration: "1–6 months",
        painType: "Dull Ache",
        rom: "Knee Flexion: 110°, Knee Extension: -5°",
        strength: "Quads: 3+/5, Hamstrings: 4/5",
        specialTests: "Patellar Grinding: positive, Joint line tenderness: medial",
        icdCode: "M17.12",
        clinicalNotes: "Mild joint effusion, medial joint line tenderness. Crepitus present during active flexion.",
        sessionsCount: 15,
        startDate: "2026-06-10",
        recoveryDate: "2026-08-30",
        therapist: "Dr. Ankita Kumar",
        selectedTherapies: ["Manual Therapy", "Exercise Therapy", "Thermotherapy"],
        phases: [
            { id: "1", name: "Phase 1: Pain Modulation & Soft Tissue Mobilization", sessions: "1-5", focus: "Initial recovery focus" },
            { id: "2", name: "Phase 2: Quadriceps & Gluteal Strengthening", sessions: "6-10", focus: "Intermediate strengthening" },
            { id: "3", name: "Phase 3: Proprioceptive & Functional Retraining", sessions: "11-15", focus: "Functional integration" }
        ]
    },
    {
        id: "TP-004",
        patientId: "P-0141",
        date: "2026-05-02",
        diagnosis: "Adhesive Capsulitis (Frozen Shoulder) - Freezing Phase",
        goals: "Restore shoulder ROM, reduce night pain, restore function",
        status: "Active",
        expectedRecovery: "4-6 Months",
        frequency: "3x weekly",
        therapyType: "Shoulder Mobilization",
        primaryComplaint: "Stiffness and pain in right shoulder, unable to lift arm above 90 degrees.",
        painScore: 6,
        painDuration: "1–6 months",
        painType: "Sharp",
        rom: "Abduction: 85°, Flexion: 95°, External Rotation: 20°",
        strength: "Deltoid: 4/5, Rotator Cuff: 3+/5",
        specialTests: "Neer's Test: positive, Hawkins-Kennedy Test: positive",
        icdCode: "M75.01",
        clinicalNotes: "Severe restriction in passive external rotation and abduction. Night pain is significant.",
        sessionsCount: 12,
        startDate: "2026-05-02",
        recoveryDate: "2026-08-15",
        therapist: "Dr. Kavita Rao",
        selectedTherapies: ["Manual Therapy", "Exercise Therapy", "Rehabilitation"],
        phases: [
            { id: "1", name: "Phase 1: Pain Relief & Gentle Mobilization", sessions: "1-4", focus: "Initial recovery focus" },
            { id: "2", name: "Phase 2: Active ROM & Stretching", sessions: "5-12", focus: "Intermediate strengthening" }
        ]
    },
    {
        id: "TP-005",
        patientId: "P-0139",
        date: "2026-04-10",
        diagnosis: "Post-ACL Reconstruction Rehab (Phase II)",
        goals: "Full terminal extension, hypertrophy of quadriceps, neuromuscular control",
        status: "Active",
        expectedRecovery: "6-9 Months",
        frequency: "4x weekly",
        therapyType: "ACL Post-op Rehab",
        primaryComplaint: "Post-op ACL reconstruction stiffness, mild instability on pivoting.",
        painScore: 3,
        painDuration: "1–4 weeks",
        painType: "Throbbing",
        rom: "Knee Extension: 0°, Knee Flexion: 125°",
        strength: "Quads: 4-/5, Hamstrings: 4/5",
        specialTests: "Lachman Test: Grade 1 (Firm Endpoint), Anterior Drawer: Mild laxity",
        icdCode: "M23.2",
        clinicalNotes: "Graft is stable. Quadriceps lag present. Working on terminal knee extension.",
        sessionsCount: 15,
        startDate: "2026-04-10",
        recoveryDate: "2026-07-25",
        therapist: "Dr. Ankita Kumar",
        selectedTherapies: ["Exercise Therapy", "Rehabilitation"],
        phases: [
            { id: "1", name: "Phase 1: ROM & Swelling Control (Completed)", sessions: "1-2", focus: "Initial recovery focus" },
            { id: "2", name: "Phase 2: Strength & Neuromuscular Control", sessions: "3-15", focus: "Intermediate strengthening" }
        ]
    }
];

const createNewBlankPlan = (patientId: string): TreatmentPlan => {
    const nextIdNum = Math.floor(100 + Math.random() * 900);
    return {
        id: `TP-${nextIdNum}`,
        patientId,
        date: new Date().toISOString().split("T")[0],
        diagnosis: "General Rehabilitation Case",
        goals: "1. Restore normal functional movement.\n2. Achieve pain-free mobility.\n3. Return to daily activities.",
        status: "Active",
        expectedRecovery: "4-8 Weeks",
        frequency: "2x per week",
        therapyType: "Physical Therapy",
        primaryComplaint: "Stiffness and restricted mobility",
        painScore: 5,
        painDuration: "1–4 weeks",
        painType: "Dull Ache",
        rom: "Normal",
        strength: "4/5",
        specialTests: "None",
        icdCode: "M99.9",
        clinicalNotes: "Patient has started active rehab. Focus on stability and stretching.",
        sessionsCount: 10,
        startDate: new Date().toISOString().split("T")[0],
        recoveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        therapist: "Dr. Ankita Kumar",
        selectedTherapies: ["Manual Therapy", "Exercise Therapy"],
        phases: [
            { id: "1", name: "Phase 1", sessions: "1–5", focus: "Initial pain modulation & ROM" },
            { id: "2", name: "Phase 2", sessions: "6–10", focus: "Strengthening & functional stability" }
        ]
    };
};

export default function TreatmentPlansPage({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const { open, openMobile, isMobile } = useSidebar()
    const isCollapsed = !isEmbedded && (isMobile ? !openMobile : !open)

    const [activePatient, setActivePatient] = React.useState("P-0142")
    const [plans, setPlans] = React.useState<TreatmentPlan[]>([])
    const [viewMode, setViewMode] = React.useState<"list" | "edit" | "new">("list")
    const [editingPlan, setEditingPlan] = React.useState<TreatmentPlan | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    // Load from localStorage
    React.useEffect(() => {
        const savedPlans = localStorage.getItem("sg-treatment-plans")
        if (savedPlans) {
            setPlans(JSON.parse(savedPlans))
        } else {
            localStorage.setItem("sg-treatment-plans", JSON.stringify(defaultPlans))
            setPlans(defaultPlans)
        }
    }, [])

    // Filter plans for the active patient
    const activePatientPlans = React.useMemo(() => {
        return plans.filter(p => p.patientId === activePatient)
    }, [plans, activePatient])

    const handleCreateNew = () => {
        const newPlan = createNewBlankPlan(activePatient)
        // Auto pre-fill diagnosis based on selected patient mock data
        if (activePatient === "P-0142") newPlan.diagnosis = "Knee OA (Kellgren-Lawrence Grade II)"
        if (activePatient === "P-0141") newPlan.diagnosis = "Adhesive Capsulitis (Frozen Shoulder)"
        if (activePatient === "P-0139") newPlan.diagnosis = "Post-ACL Reconstruction Rehab (Phase II)"

        setEditingPlan(newPlan)
        setViewMode("new")
    }

    const handleEditPlan = (plan: TreatmentPlan) => {
        setEditingPlan(JSON.parse(JSON.stringify(plan))) // deep copy
        setViewMode("edit")
    }

    const handleCancel = () => {
        setEditingPlan(null)
        setViewMode("list")
    }

    const handleSave = () => {
        if (!editingPlan) return
        setIsSaving(true)
        setTimeout(() => {
            let updatedPlans: TreatmentPlan[]
            if (viewMode === "new") {
                updatedPlans = [editingPlan, ...plans]
            } else {
                updatedPlans = plans.map(p => p.id === editingPlan.id ? editingPlan : p)
            }
            localStorage.setItem("sg-treatment-plans", JSON.stringify(updatedPlans))
            setPlans(updatedPlans)
            setViewMode("list")
            setEditingPlan(null)
            setIsSaving(false)
            toast.success("Treatment plan saved successfully.")
        }, 800)
    }

    const updateEditingPlan = (fields: Partial<TreatmentPlan>) => {
        if (editingPlan) {
            setEditingPlan(prev => prev ? ({ ...prev, ...fields }) : null)
        }
    }

    if (viewMode === "list") {
        return (
            <div className="flex-1 flex flex-col p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-4">
                <div className={`space-y-2 shrink-0 ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40 text-slate-500"
                        onClick={() => router.push(`/c/${company}/dashboard/patient-management/patients`)}
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Patients
                    </Button>
                </div>

                {/* Page Header Banner */}
                <div className="relative overflow-hidden border border-emerald-250/80 dark:border-emerald-900/30 rounded-2xl shadow-xs bg-gradient-to-r from-emerald-50 via-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 dark:bg-emerald-950/30 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className={`relative flex items-center gap-4 ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
                        <div className="p-3 bg-emerald-500 dark:bg-emerald-900 rounded-xl text-white shadow-sm">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-950 to-slate-750 dark:from-slate-550 dark:to-slate-200 bg-clip-text text-transparent">
                                Treatment Plans
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                                Goal setting, therapy types, session planning, and recovery tracking.
                            </p>
                        </div>
                    </div>
                    
                    {/* Controls Row */}
                    <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                        <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 pl-1.5">
                                Patient:
                            </span>
                            <select
                                className="px-2 py-0.5 border border-border rounded-[5px] text-[11px] bg-background text-brand-primary focus:outline-none font-bold h-7 cursor-pointer"
                                value={activePatient}
                                onChange={(e) => setActivePatient(e.target.value)}
                            >
                                <option value="P-0142">Ravi Kumar (P-0142)</option>
                                <option value="P-0141">Meera Shah (P-0141)</option>
                                <option value="P-0139">Arjun Singh (P-0139)</option>
                            </select>
                        </div>
                        <Button
                            onClick={handleCreateNew}
                            className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-550 dark:hover:bg-emerald-600 text-white rounded-xl shadow-xs cursor-pointer gap-1 px-4 py-2 font-bold"
                        >
                            <Plus className="h-3.5 w-3.5" /> Create New Plan
                        </Button>
                    </div>
                </div>

                {/* List Grid View in White Card - Siblings instead of Nested */}
                <div className="bg-card border border-border rounded-xl p-4 shadow-xs w-full flex-1 flex flex-col justify-between min-h-[400px]">
                    <Table className="table-fixed min-w-[800px]">
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold text-foreground/80 h-10 text-xs w-[10%]">Plan ID</TableHead>
                                <TableHead className="font-bold text-foreground/80 h-10 text-xs w-[12%]">Start Date</TableHead>
                                <TableHead className="font-bold text-foreground/80 h-10 text-xs w-[46%]">Diagnosis</TableHead>
                                <TableHead className="font-bold text-foreground/80 h-10 text-xs w-[10%]">Status</TableHead>
                                <TableHead className="font-bold text-foreground/80 h-10 text-xs w-[12%]">Therapist</TableHead>
                                <TableHead className="font-bold text-foreground/80 h-10 text-xs text-right w-[10%]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activePatientPlans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-xs font-semibold">
                                        No previous treatment plans found for this patient.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activePatientPlans.map((plan) => (
                                    <TableRow key={plan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-border text-xs text-foreground/80">
                                        <TableCell className="font-bold font-mono text-muted-foreground">{plan.id}</TableCell>
                                        <TableCell className="font-semibold text-foreground/75">{plan.startDate}</TableCell>
                                        <TableCell className="font-bold text-foreground truncate">{plan.diagnosis}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${plan.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                                    : plan.status === "Completed"
                                                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                                                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                                                }`}>
                                                {plan.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-foreground/75 font-semibold truncate">{plan.therapist}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] font-semibold border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-[4px] cursor-pointer gap-1"
                                                onClick={() => handleEditPlan(plan)}
                                            >
                                                <Pencil className="h-3 w-3 text-muted-foreground" /> Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-xs text-muted-foreground font-semibold shrink-0">
                        <div>
                            Showing {activePatientPlans.length} of {activePatientPlans.length} plans
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-not-allowed border border-border bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-[5px] opacity-50"
                                disabled
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-slate-500 font-bold">
                                Page 1 of 1
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-not-allowed border border-border bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-[5px] opacity-50"
                                disabled
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Editor View Mode
    return (
        <div className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className={isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40 text-slate-500"
                    onClick={handleCancel}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Plan History
                </Button>
            </div>

            <div className="border border-border bg-card rounded-xl shadow-xs overflow-hidden w-full">
                <div className="border-b border-border bg-white dark:bg-slate-900 px-5 py-3 flex items-center gap-1.5">
                    <span className={`text-slate-800 dark:text-slate-200 text-sm font-semibold uppercase tracking-wider ml-1 ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
                        {viewMode === "new" ? "CREATE NEW TREATMENT PLAN" : `EDIT PLAN: ${editingPlan?.id}`}
                    </span>
                </div>

                <div className="p-4 space-y-4">
                    {editingPlan && (
                        <>
                            <div className="text-[13px] font-bold text-foreground bg-card border border-border rounded-lg p-3 shadow-xs">
                                📋 Case Patient: <span className="text-brand-primary">{activePatient === "P-0142" ? "Ravi Kumar (P-0142)" : activePatient === "P-0141" ? "Meera Shah (P-0141)" : "Arjun Singh (P-0139)"}</span>
                            </div>

                            {/* 2-Column Form Editor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                <PlanDetails
                                    plan={editingPlan}
                                    onChange={updateEditingPlan}
                                />
                                <TherapyAndPhases
                                    selectedTherapies={editingPlan.selectedTherapies}
                                    onChangeTherapies={(therapies) => updateEditingPlan({ selectedTherapies: therapies })}
                                    phases={editingPlan.phases}
                                    onChangePhases={(phases) => updateEditingPlan({ phases })}
                                />
                            </div>

                            {/* Footer Actions bar */}
                            <PlanActionBtns
                                onCancel={handleCancel}
                                onSavePlan={handleSave}
                                isSaving={isSaving}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
