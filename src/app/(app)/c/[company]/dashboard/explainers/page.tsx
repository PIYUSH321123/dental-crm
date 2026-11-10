"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { DentflowPageHeader } from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import { EXPLAINER_LANGUAGES } from "@/lib/mock/dentflow";

const XRAY_ANNOTATION_LABEL: Record<string, string> = {
  en: "Decay",
  hi: "सड़न",
  mr: "कीड",
  gu: "સડો",
  ta: "சொத்தை",
  te: "పుప్పి",
  kn: "ಹುಳುಕು",
  bn: "ক্ষয়",
};

export default function ExplainersPage() {
  const params = useParams();
  const router = useRouter();
  const company =
    (Array.isArray(params?.company) ? params.company[0] : params?.company) || "smile-studio";
  const { updateState } = useDentflow();

  // Default to Hindi ("hi") to match PDF C06 screen mockup
  const [selectedLangCode, setSelectedLangCode] = useState<string>("hi");
  const [selectedOption, setSelectedOption] = useState<"a" | "b" | "c">("a");

  // Editable draft fields — editing ANY field resets doctorApproved to false!
  const [editsByLang, setEditsByLang] = useState<
    Record<string, { what: string; wait: string; recovery: string }>
  >({});

  const [addAudio, setAddAudio] = useState(true);
  const [showEmi, setShowEmi] = useState(true);
  const [allowQuestions, setAllowQuestions] = useState(true);
  const [doctorApproved, setDoctorApproved] = useState(false);

  const baseLang =
    EXPLAINER_LANGUAGES.find((l) => l.code === selectedLangCode) || EXPLAINER_LANGUAGES[1];
  const currentText = editsByLang[selectedLangCode] || {
    what: baseLang.what,
    wait: baseLang.wait,
    recovery: baseLang.recovery,
  };

  const handleEditField = (field: "what" | "wait" | "recovery", value: string) => {
    setEditsByLang((prev) => ({
      ...prev,
      [selectedLangCode]: {
        ...currentText,
        [field]: value,
      },
    }));
    if (doctorApproved) {
      setDoctorApproved(false);
      toast.info("Content edited — doctor approval reset and required before sending.");
    }
  };

  const handleSendWhatsApp = () => {
    if (!doctorApproved) {
      toast.error("Doctor approval required before sending explainer to patient.");
      return;
    }
    updateState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) =>
        p.id === "pat-priya"
          ? {
              ...p,
              recentActivity: [
                {
                  date: "Today",
                  text: `Sent doctor-approved explainer in ${baseLang.label} (30-day signed link)`,
                },
                ...p.recentActivity,
              ],
            }
          : p,
      ),
    }));
    toast.success(
      `WhatsApp explainer sent to Priya Deshmukh (+91 98XXX XX210) in ${baseLang.label}. Link valid for 30 days.`,
    );
  };

  return (
    <div>
      <DentflowPageHeader
        title="Treatment explainer · Priya Deshmukh"
        subtitle="Built from IOPA 36 and plan TP-2231 · doctor approval required before patient send"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col card */}
        <div className="xl:col-span-8 df-card p-5 space-y-5">
          {/* Language row */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--df-text)]">Language</span>
              <span className="text-[11px] text-[var(--df-text-muted)]">
                AI draft · edit freely
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {EXPLAINER_LANGUAGES.map((lang) => {
                const active = lang.code === selectedLangCode;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLangCode(lang.code)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-[var(--df-sidebar-bg)] text-white"
                        : "bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle row: Annotated IOPA 36 + 3 Editable Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-4 space-y-1.5">
              <div className="aspect-[4/3] w-full rounded-xl bg-[#0B161C] border border-[var(--df-border-strong)] overflow-hidden">
                <svg viewBox="0 0 200 150" className="w-full h-full">
                  <rect width="200" height="150" fill="#0B161C" />
                  <circle cx="100" cy="75" r="58" fill="#13222B" opacity="0.7" />
                  <path
                    d="M 65 35 Q 75 20 100 20 Q 125 20 135 35 L 140 85 Q 135 130 120 135 Q 110 110 100 85 Q 90 110 80 135 Q 65 130 60 85 Z"
                    fill="#E2E8F0"
                    opacity="0.86"
                  />
                  <path
                    d="M 80 45 Q 100 40 120 45 L 115 80 Q 110 115 106 125 Q 102 105 100 80 Q 98 105 94 125 Q 90 115 85 80 Z"
                    fill="#0F172A"
                  />
                  <circle
                    cx="104"
                    cy="52"
                    r="18"
                    fill="none"
                    stroke="#F5B076"
                    strokeWidth="3.2"
                  />
                  <text
                    x="104"
                    y="55"
                    fill="#F5B076"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {XRAY_ANNOTATION_LABEL[selectedLangCode] || "सड़न"}
                  </text>
                </svg>
              </div>
              <p className="text-[11px] text-[var(--df-text-muted)] font-medium">
                IOPA 36 · annotation added
              </p>
            </div>

            <div className="md:col-span-8 space-y-2.5">
              <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] p-3">
                <label className="block text-[11px] font-bold text-[var(--df-text-muted)] mb-1">
                  What is happening
                </label>
                <textarea
                  rows={2}
                  value={currentText.what}
                  onChange={(e) => handleEditField("what", e.target.value)}
                  className="w-full text-xs text-[var(--df-text)] bg-transparent focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] p-3">
                <label className="block text-[11px] font-bold text-[var(--df-text-muted)] mb-1">
                  If we wait
                </label>
                <textarea
                  rows={2}
                  value={currentText.wait}
                  onChange={(e) => handleEditField("wait", e.target.value)}
                  className="w-full text-xs text-[var(--df-text)] bg-transparent focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] p-3">
                <label className="block text-[11px] font-bold text-[var(--df-text-muted)] mb-1">
                  Recovery
                </label>
                <textarea
                  rows={2}
                  value={currentText.recovery}
                  onChange={(e) => handleEditField("recovery", e.target.value)}
                  className="w-full text-xs text-[var(--df-text)] bg-transparent focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Options & prices (pulled from plan) */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[var(--df-text)]">
              Options &amp; prices (pulled from plan)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(["a", "b", "c"] as const).map((code) => {
                const opt = baseLang.options[code];
                const isSelected = selectedOption === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedOption(code)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--df-teal)] bg-[var(--df-teal-soft)]/35 ring-1 ring-[var(--df-teal)]"
                        : "border-[var(--df-border)] bg-[var(--df-surface)] hover:border-[var(--df-border-strong)]"
                    }`}
                  >
                    <p className="text-xs font-bold text-[var(--df-text)]">{opt.title}</p>
                    <p className="text-xs font-semibold text-[var(--df-text-secondary)] mt-1">
                      {opt.price}{" "}
                      <span className="font-normal text-[var(--df-text-muted)] text-[11px]">
                        · {opt.note}
                      </span>
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--df-border)] text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--df-text)]">
              <input
                type="checkbox"
                checked={addAudio}
                onChange={(e) => setAddAudio(e.target.checked)}
                className="accent-[var(--df-teal)] h-4 w-4 rounded"
              />
              <span>Add narrated audio (clinic voice)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--df-text)]">
              <input
                type="checkbox"
                checked={showEmi}
                onChange={(e) => setShowEmi(e.target.checked)}
                className="accent-[var(--df-teal)] h-4 w-4 rounded"
              />
              <span>Show EMI option (3 × ₹7,500)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--df-text)]">
              <input
                type="checkbox"
                checked={allowQuestions}
                onChange={(e) => setAllowQuestions(e.target.checked)}
                className="accent-[var(--df-teal)] h-4 w-4 rounded"
              />
              <span>Allow &quot;Ask a question&quot; reply</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-[var(--df-text-secondary)]">
              <input
                type="checkbox"
                checked={doctorApproved}
                onChange={(e) => setDoctorApproved(e.target.checked)}
                className="accent-[var(--df-teal)] h-4 w-4 rounded"
              />
              <span>Doctor approved content (required)</span>
            </label>
          </div>
        </div>

        {/* Right 4-col WhatsApp Smartphone Preview */}
        <div className="xl:col-span-4 flex flex-col items-center space-y-3.5">
          <div className="w-full max-w-[310px] rounded-[34px] p-3 bg-[var(--df-sidebar-bg)] shadow-lg">
            <div className="rounded-[26px] overflow-hidden bg-[var(--df-surface)] flex flex-col">
              <div className="bg-[var(--df-teal)] px-4 py-3 text-center">
                <span className="text-xs font-bold text-white tracking-wide">
                  Smile Studio Dental
                </span>
              </div>

              <div className="p-3.5 space-y-3 bg-[var(--df-surface-muted)]">
                {/* Video thumbnail */}
                <div className="relative aspect-[16/10] w-full rounded-xl bg-[#0B161C] overflow-hidden">
                  <svg viewBox="0 0 160 100" className="w-full h-full">
                    <rect width="160" height="100" fill="#0B161C" />
                    <circle cx="80" cy="50" r="34" fill="#13222B" opacity="0.7" />
                    <circle
                      cx="80"
                      cy="50"
                      r="16"
                      fill="none"
                      stroke="#F5B076"
                      strokeWidth="2.8"
                    />
                  </svg>
                  <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-white font-semibold inline-flex items-center gap-1">
                    <Play className="h-2.5 w-2.5 fill-white" />
                    <span>2:30</span>
                  </div>
                </div>

                {/* WhatsApp message preview */}
                <div className="space-y-1.5 text-left">
                  <p className="text-[11px] text-[var(--df-text)] leading-snug font-medium">
                    {baseLang.whatsappPreview.text}
                  </p>
                  {showEmi && (
                    <p className="text-[10.5px] text-[var(--df-text-secondary)] font-semibold">
                      {baseLang.whatsappPreview.bestOption}
                    </p>
                  )}
                </div>

                {/* 3 WhatsApp Quick Reply Buttons */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/${company}/patient-portal?screen=P08`)}
                    className="w-full py-1.5 px-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[11px] font-semibold text-[var(--df-teal)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
                  >
                    पूरा देखें
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Patient question thread opened")}
                    className="w-full py-1.5 px-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[11px] font-semibold text-[var(--df-teal)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
                  >
                    सवाल पूछें
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/c/${company}/dashboard/calendar`)}
                    className="w-full py-1.5 px-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[11px] font-semibold text-[var(--df-teal)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
                  >
                    अपॉइंटमेंट बुक करें
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[310px] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => router.push(`/${company}/patient-portal?screen=P08`)}
                className="df-btn-secondary py-2 text-xs cursor-pointer"
              >
                Preview link
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="df-btn-primary py-2 text-xs cursor-pointer"
              >
                Send on WhatsApp
              </button>
            </div>
            <p className="text-[10.5px] text-[var(--df-text-muted)] text-center leading-tight">
              Tracks opens, watch time, questions and acceptance. Link expires in 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

