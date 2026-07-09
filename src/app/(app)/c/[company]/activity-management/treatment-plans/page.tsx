"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ClipboardList, ArrowLeft, Users, Eye, Pencil, Plus } from "lucide-react"
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

export default function TreatmentPlansPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

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
                
                {/* Browser-like Wireframe Container */}
                <div className="border-2 border-slate-300 bg-slate-50 rounded-[10px] overflow-hidden max-w-[1200px] mx-auto shadow-sm">
                    {/* wf-titlebar */}
                    <div className="bg-[#37474f] px-3.5 py-2 flex items-center justify-between">
                        <span className="text-[#cfd8dc] text-[11px] font-bold tracking-[0.5px] uppercase ml-2">
                            TREATMENT PLANS REGISTER
                        </span>
                        <Button 
                            onClick={handleCreateNew}
                            className="h-6.5 text-[10px] bg-[#27ae60] text-white hover:bg-[#219653] cursor-pointer rounded-[4px] font-semibold gap-1 px-2.5 py-0"
                        >
                            <Plus className="h-3 w-3" /> Create New Plan
                        </Button>
                    </div>
                    
                    {/* wf-content */}
                    <div className="p-4 space-y-4">
                        {/* Selector Row */}
                        <div className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5 flex-wrap bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                            <span>📋 Treatment Plans for</span>
                            <select 
                                className="px-2 py-0.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus:outline-none font-semibold h-7 cursor-pointer"
                                value={activePatient}
                                onChange={(e) => setActivePatient(e.target.value)}
                            >
                                <option value="P-0142">Ravi Kumar (P-0142)</option>
                                <option value="P-0141">Meera Shah (P-0141)</option>
                                <option value="P-0139">Arjun Singh (P-0139)</option>
                            </select>
                        </div>

                        {/* List Grid View in White Card */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-200">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-bold text-slate-700 h-10 text-xs">Plan ID</TableHead>
                                        <TableHead className="font-bold text-slate-700 h-10 text-xs">Start Date</TableHead>
                                        <TableHead className="font-bold text-slate-700 h-10 text-xs">Diagnosis</TableHead>
                                        <TableHead className="font-bold text-slate-700 h-10 text-xs">Status</TableHead>
                                        <TableHead className="font-bold text-slate-700 h-10 text-xs">Therapist</TableHead>
                                        <TableHead className="font-bold text-slate-700 h-10 text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activePatientPlans.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-slate-400 text-xs font-semibold">
                                                No previous treatment plans found for this patient.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        activePatientPlans.map((plan) => (
                                            <TableRow key={plan.id} className="hover:bg-slate-50 border-b border-slate-100 text-xs text-slate-700">
                                                <TableCell className="font-bold font-mono text-slate-500">{plan.id}</TableCell>
                                                <TableCell className="font-semibold text-slate-600">{plan.startDate}</TableCell>
                                                <TableCell className="font-bold text-slate-800">{plan.diagnosis}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                                        plan.status === "Active" 
                                                        ? "bg-[#eaf7ee] text-[#27ae60] border-[#27ae60]/30" 
                                                        : plan.status === "Completed"
                                                        ? "bg-[#e3f2fd] text-[#1a6eb5] border-[#1a6eb5]/30"
                                                        : "bg-[#fef2ee] text-[#e0431f] border-[#e0431f]/30"
                                                    }`}>
                                                        {plan.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-semibold">{plan.therapist}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-7 text-[10px] font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[4px] cursor-pointer gap-1"
                                                        onClick={() => handleEditPlan(plan)}
                                                    >
                                                        <Pencil className="h-3 w-3 text-slate-500" /> Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Editor View Mode
    return (
        <div className="flex-1 p-6 space-y-6">
            <div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40 text-slate-500" 
                    onClick={handleCancel}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Plan History
                </Button>
            </div>
            
            <div className="max-w-7xl mx-auto border-2 border-slate-300 bg-slate-50 rounded-[10px] shadow-sm overflow-hidden">
                <div className="bg-[#37474f] px-3.5 py-2 flex items-center gap-1.5">
                    <span className="text-[#cfd8dc] text-[11px] font-bold tracking-[0.5px] uppercase ml-2">
                        {viewMode === "new" ? "CREATE NEW TREATMENT PLAN" : `EDIT PLAN: ${editingPlan?.id}`}
                    </span>
                </div>
                
                <div className="p-4 space-y-4">
                    {editingPlan && (
                        <>
                            <div className="text-[13px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                                📋 Case Patient: <span className="text-[#1a6eb5]">{activePatient === "P-0142" ? "Ravi Kumar (P-0142)" : activePatient === "P-0141" ? "Meera Shah (P-0141)" : "Arjun Singh (P-0139)"}</span>
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
