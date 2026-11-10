"use client";

import React, { useState } from "react";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowPageHeader,
  DentflowStatusPill,
  DentflowUniquePill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

export default function SterilisationPage() {
  const { state, updateState } = useDentflow();
  const [traceQuery, setTraceQuery] = useState("Kit E-07 · cycle #1419");
  const [autoclave, setAutoclave] = useState("Autoclave B (Class B)");
  const [tempC, setTempC] = useState("134");
  const [pressure, setPressure] = useState("2.1 bar");
  const [holdMin, setHoldMin] = useState("4");
  const [indicatorChanged, setIndicatorChanged] = useState(true);
  const [attachPhoto, setAttachPhoto] = useState(false);

  const trace = state.kitTraces[0];

  const handleSaveCycle = (e: React.FormEvent) => {
    e.preventDefault();
    updateState((prev) => ({
      ...prev,
      sterilisationCycles: prev.sterilisationCycles.map((c) =>
        c.cycleNumber === "#1424"
          ? {
              ...c,
              parameters: `${tempC} °C · ${pressure} · ${holdMin} min hold`,
              indicator: indicatorChanged ? "Chemical ✓" : "Failed ✗",
              result: indicatorChanged ? "Pass" : "Fail",
            }
          : c,
      ),
      needsAttention: prev.needsAttention.map((att) =>
        att.id === "att-5" ? { ...att, resolved: true } : att,
      ),
    }));
    toast.success("Cycle #1424 logged and verified for audit compliance");
  };

  return (
    <div>
      <DentflowPageHeader
        title="Sterilisation log"
        subtitle="Every autoclave cycle linked to instrument kits and patients, with trace and audit export"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col stack: Today's cycles + Trace a kit */}
        <div className="xl:col-span-8 space-y-5">
          {/* Today's cycles */}
          <div className="df-card p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">Today&apos;s cycles</h2>
              <button
                type="button"
                onClick={() => toast.info("Fill Log cycle #1424 on the right panel")}
                className="df-btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Log cycle
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2 pr-2 text-left">Cycle</th>
                    <th className="py-2 px-2 text-left">Autoclave</th>
                    <th className="py-2 px-2 text-left">Start</th>
                    <th className="py-2 px-2 text-left">Parameters</th>
                    <th className="py-2 px-2 text-left">Kits</th>
                    <th className="py-2 px-2 text-left">Indicator</th>
                    <th className="py-2 pl-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--df-border)]">
                  {state.sterilisationCycles.map((cyc) => (
                    <tr key={cyc.id} className="hover:bg-[var(--df-surface-hover)]/60">
                      <td className="py-2.5 pr-2 font-bold text-[var(--df-text)]">
                        {cyc.cycleNumber}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                        {cyc.autoclave}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-muted)] whitespace-nowrap">
                        {cyc.startTime}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                        {cyc.parameters}
                      </td>
                      <td className="py-2.5 px-2 font-medium text-[var(--df-text)]">
                        {cyc.kits.join(", ")}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-status-green-text)] font-medium">
                        {cyc.indicator}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <DentflowStatusPill
                          label={cyc.result}
                          tone={
                            cyc.result === "Pass"
                              ? "green"
                              : cyc.result === "Running"
                              ? "blue"
                              : cyc.result === "Fail"
                              ? "red"
                              : "amber"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trace a kit */}
          <div className="df-card p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">Trace a kit</h2>
              <DentflowUniquePill />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[220px] flex items-center gap-2 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs">
                <span className="text-[var(--df-text-muted)]">Kit / cycle</span>
                <input
                  type="text"
                  value={traceQuery}
                  onChange={(e) => setTraceQuery(e.target.value)}
                  className="flex-1 font-semibold text-[var(--df-text)] bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  toast.success("Traced Kit E-07 → Cycle #1419 → 2 patients linked")
                }
                className="df-btn-secondary px-4 py-2 text-xs cursor-pointer"
              >
                Trace
              </button>
            </div>

            <p className="text-xs text-[var(--df-text-secondary)]">
              Kit {trace.kitCode} ({trace.kitCategory}) sterilised in cycle{" "}
              {trace.cycleNumber} at {trace.cycleTime}, then used on:
            </p>

            <div className="space-y-2">
              {trace.patients.map((pt) => (
                <div
                  key={pt.patientName}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-xs"
                >
                  <span className="font-bold text-[var(--df-text)]">{pt.patientName}</span>
                  <span className="text-[var(--df-text-muted)]">
                    {pt.procedure} · {pt.time} · {pt.chair}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[var(--df-text-muted)]">
              If a cycle fails its indicator, every patient on every kit from that cycle is
              listed here for follow-up.
            </p>
          </div>
        </div>

        {/* Right 4-col stack: Log cycle #1424 + Audit readiness */}
        <div className="xl:col-span-4 space-y-4">
          <form onSubmit={handleSaveCycle} className="df-card p-5 space-y-3.5 text-xs">
            <h2 className="text-sm font-bold text-[var(--df-text)]">Log cycle #1424</h2>

            <div>
              <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">
                Autoclave
              </label>
              <select
                value={autoclave}
                onChange={(e) => setAutoclave(e.target.value)}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 font-medium"
              >
                <option value="Autoclave B (Class B)">Autoclave B (Class B)</option>
                <option value="Autoclave A (Class B)">Autoclave A (Class B)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10.5px] text-[var(--df-text-muted)] mb-1">
                  Temp °C
                </label>
                <input
                  type="text"
                  value={tempC}
                  onChange={(e) => setTempC(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-[var(--df-text-muted)] mb-1">
                  Pressure
                </label>
                <input
                  type="text"
                  value={pressure}
                  onChange={(e) => setPressure(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-[var(--df-text-muted)] mb-1">
                  Hold min
                </label>
                <input
                  type="text"
                  value={holdMin}
                  onChange={(e) => setHoldMin(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 font-semibold"
                />
              </div>
            </div>

            <div>
              <p className="text-[11px] text-[var(--df-text-muted)] mb-1.5">
                Kits in load (scan pouch QR)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["E-03", "S-11", "G-21"].map((k) => (
                  <span
                    key={k}
                    className="px-2.5 py-0.5 rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-teal)] font-semibold"
                  >
                    {k}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => toast.info("QR pouch scanner ready")}
                  className="px-2.5 py-0.5 rounded-full bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-muted)] font-semibold cursor-pointer"
                >
                  + Scan
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={indicatorChanged}
                onChange={(e) => setIndicatorChanged(e.target.checked)}
                className="accent-[var(--df-teal)] h-4 w-4 rounded"
              />
              <span>Chemical indicator changed colour</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={attachPhoto}
                onChange={(e) => setAttachPhoto(e.target.checked)}
                className="accent-[var(--df-teal)] h-4 w-4 rounded"
              />
              <span>Attach printout / photo</span>
            </label>

            <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
              Save cycle
            </button>
          </form>

          {/* Audit readiness dark green card */}
          <div className="rounded-2xl p-5 bg-[var(--df-sidebar-bg)] text-white space-y-2.5">
            <p className="text-[11px] text-[var(--df-sidebar-muted)]">
              Audit readiness · September
            </p>
            <p className="df-serif text-2xl font-semibold text-white">
              212 cycles · 0 failed
            </p>
            <p className="text-xs text-[#6EE7B7]">Weekly biological test: due Fri</p>
            <button
              type="button"
              onClick={() =>
                toast.success("Downloaded IDA / NABH Sterilisation Audit PDF (Sep 2026)")
              }
              className="w-full mt-1 py-2 rounded-xl bg-white text-[var(--df-text)] font-semibold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-[var(--df-surface-hover)] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export audit report (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

