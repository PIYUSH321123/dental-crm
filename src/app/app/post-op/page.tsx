"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, CalendarPlus, CheckCircle2, Camera } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

export default function PostOpPage() {
  const router = useRouter();
  const { state, updateState } = useDentflow();

  const [selectedId, setSelectedId] = useState<string>("po-1");
  const [showPhoto, setShowPhoto] = useState(false);

  const selectedCase =
    state.postOpCases.find((p) => p.id === selectedId) || state.postOpCases[0];

  const alertCount = state.postOpCases.filter((p) => p.status === "Alert").length;
  const noReplyCount = state.postOpCases.filter((p) => p.status === "No reply").length;

  const handleMarkReviewed = () => {
    updateState((prev) => ({
      ...prev,
      postOpCases: prev.postOpCases.map((p) =>
        p.id === selectedCase.id ? { ...p, status: "Closed" } : p,
      ),
    }));
    toast.success(`Marked ${selectedCase.patientName} post-op alert as reviewed`);
  };

  const chartPoints =
    selectedCase.painHistory && selectedCase.painHistory.length > 0
      ? selectedCase.painHistory
      : [
          { day: "Day 1", score: 4 },
          { day: "Day 2", score: 3 },
          { day: "Day 3", score: selectedCase.painScore ?? 2 },
        ];

  return (
    <div>
      <DentflowPageHeader
        title="Post-op check-ins"
        subtitle="Automatic WhatsApp check-ins on day 1, 3 and 7 after surgical and endo procedures"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col Active recoveries table */}
        <div className="xl:col-span-8 df-card p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              Active recoveries · 18
            </h2>
            <div className="flex items-center gap-2">
              <DentflowStatusPill label={`${alertCount} alerts`} tone="red" />
              <DentflowStatusPill label={`${noReplyCount} no reply`} tone="amber" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                  <th className="py-2 pr-2 text-left">Patient</th>
                  <th className="py-2 px-2 text-left">Procedure</th>
                  <th className="py-2 px-2 text-left">Day</th>
                  <th className="py-2 px-2 text-left">Check-ins D1 · D3 · D7</th>
                  <th className="py-2 px-2 text-left">Pain</th>
                  <th className="py-2 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {state.postOpCases.map((row) => {
                  const isSelected = row.id === selectedCase.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setSelectedId(row.id);
                        setShowPhoto(false);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[var(--df-teal-soft)]/45"
                          : "hover:bg-[var(--df-surface-hover)]"
                      }`}
                    >
                      <td className="py-2.5 pr-2 font-bold text-[var(--df-text)]">
                        {row.patientName}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                        {row.procedure}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-muted)]">
                        {row.dayLabel}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="inline-flex items-center gap-1">
                          {(["D1", "D3", "D7"] as const).map((code) => {
                            const done = row.checkInsCompleted.includes(code);
                            const isAlertStep =
                              done &&
                              row.status === "Alert" &&
                              ((code === "D3" && row.dayLabel === "Day 3") ||
                                (code === "D1" && row.dayLabel === "Day 1"));
                            return (
                              <span
                                key={code}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  isAlertStep
                                    ? "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)]"
                                    : done
                                    ? "bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)]"
                                    : "bg-[var(--df-canvas-subtle)] text-[var(--df-text-muted)]"
                                }`}
                              >
                                {code}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-[var(--df-text)]">
                        {row.painScore !== null ? `${row.painScore} / 10` : "—"}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <DentflowStatusPill
                          label={row.status}
                          tone={
                            row.status === "Alert"
                              ? "red"
                              : row.status === "No reply"
                              ? "amber"
                              : row.status === "On track"
                              ? "green"
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

        {/* Right 4-col selected patient alert + rules */}
        <div className="xl:col-span-4 space-y-4">
          <div className="df-card p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <DentflowStatusPill
                label={selectedCase.status}
                tone={
                  selectedCase.status === "Alert"
                    ? "red"
                    : selectedCase.status === "No reply"
                    ? "amber"
                    : "green"
                }
              />
              <span className="text-[11px] text-[var(--df-text-muted)]">
                {selectedCase.replyTimestamp || `${selectedCase.dayLabel} check-in`}
              </span>
            </div>

            <div>
              <h3 className="df-serif text-lg font-semibold text-[var(--df-text)]">
                {selectedCase.patientName}
              </h3>
              <p className="text-xs text-[var(--df-text-muted)]">
                Surgical {selectedCase.procedure.toLowerCase()} · {selectedCase.procedureDate} ·{" "}
                {selectedCase.doctor}
              </p>
            </div>

            {/* Pain progression bar chart */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 items-end h-28">
              {chartPoints.map((pt, idx) => {
                const heightPct = Math.max(20, Math.min(100, pt.score * 11));
                const isHigh = pt.score >= 7;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[11px] font-bold text-[var(--df-text)]">
                      {pt.score}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isHigh
                          ? "bg-[var(--df-status-red-text)]"
                          : "bg-[var(--df-unique-text)]/75"
                      }`}
                    />
                    <span className="text-[10.5px] text-[var(--df-text-muted)]">{pt.day}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[var(--df-text)] leading-relaxed">
              {selectedCase.symptomsSummary ||
                "Patient reported comfortable recovery with mild soreness."}
            </p>

            {selectedCase.hasPhoto && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowPhoto((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[11px] font-semibold text-[var(--df-text-secondary)] cursor-pointer"
                >
                  <Camera className="h-3 w-3" /> Patient photo · 9:11 am
                </button>
                {showPhoto && (
                  <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[11px] text-[var(--df-text-secondary)]">
                    Attached intraoral &amp; cheek photo shows mild buccal edema near tooth 48
                    socket; no purulent discharge visible.
                  </div>
                )}
              </div>
            )}

            {selectedCase.ruleMatched && (
              <div className="p-3 rounded-xl bg-[var(--df-alert-red-bg)] border border-[var(--df-status-red-border)] text-xs text-[var(--df-status-red-text)] leading-relaxed">
                {selectedCase.ruleMatched}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  toast.info(`Dialing ${selectedCase.patientName} via clinic VOIP...`)
                }
                className="df-btn-secondary py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" /> Call patient
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(
                    `Urgent 15-min review slot reserved today for ${selectedCase.patientName}`,
                  );
                  router.push("/app/calendar");
                }}
                className="df-btn-primary py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> Book review today
              </button>
            </div>

            <button
              type="button"
              onClick={handleMarkReviewed}
              className="w-full df-btn-secondary py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark reviewed · add note
            </button>
          </div>

          {/* Check-in rules box */}
          <div className="df-card p-4 space-y-1.5 text-xs">
            <h3 className="font-bold text-[var(--df-text)]">Check-in rules</h3>
            <p className="text-[var(--df-text-secondary)]">
              Extraction, implant, RCT, surgery — D1, D3, D7
            </p>
            <p className="text-[var(--df-text-secondary)]">Scaling, filling — D1 only</p>
            <p className="text-[var(--df-text-secondary)]">
              No reply in 6 h — one reminder, then front-desk call task
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

