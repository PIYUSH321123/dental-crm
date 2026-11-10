"use client";

import React, { useState } from "react";
import { Play, Pause } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import { StatusTone } from "@/lib/dentflow-theme";

const OUTCOME_TONE: Record<string, StatusTone> = {
  Booked: "green",
  Answered: "grey",
  Urgent: "red",
  Rescheduled: "blue",
  Transferred: "amber",
};

export default function AiReceptionistPage() {
  const { state, updateState } = useDentflow();
  const [selectedCallId, setSelectedCallId] = useState<string>("vc-1");
  const [playing, setPlaying] = useState(false);

  const selectedCall =
    state.voiceCalls.find((c) => c.id === selectedCallId) || state.voiceCalls[0];

  const togglePermission = (key: keyof typeof state.voicePermissions) => {
    if (key === "discussMedicines" && !state.voicePermissions.discussMedicines) {
      toast.error(
        "Safety guardrail: Voice AI is permanently barred from prescribing or advising medicines.",
      );
      return;
    }
    updateState((prev) => ({
      ...prev,
      voicePermissions: {
        ...prev.voicePermissions,
        [key]: !prev.voicePermissions[key],
      },
    }));
  };

  const permRows: { key: keyof typeof state.voicePermissions; label: string }[] = [
    { key: "bookAppointments", label: "Book new appointments" },
    { key: "rescheduleCancel", label: "Reschedule / cancel" },
    { key: "quoteStandardFees", label: "Quote standard fees" },
    { key: "shareDirectionsHours", label: "Share directions & hours" },
    { key: "sendSelfCheckLink", label: "Send self-check link" },
    { key: "discussMedicines", label: "Discuss medicines" },
  ];

  return (
    <div>
      <DentflowPageHeader
        title="AI receptionist"
        subtitle="Answers calls and WhatsApp voice notes when the front desk is busy or closed"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 3-col Call Log */}
        <div className="xl:col-span-3 df-card p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <span className="h-2 w-2 rounded-full bg-[var(--df-status-green-text)]" />
            <span className="text-xs font-bold text-[var(--df-text)]">
              Live · 23 calls today
            </span>
          </div>

          <div className="space-y-1.5">
            {state.voiceCalls.map((call) => {
              const active = call.id === selectedCall.id;
              return (
                <button
                  key={call.id}
                  type="button"
                  onClick={() => {
                    setSelectedCallId(call.id);
                    setPlaying(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    active
                      ? "bg-[var(--df-teal-soft)]/50 border-[var(--df-teal-border)]"
                      : "bg-[var(--df-surface)] border-[var(--df-border)] hover:bg-[var(--df-surface-hover)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[var(--df-text)] truncate">
                      {call.callerLabel}
                    </span>
                    <span className="text-[10px] text-[var(--df-text-muted)] shrink-0">
                      {call.timeAndLang}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <span className="text-[11px] text-[var(--df-text-muted)] truncate">
                      {call.topic}
                    </span>
                    <DentflowStatusPill
                      label={call.outcome}
                      tone={OUTCOME_TONE[call.outcome] || "grey"}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center 6-col Transcript */}
        <div className="xl:col-span-6 df-card p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-[var(--df-border)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                {selectedCall.headerTitle}
              </h2>
              <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                {selectedCall.headerMeta}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              className="df-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{playing ? "Playing..." : "Play recording"}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {selectedCall.tags.map((tag, idx) => (
              <DentflowStatusPill
                key={tag}
                label={tag}
                tone={idx === 1 ? "green" : idx === 2 ? "blue" : "grey"}
              />
            ))}
          </div>

          {/* Conversation bubbles */}
          <div className="space-y-3 py-1">
            {selectedCall.messages.map((msg, i) => {
              const isAi = msg.sender === "AI receptionist";
              return (
                <div
                  key={i}
                  className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isAi
                        ? "bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text)]"
                        : "bg-[var(--df-sidebar-bg)] text-white"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold mb-0.5 ${
                        isAi ? "text-[var(--df-text-muted)]" : "text-[var(--df-sidebar-muted)]"
                      }`}
                    >
                      {msg.sender}
                    </p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[var(--df-border)] text-[11px] text-[var(--df-text-muted)] leading-relaxed">
            Transcript stored with the patient record. The AI never diagnoses or suggests medicine
            — pain with swelling or fever is transferred to staff immediately.
          </div>
        </div>

        {/* Right 3-col Controls & KPI */}
        <div className="xl:col-span-3 space-y-4">
          <div className="df-card p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-[var(--df-text)]">What it may do</h3>
            <div className="space-y-2">
              {permRows.map((row) => {
                const enabled = state.voicePermissions[row.key];
                return (
                  <label
                    key={row.key}
                    className="flex items-center justify-between gap-2 text-xs text-[var(--df-text)] cursor-pointer select-none"
                  >
                    <span>{row.label}</span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => togglePermission(row.key)}
                      className="accent-[var(--df-teal)] h-4 w-4 rounded"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="df-card p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-[var(--df-text)]">Languages &amp; hours</h3>
            <div className="flex flex-wrap gap-1.5">
              {["हिन्दी", "मराठी", "English"].map((l) => (
                <span
                  key={l}
                  className="px-2.5 py-0.5 rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-teal)] text-[11px] font-semibold"
                >
                  {l}
                </span>
              ))}
              <button
                type="button"
                onClick={() => toast.info("Gujarati & Kannada packs available in Settings")}
                className="px-2.5 py-0.5 rounded-full bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[11px] font-semibold text-[var(--df-text-muted)] cursor-pointer"
              >
                + Add
              </button>
            </div>
            <p className="text-[11px] text-[var(--df-text-muted)] leading-relaxed">
              Answers when: line busy &gt; 3 rings, lunch 1–2 pm, after 8 pm, Sundays
            </p>
          </div>

          <div className="rounded-2xl p-4 bg-[var(--df-sidebar-bg)] text-white space-y-1">
            <p className="text-[11px] text-[var(--df-sidebar-muted)]">Today</p>
            <p className="df-serif text-xl font-semibold text-white">
              17 resolved · 4 transferred
            </p>
            <p className="text-[11px] text-[#6EE7B7]">
              6 bookings · 2 reschedules · 0 complaints
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
