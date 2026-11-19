"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  History,
  Keyboard,
  Maximize2,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  DentflowChromeTabs,
  DentflowDrawer,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import {
  ImagingGalleryAndViewer,
  RadiographSvgGraphic,
  ToothImagingHoverStrip,
} from "@/components/dental/imaging-viewer";
import { PerioChart } from "@/components/dental/perio-chart";
import { DetailedToothRootSvg, ToothSvg, ToothSvgDefs } from "@/components/dental/tooth-svg";
import {
  ALL_PERMANENT_FDI,
  ALL_PRIMARY_FDI,
  ALL_VALID_FDI,
  applyConditionToTooth,
  computeChartSummary,
  CONDITION_BY_CODE,
  createHealthyTooth,
  createSeedDentalChart,
  diffCharts,
  formatToothNumber,
  getAllToothConditions,
  getToothDisplayName,
  LOWER_LEFT_PERMANENT,
  LOWER_LEFT_PRIMARY,
  LOWER_RIGHT_PERMANENT,
  LOWER_RIGHT_PRIMARY,
  removeConditionFromTooth,
  setToothEruptionState,
  toggleSurfaceCondition,
  TOOTH_CONDITIONS,
  UPPER_LEFT_PERMANENT,
  UPPER_LEFT_PRIMARY,
  UPPER_RIGHT_PERMANENT,
  UPPER_RIGHT_PRIMARY,
} from "@/lib/dental-chart-logic";
import { useDentflow } from "@/lib/dentflow-store";
import { ROLE_USER_PROFILES } from "@/lib/dentflow-theme";
import {
  DentalNumberingSystem,
  DentitionView,
  EruptionState,
  PatientDentalChart,
  ToothChartRecord,
  ToothConditionCode,
  ToothSurface,
} from "@/types/dentflow";

function DentalChartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState, logPatientRead, logAuditEvent } = useDentflow();

  const initialPatientId =
    searchParams.get("patientId") || state.patients[0]?.id || "pat-priya";
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);

  const activePatient = useMemo(() => {
    return (
      state.patients.find((p) => p.id === selectedPatientId) || state.patients[0]
    );
  }, [state.patients, selectedPatientId]);

  const activeChart: PatientDentalChart = useMemo(() => {
    const pid = activePatient?.id || "pat-priya";
    return (
      state.dentalCharts?.[pid] ||
      createSeedDentalChart(pid, activePatient?.age || 34)
    );
  }, [state.dentalCharts, activePatient]);

  const numberingSystem: DentalNumberingSystem =
    state.clinicSetup.numberingSystem || "FDI";
  const actorName = ROLE_USER_PROFILES[state.activeRole]?.name || "Clinic Dentist";

  const [activeChartTab, setActiveChartTab] = useState<"odontogram" | "perio" | "imaging">("odontogram");
  const [selectedToothNum, setSelectedToothNum] = useState<number>(36);
  const [activeCondition, setActiveCondition] = useState<ToothConditionCode>("caries");
  const [multiSelectedFdis, setMultiSelectedFdis] = useState<number[]>([]);
  const [legendHighlight, setLegendHighlight] = useState<ToothConditionCode | null>(null);
  const [showRoots, setShowRoots] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [compareHistoryId, setCompareHistoryId] = useState<string | null>(null);
  const [keyBuffer, setKeyBuffer] = useState<string>("");
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [hoveredToothFdi, setHoveredToothFdi] = useState<number | null>(null);
  const [openImageId, setOpenImageId] = useState<string | null>(null);
  const [newProcName, setNewProcName] = useState<string>("");
  const [newProcFee, setNewProcFee] = useState<string>("2500");

  // Click-drag multi-select & pinch-zoom refs
  const isDraggingRef = useRef<boolean>(false);
  const dragStartFdiRef = useRef<number | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);
  const keyBufferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dentitionView: DentitionView = activeChart.lastDentitionView || "adult";

  useEffect(() => {
    if (activePatient) {
      logPatientRead(activePatient.name, "Dental chart", "READ");
    }
  }, [activePatient, logPatientRead]);

  // Persist chart mutation helper
  const mutateActiveChart = useCallback(
    (updater: (chart: PatientDentalChart) => PatientDentalChart) => {
      const pid = activePatient?.id || "pat-priya";
      updateState((prev) => {
        const current =
          prev.dentalCharts?.[pid] ||
          createSeedDentalChart(pid, activePatient?.age || 34);
        const updated = updater(current);
        return {
          ...prev,
          dentalCharts: {
            ...(prev.dentalCharts || {}),
            [pid]: updated,
          },
        };
      });
    },
    [activePatient, updateState],
  );

  const selectedTooth: ToothChartRecord =
    activeChart.teeth[selectedToothNum] || createHealthyTooth(selectedToothNum);

  // Paint condition directly on clicked surface
  const handleClickSurface = useCallback(
    (fdi: number, surface: ToothSurface) => {
      setSelectedToothNum(fdi);
      mutateActiveChart((chart) => {
        const cur = chart.teeth[fdi] || createHealthyTooth(fdi);
        const next = toggleSurfaceCondition(cur, surface, activeCondition, actorName);
        return {
          ...chart,
          lastChartedLabel: "Today",
          lastChartedBy: actorName,
          teeth: { ...chart.teeth, [fdi]: next },
        };
      });
      logAuditEvent({
        patientName: activePatient?.name || "Patient",
        screenName: "Dental chart",
        action: "CHART_SURFACE_UPDATE",
        entityType: "dental_chart",
        entityId: `tooth-${fdi}`,
        details: `Tooth ${formatToothNumber(fdi, numberingSystem)} surface ${surface} painted with ${activeCondition}`,
      });
    },
    [activeCondition, actorName, activePatient, logAuditEvent, mutateActiveChart, numberingSystem],
  );

  // Whole-tooth condition apply (single or batch multi-selected)
  const handleApplyCondition = useCallback(
    (cond: ToothConditionCode, targetFdis: number[]) => {
      if (targetFdis.length === 0) return;
      mutateActiveChart((chart) => {
        const nextTeeth = { ...chart.teeth };
        for (const fdi of targetFdis) {
          const cur = nextTeeth[fdi] || createHealthyTooth(fdi);
          nextTeeth[fdi] = applyConditionToTooth(cur, cond, actorName);
        }
        return {
          ...chart,
          lastChartedLabel: "Today",
          lastChartedBy: actorName,
          teeth: nextTeeth,
        };
      });
      const labels = targetFdis.map((f) => formatToothNumber(f, numberingSystem)).join(", ");
      logAuditEvent({
        patientName: activePatient?.name || "Patient",
        screenName: "Dental chart",
        action: "CHART_STATUS_UPDATE",
        entityType: "dental_chart",
        entityId: `teeth-${targetFdis.join("-")}`,
        details: `Applied "${CONDITION_BY_CODE[cond].label}" to tooth(s) ${labels}`,
      });
      toast.success(
        `Applied ${CONDITION_BY_CODE[cond].label} to ${targetFdis.length > 1 ? `${targetFdis.length} teeth` : `tooth ${labels}`}`,
      );
    },
    [actorName, activePatient, logAuditEvent, mutateActiveChart, numberingSystem],
  );

  const handleRemoveCondition = (fdi: number, cond: ToothConditionCode) => {
    mutateActiveChart((chart) => {
      const cur = chart.teeth[fdi] || createHealthyTooth(fdi);
      return {
        ...chart,
        teeth: { ...chart.teeth, [fdi]: removeConditionFromTooth(cur, cond, actorName) },
      };
    });
    logAuditEvent({
      patientName: activePatient?.name || "Patient",
      screenName: "Dental chart",
      action: "CHART_CONDITION_REMOVED",
      entityType: "dental_chart",
      entityId: `tooth-${fdi}`,
      details: `Removed "${CONDITION_BY_CODE[cond].label}" from tooth ${formatToothNumber(fdi, numberingSystem)}`,
    });
  };

  const handleDentitionChange = (view: DentitionView) => {
    mutateActiveChart((chart) => ({ ...chart, lastDentitionView: view }));
    if (view === "child" && !ALL_PRIMARY_FDI.includes(selectedToothNum)) {
      setSelectedToothNum(75);
    } else if (view === "adult" && !ALL_PERMANENT_FDI.includes(selectedToothNum)) {
      setSelectedToothNum(36);
    }
  };

  const handleEruptionChange = (fdi: number, stateVal: EruptionState) => {
    mutateActiveChart((chart) => {
      const cur = chart.teeth[fdi] || createHealthyTooth(fdi);
      return {
        ...chart,
        teeth: { ...chart.teeth, [fdi]: setToothEruptionState(cur, stateVal, actorName) },
      };
    });
    logAuditEvent({
      patientName: activePatient?.name || "Patient",
      screenName: "Dental chart",
      action: "CHART_ERUPTION_UPDATE",
      entityType: "dental_chart",
      entityId: `tooth-${fdi}`,
      details: `Tooth ${formatToothNumber(fdi, numberingSystem)} eruption state set to ${stateVal}`,
    });
  };

  // Drag multi-select handlers
  useEffect(() => {
    const handlePointerUp = () => {
      isDraggingRef.current = false;
      dragStartFdiRef.current = null;
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  const handlePointerDownTooth = (fdi: number) => {
    isDraggingRef.current = true;
    dragStartFdiRef.current = fdi;
  };

  const handlePointerEnterTooth = (fdi: number) => {
    if (!isDraggingRef.current || dragStartFdiRef.current === null) return;
    if (fdi === dragStartFdiRef.current) return;
    setMultiSelectedFdis((prev) => {
      const next = new Set(prev);
      next.add(dragStartFdiRef.current!);
      next.add(fdi);
      return Array.from(next);
    });
  };

  const handleSelectTooth = (fdi: number, e: React.MouseEvent) => {
    setSelectedToothNum(fdi);
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setMultiSelectedFdis((prev) =>
        prev.includes(fdi) ? prev.filter((x) => x !== fdi) : [...prev, fdi],
      );
    } else if (multiSelectedFdis.length > 0 && !isDraggingRef.current) {
      setMultiSelectedFdis([]);
    }
  };

  // Ordered navigation rows for arrow keys
  const upperRowFdis = useMemo<number[]>(
    () =>
      dentitionView === "child"
        ? [...UPPER_RIGHT_PRIMARY, ...UPPER_LEFT_PRIMARY]
        : [...UPPER_RIGHT_PERMANENT, ...UPPER_LEFT_PERMANENT],
    [dentitionView],
  );
  const lowerRowFdis = useMemo<number[]>(
    () =>
      dentitionView === "child"
        ? [...LOWER_RIGHT_PRIMARY, ...LOWER_LEFT_PRIMARY]
        : [...LOWER_RIGHT_PERMANENT, ...LOWER_LEFT_PERMANENT],
    [dentitionView],
  );

  // Keyboard shortcuts: tooth number typing, 1-9 conditions, Arrow keys, Esc
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        setMultiSelectedFdis([]);
        setLegendHighlight(null);
        setCompareHistoryId(null);
        setKeyBuffer("");
        return;
      }

      // Arrow keys move between teeth
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const row = upperRowFdis.includes(selectedToothNum) ? upperRowFdis : lowerRowFdis;
        const idx = row.indexOf(selectedToothNum);
        if (idx >= 0) {
          const nextIdx =
            e.key === "ArrowLeft"
              ? Math.max(0, idx - 1)
              : Math.min(row.length - 1, idx + 1);
          setSelectedToothNum(row[nextIdx]);
        }
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const inUpper = upperRowFdis.includes(selectedToothNum);
        const fromRow = inUpper ? upperRowFdis : lowerRowFdis;
        const toRow = inUpper ? lowerRowFdis : upperRowFdis;
        const idx = fromRow.indexOf(selectedToothNum);
        if (idx >= 0 && toRow[idx] !== undefined) {
          setSelectedToothNum(toRow[idx]);
        }
        return;
      }

      // Digits: 2-digit FDI tooth jump OR 1-9 condition shortcut
      if (/^[0-9]$/.test(e.key)) {
        const nextBuf = `${keyBuffer}${e.key}`.slice(-2);
        const asNum = Number(nextBuf);

        if (nextBuf.length === 2 && ALL_VALID_FDI.includes(asNum)) {
          setSelectedToothNum(asNum);
          setKeyBuffer("");
          if (keyBufferTimerRef.current) clearTimeout(keyBufferTimerRef.current);
          toast.info(`Selected tooth ${formatToothNumber(asNum, numberingSystem)}`);
          return;
        }

        // Single digit 1-9 also selects condition immediately while buffering for potential 2-digit FDI
        const condMatch = TOOTH_CONDITIONS.find((c) => c.shortcutKey === e.key);
        if (condMatch && keyBuffer.length === 0) {
          setActiveCondition(condMatch.code);
        }

        setKeyBuffer(nextBuf);
        if (keyBufferTimerRef.current) clearTimeout(keyBufferTimerRef.current);
        keyBufferTimerRef.current = setTimeout(() => setKeyBuffer(""), 850);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyBuffer, lowerRowFdis, numberingSystem, selectedToothNum, upperRowFdis]);

  // Summary counts & history diff
  const summary = useMemo(
    () => computeChartSummary(activeChart.teeth, dentitionView),
    [activeChart.teeth, dentitionView],
  );

  const compareSnapshot = useMemo(
    () => activeChart.history.find((h) => h.id === compareHistoryId) || null,
    [activeChart.history, compareHistoryId],
  );

  const chartDiffs = useMemo(() => {
    if (!compareSnapshot) return [];
    return diffCharts(compareSnapshot.teeth, activeChart.teeth);
  }, [compareSnapshot, activeChart.teeth]);

  const diffByFdi = useMemo(() => {
    const map: Record<number, string> = {};
    for (const d of chartDiffs) {
      map[d.fdi] = d.added.length > 0 ? `+${d.added.length}` : "Δ";
    }
    return map;
  }, [chartDiffs]);

  // Pinch-zoom touch handlers for tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.hypot(dx, dy);
      pinchStartScaleRef.current = zoomScale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchStartDistRef.current;
      setZoomScale(Math.min(1.6, Math.max(0.75, Number((pinchStartScaleRef.current * ratio).toFixed(2)))));
    }
  };

  const renderTooth = (fdi: number, compact = false) => {
    const tooth = activeChart.teeth[fdi] || createHealthyTooth(fdi);
    const allConds = getAllToothConditions(tooth);
    const matchesLegend = legendHighlight ? allConds.includes(legendHighlight) : false;
    const isDimmed = Boolean(legendHighlight && !matchesLegend);
    const linkedImgList = activeChart.imaging.filter((img) => img.linkedTeeth.includes(fdi));

    return (
      <ToothSvg
        key={fdi}
        tooth={tooth}
        displayNumber={formatToothNumber(fdi, numberingSystem)}
        selected={selectedToothNum === fdi}
        multiSelected={multiSelectedFdis.includes(fdi)}
        highlighted={matchesLegend}
        dimmed={isDimmed}
        diffBadge={diffByFdi[fdi]}
        hasLinkedImaging={linkedImgList.length > 0}
        linkedImages={linkedImgList}
        onOpenImage={(img) => setOpenImageId(img.id)}
        compact={compact}
        onSelectTooth={handleSelectTooth}
        onClickSurface={handleClickSurface}
        onPointerDownTooth={handlePointerDownTooth}
        onPointerEnterTooth={handlePointerEnterTooth}
        onHoverTooth={setHoveredToothFdi}
      />
    );
  };

  // Flow charted tooth findings & planned procedures directly into Treatment Plans without re-typing
  const handleAddToTreatmentPlan = () => {
    if (!activePatient) return;
    const proceduresToPush =
      selectedTooth.plannedProcedures.length > 0
        ? selectedTooth.plannedProcedures
        : [
            {
              id: `pp-auto-${Date.now()}`,
              name: `${CONDITION_BY_CODE[getAllToothConditions(selectedTooth)[0] || "planned"].label} treatment`,
              fee: 2500,
            },
          ];

    const toothLabel = formatToothNumber(selectedTooth.fdi, numberingSystem);
    updateState((prev) => {
      const planIdx = prev.treatmentPlans.findIndex((tp) => tp.patientId === activePatient.id);
      const targetIdx = planIdx >= 0 ? planIdx : 0;
      const nextPlans = prev.treatmentPlans.map((tp, idx) => {
        if (idx !== targetIdx) return tp;
        let nextStageNum = tp.stages.length + 1;
        let addedFee = 0;
        const newStages = proceduresToPush.map((proc) => {
          addedFee += proc.fee;
          return {
            id: `st-chart-${Date.now()}-${nextStageNum}`,
            stageNum: nextStageNum++,
            procedure: selectedTooth.finding
              ? `${proc.name} (${selectedTooth.finding.slice(0, 48)})`
              : proc.name,
            tooth: toothLabel,
            doctor: actorName,
            visitLabel: "Not scheduled",
            fee: proc.fee,
            status: "Not booked" as const,
          };
        });
        return {
          ...tp,
          stages: [...tp.stages, ...newStages],
          costSummary: {
            ...tp.costSummary,
            planTotal: tp.costSummary.planTotal + addedFee,
            balance: tp.costSummary.balance + addedFee,
          },
        };
      });
      return { ...prev, treatmentPlans: nextPlans };
    });

    logAuditEvent({
      patientName: activePatient.name,
      screenName: "Dental chart",
      action: "CHART_TO_PLAN",
      entityType: "dental_chart",
      entityId: `tooth-${selectedTooth.fdi}`,
      details: `Transferred ${proceduresToPush.length} procedure(s) from tooth ${toothLabel} into treatment plan`,
    });
    toast.success(`Transferred tooth ${toothLabel} findings & procedures to treatment plan!`);
    router.push("/app/treatment-plans");
  };

  const handleSaveSnapshot = () => {
    const now = new Date();
    const dateLabel = now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const snapId = `hist-${Date.now()}`;
    mutateActiveChart((chart) => ({
      ...chart,
      history: [
        ...chart.history,
        {
          id: snapId,
          dateLabel,
          recordedAt: now.toISOString(),
          recordedBy: actorName,
          note: "Clinical checkpoint saved",
          teeth: JSON.parse(JSON.stringify(chart.teeth)),
        },
      ],
    }));
    logAuditEvent({
      patientName: activePatient?.name || "Patient",
      screenName: "Dental chart",
      action: "CHART_SNAPSHOT_SAVED",
      entityType: "dental_chart",
      entityId: snapId,
      details: `Saved chart history snapshot (${dateLabel})`,
    });
    toast.success(`Saved chart snapshot for ${dateLabel}`);
  };

  return (
    <div className="space-y-4">
      <ToothSvgDefs />

      <DentflowPageHeader
        title={`Dental chart · ${activePatient?.name || "Patient"}`}
        subtitle={`${numberingSystem} numbering · last charted ${activeChart.lastChartedLabel} by ${activeChart.lastChartedBy}`}
      />

      {/* Patient Selector + High-Visibility Clinical Alert Strip */}
      <div className="df-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="chart-patient-select"
              className="text-xs font-bold text-[var(--df-text-muted)]"
            >
              Patient:
            </label>
            <select
              id="chart-patient-select"
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                setMultiSelectedFdis([]);
                setCompareHistoryId(null);
              }}
              className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--df-text)] cursor-pointer"
            >
              {state.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y {p.gender[0]} · {p.code})
                </option>
              ))}
            </select>
          </div>

          {/* Clinical Alert Strip: Allergies, Anxiety, Systemic conditions */}
          {activePatient && (
            <div className="flex flex-wrap items-center gap-1.5" role="region" aria-label="Patient clinical alerts">
              {activePatient.allergies.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)] border border-[var(--df-status-red-border)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Allergy: {activePatient.allergies.join(", ")}
                </span>
              ) : (
                <DentflowStatusPill label="NKDA (No known allergies)" tone="green" />
              )}

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  activePatient.comfortProfile.anxietyScore >= 6
                    ? "bg-[var(--df-status-amber-bg)] text-[var(--df-status-amber-text)] border-[var(--df-status-amber-border)]"
                    : "bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)] border-[var(--df-border)]"
                }`}
              >
                Anxiety: {activePatient.comfortProfile.anxietyScore}/10
                {activePatient.comfortProfile.autoBufferMin > 0
                  ? ` (+${activePatient.comfortProfile.autoBufferMin}m)`
                  : ""}
              </span>

              {activePatient.conditions && activePatient.conditions !== "None" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--df-status-blue-bg)] text-[var(--df-status-blue-text)] border border-[var(--df-status-blue-border)]">
                  Systemic: {activePatient.conditions}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Print / PDF + Numbering indicator */}
        <div className="flex items-center gap-2 print:hidden">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)]">
            {numberingSystem}
          </span>
          <button
            type="button"
            onClick={() => setShowShortcuts((v) => !v)}
            aria-label="Toggle keyboard shortcuts help"
            className="df-btn-secondary inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs cursor-pointer"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="df-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Bar (collapsible) */}
      {showShortcuts && (
        <div className="df-card px-4 py-2.5 text-xs text-[var(--df-text-secondary)] flex flex-wrap items-center justify-between gap-2 bg-[var(--df-surface-muted)] print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border font-mono text-[11px]">36</kbd> Type FDI tooth # to jump</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border font-mono text-[11px]">1–9</kbd> Pick condition</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border font-mono text-[11px]">← → ↑ ↓</kbd> Navigate teeth</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border font-mono text-[11px]">Drag / Shift+Click</kbd> Multi-select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border font-mono text-[11px]">Esc</kbd> Clear selection</span>
          </div>
          {keyBuffer && (
            <span className="font-mono font-bold text-[var(--df-teal)]">Typed: {keyBuffer}_</span>
          )}
        </div>
      )}

      {/* Summary Strip Above Chart */}
      <div className="df-card px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[var(--df-text-muted)] uppercase tracking-wider text-[10.5px]">
            Chart summary:
          </span>
          {TOOTH_CONDITIONS.filter(
            (c) => c.code !== "healthy" && (summary.byCondition[c.code] || 0) > 0,
          ).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setLegendHighlight((cur) => (cur === c.code ? null : c.code))}
              style={{
                backgroundColor: c.badgeBg,
                color: c.badgeText,
                borderColor: c.stroke,
              }}
              className="px-2 py-0.5 rounded-full text-xs font-bold border cursor-pointer hover:opacity-90"
            >
              {c.shortCode} · {c.label}: {summary.byCondition[c.code]}
            </button>
          ))}
          {Object.keys(summary.byCondition).length === 0 && (
            <span className="text-[var(--df-text-muted)]">All teeth charted healthy</span>
          )}
        </div>
        <div className="font-semibold text-[var(--df-teal)]">
          Planned procedures: {summary.plannedProceduresCount} (₹
          {summary.plannedProceduresTotalFee.toLocaleString("en-IN")})
        </div>
      </div>

      {/* Chart Workspace Tabs: Odontogram | Periodontal (6-site) | Imaging */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--df-border)] pb-2 print:hidden">
        {(
          [
            { id: "odontogram", label: "Odontogram" },
            { id: "perio", label: "Periodontal (6-site)" },
            { id: "imaging", label: `Imaging (${activeChart.imaging.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveChartTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeChartTab === tab.id
                ? "bg-[var(--df-sidebar-bg)] text-white shadow-xs"
                : "bg-[var(--df-surface)] border border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Periodontal 6-site Tab */}
      {activeChartTab === "perio" && (
        <PerioChart
          perioCurrent={activeChart.perioCurrent}
          perioHistory={activeChart.perioHistory}
          numberingSystem={numberingSystem}
          missingFdis={Object.values(activeChart.teeth)
            .filter((t) => t.conditions.includes("missing"))
            .map((t) => t.fdi)}
          onUpdatePerioTooth={(fdi, updated, detail) => {
            mutateActiveChart((chart) => ({
              ...chart,
              perioCurrent: { ...chart.perioCurrent, [fdi]: updated },
            }));
            logAuditEvent({
              patientName: activePatient?.name || "Patient",
              screenName: "Dental chart",
              action: "PERIO_UPDATE",
              entityType: "dental_chart",
              entityId: `perio-${fdi}`,
              details: detail,
            });
          }}
        />
      )}

      {/* Imaging Gallery + Full-Screen Radiograph Viewer */}
      {(activeChartTab === "imaging" || openImageId) && (
        <ImagingGalleryAndViewer
          imaging={activeChart.imaging}
          numberingSystem={numberingSystem}
          actorName={actorName}
          selectedToothFdi={selectedToothNum}
          openImageId={openImageId}
          galleryHidden={activeChartTab !== "imaging"}
          onSelectOpenImageId={setOpenImageId}
          onUpdateImage={(updated, detail) => {
            mutateActiveChart((chart) => ({
              ...chart,
              imaging: chart.imaging.map((img) => (img.id === updated.id ? updated : img)),
            }));
            logAuditEvent({
              patientName: activePatient?.name || "Patient",
              screenName: "Dental chart",
              action: "IMAGING_UPDATED",
              entityType: "dental_chart",
              entityId: updated.id,
              details: detail,
            });
          }}
          onAddImage={(item) => {
            mutateActiveChart((chart) => ({
              ...chart,
              imaging: [item, ...chart.imaging],
            }));
            logAuditEvent({
              patientName: activePatient?.name || "Patient",
              screenName: "Dental chart",
              action: "IMAGING_IMPORTED",
              entityType: "dental_chart",
              entityId: item.id,
              details: `Imported ${item.title} linked to teeth ${item.linkedTeeth.join(", ")}`,
            });
          }}
        />
      )}

      {/* Main Layout: Left 8-col Odontogram + Right 4-col Selected Tooth Panel */}
      {activeChartTab === "odontogram" && (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 space-y-4 min-w-0">
          {/* Odontogram Card */}
          <div className="df-card p-4 sm:p-5 space-y-4 overflow-hidden">
            {/* Top Controls: Dentition View + History Compare + Zoom */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--df-canvas-subtle)] border border-[var(--df-border)]">
                {(
                  [
                    { id: "adult", label: "Adult" },
                    { id: "child", label: "Child (Primary)" },
                    { id: "mixed", label: "Mixed" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleDentitionChange(tab.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      dentitionView === tab.id
                        ? "bg-[var(--df-sidebar-bg)] text-white"
                        : "text-[var(--df-text-secondary)] hover:text-[var(--df-text)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* History Compare + Zoom controls */}
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <div className="inline-flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-[var(--df-text-muted)]" />
                  <select
                    aria-label="Compare chart with historical date"
                    value={compareHistoryId || ""}
                    onChange={(e) => setCompareHistoryId(e.target.value || null)}
                    className="rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1 text-xs font-medium text-[var(--df-text)] cursor-pointer"
                  >
                    <option value="">Compare with date...</option>
                    {activeChart.history.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.dateLabel} ({h.recordedBy})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleSaveSnapshot}
                    className="df-btn-secondary px-2.5 py-1 text-xs cursor-pointer"
                  >
                    Save snapshot
                  </button>
                </div>

                {/* Zoom controls (complementing tablet pinch-zoom) */}
                <div className="inline-flex items-center gap-1 border border-[var(--df-border)] rounded-lg bg-[var(--df-surface)] p-0.5">
                  <button
                    type="button"
                    aria-label="Zoom out odontogram"
                    onClick={() => setZoomScale((z) => Math.max(0.75, Number((z - 0.1).toFixed(2))))}
                    className="p-1 rounded hover:bg-[var(--df-surface-hover)] cursor-pointer"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1">{Math.round(zoomScale * 100)}%</span>
                  <button
                    type="button"
                    aria-label="Zoom in odontogram"
                    onClick={() => setZoomScale((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
                    className="p-1 rounded hover:bg-[var(--df-surface-hover)] cursor-pointer"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  {zoomScale !== 1 && (
                    <button
                      type="button"
                      aria-label="Reset zoom"
                      onClick={() => setZoomScale(1)}
                      className="p-1 rounded hover:bg-[var(--df-surface-hover)] cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Paint-First Condition Palette */}
            <div className="p-2.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-2 print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                  1. Pick condition → 2. Tap surfaces to paint (or drag teeth to multi-select)
                </span>
                {multiSelectedFdis.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-blue-700">
                      {multiSelectedFdis.length} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleApplyCondition(activeCondition, multiSelectedFdis);
                        setMultiSelectedFdis([]);
                      }}
                      className="df-btn-primary px-2.5 py-1 text-[11px] cursor-pointer"
                    >
                      Apply {CONDITION_BY_CODE[activeCondition].label}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMultiSelectedFdis([])}
                      className="df-btn-secondary px-2 py-1 text-[11px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {TOOTH_CONDITIONS.map((cond) => {
                  const isActive = activeCondition === cond.code;
                  return (
                    <button
                      key={cond.code}
                      type="button"
                      onClick={() => setActiveCondition(cond.code)}
                      style={
                        isActive
                          ? { backgroundColor: cond.stroke, color: "#FFFFFF", borderColor: cond.stroke }
                          : { backgroundColor: cond.badgeBg, color: cond.badgeText, borderColor: cond.stroke }
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                        isActive ? "ring-2 ring-offset-1 ring-[var(--df-sidebar-bg)] shadow-xs" : "opacity-90 hover:opacity-100"
                      }`}
                    >
                      {cond.shortcutKey && (
                        <span className="text-[9.5px] opacity-75 font-mono">{cond.shortcutKey}</span>
                      )}
                      <span>{cond.shortCode}</span>
                      <span className="font-semibold">{cond.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* History Diff Banner when comparing */}
            {compareSnapshot && (
              <div className="p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-[var(--df-status-amber-text)]">
                    Comparing current chart vs {compareSnapshot.dateLabel} (by {compareSnapshot.recordedBy})
                  </p>
                  <button
                    type="button"
                    onClick={() => setCompareHistoryId(null)}
                    className="text-xs font-semibold underline cursor-pointer"
                  >
                    Exit compare
                  </button>
                </div>
                {chartDiffs.length === 0 ? (
                  <p className="text-[var(--df-text-secondary)]">No changes detected since {compareSnapshot.dateLabel}.</p>
                ) : (
                  <ul className="space-y-0.5 text-[var(--df-text-secondary)]">
                    {chartDiffs.map((d) => (
                      <li key={d.fdi}>
                        <strong>Tooth {formatToothNumber(d.fdi, numberingSystem)}</strong>:{" "}
                        {d.added.length > 0 && `Added ${d.added.join(", ")}. `}
                        {d.removed.length > 0 && `Resolved ${d.removed.join(", ")}. `}
                        {d.surfaceChanges.length > 0 && `Surfaces (${d.surfaceChanges.join("; ")})`}
                        {d.changedBy && <span className="text-[var(--df-text-muted)]"> — by {d.changedBy}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Arch Canvas (No horizontal scrollbars on desktop; smooth horizontal scroll on narrow mobile; tablet pinch-zoom enabled) */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className="w-full py-2 overflow-x-auto overflow-y-hidden"
            >
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "top center",
                }}
                className="space-y-4 transition-transform min-w-[560px] md:min-w-0 w-full"
              >
                {/* Upper Arch */}
                <div className="space-y-1.5 w-full">
                  <p className="text-center text-xs text-[var(--df-text-muted)] font-semibold">
                    Upper Arch · Patient&apos;s Right (Q1) ← Midline → Patient&apos;s Left (Q2)
                  </p>

                  {dentitionView !== "child" && (
                    <div className="flex items-center justify-center w-full gap-0.5 sm:gap-1 flex-nowrap">
                      {UPPER_RIGHT_PERMANENT.map((fdi) => renderTooth(fdi))}
                      <div className="w-[2px] h-20 sm:h-24 bg-[var(--df-teal)]/50 mx-1 sm:mx-1.5 shrink-0 rounded-full" aria-label="Upper midline" />
                      {UPPER_LEFT_PERMANENT.map((fdi) => renderTooth(fdi))}
                    </div>
                  )}

                  {/* Primary Upper Row (Child view OR aligned under permanent 15..11 | 21..25 in Mixed view) */}
                  {(dentitionView === "child" || dentitionView === "mixed") && (
                    <div className="flex items-center justify-center w-full gap-0.5 sm:gap-1 flex-nowrap pt-1">
                      {dentitionView === "mixed" && (
                        <>
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                        </>
                      )}
                      {UPPER_RIGHT_PRIMARY.map((fdi) => renderTooth(fdi, dentitionView === "mixed"))}
                      <div className="w-[2px] h-16 sm:h-20 bg-purple-400/60 mx-1 sm:mx-1.5 shrink-0 rounded-full" />
                      {UPPER_LEFT_PRIMARY.map((fdi) => renderTooth(fdi, dentitionView === "mixed"))}
                      {dentitionView === "mixed" && (
                        <>
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Occlusal Plane Divider */}
                <div className="border-t-2 border-dashed border-[var(--df-border-strong)] my-2" />

                {/* Lower Arch */}
                <div className="space-y-1.5 w-full">
                  {/* Primary Lower Row (Child view OR aligned over permanent 45..41 | 31..35 in Mixed view) */}
                  {(dentitionView === "child" || dentitionView === "mixed") && (
                    <div className="flex items-center justify-center w-full gap-0.5 sm:gap-1 flex-nowrap pb-1">
                      {dentitionView === "mixed" && (
                        <>
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                        </>
                      )}
                      {LOWER_RIGHT_PRIMARY.map((fdi) => renderTooth(fdi, dentitionView === "mixed"))}
                      <div className="w-[2px] h-16 sm:h-20 bg-purple-400/60 mx-1 sm:mx-1.5 shrink-0 rounded-full" />
                      {LOWER_LEFT_PRIMARY.map((fdi) => renderTooth(fdi, dentitionView === "mixed"))}
                      {dentitionView === "mixed" && (
                        <>
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-[34px] max-w-[52px] sm:max-w-[58px] invisible shrink-0" aria-hidden="true" />
                        </>
                      )}
                    </div>
                  )}

                  {dentitionView !== "child" && (
                    <div className="flex items-center justify-center w-full gap-0.5 sm:gap-1 flex-nowrap">
                      {LOWER_RIGHT_PERMANENT.map((fdi) => renderTooth(fdi))}
                      <div className="w-[2px] h-20 sm:h-24 bg-[var(--df-teal)]/50 mx-1 sm:mx-1.5 shrink-0 rounded-full" aria-label="Lower midline" />
                      {LOWER_LEFT_PERMANENT.map((fdi) => renderTooth(fdi))}
                    </div>
                  )}

                  <p className="text-center text-xs text-[var(--df-text-muted)] font-semibold">
                    Lower Arch · Patient&apos;s Right (Q4) ← Midline → Patient&apos;s Left (Q3)
                  </p>
                </div>
              </div>
            </div>

            {/* Clickable Legend (Highlights matching teeth; included in Print/PDF) */}
            <div className="pt-3 border-t border-[var(--df-border)] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[var(--df-text-muted)]">
                <span className="font-bold uppercase tracking-wider">
                  Legend (click condition to highlight matching teeth)
                </span>
                {legendHighlight && (
                  <button
                    type="button"
                    onClick={() => setLegendHighlight(null)}
                    className="text-[var(--df-teal)] font-semibold underline cursor-pointer print:hidden"
                  >
                    Clear highlight
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {TOOTH_CONDITIONS.filter((c) => c.code !== "healthy").map((c) => {
                  const isHighlighted = legendHighlight === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() =>
                        setLegendHighlight((cur) => (cur === c.code ? null : c.code))
                      }
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border cursor-pointer transition-all ${
                        isHighlighted
                          ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50 font-bold"
                          : "border-[var(--df-border)] bg-[var(--df-surface)] hover:border-[var(--df-teal)]"
                      }`}
                    >
                      <span
                        style={{
                          backgroundColor: c.badgeBg,
                          color: c.badgeText,
                          borderColor: c.stroke,
                        }}
                        className="px-1 rounded text-[9.5px] font-bold border"
                      >
                        {c.shortCode}
                      </span>
                      <span className="text-[var(--df-text-secondary)]">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4-col Selected-Tooth Detail Panel */}
        <div className="xl:col-span-4 df-card p-5 space-y-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="df-serif text-3xl font-semibold text-[var(--df-text)]">
                  {formatToothNumber(selectedTooth.fdi, numberingSystem)}
                </span>
                <span className="text-xs font-medium text-[var(--df-text-muted)]">
                  {getToothDisplayName(selectedTooth.fdi)}
                </span>
              </div>
              {numberingSystem !== "FDI" && (
                <p className="text-[11px] text-[var(--df-text-muted)] font-mono">
                  FDI #{selectedTooth.fdi}
                </p>
              )}
            </div>

            {/* Show roots toggle */}
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--df-text-secondary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showRoots}
                onChange={(e) => setShowRoots(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-[var(--df-teal)]"
              />
              <span>Show roots</span>
            </label>
          </div>

          {/* Large Crown & Roots SVG + Interactive Surfaces */}
          <DetailedToothRootSvg
            tooth={selectedTooth}
            displayNumber={formatToothNumber(selectedTooth.fdi, numberingSystem)}
            showRoots={showRoots}
            onClickSurface={(surf) => handleClickSurface(selectedTooth.fdi, surf)}
          />

          {/* Root & Eruption Controls */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1">
                Eruption state
              </label>
              <select
                aria-label="Tooth eruption state"
                value={selectedTooth.eruptionState}
                onChange={(e) =>
                  handleEruptionChange(selectedTooth.fdi, e.target.value as EruptionState)
                }
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
              >
                <option value="erupted">Erupted</option>
                <option value="partially_erupted">Partially erupted</option>
                <option value="unerupted">Unerupted</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1">
                Alveolar bone level
              </label>
              <select
                aria-label="Bone level"
                value={selectedTooth.rootFlags?.boneLossLevel || "normal"}
                onChange={(e) => {
                  const val = e.target.value as "normal" | "mild" | "moderate" | "severe";
                  mutateActiveChart((chart) => {
                    const cur = chart.teeth[selectedTooth.fdi] || createHealthyTooth(selectedTooth.fdi);
                    return {
                      ...chart,
                      teeth: {
                        ...chart.teeth,
                        [selectedTooth.fdi]: {
                          ...cur,
                          rootFlags: { ...cur.rootFlags, boneLossLevel: val },
                        },
                      },
                    };
                  });
                }}
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
              >
                <option value="normal">Normal</option>
                <option value="mild">Mild loss</option>
                <option value="moderate">Moderate loss</option>
                <option value="severe">Severe loss</option>
              </select>
            </div>
          </div>

          {showRoots && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(selectedTooth.rootFlags?.rctObturation)}
                  onChange={(e) =>
                    mutateActiveChart((chart) => {
                      const cur = chart.teeth[selectedTooth.fdi] || createHealthyTooth(selectedTooth.fdi);
                      return {
                        ...chart,
                        teeth: {
                          ...chart.teeth,
                          [selectedTooth.fdi]: {
                            ...cur,
                            rootFlags: { ...cur.rootFlags, rctObturation: e.target.checked },
                          },
                        },
                      };
                    })
                  }
                  className="h-3.5 w-3.5 rounded accent-[var(--df-teal)]"
                />
                <span>RCT obturation</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(selectedTooth.rootFlags?.apicalLesion)}
                  onChange={(e) =>
                    mutateActiveChart((chart) => {
                      const cur = chart.teeth[selectedTooth.fdi] || createHealthyTooth(selectedTooth.fdi);
                      return {
                        ...chart,
                        teeth: {
                          ...chart.teeth,
                          [selectedTooth.fdi]: {
                            ...cur,
                            rootFlags: { ...cur.rootFlags, apicalLesion: e.target.checked },
                          },
                        },
                      };
                    })
                  }
                  className="h-3.5 w-3.5 rounded accent-red-600"
                />
                <span>Apical lesion</span>
              </label>
            </div>
          )}

          {/* Active Conditions on this tooth (multi-condition chips) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--df-text-muted)]">
                Recorded conditions
              </span>
              <button
                type="button"
                onClick={() => handleApplyCondition(activeCondition, [selectedTooth.fdi])}
                className="text-[11px] font-bold text-[var(--df-teal)] hover:underline cursor-pointer"
              >
                + Apply {CONDITION_BY_CODE[activeCondition].label}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {getAllToothConditions(selectedTooth).length === 0 ? (
                <span className="text-xs text-[var(--df-text-muted)]">Healthy tooth structure</span>
              ) : (
                getAllToothConditions(selectedTooth).map((c) => {
                  const meta = CONDITION_BY_CODE[c];
                  return (
                    <span
                      key={c}
                      style={{
                        backgroundColor: meta.badgeBg,
                        color: meta.badgeText,
                        borderColor: meta.stroke,
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border"
                    >
                      <span>{meta.shortCode} · {meta.label}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${meta.label}`}
                        onClick={() => handleRemoveCondition(selectedTooth.fdi, c)}
                        className="hover:opacity-70 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Linked Radiographs on this tooth */}
          {activeChart.imaging.filter((img) => img.linkedTeeth.includes(selectedTooth.fdi)).length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[var(--df-border)]">
              <span className="text-[11px] font-semibold text-[var(--df-text-muted)]">
                Linked Radiographs ({activeChart.imaging.filter((img) => img.linkedTeeth.includes(selectedTooth.fdi)).length})
              </span>
              <div className="flex flex-wrap gap-2">
                {activeChart.imaging
                  .filter((img) => img.linkedTeeth.includes(selectedTooth.fdi))
                  .map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setOpenImageId(img.id)}
                      className="flex items-center gap-2 p-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)] hover:border-[var(--df-teal)] text-left cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="w-10 h-7 rounded overflow-hidden shrink-0 border border-[var(--df-border)] bg-black">
                        <RadiographSvgGraphic item={img} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[var(--df-text)] truncate max-w-[130px]">{img.title}</p>
                        <p className="text-[10px] text-[var(--df-text-muted)]">{img.date}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Editable Clinical Findings Notes */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[var(--df-text-muted)]">
              Clinical findings notes
            </label>
            <textarea
              rows={2}
              value={selectedTooth.finding || ""}
              placeholder="Enter clinical findings (flows directly into treatment plan & explainer)..."
              onChange={(e) => {
                const text = e.target.value;
                mutateActiveChart((chart) => {
                  const cur = chart.teeth[selectedTooth.fdi] || createHealthyTooth(selectedTooth.fdi);
                  return {
                    ...chart,
                    teeth: { ...chart.teeth, [selectedTooth.fdi]: { ...cur, finding: text } },
                  };
                });
              }}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] p-2.5 text-xs text-[var(--df-text)]"
            />
          </div>

          {/* Planned Procedures on this tooth */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[var(--df-text-muted)]">
              Planned procedures on tooth {formatToothNumber(selectedTooth.fdi, numberingSystem)}
            </p>
            <div className="space-y-1.5">
              {selectedTooth.plannedProcedures.map((proc) => (
                <div
                  key={proc.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-xs"
                >
                  <span className="font-semibold text-[var(--df-text)]">{proc.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--df-text)]">
                      ₹{proc.fee.toLocaleString("en-IN")}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${proc.name}`}
                      onClick={() =>
                        mutateActiveChart((chart) => {
                          const cur = chart.teeth[selectedTooth.fdi] || createHealthyTooth(selectedTooth.fdi);
                          return {
                            ...chart,
                            teeth: {
                              ...chart.teeth,
                              [selectedTooth.fdi]: {
                                ...cur,
                                plannedProcedures: cur.plannedProcedures.filter((x) => x.id !== proc.id),
                              },
                            },
                          };
                        })
                      }
                      className="text-[var(--df-text-muted)] hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add planned procedure */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Add procedure (e.g. Composite filling)"
                value={newProcName}
                onChange={(e) => setNewProcName(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 text-xs"
              />
              <input
                type="number"
                aria-label="Procedure fee"
                value={newProcFee}
                onChange={(e) => setNewProcFee(e.target.value)}
                className="w-20 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                aria-label="Add planned procedure"
                onClick={() => {
                  if (!newProcName.trim()) return;
                  const proc = {
                    id: `pp-${Date.now()}`,
                    name: newProcName.trim(),
                    fee: Math.max(0, Number(newProcFee) || 0),
                  };
                  mutateActiveChart((chart) => {
                    const cur = chart.teeth[selectedTooth.fdi] || createHealthyTooth(selectedTooth.fdi);
                    return {
                      ...chart,
                      teeth: {
                        ...chart.teeth,
                        [selectedTooth.fdi]: {
                          ...cur,
                          plannedProcedures: [...cur.plannedProcedures, proc],
                        },
                      },
                    };
                  });
                  setNewProcName("");
                }}
                className="df-btn-secondary p-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Actions: Flow findings directly to Treatment Plan & Patient Explainer */}
          <div className="pt-2 space-y-2 print:hidden">
            <button
              type="button"
              onClick={handleAddToTreatmentPlan}
              className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
            >
              Add to treatment plan
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/app/explainers?patientId=${activePatient?.id || "pat-priya"}&tooth=${selectedTooth.fdi}`,
                )
              }
              className="w-full df-btn-secondary py-2.5 text-xs cursor-pointer"
            >
              Create patient explainer
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function DentalChartPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--df-text-muted)]">
          Loading dental chart...
        </div>
      }
    >
      <DentalChartContent />
    </Suspense>
  );
}
