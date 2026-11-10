"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { DentflowProvider, useDentflow } from "@/lib/dentflow-store";
import { DentflowStatusPill } from "@/components/dental/dentflow-primitives";

const SPECIALIST_DAYS = [
  {
    day: "Thu 1 Oct",
    clinic: "Smile Studio · Station Road",
    meta: "10–5 · 6 patients",
    chair: "Chair 2",
  },
  {
    day: "Sat 3 Oct",
    clinic: "Apex Dental Care · Aundh",
    meta: "9–1 · 4 patients",
    chair: "Chair 1",
  },
  {
    day: "Tue 6 Oct",
    clinic: "Pearl & Root · Kothrud",
    meta: "3–7 · 2 of 5 slots",
    chair: "Chair 3",
  },
];

const THURSDAY_PATIENTS = [
  {
    time: "10:00",
    patient: "Harsh Vora",
    procedure: "RCT 37 · sitting 2",
    note: "Anxiety 8/10 · extra 15 min booked",
  },
  {
    time: "11:15",
    patient: "Mohan Iyer",
    procedure: "RCT 16 · sitting 1",
    note: "Back from recovery list",
  },
  {
    time: "12:30",
    patient: "Kiran Desai",
    procedure: "RCT 45 · sitting 2",
    note: "Calcified canal noted",
  },
  {
    time: "2:00",
    patient: "Pooja Jain",
    procedure: "Re-RCT 26",
    note: "Old filling fractured",
  },
  {
    time: "3:15",
    patient: "Deepak More",
    procedure: "RCT 11 review",
    note: "Day 3 check-in: no reply",
  },
  {
    time: "4:15",
    patient: "Ajay Rao",
    procedure: "Consult · cracked tooth",
    note: "Referred by Dr. Arjun",
  },
];

function SpecialistPortalInner() {
  const router = useRouter();
  const { state, updateState, logPatientRead } = useDentflow();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [activeNav, setActiveNav] = useState("My days");
  const [selectedPatientChart, setSelectedPatientChart] = useState<
    (typeof THURSDAY_PATIENTS)[number] | null
  >(null);
  const [clinicalNote, setClinicalNote] = useState("");

  const handleLogout = async () => {
    await fetch("/api/dentflow/session", { method: "DELETE" }).catch(() => {});
    router.push("/login");
    router.refresh();
  };

  const activeDay = SPECIALIST_DAYS[selectedDayIdx];

  const handleReferralAction = (id: string, status: "Accepted" | "Replied") => {
    updateState((prev) => ({
      ...prev,
      specialistReferrals: prev.specialistReferrals.map((r) =>
        r.id === id ? { ...r, status } : r,
      ),
    }));
    toast.success(
      status === "Accepted"
        ? "Referral accepted & slotted into next Thursday block"
        : "Clinical advice sent back to referring dentist",
    );
  };

  return (
    <div className="min-h-screen df-canvas">
      {/* Dark slate-indigo top header */}
      <header className="bg-[var(--df-specialist-header)] text-white px-6 py-3.5">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-baseline gap-1.5">
              <span className="df-serif text-lg font-semibold">DentFlow</span>
              <span className="text-xs text-white/70">for specialists</span>
            </div>
            <nav className="flex items-center gap-1.5">
              {["My days", "Referrals", "Patients", "Earnings"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveNav(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeNav === tab
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold">Dr. Meera Iyer · Endodontist</span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1360px] mx-auto p-5 sm:p-6 space-y-5">
        {/* Top 3 Clinic Day Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SPECIALIST_DAYS.map((d, idx) => {
            const active = idx === selectedDayIdx;
            const borderColors = [
              "border-t-[var(--df-teal)]",
              "border-t-[var(--df-status-blue-text)]",
              "border-t-[var(--df-unique-text)]",
            ];
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`text-left df-card p-4 border-t-4 ${borderColors[idx]} transition-all cursor-pointer ${
                  active ? "ring-1 ring-[var(--df-sidebar-bg)]" : "opacity-85 hover:opacity-100"
                }`}
              >
                <p className="text-[11px] text-[var(--df-text-muted)]">{d.day}</p>
                <p className="text-sm font-bold text-[var(--df-text)] mt-0.5">{d.clinic}</p>
                <p className="text-xs text-[var(--df-text-secondary)] mt-0.5">{d.meta}</p>
              </button>
            );
          })}
        </div>

        {/* Bottom 2-column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 8-col Patient List */}
          <div className="xl:col-span-8 df-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                {activeDay.day} · {activeDay.clinic}
              </h2>
              <span className="text-xs text-[var(--df-text-muted)]">
                {activeDay.meta.split("·").pop()?.trim()} · {activeDay.chair}
              </span>
            </div>

            <div className="divide-y divide-[var(--df-border)]">
              {THURSDAY_PATIENTS.map((pt) => (
                <div
                  key={pt.time + pt.patient}
                  className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[var(--df-text-muted)] font-medium w-10">
                      {pt.time}
                    </span>
                    <span className="font-bold text-[var(--df-text)] w-28">{pt.patient}</span>
                    <span className="text-[var(--df-text-secondary)]">{pt.procedure}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--df-text-muted)]">{pt.note}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientChart(pt);
                        setClinicalNote("");
                        logPatientRead(pt.patient, "Specialist portal", "Opened tooth chart & IOPA summary");
                      }}
                      className="df-btn-secondary px-2.5 py-1 text-[11px] cursor-pointer"
                    >
                      Open chart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 4-col Referral Inbox + September Earnings */}
          <div className="xl:col-span-4 space-y-4">
            <div className="df-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--df-text)]">Referral inbox</h2>
                <DentflowStatusPill
                  label={`${state.specialistReferrals.filter((r) => r.status === "Pending").length} new`}
                  tone="blue"
                />
              </div>

              <div className="space-y-2.5">
                {state.specialistReferrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[var(--df-text)]">{ref.patientLabel}</p>
                      <p className="text-[var(--df-text-secondary)]">{ref.summary}</p>
                      <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                        {ref.fromInfo}
                      </p>
                    </div>
                    {ref.status === "Pending" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleReferralAction(ref.id, "Accepted")}
                          className="py-1.5 rounded-lg bg-[var(--df-specialist-header)] text-white font-semibold text-[11px] cursor-pointer"
                        >
                          Accept &amp; slot
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReferralAction(ref.id, "Replied")}
                          className="df-btn-secondary py-1.5 text-[11px] cursor-pointer"
                        >
                          Reply with advice
                        </button>
                      </div>
                    ) : (
                      <DentflowStatusPill label={ref.status} tone="green" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-[var(--df-specialist-header)] text-white space-y-1">
              <p className="text-[11px] text-white/70">September earnings · 3 clinics</p>
              <p className="df-serif text-2xl font-semibold">₹1,18,500</p>
              <p className="text-[11px] text-[#6EE7B7]">
                Smile Studio ₹62,500 · 2 others ₹56,000 · settles 5 Oct
              </p>
            </div>
          </div>
        </div>
      </main>

      {selectedPatientChart && (
        <div
          className="fixed inset-0 z-50 bg-black/35 flex justify-end"
          onClick={() => setSelectedPatientChart(null)}
        >
          <aside
            className="w-full max-w-md bg-[var(--df-surface)] h-full p-5 sm:p-6 overflow-y-auto shadow-2xl border-l border-[var(--df-border)] flex flex-col justify-between gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] text-[var(--df-text-muted)]">
                    Visiting specialist chart preview · {activeDay.clinic}
                  </p>
                  <h2 className="df-serif text-xl font-semibold text-[var(--df-text)] mt-0.5">
                    {selectedPatientChart.patient}
                  </h2>
                  <p className="text-xs text-[var(--df-teal)] font-semibold">
                    {selectedPatientChart.procedure} · {selectedPatientChart.time}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatientChart(null)}
                  className="p-1.5 rounded-lg hover:bg-[var(--df-surface-muted)] cursor-pointer"
                  aria-label="Close chart preview"
                >
                  <X className="h-4 w-4 text-[var(--df-text-muted)]" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] text-xs">
                <p className="font-bold text-[var(--df-text)]">Chairside note</p>
                <p className="text-[var(--df-text-secondary)] mt-0.5">
                  {selectedPatientChart.note}
                </p>
              </div>

              <div className="df-card p-3.5 space-y-2 text-xs">
                <p className="font-bold text-[var(--df-text)]">Linked IOPA &amp; working length</p>
                <div className="h-28 rounded-xl bg-[#0B161C] flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border-2 border-[#F5B076] flex items-center justify-center text-[10px] font-bold text-[#F5B076]">
                    Apex WL
                  </div>
                </div>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  MB1 20.5 mm · DB 20.0 mm · Palatal 21.5 mm · rotary file protocol ready on{" "}
                  {activeDay.chair}.
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[var(--df-text)] block">
                  Add endodontic progress note
                </label>
                <textarea
                  rows={3}
                  value={clinicalNote}
                  onChange={(e) => setClinicalNote(e.target.value)}
                  placeholder="Enter obturation / dressing / recall instruction for clinic dentist..."
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--df-teal)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--df-border)]">
              <button
                type="button"
                onClick={() => setSelectedPatientChart(null)}
                className="df-btn-secondary py-2 text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Saved specialist note for ${selectedPatientChart.patient}`);
                  setSelectedPatientChart(null);
                }}
                className="df-btn-primary py-2 text-xs cursor-pointer"
              >
                Save note to chart
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function SpecialistPortalPage() {
  return (
    <DentflowProvider>
      <SpecialistPortalInner />
    </DentflowProvider>
  );
}

