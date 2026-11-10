"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  DentflowKpiCard,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";

const DROP_OFF_BY_TYPE = [
  { label: "Implants", pct: 38, color: "bg-[var(--df-status-red-text)]" },
  { label: "Aligners", pct: 34, color: "bg-[var(--df-unique-text)]" },
  { label: "Crown after RCT", pct: 29, color: "bg-[var(--df-unique-text)]" },
  { label: "Full dentures", pct: 24, color: "bg-[var(--df-unique-text)]/75" },
  { label: "Gum treatment", pct: 22, color: "bg-[var(--df-unique-text)]/75" },
  { label: "Root canal", pct: 12, color: "bg-[var(--df-teal)]" },
  { label: "Fillings", pct: 6, color: "bg-[var(--df-teal)]" },
];

const IMPLANT_FUNNEL = [
  { stage: "Consultation", count: 100, drop: "", widthPct: 100 },
  { stage: "Plan proposed", count: 84, drop: "− 16", widthPct: 84 },
  { stage: "Accepted", count: 52, drop: "− 32", widthPct: 52 },
  { stage: "Surgery done", count: 41, drop: "− 11", widthPct: 41 },
  { stage: "Crown fitted", count: 31, drop: "− 10", widthPct: 31 },
];

const MOST_REQUESTED = [
  { name: "Root canal", count: 212, widthPct: 95 },
  { name: "Scaling", count: 198, widthPct: 89 },
  { name: "Fillings", count: 176, widthPct: 79 },
  { name: "Crowns", count: 94, widthPct: 42 },
  { name: "Aligners", count: 41, widthPct: 19 },
  { name: "Implants", count: 38, widthPct: 17 },
];

const LOYAL_PATIENTS = [
  {
    name: "Nair family",
    sub: "Since 2019 · 4 members",
    visits: 31,
    lifetime: "₹1.84 L",
    referred: 6,
  },
  {
    name: "Suresh Patil",
    sub: "Since 2020",
    visits: 18,
    lifetime: "₹96,400",
    referred: 4,
  },
  {
    name: "Reddy family",
    sub: "Since 2021 · 3 members",
    visits: 22,
    lifetime: "₹2.10 L",
    referred: 3,
  },
  {
    name: "Fatima Shaikh",
    sub: "Since 2022",
    visits: 14,
    lifetime: "₹71,000",
    referred: 3,
  },
];

export default function PatientInsightsPage() {
  const params = useParams();
  const company =
    (Array.isArray(params?.company) ? params.company[0] : params?.company) || "smile-studio";

  return (
    <div>
      <DentflowPageHeader
        title="Patient insights"
        subtitle="Retention, engagement and where treatment drops off · last 12 months"
        defaultBranch="All 3 branches"
      />

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
        <DentflowKpiCard
          label="Return within 6 months"
          value="58%"
          subtext="target 70%"
        />
        <DentflowKpiCard
          label="Return within 12 months"
          value="64%"
          subtext="of patients seen last year"
        />
        <DentflowKpiCard
          label="Patient engagement rate"
          value="71%"
          subtext="read or replied to messages, 90 days"
        />
        <DentflowKpiCard
          label="Visits per patient / year"
          value="2.4"
          subtext="families: 3.1"
        />
        <DentflowKpiCard
          label="Treatment completion"
          value="63%"
          subtext="accepted plans finished"
        />
      </div>

      {/* Middle 2-column row: Retention Curve + Drop-off by Type */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5">
        {/* Left 7-col Retention Line Chart */}
        <div className="xl:col-span-7 df-card p-5 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              58% of new patients return within 6 months
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Share of Jan–Mar 2026 new patients who came back for any visit, by months since
              first visit · dashed line = 70% target
            </p>
          </div>

          <div className="pt-2">
            <svg viewBox="0 0 520 190" className="w-full h-48 overflow-visible">
              {/* Grid lines */}
              {[
                { y: 20, label: "100%" },
                { y: 58, label: "75%" },
                { y: 95, label: "50%" },
                { y: 132, label: "25%" },
                { y: 168, label: "0%" },
              ].map((g) => (
                <g key={g.label}>
                  <line
                    x1="38"
                    y1={g.y}
                    x2="505"
                    y2={g.y}
                    stroke="#E5E2D9"
                    strokeWidth="1"
                  />
                  <text x="6" y={g.y + 3} fontSize="10" fill="#76807B">
                    {g.label}
                  </text>
                </g>
              ))}

              {/* Target 70% dashed line */}
              <line
                x1="38"
                y1="66"
                x2="505"
                y2="66"
                stroke="#86A89D"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="44" y="61" fontSize="10" fill="#4C5752" fontWeight="600">
                Target 70%
              </text>

              {/* Retention curve */}
              <polyline
                fill="none"
                stroke="#146C58"
                strokeWidth="2.5"
                points="65,134 115,112 165,98 215,90 265,84 315,82 395,76 485,73"
              />

              {/* Data nodes */}
              {[
                { x: 65, y: 134 },
                { x: 115, y: 112, label: "41%" },
                { x: 165, y: 98 },
                { x: 215, y: 90 },
                { x: 265, y: 84 },
                { x: 315, y: 82, label: "58%" },
                { x: 395, y: 76 },
                { x: 485, y: 73, label: "64%" },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#146C58" />
                  {pt.label && (
                    <text
                      x={pt.x}
                      y={pt.y + 15}
                      fontSize="10"
                      fontWeight="700"
                      fill="#18221E"
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>
                  )}
                </g>
              ))}

              {/* X-axis month labels */}
              {[
                { x: 65, t: "1" },
                { x: 115, t: "2" },
                { x: 165, t: "3" },
                { x: 215, t: "4" },
                { x: 265, t: "5" },
                { x: 315, t: "6" },
                { x: 395, t: "10" },
                { x: 485, t: "12" },
              ].map((m) => (
                <text
                  key={m.t}
                  x={m.x}
                  y="184"
                  fontSize="10"
                  fill="#76807B"
                  textAnchor="middle"
                >
                  {m.t}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Right 5-col Drop-off by Treatment Type */}
        <div className="xl:col-span-5 df-card p-5 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              Implants and aligners drop off the most
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Accepted plans not completed, by treatment type
            </p>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            {DROP_OFF_BY_TYPE.map((row) => (
              <div key={row.label} className="grid grid-cols-12 items-center gap-2">
                <span className="col-span-4 text-[var(--df-text-secondary)] truncate">
                  {row.label}
                </span>
                <div className="col-span-6 h-2 rounded-full bg-[var(--df-canvas-subtle)] overflow-hidden">
                  <div
                    style={{ width: `${row.pct * 2.3}%` }}
                    className={`h-full rounded-full ${row.color}`}
                  />
                </div>
                <span className="col-span-2 text-right font-bold text-[var(--df-text)]">
                  {row.pct}%
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href={`/c/${company}/dashboard/recovery`}
              className="text-xs font-bold text-[var(--df-teal)] hover:underline"
            >
              ₹17.9 L waiting in unfinished plans → open recovery
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Col 1: Implant funnel */}
        <div className="df-card p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--df-text)]">
              Where implant patients drop
            </h3>
            <p className="text-[11px] text-[var(--df-text-muted)]">
              100 implant consultations · last 12 months
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {IMPLANT_FUNNEL.map((f) => (
              <div key={f.stage} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--df-text-secondary)]">{f.stage}</span>
                  <span>
                    <strong className="text-[var(--df-text)]">{f.count}</strong>{" "}
                    {f.drop && (
                      <span className="text-[var(--df-status-red-text)] font-semibold">
                        {f.drop}
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--df-canvas-subtle)] overflow-hidden">
                  <div
                    style={{ width: `${f.widthPct}%` }}
                    className="h-full rounded-full bg-[var(--df-teal)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Most requested treatments */}
        <div className="df-card p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--df-text)]">
              Most requested treatments
            </h3>
            <p className="text-[11px] text-[var(--df-text-muted)]">
              Procedures done · last 90 days
            </p>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            {MOST_REQUESTED.map((m) => (
              <div key={m.name} className="grid grid-cols-12 items-center gap-2">
                <span className="col-span-4 text-[var(--df-text-secondary)]">{m.name}</span>
                <div className="col-span-6 h-2 rounded-full bg-[var(--df-canvas-subtle)] overflow-hidden">
                  <div
                    style={{ width: `${m.widthPct}%` }}
                    className="h-full rounded-full bg-[var(--df-status-blue-text)]"
                  />
                </div>
                <span className="col-span-2 text-right font-bold text-[var(--df-text)]">
                  {m.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Most loyal patients */}
        <div className="df-card p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--df-text)]">Most loyal patients</h3>
            <p className="text-[11px] text-[var(--df-text-muted)]">
              Ranked by visits, family value and referrals · thank them or invite to refer
            </p>
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--df-border)] text-[9.5px] font-bold uppercase text-[var(--df-text-muted)]">
                <th className="py-1.5 text-left">Patient / family</th>
                <th className="py-1.5 text-right">Visits</th>
                <th className="py-1.5 text-right">Lifetime</th>
                <th className="py-1.5 text-right">Ref.</th>
                <th className="py-1.5 text-right">Engaged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--df-border)]">
              {LOYAL_PATIENTS.map((lp) => (
                <tr key={lp.name}>
                  <td className="py-2 pr-1">
                    <p className="font-bold text-[var(--df-text)]">{lp.name}</p>
                    <p className="text-[10px] text-[var(--df-text-muted)]">{lp.sub}</p>
                  </td>
                  <td className="py-2 text-right font-semibold">{lp.visits}</td>
                  <td className="py-2 text-right font-bold">{lp.lifetime}</td>
                  <td className="py-2 text-right">{lp.referred}</td>
                  <td className="py-2 text-right">
                    <DentflowStatusPill label="High" tone="green" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
