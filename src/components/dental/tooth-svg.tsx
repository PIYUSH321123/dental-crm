"use client";

import React, { useState } from "react";
import {
  CONDITION_BY_CODE,
  getAllToothConditions,
  getPrimaryToothCondition,
  getSurfaceLayout,
  getToothCategory,
  isUpperArch,
  ToothCategory,
} from "@/lib/dental-chart-logic";
import { DentalImagingRecord, ToothChartRecord, ToothConditionCode, ToothSurface } from "@/types/dentflow";
import { RadiographSvgGraphic } from "./imaging-viewer";

/** Render once per page to provide accessible color+pattern SVG fills (never color alone). */
export function ToothSvgDefs() {
  return (
    <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
      <defs>
        <pattern id="df-pat-caries" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#FEE2E2" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#DC2626" strokeWidth="1.6" />
        </pattern>
        <pattern id="df-pat-filled" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#DBEAFE" />
          <circle cx="3" cy="3" r="1.15" fill="#2563EB" />
        </pattern>
        <pattern id="df-pat-sealant" width="5" height="5" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill="#CFFAFE" />
          <circle cx="2.5" cy="2.5" r="0.9" fill="#0891B2" />
        </pattern>
        <pattern id="df-pat-crown" width="6" height="4" patternUnits="userSpaceOnUse">
          <rect width="6" height="4" fill="#FEF3C7" />
          <line x1="0" y1="2" x2="6" y2="2" stroke="#D97706" strokeWidth="1" />
        </pattern>
        <pattern id="df-pat-veneer" width="4" height="6" patternUnits="userSpaceOnUse">
          <rect width="4" height="6" fill="#E0E7FF" />
          <line x1="2" y1="0" x2="2" y2="6" stroke="#4F46E5" strokeWidth="1" />
        </pattern>
        <pattern id="df-pat-planned" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="6" height="6" fill="#E3F3EE" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#146C58" strokeWidth="1.4" strokeDasharray="2 1" />
        </pattern>
        <pattern id="df-pat-fractured" width="8" height="6" patternUnits="userSpaceOnUse">
          <rect width="8" height="6" fill="#FFE4E6" />
          <path d="M0 3 L2 1 L4 5 L6 1 L8 3" fill="none" stroke="#BE123C" strokeWidth="1" />
        </pattern>
        <pattern id="df-pat-attrition" width="6" height="5" patternUnits="userSpaceOnUse">
          <rect width="6" height="5" fill="#F5F5F4" />
          <line x1="0" y1="3" x2="6" y2="3" stroke="#78716C" strokeWidth="1.2" />
        </pattern>
      </defs>
    </svg>
  );
}

function getSurfaceFill(cond?: ToothConditionCode): { fill: string; stroke: string } {
  if (!cond || cond === "healthy") {
    return { fill: "#FFFFFF", stroke: "#94A3B8" };
  }
  const map: Partial<Record<ToothConditionCode, string>> = {
    caries: "url(#df-pat-caries)",
    filled: "url(#df-pat-filled)",
    sealant: "url(#df-pat-sealant)",
    crown: "url(#df-pat-crown)",
    veneer: "url(#df-pat-veneer)",
    planned: "url(#df-pat-planned)",
    fractured: "url(#df-pat-fractured)",
    attrition: "url(#df-pat-attrition)",
  };
  const meta = CONDITION_BY_CODE[cond];
  return {
    fill: map[cond] || meta.fill,
    stroke: meta.stroke,
  };
}

/** Anatomic silhouette path for crown + root hint, oriented with crown pointing DOWN (upper) or UP (lower). */
function getAnatomicCrownPath(category: ToothCategory, upper: boolean): { crown: string; roots: string } {
  if (upper) {
    // Roots at top (y=2..14), Crown pointing down (y=14..32)
    switch (category) {
      case "molar":
        return {
          roots: "M12 15 L9 3 Q13 1 16 12 L22 2 Q26 1 28 12 L34 3 Q38 4 36 15 Z",
          crown: "M8 15 Q7 29 14 31 Q20 28 24 31 Q28 28 34 31 Q41 29 40 15 Q24 13 8 15 Z",
        };
      case "premolar":
        return {
          roots: "M15 15 L14 3 Q18 1 22 11 L26 11 Q30 1 34 3 L33 15 Z",
          crown: "M12 15 Q11 28 19 31 Q24 27 29 31 Q37 28 36 15 Q24 13 12 15 Z",
        };
      case "canine":
        return {
          roots: "M17 15 Q21 2 24 1 Q27 2 31 15 Z",
          crown: "M14 15 Q13 24 24 32 Q35 24 34 15 Q24 13 14 15 Z",
        };
      case "incisor":
      default:
        return {
          roots: "M17 15 Q20 3 24 2 Q28 3 31 15 Z",
          crown: "M13 15 Q12 28 16 31 L32 31 Q36 28 35 15 Q24 13 13 15 Z",
        };
    }
  } else {
    // Crown pointing UP (y=2..19), Roots at bottom (y=19..32)
    switch (category) {
      case "molar":
        return {
          crown: "M8 19 Q7 5 14 3 Q20 6 24 3 Q28 6 34 3 Q41 5 40 19 Q24 21 8 19 Z",
          roots: "M11 19 L10 31 Q15 33 21 22 L27 22 Q33 33 38 31 L37 19 Z",
        };
      case "premolar":
        return {
          crown: "M12 19 Q11 6 19 3 Q24 7 29 3 Q37 6 36 19 Q24 21 12 19 Z",
          roots: "M16 19 Q20 31 24 32 Q28 31 32 19 Z",
        };
      case "canine":
        return {
          crown: "M14 19 Q13 10 24 2 Q35 10 34 19 Q24 21 14 19 Z",
          roots: "M17 19 Q21 31 24 33 Q27 31 31 19 Z",
        };
      case "incisor":
      default:
        return {
          crown: "M13 19 Q12 6 16 3 L32 3 Q36 6 35 19 Q24 21 13 19 Z",
          roots: "M17 19 Q20 30 24 32 Q28 30 31 19 Z",
        };
    }
  }
}

export interface ToothSvgProps {
  tooth: ToothChartRecord;
  displayNumber: string;
  selected?: boolean;
  multiSelected?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  diffBadge?: string;
  hasLinkedImaging?: boolean;
  linkedImages?: DentalImagingRecord[];
  onOpenImage?: (img: DentalImagingRecord) => void;
  compact?: boolean;
  onSelectTooth?: (fdi: number, e: React.MouseEvent) => void;
  onClickSurface?: (fdi: number, surface: ToothSurface, e: React.MouseEvent) => void;
  onPointerDownTooth?: (fdi: number, e: React.PointerEvent) => void;
  onPointerEnterTooth?: (fdi: number) => void;
  onHoverTooth?: (fdi: number | null) => void;
}

export function ToothSvg({
  tooth,
  displayNumber,
  selected = false,
  multiSelected = false,
  highlighted = false,
  dimmed = false,
  diffBadge,
  hasLinkedImaging = false,
  linkedImages,
  onOpenImage,
  compact = false,
  onSelectTooth,
  onClickSurface,
  onPointerDownTooth,
  onPointerEnterTooth,
  onHoverTooth,
}: ToothSvgProps) {
  const [isHovered, setIsHovered] = useState(false);
  const upper = isUpperArch(tooth.fdi);
  const category = getToothCategory(tooth.fdi);
  const layout = getSurfaceLayout(tooth.fdi);
  const allConds = getAllToothConditions(tooth);
  const primaryCond = getPrimaryToothCondition(tooth);
  const primaryMeta = CONDITION_BY_CODE[primaryCond];
  const { crown, roots } = getAnatomicCrownPath(category, upper);

  const isMissing = tooth.conditions.includes("missing");
  const isExtraction = tooth.conditions.includes("extraction_planned");
  const isRct = tooth.conditions.includes("root_canal") || Boolean(tooth.rootFlags?.rctObturation);
  const isCrown = tooth.conditions.includes("crown");
  const isImplant = tooth.conditions.includes("implant");
  const isBridge = tooth.conditions.includes("bridge_pontic");
  const isFractured = tooth.conditions.includes("fractured");
  const isImpacted = tooth.conditions.includes("impacted");
  const isUnerupted = tooth.eruptionState === "unerupted";
  const isPartial = tooth.eruptionState === "partially_erupted";

  const crownFill = isMissing
    ? "#F1F5F9"
    : isCrown
    ? "url(#df-pat-crown)"
    : isBridge
    ? "#EDE9FE"
    : isImpacted
    ? "#FFEDD5"
    : "#FFFFFF";

  const crownStroke = isMissing
    ? "#94A3B8"
    : primaryCond === "healthy"
    ? "#475569"
    : primaryMeta.stroke;

  const topSurf = getSurfaceFill(tooth.surfaceConditions[layout.top]);
  const bottomSurf = getSurfaceFill(tooth.surfaceConditions[layout.bottom]);
  const leftSurf = getSurfaceFill(tooth.surfaceConditions[layout.left]);
  const rightSurf = getSurfaceFill(tooth.surfaceConditions[layout.right]);
  const centerSurf = getSurfaceFill(tooth.surfaceConditions[layout.center]);

  const handleSurface = (surf: ToothSurface) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClickSurface) {
      onClickSurface(tooth.fdi, surf, e);
    } else if (onSelectTooth) {
      onSelectTooth(tooth.fdi, e);
    }
  };

  // Crown silhouette SVG block
  const crownGraphic = (
    <svg
      viewBox="0 0 48 34"
      className="w-full max-w-[34px] sm:max-w-[38px] h-auto aspect-[48/34] max-h-6 sm:max-h-7"
      aria-hidden="true"
    >
      {/* Roots */}
      {!isMissing && (
        <path
          d={roots}
          fill={isImplant ? "#CCFBF1" : "#F8FAFC"}
          stroke={isImplant ? "#0F766E" : "#94A3B8"}
          strokeWidth="1.2"
          strokeDasharray={isUnerupted ? "2 2" : undefined}
        />
      )}
      {/* Implant screw lines */}
      {isImplant && (
        <g stroke="#0F766E" strokeWidth="1.4">
          <line x1="19" y1={upper ? 5 : 22} x2="29" y2={upper ? 5 : 22} />
          <line x1="20" y1={upper ? 8.5 : 25.5} x2="28" y2={upper ? 8.5 : 25.5} />
          <line x1="21" y1={upper ? 12 : 29} x2="27" y2={upper ? 12 : 29} />
        </g>
      )}
      {/* RCT obturation canal lines */}
      {isRct && !isMissing && (
        <g stroke="#9333EA" strokeWidth="1.8" strokeLinecap="round">
          <line x1="21" y1={upper ? 5 : 19} x2="21" y2={upper ? 19 : 29} />
          <line x1="27" y1={upper ? 5 : 19} x2="27" y2={upper ? 19 : 29} />
        </g>
      )}
      {/* Crown */}
      <path
        d={crown}
        fill={crownFill}
        stroke={crownStroke}
        strokeWidth={isCrown ? "2" : "1.4"}
        strokeDasharray={isMissing || isUnerupted || isPartial ? "3 2" : undefined}
      />
      {/* Bridge bar */}
      {isBridge && (
        <line x1="2" y1={upper ? 23 : 11} x2="46" y2={upper ? 23 : 11} stroke="#7C3AED" strokeWidth="2.4" />
      )}
      {/* Fracture zigzag */}
      {isFractured && (
        <path
          d={upper ? "M18 16 L24 22 L20 26 L28 31" : "M18 18 L24 12 L20 8 L28 3"}
          fill="none"
          stroke="#BE123C"
          strokeWidth="1.8"
        />
      )}
      {/* Missing or Extraction X */}
      {(isMissing || isExtraction) && (
        <g stroke={isExtraction ? "#991B1B" : "#64748B"} strokeWidth={isExtraction ? "2.4" : "1.8"} strokeLinecap="round">
          <line x1="11" y1="6" x2="37" y2="28" />
          <line x1="37" y1="6" x2="11" y2="28" />
        </g>
      )}
    </svg>
  );

  // 5-surface interactive odontogram polygon (trapezoids + center box)
  const surfaceDiagram = (
    <svg
      viewBox="0 0 44 44"
      className="w-full max-w-[36px] sm:max-w-[40px] h-auto aspect-square max-h-9 sm:max-h-10"
      role="group"
      aria-label={`Tooth ${displayNumber} surfaces`}
    >
      {/* Top surface (B on upper, L on lower) */}
      <polygon
        points="2,2 42,2 32,12 12,12"
        fill={topSurf.fill}
        stroke={topSurf.stroke}
        strokeWidth="1.2"
        className="cursor-pointer hover:brightness-95 transition-all"
        onClick={handleSurface(layout.top)}
      >
        <title>{`Tooth ${displayNumber} · ${layout.top === "B" ? "Buccal" : "Lingual"} (${tooth.surfaceConditions[layout.top] || "healthy"})`}</title>
      </polygon>
      {/* Bottom surface (L on upper, B on lower) */}
      <polygon
        points="12,32 32,32 42,42 2,42"
        fill={bottomSurf.fill}
        stroke={bottomSurf.stroke}
        strokeWidth="1.2"
        className="cursor-pointer hover:brightness-95 transition-all"
        onClick={handleSurface(layout.bottom)}
      >
        <title>{`Tooth ${displayNumber} · ${layout.bottom === "B" ? "Buccal" : "Lingual"} (${tooth.surfaceConditions[layout.bottom] || "healthy"})`}</title>
      </polygon>
      {/* Left surface (D on patient right, M on patient left) */}
      <polygon
        points="2,2 12,12 12,32 2,42"
        fill={leftSurf.fill}
        stroke={leftSurf.stroke}
        strokeWidth="1.2"
        className="cursor-pointer hover:brightness-95 transition-all"
        onClick={handleSurface(layout.left)}
      >
        <title>{`Tooth ${displayNumber} · ${layout.left === "M" ? "Mesial" : "Distal"} (${tooth.surfaceConditions[layout.left] || "healthy"})`}</title>
      </polygon>
      {/* Right surface (M on patient right, D on patient left) */}
      <polygon
        points="42,2 42,42 32,32 32,12"
        fill={rightSurf.fill}
        stroke={rightSurf.stroke}
        strokeWidth="1.2"
        className="cursor-pointer hover:brightness-95 transition-all"
        onClick={handleSurface(layout.right)}
      >
        <title>{`Tooth ${displayNumber} · ${layout.right === "M" ? "Mesial" : "Distal"} (${tooth.surfaceConditions[layout.right] || "healthy"})`}</title>
      </polygon>
      {/* Center surface (I on anteriors, O on posteriors) */}
      <rect
        x="12"
        y="12"
        width="20"
        height="20"
        rx="2"
        fill={centerSurf.fill}
        stroke={centerSurf.stroke}
        strokeWidth="1.2"
        className="cursor-pointer hover:brightness-95 transition-all"
        onClick={handleSurface(layout.center)}
      >
        <title>{`Tooth ${displayNumber} · ${layout.centerLabel === "I" ? "Incisal" : "Occlusal"} (${tooth.surfaceConditions[layout.center] || "healthy"})`}</title>
      </rect>
      {/* Surface letters for instant orientation */}
      <text x="22" y="9.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#475569" className="pointer-events-none select-none">
        {layout.top}
      </text>
      <text x="22" y="39.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#475569" className="pointer-events-none select-none">
        {layout.bottom}
      </text>
      <text x="7" y="24" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#475569" className="pointer-events-none select-none">
        {layout.left}
      </text>
      <text x="37" y="24" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#475569" className="pointer-events-none select-none">
        {layout.right}
      </text>
      <text x="22" y="24.5" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#1E293B" className="pointer-events-none select-none">
        {layout.centerLabel}
      </text>
    </svg>
  );

  // Condition short-code chips (supports multiple conditions per tooth)
  const statusChips =
    allConds.length > 0 ? (
      <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full px-0.5 min-h-[14px]">
        {allConds.slice(0, 2).map((code) => {
          const m = CONDITION_BY_CODE[code];
          return (
            <span
              key={code}
              style={{ backgroundColor: m.badgeBg, color: m.badgeText, borderColor: m.stroke }}
              className="px-0.5 py-0 text-[7.5px] sm:text-[8px] leading-tight font-bold rounded border shrink-0"
            >
              {m.shortCode}
            </span>
          );
        })}
        {allConds.length > 2 && (
          <span className="text-[7px] font-bold text-[var(--df-text-muted)]">+{allConds.length - 2}</span>
        )}
      </div>
    ) : (
      <div className="h-[14px]" />
    );

  return (
    <div
      role="button"
      tabIndex={0}
      title={`Tooth ${displayNumber}${hasLinkedImaging ? ` · ${linkedImages?.length || 1} radiograph(s)` : ""}${allConds.length ? ` (${allConds.join(", ")})` : ""}`}
      aria-label={`Tooth ${displayNumber}${allConds.length ? `: ${allConds.join(", ")}` : ": healthy"}`}
      aria-pressed={selected || multiSelected}
      onClick={(e) => onSelectTooth?.(tooth.fdi, e)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectTooth?.(tooth.fdi, e as unknown as React.MouseEvent);
        }
      }}
      onPointerDown={(e) => onPointerDownTooth?.(tooth.fdi, e)}
      onPointerEnter={() => {
        setIsHovered(true);
        onPointerEnterTooth?.(tooth.fdi);
        onHoverTooth?.(tooth.fdi);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        onHoverTooth?.(null);
      }}
      className={`relative flex flex-col items-center justify-between rounded-lg sm:rounded-xl border p-0.5 sm:p-1 transition-colors duration-150 select-none cursor-pointer ${
        compact ? "w-8 sm:w-9" : "flex-1 min-w-0 max-w-[56px] sm:max-w-[62px]"
      } ${
        isUnerupted ? "opacity-50 border-dashed" : ""
      } ${
        dimmed ? "opacity-30" : ""
      } ${
        selected
          ? "border-[var(--df-teal)] bg-[var(--df-teal-soft)]/50 ring-2 ring-[var(--df-teal)] shadow-sm z-10"
          : multiSelected
          ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/70 z-10"
          : highlighted
          ? "border-amber-500 bg-amber-50/80 ring-2 ring-amber-400 z-10"
          : "border-[var(--df-border)] bg-[var(--df-surface)] hover:border-[var(--df-teal)]"
      }`}
    >
      {/* Linked imaging indicator dot with tooltip */}
      {hasLinkedImaging && (
        <span
          title={`Has linked radiograph (${linkedImages?.length || 1}) — click tooth to view`}
          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--df-teal)] ring-1 ring-white"
        />
      )}

      {/* History diff indicator */}
      {diffBadge && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0 rounded-full text-[8.5px] font-bold bg-amber-600 text-white shadow-xs whitespace-nowrap z-20">
          {diffBadge}
        </span>
      )}

      {/* Eruption marker */}
      {(isUnerupted || isPartial) && (
        <span
          title={isUnerupted ? "Unerupted" : "Partially erupted"}
          className="absolute top-1 left-1 px-1 rounded text-[8px] font-bold bg-slate-200 text-slate-700"
        >
          {isUnerupted ? "U" : "½"}
        </span>
      )}

      {/* Upper arch: Number -> Crown -> Surfaces -> Status chip */}
      {upper ? (
        <>
          <span className="text-[11px] font-bold text-[var(--df-text)] leading-none pt-0.5">
            {displayNumber}
          </span>
          <div className="my-0.5">{crownGraphic}</div>
          <div>{surfaceDiagram}</div>
          <div className="mt-1">{statusChips}</div>
        </>
      ) : (
        /* Lower arch: Status chip -> Surfaces -> Crown -> Number */
        <>
          <div className="mb-1">{statusChips}</div>
          <div>{surfaceDiagram}</div>
          <div className="my-0.5">{crownGraphic}</div>
          <span className="text-[11px] font-bold text-[var(--df-text)] leading-none pb-0.5">
            {displayNumber}
          </span>
        </>
      )}
    </div>
  );
}

/** Large crown & roots SVG drawing for the Selected-Tooth detail panel (Item 10). */
export function DetailedToothRootSvg({
  tooth,
  displayNumber,
  showRoots,
  onClickSurface,
}: {
  tooth: ToothChartRecord;
  displayNumber: string;
  showRoots: boolean;
  onClickSurface: (surface: ToothSurface) => void;
}) {
  const upper = isUpperArch(tooth.fdi);
  const category = getToothCategory(tooth.fdi);
  const layout = getSurfaceLayout(tooth.fdi);
  const isRct = tooth.conditions.includes("root_canal") || Boolean(tooth.rootFlags?.rctObturation);
  const hasApical = Boolean(tooth.rootFlags?.apicalLesion);
  const boneLevel = tooth.rootFlags?.boneLossLevel || "normal";

  const boneOffsetY =
    boneLevel === "severe"
      ? upper ? 52 : 98
      : boneLevel === "moderate"
      ? upper ? 62 : 88
      : boneLevel === "mild"
      ? upper ? 70 : 80
      : upper ? 76 : 74;

  const topSurf = getSurfaceFill(tooth.surfaceConditions[layout.top]);
  const bottomSurf = getSurfaceFill(tooth.surfaceConditions[layout.bottom]);
  const leftSurf = getSurfaceFill(tooth.surfaceConditions[layout.left]);
  const rightSurf = getSurfaceFill(tooth.surfaceConditions[layout.right]);
  const centerSurf = getSurfaceFill(tooth.surfaceConditions[layout.center]);

  return (
    <div className="flex items-center justify-around gap-3 p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)]">
      {/* Anatomic Crown + Roots SVG */}
      <svg viewBox="0 0 120 150" className="w-28 h-36 shrink-0" aria-label={`Anatomic view of tooth ${displayNumber}`}>
        {/* Alveolar bone level line when Show Roots is on */}
        {showRoots && (
          <>
            <line
              x1="8"
              y1={boneOffsetY}
              x2="112"
              y2={boneOffsetY}
              stroke="#0F766E"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text x="10" y={boneOffsetY - 4} fontSize="8" fill="#0F766E" fontWeight="700">
              Bone: {boneLevel}
            </text>
          </>
        )}

        {/* Roots drawing */}
        {showRoots && (
          <g>
            {category === "molar" ? (
              <path
                d={
                  upper
                    ? "M32 74 L24 22 Q34 14 44 58 L60 16 Q72 14 78 58 L92 22 Q100 26 88 74 Z"
                    : "M32 76 L26 128 Q38 136 56 94 L64 94 Q82 136 94 128 L88 76 Z"
                }
                fill="#F8FAFC"
                stroke="#64748B"
                strokeWidth="2"
              />
            ) : (
              <path
                d={
                  upper
                    ? "M38 74 Q50 14 60 12 Q70 14 82 74 Z"
                    : "M38 76 Q50 136 60 138 Q70 136 82 76 Z"
                }
                fill="#F8FAFC"
                stroke="#64748B"
                strokeWidth="2"
              />
            )}

            {/* RCT obturation canals */}
            {isRct && (
              <g stroke="#9333EA" strokeWidth="3.2" strokeLinecap="round">
                {category === "molar" ? (
                  <>
                    <line x1="39" y1={upper ? 26 : 82} x2="48" y2={upper ? 72 : 124} />
                    <line x1="60" y1={upper ? 22 : 82} x2="60" y2={upper ? 72 : 114} />
                    <line x1="81" y1={upper ? 26 : 82} x2="72" y2={upper ? 72 : 124} />
                  </>
                ) : (
                  <line x1="60" y1={upper ? 20 : 80} x2="60" y2={upper ? 74 : 130} />
                )}
              </g>
            )}

            {/* Apical lesion halo */}
            {hasApical && (
              <g>
                <circle
                  cx={category === "molar" ? 84 : 60}
                  cy={upper ? 22 : 128}
                  r="13"
                  fill="#FEE2E2"
                  fillOpacity="0.7"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                />
                <text
                  x={category === "molar" ? 84 : 60}
                  y={upper ? 25 : 131}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="800"
                  fill="#991B1B"
                >
                  AL
                </text>
              </g>
            )}
          </g>
        )}

        {/* Crown */}
        <path
          d={
            upper
              ? "M26 74 Q22 122 42 128 Q54 120 60 128 Q66 120 78 128 Q98 122 94 74 Q60 68 26 74 Z"
              : "M26 76 Q22 28 42 22 Q54 30 60 22 Q66 30 78 22 Q98 28 94 76 Q60 82 26 76 Z"
          }
          fill={tooth.conditions.includes("crown") ? "url(#df-pat-crown)" : "#FFFFFF"}
          stroke="#334155"
          strokeWidth="2.2"
        />
        <text
          x="60"
          y={upper ? 106 : 54}
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#18221E"
        >
          {displayNumber}
        </text>
      </svg>

      {/* Large Interactive 5-Surface Cross/Polygon */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
          Tap surface to paint
        </span>
        <svg viewBox="0 0 110 110" className="w-28 h-28" role="group" aria-label={`Interactive surfaces for tooth ${displayNumber}`}>
          <polygon
            points="5,5 105,5 80,30 30,30"
            fill={topSurf.fill}
            stroke={topSurf.stroke}
            strokeWidth="2"
            className="cursor-pointer hover:brightness-95"
            onClick={() => onClickSurface(layout.top)}
          />
          <polygon
            points="30,80 80,80 105,105 5,105"
            fill={bottomSurf.fill}
            stroke={bottomSurf.stroke}
            strokeWidth="2"
            className="cursor-pointer hover:brightness-95"
            onClick={() => onClickSurface(layout.bottom)}
          />
          <polygon
            points="5,5 30,30 30,80 5,105"
            fill={leftSurf.fill}
            stroke={leftSurf.stroke}
            strokeWidth="2"
            className="cursor-pointer hover:brightness-95"
            onClick={() => onClickSurface(layout.left)}
          />
          <polygon
            points="105,5 105,105 80,80 80,30"
            fill={rightSurf.fill}
            stroke={rightSurf.stroke}
            strokeWidth="2"
            className="cursor-pointer hover:brightness-95"
            onClick={() => onClickSurface(layout.right)}
          />
          <rect
            x="30"
            y="30"
            width="50"
            height="50"
            rx="4"
            fill={centerSurf.fill}
            stroke={centerSurf.stroke}
            strokeWidth="2"
            className="cursor-pointer hover:brightness-95"
            onClick={() => onClickSurface(layout.center)}
          />
          <text x="55" y="21" textAnchor="middle" fontSize="11" fontWeight="800" fill="#334155" className="pointer-events-none">
            {layout.top}
          </text>
          <text x="55" y="97" textAnchor="middle" fontSize="11" fontWeight="800" fill="#334155" className="pointer-events-none">
            {layout.bottom}
          </text>
          <text x="17" y="59" textAnchor="middle" fontSize="11" fontWeight="800" fill="#334155" className="pointer-events-none">
            {layout.left}
          </text>
          <text x="93" y="59" textAnchor="middle" fontSize="11" fontWeight="800" fill="#334155" className="pointer-events-none">
            {layout.right}
          </text>
          <text x="55" y="60" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0F172A" className="pointer-events-none">
            {layout.centerLabel}
          </text>
        </svg>
        <span className="text-[10px] text-[var(--df-text-muted)]">
          {layout.left === "M" ? "← Midline (M)" : "Midline (M) →"}
        </span>
      </div>
    </div>
  );
}
