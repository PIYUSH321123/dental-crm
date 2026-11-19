"use client";

import React, { useRef, useState } from "react";
import {
  Contrast,
  Eye,
  Maximize2,
  MousePointerClick,
  Plus,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { formatToothNumber } from "@/lib/dental-chart-logic";
import {
  DentalImagingRecord,
  DentalNumberingSystem,
  ImageAnnotationItem,
} from "@/types/dentflow";

export function RadiographSvgGraphic({
  item,
  className = "w-full h-full",
}: {
  item: DentalImagingRecord;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-label={`${item.title} radiograph`}>
      <rect width="320" height="200" fill="#091318" />
      {item.modality === "OPG" ? (
        <g opacity="0.88">
          <path d="M 35 125 Q 160 55 285 125" stroke="#94A3B8" strokeWidth="14" fill="none" opacity="0.22" />
          <path d="M 45 112 Q 160 72 275 112" stroke="#CBD5E1" strokeWidth="3" fill="none" />
          {[68, 92, 114, 136, 158, 180, 202, 224, 246].map((x, idx) => (
            <g key={x}>
              <rect x={x} y={66 + Math.abs(4 - idx) * 4} width="14" height="26" rx="4" fill="#CBD5E1" opacity="0.65" />
              <rect x={x} y={108 + Math.abs(4 - idx) * 4} width="14" height="26" rx="4" fill="#CBD5E1" opacity="0.65" />
            </g>
          ))}
        </g>
      ) : item.modality === "Bitewing" ? (
        <g opacity="0.88">
          {[60, 120, 180, 240].map((x) => (
            <g key={x}>
              <path d={`M ${x - 20} 25 L ${x + 20} 25 L ${x + 16} 88 Q ${x} 95 ${x - 16} 88 Z`} fill="#CBD5E1" opacity="0.68" />
              <path d={`M ${x - 20} 175 L ${x + 20} 175 L ${x + 16} 112 Q ${x} 105 ${x - 16} 112 Z`} fill="#CBD5E1" opacity="0.68" />
            </g>
          ))}
        </g>
      ) : (
        /* IOPA / Single-tooth high-detail view */
        <g>
          {/* Adjacent tooth left */}
          <path d="M 55 55 Q 75 40 95 55 L 98 125 Q 85 170 72 170 Q 60 140 55 125 Z" fill="#94A3B8" opacity="0.45" />
          {/* Primary target molar */}
          <path
            d="M 118 45 Q 140 28 162 34 Q 184 28 202 45 L 208 115 Q 198 175 180 178 Q 168 140 160 116 Q 152 140 140 178 Q 122 175 112 115 Z"
            fill="#E2E8F0"
            opacity="0.85"
          />
          {/* Pulp chamber & canals */}
          <path
            d="M 140 66 Q 160 58 180 66 L 174 114 Q 168 152 160 110 Q 152 152 146 114 Z"
            fill="#0F172A"
            opacity="0.85"
          />
          {/* Caries radiolucency */}
          <ellipse cx="182" cy="64" rx="14" ry="12" fill="#1E293B" opacity="0.85" />
          {/* Adjacent tooth right */}
          <path d="M 225 55 Q 245 42 265 55 L 268 125 Q 255 168 242 168 Q 230 140 225 125 Z" fill="#94A3B8" opacity="0.45" />
        </g>
      )}

      {/* Existing saved annotations */}
      {item.annotations.map((ann, idx) => (
        <g key={ann.id}>
          <circle
            cx={(ann.xPct / 100) * 320}
            cy={(ann.yPct / 100) * 200}
            r="12"
            fill="rgba(245, 176, 118, 0.2)"
            stroke="#F5B076"
            strokeWidth="2.5"
          />
          <text
            x={(ann.xPct / 100) * 320}
            y={(ann.yPct / 100) * 200 + 3.5}
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill="#FDE68A"
          >
            {idx + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function ToothImagingHoverStrip({
  hoveredFdi,
  imaging,
  numberingSystem,
  onOpenImage,
}: {
  hoveredFdi: number | null;
  imaging: DentalImagingRecord[];
  numberingSystem: DentalNumberingSystem;
  onOpenImage: (img: DentalImagingRecord) => void;
}) {
  if (!hoveredFdi) return null;
  const linked = imaging.filter((img) => img.linkedTeeth.includes(hoveredFdi));
  if (linked.length === 0) return null;

  return (
    <div className="p-2.5 rounded-xl bg-[var(--df-teal-soft)]/70 border border-[var(--df-teal-border)] flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
      <span className="font-semibold text-[var(--df-teal)]">
        Linked imaging for tooth {formatToothNumber(hoveredFdi, numberingSystem)} ({linked.length}):
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {linked.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => onOpenImage(img)}
            className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-[var(--df-surface)] border border-[var(--df-border)] hover:border-[var(--df-teal)] cursor-pointer shadow-xs"
          >
            <div className="w-10 h-7 rounded overflow-hidden shrink-0">
              <RadiographSvgGraphic item={img} />
            </div>
            <div className="text-left leading-tight">
              <p className="font-bold text-[11px] text-[var(--df-text)]">{img.title}</p>
              <p className="text-[10px] text-[var(--df-text-muted)]">{img.date}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ImagingGalleryAndViewer({
  imaging,
  numberingSystem,
  actorName,
  selectedToothFdi,
  openImageId,
  galleryHidden = false,
  onSelectOpenImageId,
  onUpdateImage,
  onAddImage,
}: {
  imaging: DentalImagingRecord[];
  numberingSystem: DentalNumberingSystem;
  actorName: string;
  selectedToothFdi: number;
  openImageId: string | null;
  galleryHidden?: boolean;
  onSelectOpenImageId: (id: string | null) => void;
  onUpdateImage: (updated: DentalImagingRecord, auditDetail: string) => void;
  onAddImage: (item: DentalImagingRecord) => void;
}) {
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [inverted, setInverted] = useState(false);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [annotationLabel, setAnnotationLabel] = useState("Periapical radiolucency / caries");
  const [linkToothInput, setLinkToothInput] = useState(String(selectedToothFdi));
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const activeImage = imaging.find((img) => img.id === openImageId) || null;

  const resetFilters = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setInverted(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!annotateMode || !activeImage || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newAnn: ImageAnnotationItem = {
      id: `ann-${Date.now()}`,
      xPct: Math.min(95, Math.max(5, xPct)),
      yPct: Math.min(95, Math.max(5, yPct)),
      label: annotationLabel.trim() || "Clinical marker",
      toothFdi: selectedToothFdi,
      createdBy: actorName,
      createdAt: new Date().toISOString(),
    };

    onUpdateImage(
      { ...activeImage, annotations: [...activeImage.annotations, newAnn] },
      `Annotated ${activeImage.title}: "${newAnn.label}"`,
    );
    toast.success(`Annotation placed on ${activeImage.title}`);
  };

  const handleLinkTooth = () => {
    if (!activeImage) return;
    const fdi = Number(linkToothInput);
    if (!Number.isInteger(fdi) || fdi < 11 || fdi > 85) {
      toast.error("Enter a valid FDI tooth number (e.g. 36, 14, 55).");
      return;
    }
    if (activeImage.linkedTeeth.includes(fdi)) return;
    onUpdateImage(
      { ...activeImage, linkedTeeth: [...activeImage.linkedTeeth, fdi] },
      `Linked tooth ${formatToothNumber(fdi, numberingSystem)} to ${activeImage.title}`,
    );
    toast.success(`Linked tooth ${formatToothNumber(fdi, numberingSystem)} to ${activeImage.title}`);
  };

  return (
    <div className="space-y-4">
      {!galleryHidden && (
      <div className="df-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              Linked Radiographs &amp; Clinical Imaging
            </h2>
            <p className="text-xs text-[var(--df-text-muted)]">
              Click any thumbnail for full-screen zoom, brightness/contrast &amp; annotations. Linked images appear on tooth hover.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newItem: DentalImagingRecord = {
                id: `rvg-${Date.now()}`,
                title: `RVG · ${formatToothNumber(selectedToothFdi, numberingSystem)}`,
                modality: "IOPA",
                date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                linkedTeeth: [selectedToothFdi],
                annotations: [],
              };
              onAddImage(newItem);
              onSelectOpenImageId(newItem.id);
              toast.success(`Imported RVG linked to tooth ${formatToothNumber(selectedToothFdi, numberingSystem)}`);
            }}
            className="df-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import RVG / OPG</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imaging.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                resetFilters();
                onSelectOpenImageId(item.id);
              }}
              className="group text-left df-card p-3 hover:border-[var(--df-teal)] transition-all cursor-pointer space-y-2"
            >
              <div className="aspect-[16/10] rounded-lg overflow-hidden border border-[var(--df-border-strong)] relative bg-[#091318]">
                <RadiographSvgGraphic item={item} />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-3 w-3" /> Open viewer
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[var(--df-text)]">{item.title}</p>
                <span className="text-[11px] text-[var(--df-text-muted)]">{item.date}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {item.linkedTeeth.map((fdi) => (
                  <span
                    key={fdi}
                    className="px-1.5 py-0.5 rounded bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)] text-[10px] font-bold"
                  >
                    #{formatToothNumber(fdi, numberingSystem)}
                  </span>
                ))}
                {item.annotations.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {item.annotations.length} note{item.annotations.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Full-Screen Radiograph Viewer Modal */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Radiograph viewer: ${activeImage.title}`}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col p-4 sm:p-6 text-white"
        >
          {/* Top Viewer Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
            <div>
              <h3 className="text-sm font-bold">{activeImage.title}</h3>
              <p className="text-xs text-zinc-400">
                {activeImage.modality} · {activeImage.date} · Linked teeth:{" "}
                {activeImage.linkedTeeth.map((f) => formatToothNumber(f, numberingSystem)).join(", ") || "None"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Zoom */}
              <div className="flex items-center gap-1.5 bg-zinc-800 px-2.5 py-1 rounded-lg">
                <button
                  type="button"
                  aria-label="Zoom out radiograph"
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                  className="hover:text-teal-300 cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono w-10 text-center">{zoom}%</span>
                <button
                  type="button"
                  aria-label="Zoom in radiograph"
                  onClick={() => setZoom((z) => Math.min(300, z + 25))}
                  className="hover:text-teal-300 cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Brightness */}
              <label className="flex items-center gap-1.5 bg-zinc-800 px-2.5 py-1 rounded-lg">
                <Sun className="h-3.5 w-3.5 text-amber-300" />
                <input
                  type="range"
                  aria-label="Radiograph brightness"
                  min={50}
                  max={200}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-20 accent-teal-400 cursor-pointer"
                />
              </label>

              {/* Contrast */}
              <label className="flex items-center gap-1.5 bg-zinc-800 px-2.5 py-1 rounded-lg">
                <Contrast className="h-3.5 w-3.5 text-sky-300" />
                <input
                  type="range"
                  aria-label="Radiograph contrast"
                  min={50}
                  max={200}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-20 accent-teal-400 cursor-pointer"
                />
              </label>

              <button
                type="button"
                onClick={() => setInverted((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                  inverted ? "bg-teal-600 border-teal-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-200"
                }`}
              >
                <Eye className="h-3.5 w-3.5 inline mr-1" />
                Invert
              </button>

              <button
                type="button"
                onClick={() => setAnnotateMode((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer inline-flex items-center gap-1 ${
                  annotateMode ? "bg-amber-500 border-amber-400 text-zinc-950" : "bg-zinc-800 border-zinc-700 text-zinc-200"
                }`}
              >
                <MousePointerClick className="h-3.5 w-3.5" />
                <span>{annotateMode ? "Click image to annotate" : "Annotate"}</span>
              </button>

              <button
                type="button"
                aria-label="Reset radiograph filters"
                onClick={resetFilters}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                aria-label="Close radiograph viewer"
                onClick={() => onSelectOpenImageId(null)}
                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Center Viewer + Right Annotation & Tooth Link Rail */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 min-h-0">
            <div className="lg:col-span-9 bg-[#050B0E] rounded-2xl border border-zinc-800 flex items-center justify-center overflow-auto p-4">
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{
                  transform: `scale(${zoom / 100})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${inverted ? "invert(1)" : ""}`,
                }}
                className={`w-full max-w-2xl aspect-[16/10] transition-transform ${
                  annotateMode ? "cursor-crosshair ring-2 ring-amber-400 rounded-xl" : ""
                }`}
              >
                <RadiographSvgGraphic item={activeImage} />
              </div>
            </div>

            <div className="lg:col-span-3 bg-zinc-900 rounded-2xl border border-zinc-800 p-4 flex flex-col gap-4 overflow-y-auto text-xs">
              {/* Annotation composer */}
              <div className="space-y-2">
                <p className="font-bold text-zinc-200">Annotations ({activeImage.annotations.length})</p>
                <input
                  type="text"
                  value={annotationLabel}
                  onChange={(e) => setAnnotationLabel(e.target.value)}
                  placeholder="Annotation label before clicking image..."
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                />
                <div className="space-y-1.5">
                  {activeImage.annotations.map((ann, idx) => (
                    <div
                      key={ann.id}
                      className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold text-amber-200">
                          #{idx + 1} · {ann.label}
                        </p>
                        <p className="text-[10.5px] text-zinc-400">
                          by {ann.createdBy}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Delete annotation"
                        onClick={() =>
                          onUpdateImage(
                            {
                              ...activeImage,
                              annotations: activeImage.annotations.filter((a) => a.id !== ann.id),
                            },
                            `Removed annotation "${ann.label}" from ${activeImage.title}`,
                          )
                        }
                        className="text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {activeImage.annotations.length === 0 && (
                    <p className="text-zinc-500 italic">Enable Annotate and click on the scan to add a marker.</p>
                  )}
                </div>
              </div>

              {/* Linked teeth management */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <p className="font-bold text-zinc-200">Linked Teeth (Hover Preview)</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeImage.linkedTeeth.map((fdi) => (
                    <span
                      key={fdi}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-900/60 border border-teal-700 text-teal-200 text-[11px] font-bold"
                    >
                      #{formatToothNumber(fdi, numberingSystem)}
                      <button
                        type="button"
                        aria-label={`Unlink tooth ${fdi}`}
                        onClick={() =>
                          onUpdateImage(
                            {
                              ...activeImage,
                              linkedTeeth: activeImage.linkedTeeth.filter((x) => x !== fdi),
                            },
                            `Unlinked tooth ${formatToothNumber(fdi, numberingSystem)} from ${activeImage.title}`,
                          )
                        }
                        className="hover:text-white cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    aria-label="FDI tooth number to link"
                    value={linkToothInput}
                    onChange={(e) => setLinkToothInput(e.target.value)}
                    placeholder="FDI # (e.g. 36)"
                    className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleLinkTooth}
                    className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
