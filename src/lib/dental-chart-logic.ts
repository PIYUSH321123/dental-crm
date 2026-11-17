import type {
  DentalNumberingSystem,
  DentitionView,
  EruptionState,
  PatientDentalChart,
  PerioSiteKey,
  PerioToothRecord,
  ToothChartRecord,
  ToothConditionCode,
  ToothSurface,
} from "../types/dentflow";
import {
  formatRelativeFullDate,
  getRelativeIsoTimestamp,
} from "./date-helpers.ts";

export const UPPER_RIGHT_PERMANENT = [18, 17, 16, 15, 14, 13, 12, 11] as const;
export const UPPER_LEFT_PERMANENT = [21, 22, 23, 24, 25, 26, 27, 28] as const;
export const LOWER_RIGHT_PERMANENT = [48, 47, 46, 45, 44, 43, 42, 41] as const;
export const LOWER_LEFT_PERMANENT = [31, 32, 33, 34, 35, 36, 37, 38] as const;

export const UPPER_RIGHT_PRIMARY = [55, 54, 53, 52, 51] as const;
export const UPPER_LEFT_PRIMARY = [61, 62, 63, 64, 65] as const;
export const LOWER_RIGHT_PRIMARY = [85, 84, 83, 82, 81] as const;
export const LOWER_LEFT_PRIMARY = [71, 72, 73, 74, 75] as const;

export const ALL_PERMANENT_FDI: number[] = [
  ...UPPER_RIGHT_PERMANENT,
  ...UPPER_LEFT_PERMANENT,
  ...LOWER_RIGHT_PERMANENT,
  ...LOWER_LEFT_PERMANENT,
];

export const ALL_PRIMARY_FDI: number[] = [
  ...UPPER_RIGHT_PRIMARY,
  ...UPPER_LEFT_PRIMARY,
  ...LOWER_RIGHT_PRIMARY,
  ...LOWER_LEFT_PRIMARY,
];

export const ALL_VALID_FDI: number[] = [...ALL_PERMANENT_FDI, ...ALL_PRIMARY_FDI];

/** Maps each primary tooth (51-85) to its permanent successor (11-45) for Mixed Dentition alignment. */
export const PRIMARY_TO_PERMANENT_SUCCESSOR: Record<number, number> = {
  55: 15, 54: 14, 53: 13, 52: 12, 51: 11,
  61: 21, 62: 22, 63: 23, 64: 24, 65: 25,
  85: 45, 84: 44, 83: 43, 82: 42, 81: 41,
  71: 31, 72: 32, 73: 33, 74: 34, 75: 35,
};

export const PERMANENT_TO_PRIMARY_PREDECESSOR: Record<number, number> = Object.fromEntries(
  Object.entries(PRIMARY_TO_PERMANENT_SUCCESSOR).map(([pri, perm]) => [perm, Number(pri)]),
);

export type ToothCategory = "molar" | "premolar" | "canine" | "incisor";

export interface ConditionMeta {
  code: ToothConditionCode;
  label: string;
  shortCode: string; // Always shown with colour so status never relies on colour alone
  shortcutKey?: string; // 1..9 keyboard shortcut
  scope: "surface" | "tooth" | "both";
  fill: string;
  stroke: string;
  badgeBg: string;
  badgeText: string;
  pattern: "none" | "hatch" | "dots" | "stripes" | "cross" | "zigzag" | "dashed";
}

export const TOOTH_CONDITIONS: ConditionMeta[] = [
  {
    code: "healthy",
    label: "Healthy",
    shortCode: "OK",
    shortcutKey: "1",
    scope: "both",
    fill: "#FFFFFF",
    stroke: "#94A3B8",
    badgeBg: "#F1F5F9",
    badgeText: "#334155",
    pattern: "none",
  },
  {
    code: "caries",
    label: "Caries",
    shortCode: "C",
    shortcutKey: "2",
    scope: "both",
    fill: "#FEE2E2",
    stroke: "#DC2626",
    badgeBg: "#FEE2E2",
    badgeText: "#B91C1C",
    pattern: "hatch",
  },
  {
    code: "filled",
    label: "Filled",
    shortCode: "F",
    shortcutKey: "3",
    scope: "both",
    fill: "#DBEAFE",
    stroke: "#2563EB",
    badgeBg: "#DBEAFE",
    badgeText: "#1D4ED8",
    pattern: "dots",
  },
  {
    code: "sealant",
    label: "Sealant",
    shortCode: "S",
    shortcutKey: "4",
    scope: "surface",
    fill: "#CFFAFE",
    stroke: "#0891B2",
    badgeBg: "#CFFAFE",
    badgeText: "#0E7490",
    pattern: "dots",
  },
  {
    code: "crown",
    label: "Crown",
    shortCode: "Cr",
    shortcutKey: "5",
    scope: "tooth",
    fill: "#FEF3C7",
    stroke: "#D97706",
    badgeBg: "#FEF3C7",
    badgeText: "#B45309",
    pattern: "stripes",
  },
  {
    code: "veneer",
    label: "Veneer",
    shortCode: "V",
    scope: "both",
    fill: "#E0E7FF",
    stroke: "#4F46E5",
    badgeBg: "#E0E7FF",
    badgeText: "#3730A3",
    pattern: "stripes",
  },
  {
    code: "bridge_pontic",
    label: "Bridge / Pontic",
    shortCode: "Br",
    scope: "tooth",
    fill: "#EDE9FE",
    stroke: "#7C3AED",
    badgeBg: "#EDE9FE",
    badgeText: "#6D28D9",
    pattern: "cross",
  },
  {
    code: "implant",
    label: "Implant",
    shortCode: "Im",
    shortcutKey: "6",
    scope: "tooth",
    fill: "#CCFBF1",
    stroke: "#0F766E",
    badgeBg: "#CCFBF1",
    badgeText: "#115E59",
    pattern: "stripes",
  },
  {
    code: "root_canal",
    label: "Root canal",
    shortCode: "RCT",
    shortcutKey: "7",
    scope: "tooth",
    fill: "#F3E8FF",
    stroke: "#9333EA",
    badgeBg: "#F3E8FF",
    badgeText: "#7E22CE",
    pattern: "cross",
  },
  {
    code: "fractured",
    label: "Fractured",
    shortCode: "Fx",
    scope: "both",
    fill: "#FFE4E6",
    stroke: "#BE123C",
    badgeBg: "#FFE4E6",
    badgeText: "#9F1239",
    pattern: "zigzag",
  },
  {
    code: "impacted",
    label: "Impacted",
    shortCode: "Imp",
    scope: "tooth",
    fill: "#FFEDD5",
    stroke: "#C2410C",
    badgeBg: "#FFEDD5",
    badgeText: "#9A3412",
    pattern: "hatch",
  },
  {
    code: "attrition",
    label: "Attrition",
    shortCode: "At",
    scope: "both",
    fill: "#F5F5F4",
    stroke: "#78716C",
    badgeBg: "#E7E5E4",
    badgeText: "#44403C",
    pattern: "stripes",
  },
  {
    code: "missing",
    label: "Missing",
    shortCode: "×",
    shortcutKey: "8",
    scope: "tooth",
    fill: "#F1F5F9",
    stroke: "#64748B",
    badgeBg: "#E2E8F0",
    badgeText: "#475569",
    pattern: "dashed",
  },
  {
    code: "extraction_planned",
    label: "Extraction planned",
    shortCode: "Ex",
    scope: "tooth",
    fill: "#FEE2E2",
    stroke: "#991B1B",
    badgeBg: "#FECACA",
    badgeText: "#7F1D1D",
    pattern: "cross",
  },
  {
    code: "planned",
    label: "Planned",
    shortCode: "P",
    shortcutKey: "9",
    scope: "both",
    fill: "#E3F3EE",
    stroke: "#146C58",
    badgeBg: "#E3F3EE",
    badgeText: "#0F5646",
    pattern: "dashed",
  },
];

export const CONDITION_BY_CODE: Record<ToothConditionCode, ConditionMeta> = Object.fromEntries(
  TOOTH_CONDITIONS.map((c) => [c.code, c]),
) as Record<ToothConditionCode, ConditionMeta>;

export function isPrimaryTooth(fdi: number): boolean {
  const q = Math.floor(fdi / 10);
  return q >= 5 && q <= 8;
}

export function isUpperArch(fdi: number): boolean {
  const q = Math.floor(fdi / 10);
  return q === 1 || q === 2 || q === 5 || q === 6;
}

export function isPatientRightSide(fdi: number): boolean {
  const q = Math.floor(fdi / 10);
  return q === 1 || q === 4 || q === 5 || q === 8;
}

export function getToothCategory(fdi: number): ToothCategory {
  const idx = fdi % 10;
  if (isPrimaryTooth(fdi)) {
    if (idx === 1 || idx === 2) return "incisor";
    if (idx === 3) return "canine";
    return "molar"; // primary 4 & 5 are primary molars
  }
  if (idx === 1 || idx === 2) return "incisor";
  if (idx === 3) return "canine";
  if (idx === 4 || idx === 5) return "premolar";
  return "molar";
}

export function isAnteriorTooth(fdi: number): boolean {
  const idx = fdi % 10;
  return idx >= 1 && idx <= 3;
}

export interface SurfaceOrientation {
  top: ToothSurface;
  bottom: ToothSurface;
  left: ToothSurface;
  right: ToothSurface;
  center: ToothSurface;
  centerLabel: "I" | "O";
  isUpper: boolean;
}

/**
 * Computes exact clinical surface orientation:
 * - Mesial (M) ALWAYS faces the midline (mirrored for left vs right quadrants).
 * - Upper arch: Buccal (B) on top, Lingual/Palatal (L) on bottom.
 * - Lower arch: Lingual (L) on top, Buccal (B) on bottom.
 * - Anteriors (1-3): center edge labeled "I" (Incisal); posteriors: "O" (Occlusal).
 */
export function getSurfaceLayout(fdi: number): SurfaceOrientation {
  const upper = isUpperArch(fdi);
  const patientRight = isPatientRightSide(fdi);
  return {
    top: upper ? "B" : "L",
    bottom: upper ? "L" : "B",
    left: patientRight ? "D" : "M",
    right: patientRight ? "M" : "D",
    center: "O",
    centerLabel: isAnteriorTooth(fdi) ? "I" : "O",
    isUpper: upper,
  };
}

export function getToothDisplayName(fdi: number): string {
  const q = Math.floor(fdi / 10);
  const idx = fdi % 10;
  const quadNames: Record<number, string> = {
    1: "Upper right",
    2: "Upper left",
    3: "Lower left",
    4: "Lower right",
    5: "Upper right primary",
    6: "Upper left primary",
    7: "Lower left primary",
    8: "Lower right primary",
  };
  const permNames: Record<number, string> = {
    1: "central incisor",
    2: "lateral incisor",
    3: "canine",
    4: "first premolar",
    5: "second premolar",
    6: "first molar",
    7: "second molar",
    8: "third molar",
  };
  const priNames: Record<number, string> = {
    1: "central incisor",
    2: "lateral incisor",
    3: "canine",
    4: "first molar",
    5: "second molar",
  };
  const base = quadNames[q] || "Tooth";
  const suffix = isPrimaryTooth(fdi) ? priNames[idx] || `${idx}` : permNames[idx] || `${idx}`;
  return `${base} ${suffix}`;
}

/** Converts an FDI tooth number (permanent 11-48 or primary 51-85) to FDI, Universal, or Palmer notation. */
export function formatToothNumber(fdi: number, system: DentalNumberingSystem): string {
  if (system === "FDI") return String(fdi);

  const q = Math.floor(fdi / 10);
  const idx = fdi % 10;

  if (system === "Universal") {
    if (q === 1) return String(19 - fdi); // 18->1 .. 11->8
    if (q === 2) return String(fdi - 12); // 21->9 .. 28->16
    if (q === 3) return String(55 - fdi); // 38->17 .. 31->24
    if (q === 4) return String(fdi - 16); // 41->25 .. 48->32
    // Primary A-T
    if (q === 5) return String.fromCharCode(65 + (5 - idx)); // 55->A .. 51->E
    if (q === 6) return String.fromCharCode(70 + (idx - 1)); // 61->F .. 65->J
    if (q === 7) return String.fromCharCode(75 + (5 - idx)); // 75->K .. 71->O
    if (q === 8) return String.fromCharCode(80 + (idx - 1)); // 81->P .. 85->T
    return String(fdi);
  }

  // Palmer notation
  const symbol = isPrimaryTooth(fdi)
    ? String.fromCharCode(64 + idx) // 1->A .. 5->E
    : String(idx);
  if (q === 1 || q === 5) return `${symbol}┘`; // Upper Right
  if (q === 2 || q === 6) return `└${symbol}`; // Upper Left
  if (q === 3 || q === 7) return `┌${symbol}`; // Lower Left
  if (q === 4 || q === 8) return `${symbol}┐`; // Lower Right
  return String(fdi);
}

export function createHealthyTooth(fdi: number): ToothChartRecord {
  return {
    fdi,
    conditions: [],
    surfaceConditions: {},
    eruptionState: "erupted",
    plannedProcedures: [],
  };
}

/** Returns all unique non-healthy conditions present on a tooth (whole-tooth + surfaces). */
export function getAllToothConditions(tooth: ToothChartRecord): ToothConditionCode[] {
  const set = new Set<ToothConditionCode>();
  for (const c of tooth.conditions) {
    if (c !== "healthy") set.add(c);
  }
  for (const surf of Object.values(tooth.surfaceConditions)) {
    if (surf && surf !== "healthy") set.add(surf);
  }
  return Array.from(set);
}

/** Primary display condition for badge/border priority when multiple conditions coexist. */
export function getPrimaryToothCondition(tooth: ToothChartRecord): ToothConditionCode {
  const all = getAllToothConditions(tooth);
  if (all.length === 0) return "healthy";
  const priority: ToothConditionCode[] = [
    "missing",
    "extraction_planned",
    "impacted",
    "implant",
    "bridge_pontic",
    "fractured",
    "caries",
    "root_canal",
    "crown",
    "veneer",
    "planned",
    "filled",
    "sealant",
    "attrition",
  ];
  for (const p of priority) {
    if (all.includes(p)) return p;
  }
  return all[0];
}

/** Applies a whole-tooth condition (or clears tooth if "healthy"). Supports multi-condition coexistence. */
export function applyConditionToTooth(
  tooth: ToothChartRecord,
  condition: ToothConditionCode,
  actor?: string,
): ToothChartRecord {
  const nowIso = new Date().toISOString();
  if (condition === "healthy") {
    return {
      ...tooth,
      conditions: [],
      surfaceConditions: {},
      rootFlags: { ...tooth.rootFlags, rctObturation: false, apicalLesion: false },
      updatedAt: nowIso,
      updatedBy: actor,
    };
  }

  // Missing clears surface conditions since tooth is absent
  if (condition === "missing") {
    return {
      ...tooth,
      conditions: ["missing"],
      surfaceConditions: {},
      updatedAt: nowIso,
      updatedBy: actor,
    };
  }

  const nextConditions = tooth.conditions.filter((c) => c !== "healthy" && c !== "missing");
  if (!nextConditions.includes(condition)) {
    nextConditions.push(condition);
  }

  return {
    ...tooth,
    conditions: nextConditions,
    rootFlags:
      condition === "root_canal"
        ? { ...tooth.rootFlags, rctObturation: true }
        : tooth.rootFlags,
    updatedAt: nowIso,
    updatedBy: actor,
  };
}

/** Removes a single condition from whole-tooth and any surfaces carrying it. */
export function removeConditionFromTooth(
  tooth: ToothChartRecord,
  condition: ToothConditionCode,
  actor?: string,
): ToothChartRecord {
  const nextSurfaces: Partial<Record<ToothSurface, ToothConditionCode>> = {};
  for (const [k, v] of Object.entries(tooth.surfaceConditions) as [
    ToothSurface,
    ToothConditionCode,
  ][]) {
    if (v !== condition) nextSurfaces[k] = v;
  }
  return {
    ...tooth,
    conditions: tooth.conditions.filter((c) => c !== condition),
    surfaceConditions: nextSurfaces,
    rootFlags:
      condition === "root_canal"
        ? { ...tooth.rootFlags, rctObturation: false }
        : tooth.rootFlags,
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
  };
}

/** Paints or toggles a condition on a specific tooth surface (supports multi-condition: e.g. caries on D, filled on O). */
export function toggleSurfaceCondition(
  tooth: ToothChartRecord,
  surface: ToothSurface,
  condition: ToothConditionCode,
  actor?: string,
): ToothChartRecord {
  const nowIso = new Date().toISOString();
  const nextSurfaces = { ...tooth.surfaceConditions };

  if (condition === "healthy") {
    delete nextSurfaces[surface];
  } else if (nextSurfaces[surface] === condition) {
    delete nextSurfaces[surface];
  } else {
    nextSurfaces[surface] = condition;
  }

  // Ensure tooth is no longer marked missing when painting a surface
  const cleanedWhole = tooth.conditions.filter((c) => c !== "missing" && c !== "healthy");

  return {
    ...tooth,
    conditions: cleanedWhole,
    surfaceConditions: nextSurfaces,
    updatedAt: nowIso,
    updatedBy: actor,
  };
}

export function setToothEruptionState(
  tooth: ToothChartRecord,
  eruptionState: EruptionState,
  actor?: string,
): ToothChartRecord {
  return {
    ...tooth,
    eruptionState,
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
  };
}

export interface ChartSummaryCounts {
  byCondition: Partial<Record<ToothConditionCode, number>>;
  plannedProceduresCount: number;
  plannedProceduresTotalFee: number;
}

export function computeChartSummary(
  teeth: Record<number, ToothChartRecord>,
  dentitionView: DentitionView,
): ChartSummaryCounts {
  const activeFdis =
    dentitionView === "child"
      ? ALL_PRIMARY_FDI
      : dentitionView === "mixed"
      ? ALL_VALID_FDI
      : ALL_PERMANENT_FDI;

  const byCondition: Partial<Record<ToothConditionCode, number>> = {};
  let plannedProceduresCount = 0;
  let plannedProceduresTotalFee = 0;

  for (const fdi of activeFdis) {
    const tooth = teeth[fdi];
    if (!tooth) continue;
    const conds = getAllToothConditions(tooth);
    for (const c of conds) {
      byCondition[c] = (byCondition[c] || 0) + 1;
    }
    plannedProceduresCount += tooth.plannedProcedures.length;
    for (const proc of tooth.plannedProcedures) {
      plannedProceduresTotalFee += proc.fee || 0;
    }
  }

  return { byCondition, plannedProceduresCount, plannedProceduresTotalFee };
}

export interface ToothDiffEntry {
  fdi: number;
  previousConditions: ToothConditionCode[];
  currentConditions: ToothConditionCode[];
  added: ToothConditionCode[];
  removed: ToothConditionCode[];
  surfaceChanges: string[];
  changedBy?: string;
}

/** Compares a baseline chart snapshot against the current chart state. */
export function diffCharts(
  baseline: Record<number, ToothChartRecord>,
  current: Record<number, ToothChartRecord>,
): ToothDiffEntry[] {
  const diffs: ToothDiffEntry[] = [];
  const fdiSet = new Set<number>([
    ...Object.keys(baseline).map(Number),
    ...Object.keys(current).map(Number),
  ]);

  for (const fdi of Array.from(fdiSet).sort((a, b) => a - b)) {
    const prev = baseline[fdi] || createHealthyTooth(fdi);
    const curr = current[fdi] || createHealthyTooth(fdi);

    const prevConds = getAllToothConditions(prev);
    const currConds = getAllToothConditions(curr);

    const added = currConds.filter((c) => !prevConds.includes(c));
    const removed = prevConds.filter((c) => !currConds.includes(c));

    const surfaceChanges: string[] = [];
    for (const surf of ["B", "M", "O", "D", "L"] as ToothSurface[]) {
      const pVal = prev.surfaceConditions[surf];
      const cVal = curr.surfaceConditions[surf];
      if (pVal !== cVal) {
        surfaceChanges.push(
          `${surf}: ${pVal || "healthy"} → ${cVal || "healthy"}`,
        );
      }
    }

    if (added.length > 0 || removed.length > 0 || surfaceChanges.length > 0) {
      diffs.push({
        fdi,
        previousConditions: prevConds,
        currentConditions: currConds,
        added,
        removed,
        surfaceChanges,
        changedBy: curr.updatedBy,
      });
    }
  }

  return diffs;
}

export const PERIO_SITES: PerioSiteKey[] = ["MB", "B", "DB", "ML", "L", "DL"];

export function createEmptyPerioTooth(fdi: number): PerioToothRecord {
  return {
    fdi,
    pocketDepth: { MB: null, B: null, DB: null, ML: null, L: null, DL: null },
    recession: { MB: null, B: null, DB: null, ML: null, L: null, DL: null },
    bleeding: { MB: false, B: false, DB: false, ML: false, L: false, DL: false },
    mobility: 0,
    furcation: 0,
  };
}

/** Builds a rich initial PatientDentalChart for Priya Deshmukh or any patient without a persisted chart yet. */
export function createSeedDentalChart(patientId: string, patientAge = 34): PatientDentalChart {
  const teeth: Record<number, ToothChartRecord> = {};
  for (const fdi of ALL_VALID_FDI) {
    teeth[fdi] = createHealthyTooth(fdi);
  }

  const perioCurrent: Record<number, PerioToothRecord> = {};
  const perioBaseline: Record<number, PerioToothRecord> = {};
  for (const fdi of ALL_PERMANENT_FDI) {
    const rec = createEmptyPerioTooth(fdi);
    const base = createEmptyPerioTooth(fdi);
    const missing = fdi === 18 || fdi === 28 || fdi === 38 || fdi === 48;
    if (!missing) {
      for (const s of PERIO_SITES) {
        rec.pocketDepth[s] = 2;
        rec.recession[s] = 0;
        base.pocketDepth[s] = 2;
        base.recession[s] = 0;
      }
    } else {
      rec.mobility = null;
      rec.furcation = null;
      base.mobility = null;
      base.furcation = null;
    }
    perioCurrent[fdi] = rec;
    perioBaseline[fdi] = base;
  }

  if (patientId === "pat-priya") {
    teeth[18] = { ...createHealthyTooth(18), conditions: ["missing"] };
    teeth[28] = { ...createHealthyTooth(28), conditions: ["missing"] };
    teeth[38] = { ...createHealthyTooth(38), conditions: ["missing"] };
    teeth[48] = { ...createHealthyTooth(48), conditions: ["missing"] };

    teeth[16] = {
      ...createHealthyTooth(16),
      surfaceConditions: { O: "filled" },
      finding: "Intact occlusal composite restoration.",
      updatedBy: "Dr. Sneha Kulkarni",
    };
    teeth[14] = {
      ...createHealthyTooth(14),
      conditions: ["planned"],
      surfaceConditions: { M: "caries" },
      finding: "Incipient mesial caries — composite filling planned.",
      plannedProcedures: [{ id: "pp-14-1", name: "Composite filling (mesial)", fee: 1800 }],
      updatedBy: "Dr. Sneha Kulkarni",
    };
    teeth[25] = {
      ...createHealthyTooth(25),
      conditions: ["root_canal", "crown"],
      rootFlags: { rctObturation: true, apicalLesion: false, boneLossLevel: "normal" },
      finding: "Completed RCT with intact PFM crown.",
      updatedBy: "Dr. Sneha Kulkarni",
    };
    teeth[26] = {
      ...createHealthyTooth(26),
      surfaceConditions: { O: "filled", M: "filled" },
      finding: "MO amalgam/composite restoration intact.",
      updatedBy: "Dr. Sneha Kulkarni",
    };
    teeth[46] = {
      ...createHealthyTooth(46),
      conditions: ["crown"],
      finding: "Zirconia full-coverage crown, good margins.",
      updatedBy: "Dr. Sneha Kulkarni",
    };
    teeth[36] = {
      ...createHealthyTooth(36),
      conditions: ["caries", "planned"],
      surfaceConditions: { O: "caries", D: "caries" },
      finding: "Deep disto-occlusal caries, tender on percussion. IOPA shows radiolucency close to distal pulp horn.",
      rootFlags: { rctObturation: false, apicalLesion: true, boneLossLevel: "mild" },
      plannedProcedures: [
        { id: "pp-36-1", name: "Root canal treatment (molar)", fee: 8000 },
        { id: "pp-36-2", name: "Zirconia crown (5-yr warranty)", fee: 14500 },
      ],
      updatedBy: "Dr. Sneha Kulkarni",
    };
    teeth[37] = {
      ...createHealthyTooth(37),
      surfaceConditions: { O: "filled" },
      finding: "Intact occlusal composite restoration.",
      updatedBy: "Dr. Sneha Kulkarni",
    };

    // Perio findings on lower-left + posterior pockets
    perioCurrent[36] = {
      fdi: 36,
      pocketDepth: { MB: 3, B: 3, DB: 5, ML: 3, L: 4, DL: 6 },
      recession: { MB: 0, B: 1, DB: 1, ML: 0, L: 0, DL: 1 },
      bleeding: { MB: false, B: false, DB: true, ML: false, L: false, DL: true },
      mobility: 1,
      furcation: 1,
    };
    perioBaseline[36] = {
      fdi: 36,
      pocketDepth: { MB: 3, B: 2, DB: 4, ML: 3, L: 3, DL: 4 },
      recession: { MB: 0, B: 0, DB: 1, ML: 0, L: 0, DL: 0 },
      bleeding: { MB: false, B: false, DB: false, ML: false, L: false, DL: true },
      mobility: 0,
      furcation: 0,
    };
    perioCurrent[37].pocketDepth = { MB: 3, B: 3, DB: 3, ML: 3, L: 3, DL: 4 };
    perioCurrent[34].pocketDepth = { MB: 3, B: 2, DB: 3, ML: 2, L: 2, DL: 3 };
    perioCurrent[34].bleeding.DB = true;
    perioCurrent[32].pocketDepth = { MB: 3, B: 4, DB: 3, ML: 2, L: 3, DL: 2 };
    perioCurrent[31].bleeding.L = true;
  }

  // Baseline history snapshot (6 months earlier) so "Compare with <date>" works out of the box
  const baselineTeeth: Record<number, ToothChartRecord> = JSON.parse(JSON.stringify(teeth));
  if (patientId === "pat-priya") {
    baselineTeeth[36] = {
      ...createHealthyTooth(36),
      surfaceConditions: { D: "caries" },
      finding: "Moderate distal caries monitored at routine check-up.",
      updatedBy: "Dr. Arjun Mehta",
    };
    baselineTeeth[14] = createHealthyTooth(14);
  }

  const defaultView: DentitionView =
    patientAge <= 6 ? "child" : patientAge <= 12 ? "mixed" : "adult";

  const recentChartDate = formatRelativeFullDate(-14);
  const recentChartIso = getRelativeIsoTimestamp(-14, 11, 30);
  const recentAnnotIso = getRelativeIsoTimestamp(-14, 11, 35);
  const sixMonthDate = formatRelativeFullDate(-180);
  const sixMonthIso = getRelativeIsoTimestamp(-180, 10, 15);
  const sixMonthPerioIso = getRelativeIsoTimestamp(-180, 10, 20);
  const bitewingDate = formatRelativeFullDate(-178);

  return {
    patientId,
    lastDentitionView: defaultView,
    lastChartedLabel: recentChartDate,
    lastChartedBy: "Dr. Sneha Kulkarni",
    teeth,
    history: [
      {
        id: `hist-${patientId}-1`,
        dateLabel: sixMonthDate,
        recordedAt: sixMonthIso,
        recordedBy: "Dr. Arjun Mehta",
        note: "6-month routine check-up baseline",
        teeth: baselineTeeth,
      },
      {
        id: `hist-${patientId}-2`,
        dateLabel: recentChartDate,
        recordedAt: recentChartIso,
        recordedBy: "Dr. Sneha Kulkarni",
        note: "Pre-RCT charting & IOPA 36 review",
        teeth: JSON.parse(JSON.stringify(teeth)),
      },
    ],
    perioCurrent,
    perioHistory: [
      {
        id: `perio-hist-${patientId}-1`,
        dateLabel: sixMonthDate,
        recordedAt: sixMonthPerioIso,
        recordedBy: "Dr. Arjun Mehta",
        teeth: perioBaseline,
      },
    ],
    imaging:
      patientId === "pat-priya"
        ? [
            {
              id: "iopa-36",
              title: "IOPA · 36",
              modality: "IOPA",
              date: recentChartDate,
              linkedTeeth: [36, 37],
              annotations: [
                {
                  id: "ann-1",
                  xPct: 54,
                  yPct: 36,
                  label: "36 OD deep caries near distal pulp horn",
                  toothFdi: 36,
                  createdBy: "Dr. Sneha Kulkarni",
                  createdAt: recentAnnotIso,
                },
              ],
            },
            {
              id: "opg-1",
              title: "OPG Full Arch",
              modality: "OPG",
              date: recentChartDate,
              linkedTeeth: [16, 25, 36, 46],
              annotations: [],
            },
            {
              id: "bw-l",
              title: "Bitewing Left",
              modality: "Bitewing",
              date: bitewingDate,
              linkedTeeth: [25, 26, 36, 37],
              annotations: [],
            },
          ]
        : [
            {
              id: `opg-${patientId}`,
              title: "Baseline OPG",
              modality: "OPG",
              date: recentChartDate,
              linkedTeeth: [16, 26, 36, 46],
              annotations: [],
            },
          ],
  };
}
