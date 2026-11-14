"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

const MATCHING_RULES = [
  "Procedure fits the freed duration",
  "Same doctor, or doctor with same skill",
  "Patients with pending treatment plans first",
  "Within 5 km or said \"flexible\"",
  "First \"yes\" wins · hold slot 10 min",
  "Skip patients messaged in last 48 h",
];

export default function GapFillerPage() {
  const { state, updateState } = useDentflow();
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [slotFilledBy, setSlotFilledBy] = useState<string | null>(null);

  const selectedCandidate =
    state.gapFillerCandidates.find((c) => c.rank === selectedRank) ||
    state.gapFillerCandidates[0];
  const firstName = selectedCandidate.patientName.split(" ")[0];

  const handleConfirmYes = (rank: number) => {
    const cand = state.gapFillerCandidates.find((c) => c.rank === rank);
    if (!cand) return;
    setSlotFilledBy(cand.patientName);
    updateState((prev) => ({
      ...prev,
      gapFillerCandidates: prev.gapFillerCandidates.map((c) =>
        c.rank === rank ? { ...c, offerStatus: "Confirmed" } : c,
      ),
    }));
    toast.success(
      `First "Yes" from ${cand.patientName} locked Chair 2 (3:30–4:30 pm) with 10-min hold!`,
    );
  };

  return (
    <div>
      <DentflowPageHeader
        title="Gap filler"
        subtitle="Cancelled slots are offered to matching waitlisted patients automatically"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col stack */}
        <div className="xl:col-span-8 space-y-4">
          {/* Live freed slot card */}
          <div className="df-card p-4 flex flex-wrap items-center justify-between gap-4 border-[var(--df-status-amber-border)] bg-[var(--df-alert-amber-bg)]/55">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-[var(--df-unique-bg)] border border-[var(--df-unique-border)] text-[var(--df-unique-text)] flex flex-col items-center justify-center shrink-0 leading-tight">
                <span className="text-xs font-extrabold">3:30</span>
                <span className="text-[10px] font-semibold">pm</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--df-unique-text)]">
                  {slotFilledBy
                    ? `SLOT FILLED · HELD FOR ${slotFilledBy.toUpperCase()}`
                    : "LIVE · SLOT FREED 3:01 PM"}
                </p>
                <p className="text-sm font-bold text-[var(--df-text)] mt-0.5">
                  Chair 2 · 3:30–4:30 today · Dr. Sneha K.
                </p>
                <p className="text-xs text-[var(--df-text-muted)]">
                  Amit Joshi cancelled on WhatsApp (fever), 60 min — fits RCT, crown prep, or 2
                  short visits.
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="df-serif text-xl font-semibold text-[var(--df-text)]">₹8,000</p>
              <p className="text-[11px] text-[var(--df-text-muted)]">revenue at risk</p>
            </div>
          </div>

          {/* Ranked matches table */}
          <div className="df-card p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Best matches · offered in waves of 3
              </h2>
              <span className="text-[11px] text-[var(--df-text-muted)]">
                Wave 1 sent 3:02 · wave 2 at 3:12 if unfilled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2 pr-2 text-left">#</th>
                    <th className="py-2 px-2 text-left">Patient</th>
                    <th className="py-2 px-2 text-left">Needs</th>
                    <th className="py-2 px-2 text-left">Why matched</th>
                    <th className="py-2 px-2 text-center">Score</th>
                    <th className="py-2 pl-2 text-right">Offer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--df-border)]">
                  {state.gapFillerCandidates.map((cand) => {
                    const isSelected = cand.rank === selectedRank;
                    return (
                      <tr
                        key={cand.rank}
                        onClick={() => setSelectedRank(cand.rank)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[var(--df-teal-soft)]/45"
                            : "hover:bg-[var(--df-surface-hover)]/60"
                        }`}
                      >
                        <td className="py-2.5 pr-2 text-[var(--df-text-muted)] font-medium">
                          {cand.rank}
                        </td>
                        <td className="py-2.5 px-2 font-bold text-[var(--df-text)]">
                          {cand.patientName}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                          {cand.needs}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--df-text-muted)]">
                          {cand.whyMatched}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-[var(--df-text)]">
                          {cand.score}
                        </td>
                        <td className="py-2.5 pl-2 text-right">
                          <DentflowStatusPill
                            label={cand.offerStatus}
                            tone={
                              cand.offerStatus === "Confirmed"
                                ? "green"
                                : cand.offerStatus === "Viewed"
                                ? "blue"
                                : cand.offerStatus === "Sent"
                                ? "amber"
                                : cand.offerStatus === "Declined"
                                ? "red"
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
        </div>

        {/* Right 4-col stack */}
        <div className="xl:col-span-4 space-y-4">
          {/* What the patient receives */}
          <div className="df-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--df-text)]">
              What the patient receives
            </h3>
            <div className="p-3.5 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-xs text-[var(--df-text)] leading-relaxed">
              Hello {firstName}, a 3:30 PM slot just opened today with Dr. Sneha — for your
              crown. Reply &quot;Yes&quot; within 10 minutes if you would like to book it.
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleConfirmYes(selectedCandidate.rank)}
                className="df-btn-secondary py-1.5 text-xs text-[var(--df-teal)] font-bold cursor-pointer"
              >
                Yes, book slot
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.info(`Recorded decline for ${selectedCandidate.patientName}`)
                }
                className="df-btn-secondary py-1.5 text-xs cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>

          {/* Matching rules */}
          <div className="df-card p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-[var(--df-text)]">Matching rules</h3>
            <ul className="space-y-2 text-xs text-[var(--df-text-secondary)]">
              {MATCHING_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <span className="h-4 w-4 rounded bg-[var(--df-teal)] text-white inline-flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dark green monthly impact card */}
          <div className="rounded-2xl p-5 bg-[var(--df-sidebar-bg)] text-white space-y-1">
            <p className="text-[11px] text-[var(--df-sidebar-muted)] font-medium">This month</p>
            <p className="df-serif text-2xl font-semibold text-white">23 of 31 gaps filled</p>
            <p className="text-xs text-[#6EE7B7]">₹1,46,500 kept · median fill time 14 min</p>
          </div>
        </div>
      </div>
    </div>
  );
}

