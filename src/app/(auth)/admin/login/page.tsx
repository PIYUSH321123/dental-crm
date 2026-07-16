import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata: Metadata = {
  title: "Sign in · Super admin",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-11 w-11 rounded-lg bg-zinc-800 flex items-center justify-center mb-3.5">
            <ShieldCheck className="h-5 w-5 text-zinc-200" />
          </div>
          <h1 className="text-xl font-medium text-zinc-100 mb-1">
            Super admin access
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Restricted to authorized PhysioYoga CRM administrators.
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
