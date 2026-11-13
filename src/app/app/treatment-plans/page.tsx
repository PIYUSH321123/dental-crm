"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardList, FilePlay, Plus, Printer, RefreshCw, Send } from "lucide-react";
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

  const plan = state.treatmentPlans[0];
  const [addProcOpen, setAddProcOpen] = useState(false);
  const [newProcName, setNewProcName] = useState("Post & core build-up");
  const [newProcTooth, setNewProcTooth] = useState("36");
  const [newProcFee, setNewProcFee] = useState("3500");

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

  const handleBookStage3 = () => {
    updateState((prev) => ({
      ...prev,
      treatmentPlans: prev.treatmentPlans.map((tp) =>
        tp.id !== plan.id
          ? tp
          : {
              ...tp,
              stages: tp.stages.map((st) =>
                st.status === "Not booked"
                  ? { ...st, status: "Booked", visitLabel: "Tue 6 Oct, 10:30" }
                  : st,
              ),
            },
      ),
    }));
    toast.success("Stage 3 (Zirconia crown) booked for Tue 6 Oct, 10:30 am");
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

      {/* Chrome-style Tab Bar for Clinical Treatment Plans Section */}
      <div className="mb-4">
        <DentflowChromeTabs
          activeId="plans"
          tabs={[
            { id: "plans", label: "Plans", href: "/app/treatment-plans", icon: ClipboardList },
            { id: "explainer", label: "Explainer", href: "/app/explainers", icon: FilePlay },
            { id: "recovery", label: "Recovery", href: "/app/treatment-recovery", icon: RefreshCw },
          ]}
        />
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
                    <th className="py-2 pl-2 text-right">Status</th>
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
                      <td className="py-2.5 pl-2 text-right">
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
    </div>
  );
}

