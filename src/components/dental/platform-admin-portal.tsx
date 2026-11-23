"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Filter, MessageSquare, Phone, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowKpiCard,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { DentflowProvider, useDentflow } from "@/lib/dentflow-store";
import { performDentflowLogout } from "@/lib/dentflow-session";
import { DemoRequestItem, TenantAccountRecord } from "@/types/dentflow";

const ADMIN_TABS = [
  "Clinics",
  "Leads & Demo requests",
  "Plans & billing",
  "Messaging",
  "AI usage",
  "Support",
  "Compliance",
] as const;

function PlatformAdminInner() {
  const router = useRouter();
  const { state, updateState } = useDentflow();
  const [activeTab, setActiveTab] = useState<(typeof ADMIN_TABS)[number]>("Clinics");
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [plan, setPlan] = useState<TenantAccountRecord["plan"]>("Growth");
  const [branchesCount, setBranchesCount] = useState(2);
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("All");

  const demoRequests = state.demoRequests || [];
  const newLeadsCount = demoRequests.filter((d) => d.status === "new").length;

  const filteredLeads = demoRequests.filter((lead) => {
    if (leadStatusFilter === "All") return true;
    return lead.status === leadStatusFilter;
  });

  const handleUpdateLeadStatus = (leadId: string, nextStatus: DemoRequestItem["status"]) => {
    updateState((prev) => ({
      ...prev,
      demoRequests: (prev.demoRequests || []).map((d) =>
        d.id === leadId ? { ...d, status: nextStatus } : d,
      ),
    }));
    toast.success(`Demo request status updated to ${nextStatus}`);
  };

  const handleUpdateLeadNote = (leadId: string, note: string) => {
    updateState((prev) => ({
      ...prev,
      demoRequests: (prev.demoRequests || []).map((d) =>
        d.id === leadId ? { ...d, notes: note } : d,
      ),
    }));
  };

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim()) return;
    const newAccount: TenantAccountRecord = {
      id: `ten-${Date.now()}`,
      clinicGroup: clinicName.trim(),
      branchesLabel: branchesCount === 1 ? "Single clinic" : `${branchesCount} branches`,
      plan,
      branchesCount,
      mrrLabel:
        plan === "Starter"
          ? "₹4,999"
          : plan === "Growth"
          ? "₹14,999"
          : plan === "Chain"
          ? "₹35,000"
          : "—",
      whatsappCredits: plan === "Trial" ? 500 : 5000,
      lastActive: "Just now",
      health: plan === "Trial" ? "Trial" : "Healthy",
    };
    updateState((prev) => ({
      ...prev,
      tenantAccounts: [newAccount, ...prev.tenantAccounts],
    }));
    toast.success(`Onboarded ${clinicName.trim()} on ${plan} plan`);
    setClinicName("");
    setOnboardOpen(false);
  };

  const handleLogout = async () => {
    toast.success("Logging out...");
    await performDentflowLogout();
  };

  const healthTone = (h: TenantAccountRecord["health"]) => {
    if (h === "Healthy") return "green";
    if (h === "At risk") return "amber";
    if (h === "Trial") return "blue";
    return "red";
  };

  return (
    <div className="min-h-screen df-canvas flex flex-col">
      {/* Charcoal-forest Top Bar */}
      <header className="bg-[var(--df-admin-header)] text-white px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="df-serif text-lg font-semibold tracking-tight">DentFlow</span>
            <span className="text-xs text-white/65">platform admin</span>
          </div>
          <nav className="flex flex-wrap items-center gap-1.5 text-xs">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab
                    ? "bg-white/15 text-white font-semibold"
                    : "text-white/75 hover:text-white"
                }`}
              >
                <span>{tab}</span>
                {tab === "Leads & Demo requests" && newLeadsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#EF4444] text-white">
                    {newLeadsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-white/70 hidden sm:inline">Internal · all access logged</span>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold cursor-pointer"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] w-full mx-auto p-4 sm:p-6 space-y-5 flex-1">
        {/* Top 5 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <DentflowKpiCard
            label="Active clinic groups"
            value="24"
            subtext="+4 this quarter"
            subtextTone="green"
          />
          <DentflowKpiCard label="Branches" value="61" subtext="avg per group 2.5" />
          <DentflowKpiCard label="MRR" value="₹3,42,000" subtext="net of refunds" />
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

        {/* Leads & Demo Requests View */}
        {activeTab === "Leads & Demo requests" ? (
          <div className="df-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-sm font-bold text-[var(--df-text)]">
                  Inbound Demo Requests & Leads
                </h1>
                <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
                  Prospects from the public DentFlow marketing site and individual clinic landing pages
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["All", "new", "contacted", "scheduled", "done", "lost"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setLeadStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer capitalize ${
                      leadStatusFilter === st
                        ? "bg-[var(--df-sidebar-bg)] text-white font-semibold"
                        : "bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)] border border-[var(--df-border)]"
                    }`}
                  >
                    {st === "All" ? "All statuses" : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2.5 text-left">Doctor / Clinic</th>
                    <th className="py-2.5 text-left">Contact</th>
                    <th className="py-2.5 text-left">City & Scale</th>
                    <th className="py-2.5 text-left">Preferred Time</th>
                    <th className="py-2.5 text-left">Source / Clinic</th>
                    <th className="py-2.5 text-left">Status</th>
                    <th className="py-2.5 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--df-border)]">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[var(--df-text-muted)]">
                        No demo requests found matching filter &quot;{leadStatusFilter}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[var(--df-surface-hover)]/60">
                        <td className="py-3">
                          <p className="font-bold text-[var(--df-text)]">{lead.name}</p>
                          <p className="text-[11px] text-[var(--df-text-muted)]">{lead.clinicName}</p>
                          {lead.message && (
                            <p className="text-[10.5px] text-[var(--df-text-secondary)] italic mt-1 line-clamp-2 max-w-xs">
                              &ldquo;{lead.message}&rdquo;
                            </p>
                          )}
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-[var(--df-text)]">{lead.phone}</p>
                          {lead.email && (
                            <p className="text-[11px] text-[var(--df-text-muted)]">{lead.email}</p>
                          )}
                        </td>
                        <td className="py-3">
                          <p className="text-[var(--df-text)]">{lead.city || "—"}</p>
                          <p className="text-[11px] text-[var(--df-text-muted)]">{lead.branchesCount || "1 clinic"}</p>
                        </td>
                        <td className="py-3 font-medium text-[var(--df-text)]">
                          {lead.preferredDateTime || "Immediate callback"}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)] border border-[var(--df-border)]">
                            {lead.clinicSlug ? `Clinic / ${lead.clinicSlug}` : "DentFlow Home"}
                          </span>
                        </td>
                        <td className="py-3">
                          <select
                            aria-label="Change lead status"
                            value={lead.status}
                            onChange={(e) =>
                              handleUpdateLeadStatus(lead.id, e.target.value as DemoRequestItem["status"])
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              lead.status === "new"
                                ? "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)] border-[var(--df-status-red-border)]"
                                : lead.status === "contacted"
                                ? "bg-[var(--df-status-amber-bg)] text-[var(--df-status-amber-text)] border-[var(--df-status-amber-border)]"
                                : lead.status === "scheduled"
                                ? "bg-[var(--df-status-blue-bg)] text-[var(--df-status-blue-text)] border-[var(--df-status-blue-border)]"
                                : lead.status === "done"
                                ? "bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] border-[var(--df-status-green-border)]"
                                : "bg-[var(--df-surface-muted)] text-[var(--df-text-muted)] border-[var(--df-border)]"
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="done">Done / Onboarded</option>
                            <option value="lost">Lost</option>
                          </select>
                        </td>
                        <td className="py-3">
                          <input
                            type="text"
                            placeholder="Add follow-up notes..."
                            defaultValue={lead.notes || ""}
                            onBlur={(e) => handleUpdateLeadNote(lead.id, e.target.value)}
                            className="w-full min-w-[140px] rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1 text-[11px] text-[var(--df-text)] placeholder:text-[var(--df-text-muted)]"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Main 12-Col Grid for Clinics */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 8-Col Clinic Accounts Card */}
          <div className="xl:col-span-8 df-card p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-sm font-bold text-[var(--df-text)]">Clinic accounts</h1>
              <button
                type="button"
                onClick={() => setOnboardOpen(true)}
                className="df-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Onboard clinic
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2 text-left">Clinic group</th>
                    <th className="py-2 text-left">Plan</th>
                    <th className="py-2 text-center">Branches</th>
                    <th className="py-2 text-right">MRR</th>
                    <th className="py-2 text-right">WhatsApp credits</th>
                    <th className="py-2 text-left pl-4">Last active</th>
                    <th className="py-2 text-right">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--df-border)]">
                  {state.tenantAccounts.map((t) => (
                    <tr key={t.id} className="hover:bg-[var(--df-surface-hover)]/60">
                      <td className="py-2.5">
                        <p className="font-bold text-[var(--df-text)]">{t.clinicGroup}</p>
                        <p className="text-[11px] text-[var(--df-text-muted)]">
                          {t.branchesLabel}
                        </p>
                      </td>
                      <td className="py-2.5 font-medium text-[var(--df-text-secondary)]">
                        {t.plan}
                      </td>
                      <td className="py-2.5 text-center font-semibold">{t.branchesCount}</td>
                      <td className="py-2.5 text-right font-semibold">{t.mrrLabel}</td>
                      <td className="py-2.5 text-right font-semibold">
                        {t.whatsappCredits.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 pl-4 text-[var(--df-text-muted)]">{t.lastActive}</td>
                      <td className="py-2.5 text-right">
                        <DentflowStatusPill label={t.health} tone={healthTone(t.health)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4-Col Plans & Feature Flags + DPDP Requests */}
          <div className="xl:col-span-4 space-y-5">
            <div className="df-card p-5 space-y-3">
              <h2 className="text-sm font-bold text-[var(--df-text)]">Plans & feature flags</h2>
              <div className="divide-y divide-[var(--df-border)] text-xs">
                <div className="py-2.5 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[var(--df-text)]">Starter · 1 clinic</p>
                    <p className="text-[11px] text-[var(--df-text-muted)]">
                      Calendar, records, billing, WhatsApp reminders, patient app
                    </p>
                  </div>
                  <span className="font-bold text-[var(--df-text)] shrink-0">₹4,999/mo</span>
                </div>
                <div className="py-2.5 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[var(--df-text)]">Growth · up to 3 branches</p>
                    <p className="text-[11px] text-[var(--df-text-muted)]">
                      + recovery engine, gap filler, explainers, post-op, costing
                    </p>
                  </div>
                  <span className="font-bold text-[var(--df-text)] shrink-0">₹14,999/mo</span>
                </div>
                <div className="py-2.5 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[var(--df-text)]">Chain · 4+ branches</p>
                    <p className="text-[11px] text-[var(--df-text-muted)]">
                      + group dashboard, specialists, voice AI, API, SSO
                    </p>
                  </div>
                  <span className="font-bold text-[var(--df-text)] shrink-0">Custom</span>
                </div>
              </div>
            </div>

            <div className="df-card p-5 space-y-3">
              <h2 className="text-sm font-bold text-[var(--df-text)]">DPDP requests</h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--df-text-secondary)]">Access requests (open)</span>
                  <span className="font-bold">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--df-text-secondary)]">Deletion requests (open)</span>
                  <span className="font-bold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--df-text-secondary)]">Breach notices</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--df-text-secondary)]">Oldest open request</span>
                  <span className="font-bold">4 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>

      <DentflowDrawer
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        title="Onboard new clinic group"
        subtitle="Provision multi-branch tenant, WhatsApp credits & DPDP log"
      >
        <form onSubmit={handleOnboard} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Clinic group name</label>
            <input
              type="text"
              required
              placeholder="e.g., Koregaon Smiles Dental"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as TenantAccountRecord["plan"])}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
              >
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Chain">Chain</option>
                <option value="Trial">Trial</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Branches count</label>
              <input
                type="number"
                min={1}
                max={50}
                value={branchesCount}
                onChange={(e) => setBranchesCount(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
              />
            </div>
          </div>
          <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
            Provision clinic account
          </button>
        </form>
      </DentflowDrawer>
    </div>
  );
}

export function PlatformAdminPortal() {
  return (
    <DentflowProvider>
      <PlatformAdminInner />
    </DentflowProvider>
  );
}

