"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { DentflowPageHeader } from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

interface CalendarBlock {
  id: string;
  chair: "C1" | "C2" | "C3" | "C4";
  startHour: number; // e.g., 9.5 for 9:30
  durationHours: number;
  timeLabel: string;
  patientName: string;
  procedure: string;
  doctor: string;
}

const INITIAL_BLOCKS: CalendarBlock[] = [
  { id: "cb-1", chair: "C1", startHour: 9.5, durationHours: 0.7, timeLabel: "9:30", patientName: "Meera Nair", procedure: "Scaling", doctor: "Dr. Sneha K." },
  { id: "cb-2", chair: "C1", startHour: 10.25, durationHours: 0.75, timeLabel: "10:15", patientName: "Rahul Verma", procedure: "Filling 14", doctor: "Dr. Arjun M." },
  { id: "cb-3", chair: "C1", startHour: 12.5, durationHours: 0.75, timeLabel: "12:30", patientName: "Imran Khan", procedure: "Consult", doctor: "Dr. Arjun M." },
  { id: "cb-4", chair: "C1", startHour: 15.0, durationHours: 0.9, timeLabel: "3:00", patientName: "Pooja Jain", procedure: "RCT 26", doctor: "Dr. Arjun M." },
  { id: "cb-5", chair: "C1", startHour: 16.5, durationHours: 0.75, timeLabel: "4:30", patientName: "Ajay Rao", procedure: "Review", doctor: "Dr. Arjun M." },

  { id: "cb-6", chair: "C2", startHour: 10.0, durationHours: 1.25, timeLabel: "10:00", patientName: "Priya Deshmukh", procedure: "RCT 36", doctor: "Dr. Sneha K." },
  { id: "cb-7", chair: "C2", startHour: 11.5, durationHours: 0.75, timeLabel: "11:30", patientName: "Suresh Patil", procedure: "Denture trial", doctor: "Dr. Sneha K." },
  { id: "cb-8", chair: "C2", startHour: 13.0, durationHours: 0.75, timeLabel: "1:00", patientName: "Neha Gupta", procedure: "Crown fit 46", doctor: "Dr. Sneha K." },
  { id: "cb-9", chair: "C2", startHour: 16.5, durationHours: 0.75, timeLabel: "4:30", patientName: "Deepak More", procedure: "RCT 11", doctor: "Dr. Sneha K." },

  { id: "cb-10", chair: "C3", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", patientName: "Aarav Joshi", procedure: "Sealants", doctor: "Dr. Arjun M." },
  { id: "cb-11", chair: "C3", startHour: 12.0, durationHours: 0.55, timeLabel: "12:00", patientName: "Kavya Reddy", procedure: "Aligner 10", doctor: "Dr. Karan S." },
  { id: "cb-12", chair: "C3", startHour: 12.6, durationHours: 0.55, timeLabel: "12:30", patientName: "Tanvi Shah", procedure: "Braces adj.", doctor: "Dr. Karan S." },
  { id: "cb-13", chair: "C3", startHour: 13.2, durationHours: 0.55, timeLabel: "1:00", patientName: "Om Kulkarni", procedure: "Braces adj.", doctor: "Dr. Karan S." },
  { id: "cb-14", chair: "C3", startHour: 14.5, durationHours: 0.75, timeLabel: "2:30", patientName: "Riya Das", procedure: "Aligner scan", doctor: "Dr. Karan S." },

  { id: "cb-15", chair: "C4", startHour: 11.0, durationHours: 0.8, timeLabel: "11:00", patientName: "Fatima Shaikh", procedure: "Implant review", doctor: "Dr. Farhan A." },
  { id: "cb-16", chair: "C4", startHour: 14.5, durationHours: 0.8, timeLabel: "2:30", patientName: "Vikram Singh", procedure: "Extraction 38", doctor: "Dr. Farhan A." },
  { id: "cb-17", chair: "C4", startHour: 15.5, durationHours: 0.85, timeLabel: "3:30", patientName: "Anil Bhosale", procedure: "Implant 46", doctor: "Dr. Farhan A." },
];

const SUGGESTED_SLOTS = [
  "Thu 1 Oct · 10:00",
  "Thu 1 Oct · 4:00",
  "Fri 2 Oct · 9:30",
  "Sat 3 Oct · 11:00",
  "Mon 5 Oct · 10:00",
  "Mon 5 Oct · 5:00",
];

const DOCTOR_STYLE: Record<string, { border: string; bg: string; dot: string }> = {
  "Dr. Sneha K.": {
    border: "border-l-[#146C58]",
    bg: "bg-[#E7F4EF]",
    dot: "bg-[#146C58]",
  },
  "Dr. Arjun M.": {
    border: "border-l-[#3B82F6]",
    bg: "bg-[#EDF4FE]",
    dot: "bg-[#3B82F6]",
  },
  "Dr. Farhan A.": {
    border: "border-l-[#D97706]",
    bg: "bg-[#FDF3E3]",
    dot: "bg-[#D97706]",
  },
  "Dr. Karan S.": {
    border: "border-l-[#7C3AED]",
    bg: "bg-[#F3EDFE]",
    dot: "bg-[#7C3AED]",
  },
};

export default function ChairCalendarPage() {
  const { state, updateState } = useDentflow();
  const [viewMode, setViewMode] = useState<"Chairs" | "Doctors" | "Week">("Chairs");
  const [blocks, setBlocks] = useState<CalendarBlock[]>(INITIAL_BLOCKS);

  // Booking drawer state
  const [selectedPatientId, setSelectedPatientId] = useState("pat-priya");
  const [procedure, setProcedure] = useState("Root canal 36 · sitting 2 — 60 min");
  const [doctor, setDoctor] = useState("Dr. Sneha K.");
  const [chair, setChair] = useState("Chair 2");
  const [selectedSlot, setSelectedSlot] = useState(SUGGESTED_SLOTS[0]);
  const [remindWa, setRemindWa] = useState(true);
  const [askDeposit, setAskDeposit] = useState(false);
  const [sendPreVisit, setSendPreVisit] = useState(true);

  const selectedPatient = useMemo(
    () => state.patients.find((p) => p.id === selectedPatientId) || state.patients[0],
    [state.patients, selectedPatientId],
  );

  const anxietyBuffer = selectedPatient?.comfortProfile.autoBufferMin || 0;
  const totalDuration = 60 + anxietyBuffer;

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const chairs: { id: "C1" | "C2" | "C3" | "C4"; label: string }[] = [
    { id: "C1", label: "Chair 1 · General" },
    { id: "C2", label: "Chair 2 · Endo" },
    { id: "C3", label: "Chair 3 · Kids & ortho" },
    { id: "C4", label: "Chair 4 · Surgery" },
  ];

  const handleBookSlot = () => {
    updateState((prev) => ({
      ...prev,
      appointments: [
        {
          id: `apt-${Date.now()}`,
          time: selectedSlot.split("·")[1]?.trim() || "10:00",
          endTime: "11:15",
          durationMin: 60,
          anxietyBufferMin: anxietyBuffer,
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          flags: selectedPatient.flags,
          procedure: procedure.split("—")[0].trim(),
          doctor,
          chair: chair.replace("Chair ", "C"),
          branch: state.activeBranch === "All 3 branches" ? "Station Road branch" : state.activeBranch,
          status: "Confirmed",
          depositRequested: askDeposit,
          remindWhatsApp: remindWa,
          sendPreVisitForm: sendPreVisit,
        },
        ...prev.appointments,
      ],
    }));
    toast.success(
      `Booked ${selectedPatient.name} for ${selectedSlot} (${totalDuration} min incl. buffer)`,
    );
  };

  const handleAddToWaitlist = () => {
    updateState((prev) => ({
      ...prev,
      gapFillerCandidates: [
        {
          rank: prev.gapFillerCandidates.length + 1,
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          needs: procedure.split("—")[0].trim(),
          whyMatched: `Waitlisted · ${doctor}`,
          score: 88,
          offerStatus: "Wave 2",
          wave: 2,
        },
        ...prev.gapFillerCandidates,
      ],
    }));
    toast.success(`${selectedPatient.name} added to gap filler waitlist`);
  };

  const handleCancelBlock = (block: CalendarBlock) => {
    setBlocks((prev) => prev.filter((b) => b.id !== block.id));
    toast.info(
      `Cancelled ${block.patientName} (${block.timeLabel}) — Gap filler C11 notified for freed ${block.chair} slot`,
    );
  };

  return (
    <div>
      <DentflowPageHeader
        title="Calendar"
        subtitle={`Chair view · ${state.activeBranch}`}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2 py-1">
            <button type="button" className="p-1 hover:bg-[var(--df-surface-hover)] rounded-lg">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-semibold px-2 text-[var(--df-text)]">
              Tue, 29 September
            </span>
            <button type="button" className="p-1 hover:bg-[var(--df-surface-hover)] rounded-lg">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="inline-flex bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl p-0.5">
            {(["Chairs", "Doctors", "Week"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setViewMode(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === tab
                    ? "bg-[var(--df-sidebar-bg)] text-white"
                    : "text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-[var(--df-text-muted)] mr-1">Doctors:</span>
          {[
            { name: "Dr. Sneha K.", label: "Dr. Sneha K." },
            { name: "Dr. Arjun M.", label: "Dr. Arjun M." },
            { name: "Dr. Farhan A.", label: "Dr. Farhan A. (visiting)" },
            { name: "Dr. Karan S.", label: "Dr. Karan S. (visiting)" },
          ].map((doc) => (
            <span
              key={doc.name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--df-surface)] border border-[var(--df-border)] font-medium text-[var(--df-text)]"
            >
              <span className={`h-2 w-2 rounded-full ${DOCTOR_STYLE[doc.name].dot}`} />
              {doc.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main Split: Chair Grid + New Appointment Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left: 4-Chair Day Calendar */}
        <div className="xl:col-span-8 df-card p-4 overflow-x-auto">
          {viewMode === "Chairs" && (
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[54px_repeat(4,1fr)] gap-2 pb-2 border-b border-[var(--df-border)] text-center">
                <div />
                {chairs.map((c) => (
                  <div key={c.id} className="text-xs font-semibold text-[var(--df-text)]">
                    {c.label}
                  </div>
                ))}
              </div>

              <div className="relative grid grid-cols-[54px_repeat(4,1fr)] gap-2 pt-2">
                {/* Hour labels */}
                <div className="space-y-0">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-14 text-[10px] text-[var(--df-text-muted)] pr-2 text-right pt-0.5"
                    >
                      {h === 12 ? "12 pm" : h > 12 ? `${h - 12} pm` : `${h} am`}
                    </div>
                  ))}
                </div>

                {/* Chair Columns */}
                {chairs.map((c) => {
                  const chairBlocks = blocks.filter((b) => b.chair === c.id);
                  return (
                    <div
                      key={c.id}
                      className="relative border-l border-[var(--df-border)] bg-[var(--df-surface-muted)]/40"
                      style={{ height: `${hours.length * 56}px` }}
                    >
                      {hours.map((h, i) => (
                        <div
                          key={h}
                          className="border-b border-dashed border-[var(--df-border)]/70"
                          style={{ height: "56px", top: `${i * 56}px` }}
                        />
                      ))}

                      {chairBlocks.map((b) => {
                        const style = DOCTOR_STYLE[b.doctor] || DOCTOR_STYLE["Dr. Sneha K."];
                        const topPx = (b.startHour - 9) * 56;
                        const heightPx = Math.max(b.durationHours * 56 - 2, 32);
                        return (
                          <div
                            key={b.id}
                            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                            className={`group absolute left-1 right-1 rounded-lg border border-[var(--df-border)] border-l-4 ${style.border} ${style.bg} px-2 py-1 overflow-hidden shadow-2xs`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-[11px] font-bold text-[var(--df-text)] truncate leading-tight">
                                {b.patientName}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCancelBlock(b)}
                                title="Cancel slot & trigger Gap Filler"
                                className="opacity-0 group-hover:opacity-100 text-[var(--df-text-muted)] hover:text-[var(--df-status-red-text)] cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-[10px] text-[var(--df-text-secondary)] truncate">
                              {b.timeLabel} · {b.procedure}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === "Doctors" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(DOCTOR_STYLE).map((docName) => {
                const docBlocks = blocks.filter((b) => b.doctor === docName);
                return (
                  <div key={docName} className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--df-text)]">{docName}</span>
                      <span className="text-[11px] text-[var(--df-text-muted)]">{docBlocks.length} slots</span>
                    </div>
                    <div className="space-y-1.5">
                      {docBlocks.map((b) => (
                        <div key={b.id} className="p-2 rounded-lg bg-[var(--df-surface)] border border-[var(--df-border)] text-xs flex justify-between">
                          <span><strong className="df-mono">{b.timeLabel}</strong> · {b.patientName}</span>
                          <span className="text-[var(--df-text-muted)]">{b.chair}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === "Week" && (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              {["Tue 29", "Wed 30", "Thu 1 Oct", "Fri 2 Oct", "Sat 3 Oct", "Mon 5 Oct"].map((d, i) => (
                <div key={d} className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)]">
                  <p className="font-bold text-[var(--df-text)] mb-1">{d}</p>
                  <p className="text-[11px] text-[var(--df-teal)] font-semibold">{34 - i * 3} appointments</p>
                  <p className="text-[11px] text-[var(--df-text-muted)] mt-1">Chair util: {82 - i * 4}%</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: New Appointment Drawer */}
        <div className="xl:col-span-4 df-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="df-serif text-base font-semibold text-[var(--df-text)]">
              New appointment
            </h2>
            <span className="text-xs text-[var(--df-text-muted)]">Booking drawer</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1">
              Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
            >
              {state.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.phone}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedPatient.comfortProfile.anxietyScore >= 6 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--df-status-amber-bg)] text-[var(--df-status-amber-text)] border border-[var(--df-status-amber-border)]">
                  Anxiety {selectedPatient.comfortProfile.anxietyScore}/10 · give {anxietyBuffer} min extra
                </span>
              )}
              {selectedPatient.allergies.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)] border border-[var(--df-status-red-border)]">
                  {selectedPatient.allergies[0]} allergy
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1">
              Procedure (sets duration)
            </label>
            <select
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
            >
              <option>Root canal 36 · sitting 2 — 60 min</option>
              <option>Zirconia crown prep 36 — 45 min</option>
              <option>Scaling & polishing — 30 min</option>
              <option>Implant placement 46 — 90 min</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1">
                Doctor
              </label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
              >
                <option>Dr. Sneha K.</option>
                <option>Dr. Arjun M.</option>
                <option>Dr. Farhan A.</option>
                <option>Dr. Karan S.</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1">
                Chair
              </label>
              <select
                value={chair}
                onChange={(e) => setChair(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
              >
                <option>Chair 1</option>
                <option>Chair 2</option>
                <option>Chair 3</option>
                <option>Chair 4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1.5">
              Suggested free slots ({totalDuration} min incl. anxiety buffer)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SUGGESTED_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-2 py-2 rounded-lg text-[10.5px] font-semibold border transition-colors cursor-pointer ${
                    selectedSlot === slot
                      ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                      : "bg-[var(--df-surface)] text-[var(--df-text)] border-[var(--df-border)] hover:bg-[var(--df-surface-hover)]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-1 text-xs text-[var(--df-text)]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remindWa}
                onChange={(e) => setRemindWa(e.target.checked)}
                className="accent-[var(--df-teal)] rounded"
              />
              <span>Remind on WhatsApp (24 h + 2 h)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={askDeposit}
                onChange={(e) => setAskDeposit(e.target.checked)}
                className="accent-[var(--df-teal)] rounded"
              />
              <span>Ask ₹500 booking deposit via UPI</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendPreVisit}
                onChange={(e) => setSendPreVisit(e.target.checked)}
                className="accent-[var(--df-teal)] rounded"
              />
              <span>Send pre-visit form &amp; comfort check</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={handleAddToWaitlist}
              className="df-btn-secondary py-2 text-xs cursor-pointer"
            >
              Add to waitlist
            </button>
            <button
              type="button"
              onClick={handleBookSlot}
              className="df-btn-primary py-2 text-xs cursor-pointer"
            >
              Book {selectedSlot}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
