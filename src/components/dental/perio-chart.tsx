"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, History, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import {
  createEmptyPerioTooth,
  formatToothNumber,
  LOWER_LEFT_PERMANENT,
  LOWER_RIGHT_PERMANENT,
  PERIO_SITES,
  UPPER_LEFT_PERMANENT,
  UPPER_RIGHT_PERMANENT,
} from "@/lib/dental-chart-logic";
import {
  DentalNumberingSystem,
  PerioSiteKey,
  PerioSnapshot,
  PerioToothRecord,
} from "@/types/dentflow";

const QUADRANTS: { id: "Q1" | "Q2" | "Q3" | "Q4"; label: string; fdis: number[] }[] = [
  { id: "Q1", label: "Upper Right (Q1)", fdis: [...UPPER_RIGHT_PERMANENT] },
  { id: "Q2", label: "Upper Left (Q2)", fdis: [...UPPER_LEFT_PERMANENT] },
  { id: "Q4", label: "Lower Right (Q4)", fdis: [...LOWER_RIGHT_PERMANENT] },
  { id: "Q3", label: "Lower Left (Q3)", fdis: [...LOWER_LEFT_PERMANENT] },
];

const BUCCAL_SITES: PerioSiteKey[] = ["MB", "B", "DB"];
const LINGUAL_SITES: PerioSiteKey[] = ["ML", "L", "DL"];
const ROMAN_GRADES = ["0", "I", "II", "III"] as const;

const VOICE_FLAG_ENABLED = process.env.NEXT_PUBLIC_PERIO_VOICE === "true";

const SPOKEN_DIGITS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

export interface PerioChartProps {
  perioCurrent: Record<number, PerioToothRecord>;
  perioHistory: PerioSnapshot[];
  numberingSystem: DentalNumberingSystem;
  missingFdis: number[];
  onUpdatePerioTooth: (fdi: number, updated: PerioToothRecord, summaryDetail: string) => void;
}

export function PerioChart({
  perioCurrent,
  perioHistory,
  numberingSystem,
  missingFdis,
  onUpdatePerioTooth,
}: PerioChartProps) {
  const [activeQuadId, setActiveQuadId] = useState<(typeof QUADRANTS)[number]["id"]>("Q3");
  const [activeFdi, setActiveFdi] = useState<number>(36);
  const [activeSite, setActiveSite] = useState<PerioSiteKey>("DB");
  const [entryMode, setEntryMode] = useState<"pocketDepth" | "recession">("pocketDepth");
  const [compareBaseline, setCompareBaseline] = useState<boolean>(false);
  const [voiceListening, setVoiceListening] = useState<boolean>(false);

  const activeQuad = useMemo(
    () => QUADRANTS.find((q) => q.id === activeQuadId) || QUADRANTS[3],
    [activeQuadId],
  );
  const baseline = perioHistory[0] || null;

  const getRecord = (fdi: number): PerioToothRecord =>
    perioCurrent[fdi] || createEmptyPerioTooth(fdi);

  // Full-mouth summary stats
  const stats = useMemo(() => {
    let deepSites = 0;
    let bopSites = 0;
    let totalProbed = 0;
    let worsenedSites = 0;

    for (const q of QUADRANTS) {
      for (const fdi of q.fdis) {
        if (missingFdis.includes(fdi)) continue;
        const rec = perioCurrent[fdi];
        const baseRec = baseline?.teeth?.[fdi];
        if (!rec) continue;
        for (const site of PERIO_SITES) {
          const pd = rec.pocketDepth[site];
          if (typeof pd === "number") {
            totalProbed += 1;
            if (pd >= 5) deepSites += 1;
            const prevPd = baseRec?.pocketDepth?.[site];
            if (typeof prevPd === "number" && pd > prevPd) worsenedSites += 1;
          }
          if (rec.bleeding[site]) bopSites += 1;
        }
      }
    }
    const bopPct = totalProbed > 0 ? Math.round((bopSites / totalProbed) * 100) : 0;
    return { deepSites, bopSites, bopPct, worsenedSites };
  }, [perioCurrent, baseline, missingFdis]);

  const advanceCursor = (step: 1 | -1) => {
    const siteIdx = PERIO_SITES.indexOf(activeSite);
    const toothIdx = activeQuad.fdis.indexOf(activeFdi);
    if (step === 1) {
      if (siteIdx < PERIO_SITES.length - 1) {
        setActiveSite(PERIO_SITES[siteIdx + 1]);
      } else {
        // Advance to next non-missing tooth in quadrant
        for (let i = toothIdx + 1; i < activeQuad.fdis.length; i++) {
          if (!missingFdis.includes(activeQuad.fdis[i])) {
            setActiveFdi(activeQuad.fdis[i]);
            setActiveSite(PERIO_SITES[0]);
            return;
          }
        }
      }
    } else {
      if (siteIdx > 0) {
        setActiveSite(PERIO_SITES[siteIdx - 1]);
      } else {
        for (let i = toothIdx - 1; i >= 0; i--) {
          if (!missingFdis.includes(activeQuad.fdis[i])) {
            setActiveFdi(activeQuad.fdis[i]);
            setActiveSite(PERIO_SITES[PERIO_SITES.length - 1]);
            return;
          }
        }
      }
    }
  };

  const applyKeypadValue = (val: number | null) => {
    if (missingFdis.includes(activeFdi)) {
      toast.info(`Tooth ${formatToothNumber(activeFdi, numberingSystem)} is marked missing.`);
      return;
    }
    const cur = getRecord(activeFdi);
    const updated: PerioToothRecord = {
      ...cur,
      [entryMode]: {
        ...cur[entryMode],
        [activeSite]: val,
      },
    };
    const metricLabel = entryMode === "pocketDepth" ? "pocket depth" : "recession";
    onUpdatePerioTooth(
      activeFdi,
      updated,
      `Tooth ${formatToothNumber(activeFdi, numberingSystem)} ${activeSite} ${metricLabel} set to ${val ?? "cleared"}mm`,
    );
    advanceCursor(1);
  };

  const toggleBop = (fdi: number, site: PerioSiteKey) => {
    if (missingFdis.includes(fdi)) return;
    const cur = getRecord(fdi);
    const nextVal = !cur.bleeding[site];
    const updated: PerioToothRecord = {
      ...cur,
      bleeding: { ...cur.bleeding, [site]: nextVal },
    };
    onUpdatePerioTooth(
      fdi,
      updated,
      `Tooth ${formatToothNumber(fdi, numberingSystem)} ${site} BoP ${nextVal ? "positive" : "cleared"}`,
    );
  };

  const cycleGrade = (fdi: number, field: "mobility" | "furcation") => {
    if (missingFdis.includes(fdi)) return;
    const cur = getRecord(fdi);
    const prevGrade = cur[field] ?? 0;
    const nextGrade = ((prevGrade + 1) % 4) as 0 | 1 | 2 | 3;
    const updated: PerioToothRecord = { ...cur, [field]: nextGrade };
    onUpdatePerioTooth(
      fdi,
      updated,
      `Tooth ${formatToothNumber(fdi, numberingSystem)} ${field} set to Grade ${ROMAN_GRADES[nextGrade]}`,
    );
  };

  // Optional feature-flagged Web Speech API voice entry hook
  const handleToggleVoiceEntry = () => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (!SpeechRec) {
      toast.error("Browser SpeechRecognition API not available in this browser.");
      return;
    }

    if (voiceListening) {
      setVoiceListening(false);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    setVoiceListening(true);
    toast.info("Voice perio entry active — speak pocket depths (e.g. '3 2 5 bleeding')");

    recognition.onresult = (event: any) => {
      const transcript = String(event.results?.[0]?.[0]?.transcript || "").toLowerCase();
      const tokens = transcript.split(/\s+/);
      let siteCursor = PERIO_SITES.indexOf(activeSite);
      const cur = getRecord(activeFdi);
      const nextPockets = { ...cur.pocketDepth };
      const nextBop = { ...cur.bleeding };
      let changed = false;

      for (const tok of tokens) {
        if (tok.includes("bleed") || tok === "bop") {
          const prevSite = PERIO_SITES[Math.max(0, siteCursor - 1)];
          nextBop[prevSite] = true;
          changed = true;
          continue;
        }
        const parsed = /^\d+$/.test(tok) ? Number(tok) : SPOKEN_DIGITS[tok];
        if (typeof parsed === "number" && parsed >= 0 && parsed <= 15 && siteCursor < PERIO_SITES.length) {
          nextPockets[PERIO_SITES[siteCursor]] = parsed;
          siteCursor += 1;
          changed = true;
        }
      }

      if (changed) {
        onUpdatePerioTooth(
          activeFdi,
          { ...cur, pocketDepth: nextPockets, bleeding: nextBop },
          `Voice perio entry on tooth ${formatToothNumber(activeFdi, numberingSystem)}: "${transcript}"`,
        );
        toast.success(`Recorded voice perio: "${transcript}"`);
      }
      setVoiceListening(false);
    };

    recognition.onerror = () => setVoiceListening(false);
    recognition.onend = () => setVoiceListening(false);
    recognition.start();
  };

  const renderSiteGroupRow = (
    label: string,
    sites: PerioSiteKey[],
    field: "pocketDepth" | "recession",
  ) => (
    <tr className="border-b border-[var(--df-border)]">
      <td className="py-2 pr-3 font-semibold text-[var(--df-text-secondary)] whitespace-nowrap text-xs">
        {label}
      </td>
      {activeQuad.fdis.map((fdi) => {
        const isMissing = missingFdis.includes(fdi);
        const rec = getRecord(fdi);
        const baseRec = baseline?.teeth?.[fdi];
        return (
          <td key={fdi} className="py-1.5 px-1 border-l border-[var(--df-border)]/60">
            {isMissing ? (
              <div className="text-center text-[11px] text-[var(--df-text-muted)]">—</div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {sites.map((site) => {
                  const val = rec[field][site];
                  const baseVal = baseRec?.[field]?.[site];
                  const delta =
                    compareBaseline &&
                    field === "pocketDepth" &&
                    typeof val === "number" &&
                    typeof baseVal === "number"
                      ? val - baseVal
                      : 0;
                  const isDeep = field === "pocketDepth" && typeof val === "number" && val >= 5;
                  const isActiveCell =
                    activeFdi === fdi && activeSite === site && entryMode === field;

                  return (
                    <button
                      key={site}
                      type="button"
                      onClick={() => {
                        setActiveFdi(fdi);
                        setActiveSite(site);
                        setEntryMode(field);
                      }}
                      title={`Tooth ${formatToothNumber(fdi, numberingSystem)} · ${site} ${label}: ${val ?? "—"} mm`}
                      className={`relative flex flex-col items-center justify-center rounded py-1 text-xs font-mono font-bold cursor-pointer transition-all ${
                        isDeep
                          ? "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)] border border-[var(--df-status-red-border)]"
                          : "bg-[var(--df-surface-muted)]/60 text-[var(--df-text)] hover:bg-[var(--df-surface-hover)]"
                      } ${isActiveCell ? "ring-2 ring-[var(--df-teal)] z-10" : ""}`}
                    >
                      <span className="text-[8px] font-sans font-semibold opacity-65 leading-none">
                        {site}
                      </span>
                      <span className="leading-tight mt-0.5">
                        {val !== null && val !== undefined ? val : "·"}
                      </span>
                      {delta !== 0 && (
                        <span
                          className={`text-[8px] leading-none font-bold ${
                            delta > 0 ? "text-red-700" : "text-green-700"
                          }`}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );

  const renderBopRow = (label: string, sites: PerioSiteKey[]) => (
    <tr className="border-b border-[var(--df-border)]">
      <td className="py-1.5 pr-3 font-semibold text-[var(--df-text-muted)] whitespace-nowrap text-xs">
        {label}
      </td>
      {activeQuad.fdis.map((fdi) => {
        const isMissing = missingFdis.includes(fdi);
        const rec = getRecord(fdi);
        return (
          <td key={fdi} className="py-1 px-1 border-l border-[var(--df-border)]/60">
            {isMissing ? (
              <div className="text-center text-[11px] text-[var(--df-text-muted)]">—</div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {sites.map((site) => {
                  const hasBop = Boolean(rec.bleeding[site]);
                  return (
                    <button
                      key={site}
                      type="button"
                      aria-label={`Toggle bleeding on probing tooth ${formatToothNumber(fdi, numberingSystem)} ${site}`}
                      onClick={() => toggleBop(fdi, site)}
                      className={`h-6 rounded flex items-center justify-center cursor-pointer transition-colors ${
                        hasBop
                          ? "bg-red-100 border border-red-300"
                          : "bg-transparent hover:bg-[var(--df-surface-hover)]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          hasBop ? "bg-red-600" : "bg-[var(--df-border-strong)]/60"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="space-y-4">
      {/* Top Perio Summary & Quadrant Switcher */}
      <div className="df-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {QUADRANTS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setActiveQuadId(q.id);
                  const firstPresent = q.fdis.find((f) => !missingFdis.includes(f)) || q.fdis[0];
                  setActiveFdi(firstPresent);
                  setActiveSite("MB");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeQuadId === q.id
                    ? "bg-[var(--df-sidebar-bg)] text-white"
                    : "bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)] border border-[var(--df-status-red-border)]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Sites ≥ 5 mm: {stats.deepSites}
            </span>
            <span className="px-2.5 py-1 rounded-full font-semibold bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)]">
              BoP: {stats.bopPct}% ({stats.bopSites} sites)
            </span>
            {baseline && (
              <button
                type="button"
                onClick={() => setCompareBaseline((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                  compareBaseline
                    ? "bg-[var(--df-alert-amber-bg)] text-[var(--df-status-amber-text)] border-[var(--df-status-amber-border)]"
                    : "bg-[var(--df-surface)] text-[var(--df-text-secondary)] border-[var(--df-border)]"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>
                  {compareBaseline
                    ? `Comparing vs ${baseline.dateLabel} (${stats.worsenedSites} deepened)`
                    : `Compare vs ${baseline.dateLabel}`}
                </span>
              </button>
            )}
            {VOICE_FLAG_ENABLED && (
              <button
                type="button"
                onClick={handleToggleVoiceEntry}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                  voiceListening
                    ? "bg-red-600 text-white border-red-600 animate-pulse"
                    : "df-btn-secondary"
                }`}
              >
                {voiceListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                <span>{voiceListening ? "Listening..." : "Voice entry"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Fast Numeric Keypad Entry Bar */}
        <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[var(--df-teal)]">
              Active: Tooth {formatToothNumber(activeFdi, numberingSystem)} · {activeSite}
            </span>
            <div className="inline-flex rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] p-0.5">
              <button
                type="button"
                onClick={() => setEntryMode("pocketDepth")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  entryMode === "pocketDepth" ? "bg-[var(--df-teal)] text-white" : "text-[var(--df-text-secondary)]"
                }`}
              >
                Pocket (mm)
              </button>
              <button
                type="button"
                onClick={() => setEntryMode("recession")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  entryMode === "recession" ? "bg-[var(--df-teal)] text-white" : "text-[var(--df-text-secondary)]"
                }`}
              >
                Recession (mm)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              aria-label="Previous site"
              onClick={() => advanceCursor(-1)}
              className="p-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => applyKeypadValue(num)}
                className={`h-8 min-w-8 px-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-colors ${
                  entryMode === "pocketDepth" && num >= 5
                    ? "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)] border-[var(--df-status-red-border)] hover:brightness-95"
                    : "bg-[var(--df-surface)] text-[var(--df-text)] border-[var(--df-border)] hover:border-[var(--df-teal)]"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => toggleBop(activeFdi, activeSite)}
              className="h-8 px-2.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 cursor-pointer"
            >
              BoP
            </button>
            <button
              type="button"
              aria-label="Next site"
              onClick={() => advanceCursor(1)}
              className="p-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Full 6-Site Table for Active Quadrant */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--df-border)] bg-[var(--df-surface-muted)]">
                <th className="py-2 pr-3 text-left font-bold text-[var(--df-text-muted)] uppercase text-[10.5px]">
                  6-Site Parameter
                </th>
                {activeQuad.fdis.map((fdi) => (
                  <th
                    key={fdi}
                    className={`py-2 px-1 text-center font-bold border-l border-[var(--df-border)]/60 ${
                      activeFdi === fdi
                        ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)]"
                        : "text-[var(--df-text)]"
                    }`}
                  >
                    {formatToothNumber(fdi, numberingSystem)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderSiteGroupRow("Buccal Pocket (mm)", BUCCAL_SITES, "pocketDepth")}
              {renderSiteGroupRow("Buccal Recession (mm)", BUCCAL_SITES, "recession")}
              {renderBopRow("Buccal BoP", BUCCAL_SITES)}
              {renderSiteGroupRow("Lingual Pocket (mm)", LINGUAL_SITES, "pocketDepth")}
              {renderSiteGroupRow("Lingual Recession (mm)", LINGUAL_SITES, "recession")}
              {renderBopRow("Lingual BoP", LINGUAL_SITES)}

              {/* Mobility Row */}
              <tr className="border-b border-[var(--df-border)]">
                <td className="py-2 pr-3 font-semibold text-[var(--df-text-secondary)] whitespace-nowrap">
                  Mobility (0–III)
                </td>
                {activeQuad.fdis.map((fdi) => {
                  const isMissing = missingFdis.includes(fdi);
                  const rec = getRecord(fdi);
                  const grade = rec.mobility ?? 0;
                  return (
                    <td key={fdi} className="py-1.5 px-1 text-center border-l border-[var(--df-border)]/60">
                      {isMissing ? (
                        <span className="text-[var(--df-text-muted)]">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cycleGrade(fdi, "mobility")}
                          className={`px-2 py-0.5 rounded font-bold text-xs cursor-pointer ${
                            grade >= 2
                              ? "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)]"
                              : grade === 1
                              ? "bg-[var(--df-status-amber-bg)] text-[var(--df-status-amber-text)]"
                              : "bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)]"
                          }`}
                        >
                          {ROMAN_GRADES[grade]}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Furcation Row */}
              <tr>
                <td className="py-2 pr-3 font-semibold text-[var(--df-text-secondary)] whitespace-nowrap">
                  Furcation (0–III)
                </td>
                {activeQuad.fdis.map((fdi) => {
                  const isMissing = missingFdis.includes(fdi);
                  const rec = getRecord(fdi);
                  const grade = rec.furcation ?? 0;
                  return (
                    <td key={fdi} className="py-1.5 px-1 text-center border-l border-[var(--df-border)]/60">
                      {isMissing ? (
                        <span className="text-[var(--df-text-muted)]">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cycleGrade(fdi, "furcation")}
                          className={`px-2 py-0.5 rounded font-bold text-xs cursor-pointer ${
                            grade >= 2
                              ? "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)]"
                              : grade === 1
                              ? "bg-[var(--df-status-amber-bg)] text-[var(--df-status-amber-text)]"
                              : "bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)]"
                          }`}
                        >
                          {ROMAN_GRADES[grade]}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
