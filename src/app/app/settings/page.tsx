"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import {
  DENTFLOW_ROLES,
  DentflowRoleKey,
  PermissionCode,
} from "@/lib/dentflow-theme";

const SETTINGS_NAV = [
  "Clinic profile",
  "Branches",
  "Chairs & rooms",
  "Working hours & holidays",
  "Procedure catalogue & fees",
  "Users & roles",
  "Message templates",
  "Consent & form templates",
  "Integrations",
  "Data & privacy (DPDP)",
  "Subscription & billing",
];

const NEXT_PERM: Record<PermissionCode, PermissionCode> = {
  F: "V",
  V: "O",
  O: "-",
  "-": "F",
};

export default function SettingsPage() {
  const { state, updateState } = useDentflow();
  const [activeMenu, setActiveMenu] = useState("Users & roles");
  const [emiConnected, setEmiConnected] = useState(false);

  const cyclePermission = (permKey: string, role: DentflowRoleKey) => {
    if (role === "Owner") {
      toast.info("Owner retains full access across all clinic permissions.");
      return;
    }
    updateState((prev) => ({
      ...prev,
      rolePermissions: prev.rolePermissions.map((row) =>
        row.key !== permKey
          ? row
          : {
              ...row,
              levels: {
                ...row.levels,
                [role]: NEXT_PERM[row.levels[role]],
              },
            },
      ),
    }));
  };

  const renderPermBadge = (code: PermissionCode) => {
    if (code === "-") {
      return <span className="text-[var(--df-text-muted)] font-semibold">—</span>;
    }
    const cls =
      code === "F"
        ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border-[var(--df-teal-border)]"
        : code === "V"
        ? "bg-[var(--df-status-blue-bg)] text-[var(--df-status-blue-text)] border-[var(--df-status-blue-border)]"
        : "bg-[var(--df-status-grey-bg)] text-[var(--df-status-grey-text)] border-[var(--df-status-grey-border)]";
    return (
      <span
        className={`inline-flex items-center justify-center h-6 w-6 rounded-md border text-[11px] font-bold ${cls}`}
      >
        {code}
      </span>
    );
  };

  return (
    <div>
      <DentflowPageHeader
        title="Settings"
        subtitle={`${activeMenu} · applies to all branches`}
        defaultBranch="All 3 branches"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 3-col Settings menu */}
        <div className="xl:col-span-3 df-card p-3 space-y-1">
          {SETTINGS_NAV.map((item) => {
            const active = item === activeMenu;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setActiveMenu(item)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] font-bold"
                    : "text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Right 9-col Area */}
        <div className="xl:col-span-9 space-y-5">
          {activeMenu === "Data & privacy (DPDP)" ? (
            <div className="df-card p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--df-text)]">
                  DPDP patient-record access log (live audit trail)
                </h2>
                <DentflowStatusPill label="DPDP Compliant" tone="green" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase text-[var(--df-text-muted)]">
                      <th className="py-2 text-left">Time</th>
                      <th className="py-2 text-left">Staff member</th>
                      <th className="py-2 text-left">Role</th>
                      <th className="py-2 text-left">Patient</th>
                      <th className="py-2 text-left">Screen</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--df-border)]">
                    {state.dpdpAccessLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2 text-[var(--df-text-muted)]">{log.timestamp}</td>
                        <td className="py-2 font-bold">{log.actor}</td>
                        <td className="py-2">{log.role}</td>
                        <td className="py-2 font-semibold">{log.patientName}</td>
                        <td className="py-2 text-[var(--df-text-secondary)]">{log.screenName}</td>
                        <td className="py-2 text-right">
                          <DentflowStatusPill label={log.action} tone="blue" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {/* Role permissions matrix card */}
              <div className="df-card p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-[var(--df-text)]">Role permissions</h2>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Click any cell in the matrix to customize permissions live")
                    }
                    className="df-btn-secondary inline-flex items-center gap-1 px-2.5 py-1 text-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Custom role
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                        <th className="py-2 pr-2 text-left">Permission</th>
                        {DENTFLOW_ROLES.map((role) => (
                          <th key={role} className="py-2 px-1.5 text-center">
                            {role}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--df-border)]">
                      {state.rolePermissions.map((row) => (
                        <tr key={row.key} className="hover:bg-[var(--df-surface-hover)]/50">
                          <td className="py-2 pr-2 font-medium text-[var(--df-text)]">
                            {row.label}
                          </td>
                          {DENTFLOW_ROLES.map((role) => (
                            <td key={role} className="py-2 px-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => cyclePermission(row.key, role)}
                                title="Click to toggle F / V / O / —"
                                className="cursor-pointer hover:scale-105 transition-transform"
                              >
                                {renderPermBadge(row.levels[role])}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-[var(--df-text-muted)] pt-1">
                  F = full · V = view · O = own patients only · — = no access. Every view of a
                  patient record is written to the access log (DPDP).
                </p>
              </div>

              {/* 6 Integration Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="df-card p-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[var(--df-text)]">
                      WhatsApp Business API
                    </p>
                    <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                      Reminders, bots, explainers
                    </p>
                  </div>
                  <DentflowStatusPill label="Connected" tone="green" />
                </div>

                <div className="df-card p-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[var(--df-text)]">ABDM / ABHA</p>
                    <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                      Link and share health records
                    </p>
                  </div>
                  <DentflowStatusPill label="Connected" tone="green" />
                </div>

                <div className="df-card p-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[var(--df-text)]">
                      UPI &amp; card gateway
                    </p>
                    <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                      QR, links, AutoPay mandates
                    </p>
                  </div>
                  <DentflowStatusPill label="Connected" tone="green" />
                </div>

                <div
                  onClick={() => {
                    setEmiConnected(true);
                    toast.success("Connected Bajaj Finserv Health 0% EMI partner");
                  }}
                  className="df-card p-4 flex items-start justify-between gap-2 cursor-pointer hover:border-[var(--df-teal)]"
                >
                  <div>
                    <p className="text-xs font-bold text-[var(--df-text)]">EMI partner</p>
                    <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                      Bajaj Finserv Health · instant approval
                    </p>
                  </div>
                  <DentflowStatusPill
                    label={emiConnected ? "Connected" : "Set up"}
                    tone={emiConnected ? "green" : "amber"}
                  />
                </div>

                <div className="df-card p-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[var(--df-text)]">
                      Tally / accounting
                    </p>
                    <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                      Daily export of invoices
                    </p>
                  </div>
                  <DentflowStatusPill label="Connected" tone="green" />
                </div>

                <div className="df-card p-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[var(--df-text)]">
                      Google Business Profile
                    </p>
                    <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                      Booking button + review links
                    </p>
                  </div>
                  <DentflowStatusPill label="Connected" tone="green" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

