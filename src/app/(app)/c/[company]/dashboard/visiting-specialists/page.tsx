"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";

const DAYS = ["Mon 5", "Tue 6", "Wed 7", "Thu 8", "Fri 9", "Sat 10"] as const;

interface SpecialistSlotCell {
  branch: string;
  hours: string;
  status: string;
  tone: "green" | "amber" | "blue" | "red";
  selected?: boolean;
}

const SPECIALIST_GRID: {
  name: string;
  specialty: string;
  cells: Partial<Record<(typeof DAYS)[number], SpecialistSlotCell>>;
}[] = [
  {
    name: "Dr. Farhan Ali",
    specialty: "Implantologist",
    cells: {
      "Tue 6": {
        branch: "Station Road",
        hours: "2–7 pm",
        status: "Full · 7 waiting",
        tone: "red",
      },
      "Thu 8": {
        branch: "MG Road",
        hours: "10–2",
        status: "3 of 4 h",
        tone: "amber",
      },
      "Sat 10": {
        branch: "Civil Lines",
        hours: "10–4",
        status: "2 of 6 h",
        tone: "blue",
      },
    },
  },
  {
    name: "Dr. Karan Shah",
    specialty: "Orthodontist",
    cells: {
      "Mon 5": {
        branch: "Station Road",
        hours: "11–6",
        status: "5 of 7 h",
        tone: "green",
      },
      "Thu 8": {
        branch: "Civil Lines",
        hours: "12–5",
        status: "4.7 of 5 h",
        tone: "blue",
        selected: true,
      },
    },
  },
  {
    name: "Dr. Meera Iyer",
    specialty: "Endodontist",
    cells: {
      "Thu 8": {
        branch: "Station Road",
        hours: "10–5",
        status: "6 of 7 h",
        tone: "green",
      },
    },
  },
  {
    name: "Dr. Rohan Batra",
    specialty: "Periodontist",
    cells: {
      "Wed 7": {
        branch: "Civil Lines",
        hours: "4–8 pm",
        status: "Not yet opened",
        tone: "blue",
      },
      "Sat 10": {
        branch: "MG Road",
        hours: "9–1",
        status: "1 of 4 h",
        tone: "amber",
      },
    },
  },
];

const INITIAL_GROUPED_PATIENTS = [
  {
    time: "12:00",
    patient: "Kavya Reddy",
    procedure: "Aligner tray 11 check",
    referredBy: "Referred by Dr. Arjun",
    status: "Confirmed" as const,
  },
  {
    time: "12:30",
    patient: "Tanvi Shah",
    procedure: "Braces adjustment",
    referredBy: "Referred by Dr. Sneha",
    status: "Confirmed" as const,
  },
  {
    time: "1:00",
    patient: "Om Kulkarni",
    procedure: "Braces adjustment",
    referredBy: "Referred by Dr. Arjun",
    status: "Confirmed" as const,
  },
  {
    time: "2:00",
    patient: "Riya Das",
    procedure: "Aligner delivery + training",
    referredBy: "Referred by Dr. Sneha",
    status: "Not confirmed" as const,
  },
  {
    time: "3:00",
    patient: "Aarav Deshmukh (7y)",
    procedure: "First orthodontic check",
    referredBy: "Referred by Family timeline",
    status: "New" as const,
  },
  {
    time: "3:30",
    patient: "Snehal Pawar",
    procedure: "Aligner consult (recovery list)",
    referredBy: "Referred by Dr. Sneha",
    status: "New" as const,
  },
];

export default function VisitingSpecialistsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState(INITIAL_GROUPED_PATIENTS);
  const [groupedAdded, setGroupedAdded] = useState(false);

  const handleAutoGroup = () => {
    if (groupedAdded) {
      toast.info("All waiting ortho patients at Civil Lines are already grouped.");
      return;
    }
    setPatients((prev) => [
      ...prev,
      {
        time: "4:15",
        patient: "Meera Nair (consult)",
        procedure: "Retainer check",
        referredBy: "Auto-grouped from waitlist",
        status: "New",
      },
    ]);
    setGroupedAdded(true);
    toast.success("Auto-grouped 1 waiting Civil Lines ortho patient into 4:15 pm slot");
  };

  const cellBg = (tone: SpecialistSlotCell["tone"]) =>
    tone === "green"
      ? "bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)]"
      : tone === "amber"
      ? "bg-[var(--df-status-amber-bg)] text-[var(--df-status-amber-text)]"
      : tone === "red"
      ? "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)]"
      : "bg-[var(--df-status-blue-bg)] text-[var(--df-status-blue-text)]";

  return (
    <div>
      <DentflowPageHeader
        title="Visiting specialists"
        subtitle="Week of 5 October · book specialist days, group their patients, settle payouts"
        defaultBranch="All 3 branches"
      />

      {/* Top Week Grid Card */}
      <div className="df-card p-5 mb-5 overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
              <th className="py-2 pr-3 text-left w-44">Specialist</th>
              {DAYS.map((d) => (
                <th key={d} className="py-2 px-2 text-left">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--df-border)]">
            {SPECIALIST_GRID.map((sp) => (
              <tr key={sp.name}>
                <td className="py-3 pr-3 align-top">
                  <p className="font-bold text-[var(--df-text)]">{sp.name}</p>
                  <p className="text-[11px] text-[var(--df-text-muted)]">{sp.specialty}</p>
                </td>
                {DAYS.map((d) => {
                  const cell = sp.cells[d];
                  return (
                    <td key={d} className="py-2.5 px-1.5 align-top">
                      {cell ? (
                        <div
                          className={`p-2 rounded-xl border ${cellBg(cell.tone)} ${
                            cell.selected
                              ? "border-[var(--df-sidebar-bg)] ring-1 ring-[var(--df-sidebar-bg)]"
                              : "border-transparent"
                          }`}
                        >
                          <p className="font-bold text-[11px]">{cell.branch}</p>
                          <p className="text-[10.5px] opacity-85">{cell.hours}</p>
                          <p className="text-[10.5px] font-semibold mt-0.5">{cell.status}</p>
                        </div>
                      ) : (
                        <div className="h-14 rounded-xl bg-[var(--df-surface-muted)]/50" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col Grouped patient list */}
        <div className="xl:col-span-8 df-card p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              Dr. Karan Shah · Thu 8 Oct · Civil Lines
            </h2>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[var(--df-text-muted)]">
                {groupedAdded ? "5 h booked of 5 h" : "4 h 40 m booked of 5 h"}
              </span>
              <button
                type="button"
                onClick={handleAutoGroup}
                className="df-btn-primary px-3 py-1.5 text-xs cursor-pointer"
              >
                Auto-group waiting patients
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <tbody className="divide-y divide-[var(--df-border)]">
                {patients.map((pt) => (
                  <tr key={pt.time + pt.patient} className="hover:bg-[var(--df-surface-hover)]/60">
                    <td className="py-2.5 pr-2 font-medium text-[var(--df-text-muted)] whitespace-nowrap">
                      {pt.time}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-[var(--df-text)] whitespace-nowrap">
                      {pt.patient}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                      {pt.procedure}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--df-text-muted)]">
                      {pt.referredBy}
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <DentflowStatusPill
                        label={pt.status}
                        tone={
                          pt.status === "Confirmed"
                            ? "green"
                            : pt.status === "Not confirmed"
                            ? "amber"
                            : "blue"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4-col Revenue share card */}
        <div className="xl:col-span-4 df-card p-5 space-y-3 text-xs">
          <h2 className="text-sm font-bold text-[var(--df-text)]">
            Revenue share · Dr. Karan
          </h2>
          <p className="text-[11px] text-[var(--df-text-muted)] leading-relaxed">
            Rule: 45% of fee after aligner lab cost. Clinic keeps consumables and chair.
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Collected (Sep)</span>
              <span className="font-semibold">₹2,85,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Less aligner lab</span>
              <span>− ₹88,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Net</span>
              <span className="font-semibold">₹1,96,500</span>
            </div>
            <div className="pt-2 border-t border-[var(--df-border)] flex justify-between font-bold text-sm">
              <span>Dr. Karan · 45%</span>
              <span>₹88,400</span>
            </div>
            <div className="flex justify-between text-[var(--df-text-muted)]">
              <span>Clinic · 55%</span>
              <span>₹1,08,100</span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--df-text-muted)] leading-relaxed pt-1">
            Settled monthly by UPI with a statement the specialist can see in their portal. Only
            collected amounts count.
          </p>

          <button
            type="button"
            onClick={() => router.push("/specialist")}
            className="w-full df-btn-secondary py-2 text-xs cursor-pointer"
          >
            See the specialist&apos;s view
          </button>
        </div>
      </div>
    </div>
  );
}
