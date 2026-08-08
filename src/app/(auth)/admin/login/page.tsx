import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata: Metadata = {
  title: "Sign in · Super admin",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6 relative overflow-hidden transition-colors duration-300">
      {/* Premium adaptive radial gradient behind the card (navy/violet glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,rgba(139,92,246,0.03)_40%,transparent_80%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,rgba(139,92,246,0.06)_35%,transparent_80%)] pointer-events-none" />

      {/* Faint grid pattern texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
      />

      <div className="w-full max-w-md rounded-2xl border border-border bg-card/70 backdrop-blur-md p-8 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.05)] relative z-10">
        <div className="flex flex-col items-center text-center mb-7">
          {/* Shield Badge with faint colored violet/indigo halo glow */}
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/25 dark:border-violet-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(139,92,246,0.1)] dark:shadow-[0_0_20px_rgba(139,92,246,0.15)] relative">
            <div className="absolute inset-0 rounded-xl bg-violet-500/10 blur-xs" />
            <ShieldCheck className="h-5.5 w-5.5 text-violet-600 dark:text-violet-400 relative z-10" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">
            Super admin access
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
            Restricted to authorized salesguru CRM administrators.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
