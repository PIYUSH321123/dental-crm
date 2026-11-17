"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowKpiCard,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { formatRelativeHeaderDate } from "@/lib/date-helpers";
import { StatusTone } from "@/lib/dentflow-theme";
import { useDentflow } from "@/lib/dentflow-store";
import { formatClinicTime, sortByTime } from "@/lib/time-utils";
import { ClinicAppointment } from "@/types/dentflow";

const APT_STATUS_TONE: Record<ClinicAppointment["status"], StatusTone> = {
  Done: "green",
  "In chair": "amber",
  "Checked in": "blue",
  "Late 10 min": "red",
  Confirmed: "green",
  "Not confirmed": "amber",
  Cancelled: "grey",
};

const FLAG_STYLES: Record<string, string> = {
  Anxious: "bg-[#FEF3DC] text-[#9A5B00] border-[#F8DFAA]",
  Allergy: "bg-[#FDE7E7] text-[#B42318] border-[#F7C2C2]",
  New: "bg-[#E5EFFD] text-[#1D4ED8] border-[#BFDBFE]",
  VIP: "bg-[#F1E8FD] text-[#6D28D9] border-[#DDD6FE]",
};

export default function TodayFrontDeskPage() {
  const router = useRouter();
  const { state, updateState, searchQuery } = useDentflow();

  const [chairFilter, setChairFilter] = useState<string>("All chairs");
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    patientName: "",
    procedure: "Consultation · tooth pain",
    doctor: "Dr. Arjun M.",
    chair: "C1",
    time: "11:15",
  });

  const timeFormat = state.clinicSetup.timeFormat || "12h";

  const filteredAppointments = useMemo(() => {
    const filtered = state.appointments.filter((apt) => {
      if (chairFilter !== "All chairs" && apt.chair !== chairFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          apt.patientName.toLowerCase().includes(q) ||
          apt.procedure.toLowerCase().includes(q) ||
          apt.doctor.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return sortByTime(filtered, (apt) => apt.time);
  }, [state.appointments, chairFilter, searchQuery]);

  const postOpAlertCount = state.postOpCases.filter((p) => p.status === "Alert").length;
  const doneCount = state.appointments.filter((a) => a.status === "Done").length + 8;
  const notConfirmedCount = state.appointments.filter((a) => a.status === "Not confirmed").length + 1;

  const cycleStatus = (apt: ClinicAppointment) => {
    const order: ClinicAppointment["status"][] = [
      "Not confirmed",
      "Confirmed",
      "Checked in",
      "In chair",
      "Done",
    ];
    const idx = order.indexOf(apt.status);
    const nextStatus = order[(idx + 1) % order.length];
    updateState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === apt.id ? { ...a, status: nextStatus } : a,
      ),
    }));
    toast.success(`${apt.patientName} marked as "${nextStatus}"`);
  };

  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInForm.patientName.trim()) {
      toast.error("Enter patient name");
      return;
    }
    const newApt: ClinicAppointment = {
      id: `apt-${Date.now()}`,
      time: walkInForm.time,
      endTime: "11:45",
      durationMin: 30,
      anxietyBufferMin: 0,
      patientId: `pat-${Date.now()}`,
      patientName: walkInForm.patientName.trim(),
      flags: ["New"],
      procedure: walkInForm.procedure,
      doctor: walkInForm.doctor,
      chair: walkInForm.chair,
      branch: state.activeBranch === "All 3 branches" ? "Station Road branch" : state.activeBranch,
      status: "Checked in",
    };
    updateState((prev) => ({
      ...prev,
      appointments: [newApt, ...prev.appointments],
    }));
    toast.success(`Walk-in added for ${newApt.patientName} (${newApt.chair})`);
    setWalkInForm({ ...walkInForm, patientName: "" });
    setWalkInOpen(false);
  };

  const greetingName =
    state.activeRole === "Front desk" ? "Anita" : "Dr. Sneha";

  return (
    <div>
      <DentflowPageHeader
        title={`Good morning, ${greetingName}`}
        subtitle={`${formatRelativeHeaderDate(0)} · ${24 + state.appointments.length} appointments across 4 chairs`}
      />

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
        <DentflowKpiCard
          label="Appointments today"
          value={`${24 + state.appointments.length}`}
          subtext={`${doneCount} done · ${notConfirmedCount} not confirmed`}
        />
        <DentflowKpiCard
          label="Chairs in use"
          value="3 / 4"
          subtext={`Chair 4 free till ${formatClinicTime("11:00", timeFormat)}`}
        />
        <DentflowKpiCard
          label="Collected today"
          value="₹48,200"
          subtext="UPI 71% · card 18% · cash 11%"
        />
        <DentflowKpiCard
          label="Unfinished treatment"
          value="₹6.84 L"
          subtext="57 plans waiting · open recovery"
          subtextTone="teal"
        />
        <DentflowKpiCard
          label="Post-op alerts"
          value={`${postOpAlertCount}`}
          subtext="Pain rising after extraction"
          subtextTone="red"
        />
      </div>

      {/* Main Content Split: Queue (Left) + Needs Attention & AI Receptionist (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Today's Queue */}
        <section className="xl:col-span-8 df-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-[var(--df-border)]">
            <h2 className="df-serif text-base font-semibold text-[var(--df-text)]">
              Today&apos;s queue
            </h2>
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by chair"
                value={chairFilter}
                onChange={(e) => setChairFilter(e.target.value)}
                className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--df-text)] cursor-pointer"
              >
                <option value="All chairs">All chairs</option>
                <option value="C1">Chair 1 (C1)</option>
                <option value="C2">Chair 2 (C2)</option>
                <option value="C3">Chair 3 (C3)</option>
                <option value="C4">Chair 4 (C4)</option>
              </select>
              <button
                type="button"
                onClick={() => setWalkInOpen(true)}
                className="df-btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Walk-in / booking
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--df-border)] bg-[var(--df-surface-muted)]">
                  <th className="py-2.5 pl-5 pr-3 text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    Time
                  </th>
                  <th className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    Patient
                  </th>
                  <th className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    Procedure
                  </th>
                  <th className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    Doctor
                  </th>
                  <th className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    Chair
                  </th>
                  <th className="py-2.5 pl-3 pr-5 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-[var(--df-surface-hover)]/60 transition-colors"
                  >
                    <td className="py-2.5 pl-5 pr-3 text-xs df-mono text-[var(--df-text-secondary)] whitespace-nowrap">
                      {formatClinicTime(apt.time, timeFormat)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/app/patients?patientId=${apt.patientId}`}
                          className="text-xs font-semibold text-[var(--df-text)] hover:text-[var(--df-teal)] hover:underline"
                        >
                          {apt.patientName}
                        </Link>
                        {apt.flags.map((flag) => (
                          <span
                            key={flag}
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full border ${
                              FLAG_STYLES[flag] || ""
                            }`}
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-[var(--df-text-secondary)]">
                      {apt.procedure}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-[var(--df-text-muted)] whitespace-nowrap">
                      {apt.doctor}
                    </td>
                    <td className="py-2.5 px-3 text-xs font-medium text-[var(--df-text-secondary)]">
                      {apt.chair}
                    </td>
                    <td className="py-2.5 pl-3 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => cycleStatus(apt)}
                        title="Click to advance queue status"
                        className="cursor-pointer"
                      >
                        <DentflowStatusPill
                          label={apt.status}
                          tone={APT_STATUS_TONE[apt.status]}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Needs Attention + AI Receptionist Summary */}
        <div className="xl:col-span-4 space-y-4">
          <section className="df-card p-4">
            <h2 className="df-serif text-base font-semibold text-[var(--df-text)] mb-3">
              Needs attention
            </h2>
            <div className="space-y-2.5">
              {state.needsAttention.map((item) => {
                const borderColor =
                  item.tone === "red"
                    ? "border-l-[var(--df-alert-red-accent)] bg-[var(--df-alert-red-bg)]"
                    : item.tone === "amber"
                    ? "border-l-[var(--df-alert-amber-accent)] bg-[var(--df-alert-amber-bg)]"
                    : item.tone === "teal"
                    ? "border-l-[var(--df-alert-teal-accent)] bg-[var(--df-alert-teal-bg)]"
                    : "border-l-[var(--df-alert-blue-accent)] bg-[var(--df-alert-blue-bg)]";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(`/app/${item.targetRoute}`)}
                    className={`w-full text-left p-2.5 rounded-lg border border-[var(--df-border)] border-l-4 ${borderColor} hover:brightness-98 transition-all cursor-pointer`}
                  >
                    <p className="text-xs font-semibold text-[var(--df-text)]">{item.title}</p>
                    <p className="text-[11px] text-[var(--df-text-secondary)] mt-0.5 leading-snug">
                      {item.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* AI Receptionist Dark Forest Card */}
          <section className="rounded-2xl bg-[var(--df-sidebar-bg)] text-white p-4 border border-[var(--df-sidebar-border)] shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--df-unique-dark-bg)] text-[var(--df-unique-dark-text)]">
                AI receptionist
              </span>
              <span className="text-[11px] text-[var(--df-sidebar-muted)]">
                since {formatClinicTime("08:00", timeFormat)}
              </span>
            </div>
            <p className="df-serif text-lg font-semibold leading-snug">
              23 calls handled · 6 booked
            </p>
            <p className="text-[11px] text-[var(--df-sidebar-muted)] mt-1 leading-relaxed">
              4 calls handed to you (implant swelling, insurance query...)
            </p>
            <Link
              href="/app/ai-receptionist"
              className="inline-block mt-3 text-xs font-semibold text-white underline underline-offset-4 hover:text-[#F5B076]"
            >
              Open call log
            </Link>
          </section>
        </div>
      </div>

      {/* Walk-in / Quick Booking Drawer */}
      <DentflowDrawer
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        title="Walk-in / quick booking"
        subtitle="Adds patient straight into today's Station Road queue"
      >
        <form onSubmit={handleAddWalkIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--df-text)] mb-1">
              Patient name
            </label>
            <input
              type="text"
              value={walkInForm.patientName}
              onChange={(e) => setWalkInForm({ ...walkInForm, patientName: e.target.value })}
              placeholder="e.g. Snehal Pawar"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--df-text)] mb-1">
              Procedure
            </label>
            <input
              type="text"
              value={walkInForm.procedure}
              onChange={(e) => setWalkInForm({ ...walkInForm, procedure: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--df-text)] mb-1">
                Doctor
              </label>
              <select
                value={walkInForm.doctor}
                onChange={(e) => setWalkInForm({ ...walkInForm, doctor: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
              >
                <option>Dr. Sneha K.</option>
                <option>Dr. Arjun M.</option>
                <option>Dr. Farhan A.</option>
                <option>Dr. Karan S.</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--df-text)] mb-1">
                Chair
              </label>
              <select
                value={walkInForm.chair}
                onChange={(e) => setWalkInForm({ ...walkInForm, chair: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
              >
                <option>C1</option>
                <option>C2</option>
                <option>C3</option>
                <option>C4</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--df-text)] mb-1">
              Time
            </label>
            <input
              type="text"
              value={walkInForm.time}
              onChange={(e) => setWalkInForm({ ...walkInForm, time: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"
            />
          </div>
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setWalkInOpen(false)}
              className="df-btn-secondary flex-1 py-2 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" className="df-btn-primary flex-1 py-2 text-xs cursor-pointer">
              Add to queue
            </button>
          </div>
        </form>
      </DentflowDrawer>
    </div>
  );
}
