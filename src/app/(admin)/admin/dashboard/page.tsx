"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DentflowProvider, useDentflow } from "@/lib/dentflow-store";
import {
  DentflowDrawer,
  DentflowKpiCard,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";

function SuperAdminInner() {
  const { state, updateState } = useDentflow();
  const [activeTab, setActiveTab] = useState("Clinics");
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [groupName, setGroupName] = useState("Viman Nagar Dental Studio");
  const [plan, setPlan] = useState<"Starter" | "Growth" | "Chain">("Growth");

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    updateState((prev) => ({
      ...prev,
      tenantAccounts: [
        {
          id: `ten-${Date.now()}`,
          clinicGroup: groupName,
          branchesLabel: plan === "Starter" ? "Single clinic" : "2 branches",
          plan,
          branchesCount: plan === "Starter" ? 1 : 2,
          mrrLabel: plan === "Starter" ? "₹4,999" : "₹14,999",
          whatsappCredits: 2500,
          lastActive: "Now",
          health: "Healthy",
        },
        ...prev.tenantAccounts,
      ],
    }));
    setOnboardOpen(false);
    toast.success(`Onboarded ${groupName} (${plan} plan)`);
  };

  return (
    <div className="min-h-screen df-canvas">
      {/* Top Dark Admin Header matching A01 */}
      <header className="bg-[var(--df-admin-header)] text-white px-6 py-3.5">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-baseline gap-1.5">
              <span className="df-serif text-lg font-semibold">DentFlow</span>
              <span className="text-xs text-white/70">platform admin</span>
            </div>
            <nav className="flex flex-wrap items-center gap-1.5">
              {[
                "Clinics",
                "Plans & billing",
                "Messaging",
                "AI usage",
                "Support",
                "Compliance",
              ].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeTab === tab
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/75">Internal · all access logged</span>
            <Link
              href="/c/smile-studio/dashboard"
              className="text-[#6EE7B7] hover:underline font-semibold"
            >
              Open Smile Studio →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1360px] mx-auto p-5 sm:p-6 space-y-5">
        {/* 5 Platform KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <DentflowKpiCard
            label="Active clinic groups"
            value="24"
            subtext="+4 this quarter"
            subtextTone="green"
          />
          <DentflowKpiCard
            label="Branches"
            value="61"
            subtext="avg per group 2.5"
          />
          <DentflowKpiCard
            label="MRR"
            value="₹3,42,000"
            subtext="net of refunds"
          />
          <DentflowKpiCard
            label="WhatsApp messages (30 d)"
            value="1,84,200"
            subtext="cost pass-through"
          />
          <DentflowKpiCard
            label="AI minutes (voice)"
            value="4,910"
            subtext="billed per minute"
          />
        </div>

        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 8-col Clinic accounts */}
          <div className="xl:col-span-8 df-card p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-sm font-bold text-[var(--df-text)]">Clinic accounts</h1>
              <button
                type="button"
                onClick={() => setOnboardOpen(true)}
                className="df-btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Onboard clinic
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2 pr-2 text-left">Clinic group</th>
                    <th className="py-2 px-2 text-left">Plan</th>
                    <th className="py-2 px-2 text-center">Branches</th>
                    <th className="py-2 px-2 text-right">MRR</th>
                    <th className="py-2 px-2 text-right">WhatsApp credits</th>
                    <th className="py-2 px-2 text-left">Last active</th>
                    <th className="py-2 pl-2 text-right">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--df-border)]">
                  {state.tenantAccounts.map((t) => (
                    <tr key={t.id} className="hover:bg-[var(--df-surface-hover)]/60">
                      <td className="py-2.5 pr-2">
                        <p className="font-bold text-[var(--df-text)]">{t.clinicGroup}</p>
                        <p className="text-[11px] text-[var(--df-text-muted)]">
                          {t.branchesLabel}
                        </p>
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">{t.plan}</td>
                      <td className="py-2.5 px-2 text-center font-semibold">
                        {t.branchesCount}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold">{t.mrrLabel}</td>
                      <td className="py-2.5 px-2 text-right font-semibold">
                        {t.whatsappCredits.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-muted)]">
                        {t.lastActive}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <DentflowStatusPill
                          label={t.health}
                          tone={
                            t.health === "Healthy"
                              ? "green"
                              : t.health === "At risk"
                              ? "amber"
                              : t.health === "Trial"
                              ? "blue"
                              : "red"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4-col Plans & feature flags + DPDP requests */}
          <div className="xl:col-span-4 space-y-4">
            <div className="df-card p-5 space-y-3 text-xs">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Plans &amp; feature flags
              </h2>
              <div className="divide-y divide-[var(--df-border)]">
                <div className="py-2.5">
                  <div className="flex justify-between font-bold">
                    <span>Starter · 1 clinic</span>
                    <span>₹4,999/mo</span>
                  </div>
                  <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                    Calendar, records, billing, WhatsApp reminders, patient app
                  </p>
                </div>
                <div className="py-2.5">
                  <div className="flex justify-between font-bold">
                    <span>Growth · up to 3 branches</span>
                    <span>₹14,999/mo</span>
                  </div>
                  <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                    + recovery engine, gap filler, explainers, post-op, costing
                  </p>
                </div>
                <div className="py-2.5">
                  <div className="flex justify-between font-bold">
                    <span>Chain · 4+ branches</span>
                    <span>Custom</span>
                  </div>
                  <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                    + group dashboard, specialists, voice AI, API, SSO
                  </p>
                </div>
              </div>
            </div>

            <div className="df-card p-5 space-y-2.5 text-xs">
              <h2 className="text-sm font-bold text-[var(--df-text)]">DPDP requests</h2>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Access requests (open)</span>
                <span className="font-bold">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Deletion requests (open)</span>
                <span className="font-bold">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Breach notices</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--df-text-muted)]">Oldest open request</span>
                <span className="font-bold">4 days</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DentflowDrawer
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        title="Onboard new dental clinic group"
        subtitle="Provisions tenant isolation, WhatsApp credits & DPDP defaults"
      >
        <form onSubmit={handleOnboard} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Clinic group name
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Subscription tier
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as "Starter" | "Growth" | "Chain")}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            >
              <option value="Starter">Starter · 1 clinic</option>
              <option value="Growth">Growth · up to 3 branches</option>
              <option value="Chain">Chain · 4+ branches</option>
            </select>
          </div>
          <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
            Provision tenant
          </button>
        </form>
      </DentflowDrawer>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <DentflowProvider>
      <SuperAdminInner />
    </DentflowProvider>
  );
}
