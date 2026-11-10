"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DentflowProvider, useDentflow } from "@/lib/dentflow-store";
import { DentflowStatusPill } from "@/components/dental/dentflow-primitives";

function LabPortalInner() {
  const { state, updateState } = useDentflow();
  const [selectedId, setSelectedId] = useState<string>("lc-1");

  const activeCase =
    state.labCases.find((c) => c.id === selectedId) || state.labCases[0];

  const handleMarkDispatched = () => {
    updateState((prev) => ({
      ...prev,
      labCases: prev.labCases.map((c) =>
        c.id === activeCase.id
          ? { ...c, status: "Received", dueLabel: "Dispatched today", isOverdue: false }
          : c,
      ),
    }));
    toast.success(
      `${activeCase.caseNumber} (${activeCase.patientName}) marked Dispatched · Clinic & patient notified!`,
    );
  };

  return (
    <div className="min-h-screen df-canvas">
      {/* Lab Portal Blue Header matching L01 */}
      <header className="bg-[var(--df-lab-header)] text-white px-6 py-3.5">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className="df-serif text-lg font-semibold">DentFlow</span>
            <span className="text-xs text-white/75">for labs</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold">
              Precision Dental Lab · 14 connected clinics
            </span>
            <Link
              href="/c/smile-studio/dashboard/lab-cases"
              className="text-white/80 hover:text-white underline"
            >
              Clinic Lab Board →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1360px] mx-auto p-5 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 8-col Open cases table */}
          <div className="xl:col-span-8 df-card p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-sm font-bold text-[var(--df-text)]">Open cases · 23</h1>
              <div className="flex items-center gap-2">
                <DentflowStatusPill label="1 overdue" tone="red" />
                <DentflowStatusPill label="4 due in 2 days" tone="amber" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2 pr-2 text-left">Case</th>
                    <th className="py-2 px-2 text-left">Clinic · Patient</th>
                    <th className="py-2 px-2 text-left">Work</th>
                    <th className="py-2 px-2 text-left">Material · Shade</th>
                    <th className="py-2 px-2 text-left">Due</th>
                    <th className="py-2 pl-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--df-border)]">
                  {state.labCases.slice(0, 8).map((c) => {
                    const selected = c.id === activeCase.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          selected
                            ? "bg-[var(--df-status-blue-bg)]/45"
                            : "hover:bg-[var(--df-surface-hover)]/60"
                        }`}
                      >
                        <td className="py-2.5 pr-2 font-medium text-[var(--df-text-muted)] whitespace-nowrap">
                          {c.caseNumber}
                        </td>
                        <td className="py-2.5 px-2">
                          <p className="font-bold text-[var(--df-text)]">{c.clinicBranch}</p>
                          <p className="text-[11px] text-[var(--df-text-muted)]">
                            {c.patientName}
                          </p>
                        </td>
                        <td className="py-2.5 px-2 font-medium text-[var(--df-text)]">
                          {c.work}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                          {c.materialShade}
                        </td>
                        <td
                          className={`py-2.5 px-2 font-semibold whitespace-nowrap ${
                            c.isOverdue
                              ? "text-[var(--df-status-red-text)]"
                              : "text-[var(--df-text-secondary)]"
                          }`}
                        >
                          {c.dueLabel}
                        </td>
                        <td className="py-2.5 pl-2 text-right">
                          <DentflowStatusPill
                            label={c.status}
                            tone={
                              c.status === "Received" || c.status === "Fitted / closed"
                                ? "green"
                                : c.status === "In fabrication"
                                ? "blue"
                                : "grey"
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4-col Case prescription & status update */}
          <div className="xl:col-span-4 df-card p-5 space-y-4 text-xs">
            <div>
              <p className="text-[11px] text-[var(--df-text-muted)]">
                {activeCase.caseNumber} · {activeCase.clinicBranch}
              </p>
              <h2 className="df-serif text-lg font-semibold text-[var(--df-text)] mt-0.5">
                {activeCase.work}
              </h2>
            </div>

            <div className="space-y-2 border-t border-b border-[var(--df-border)] py-3">
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Patient</span>
                <span className="font-bold">{activeCase.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Implant system</span>
                <span className="font-semibold">
                  {activeCase.implantSystem || "Straumann BLX 4.2 mm"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Abutment</span>
                <span className="font-semibold">
                  {activeCase.abutment || "Stock titanium"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Material · shade</span>
                <span className="font-semibold">{activeCase.materialShade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Doctor</span>
                <span className="font-semibold">{activeCase.doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Clinic due date</span>
                <span className="font-bold text-[var(--df-status-red-text)]">
                  {activeCase.clinicDueDate}
                </span>
              </div>
            </div>

            {/* Shade swatches & STL scan */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="h-14 rounded-xl bg-[var(--df-status-blue-bg)] border border-[var(--df-status-blue-border)]" />
              <div className="h-14 rounded-xl bg-[var(--df-unique-bg)] border border-[var(--df-unique-border)]" />
              <div className="h-14 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex items-center justify-center text-[11px] font-semibold text-[var(--df-text-muted)]">
                STL scan
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-[var(--df-text-muted)]">
                Update status (the clinic and patient are notified)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toast.info(`Sent shade verification query to ${activeCase.doctor}`)
                  }
                  className="df-btn-secondary py-2 text-xs cursor-pointer"
                >
                  Ask clinic a question
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Proposed new delivery date: 30 Sep, 11:00 am")}
                  className="df-btn-secondary py-2 text-xs cursor-pointer"
                >
                  New due date
                </button>
              </div>
              <button
                type="button"
                onClick={handleMarkDispatched}
                className="w-full py-2.5 rounded-xl bg-[var(--df-lab-header)] text-white font-semibold text-xs cursor-pointer hover:opacity-95"
              >
                Mark dispatched · attach invoice
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LabPortalPage() {
  return (
    <DentflowProvider>
      <LabPortalInner />
    </DentflowProvider>
  );
}

