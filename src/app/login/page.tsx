"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { DentflowAuthRole } from "@/lib/dentflow-session";

const ROLE_OPTIONS: {
  role: DentflowAuthRole;
  label: string;
  doctorName?: string;
  email: string;
  sublabel: string;
  setupCompleted?: boolean;
}[] = [
  {
    role: "owner",
    label: "Dr. Sneha Kulkarni (Owner)",
    doctorName: "Dr. Sneha Kulkarni",
    email: "sneha@smilestudio.in",
    sublabel: "Principal dentist · Opens group dashboard",
    setupCompleted: true,
  },
  {
    role: "dentist",
    label: "Dr. Arjun Mehta (Associate Dentist)",
    doctorName: "Dr. Arjun Mehta",
    email: "arjun@smilestudio.in",
    sublabel: "Dentist · Opens Today clinical schedule",
  },
  {
    role: "visiting",
    label: "Dr. Farhan Ali (Visiting Specialist)",
    doctorName: "Dr. Farhan Ali",
    email: "farhan@smilestudio.in",
    sublabel: "Oral & maxillofacial surgeon · Opens schedule",
  },
  {
    role: "branch_manager",
    label: "Prakash Jha (Branch Manager)",
    email: "prakash@smilestudio.in",
    sublabel: "Opens Today front-desk & operations",
  },
  {
    role: "front_desk",
    label: "Anita Pawar (Front Desk)",
    email: "anita@smilestudio.in",
    sublabel: "Opens Today queue, calendar & billing",
  },
  {
    role: "assistant",
    label: "Ravi Gaikwad (Dental Assistant)",
    email: "ravi@smilestudio.in",
    sublabel: "Opens Today queue, sterilisation & inventory",
  },
  {
    role: "accounts",
    label: "Meenakshi Joshi (Accounts & Billing)",
    email: "accounts@smilestudio.in",
    sublabel: "Opens Today billing, P&L & payroll",
  },
  {
    role: "specialist",
    label: "Visiting Specialist External Portal",
    email: "specialist@smilestudio.in",
    sublabel: "Opens Specialist referral cases portal",
  },
  {
    role: "lab",
    label: "Precision Dental Lab Partner",
    email: "lab@precisionlab.in",
    sublabel: "Opens Dental lab CAD/CAM cases portal",
  },
  {
    role: "platform_admin",
    label: "Platform Admin",
    email: "admin@dentflow.in",
    sublabel: "Opens SaaS Admin multi-clinic portal",
  },
];

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("sneha@smilestudio.in");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const signInAs = async (
    role: DentflowAuthRole,
    setupCompleted?: boolean,
    customEmail?: string,
    doctorName?: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/dentflow/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOGIN",
          role,
          setupCompleted,
          email: customEmail || email,
          name: doctorName,
        }),
      });
      const data = await res.json();
      if (data?.redirectTo) {
        toast.success(`Signed in as ${data.session?.name || role}`);
        window.location.href = data.redirectTo;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lower = email.toLowerCase().trim();
    let chosen = ROLE_OPTIONS[selectedIdx] || ROLE_OPTIONS[0];

    // Smart doctor matching if user typed email
    if (lower.includes("arjun")) {
      chosen = ROLE_OPTIONS.find((r) => r.doctorName?.includes("Arjun")) || chosen;
    } else if (lower.includes("farhan")) {
      chosen = ROLE_OPTIONS.find((r) => r.doctorName?.includes("Farhan")) || chosen;
    } else if (lower.includes("sneha")) {
      chosen = ROLE_OPTIONS.find((r) => r.doctorName?.includes("Sneha")) || chosen;
    } else if (lower.includes("prakash")) {
      chosen = ROLE_OPTIONS.find((r) => r.label.includes("Prakash")) || chosen;
    } else if (lower.includes("anita")) {
      chosen = ROLE_OPTIONS.find((r) => r.label.includes("Anita")) || chosen;
    } else if (lower.includes("ravi")) {
      chosen = ROLE_OPTIONS.find((r) => r.label.includes("Ravi")) || chosen;
    } else if (lower.includes("accounts") || lower.includes("meenakshi")) {
      chosen = ROLE_OPTIONS.find((r) => r.label.includes("Meenakshi")) || chosen;
    }

    await signInAs(chosen.role, chosen.setupCompleted, email, chosen.doctorName);
  };

  return (
    <div className="min-h-screen df-canvas flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--df-text-secondary)] hover:text-[var(--df-teal)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to DentFlow home</span>
        </Link>
        <Link href="/patient/login" className="text-xs font-semibold text-[var(--df-teal)] hover:underline">
          Patient OTP login →
        </Link>
      </div>

      <div
        className={`mx-auto w-full my-8 ${
          IS_DEMO_MODE
            ? "max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            : "max-w-md"
        }`}
      >
        {/* Left / Primary: Standard Email & Password Login Card */}
        <div className={`${IS_DEMO_MODE ? "lg:col-span-6" : ""} df-card p-6 sm:p-7 space-y-5`}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--df-teal)] flex items-center justify-center text-white font-bold">
              W
            </div>
            <span className="df-serif text-xl font-semibold text-[var(--df-text)]">DentFlow</span>
          </div>

          <div>
            <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
              Sign in to your workspace
            </h1>
            <p className="text-xs text-[var(--df-text-muted)] mt-1">
              {searchParams.get("next")
                ? "Please sign in to continue to your requested portal."
                : IS_DEMO_MODE
                ? "Enter your work email or choose a role profile to test role-based access."
                : "Enter your clinic work email and password to sign in."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-[var(--df-text)]">Work email</label>
              <div className="relative">
                <Mail className="h-3.5 w-3.5 text-[var(--df-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] pl-9 pr-3 py-2.5"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[var(--df-text)]">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[var(--df-teal)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="h-3.5 w-3.5 text-[var(--df-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] pl-9 pr-3 py-2.5"
                />
              </div>
            </div>

            {IS_DEMO_MODE && (
              <div>
                <label className="block font-semibold mb-1 text-[var(--df-text)]">Account role (demo)</label>
                <select
                  aria-label="Account role"
                  value={selectedIdx}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedIdx(idx);
                    setEmail(ROLE_OPTIONS[idx].email);
                  }}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5 font-medium"
                >
                  {ROLE_OPTIONS.map((opt, idx) => (
                    <option key={`${opt.role}-${opt.label}`} value={idx}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full df-btn-primary py-2.5 text-xs cursor-pointer disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="pt-3 border-t border-[var(--df-border)] flex items-center justify-between text-xs">
            <span className="text-[var(--df-text-muted)]">New dental clinic?</span>
            <Link href="/signup" className="font-semibold text-[var(--df-teal)] hover:underline">
              Create clinic owner account →
            </Link>
          </div>
        </div>

        {/* Right: Role-Based Instant Sign-In Cards (Demo mode only) */}
        {IS_DEMO_MODE && (
          <div className="lg:col-span-6 df-card p-6 space-y-3.5">
            <div>
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Instant role-based sign-in
              </h2>
              <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
                Click any role below to verify its exact post-login redirect and route permissions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={`${opt.role}-${opt.label}`}
                  type="button"
                  disabled={loading}
                  onClick={() => signInAs(opt.role, opt.setupCompleted, opt.email, opt.doctorName)}
                  className="text-left p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] hover:border-[var(--df-teal)] hover:bg-[var(--df-teal-soft)]/35 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-[var(--df-text)]">{opt.label}</p>
                  <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">{opt.sublabel}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-[var(--df-text-muted)]">
        DentFlow Dental CRM · Role-scoped access & DPDP audit trail enabled
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen df-canvas" />}>
      <LoginFormInner />
    </Suspense>
  );
}

