"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("sneha@smilestudio.in");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Password reset link sent to your email");
  };

  return (
    <div className="min-h-screen df-canvas flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md mx-auto w-full">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--df-text-secondary)] hover:text-[var(--df-teal)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>

      <div className="max-w-md mx-auto w-full my-8 df-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--df-teal)] flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="df-serif text-xl font-semibold text-[var(--df-text)]">DentFlow</span>
        </div>

        <div>
          <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
            Reset your password
          </h1>
          <p className="text-xs text-[var(--df-text-muted)] mt-1">
            Enter your registered clinic email address and we will send a secure reset link.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--df-status-green-bg)] border border-[var(--df-status-green-border)] text-[var(--df-status-green-text)] flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Reset link sent</p>
                <p className="mt-0.5">
                  We sent password reset instructions to <strong>{email}</strong>. The link expires
                  in 30 minutes.
                </p>
              </div>
            </div>
            <Link href="/login" className="w-full df-btn-primary py-2.5 text-xs block text-center">
              Return to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Registered work email</label>
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
            <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
              Send reset link
            </button>
          </form>
        )}
      </div>

      <div />
    </div>
  );
}

