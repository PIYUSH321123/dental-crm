"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import { LabCaseRecord } from "@/types/dentflow";

const KANBAN_COLUMNS: LabCaseRecord["status"][] = [
  "Impression / scan",
  "Sent to lab",
  "In fabrication",
  "Received",
  "Fitted / closed",
];

const LAB_FILTERS = ["All labs", "Precision Dental Lab", "Crown Craft", "ALIGNER PARTNER"] as const;

export default function LabCasesPage() {
  const { state, updateState } = useDentflow();
  const [selectedLab, setSelectedLab] = useState<string>("All labs");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [patientName, setPatientName] = useState("Priya Deshmukh");
  const [work, setWork] = useState("Zirconia crown 36");
  const [labPartner, setLabPartner] = useState<LabCaseRecord["labPartner"]>(
    "Precision Dental Lab",
  );
  const [shade, setShade] = useState("Zirconia · A2");

  const filteredCases = state.labCases.filter((c) =>
    selectedLab === "All labs" ? true : c.labPartner === selectedLab,
  );

  const handleAdvanceStatus = (caseItem: LabCaseRecord) => {
    const idx = KANBAN_COLUMNS.indexOf(caseItem.status);
    if (idx < 0 || idx === KANBAN_COLUMNS.length - 1) return;
    const nextStatus = KANBAN_COLUMNS[idx + 1];
    updateState((prev) => ({
      ...prev,
      labCases: prev.labCases.map((lc) =>
        lc.id === caseItem.id ? { ...lc, status: nextStatus, isOverdue: false } : lc,
      ),
    }));
    toast.success(`${caseItem.caseNumber} (${caseItem.patientName}) moved to "${nextStatus}"`);
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: LabCaseRecord = {
      id: `lc-${Date.now()}`,
      caseNumber: `LC-${8870 + state.labCases.length}`,
      clinicBranch: "Smile Studio · Station Rd",
      patientName,
      work,
      tooth: "36",
      materialShade: shade,
      labPartner,
      dueLabel: "Due 8 Oct",
      status: "Sent to lab",
      doctor: "Dr. Sneha K.",
      clinicDueDate: "8 Oct",
    };
    updateState((prev) => ({
      ...prev,
      labCases: [newCase, ...prev.labCases],
    }));
    setDrawerOpen(false);
    toast.success(`Created lab order ${newCase.caseNumber} for ${patientName}`);
  };

  return (
    <div>
      <DentflowPageHeader
        title="Lab cases"
        subtitle="Crowns, bridges, dentures and aligners · status updates come from the lab portal"
      />

      {/* Filter pills + New lab case */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--df-text-muted)]">Labs:</span>
          {LAB_FILTERS.map((lab) => (
            <button
              key={lab}
              type="button"
              onClick={() => setSelectedLab(lab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedLab === lab
                  ? "bg-[var(--df-sidebar-bg)] text-white"
                  : "bg-[var(--df-surface)] border border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
              }`}
            >
              {lab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="df-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> New lab case
        </button>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 items-start">
        {KANBAN_COLUMNS.map((colStatus) => {
          const cards = filteredCases.filter((c) => c.status === colStatus);
          return (
            <div
              key={colStatus}
              className="rounded-2xl bg-[var(--df-canvas-subtle)]/70 border border-[var(--df-border)] p-3 space-y-2.5 min-h-[340px]"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-[var(--df-text)]">{colStatus}</h2>
                <span className="text-[11px] font-bold text-[var(--df-text-muted)]">
                  {cards.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {cards.map((card) => {
                  const isFitToday = card.dueLabel.toLowerCase().includes("fit today");
                  const isFitted = card.status === "Fitted / closed";
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleAdvanceStatus(card)}
                      title="Click to advance stage"
                      className="df-card p-3 space-y-1.5 cursor-pointer hover:border-[var(--df-teal)] transition-colors"
                    >
                      <p className="text-xs font-bold text-[var(--df-text)]">
                        {card.patientName}
                      </p>
                      <p className="text-xs text-[var(--df-text-secondary)]">{card.work}</p>
                      <p className="text-[11px] text-[var(--df-text-muted)]">
                        {card.labPartner} · shade {card.materialShade.split("·").pop()?.trim()}
                      </p>
                      <div className="pt-1">
                        <DentflowStatusPill
                          label={card.dueLabel}
                          tone={
                            card.isOverdue
                              ? "red"
                              : isFitToday || isFitted
                              ? "green"
                              : "grey"
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <DentflowDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New lab case order"
        subtitle="Dispatches STL scan & shade prescription to lab portal (L01)"
      >
        <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Patient
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Work / prosthesis
            </label>
            <input
              type="text"
              required
              value={work}
              onChange={(e) => setWork(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Lab partner
            </label>
            <select
              value={labPartner}
              onChange={(e) =>
                setLabPartner(e.target.value as LabCaseRecord["labPartner"])
              }
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            >
              <option value="Precision Dental Lab">Precision Dental Lab</option>
              <option value="Crown Craft">Crown Craft</option>
              <option value="ALIGNER PARTNER">ALIGNER PARTNER</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Material &amp; VITA shade
            </label>
            <input
              type="text"
              value={shade}
              onChange={(e) => setShade(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
            Send order to lab portal
          </button>
        </form>
      </DentflowDrawer>
    </div>
  );
}

