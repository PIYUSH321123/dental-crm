"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "Dr. Kavita Sharma",
    clinicGroupName: "Nova Smile Dental",
    email: "kavita@novasmiledental.in",
    phone: "+91 98220 44100",
    city: "Pune, Maharashtra",
    password: "••••••••••••",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/dentflow/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SIGNUP_OWNER",
          ...form,
        }),
      });
      const data = await res.json();
      if (data?.redirectTo) {
        toast.success("Clinic owner account created — starting 8-step clinic setup wizard");
        router.push(data.redirectTo);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen df-canvas flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-lg mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--df-text-secondary)] hover:text-[var(--df-teal)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to DentFlow home</span>
        </Link>
      </div>

      <div className="max-w-lg mx-auto w-full my-8 df-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--df-teal)] flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="df-serif text-xl font-semibold text-[var(--df-text)]">DentFlow</span>
        </div>

        <div>
          <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
            Create your clinic owner account
          </h1>
          <p className="text-xs text-[var(--df-text-muted)] mt-1">
            14-day free trial · Next, configure your branches, chairs, staff, and WhatsApp in the
            one-time setup wizard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Owner full name</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Clinic / group name</label>
              <input
                required
                type="text"
                value={form.clinicGroupName}
                onChange={(e) => setForm({ ...form, clinicGroupName: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Work email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Mobile number</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Primary city</label>
              <input
                required
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Create password</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-1 text-[11px] text-[var(--df-text-secondary)]">
            <p className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--df-teal)]" />
              Includes full Growth plan features during your 14-day trial
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--df-teal)]" />
              Guided setup for chairs, working hours, staff roles, fees & WhatsApp
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full df-btn-primary py-2.5 text-xs cursor-pointer disabled:opacity-60"
          >
            {submitting ? "Creating clinic workspace..." : "Continue to clinic setup wizard →"}
          </button>
        </form>

        <div className="pt-3 border-t border-[var(--df-border)] flex items-center justify-between text-xs">
          <span className="text-[var(--df-text-muted)]">Already have an account?</span>
          <Link href="/login" className="font-semibold text-[var(--df-teal)] hover:underline">
            Sign in →
          </Link>
        </div>
      </div>

      <div />
    </div>
  );
}
