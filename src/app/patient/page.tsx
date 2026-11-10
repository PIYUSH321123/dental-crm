"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Clock,
  CreditCard,
  Download,
  FileText,
  Home,
  LogOut,
  Mic,
  Play,
  RefreshCw,
  Stethoscope,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { DentflowProvider, useDentflow } from "@/lib/dentflow-store";
import { DentflowStatusPill } from "@/components/dental/dentflow-primitives";
import { PatientAppView } from "@/types/dentflow";

const VIEW_LIST: { id: PatientAppView; label: string }[] = [
  { id: "book", label: "Book" },
  { id: "whatsapp-bot", label: "WhatsApp bot" },
  { id: "home", label: "Home" },
  { id: "before-visit", label: "Before visit" },
  { id: "self-check", label: "Self-check" },
  { id: "photo-check", label: "Photo check" },
  { id: "result", label: "Result" },
  { id: "explainer", label: "Explainer" },
  { id: "payments", label: "Pay / EMI" },
  { id: "records", label: "Records" },
  { id: "family", label: "Family" },
  { id: "recovery", label: "Post-op" },
  { id: "aligner", label: "Aligner" },
];

function PatientAppInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateState } = useDentflow();

  const rawView = searchParams?.get("view") as PatientAppView | null;
  const initialView: PatientAppView =
    rawView && VIEW_LIST.some((v) => v.id === rawView) ? rawView : "home";
  const [view, setView] = useState<PatientAppView>(initialView);

  useEffect(() => {
    const q = searchParams?.get("view") as PatientAppView | null;
    if (q && VIEW_LIST.some((v) => v.id === q)) {
      setView(q);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await fetch("/api/dentflow/session", { method: "DELETE" }).catch(() => {});
    router.push("/patient/login");
    router.refresh();
  };

  // Book a visit state
  const [bookReason, setBookReason] = useState("Tooth pain");
  const [bookDay, setBookDay] = useState("Wed 30");
  const [bookTime, setBookTime] = useState("11:30");

  // Comfort check state
  const [anxiety, setAnxiety] = useState(7);
  const [bothers, setBothers] = useState<string[]>(["Injections", "Drill sound", "Gagging"]);
  const [helps, setHelps] = useState<string[]>([
    "Explain each step before starting",
    "A \"stop\" hand signal",
    "Bring my own headphones",
    "Morning slot, no waiting",
  ]);

  // Self-check state
  const [quadrant, setQuadrant] = useState("Lower left");
  const [painLevel, setPainLevel] = useState(6);
  const [symptoms, setSymptoms] = useState<string[]>(["Cold hurts", "Pain when biting"]);
  const [sinceWhen, setSinceWhen] = useState("3–7 days");

  // Treatment explainer state
  const [expLang, setExpLang] = useState<"हिन्दी" | "मराठी" | "EN">("हिन्दी");
  const [expOpt, setExpOpt] = useState<"A" | "B" | "C">("A");

  // Records state
  const [recFilter, setRecFilter] = useState("All");
  const [abhaOn, setAbhaOn] = useState(true);

  // Recovery check-in state (Rohan)
  const [rohanPain, setRohanPain] = useState(8);
  const [swelling, setSwelling] = useState(true);
  const [fever, setFever] = useState(false);
  const [bleeding, setBleeding] = useState(false);
  const [badTaste, setBadTaste] = useState(true);

  // Aligner progress state (Kavya)
  const [timerRunning, setTimerRunning] = useState(false);
  const [alignerConsent, setAlignerConsent] = useState(false);

  const toggleChip = (list: string[], val: string, setter: (v: string[]) => void) => {
    setter(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const showBottomNav = ["home", "payments", "records", "family", "aligner"].includes(view);

  return (
    <div className="min-h-screen df-canvas flex flex-col items-center py-0 sm:py-5 px-0 sm:px-4">
      {/* Top view switcher bar */}
      <div className="w-full max-w-[960px] mb-3 px-3 pt-3 sm:pt-0 sm:px-0 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="df-serif text-sm font-semibold text-[var(--df-text)]">
            Smile Studio · Patient app
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--df-surface)] border border-[var(--df-border)] text-[11px] font-semibold text-[var(--df-text-secondary)] hover:text-[var(--df-text)] cursor-pointer"
          >
            <LogOut className="h-3 w-3" />
            <span>Log out</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {VIEW_LIST.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold cursor-pointer transition-colors ${
                view === v.id
                  ? "bg-[var(--df-sidebar-bg)] text-white"
                  : "bg-[var(--df-surface)] border border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile PWA Frame (full-bleed on mobile <=430px, phone shell on desktop) */}
      <div className="w-full max-w-[412px] min-h-[760px] bg-[var(--df-surface)] sm:rounded-[30px] sm:border sm:border-[var(--df-border-strong)] sm:shadow-xl overflow-hidden flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          {/* Book a visit */}
          {view === "book" && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="bg-[var(--df-sidebar-bg)] text-white px-5 pt-5 pb-4">
                  <p className="text-[11px] text-[var(--df-sidebar-muted)]">Smile Studio Dental</p>
                  <h1 className="df-serif text-xl font-semibold mt-0.5">Book a visit</h1>
                  <p className="text-[11px] text-[var(--df-sidebar-muted)]">
                    Station Road · open today till 8 pm
                  </p>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  <div>
                    <p className="font-bold text-[var(--df-text)] mb-2">What do you need?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Tooth pain",
                        "Check-up",
                        "Cleaning",
                        "Braces / aligners",
                        "Child visit",
                        "Other",
                      ].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setBookReason(r)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                            bookReason === r
                              ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                              : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text)]"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setView("self-check")}
                    className="w-full text-left p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] text-[11px] text-[var(--df-text-secondary)] cursor-pointer"
                  >
                    Not sure? Take a 2-minute self-check and we&apos;ll suggest the right visit.
                  </button>

                  <div>
                    <p className="font-bold text-[var(--df-text)] mb-2">Pick a day</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { d: "Tue", n: "29" },
                        { d: "Wed", n: "30" },
                        { d: "Thu", n: "1" },
                        { d: "Fri", n: "2" },
                        { d: "Sat", n: "3" },
                      ].map((day) => {
                        const key = `${day.d} ${day.n}`;
                        const active = bookDay === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setBookDay(key)}
                            className={`py-2 rounded-xl border text-center cursor-pointer ${
                              active
                                ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                                : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text)]"
                            }`}
                          >
                            <p className="text-[10px] opacity-75">{day.d}</p>
                            <p className="font-bold text-xs">{day.n}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-[var(--df-text)] mb-2">
                      Available times · 45 min
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {["10:00", "11:30", "12:15", "4:00", "5:30", "7:00"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBookTime(t)}
                          className={`py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                            bookTime === t
                              ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                              : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text)]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--df-text-muted)]">
                    With Dr. Arjun Mehta · consultation fee ₹300 (adjusted in treatment)
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Slot ${bookDay}, ${bookTime} reserved!`);
                    setView("before-visit");
                  }}
                  className="w-full df-btn-primary py-3 text-xs cursor-pointer"
                >
                  Continue · {bookDay}, {bookTime}
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp booking bot */}
          {view === "whatsapp-bot" && (
            <div className="flex-1 flex flex-col justify-between bg-[var(--df-canvas)]">
              <div>
                <div className="bg-[var(--df-sidebar-bg)] text-white px-4 py-3.5 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[var(--df-teal)] flex items-center justify-center font-bold text-xs">
                    S
                  </div>
                  <div>
                    <p className="text-xs font-bold">Smile Studio Dental</p>
                    <p className="text-[10px] text-[#6EE7B7]">
                      Verified business · replies instantly
                    </p>
                  </div>
                </div>

                <div className="p-3.5 space-y-2.5 text-xs">
                  <div className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-2xl p-3 max-w-[85%] space-y-1.5">
                    <p className="font-medium">कौन सी ब्रांच आपके पास है?</p>
                    <div className="space-y-1 pt-1">
                      {["Station Road", "Civil Lines", "MG Road"].map((b) => (
                        <div
                          key={b}
                          className="py-1 text-center rounded-lg border border-[var(--df-border)] text-[var(--df-teal)] font-semibold text-[11px]"
                        >
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-text)] rounded-2xl px-3 py-2 font-semibold">
                      Station Road
                    </div>
                  </div>

                  <div className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-2xl p-3 max-w-[88%] space-y-1.5">
                    <p>आज के खाली समय:</p>
                    <p className="text-[11px] text-[var(--df-text-secondary)]">
                      • 11:30 — Dr. Arjun
                      <br />• 4:00 — Dr. Sneha
                      <br />• 7:00 — Dr. Arjun
                    </p>
                    <div className="space-y-1 pt-1">
                      <div className="py-1 text-center rounded-lg border border-[var(--df-border)] text-[var(--df-teal)] font-semibold text-[11px]">
                        11:30 बुक करें
                      </div>
                      <div className="py-1 text-center rounded-lg border border-[var(--df-border)] text-[var(--df-teal)] font-semibold text-[11px]">
                        दूसरा दिन चुनें
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-text)] rounded-2xl px-3 py-2 font-semibold">
                      11:30 बुक करें
                    </div>
                  </div>

                  <div className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-2xl p-3 max-w-[88%] space-y-1.5">
                    <p>
                      बुक हो गया — आज 11:30, Dr. Arjun Mehta. आने से पहले यह 2 मिनट का फ़ॉर्म भर
                      दें, समय बचेगा।
                    </p>
                    <button
                      type="button"
                      onClick={() => setView("before-visit")}
                      className="w-full py-1.5 text-center rounded-lg border border-[var(--df-border)] text-[var(--df-teal)] font-bold text-[11px] cursor-pointer"
                    >
                      फ़ॉर्म भरें
                    </button>
                    <div className="py-1 text-center rounded-lg border border-[var(--df-border)] text-[var(--df-teal)] font-semibold text-[11px]">
                      रास्ता देखें
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[var(--df-surface)] border-t border-[var(--df-border)] flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="संदेश लिखें"
                  className="flex-1 rounded-full bg-[var(--df-surface-muted)] border border-[var(--df-border)] px-3.5 py-1.5 text-xs text-[var(--df-text-muted)]"
                />
                <span className="h-8 w-8 rounded-full bg-[var(--df-teal)] text-white flex items-center justify-center">
                  <Mic className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          )}

          {/* Home */}
          {view === "home" && (
            <div className="p-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[var(--df-text-muted)]">Smile Studio Dental</p>
                  <h1 className="df-serif text-xl font-semibold text-[var(--df-text)]">
                    Hi, Priya
                  </h1>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[11px] font-semibold">
                  Priya ▾
                </span>
              </div>

              {/* NEXT VISIT Dark Card */}
              <div className="rounded-2xl p-4 bg-[var(--df-sidebar-bg)] text-white space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--df-sidebar-muted)]">
                  Next visit
                </p>
                <p className="df-serif text-lg font-semibold">Thu 1 Oct · 10:00 am</p>
                <p className="text-[11px] text-[var(--df-sidebar-muted)]">
                  Root canal, sitting 2 · Dr. Sneha Kulkarni · Chair 2, Station Road
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toast.success("Confirmed Thu 1 Oct · 10:00 am visit")}
                    className="py-1.5 rounded-xl bg-[var(--df-unique-bg)] text-[var(--df-text)] font-bold text-xs cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("book")}
                    className="py-1.5 rounded-xl bg-[var(--df-sidebar-hover)] text-white font-semibold text-xs cursor-pointer"
                  >
                    Reschedule
                  </button>
                </div>
              </div>

              {/* Pending consent banner */}
              <button
                type="button"
                onClick={() => toast.success("Crown consent e-signed!")}
                className="w-full text-left p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[var(--df-text)]">Sign crown consent</p>
                  <p className="text-[11px] text-[var(--df-text-muted)]">
                    Needed before stage 3 · 1 minute
                  </p>
                </div>
                <span className="text-[var(--df-text-muted)] font-bold">›</span>
              </button>

              {/* My treatment progress card */}
              <button
                type="button"
                onClick={() => setView("payments")}
                className="w-full text-left df-card p-3.5 space-y-1.5 cursor-pointer"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-[var(--df-text)]">My treatment</span>
                  <span className="font-semibold text-[var(--df-teal)]">Stage 2 of 3</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--df-canvas-subtle)] overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-[var(--df-teal)]" />
                </div>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  Root canal + crown · ₹15,000 left · next EMI ₹7,500 on 26 Oct
                </p>
              </button>

              {/* 4 quick tiles */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Book", icon: Calendar, target: "book" as PatientAppView },
                  { label: "Self-check", icon: Stethoscope, target: "self-check" as PatientAppView },
                  { label: "Records", icon: FileText, target: "records" as PatientAppView },
                  { label: "Pay", icon: CreditCard, target: "payments" as PatientAppView },
                ].map((q) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setView(q.target)}
                      className="df-card py-2.5 px-1 flex flex-col items-center gap-1 cursor-pointer hover:border-[var(--df-teal)]"
                    >
                      <Icon className="h-4 w-4 text-[var(--df-teal)]" />
                      <span className="text-[11px] font-semibold">{q.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explainer replay card */}
              <button
                type="button"
                onClick={() => setView("explainer")}
                className="w-full text-left df-card p-2.5 flex items-center gap-3 cursor-pointer hover:border-[var(--df-teal)]"
              >
                <div className="h-12 w-16 rounded-lg bg-[#0B161C] flex items-center justify-center shrink-0">
                  <div className="h-6 w-6 rounded-full border-2 border-[#F5B076]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--df-text)]">आपके इलाज की जानकारी</p>
                  <p className="text-[11px] text-[var(--df-text-muted)]">
                    Watch again · 2 min 30 s
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Before your visit */}
          {view === "before-visit" && (
            <div className="p-4 space-y-4 text-xs">
              <div>
                <button
                  type="button"
                  onClick={() => setView("home")}
                  className="text-[11px] text-[var(--df-text-muted)] inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <h1 className="df-serif text-xl font-semibold mt-1">Before your visit</h1>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  Step 2 of 3 · Comfort check
                </p>
              </div>

              <div>
                <p className="font-bold text-[var(--df-text)] mb-1">
                  How do you usually feel about dental visits?
                </p>
                <div className="flex justify-between text-[10px] text-[var(--df-text-muted)] mb-1.5">
                  <span>Totally calm</span>
                  <span>Very anxious</span>
                </div>
                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnxiety(i)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        anxiety === i
                          ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                          : "bg-[var(--df-surface)] border-[var(--df-border)]"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-[var(--df-text)] mb-2">What bothers you most?</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Injections",
                    "Drill sound",
                    "Gagging",
                    "Pain",
                    "Cost surprises",
                    "Past bad visit",
                    "Waiting",
                  ].map((b) => {
                    const active = bothers.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => toggleChip(bothers, b, setBothers)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                          active
                            ? "bg-[var(--df-unique-bg)] text-[var(--df-unique-text)] border-[var(--df-unique-border)]"
                            : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="font-bold text-[var(--df-text)] mb-2">What would help?</p>
                <div className="space-y-2">
                  {[
                    "Explain each step before starting",
                    "A \"stop\" hand signal",
                    "Bring my own headphones",
                    "Morning slot, no waiting",
                    "Numbing gel before injections",
                  ].map((h) => (
                    <label
                      key={h}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={helps.includes(h)}
                        onChange={() => toggleChip(helps, h, setHelps)}
                        className="accent-[var(--df-teal)] h-4 w-4 rounded"
                      />
                      <span>{h}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-[10.5px] text-[var(--df-text-muted)]">
                Only your dental team sees this. It changes how long we book.
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setView("home")}
                  className="df-btn-secondary py-2.5 text-xs cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Comfort profile saved (+15 min buffer applied)");
                    setView("home");
                  }}
                  className="col-span-2 df-btn-primary py-2.5 text-xs cursor-pointer"
                >
                  Next: consent
                </button>
              </div>
            </div>
          )}

          {/* Self-check */}
          {view === "self-check" && (
            <div className="p-4 space-y-4 text-xs">
              <div>
                <button
                  type="button"
                  onClick={() => setView("home")}
                  className="text-[11px] text-[var(--df-text-muted)] inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <h1 className="df-serif text-xl font-semibold mt-1">Quick self-check</h1>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  Step 2 of 4 · About the pain
                </p>
              </div>

              <div>
                <p className="font-bold mb-2">Where is it? Tap the area</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Upper right", "Upper left", "Lower right", "Lower left"].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuadrant(q)}
                      className={`py-3 rounded-xl border font-semibold cursor-pointer ${
                        quadrant === q
                          ? "bg-[var(--df-unique-bg)] text-[var(--df-unique-text)] border-[var(--df-unique-border)]"
                          : "bg-[var(--df-surface)] border-[var(--df-border)]"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>How bad is it right now?</span>
                  <span className="df-serif text-base text-[var(--df-unique-text)]">
                    {painLevel}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full accent-[var(--df-unique-text)]"
                />
              </div>

              <div>
                <p className="font-bold mb-2">Does any of this happen?</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Cold hurts",
                    "Hot hurts",
                    "Pain when biting",
                    "Wakes me at night",
                    "Gums bleed",
                    "Bad taste",
                    "Loose tooth",
                  ].map((sym) => {
                    const active = symptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleChip(symptoms, sym, setSymptoms)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                          active
                            ? "bg-[var(--df-status-blue-bg)] text-[var(--df-status-blue-text)] border-[var(--df-status-blue-border)]"
                            : "bg-[var(--df-surface)] border-[var(--df-border)]"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="font-bold mb-1.5">Since when?</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {["Today", "1–2 days", "3–7 days", "Longer"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSinceWhen(d)}
                      className={`py-1.5 rounded-xl border text-[11px] font-semibold cursor-pointer ${
                        sinceWhen === d
                          ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                          : "bg-[var(--df-surface)] border-[var(--df-border)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--df-alert-red-bg)] border border-[var(--df-status-red-border)] text-[11px] text-[var(--df-status-red-text)]">
                Swelling on the face, fever, or trouble swallowing? Please call the clinic now
                instead of finishing this.
              </div>

              <button
                type="button"
                onClick={() => setView("photo-check")}
                className="w-full df-btn-primary py-3 text-xs cursor-pointer"
              >
                Next: add photos (optional)
              </button>
            </div>
          )}

          {/* Photo check */}
          {view === "photo-check" && (
            <div className="flex-1 bg-[#141716] text-white p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-white/75">
                  <button
                    type="button"
                    onClick={() => setView("self-check")}
                    className="cursor-pointer"
                  >
                    ← Back
                  </button>
                  <span>Photo 2 of 4</span>
                  <button
                    type="button"
                    onClick={() => setView("result")}
                    className="cursor-pointer"
                  >
                    Skip
                  </button>
                </div>
                <div className="text-center">
                  <h1 className="df-serif text-lg font-semibold">Lower teeth, left side</h1>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Open wide, pull your cheek back with a clean finger, and use the flash.
                  </p>
                </div>
              </div>

              {/* Viewfinder guide */}
              <div className="my-4 rounded-2xl border border-white/15 bg-[#1D211F] p-5 flex flex-col items-center justify-center space-y-4">
                <div className="w-full h-36 rounded-2xl border-2 border-dashed border-[#F5B076] flex items-center justify-center">
                  <span className="text-[11px] text-[#F5B076] font-semibold">
                    Fit your teeth inside the outline
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] text-[11px] font-bold">
                  Sharp · good light
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  {[
                    { label: "Front", done: true, active: false },
                    { label: "Lower L", done: false, active: true },
                    { label: "Lower R", done: false, active: false },
                    { label: "Upper", done: false, active: false },
                  ].map((th) => (
                    <div key={th.label} className="space-y-1">
                      <div
                        className={`h-10 rounded-lg border flex items-center justify-center ${
                          th.active
                            ? "border-[#F5B076] bg-white/10"
                            : "border-white/20 bg-white/5"
                        }`}
                      >
                        {th.done && <Check className="h-3.5 w-3.5 text-[#6EE7B7]" />}
                      </div>
                      <p className="text-white/75">{th.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-around py-1">
                  <Camera className="h-5 w-5 text-white/70" />
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Photo 2 captured · quality verified");
                      setView("result");
                    }}
                    aria-label="Capture dental photo"
                    className="h-14 w-14 rounded-full bg-white border-4 border-white/40 cursor-pointer"
                  />
                  <RefreshCw className="h-5 w-5 text-white/70" />
                </div>

                <p className="text-[10px] text-white/60 text-center">
                  Photos go only to your clinic. They help the dentist prepare — they are not a
                  diagnosis.
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {view === "result" && (
            <div className="p-4 space-y-3.5 text-xs">
              <p className="text-[11px] text-[var(--df-text-muted)]">Your self-check · 10 Sep</p>

              <div className="p-4 rounded-2xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--df-unique-text)]">
                  Suggested
                </p>
                <h1 className="df-serif text-lg font-semibold text-[var(--df-text)]">
                  See a dentist within 2–3 days
                </h1>
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold">
                  {["Routine", "Soon", "Today", "Emergency"].map((band) => (
                    <div
                      key={band}
                      className={`py-1 rounded-full ${
                        band === "Soon"
                          ? "bg-[var(--df-unique-bg)] text-[var(--df-unique-text)] font-bold"
                          : "bg-white/70 text-[var(--df-text-muted)]"
                      }`}
                    >
                      {band}
                    </div>
                  ))}
                </div>
              </div>

              <div className="df-card p-3.5 space-y-1.5">
                <p className="font-bold">What you told us</p>
                <ul className="text-[11px] text-[var(--df-text-secondary)] space-y-1 list-disc pl-4">
                  <li>
                    {quadrant} · pain {painLevel}/10 for {sinceWhen}
                  </li>
                  <li>Hurts with cold and when biting</li>
                  <li>No swelling or fever</li>
                </ul>
              </div>

              <div className="df-card p-3.5 space-y-1.5">
                <p className="font-bold">What the photos show</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-12 rounded-lg bg-[#0B161C] flex items-center justify-center shrink-0">
                    <div className="h-5 w-5 rounded-full border-2 border-[#F5B076]" />
                  </div>
                  <p className="text-[11px] text-[var(--df-text-secondary)]">
                    A dark area on a back tooth, lower left. The dentist will check it with an
                    X-ray.
                  </p>
                </div>
              </div>

              <p className="text-[10.5px] text-[var(--df-text-muted)]">
                This is not a diagnosis. It helps you choose how soon to come in, and your
                dentist sees your answers and photos before the visit.
              </p>

              <div className="space-y-1.5">
                <p className="font-bold">Recommended: Pain consultation + X-ray · 30 min</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {["Today 6:30 pm", "Tomorrow 10:00", "Tomorrow 5:30"].map((sl, i) => (
                    <div
                      key={sl}
                      className={`py-1.5 px-2 rounded-xl border text-center text-[10.5px] font-semibold ${
                        i === 0
                          ? "border-[var(--df-teal)] bg-[var(--df-teal-soft)] text-[var(--df-teal)]"
                          : "border-[var(--df-border)]"
                      }`}
                    >
                      {sl}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  toast.success("Booked Today 6:30 pm pain consultation");
                  setView("home");
                }}
                className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
              >
                Book today 6:30 pm
              </button>
            </div>
          )}

          {/* My treatment explained */}
          {view === "explainer" && (
            <div className="p-4 space-y-3.5 text-xs">
              <div className="rounded-2xl bg-[#0B161C] p-3.5 text-white space-y-2.5">
                <div className="h-24 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border-4 border-[#F5B076] flex items-center justify-center text-[10px] font-bold text-[#F5B076]">
                    सड़न
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toast.info("Playing clinic-voiced Hindi explanation")}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-semibold cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 fill-white" /> सुनें · 2:30
                  </button>
                  <div className="flex gap-1">
                    {(["हिन्दी", "मराठी", "EN"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setExpLang(l)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                          expLang === l ? "bg-[var(--df-teal)] text-white" : "bg-white/10"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h1 className="df-serif text-lg font-semibold">
                {expLang === "हिन्दी"
                  ? "प्रिया जी, आपके दाँत 36 के बारे में"
                  : expLang === "मराठी"
                  ? "प्रिया जी, तुमच्या दात 36 बद्दल माहिती"
                  : "Priya, about your tooth 36"}
              </h1>

              <div className="space-y-1">
                <p className="font-bold text-[var(--df-teal)]">क्या हुआ है</p>
                <p className="text-[11px] text-[var(--df-text-secondary)] leading-relaxed">
                  निचले बाएँ दाँत में गहरी सड़न नस के पास पहुँच गई है। इसी से ठंडा लगने पर दर्द होता
                  है।
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-[var(--df-teal)]">अगर इंतज़ार करें</p>
                <p className="text-[11px] text-[var(--df-text-secondary)] leading-relaxed">
                  इन्फेक्शन और सूजन हो सकती है, तब दाँत बचाना मुश्किल हो जाता है।
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold">आपके विकल्प</p>
                {[
                  {
                    code: "A" as const,
                    title: "रूट कैनाल + क्राउन (सुझाया गया)",
                    sub: "दाँत बचता है · 3 बार आना · EMI 3 × ₹7,500",
                    price: "₹22,500",
                  },
                  {
                    code: "B" as const,
                    title: "दाँत निकालकर इम्प्लांट",
                    sub: "4–5 बार आना · 3–4 महीने",
                    price: "₹42,000",
                  },
                  {
                    code: "C" as const,
                    title: "सिर्फ़ दाँत निकालना",
                    sub: "खाली जगह से बगल के दाँत खिसक सकते हैं",
                    price: "₹2,500",
                  },
                ].map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setExpOpt(opt.code)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                      expOpt === opt.code
                        ? "border-[var(--df-teal)] bg-[var(--df-teal-soft)]/40"
                        : "border-[var(--df-border)]"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[var(--df-text)]">{opt.title}</p>
                      <p className="text-[10.5px] text-[var(--df-text-muted)]">{opt.sub}</p>
                    </div>
                    <span className="font-bold text-[var(--df-text)]">{opt.price}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toast.info("Question sent to Dr. Sneha")}
                  className="df-btn-secondary py-2.5 text-xs cursor-pointer"
                >
                  सवाल पूछें
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`विकल्प ${expOpt} चुना गया!`);
                    setView("payments");
                  }}
                  className="df-btn-primary py-2.5 text-xs cursor-pointer"
                >
                  विकल्प {expOpt} चुनें
                </button>
              </div>
            </div>
          )}

          {/* Plan and payments */}
          {view === "payments" && (
            <div className="p-4 space-y-3.5 text-xs">
              <h1 className="df-serif text-xl font-semibold">My treatment</h1>

              <div className="df-card p-3.5 space-y-2.5">
                <div>
                  <p className="font-bold">Root canal + zirconia crown · tooth 36</p>
                  <p className="text-[11px] text-[var(--df-text-muted)]">
                    Dr. Sneha Kulkarni · accepted 14 Sep
                  </p>
                </div>
                <div className="space-y-2 text-[11px]">
                  {[
                    { title: "Scaling & polishing", sub: "Done · 12 Sep", done: true },
                    { title: "Root canal · sitting 1", sub: "Done · 29 Sep", done: true },
                    { title: "Root canal · sitting 2", sub: "Thu 1 Oct, 10:00", done: false },
                    {
                      title: "Zirconia crown",
                      sub: "Book after sitting 2 · ~7 days lab time",
                      done: false,
                    },
                  ].map((s) => (
                    <div key={s.title} className="flex items-start gap-2">
                      <span
                        className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          s.done
                            ? "bg-[var(--df-teal)] text-white"
                            : "border border-[var(--df-border-strong)]"
                        }`}
                      >
                        {s.done && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <div>
                        <p className="font-semibold text-[var(--df-text)]">{s.title}</p>
                        <p className="text-[var(--df-text-muted)]">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="df-card p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Payments</span>
                  <span className="text-[11px] text-[var(--df-text-muted)]">
                    ₹9,000 of ₹24,000 paid
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--df-canvas-subtle)] overflow-hidden">
                  <div className="h-full w-[38%] rounded-full bg-[var(--df-teal)]" />
                </div>
                <div className="divide-y divide-[var(--df-border)] text-[11px]">
                  {[
                    { label: "Scaling · 12 Sep", amt: "₹1,500", st: "Paid", tone: "green" as const },
                    {
                      label: "EMI 1 of 3 · 26 Sep",
                      amt: "₹7,500",
                      st: "Paid",
                      tone: "green" as const,
                    },
                    {
                      label: "EMI 2 of 3 · 26 Oct",
                      amt: "₹7,500",
                      st: "Due",
                      tone: "amber" as const,
                    },
                    {
                      label: "EMI 3 of 3 · 26 Nov",
                      amt: "₹7,500",
                      st: "Later",
                      tone: "grey" as const,
                    },
                  ].map((p) => (
                    <div key={p.label} className="py-2 flex items-center justify-between">
                      <span>{p.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{p.amt}</span>
                        <DentflowStatusPill label={p.st} tone={p.tone} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10.5px] text-[var(--df-text-muted)]">
                  UPI AutoPay mandate active on the 26th. You can pause it from your UPI app.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toast.success("Opening UPI payment intent for ₹15,000")}
                className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
              >
                Pay ₹15,000 now by UPI
              </button>
            </div>
          )}

          {/* Records */}
          {view === "records" && (
            <div className="p-4 space-y-3.5 text-xs">
              <h1 className="df-serif text-xl font-semibold">My records</h1>
              <div className="flex gap-1.5">
                {["All", "X-rays", "Prescriptions", "Bills"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setRecFilter(f)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                      recFilter === f
                        ? "bg-[var(--df-sidebar-bg)] text-white"
                        : "bg-[var(--df-surface-muted)] border border-[var(--df-border)]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { title: "Prescription · after RCT 36", sub: "29 Sep · Dr. Sneha", cat: "Prescriptions" },
                  { title: "Receipt · EMI 1 of 3", sub: "26 Sep · ₹7,500", cat: "Bills" },
                  { title: "Treatment plan TP-2231", sub: "12 Sep · signed 14 Sep", cat: "Bills" },
                  { title: "IOPA X-ray · tooth 36", sub: "12 Sep", cat: "X-rays" },
                  { title: "OPG (full mouth X-ray)", sub: "12 Sep", cat: "X-rays" },
                  { title: "RCT consent · e-signed", sub: "12 Sep", cat: "Prescriptions" },
                ]
                  .filter((rec) => recFilter === "All" || rec.cat === recFilter)
                  .map((rec) => (
                    <div
                      key={rec.title}
                      onClick={() => toast.success(`Downloading ${rec.title} PDF`)}
                      className="df-card p-3 flex items-center justify-between cursor-pointer hover:border-[var(--df-teal)]"
                    >
                      <div>
                        <p className="font-bold text-[var(--df-text)]">{rec.title}</p>
                        <p className="text-[10.5px] text-[var(--df-text-muted)]">{rec.sub}</p>
                      </div>
                      <Download className="h-3.5 w-3.5 text-[var(--df-text-muted)]" />
                    </div>
                  ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--df-teal)]">
                    Linked to ABHA · 91-XXXX-XXXX-4821
                  </span>
                  <button
                    type="button"
                    onClick={() => setAbhaOn((v) => !v)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                      abhaOn
                        ? "bg-[var(--df-teal)] text-white"
                        : "bg-[var(--df-surface)] text-[var(--df-text-muted)]"
                    }`}
                  >
                    {abhaOn ? "On" : "Off"}
                  </button>
                </div>
                <p className="text-[10.5px] text-[var(--df-text-secondary)]">
                  Your dental records can be shared with other doctors you choose, through
                  India&apos;s health record system. You approve each request.
                </p>
              </div>
            </div>
          )}

          {/* Family */}
          {view === "family" && (
            <div className="p-4 space-y-3.5 text-xs">
              <h1 className="df-serif text-xl font-semibold">My family</h1>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { ini: "PD", name: "Priya", sub: "Me · 34", active: false },
                  { ini: "RD", name: "Rohit", sub: "Husband · 37", active: false },
                  { ini: "AD", name: "Aarav", sub: "Son · 7", active: true },
                  { ini: "+", name: "Add", sub: "Parent / child", active: false },
                ].map((m) => (
                  <div
                    key={m.name}
                    className={`p-2 rounded-xl border ${
                      m.active
                        ? "border-[var(--df-sidebar-bg)] bg-[var(--df-surface-muted)]"
                        : "border-[var(--df-border)]"
                    }`}
                  >
                    <div className="h-8 w-8 mx-auto rounded-full bg-[var(--df-teal-soft)] text-[var(--df-teal)] font-bold flex items-center justify-center">
                      {m.ini}
                    </div>
                    <p className="font-bold mt-1">{m.name}</p>
                    <p className="text-[9.5px] text-[var(--df-text-muted)]">{m.sub}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-4 bg-[var(--df-sidebar-bg)] text-white space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--df-sidebar-muted)]">
                  Family visit
                </p>
                <p className="df-serif text-base font-semibold">
                  All 3 check-ups due in October
                </p>
                <p className="text-[11px] text-[var(--df-sidebar-muted)]">
                  Book back-to-back on Sat 10 Oct, 10:00–11:30, in one trip.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Bundled family visit booked for Sat 10 Oct, 10:00–11:30")
                  }
                  className="w-full py-2 rounded-xl bg-[var(--df-unique-bg)] text-[var(--df-text)] font-bold text-xs cursor-pointer"
                >
                  Book family visit
                </button>
              </div>

              <div className="df-card p-3.5 space-y-2.5">
                <p className="font-bold">Aarav&apos;s timeline · age 7</p>
                {[
                  { age: "Age 1 · 2020", title: "First dental visit", sub: "Done", tone: "teal" },
                  {
                    age: "Age 6 · Mar 2026",
                    title: "Sealants on first molars",
                    sub: "Done · Dr. Arjun",
                    tone: "teal",
                  },
                  {
                    age: "Age 7 · Oct 2026",
                    title: "Orthodontic check",
                    sub: "Due now — visiting orthodontist Thu 8 Oct",
                    tone: "amber",
                  },
                  {
                    age: "Every 6 months",
                    title: "Check-up + fluoride",
                    sub: "Next: Oct 2026",
                    tone: "grey",
                  },
                  {
                    age: "Age 12",
                    title: "Second molar sealants",
                    sub: "Reminder set for 2031",
                    tone: "grey",
                  },
                ].map((ms) => (
                  <div key={ms.title} className="flex items-start gap-2.5 text-[11px]">
                    <span
                      className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${
                        ms.tone === "teal"
                          ? "bg-[var(--df-teal)]"
                          : ms.tone === "amber"
                          ? "bg-[var(--df-unique-text)]"
                          : "bg-[var(--df-border-strong)]"
                      }`}
                    />
                    <div>
                      <p className="text-[10px] text-[var(--df-text-muted)]">{ms.age}</p>
                      <p className="font-bold text-[var(--df-text)]">{ms.title}</p>
                      <p
                        className={
                          ms.tone === "amber"
                            ? "text-[var(--df-unique-text)] font-semibold"
                            : "text-[var(--df-text-muted)]"
                        }
                      >
                        {ms.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recovery check-in */}
          {view === "recovery" && (
            <div className="p-4 space-y-4 text-xs">
              <div>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  Day 3 after tooth removal · 48
                </p>
                <h1 className="df-serif text-xl font-semibold mt-0.5">
                  How are you feeling, Rohan?
                </h1>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1.5">
                  <span>Pain right now</span>
                  <span className="df-serif text-lg text-[var(--df-status-red-text)]">
                    {rohanPain}/10
                  </span>
                </div>
                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRohanPain(i)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        rohanPain === i
                          ? "bg-[var(--df-status-red-text)] text-white border-[var(--df-status-red-text)]"
                          : "bg-[var(--df-surface)] border-[var(--df-border)]"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Swelling in cheek?", val: swelling, set: setSwelling },
                  { label: "Fever?", val: fever, set: setFever },
                  { label: "Bleeding that won't stop?", val: bleeding, set: setBleeding },
                  { label: "Bad taste or smell?", val: badTaste, set: setBadTaste },
                ].map((q) => (
                  <div
                    key={q.label}
                    className="df-card p-2.5 flex items-center justify-between"
                  >
                    <span className="font-semibold">{q.label}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => q.set(true)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          q.val
                            ? "bg-[var(--df-sidebar-bg)] text-white"
                            : "bg-[var(--df-surface-muted)]"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => q.set(false)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          !q.val
                            ? "bg-[var(--df-sidebar-bg)] text-white"
                            : "bg-[var(--df-surface-muted)]"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => toast.info("Photo attached to post-op check-in")}
                className="w-full df-btn-secondary py-2 text-xs cursor-pointer"
              >
                Add a photo of the area (optional)
              </button>

              {(rohanPain >= 7 || swelling || fever) && (
                <div className="p-3 rounded-xl bg-[var(--df-alert-red-bg)] border border-[var(--df-status-red-border)] text-[11px] text-[var(--df-status-red-text)] leading-relaxed">
                  We&apos;ve told Dr. Farhan. The clinic will call you within 30 minutes. If
                  swelling spreads to your eye or neck, or you have a fever, go to the nearest
                  hospital.
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  updateState((prev) => ({
                    ...prev,
                    postOpCases: prev.postOpCases.map((p) =>
                      p.id === "po-1" ? { ...p, painScore: rohanPain, status: "Alert" } : p,
                    ),
                  }));
                  toast.success("Post-op check-in sent to Dr. Farhan & clinic alert desk");
                }}
                className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
              >
                Send to my dentist
              </button>
            </div>
          )}

          {/* Aligner progress */}
          {view === "aligner" && (
            <div className="p-4 space-y-3.5 text-xs">
              <div>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  Kavya Reddy · aligners with Dr. Karan Shah
                </p>
                <h1 className="df-serif text-xl font-semibold mt-0.5">Tray 10 of 24</h1>
                <div
                  className="grid gap-0.5 mt-2"
                  style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full ${
                        i < 10 ? "bg-[var(--df-teal)]" : "bg-[var(--df-border)]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="df-card p-3">
                  <p className="text-[10.5px] text-[var(--df-text-muted)]">Worn today</p>
                  <p className="df-serif text-lg font-semibold mt-0.5">20 h 40 m</p>
                  <p className="text-[10.5px] text-[var(--df-status-green-text)] font-semibold">
                    Goal 22 h · on track
                  </p>
                </div>
                <div className="df-card p-3">
                  <p className="text-[10.5px] text-[var(--df-text-muted)]">Next tray</p>
                  <p className="df-serif text-lg font-semibold mt-0.5">In 3 days</p>
                  <p className="text-[10.5px] text-[var(--df-text-muted)]">
                    Fri 2 Oct, at night
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning((v) => !v);
                    toast.info(
                      timerRunning
                        ? "Trays back in · wear timer resumed"
                        : "Trays out timer started · reminder in 30 min",
                    );
                  }}
                  className="py-2.5 rounded-xl bg-[var(--df-sidebar-bg)] text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timerRunning ? "Trays back in" : "Trays out · start timer"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.success("Tray 10 progress selfie logged")}
                  className="df-btn-secondary py-2.5 text-xs cursor-pointer"
                >
                  Log photo
                </button>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold">Your smile, month by month</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="h-20 rounded-xl bg-[var(--df-unique-bg)]/60 border border-[var(--df-border)]" />
                    <p className="text-[10.5px] text-[var(--df-text-muted)] mt-1">
                      Start · May 2026
                    </p>
                  </div>
                  <div>
                    <div className="h-20 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)]" />
                    <p className="text-[10.5px] text-[var(--df-text-muted)] mt-1">
                      Now · Sep 2026
                    </p>
                  </div>
                </div>
              </div>

              <label className="df-card p-3 flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-[11px] text-[var(--df-text-secondary)]">
                  Let the clinic use my before/after (face hidden)
                </span>
                <input
                  type="checkbox"
                  checked={alignerConsent}
                  onChange={(e) => setAlignerConsent(e.target.checked)}
                  className="accent-[var(--df-teal)] h-4 w-4 rounded"
                />
              </label>

              <p className="text-[11px] text-[var(--df-text-muted)]">
                Next check: Thu 8 Oct, 12:00 at Civil Lines
              </p>
            </div>
          )}
        </div>

        {/* Bottom PWA Tab Bar */}
        {showBottomNav && (
          <nav className="border-t border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-2 grid grid-cols-5 text-center">
            {[
              { id: "home" as PatientAppView, label: "Home", icon: Home },
              { id: "book" as PatientAppView, label: "Book", icon: Calendar },
              { id: "records" as PatientAppView, label: "Records", icon: FileText },
              { id: "family" as PatientAppView, label: "Family", icon: Users },
              { id: "payments" as PatientAppView, label: "Pay", icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold cursor-pointer ${
                    active ? "text-[var(--df-teal)]" : "text-[var(--df-text-muted)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export default function PatientPortalPage() {
  return (
    <DentflowProvider>
      <Suspense fallback={<div className="min-h-screen df-canvas" />}>
        <PatientAppInner />
      </Suspense>
    </DentflowProvider>
  );
}
