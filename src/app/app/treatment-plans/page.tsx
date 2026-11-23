"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardList, FilePlay, Plus, Printer, RefreshCw, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowChromeTabs,
  DentflowDrawer,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import { TreatmentPlanRecord } from "@/types/dentflow";

const PIPELINE_STEPS: TreatmentPlanRecord["pipelineStep"][] = [
  "Proposed",
  "Explained",
  "Accepted",
  "In progress",
  "Completed",
  "Review",
];

export default function TreatmentPlansPage() {
  const router = useRouter();
  const { state, updateState } = useDentflow();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    state.treatmentPlans[0]?.id || "",
  );
  const plan =
    state.treatmentPlans.find((tp) => tp.id === selectedPlanId) ||
    state.treatmentPlans[0];

  const [addProcOpen, setAddProcOpen] = useState(false);
  const [newProcName, setNewProcName] = useState("Post & core build-up");
  const [newProcTooth, setNewProcTooth] = useState("36");
  const [newProcFee, setNewProcFee] = useState("3500");

  // New Treatment Plan Drawer State
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [npPatientId, setNpPatientId] = useState<string>(state.patients[0]?.id || "");
  const [npInlinePatient, setNpInlinePatient] = useState(false);
  const [npNewPatientName, setNpNewPatientName] = useState("");
  const [npNewPatientPhone, setNpNewPatientPhone] = useState("");
  const [npNewPatientAge, setNpNewPatientAge] = useState("32");
  const [npDoctor, setNpDoctor] = useState("Dr. Sneha Kulkarni");
  const [npBranch, setNpBranch] = useState("Station Road branch");
  const [npDate, setNpDate] = useState("4 Oct 2026");
  const [npDiagnosis, setNpDiagnosis] = useState("Irreversible pulpitis tooth 36, missing 46");
  const [npStatus, setNpStatus] = useState<TreatmentPlanRecord["pipelineStep"]>("Proposed");
  const [npProcedures, setNpProcedures] = useState([
    { id: "proc-1", tooth: "36", procedure: "Root canal treatment (molar)", stageNum: 1, fee: 8000, discount: 500, doctor: "Dr. Sneha" },
    { id: "proc-2", tooth: "36", procedure: "CAD/CAM Zirconia crown", stageNum: 2, fee: 14500, discount: 1000, doctor: "Dr. Arjun" },
  ]);
  const [npOptionA, setNpOptionA] = useState({ title: "Option A · Zirconia Crown (5-yr warranty)", price: 21000, subtitle: "Full biocompatible CAD/CAM zirconia restoration" });
  const [npOptionB, setNpOptionB] = useState({ title: "Option B · PFM Porcelain-Fused-to-Metal", price: 16500, subtitle: "Metal ceramic crown restoration" });
  const [npOptionC, setNpOptionC] = useState({ title: "Option C · Direct Composite Restoration", price: 11000, subtitle: "Core build-up only" });
  const [npRecommendedOption, setNpRecommendedOption] = useState<"A" | "B" | "C">("A");
  const [npDiscount, setNpDiscount] = useState("1500");
  const [npInsuranceEstimate, setNpInsuranceEstimate] = useState("0");
  const [npEmiActive, setNpEmiActive] = useState(false);
  const [npEmiInstallments, setNpEmiInstallments] = useState(3);
  const [npClinicalNotes, setNpClinicalNotes] = useState("Discussed treatment steps, prognosis, and warranties with the patient. Digital radiograph reviewed.");
  const [npConsentSigned, setNpConsentSigned] = useState(true);

  const handleCreateTreatmentPlan = (e: React.FormEvent) => {
    e.preventDefault();
    let patientId = npPatientId;
    let patientName = state.patients.find((p) => p.id === patientId)?.name || "Patient";

    let updatedPatients = state.patients;
    if (npInlinePatient) {
      if (!npNewPatientName.trim()) {
        toast.error("Please enter the patient's full name");
        return;
      }
      const newPatId = `pat-${Date.now()}`;
      patientId = newPatId;
      patientName = npNewPatientName.trim();
      const newPat = {
        ...state.patients[0],
        id: newPatId,
        code: `P-${1000 + state.patients.length}`,
        name: patientName,
        phone: npNewPatientPhone ? `+91 ${npNewPatientPhone.replace(/\D/g, "").slice(-10)}` : "+91 98220 11000",
        age: parseInt(npNewPatientAge, 10) || 30,
        patientSince: "Today",
        visitsCount: 1,
        flags: ["New" as const],
      };
      updatedPatients = [newPat, ...state.patients];
    }

    const planTotal = npProcedures.reduce((acc, p) => acc + (p.fee || 0), 0);
    const discNum = Number(npDiscount) || 0;
    const balance = Math.max(0, planTotal - discNum);
    const newPlanCode = `TP-${2230 + state.treatmentPlans.length + 1}`;

    const newRecord: TreatmentPlanRecord = {
      id: `tp-${Date.now()}`,
      planCode: newPlanCode,
      patientId,
      patientName,
      proposedBy: npDoctor,
      proposedDate: npDate,
      pipelineStep: npStatus,
      pipelineDates: {
        Proposed: npDate,
        Explained: npStatus !== "Proposed" ? npDate : "—",
        Accepted: npStatus === "Accepted" || npStatus === "In progress" || npStatus === "Completed" ? npDate : "—",
        "In progress": npStatus === "In progress" || npStatus === "Completed" ? npDate : "—",
        Completed: npStatus === "Completed" ? npDate : "—",
        Review: "—",
      },
      options: [
        { code: "A", label: "Option A", title: npOptionA.title, price: npOptionA.price, subtitle: npOptionA.subtitle, recommended: npRecommendedOption === "A", patientChose: npRecommendedOption === "A" },
        { code: "B", label: "Option B", title: npOptionB.title, price: npOptionB.price, subtitle: npOptionB.subtitle, recommended: npRecommendedOption === "B", patientChose: npRecommendedOption === "B" },
        { code: "C", label: "Option C", title: npOptionC.title, price: npOptionC.price, subtitle: npOptionC.subtitle, recommended: npRecommendedOption === "C", patientChose: npRecommendedOption === "C" },
      ],
      stages: npProcedures.map((proc, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        stageNum: proc.stageNum || idx + 1,
        procedure: proc.procedure,
        tooth: proc.tooth,
        doctor: proc.doctor,
        visitLabel: idx === 0 ? "Sitting 1" : `Sitting ${idx + 1}`,
        fee: proc.fee,
        status: "Not booked",
      })),
      costSummary: {
        planTotal,
        discount: discNum,
        insuranceEstimate: npInsuranceEstimate ? `₹${Number(npInsuranceEstimate).toLocaleString("en-IN")}` : "None",
        paidSoFar: 0,
        balance,
        labCostInternal: Math.round(planTotal * 0.22),
      },
      emiPlan: {
        active: npEmiActive,
        installments: npEmiInstallments,
        amountPerMonth: Math.round(balance / Math.max(1, npEmiInstallments)),
        debitDay: 5,
        lendingPartner: "Bajaj Finserv Health",
      },
      engagement: {
        sentInfo: `Created by ${npDoctor} on ${npDate}`,
        watchedInfo: "Pending patient review",
        acceptedInfo: npStatus === "Accepted" ? "Accepted by patient" : "Awaiting consent",
      },
    };

    const auditEntry = {
      id: `dl-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      isoTimestamp: new Date().toISOString(),
      actor: npDoctor,
      role: state.activeRole,
      patientName,
      screenName: "Treatment plans",
      action: "CREATE_TREATMENT_PLAN",
      entityType: "patient" as const,
      entityId: patientId,
      details: `Created treatment plan ${newPlanCode} (${newRecord.stages.length} procedures, ₹${planTotal.toLocaleString("en-IN")})`,
    };

    updateState((prev) => ({
      ...prev,
      patients: updatedPatients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              openPlanSummary: {
                planCode: newPlanCode,
                title: newRecord.stages[0]?.procedure || "Dental treatment plan",
                total: planTotal,
                stageLabel: `Stage 1 of ${newRecord.stages.length}`,
                nextSitting: "Consultation booked",
              },
              recentActivity: [
                {
                  date: "Today",
                  text: `Treatment plan ${newPlanCode} proposed (${npStatus})`,
                },
                ...(p.recentActivity || []),
              ],
            }
          : p
      ),
      treatmentPlans: [newRecord, ...prev.treatmentPlans],
      dpdpAccessLogs: [auditEntry, ...prev.dpdpAccessLogs].slice(0, 500),
    }));

    setSelectedPlanId(newRecord.id);
    setNewPlanOpen(false);
    toast.success(`Treatment plan ${newPlanCode} created for ${patientName}!`);
  };

  // Stage booking drawer state
  const [bookingStage, setBookingStage] = useState<{
    id: string;
    stageNum: number;
    procedure: string;
    doctor: string;
  } | null>(null);
  const [bookingDate, setBookingDate] = useState("Tue 6 Oct 2026");
  const [bookingTime, setBookingTime] = useState("10:30 AM");
  const [bookingDoctor, setBookingDoctor] = useState("Dr. Sneha Kulkarni");
  const [bookingChair, setBookingChair] = useState("Chair 2");

  const handleSelectOption = (code: "A" | "B" | "C") => {
    updateState((prev) => ({
      ...prev,
      treatmentPlans: prev.treatmentPlans.map((tp) => {
        if (tp.id !== plan.id) return tp;
        const chosen = tp.options.find((o) => o.code === code);
        const newTotal = chosen ? chosen.price + 1500 : tp.costSummary.planTotal;
        return {
          ...tp,
          options: tp.options.map((o) => ({
            ...o,
            patientChose: o.code === code,
          })),
          costSummary: {
            ...tp.costSummary,
            planTotal: newTotal,
            balance: Math.max(0, newTotal - tp.costSummary.paidSoFar),
          },
        };
      }),
    }));
    toast.success(`Option ${code} selected on ${plan.planCode}`);
  };

  const handleConfirmStageBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingStage) return;

    const visitLabel = `${bookingDate.split(" ")[0]} ${bookingDate.split(" ")[1]} ${bookingDate.split(" ")[2] || ""}, ${bookingTime}`;

    updateState((prev) => ({
      ...prev,
      treatmentPlans: prev.treatmentPlans.map((tp) =>
        tp.id !== plan.id
          ? tp
          : {
              ...tp,
              stages: tp.stages.map((st) =>
                st.id === bookingStage.id
                  ? {
                      ...st,
                      status: "Booked" as const,
                      visitLabel,
                      doctor: bookingDoctor.split(" ")[1] || bookingDoctor,
                    }
                  : st,
              ),
            },
      ),
      patients: prev.patients.map((p) =>
        p.id !== plan.patientId
          ? p
          : {
              ...p,
              openPlanSummary: p.openPlanSummary
                ? {
                    ...p.openPlanSummary,
                    nextSitting: `next sitting ${visitLabel}`,
                  }
                : undefined,
            },
      ),
    }));

    toast.success(
      `Stage ${bookingStage.stageNum} (${bookingStage.procedure}) booked for ${visitLabel} with ${bookingDoctor}!`,
    );
    setBookingStage(null);
  };

  const handleBookStage3 = () => {
    const stage3 = plan.stages.find((st) => st.stageNum === 3) || plan.stages[plan.stages.length - 1];
    if (stage3) {
      setBookingStage(stage3);
      setBookingDoctor("Dr. Sneha Kulkarni");
      setBookingDate("Tue 6 Oct 2026");
      setBookingTime("10:30 AM");
    }
  };

  const handleAddProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    const feeNum = Math.max(0, Number(newProcFee) || 0);
    updateState((prev) => ({
      ...prev,
      treatmentPlans: prev.treatmentPlans.map((tp) =>
        tp.id !== plan.id
          ? tp
          : {
              ...tp,
              stages: [
                ...tp.stages,
                {
                  id: `st-${Date.now()}`,
                  stageNum: 3,
                  procedure: newProcName,
                  tooth: newProcTooth,
                  doctor: "Dr. Sneha",
                  visitLabel: "Not scheduled",
                  fee: feeNum,
                  status: "Not booked",
                },
              ],
              costSummary: {
                ...tp.costSummary,
                planTotal: tp.costSummary.planTotal + feeNum,
                balance: tp.costSummary.balance + feeNum,
              },
            },
      ),
    }));
    setAddProcOpen(false);
    toast.success(`Added ${newProcName} to ${plan.planCode}`);
  };

  const activeIdx = PIPELINE_STEPS.indexOf(plan.pipelineStep);

  return (
    <div>
      <DentflowPageHeader
        title={`Treatment plan ${plan.planCode} · ${plan.patientName}`}
        subtitle={`Proposed by ${plan.proposedBy} on ${plan.proposedDate}`}
      />

      {/* Top Chrome Tab Bar & Plan Switcher with + New Treatment Plan button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <DentflowChromeTabs
          activeId="plans"
          tabs={[
            { id: "plans", label: "Plans", href: "/app/treatment-plans", icon: ClipboardList },
            { id: "explainer", label: "Explainer", href: "/app/explainers", icon: FilePlay },
          ]}
        />

        <div className="flex items-center gap-2.5">
          {state.treatmentPlans.length > 1 && (
            <select
              aria-label="Select treatment plan"
              value={plan.id}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--df-text)]"
            >
              {state.treatmentPlans.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.planCode} · {tp.patientName} ({tp.pipelineStep})
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setNewPlanOpen(true)}
            className="df-btn-primary px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Treatment Plan</span>
          </button>
        </div>
      </div>

      {/* 6-step Pipeline Card */}
      <div className="df-card p-3.5 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIdx;
            const isCurrent = idx === activeIdx;
            return (
              <button
                key={step}
                type="button"
                onClick={() =>
                  updateState((prev) => ({
                    ...prev,
                    treatmentPlans: prev.treatmentPlans.map((tp) =>
                      tp.id === plan.id ? { ...tp, pipelineStep: step } : tp,
                    ),
                  }))
                }
                className={`text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[var(--df-teal-soft)] border-[var(--df-teal-border)]"
                    : "bg-[var(--df-surface-muted)] border-[var(--df-border)] hover:bg-[var(--df-surface-hover)]"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent ? "text-[var(--df-teal)]" : "text-[var(--df-text)]"
                    }`}
                  >
                    {step}
                  </span>
                  {isCompleted && (
                    <span className="h-4 w-4 rounded-full bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] inline-flex items-center justify-center">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isCurrent
                      ? "text-[var(--df-teal)] font-semibold"
                      : "text-[var(--df-text-muted)]"
                  }`}
                >
                  {plan.pipelineDates[step]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col area */}
        <div className="xl:col-span-8 space-y-5">
          {/* Options shown to patient */}
          <div className="df-card p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Options shown to patient
              </h2>
              <button
                type="button"
                onClick={() => toast.info("Option D template ready — customize fees in plan")}
                className="df-btn-secondary inline-flex items-center gap-1 px-2.5 py-1 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add option
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plan.options.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelectOption(opt.code)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    opt.patientChose
                      ? "border-[var(--df-teal)] bg-[var(--df-teal-soft)]/35 ring-1 ring-[var(--df-teal)]"
                      : "border-[var(--df-border)] bg-[var(--df-surface)] hover:border-[var(--df-border-strong)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="text-[11px] font-semibold text-[var(--df-text-muted)]">
                      {opt.label}
                    </span>
                    {opt.recommended && (
                      <DentflowStatusPill label="Recommended" tone="teal" />
                    )}
                    {opt.patientChose && (
                      <DentflowStatusPill label="Patient chose" tone="green" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-[var(--df-text)]">{opt.title}</p>
                  <p className="df-serif text-xl font-semibold text-[var(--df-text)] mt-1">
                    ₹{opt.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-[var(--df-text-muted)] mt-1">
                    {opt.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Stages · Option A */}
          <div className="df-card p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Stages · Option A
              </h2>
              <button
                type="button"
                onClick={() => setAddProcOpen(true)}
                className="df-btn-secondary inline-flex items-center gap-1 px-2.5 py-1 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add procedure
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2 pr-2 text-left">#</th>
                    <th className="py-2 px-2 text-left">Procedure</th>
                    <th className="py-2 px-2 text-left">Tooth</th>
                    <th className="py-2 px-2 text-left">Doctor</th>
                    <th className="py-2 px-2 text-left">Visit</th>
                    <th className="py-2 px-2 text-right">Fee</th>
                    <th className="py-2 px-2 text-right">Status</th>
                    <th className="py-2 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.stages.map((st) => (
                    <tr
                      key={st.id}
                      className="border-b border-[var(--df-border)] last:border-b-0 hover:bg-[var(--df-surface-hover)]/60"
                    >
                      <td className="py-2.5 pr-2 text-[var(--df-text-muted)] font-medium">
                        {st.stageNum}
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-[var(--df-text)]">
                        {st.procedure}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">{st.tooth}</td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">{st.doctor}</td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                        {st.visitLabel}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-[var(--df-text)]">
                        {st.includedInPrev
                          ? "incl."
                          : `₹${st.fee.toLocaleString("en-IN")}`}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <DentflowStatusPill
                          label={st.status}
                          tone={
                            st.status === "Done"
                              ? "green"
                              : st.status === "Booked"
                              ? "blue"
                              : "amber"
                          }
                        />
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        {st.status === "Not booked" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setBookingStage(st);
                              setBookingDoctor(st.doctor.includes("Arjun") ? "Dr. Arjun Mehta" : "Dr. Sneha Kulkarni");
                            }}
                            className="df-btn-primary px-2.5 py-1 text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap"
                          >
                            Book sitting
                          </button>
                        ) : st.status === "Booked" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setBookingStage(st);
                              setBookingDoctor(st.doctor.includes("Arjun") ? "Dr. Arjun Mehta" : "Dr. Sneha Kulkarni");
                            }}
                            className="df-btn-secondary px-2 py-0.5 text-[11px] font-medium cursor-pointer whitespace-nowrap"
                          >
                            Reschedule
                          </button>
                        ) : (
                          <span className="text-[11px] text-[var(--df-text-muted)]">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] text-xs text-[var(--df-text-secondary)]">
              <strong className="font-semibold text-[var(--df-status-amber-text)]">
                Recovery rule:
              </strong>{" "}
              if stage 3 is not booked within 14 days of stage 2, this plan moves to Treatment
              recovery with an EMI reminder.
            </div>
          </div>
        </div>

        {/* Right 4-col stack */}
        <div className="xl:col-span-4 space-y-4">
          {/* Cost summary */}
          <div className="df-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--df-text)]">Cost summary</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Plan total</span>
                <span className="font-semibold text-[var(--df-text)]">
                  ₹{plan.costSummary.planTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Discount</span>
                <span className="text-[var(--df-text-secondary)]">
                  − ₹{plan.costSummary.discount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Insurance estimate</span>
                <span className="text-[var(--df-text-secondary)]">
                  {plan.costSummary.insuranceEstimate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Paid so far</span>
                <span className="font-semibold text-[var(--df-status-green-text)]">
                  ₹{plan.costSummary.paidSoFar.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--df-border)] flex justify-between items-baseline">
                <span className="font-bold text-[var(--df-text)]">Balance</span>
                <span className="df-serif text-lg font-semibold text-[var(--df-text)]">
                  ₹{plan.costSummary.balance.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--df-text-muted)]">Lab cost (internal)</span>
                <span className="text-[var(--df-text-muted)]">
                  ₹{plan.costSummary.labCostInternal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {plan.emiPlan.active && (
              <div className="p-3 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-xs space-y-0.5">
                <p className="font-bold text-[var(--df-teal)]">EMI plan active</p>
                <p className="text-[11px] text-[var(--df-text-secondary)]">
                  {plan.emiPlan.installments} × ₹
                  {plan.emiPlan.amountPerMonth.toLocaleString("en-IN")} · UPI AutoPay on the{" "}
                  {plan.emiPlan.debitDay}th · 0% via {plan.emiPlan.lendingPartner}
                </p>
              </div>
            )}
          </div>

          {/* Patient engagement */}
          <div className="df-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--df-text)]">Patient engagement</h2>
            <div className="space-y-2 text-xs text-[var(--df-text-secondary)]">
              <p>{plan.engagement.sentInfo}</p>
              <p className="font-semibold text-[var(--df-status-green-text)]">
                {plan.engagement.acceptedInfo}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/app/explainers")}
              className="w-full df-btn-secondary py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" /> Resend explainer
            </button>
          </div>

          {/* Bottom CTAs */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleBookStage3}
              className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
            >
              Book stage 3 (crown)
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success("Generated signed treatment plan PDF (TP-2231)");
                window.print();
              }}
              className="w-full df-btn-secondary py-2.5 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" /> Print plan / share PDF
            </button>
          </div>
        </div>
      </div>

      {/* Add Procedure Drawer */}
      <DentflowDrawer
        open={addProcOpen}
        onClose={() => setAddProcOpen(false)}
        title="Add procedure to plan"
        subtitle={`${plan.planCode} · ${plan.patientName}`}
      >
        <form onSubmit={handleAddProcedure} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Procedure name
            </label>
            <input
              type="text"
              required
              value={newProcName}
              onChange={(e) => setNewProcName(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
                Tooth (FDI)
              </label>
              <input
                type="text"
                value={newProcTooth}
                onChange={(e) => setNewProcTooth(e.target.value)}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
                Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={newProcFee}
                onChange={(e) => setNewProcFee(e.target.value)}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
              />
            </div>
          </div>
          <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
            Add stage item
          </button>
        </form>
      </DentflowDrawer>

      {/* Book Sitting / Stage Planner Drawer */}
      {bookingStage && (
        <DentflowDrawer
          open={Boolean(bookingStage)}
          onClose={() => setBookingStage(null)}
          title={`Book Sitting · Stage ${bookingStage.stageNum}`}
          subtitle={`${plan.planCode} · ${plan.patientName} · ${bookingStage.procedure}`}
        >
          <form onSubmit={handleConfirmStageBooking} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] space-y-1">
              <p className="font-bold text-[var(--df-teal)]">Clinical Sitting Details</p>
              <p className="text-[11px] text-[var(--df-text-secondary)]">
                Procedure: <strong className="text-[var(--df-text)]">{bookingStage.procedure}</strong>
              </p>
              <p className="text-[11px] text-[var(--df-text-muted)]">
                Patient comfort anxiety buffer: +15 mins automatically allocated
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
                Attending Dentist
              </label>
              <select
                value={bookingDoctor}
                onChange={(e) => setBookingDoctor(e.target.value)}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
              >
                <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni (Principal / Endo)</option>
                <option value="Dr. Arjun Mehta">Dr. Arjun Mehta (Associate Dentist)</option>
                <option value="Dr. Farhan Ali">Dr. Farhan Ali (Visiting Surgeon)</option>
                <option value="Dr. Karan Shah">Dr. Karan Shah (Orthodontist)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
                  Operatory Chair
                </label>
                <select
                  value={bookingChair}
                  onChange={(e) => setBookingChair(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                >
                  <option value="Chair 1">Chair 1 · General</option>
                  <option value="Chair 2">Chair 2 · Surgery/Endo</option>
                  <option value="Chair 3">Chair 3 · Ortho</option>
                  <option value="Chair 4">Chair 4 · Implant Suite</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
                  Sitting Slot
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                >
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
                Appointment Date
              </label>
              <input
                type="text"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs font-mono"
                placeholder="e.g. Tue 6 Oct 2026"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full df-btn-primary py-2.5 text-xs font-semibold cursor-pointer shadow-xs"
              >
                Confirm Sitting &amp; Add to Calendar
              </button>
            </div>
          </form>
        </DentflowDrawer>
      )}

      {/* New Treatment Plan Drawer */}
      <DentflowDrawer
        open={newPlanOpen}
        onClose={() => setNewPlanOpen(false)}
        title="Create New Treatment Plan"
        subtitle="Patient options, procedures, multi-sitting pipeline & financial summary"
      >
        <form onSubmit={handleCreateTreatmentPlan} className="space-y-4 text-xs pb-6">
          {/* 1. Patient Selection or Inline Create */}
          <div className="space-y-2 p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[var(--df-text)]">Patient Information</label>
              <button
                type="button"
                onClick={() => setNpInlinePatient((v) => !v)}
                className="text-[11px] font-semibold text-[var(--df-teal)] hover:underline cursor-pointer"
              >
                {npInlinePatient ? "← Select existing patient" : "+ Inline create new patient"}
              </button>
            </div>

            {npInlinePatient ? (
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ramesh Joshi"
                    value={npNewPatientName}
                    onChange={(e) => setNpNewPatientName(e.target.value)}
                    className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">WhatsApp Phone</label>
                    <input
                      required
                      type="tel"
                      placeholder="98220 12345"
                      value={npNewPatientPhone}
                      onChange={(e) => setNpNewPatientPhone(e.target.value)}
                      className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">Age</label>
                    <input
                      type="number"
                      value={npNewPatientAge}
                      onChange={(e) => setNpNewPatientAge(e.target.value)}
                      className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">Select Patient</label>
                <select
                  value={npPatientId}
                  onChange={(e) => setNpPatientId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 font-medium"
                >
                  {state.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) · {p.phone} · {p.homeBranch}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Doctor, Branch & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold mb-1">Attending Doctor</label>
              <select
                value={npDoctor}
                onChange={(e) => setNpDoctor(e.target.value)}
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
              >
                <option>Dr. Sneha Kulkarni</option>
                <option>Dr. Arjun Mehta</option>
                <option>Dr. Farhan Ali</option>
                <option>Dr. Karan Shah</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Branch</label>
              <select
                value={npBranch}
                onChange={(e) => setNpBranch(e.target.value)}
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
              >
                <option>Station Road branch</option>
                <option>Civil Lines branch</option>
                <option>MG Road branch</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Proposed Date</label>
              <input
                type="text"
                value={npDate}
                onChange={(e) => setNpDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 font-mono"
              />
            </div>
          </div>

          {/* 3. Diagnosis & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Diagnosis / Chief Complaint</label>
              <input
                type="text"
                placeholder="e.g. Irreversible pulpitis tooth 36, missing 46"
                value={npDiagnosis}
                onChange={(e) => setNpDiagnosis(e.target.value)}
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Initial Status</label>
              <select
                value={npStatus}
                onChange={(e) => setNpStatus(e.target.value as TreatmentPlanRecord["pipelineStep"])}
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 font-bold"
              >
                <option value="Proposed">Proposed</option>
                <option value="Accepted">Accepted</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* 4. Procedure Rows */}
          <div className="space-y-2 pt-2 border-t border-[var(--df-border)]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[var(--df-text)]">
                Procedures &amp; Clinical Sittings ({npProcedures.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  setNpProcedures([
                    ...npProcedures,
                    {
                      id: `proc-${Date.now()}`,
                      tooth: "General",
                      procedure: "Scaling & polishing",
                      stageNum: npProcedures.length + 1,
                      fee: 1500,
                      discount: 0,
                      doctor: "Dr. Arjun",
                    },
                  ])
                }
                className="df-btn-secondary px-2.5 py-1 text-[11px] inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add procedure
              </button>
            </div>

            <div className="space-y-2">
              {npProcedures.map((proc, idx) => (
                <div
                  key={proc.id}
                  className="p-2.5 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-2">
                    <label className="block text-[10px] text-[var(--df-text-muted)]">Tooth #</label>
                    <input
                      type="text"
                      value={proc.tooth}
                      onChange={(e) => {
                        const updated = [...npProcedures];
                        updated[idx] = { ...updated[idx], tooth: e.target.value };
                        setNpProcedures(updated);
                      }}
                      className="w-full rounded border border-[var(--df-border)] px-1.5 py-1 font-mono text-center"
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[10px] text-[var(--df-text-muted)]">Procedure</label>
                    <input
                      type="text"
                      value={proc.procedure}
                      onChange={(e) => {
                        const updated = [...npProcedures];
                        updated[idx] = { ...updated[idx], procedure: e.target.value };
                        setNpProcedures(updated);
                      }}
                      className="w-full rounded border border-[var(--df-border)] px-2 py-1 font-medium"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-[var(--df-text-muted)]">Stage</label>
                    <input
                      type="number"
                      min="1"
                      value={proc.stageNum}
                      onChange={(e) => {
                        const updated = [...npProcedures];
                        updated[idx] = { ...updated[idx], stageNum: Number(e.target.value) };
                        setNpProcedures(updated);
                      }}
                      className="w-full rounded border border-[var(--df-border)] px-1.5 py-1 text-center"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-[var(--df-text-muted)]">Fee (₹)</label>
                    <input
                      type="number"
                      value={proc.fee}
                      onChange={(e) => {
                        const updated = [...npProcedures];
                        updated[idx] = { ...updated[idx], fee: Number(e.target.value) };
                        setNpProcedures(updated);
                      }}
                      className="w-full rounded border border-[var(--df-border)] px-2 py-1 font-semibold text-right"
                    />
                  </div>

                  <div className="col-span-1 flex justify-end pt-3">
                    <button
                      type="button"
                      disabled={npProcedures.length <= 1}
                      onClick={() => setNpProcedures(npProcedures.filter((_, i) => i !== idx))}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded cursor-pointer disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Multi-Option Comparison Setup (A / B / C) */}
          <div className="space-y-2 pt-2 border-t border-[var(--df-border)]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[var(--df-text)]">
                Multi-Option Comparison (Options A / B / C)
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[var(--df-text-muted)]">Recommended:</span>
                {(["A", "B", "C"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setNpRecommendedOption(opt)}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                      npRecommendedOption === opt
                        ? "bg-[var(--df-teal)] text-white"
                        : "bg-[var(--df-surface-muted)] text-[var(--df-text-muted)] border border-[var(--df-border)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[var(--df-teal)]">Option A {npRecommendedOption === "A" && "★ Recommended"}</span>
                  <div className="flex items-center gap-1">
                    <span>₹</span>
                    <input
                      type="number"
                      value={npOptionA.price}
                      onChange={(e) => setNpOptionA({ ...npOptionA, price: Number(e.target.value) })}
                      className="w-20 rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-1.5 py-0.5 text-right font-bold"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={npOptionA.title}
                  onChange={(e) => setNpOptionA({ ...npOptionA, title: e.target.value })}
                  className="w-full rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1 text-[11px] mb-1"
                />
                <input
                  type="text"
                  value={npOptionA.subtitle}
                  onChange={(e) => setNpOptionA({ ...npOptionA, subtitle: e.target.value })}
                  className="w-full rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1 text-[10px] text-[var(--df-text-muted)]"
                />
              </div>

              <div className="p-2.5 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[var(--df-text)]">Option B {npRecommendedOption === "B" && "★ Recommended"}</span>
                  <div className="flex items-center gap-1">
                    <span>₹</span>
                    <input
                      type="number"
                      value={npOptionB.price}
                      onChange={(e) => setNpOptionB({ ...npOptionB, price: Number(e.target.value) })}
                      className="w-20 rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-1.5 py-0.5 text-right font-bold"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={npOptionB.title}
                  onChange={(e) => setNpOptionB({ ...npOptionB, title: e.target.value })}
                  className="w-full rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1 text-[11px] mb-1"
                />
                <input
                  type="text"
                  value={npOptionB.subtitle}
                  onChange={(e) => setNpOptionB({ ...npOptionB, subtitle: e.target.value })}
                  className="w-full rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1 text-[10px] text-[var(--df-text-muted)]"
                />
              </div>
            </div>
          </div>

          {/* 6. Financial Summary & EMI */}
          <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-2.5">
            <h4 className="font-bold text-[var(--df-text)]">Financial Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block text-[10.5px] text-[var(--df-text-muted)]">Total Plan Fee</label>
                <div className="font-bold text-sm text-[var(--df-text)]">
                  ₹{npProcedures.reduce((acc, p) => acc + (p.fee || 0), 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <label className="block text-[10.5px] text-[var(--df-text-muted)]">Discount (₹)</label>
                <input
                  type="number"
                  value={npDiscount}
                  onChange={(e) => setNpDiscount(e.target.value)}
                  className="w-full rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1 text-xs font-semibold text-right"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-[var(--df-text-muted)]">Insurance (₹)</label>
                <input
                  type="number"
                  value={npInsuranceEstimate}
                  onChange={(e) => setNpInsuranceEstimate(e.target.value)}
                  className="w-full rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1 text-xs text-right"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-[var(--df-text-muted)]">Patient Payable</label>
                <div className="font-bold text-sm text-[var(--df-teal)]">
                  ₹{Math.max(
                    0,
                    npProcedures.reduce((acc, p) => acc + (p.fee || 0), 0) -
                      (Number(npDiscount) || 0) -
                      (Number(npInsuranceEstimate) || 0),
                  ).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[var(--df-border)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={npEmiActive}
                  onChange={(e) => setNpEmiActive(e.target.checked)}
                  className="rounded text-[var(--df-teal)]"
                />
                <span className="font-semibold text-xs">Enable 0% Interest EMI AutoPay</span>
              </label>
              {npEmiActive && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span>Tenure:</span>
                  <select
                    value={npEmiInstallments}
                    onChange={(e) => setNpEmiInstallments(Number(e.target.value))}
                    className="rounded border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-0.5 text-xs font-bold"
                  >
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={9}>9 months</option>
                    <option value={12}>12 months</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 7. Clinical Notes & Doctor Consent */}
          <div>
            <label className="block font-semibold mb-1">Clinical Notes &amp; Findings</label>
            <textarea
              rows={2}
              value={npClinicalNotes}
              onChange={(e) => setNpClinicalNotes(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              required
              checked={npConsentSigned}
              onChange={(e) => setNpConsentSigned(e.target.checked)}
              className="mt-0.5 rounded text-[var(--df-teal)]"
            />
            <span className="text-[11px] text-[var(--df-text-secondary)]">
              Clinical estimate confirmed with attending dentist signature and patient DPDP consent log.
            </span>
          </label>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setNewPlanOpen(false)}
              className="df-btn-secondary px-4 py-2 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="df-btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
            >
              Create Treatment Plan
            </button>
          </div>
        </form>
      </DentflowDrawer>
    </div>
  );
}

