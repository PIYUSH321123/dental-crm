"use client";

import React from "react";
import {
  DentflowKpiCard,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";

const BRANCH_ROWS = [
  {
    name: "Station Road",
    sub: "4 chairs · 2 doctors + visiting",
    revenue: { text: "₹11.2 L", best: true },
    newPatients: { text: "138", best: true },
    chairUse: { text: "78%", tone: "green" as const },
    caseAccept: { text: "68%", tone: "green" as const },
    noShow: { text: "6%", tone: null },
    rating: { text: "4.8", tone: "green" as const },
  },
  {
    name: "Civil Lines",
    sub: "3 chairs · 1 doctor + visiting",
    revenue: { text: "₹8.1 L", best: false },
    newPatients: { text: "104", best: false },
    chairUse: { text: "69%", tone: null },
    caseAccept: { text: "61%", tone: null },
    noShow: { text: "4%", tone: "green" as const },
    rating: { text: "4.6", tone: null },
  },
  {
    name: "MG Road",
    sub: "2 chairs · 1 doctor · opened Jun",
    revenue: { text: "₹5.3 L", best: false },
    newPatients: { text: "70", best: false },
    chairUse: { text: "58%", tone: "amber" as const },
    caseAccept: { text: "52%", tone: "amber" as const },
    noShow: { text: "11%", tone: "amber" as const },
    rating: { text: "4.4", tone: null },
  },
];

const WEEKLY_REVENUE = [
  { week: "1–7 Sep", station: 2.6, civil: 1.9, mg: 1.1 },
  { week: "8–14 Sep", station: 2.9, civil: 2.1, mg: 1.3 },
  { week: "15–21 Sep", station: 2.8, civil: 2.0, mg: 1.4 },
  { week: "22–28 Sep", station: 2.9, civil: 2.1, mg: 1.5 },
];

const OWNER_ALERTS = [
  {
    title: "MG Road no-shows at 11%",
    sub: "Deposit for first visits is off at this branch",
    bg: "bg-[var(--df-alert-red-bg)] border-l-[var(--df-alert-red-accent)]",
  },
  {
    title: "Lignocaine expiring at 2 branches",
    sub: "Move 20 cartridges from Civil Lines to MG Road",
    bg: "bg-[var(--df-alert-amber-bg)] border-l-[var(--df-alert-amber-accent)]",
  },
  {
    title: "Dr. Farhan fully booked next Tue",
    sub: "7 implant consults waiting · add a half-day?",
    bg: "bg-[var(--df-alert-teal-bg)] border-l-[var(--df-alert-teal-accent)]",
  },
  {
    title: "Review rating dipped at MG Road",
    sub: "2 private low ratings this week: waiting time",
    bg: "bg-[var(--df-alert-blue-bg)] border-l-[var(--df-alert-blue-accent)]",
  },
];

export default function AllBranchesPage() {
  return (
    <div>
      <DentflowPageHeader
        title="All branches"
        subtitle="Smile Studio Dental group · September 2026 to date"
        defaultBranch="All 3 branches"
      />

      {/* 5 Group KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
        <DentflowKpiCard
          label="Revenue (group)"
          value="₹24.6 L"
          subtext="+12% vs Aug to date"
          subtextTone="green"
        />
        <DentflowKpiCard
          label="New patients"
          value="312"
          subtext="41% from referrals"
        />
        <DentflowKpiCard
          label="Chair utilisation"
          value="71%"
          subtext="target 80%"
        />
        <DentflowKpiCard
          label="Case acceptance"
          value="63%"
          subtext="plans accepted within 14 days"
        />
        <DentflowKpiCard
          label="Unfinished treatment"
          value="₹17.9 L"
          subtext="across 148 plans"
        />
      </div>

      {/* Branch Comparison Table */}
      <div className="df-card p-5 space-y-3.5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[var(--df-text)]">Branch comparison</h2>
          <span className="text-[11px] text-[var(--df-text-muted)]">
            Green = best of group · amber = needs attention
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                <th className="py-2 pr-2 text-left">Branch</th>
                <th className="py-2 px-2 text-left">Revenue</th>
                <th className="py-2 px-2 text-left">New patients</th>
                <th className="py-2 px-2 text-left">Chair use</th>
                <th className="py-2 px-2 text-left">Case accept.</th>
                <th className="py-2 px-2 text-left">No-show</th>
                <th className="py-2 pl-2 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--df-border)]">
              {BRANCH_ROWS.map((b) => (
                <tr key={b.name} className="hover:bg-[var(--df-surface-hover)]/60">
                  <td className="py-3 pr-2">
                    <p className="font-bold text-[var(--df-text)]">{b.name}</p>
                    <p className="text-[11px] text-[var(--df-text-muted)]">{b.sub}</p>
                  </td>
                  <td className="py-3 px-2 font-bold">
                    {b.revenue.best ? (
                      <DentflowStatusPill label={b.revenue.text} tone="green" />
                    ) : (
                      b.revenue.text
                    )}
                  </td>
                  <td className="py-3 px-2 font-semibold">
                    {b.newPatients.best ? (
                      <DentflowStatusPill label={b.newPatients.text} tone="green" />
                    ) : (
                      b.newPatients.text
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {b.chairUse.tone ? (
                      <DentflowStatusPill
                        label={b.chairUse.text}
                        tone={b.chairUse.tone}
                      />
                    ) : (
                      <span className="font-semibold">{b.chairUse.text}</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {b.caseAccept.tone ? (
                      <DentflowStatusPill
                        label={b.caseAccept.text}
                        tone={b.caseAccept.tone}
                      />
                    ) : (
                      <span className="font-semibold">{b.caseAccept.text}</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {b.noShow.tone ? (
                      <DentflowStatusPill
                        label={b.noShow.text}
                        tone={b.noShow.tone}
                      />
                    ) : (
                      <span className="font-semibold">{b.noShow.text}</span>
                    )}
                  </td>
                  <td className="py-3 pl-2 text-right">
                    {b.rating.tone ? (
                      <DentflowStatusPill
                        label={b.rating.text}
                        tone={b.rating.tone}
                      />
                    ) : (
                      <span className="font-semibold">{b.rating.text}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 2-column grid: Revenue by week + Owner alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col Grouped Bar Chart */}
        <div className="xl:col-span-8 df-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              Revenue by week · ₹ lakh
            </h2>
            <div className="flex items-center gap-4 text-[11px] text-[var(--df-text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-[var(--df-teal)]" />
                Station Road
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-[var(--df-teal-border)]" />
                Civil Lines
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-[var(--df-unique-text)]" />
                MG Road
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 pt-4 items-end h-52">
            {WEEKLY_REVENUE.map((w) => (
              <div
                key={w.week}
                className="flex flex-col items-center h-full justify-end gap-2"
              >
                <div className="flex items-end gap-1.5 h-40 w-full justify-center">
                  <div className="flex flex-col items-center gap-1 w-6">
                    <span className="text-[10px] font-semibold text-[var(--df-text-muted)]">
                      {w.station.toFixed(1)}
                    </span>
                    <div
                      style={{ height: `${Math.round((w.station / 3.1) * 132)}px` }}
                      className="w-full rounded-t-md bg-[var(--df-teal)]"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 w-6">
                    <span className="text-[10px] font-semibold text-[var(--df-text-muted)]">
                      {w.civil.toFixed(1)}
                    </span>
                    <div
                      style={{ height: `${Math.round((w.civil / 3.1) * 132)}px` }}
                      className="w-full rounded-t-md bg-[var(--df-teal-border)]"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 w-6">
                    <span className="text-[10px] font-semibold text-[var(--df-text-muted)]">
                      {w.mg.toFixed(1)}
                    </span>
                    <div
                      style={{ height: `${Math.round((w.mg / 3.1) * 132)}px` }}
                      className="w-full rounded-t-md bg-[var(--df-unique-text)]/80"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[var(--df-text-muted)]">
                  {w.week}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4-col Owner alerts */}
        <div className="xl:col-span-4 df-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-[var(--df-text)]">Owner alerts</h2>
          <div className="space-y-2.5">
            {OWNER_ALERTS.map((a) => (
              <div
                key={a.title}
                className={`p-3 rounded-xl border border-[var(--df-border)] border-l-4 ${a.bg}`}
              >
                <p className="text-xs font-bold text-[var(--df-text)]">{a.title}</p>
                <p className="text-[11px] text-[var(--df-text-secondary)] mt-0.5">{a.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
