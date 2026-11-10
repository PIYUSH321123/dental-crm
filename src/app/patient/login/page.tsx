"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function PatientOtpLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+91 98230 11210");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("482910");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
    toast.info(`6-digit OTP sent to ${phone}`);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/dentflow/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PATIENT_OTP",
          phone,
          name: "Priya Deshmukh",
        }),
      });
      const data = await res.json();
      if (data?.redirectTo) {
        toast.success("Welcome back, Priya");
        router.push(data.redirectTo);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen df-canvas flex flex-col justify-between p-4">
      <div className="max-w-sm mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--df-text-secondary)] hover:text-[var(--df-teal)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <Link href="/login" className="text-xs font-semibold text-[var(--df-teal)] hover:underline">
          Clinic staff login →
        </Link>
      </div>

      <div className="max-w-sm mx-auto w-full my-8 df-card p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--df-teal)] flex items-center justify-center text-white font-bold">
            W
          </div>
          <div>
            <span className="df-serif text-lg font-semibold text-[var(--df-text)] block leading-none">
              Smile Studio Dental
            </span>
            <span className="text-[10.5px] text-[var(--df-text-muted)]">Patient portal</span>
          </div>
        </div>

        <div>
          <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
            Sign in with mobile OTP
          </h1>
          <p className="text-xs text-[var(--df-text-muted)] mt-1">
            View appointments, treatment explainers, prescriptions, X-rays, and family records.
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Registered mobile number</label>
              <div className="relative">
                <Smartphone className="h-3.5 w-3.5 text-[var(--df-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] pl-9 pr-3 py-2.5"
                />
              </div>
            </div>
            <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
              Send 6-digit OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">Enter 6-digit OTP</label>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-[11px] font-semibold text-[var(--df-teal)] hover:underline cursor-pointer"
                >
                  Change number
                </button>
              </div>
              <input
                required
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5 text-center df-mono text-base tracking-[0.35em] font-bold"
              />
              <p className="text-[11px] text-[var(--df-text-muted)] mt-1">Sent to {phone}</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full df-btn-primary py-2.5 text-xs cursor-pointer disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & open patient app"}
            </button>
          </form>
        )}
      </div>

      <div />
    </div>
  );
}
