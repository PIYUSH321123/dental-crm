"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
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
  const targetRedirect =
    searchParams.get("redirect") ||
    searchParams.get("returnTo") ||
    searchParams.get("next");
  const [ownerInfo, setOwnerInfo] = useState({
    name: "Dr. Sneha Kulkarni",
    email: "sneha@smilestudio.in",
  });
  const [email, setEmail] = useState("sneha@smilestudio.in");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dentflow/state")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.state?.clinicSetup?.ownerName) {
          const name = data.state.clinicSetup.ownerName;
          const ownerEmail = data.state.clinicSetup.ownerEmail || "sneha@smilestudio.in";
          setOwnerInfo({ name, email: ownerEmail });
          setEmail(ownerEmail);
        }
      })
      .catch(() => {});
  }, []);

  const roleOptions = useMemo(() => {
    return [
      {
        role: "owner" as DentflowAuthRole,
        label: `${ownerInfo.name} (Owner)`,
        doctorName: ownerInfo.name,
        email: ownerInfo.email,
        sublabel: "Principal dentist · Opens Today clinical dashboard",
        setupCompleted: true,
      },
      ...ROLE_OPTIONS.slice(1),
    ];
  }, [ownerInfo]);

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
          redirect: targetRedirect,
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
    let chosenRole: DentflowAuthRole = "owner";
    let chosenSetupCompleted = true;
    let chosenDoctorName: string | undefined = undefined;

    if (lower.includes("arjun")) {
      chosenRole = "dentist";
      chosenDoctorName = "Dr. Arjun Mehta";
    } else if (lower.includes("farhan")) {
      chosenRole = "visiting";
      chosenDoctorName = "Dr. Farhan Ali";
    } else if (
      lower.includes("sneha") ||
      lower === ownerInfo.email.toLowerCase() ||
      lower.includes("owner")
    ) {
      chosenRole = "owner";
      chosenDoctorName = ownerInfo.name;
    } else if (lower.includes("prakash")) {
      chosenRole = "branch_manager";
      chosenDoctorName = "Prakash Jha";
    } else if (lower.includes("anita")) {
      chosenRole = "front_desk";
      chosenDoctorName = "Anita Pawar";
    } else if (lower.includes("ravi")) {
      chosenRole = "assistant";
      chosenDoctorName = "Ravi Gaikwad";
    } else if (lower.includes("accounts") || lower.includes("meenakshi")) {
      chosenRole = "accounts";
      chosenDoctorName = "Meenakshi Joshi";
    } else if (lower.includes("admin")) {
      chosenRole = "platform_admin";
      chosenDoctorName = "Platform Admin";
    } else {
      // Default to owner with no forced name override so clinic's configured owner name is preserved
      chosenRole = "owner";
    }

    await signInAs(chosenRole, chosenSetupCompleted, email, chosenDoctorName);
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
              {targetRedirect
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
                    setEmail(roleOptions[idx].email);
                  }}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5 font-medium"
                >
                  {roleOptions.map((opt, idx) => (
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
              {roleOptions.map((opt) => (
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

