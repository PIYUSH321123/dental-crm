"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { DentflowPageHeader } from "@/components/dental/dentflow-primitives";

const REPORT_MENU = [
  {
    group: "FINANCE",
    items: ["Profit & loss", "Collections & dues", "GST summary", "Expenses"],
  },
  {
    group: "CLINICAL",
    items: ["Procedures", "Case acceptance", "Post-op outcomes"],
  },
  {
    group: "GROWTH",
    items: ["Patient sources", "Recall & campaigns", "Reviews"],
  },
  {
    group: "TEAM",
    items: ["Doctor productivity", "Attendance"],
  },
];

const PNL_ROWS = [
  { label: "Revenue", sr: "10.4", cl: "7.6", mg: "4.9", grp: "22.9", bold: true },
  { label: "Lab costs", sr: "− 1.5", cl: "− 1.1", mg: "− 0.6", grp: "− 3.2" },
  { label: "Consumables", sr: "− 0.9", cl: "− 0.7", mg: "− 0.5", grp: "− 2.1" },
  { label: "Doctor & specialist payouts", sr: "− 3.1", cl: "− 2.3", mg: "− 1.4", grp: "− 6.8" },
  { label: "Staff salaries", sr: "− 1.2", cl: "− 0.9", mg: "− 0.7", grp: "− 2.8" },
  { label: "Rent & utilities", sr: "− 0.9", cl: "− 0.7", mg: "− 0.8", grp: "− 2.4" },
  { label: "Marketing & messaging", sr: "− 0.3", cl: "− 0.2", mg: "− 0.4", grp: "− 0.9" },
  {
    label: "Software, equipment EMI, other",
    sr: "− 0.6",
    cl: "− 0.4",
    mg: "− 0.6",
    grp: "− 1.6",
  },
];

const TOP_PROCEDURES = [
  { name: "Root canal", value: "₹4.9 L", pct: 95 },
  { name: "Implants", value: "₹4.2 L", pct: 82 },
  { name: "Crowns & bridges", value: "₹3.8 L", pct: 74 },
  { name: "Aligners & braces", value: "₹3.6 L", pct: 70 },
  { name: "Scaling & gum care", value: "₹1.9 L", pct: 38 },
];

const DOCTOR_PRODUCTIVITY = [
  { name: "Dr. Farhan (visiting)", value: "₹9,800", pct: 95 },
  { name: "Dr. Sneha", value: "₹7,600", pct: 74 },
  { name: "Dr. Karan (visiting)", value: "₹7,100", pct: 69 },
  { name: "Dr. Meera (visiting)", value: "₹6,400", pct: 62 },
  { name: "Dr. Arjun", value: "₹4,900", pct: 48 },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("Profit & loss");

  return (
    <div>
      <DentflowPageHeader
        title="Reports & P&L"
        subtitle="August 2026 · closed month"
        defaultBranch="All 3 branches"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 3-col Report Menu */}
        <div className="xl:col-span-3 df-card p-3.5 space-y-4">
          {REPORT_MENU.map((sec) => (
            <div key={sec.group} className="space-y-1">
              <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                {sec.group}
              </p>
              {sec.items.map((item) => {
                const active = item === selectedReport;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelectedReport(item)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] font-bold"
                        : "text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right 9-col P&L + Breakdowns */}
        <div className="xl:col-span-9 space-y-5">
          {/* P&L Table Card */}
          <div className="df-card p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                {selectedReport === "Profit & loss"
                  ? "Profit & loss by branch"
                  : `${selectedReport} · August 2026`}
              </h2>
              <div className="flex items-center gap-1.5">
                {(["Excel", "PDF", "Tally XML"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() =>
                      toast.success(`Exported ${selectedReport} (${fmt}) for August 2026`)
                    }
                    className="df-btn-secondary px-2.5 py-1 text-[11px] cursor-pointer"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2 pr-2 text-left">₹ Lakh</th>
                    <th className="py-2 px-2 text-right">Station Road</th>
                    <th className="py-2 px-2 text-right">Civil Lines</th>
                    <th className="py-2 px-2 text-right">MG Road</th>
                    <th className="py-2 pl-2 text-right">Group</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--df-border)]">
                  {PNL_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td
                        className={`py-2.5 pr-2 ${
                          row.bold
                            ? "font-bold text-[var(--df-text)]"
                            : "text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {row.label}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right ${
                          row.bold ? "font-bold" : "text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {row.sr}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right ${
                          row.bold ? "font-bold" : "text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {row.cl}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right ${
                          row.bold ? "font-bold" : "text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {row.mg}
                      </td>
                      <td
                        className={`py-2.5 pl-2 text-right ${
                          row.bold ? "font-bold" : "text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {row.grp}
                      </td>
                    </tr>
                  ))}
                  {/* Operating profit highlighted footer */}
                  <tr className="bg-[var(--df-canvas-subtle)]/70 font-bold">
                    <td className="py-3 pr-2 text-[var(--df-text)]">Operating profit</td>
                    <td className="py-3 px-2 text-right text-[var(--df-text)]">1.9</td>
                    <td className="py-3 px-2 text-right text-[var(--df-text)]">1.3</td>
                    <td className="py-3 px-2 text-right text-[var(--df-status-red-text)]">
                      − 0.1
                    </td>
                    <td className="py-3 pl-2 text-right text-[var(--df-text)]">3.1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 2-column charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="df-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-[var(--df-text)]">
                Top procedures by revenue
              </h3>
              <div className="space-y-2.5 text-xs">
                {TOP_PROCEDURES.map((p) => (
                  <div key={p.name} className="grid grid-cols-12 items-center gap-2">
                    <span className="col-span-4 text-[var(--df-text-secondary)] truncate">
                      {p.name}
                    </span>
                    <div className="col-span-6 h-2 rounded-full bg-[var(--df-canvas-subtle)] overflow-hidden">
                      <div
                        style={{ width: `${p.pct}%` }}
                        className="h-full rounded-full bg-[var(--df-teal)]"
                      />
                    </div>
                    <span className="col-span-2 text-right font-bold text-[var(--df-text)]">
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="df-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-[var(--df-text)]">
                Doctor productivity · per chair-hour
              </h3>
              <div className="space-y-2.5 text-xs">
                {DOCTOR_PRODUCTIVITY.map((d) => (
                  <div key={d.name} className="grid grid-cols-12 items-center gap-2">
                    <span className="col-span-5 text-[var(--df-text-secondary)] truncate">
                      {d.name}
                    </span>
                    <div className="col-span-5 h-2 rounded-full bg-[var(--df-canvas-subtle)] overflow-hidden">
                      <div
                        style={{ width: `${d.pct}%` }}
                        className="h-full rounded-full bg-[var(--df-status-blue-text)]"
                      />
                    </div>
                    <span className="col-span-2 text-right font-bold text-[var(--df-text)]">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
