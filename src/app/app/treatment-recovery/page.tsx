"use client";

import React from "react";
import { ClipboardList, FilePlay, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowChromeTabs,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import { StatusTone } from "@/lib/dentflow-theme";

const REASON_TONE: Record<string, StatusTone> = {
  Cost: "blue",
  Unsure: "grey",
  Fear: "amber",
  Time: "grey",
  Unknown: "grey",
  Family: "blue",
};

const SEQUENCE_STEPS = [
  {
    day: "3",
    title: "Resend explainer",
    desc: "Their own X-ray, their language, same prices",
  },
  {
    day: "7",
    title: "Answer the likely worry",
    desc: "Cost → EMI · Fear → comfort info · Time → Saturday slots",
  },
  {
    day: "14",
    title: "Risk reminder",
    desc: "What happens if the tooth is left untreated (doctor-approved text)",
  },
  {
    day: "21",
    title: "Doctor call task",
    desc: "Assigned to treating doctor with talking points",
  },
  {
    day: "45",
    title: "Final gentle check",
    desc: "Then moves to 6-month recall list",
  },
];

export default function RecoveryPage() {
  const { state, updateState } = useDentflow();

  const handleActNow = (planId: string) => {
    const target = state.recoveryPlans.find((r) => r.id === planId);
    if (!target) return;
    if (target.lastMessagedDaysAgo < 5) {
      toast.info(
        `Frequency cap: ${target.patientName} received a message ${target.lastMessagedDaysAgo}d ago (max 1 recovery message per 5 days).`,
      );
      return;
    }
    updateState((prev) => ({
      ...prev,
      recoveryPlans: prev.recoveryPlans.map((r) =>
        r.id === planId ? { ...r, lastMessagedDaysAgo: 0 } : r,
      ),
    }));
    toast.success(`Triggered "${target.nextAutomaticStep}" for ${target.patientName}`);
  };

  return (
    <div>
      <DentflowPageHeader
        title="Treatment recovery"
        subtitle="Plans that were proposed or started but not finished"
      />

      {/* Chrome-style Tab Bar for Clinical Treatment Plans Section */}
      <div className="mb-4">
        <DentflowChromeTabs
          activeId="recovery"
          tabs={[
            { id: "plans", label: "Plans", href: "/app/treatment-plans", icon: ClipboardList },
            { id: "explainer", label: "Explainer", href: "/app/explainers", icon: FilePlay },
            { id: "recovery", label: "Recovery", href: "/app/treatment-recovery", icon: RefreshCw },
          ]}
        />
      </div>

      {/* 4 Summary Bucket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5">
        <div className="df-card p-4 bg-[var(--df-teal-soft)] border-[var(--df-teal-border)]">
          <p className="text-[11px] font-medium text-[var(--df-text-muted)]">
            Waiting to be finished
          </p>
          <p className="df-serif text-2xl sm:text-[26px] font-semibold text-[var(--df-text)] mt-1">
            ₹6,84,000
          </p>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-1">57 plans · this branch</p>
          <p className="text-[11px] font-semibold text-[var(--df-status-green-text)] mt-0.5">
            Recovered this month: ₹1,12,000 (9 plans)
          </p>
        </div>

        <div className="df-card p-4">
          <p className="text-[11px] font-medium text-[var(--df-text-muted)]">
            Proposed, not accepted
          </p>
          <p className="df-serif text-2xl sm:text-[26px] font-semibold text-[var(--df-text)] mt-1">
            ₹3,12,000
          </p>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-1">
            24 plans · mostly cost concern
          </p>
        </div>

        <div className="df-card p-4">
          <p className="text-[11px] font-medium text-[var(--df-text-muted)]">
            Accepted, not booked
          </p>
          <p className="df-serif text-2xl sm:text-[26px] font-semibold text-[var(--df-text)] mt-1">
            ₹2,21,000
          </p>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-1">
            19 plans · avg 23 days idle
          </p>
        </div>

        <div className="df-card p-4">
          <p className="text-[11px] font-medium text-[var(--df-text-muted)]">
            Started, not completed
          </p>
          <p className="df-serif text-2xl sm:text-[26px] font-semibold text-[var(--df-text)] mt-1">
            ₹1,51,000
          </p>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-1">
            14 plans · crowns pending
          </p>
        </div>
      </div>

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col Stalled Plans Table */}
        <div className="xl:col-span-8 df-card p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                  <th className="py-2 pr-2 text-left">Patient</th>
                  <th className="py-2 px-2 text-left">Pending treatment</th>
                  <th className="py-2 px-2 text-right">Value</th>
                  <th className="py-2 px-2 text-left">Idle</th>
                  <th className="py-2 px-2 text-left">Reason</th>
                  <th className="py-2 px-2 text-left">Next automatic step</th>
                  <th className="py-2 pl-2 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {state.recoveryPlans.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--df-surface-hover)]/60">
                    <td className="py-2.5 pr-2 font-bold text-[var(--df-text)] whitespace-nowrap">
                      {row.patientName}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                      {row.pendingTreatment}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-[var(--df-text)] whitespace-nowrap">
                      ₹{row.value.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--df-text-muted)] whitespace-nowrap">
                      {row.idleDays} d
                    </td>
                    <td className="py-2.5 px-2">
                      <DentflowStatusPill
                        label={row.reason}
                        tone={REASON_TONE[row.reason] || "grey"}
                      />
                    </td>
                    <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                      {row.nextAutomaticStep}
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleActNow(row.id)}
                        className="df-btn-secondary px-2.5 py-1 text-[11px] whitespace-nowrap cursor-pointer"
                      >
                        {row.lastMessagedDaysAgo === 0 ? "Sent" : "Act now"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4-col Follow-up sequence */}
        <div className="xl:col-span-4 df-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--df-text)]">Follow-up sequence</h2>
            <button
              type="button"
              onClick={() => toast.info("Sequence cadence locked to clinic SOP (Days 3, 7, 14, 21, 45)")}
              className="df-btn-secondary px-2.5 py-1 text-[11px] cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3">
            {SEQUENCE_STEPS.map((s) => (
              <div key={s.day} className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-teal)] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {s.day}
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--df-text)]">{s.title}</p>
                  <p className="text-[11px] text-[var(--df-text-muted)] leading-snug">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[11px] text-[var(--df-text-muted)] leading-relaxed">
            Stops automatically when the patient books, pays, or replies &quot;not
            interested&quot;. Max 1 message per 5 days.
          </div>
        </div>
      </div>
    </div>
  );
}

