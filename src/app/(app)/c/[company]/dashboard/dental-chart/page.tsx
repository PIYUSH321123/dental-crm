"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, Check, X, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import {
  DENTAL_IMAGING_ITEMS,
  ODONTOGRAM_TEETH,
  OdontogramTooth,
  PERIODONTAL_LOWER_LEFT,
} from "@/lib/mock/dentflow";

const CHILD_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const CHILD_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const TOOTH_STATUS_STYLES: Record<OdontogramTooth["status"], { box: string; badge: string }> = {
  healthy: {
    box: "border-[var(--df-border-strong)] bg-[var(--df-surface)] text-[var(--df-text)]",
    badge: "text-[var(--df-text-muted)]",
  },
  caries: {
    box: "border-[var(--df-status-red-text)] bg-[var(--df-status-red-bg)]/50 text-[var(--df-status-red-text)]",
    badge: "text-[var(--df-status-red-text)]",
  },
  filled: {
    box: "border-[var(--df-status-blue-text)] bg-[var(--df-status-blue-bg)]/50 text-[var(--df-status-blue-text)]",
    badge: "text-[var(--df-status-blue-text)]",
  },
  crown: {
    box: "border-[var(--df-status-amber-text)] bg-[var(--df-status-amber-bg)]/60 text-[var(--df-status-amber-text)]",
    badge: "text-[var(--df-status-amber-text)]",
  },
  root_canal: {
    box: "border-[var(--df-status-purple-text)] bg-[var(--df-status-purple-bg)]/60 text-[var(--df-status-purple-text)]",
    badge: "text-[var(--df-status-purple-text)]",
  },
  missing: {
    box: "border-dashed border-[var(--df-border-strong)] bg-[var(--df-surface-muted)] text-[var(--df-text-muted)]",
    badge: "text-[var(--df-text-muted)]",
  },
  planned: {
    box: "border-[var(--df-teal)] bg-[var(--df-teal-soft)]/50 text-[var(--df-teal)]",
    badge: "text-[var(--df-teal)]",
  },
};

export default function DentalChartPage() {
  const params = useParams();
  const router = useRouter();
  const company =
    (Array.isArray(params?.company) ? params.company[0] : params?.company) || "smile-studio";
  const { logPatientRead } = useDentflow();

  const [dentitionType, setDentitionType] = useState<"adult" | "child" | "mixed">("adult");
  const [selectedToothNum, setSelectedToothNum] = useState<number>(36);
  const [teethState, setTeethState] = useState<Record<number, OdontogramTooth>>(ODONTOGRAM_TEETH);
  const [perioRows, setPerioRows] = useState(PERIODONTAL_LOWER_LEFT);
  const [compareBaseline, setCompareBaseline] = useState(false);
  const [imagingDrawerOpen, setImagingDrawerOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: "ai-36",
      tooth: 36,
      finding: "Deep disto-occlusal radiolucency abutting distal pulp horn (confidence 0.94)",
      status: "Pending" as "Pending" | "Accepted" | "Rejected",
    },
    {
      id: "ai-37",
      tooth: 37,
      finding: "Intact occlusal composite restoration, normal lamina dura (confidence 0.89)",
      status: "Pending" as "Pending" | "Accepted" | "Rejected",
    },
  ]);

  useEffect(() => {
    logPatientRead("Priya Deshmukh", "C04 Dental chart", "READ");
  }, [logPatientRead]);

  const selectedTooth: OdontogramTooth = teethState[selectedToothNum] || {
    number: selectedToothNum,
    status: "healthy",
    name: `Tooth ${selectedToothNum}`,
    surfaces: { B: false, M: false, O: false, D: false, L: false },
  };

  const toggleSurface = (surf: "B" | "M" | "O" | "D" | "L") => {
    setTeethState((prev) => {
      const current = prev[selectedToothNum] || {
        number: selectedToothNum,
        status: "healthy" as const,
        name: `Tooth ${selectedToothNum}`,
      };
      const curSurf = current.surfaces || { B: false, M: false, O: false, D: false, L: false };
      const updated = { ...curSurf, [surf]: !curSurf[surf] };
      const activeLetters = (["M", "O", "D", "B", "L"] as const).filter((k) => updated[k]);
      return {
        ...prev,
        [selectedToothNum]: {
          ...current,
          surfaces: updated,
          conditionText:
            current.status === "caries"
              ? `Deep caries (${activeLetters.join(", ") || "None"}) — near pulp`
              : current.conditionText,
        },
      };
    });
  };

  const handleStatusChange = (status: OdontogramTooth["status"]) => {
    const badgeMap: Partial<Record<OdontogramTooth["status"], string>> = {
      caries: "C",
      filled: "F",
      crown: "Cr",
      root_canal: "RCT",
      planned: "P",
    };
    setTeethState((prev) => {
      const current = prev[selectedToothNum] || {
        number: selectedToothNum,
        status: "healthy" as const,
        name: `Tooth ${selectedToothNum}`,
      };
      return {
        ...prev,
        [selectedToothNum]: {
          ...current,
          status,
          badge: badgeMap[status],
        },
      };
    });
    toast.success(`Tooth ${selectedToothNum} updated to ${status.replace("_", " ")}`);
  };

  const renderToothBox = (num: number) => {
    const tooth = teethState[num] || {
      number: num,
      status: "healthy" as const,
      name: `Tooth ${num}`,
    };
    const isSelected = selectedToothNum === num;
    const isMissing = tooth.status === "missing";
    const style = TOOTH_STATUS_STYLES[tooth.status];

    return (
      <button
        key={num}
        type="button"
        onClick={() => setSelectedToothNum(num)}
        title={`Tooth ${num}: ${tooth.name} (${tooth.status})`}
        className={`relative flex flex-col items-center justify-between w-9 sm:w-10 h-14 rounded-lg border text-center transition-all cursor-pointer shrink-0 ${
          style.box
        } ${
          isSelected
            ? "ring-2 ring-[var(--df-sidebar-bg)] shadow-sm scale-[1.03] z-10"
            : "hover:border-[var(--df-teal)]"
        }`}
      >
        <span className="text-[11px] font-semibold pt-1.5 text-[var(--df-text)]">{num}</span>
        <div className="flex-1 flex items-center justify-center">
          {isMissing ? (
            <span className="text-[11px] text-[var(--df-text-muted)] select-none">×</span>
          ) : tooth.badge ? (
            <span className={`text-[11px] font-bold ${style.badge}`}>{tooth.badge}</span>
          ) : null}
        </div>
        <div className="h-1 w-full" />
      </button>
    );
  };

  const upperLeftNums =
    dentitionType === "child" ? CHILD_UPPER.slice(0, 5) : [18, 17, 16, 15, 14, 13, 12, 11];
  const upperRightNums =
    dentitionType === "child" ? CHILD_UPPER.slice(5) : [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerLeftNums =
    dentitionType === "child" ? CHILD_LOWER.slice(0, 5) : [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerRightNums =
    dentitionType === "child" ? CHILD_LOWER.slice(5) : [31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div>
      <DentflowPageHeader
        title="Dental chart · Priya Deshmukh"
        subtitle="FDI numbering · last charted 12 Sep by Dr. Sneha"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col area: Odontogram + Periodontal + Imaging */}
        <div className="xl:col-span-8 space-y-4">
          {/* Odontogram */}
          <div className="df-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">Odontogram</h2>

              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--df-canvas-subtle)] border border-[var(--df-border)]">
                {(
                  [
                    { id: "adult", label: "Adult" },
                    { id: "child", label: "Child (primary)" },
                    { id: "mixed", label: "Mixed" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDentitionType(tab.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                      dentitionType === tab.id
                        ? "bg-[var(--df-sidebar-bg)] text-white"
                        : "text-[var(--df-text-secondary)] hover:text-[var(--df-text)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {dentitionType === "mixed" && (
              <div className="px-3 py-1.5 rounded-lg bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[11px] text-[var(--df-teal)] font-medium">
                Mixed dentition overlay active · Click any FDI permanent tooth (or switch to Child for deciduous 55–85)
              </div>
            )}

            {/* Upper Arch */}
            <div className="space-y-2">
              <p className="text-center text-[11px] text-[var(--df-text-muted)] font-medium">
                Upper · patient&apos;s right ← → patient&apos;s left
              </p>
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
                <div className="flex items-center gap-1">{upperLeftNums.map(renderToothBox)}</div>
                <div className="w-[1.5px] h-12 bg-[var(--df-border-strong)] mx-1 shrink-0" />
                <div className="flex items-center gap-1">{upperRightNums.map(renderToothBox)}</div>
              </div>
              <div className="flex items-center gap-2 px-1">
                <ChevronLeft className="h-3 w-3 text-[var(--df-text-muted)] shrink-0" />
                <div className="h-2 flex-1 rounded-full bg-[var(--df-border-strong)]/60" />
                <ChevronRight className="h-3 w-3 text-[var(--df-text-muted)] shrink-0" />
              </div>
            </div>

            {/* Lower Arch */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
                <div className="flex items-center gap-1">{lowerLeftNums.map(renderToothBox)}</div>
                <div className="w-[1.5px] h-12 bg-[var(--df-border-strong)] mx-1 shrink-0" />
                <div className="flex items-center gap-1">{lowerRightNums.map(renderToothBox)}</div>
              </div>
              <div className="flex items-center gap-2 px-1">
                <ChevronLeft className="h-3 w-3 text-[var(--df-text-muted)] shrink-0" />
                <div className="h-2 flex-1 rounded-full bg-[var(--df-border-strong)]/60" />
                <ChevronRight className="h-3 w-3 text-[var(--df-text-muted)] shrink-0" />
              </div>
              <p className="text-center text-[11px] text-[var(--df-text-muted)] font-medium">Lower</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-[var(--df-border)] text-[11px] text-[var(--df-text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[var(--df-border-strong)] bg-[var(--df-surface)]" />
                Healthy
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[var(--df-status-red-text)] bg-[var(--df-status-red-bg)]" />
                Caries
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[var(--df-status-blue-text)] bg-[var(--df-status-blue-bg)]" />
                Filled
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[var(--df-status-amber-text)] bg-[var(--df-status-amber-bg)]" />
                Crown
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[var(--df-status-purple-text)] bg-[var(--df-status-purple-bg)]" />
                Root canal
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-dashed border-[var(--df-border-strong)] bg-[var(--df-surface-muted)]" />
                Missing
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[var(--df-teal)] bg-[var(--df-teal-soft)]" />
                Planned
              </span>
            </div>
          </div>

          {/* Periodontal chart + Imaging */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Periodontal chart · lower left */}
            <div className="df-card p-4 space-y-3">
              <h3 className="text-xs font-bold text-[var(--df-text)]">
                Periodontal chart · lower left
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--df-border)] text-[var(--df-text-muted)]">
                      <th className="py-1.5 pr-2 text-left font-medium">Tooth</th>
                      {perioRows.map((r) => (
                        <th
                          key={r.tooth}
                          className="py-1.5 px-1.5 text-center font-bold text-[var(--df-text)]"
                        >
                          {r.tooth}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--df-border)]">
                      <td className="py-2 pr-2 font-medium text-[var(--df-text-muted)] whitespace-nowrap">
                        Pocket (mm)
                      </td>
                      {perioRows.map((r, idx) => (
                        <td key={r.tooth} className="py-2 px-1 text-center">
                          {r.pocket !== null ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPerioRows((prev) =>
                                  prev.map((item, i) => {
                                    if (i !== idx || item.pocket === null) return item;
                                    const nextP = item.pocket >= 6 ? 2 : item.pocket + 1;
                                    return { ...item, pocket: nextP, alert: nextP >= 5 };
                                  }),
                                );
                              }}
                              title="Click to adjust pocket depth"
                              className={`inline-block px-1.5 py-0.5 rounded font-semibold cursor-pointer ${
                                r.pocket >= 5
                                  ? "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)] font-bold"
                                  : "text-[var(--df-text)] hover:bg-[var(--df-surface-hover)]"
                              }`}
                            >
                              {r.pocket}
                            </button>
                          ) : (
                            <span className="text-[var(--df-text-muted)]">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[var(--df-border)]">
                      <td className="py-2 pr-2 font-medium text-[var(--df-text-muted)] whitespace-nowrap">
                        Bleeding
                      </td>
                      {perioRows.map((r) => (
                        <td key={r.tooth} className="py-2 px-1 text-center">
                          {r.bleeding && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--df-status-red-text)]" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 pr-2 font-medium text-[var(--df-text-muted)] whitespace-nowrap">
                        Mobility
                      </td>
                      {perioRows.map((r) => (
                        <td
                          key={r.tooth}
                          className="py-2 px-1 text-center text-[var(--df-text-muted)]"
                        >
                          {r.mobility !== null ? r.mobility : ""}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-1 border-t border-[var(--df-border)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCompareBaseline((v) => !v)}
                  className="text-[11px] text-[var(--df-text-muted)] hover:text-[var(--df-teal)] font-medium cursor-pointer text-left"
                >
                  Pockets ≥ 5 mm shaded. Compare with 12 Mar charting →
                </button>
              </div>
              {compareBaseline && (
                <div className="p-2.5 rounded-lg bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] text-[11px] text-[var(--df-text-secondary)]">
                  Baseline (12 Mar): Tooth 36 pocket was 4 mm, now 5 mm (+1 mm with distal bleeding).
                </div>
              )}
            </div>

            {/* Imaging */}
            <div className="df-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-[var(--df-text)]">Imaging</h3>
                <button
                  type="button"
                  onClick={() => setImagingDrawerOpen(true)}
                  className="df-btn-secondary px-2.5 py-1 text-[11px] cursor-pointer"
                >
                  Upload / RVG import
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {DENTAL_IMAGING_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.hasAnnotation) {
                        setImagingDrawerOpen(true);
                      } else {
                        toast.info(`Viewing ${item.title} (${item.date})`);
                      }
                    }}
                    className="group text-left cursor-pointer"
                  >
                    <div className="aspect-[4/3] rounded-lg bg-[var(--df-sidebar-bg)] border border-[var(--df-border-strong)] flex items-center justify-center relative overflow-hidden group-hover:ring-2 group-hover:ring-[var(--df-teal)] transition-all">
                      <svg viewBox="0 0 100 75" className="w-full h-full">
                        <rect width="100" height="75" className="fill-[#0B161C]" />
                        {item.hasAnnotation ? (
                          <>
                            <ellipse cx="50" cy="38" rx="18" ry="24" className="fill-[#CBD5E1]/25" />
                            <circle
                              cx="50"
                              cy="37"
                              r="12"
                              fill="none"
                              stroke="var(--df-unique-dark-text)"
                              strokeWidth="2.5"
                            />
                          </>
                        ) : (
                          <path
                            d="M 18 52 Q 50 28 82 52"
                            stroke="#64748B"
                            strokeWidth="2.5"
                            fill="none"
                          />
                        )}
                      </svg>
                    </div>
                    <p className="text-[11px] font-bold text-[var(--df-text)] mt-1.5">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[var(--df-text-muted)]">{item.date}</p>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-[var(--df-text-muted)] pt-1 border-t border-[var(--df-border)]">
                Images are linked to teeth. Annotate → use in patient explainer.
              </p>
            </div>
          </div>
        </div>

        {/* Right 4-col panel: Selected tooth detail */}
        <div className="xl:col-span-4 df-card p-5 space-y-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="df-serif text-3xl font-semibold text-[var(--df-text)]">
                {selectedTooth.number}
              </span>
              <span className="text-xs font-medium text-[var(--df-text-muted)]">
                {selectedTooth.name}
              </span>
            </div>
            <p className="text-xs font-bold text-[var(--df-status-red-text)] mt-1">
              {selectedTooth.conditionText ||
                (selectedTooth.status === "healthy"
                  ? "Healthy tooth structure"
                  : `${selectedTooth.status.replace("_", " ")} recorded`)}
            </p>
          </div>

          {/* Condition quick status pills */}
          <div className="flex flex-wrap gap-1">
            {(["healthy", "caries", "filled", "crown", "root_canal", "planned"] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer capitalize ${
                    selectedTooth.status === st
                      ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                      : "bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)] border-[var(--df-border)]"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ),
            )}
          </div>

          {/* Surfaces Cross */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[var(--df-text-muted)]">Surfaces</p>
            <div className="flex flex-col items-center justify-center py-2">
              <button
                type="button"
                onClick={() => toggleSurface("B")}
                className={`h-8 w-8 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                  selectedTooth.surfaces?.B
                    ? "bg-[var(--df-status-red-text)] text-white"
                    : "bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)]"
                }`}
              >
                B
              </button>
              <div className="flex items-center gap-1.5 my-1.5">
                {(["M", "O", "D"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSurface(s)}
                    className={`h-8 w-8 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                      selectedTooth.surfaces?.[s]
                        ? "bg-[var(--df-status-red-text)] text-white"
                        : "bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => toggleSurface("L")}
                className={`h-8 w-8 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                  selectedTooth.surfaces?.L
                    ? "bg-[var(--df-status-red-text)] text-white"
                    : "bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)]"
                }`}
              >
                L
              </button>
            </div>
          </div>

          {/* Finding */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[var(--df-text-muted)]">Finding</p>
            <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] p-3 text-xs text-[var(--df-text-secondary)] leading-relaxed">
              {selectedTooth.finding || "No abnormal clinical findings recorded."}
            </div>
          </div>

          {/* Planned on this tooth */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[var(--df-text-muted)]">
              Planned on this tooth
            </p>
            <div className="space-y-1.5">
              {selectedTooth.planned && selectedTooth.planned.length > 0 ? (
                selectedTooth.planned.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-xs"
                  >
                    <span className="font-semibold text-[var(--df-text)]">{item.name}</span>
                    <span className="font-bold text-[var(--df-text)]">{item.price}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--df-text-muted)] italic">
                  No procedures currently planned on tooth {selectedTooth.number}.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                toast.success(
                  `Tooth ${selectedTooth.number} added to treatment plan TP-2231`,
                );
                router.push(`/c/${company}/dashboard/treatment-plans`);
              }}
              className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
            >
              Add to treatment plan
            </button>
            <button
              type="button"
              onClick={() => router.push(`/c/${company}/dashboard/explainers`)}
              className="w-full df-btn-secondary py-2.5 text-xs cursor-pointer"
            >
              Create patient explainer
            </button>
          </div>
        </div>
      </div>

      {/* Imaging + AI X-ray detection drawer */}
      <DentflowDrawer
        open={imagingDrawerOpen}
        onClose={() => setImagingDrawerOpen(false)}
        title="Imaging & AI radiograph assist"
        subtitle="IOPA 36 · dentist review required before writing chart"
      >
        <div className="space-y-4">
          <div className="aspect-[16/10] rounded-xl bg-[#0B161C] border border-[var(--df-border-strong)] relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 240 150" className="w-full h-full">
              <rect width="240" height="150" fill="#0B161C" />
              <path
                d="M 85 32 Q 100 18 120 18 Q 140 18 155 32 L 160 88 Q 152 132 136 135 Q 126 105 120 88 Q 114 105 104 135 Q 88 132 80 88 Z"
                fill="#CBD5E1"
                opacity="0.82"
              />
              <path
                d="M 102 48 Q 120 42 138 48 L 132 85 Q 126 115 120 82 Q 114 115 108 85 Z"
                fill="#0F172A"
              />
              <circle
                cx="128"
                cy="52"
                r="18"
                fill="none"
                stroke="#F5B076"
                strokeWidth="3"
              />
              <text x="128" y="56" fill="#F5B076" fontSize="10" fontWeight="700" textAnchor="middle">
                36 OD
              </text>
            </svg>
          </div>

          <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--df-text)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--df-teal)]" />
                AI X-ray suggestions (AiSuggestion)
              </span>
              <DentflowStatusPill label="Pending review" tone="amber" />
            </div>
            {aiSuggestions.map((s) => (
              <div
                key={s.id}
                className="p-2.5 rounded-lg bg-[var(--df-surface)] border border-[var(--df-border)] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--df-text)]">
                    Tooth {s.tooth}: {s.finding}
                  </p>
                  <DentflowStatusPill
                    label={s.status}
                    tone={
                      s.status === "Accepted"
                        ? "green"
                        : s.status === "Rejected"
                        ? "red"
                        : "amber"
                    }
                  />
                </div>
                {s.status === "Pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAiSuggestions((prev) =>
                          prev.map((x) => (x.id === s.id ? { ...x, status: "Accepted" } : x)),
                        );
                        setSelectedToothNum(s.tooth);
                        toast.success(`Accepted AI finding for tooth ${s.tooth}`);
                      }}
                      className="inline-flex items-center gap-1 df-btn-primary px-2.5 py-1 text-[11px] cursor-pointer"
                    >
                      <Check className="h-3 w-3" /> Accept to chart
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiSuggestions((prev) =>
                          prev.map((x) => (x.id === s.id ? { ...x, status: "Rejected" } : x)),
                        );
                        toast.info(`Dismissed suggestion for tooth ${s.tooth}`);
                      }}
                      className="inline-flex items-center gap-1 df-btn-secondary px-2.5 py-1 text-[11px] cursor-pointer"
                    >
                      <X className="h-3 w-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              toast.success("DICOM / RVG scan queued & linked to tooth 36");
              setImagingDrawerOpen(false);
            }}
            className="w-full inline-flex items-center justify-center gap-2 df-btn-secondary py-2.5 text-xs cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" /> Import RVG / OPG from sensor
          </button>
        </div>
      </DentflowDrawer>
    </div>
  );
}

