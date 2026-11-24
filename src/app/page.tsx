"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Check,
  Clock,
  FilePlay,
  LayoutDashboard,
  Menu,
  PhoneCall,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DentflowSessionPayload,
  getDefaultRedirectForSession,
} from "@/lib/dentflow-session";

const FEATURES = [
  {
    title: "AI X-ray scan",
    tag: "Unique",
    desc: "Detects caries, periapical lesions, and restorations on IOPA and OPG radiographs with FDI tooth mapping — ready for dentist sign-off.",
    icon: ScanLine,
  },
  {
    title: "Treatment explainer",
    tag: "Unique",
    desc: "Turns X-rays and treatment plans into narrated 8-language visual explainers on WhatsApp with doctor-approval lock and EMI options.",
    icon: FilePlay,
  },
  {
    title: "Gap filler",
    tag: "Unique",
    desc: "When a patient cancels, DentFlow automatically messages matched waitlisted patients in waves of 3 with a 10-minute priority hold.",
    icon: Clock,
  },
  {
    title: "Treatment recovery",
    tag: "Unique",
    desc: "Follows up on unbooked root canals, crowns, and implants across Day 3–45 sequences and stops automatically the moment they book.",
    icon: RefreshCw,
  },
  {
    title: "Post-op check-ins",
    tag: "Unique",
    desc: "Automated Day 1, Day 3, and Day 7 WhatsApp check-ins after extractions, root canals, and implants — alerting doctors if pain spikes.",
    icon: Activity,
  },
  {
    title: "Voice AI receptionist",
    tag: "Unique",
    desc: "Answers clinic phone calls in Hindi, Marathi, and English 24/7, books chairs, quotes standard fees, and escalates emergencies.",
    icon: PhoneCall,
  },
];

const PRICING = [
  {
    name: "Starter",
    subtitle: "1 clinic",
    price: "₹4,999",
    period: "/mo",
    highlighted: false,
    items: [
      "Chair & doctor calendar with anxiety buffers",
      "FDI dental chart, prescriptions & allergy alerts",
      "GST billing, dynamic UPI QR & Tally export",
      "WhatsApp appointment reminders & patient app",
    ],
  },
  {
    name: "Growth",
    subtitle: "Up to 3 branches",
    price: "₹14,999",
    period: "/mo",
    highlighted: true,
    items: [
      "Everything in Starter across up to 3 branches",
      "AI X-ray scan & 8-language treatment explainers",
      "Automated gap filler & treatment recovery engine",
      "Post-op check-ins, autoclave kit trace & costing",
    ],
  },
  {
    name: "Chain",
    subtitle: "4+ branches",
    price: "Custom",
    period: "",
    highlighted: false,
    items: [
      "Group owner dashboard, cohort insights & P&L",
      "Visiting specialist scheduling & TDS 194J payroll",
      "24/7 Hindi/Marathi/English Voice AI receptionist",
      "ABDM / ABHA integration, custom API & SSO",
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Case acceptance jumped from 44% to 68% within two months of sending Hindi and Marathi treatment explainers on WhatsApp.",
    author: "Dr. Sneha Kulkarni",
    role: "Founder, Smile Studio Dental (3 branches, Pune)",
  },
  {
    quote:
      "Gap filler recovered ₹1.46 lakh in cancelled chair time last month alone without my front desk making a single cold call.",
    author: "Dr. Vikramaditya Rao",
    role: "Director, Apex Dental & Implant Centre, Bengaluru",
  },
  {
    quote:
      "Every autoclave pouch is traced to the patient chair, and our visiting endodontist sees his live schedule and commission split on his phone.",
    author: "Dr. Meera Iyer",
    role: "Consultant Endodontist, Mumbai",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: "Dr. Kavita Sharma",
    clinicGroupName: "Nova Smile Dental",
    email: "kavita@novasmiledental.in",
    phone: "+91 98220 44100",
    city: "Pune, Maharashtra",
    password: "••••••••••••",
  });
  const [activeSession, setActiveSession] = useState<DentflowSessionPayload | null>(null);
  const [demoForm, setDemoForm] = useState({
    name: "",
    clinic: "",
    phone: "",
    email: "",
    city: "",
    preferredDateTime: "",
    branches: "1–3 branches",
    message: "",
    honeypot: "",
  });

  useEffect(() => {
    let mounted = true;
    fetch("/api/dentflow/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.session) {
          setActiveSession(data.session);
        }
      })
      .catch(() => {});

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get("signup") === "true" ||
        params.get("trial") === "true" ||
        window.location.hash === "#signup"
      ) {
        setSignupModalOpen(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const dashboardHref = "/login";

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/dentflow/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "BOOK_DEMO", payload: demoForm }),
      });
    } catch {}
    setDemoSubmitted(true);
    toast.success("Demo request received — our dental onboarding specialist will call within 2 hours.");
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupSubmitting(true);
    try {
      const res = await fetch("/api/dentflow/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SIGNUP_OWNER",
          ...signupForm,
        }),
      });
      const data = await res.json();
      if (data?.redirectTo) {
        toast.success("14-day free trial activated! Welcome to DentFlow");
        setSignupModalOpen(false);
        router.push(data.redirectTo);
        router.refresh();
      } else {
        toast.error("Failed to activate trial. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSignupSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen df-canvas flex flex-col">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--df-canvas)]/95 backdrop-blur border-b border-[var(--df-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--df-teal)] flex items-center justify-center text-white font-bold text-base">
              W
            </div>
            <span className="df-serif text-xl font-semibold text-[var(--df-text)] tracking-tight">
              DentFlow
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[var(--df-text-secondary)]">
            <a href="#features" className="hover:text-[var(--df-teal)] transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-[var(--df-teal)] transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="hover:text-[var(--df-teal)] transition-colors">
              Testimonials
            </a>
            <Link href="/patient/login" className="hover:text-[var(--df-teal)] transition-colors">
              Patient app
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href={dashboardHref}
              className="df-btn-secondary px-3.5 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-[var(--df-teal)]" />
              <span>Dashboard</span>
            </Link>
            {!activeSession && (
              <Link href="/login" className="df-btn-secondary px-3.5 py-2 text-xs">
                Log in
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setDemoSubmitted(false);
                setDemoModalOpen(true);
              }}
              className="df-btn-secondary px-3.5 py-2 text-xs cursor-pointer"
            >
              Book a demo
            </button>
            <button
              type="button"
              onClick={() => setSignupModalOpen(true)}
              className="df-btn-primary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Start free trial
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--df-border)] bg-[var(--df-surface)] px-4 py-4 space-y-3">
            <div className="flex flex-col gap-2 text-xs font-semibold text-[var(--df-text-secondary)]">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Features
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Pricing
              </a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Testimonials
              </a>
              <Link href="/patient/login" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Patient OTP login
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--df-border)]">
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className={`${activeSession ? "col-span-2" : ""} df-btn-secondary py-2 text-center text-xs inline-flex items-center justify-center gap-1.5`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[var(--df-teal)]" />
                <span>Dashboard</span>
              </Link>
              {!activeSession && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="df-btn-secondary py-2 text-center text-xs"
                >
                  Log in
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSignupModalOpen(true);
                }}
                className="col-span-2 df-btn-primary py-2 text-center text-xs font-semibold cursor-pointer"
              >
                Start free trial
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[11px] font-bold text-[var(--df-teal)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Multi-branch Dental CRM · DPDP & ABDM Ready</span>
            </div>

            <h1 className="df-serif text-3xl sm:text-5xl font-semibold text-[var(--df-text)] tracking-tight leading-[1.12]">
              Run every dental chair, treatment plan, and follow-up on autopilot.
            </h1>

            <p className="text-sm sm:text-base text-[var(--df-text-secondary)] leading-relaxed max-w-xl">
              DentFlow connects chair scheduling, FDI charting, AI X-ray analysis, 8-language
              WhatsApp treatment explainers, gap filling, post-op monitoring, and GST + UPI
              AutoPay billing in one calm workspace.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={dashboardHref}
                className="df-btn-primary px-5 py-3 text-xs sm:text-sm inline-flex items-center gap-2 font-semibold"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setSignupModalOpen(true)}
                className="df-btn-secondary px-5 py-3 text-xs sm:text-sm inline-flex items-center gap-2 font-semibold cursor-pointer"
              >
                <span>Start free 14-day trial</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDemoSubmitted(false);
                  setDemoModalOpen(true);
                }}
                className="df-btn-secondary px-4 py-3 text-xs sm:text-sm cursor-pointer"
              >
                Book a demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-[11px] text-[var(--df-text-muted)] font-medium">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--df-teal)]" />
                DPDP patient access logging
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[var(--df-teal)]" />
                Zero PHI in WhatsApp messages
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[var(--df-teal)]" />
                Exempt vs 18% cosmetic GST
              </span>
            </div>
          </div>

          {/* Live Product Snapshot Card */}
          <div className="lg:col-span-5">
            <div className="df-card p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    Live Clinic Pulse · Station Road
                  </p>
                  <p className="df-serif text-lg font-semibold text-[var(--df-text)] mt-0.5">
                    Good morning, Dr. Sneha
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] border border-[var(--df-status-green-border)]">
                  4 chairs active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)]">
                  <p className="text-[11px] text-[var(--df-text-muted)]">Collected today</p>
                  <p className="df-serif text-2xl font-semibold text-[var(--df-text)] mt-0.5">
                    ₹48,200
                  </p>
                  <p className="text-[10.5px] text-[var(--df-status-green-text)] font-medium mt-0.5">
                    UPI 71% · card 18% · cash 11%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)]">
                  <p className="text-[11px] text-[var(--df-teal)] font-medium">Gaps filled</p>
                  <p className="df-serif text-2xl font-semibold text-[var(--df-text)] mt-0.5">
                    23 / 31
                  </p>
                  <p className="text-[10.5px] text-[var(--df-teal)] font-medium mt-0.5">
                    ₹1,46,500 recovered · 14 min avg
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--df-sidebar-bg)] text-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--df-unique-dark-bg)] text-[var(--df-unique-dark-text)]">
                    AI receptionist
                  </span>
                  <span className="text-[11px] text-[var(--df-sidebar-muted)]">Since 8:00 am</span>
                </div>
                <p className="df-serif text-lg font-semibold">23 calls handled · 6 booked</p>
                <p className="text-[11px] text-[var(--df-sidebar-muted)]">
                  Hindi, Marathi & English · zero missed inquiries
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[var(--df-text-muted)]">Explore interactive CRM</span>
                <Link
                  href={dashboardHref}
                  className="font-semibold text-[var(--df-teal)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-[var(--df-border)] bg-[var(--df-surface)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
              Built for clinical precision & revenue retention
            </p>
            <h2 className="df-serif text-2xl sm:text-3xl font-semibold text-[var(--df-text)]">
              Six workflows that separate DentFlow from generic clinic software
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="df-card p-5 space-y-3 bg-[var(--df-surface-muted)]">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] flex items-center justify-center text-[var(--df-teal)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--df-unique-bg)] text-[var(--df-unique-text)] border border-[var(--df-unique-border)]">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--df-text)]">{f.title}</h3>
                  <p className="text-xs text-[var(--df-text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
            Transparent pricing
          </p>
          <h2 className="df-serif text-2xl sm:text-3xl font-semibold text-[var(--df-text)]">
            Plans that grow from a single chair to a multi-city chain
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`df-card p-6 flex flex-col justify-between space-y-6 ${
                plan.highlighted
                  ? "border-[var(--df-teal)] ring-2 ring-[var(--df-teal)]/20 bg-[var(--df-surface)]"
                  : "bg-[var(--df-surface)]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="df-serif text-xl font-semibold text-[var(--df-text)]">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[var(--df-text-muted)]">{plan.subtitle}</p>
                  </div>
                  {plan.highlighted && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)]">
                      Most popular
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="df-serif text-3xl font-semibold text-[var(--df-text)]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xs text-[var(--df-text-muted)]">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-2.5 text-xs text-[var(--df-text-secondary)]">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[var(--df-teal)] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.name === "Chain" ? (
                <button
                  type="button"
                  onClick={() => {
                    setDemoSubmitted(false);
                    setDemoModalOpen(true);
                  }}
                  className="w-full df-btn-secondary py-2.5 text-xs cursor-pointer"
                >
                  Book a demo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSignupModalOpen(true)}
                  className={`w-full py-2.5 text-xs text-center block cursor-pointer font-semibold ${
                    plan.highlighted ? "df-btn-primary" : "df-btn-secondary"
                  }`}
                >
                  Start free trial
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="border-t border-[var(--df-border)] bg-[var(--df-surface)] py-16"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
              Trusted by Indian dental practices
            </p>
            <h2 className="df-serif text-2xl sm:text-3xl font-semibold text-[var(--df-text)]">
              Built with clinicians, front-desk teams, and visiting specialists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="df-card p-5 space-y-3 bg-[var(--df-surface-muted)]">
                <div className="flex gap-0.5 text-[#D97706]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[var(--df-text)] leading-relaxed">“{t.quote}”</p>
                <div className="pt-2 border-t border-[var(--df-border)]">
                  <p className="text-xs font-bold text-[var(--df-text)]">{t.author}</p>
                  <p className="text-[11px] text-[var(--df-text-muted)]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="rounded-2xl bg-[var(--df-sidebar-bg)] text-white p-7 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="df-serif text-2xl sm:text-3xl font-semibold">
              Set up your clinic branches, chairs, and WhatsApp reminders in 5 minutes.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--df-sidebar-muted)]">
              Guided 8-step clinic onboarding wizard with role-based permissions out of the box.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href={dashboardHref}
              className="px-5 py-3 rounded-xl bg-[var(--df-teal)] hover:bg-[var(--df-teal-hover)] text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Open dashboard</span>
            </Link>
            <button
              type="button"
              onClick={() => setSignupModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold cursor-pointer"
            >
              Start 14-day free trial
            </button>
            <button
              type="button"
              onClick={() => {
                setDemoSubmitted(false);
                setDemoModalOpen(true);
              }}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold cursor-pointer"
            >
              Book a demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--df-border)] py-8 text-xs text-[var(--df-text-muted)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="df-serif font-semibold text-[var(--df-text)]">DentFlow</span>
            <span>· Multi-Branch Dental CRM & Patient Platform</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-medium">
            <Link href={dashboardHref} className="hover:text-[var(--df-teal)]">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-[var(--df-teal)]">
              Clinic & staff login
            </Link>
            <button
              type="button"
              onClick={() => setSignupModalOpen(true)}
              className="hover:text-[var(--df-teal)] cursor-pointer text-left"
            >
              Clinic owner sign up
            </button>
            <Link href="/patient/login" className="hover:text-[var(--df-teal)]">
              Patient OTP login
            </Link>
          </div>
        </div>
      </footer>

      {/* Book a Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="df-card w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-3">
              <div>
                <h3 className="df-serif text-lg font-semibold text-[var(--df-text)]">
                  Book a live DentFlow demo
                </h3>
                <p className="text-xs text-[var(--df-text-muted)]">
                  15-minute walkthrough tailored to your clinic size
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--df-surface-hover)] text-[var(--df-text-muted)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {demoSubmitted ? (
              <div className="py-4 space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[var(--df-status-green-bg)] border border-[var(--df-status-green-border)] text-[var(--df-status-green-text)] font-medium">
                  Thank you, {demoForm.name || "Doctor"}! We have scheduled a callback for{" "}
                  <strong>{demoForm.clinic || "your clinic"}</strong>.
                </div>
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(false)}
                  className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Your name</label>
                  <input
                    required
                    type="text"
                    placeholder="Dr. Rohan Kulkarni"
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Clinic name</label>
                  <input
                    required
                    type="text"
                    placeholder="Smile Studio Dental"
                    value={demoForm.clinic}
                    onChange={(e) => setDemoForm({ ...demoForm, clinic: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold mb-1">WhatsApp / phone</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98220 44100"
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Work email</label>
                    <input
                      type="email"
                      placeholder="dr@clinic.in"
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Pune / Mumbai"
                      value={demoForm.city}
                      onChange={(e) => setDemoForm({ ...demoForm, city: e.target.value })}
                      className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Branches</label>
                    <select
                      value={demoForm.branches}
                      onChange={(e) => setDemoForm({ ...demoForm, branches: e.target.value })}
                      className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                    >
                      <option>Single clinic</option>
                      <option>1–3 branches</option>
                      <option>4+ branches</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Preferred date & time</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow 3:00 PM"
                    value={demoForm.preferredDateTime}
                    onChange={(e) => setDemoForm({ ...demoForm, preferredDateTime: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Message / clinic needs (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Tell us about chairs, specialities, or current software..."
                    value={demoForm.message}
                    onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                  />
                </div>

                {/* Honeypot field for anti-spam protection */}
                <input
                  type="text"
                  name="website"
                  value={demoForm.honeypot}
                  onChange={(e) => setDemoForm({ ...demoForm, honeypot: e.target.value })}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
                  Request demo callback
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 14-Day Free Trial Signup Card Modal */}
      {signupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="df-card w-full max-w-lg p-6 sm:p-7 space-y-4 shadow-2xl bg-[var(--df-surface)] border border-[var(--df-border)] my-auto">
            <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[var(--df-teal)] flex items-center justify-center text-white font-bold text-base">
                  W
                </div>
                <div>
                  <h3 className="df-serif text-lg font-semibold text-[var(--df-text)]">
                    Start your 14-day free trial
                  </h3>
                  <p className="text-xs text-[var(--df-text-muted)]">
                    Full Growth plan access across all chairs · No credit card required
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSignupModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--df-surface-hover)] text-[var(--df-text-muted)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Owner full name</label>
                  <input
                    required
                    type="text"
                    placeholder="Dr. Kavita Sharma"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Clinic / group name</label>
                  <input
                    required
                    type="text"
                    placeholder="Nova Smile Dental"
                    value={signupForm.clinicGroupName}
                    onChange={(e) => setSignupForm({ ...signupForm, clinicGroupName: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Work email</label>
                  <input
                    required
                    type="email"
                    placeholder="dr@novasmile.in"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Mobile number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98220 44100"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">City</label>
                  <input
                    required
                    type="text"
                    placeholder="Pune / Mumbai"
                    value={signupForm.city}
                    onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Create password</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••••••"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-1.5 text-[11px] text-[var(--df-text-secondary)]">
                <p className="flex items-center gap-1.5 font-medium">
                  <Check className="h-3.5 w-3.5 text-[var(--df-teal)] shrink-0" />
                  <span>Instant 14-day free trial on Growth plan with all multi-chair features</span>
                </p>
                <p className="flex items-center gap-1.5 font-medium">
                  <Check className="h-3.5 w-3.5 text-[var(--df-teal)] shrink-0" />
                  <span>No credit card required · Set up chairs & WhatsApp reminders in 5 minutes</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={signupSubmitting}
                className="w-full df-btn-primary py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {signupSubmitting ? "Activating 14-day trial..." : "Start 14-day free trial →"}
              </button>

              <p className="text-center text-[11px] text-[var(--df-text-muted)]">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--df-teal)] font-semibold hover:underline">
                  Log in here
                </Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
