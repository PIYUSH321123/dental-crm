"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  ExternalLink,
  FilePlay,
  FileText,
  FlaskConical,
  Globe,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Package,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PhoneCall,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import { performDentflowLogout, staffRoleKeyToAuthRole } from "@/lib/dentflow-session";
import {
  canRoleAccessNavItem,
  DENTFLOW_ROLES,
  DENTFLOW_SIDEBAR_SECTIONS,
  DentflowRoleKey,
  ROLE_USER_PROFILES,
  STATUS_PILL_STYLES,
  StatusTone,
} from "@/lib/dentflow-theme";
import { useDentflow } from "@/lib/dentflow-store";
import { BranchName } from "@/types/dentflow";

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  today: Home,
  dashboard: LayoutDashboard,
  calendar: Calendar,
  "video-consult": Video,
  patients: Users,
  "gap-filler": Clock,
  "ai-receptionist": PhoneCall,
  "dental-chart": Activity,
  "treatment-plans": ClipboardList,
  explainers: FilePlay,
  prescriptions: FileText,
  "post-op": Activity,
  billing: Receipt,
  insurance: ShieldCheck,
  "treatment-recovery": RefreshCw,
  "recall-campaigns": Megaphone,
  inventory: Package,
  "lab-cases": FlaskConical,
  sterilisation: ShieldCheck,
  "staff-commission": UserCheck,
  "group-dashboard": Building2,
  "patient-insights": TrendingUp,
  "visiting-specialists": Stethoscope,
  reports: BarChart3,
  settings: Settings,
  "website-landing": Globe,
  leads: Sparkles,
};

export function DentflowStatusPill({
  label,
  tone = "grey",
  className = "",
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${STATUS_PILL_STYLES[tone]} ${className}`}
    >
      {label}
    </span>
  );
}

export function DentflowUniquePill({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight ${
        dark
          ? "bg-[var(--df-unique-dark-bg)] text-[var(--df-unique-dark-text)]"
          : "bg-[var(--df-unique-bg)] text-[var(--df-unique-text)] border border-[var(--df-unique-border)]"
      }`}
    >
      Unique
    </span>
  );
}

export function DentflowNewPill({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight ${
        dark
          ? "bg-[var(--df-new-dark-bg)] text-[var(--df-new-dark-text)]"
          : "bg-[var(--df-new-bg)] text-[var(--df-new-text)]"
      }`}
    >
      New
    </span>
  );
}

export function DentflowKpiCard({
  label,
  value,
  subtext,
  subtextTone = "muted",
  highlighted = false,
}: {
  label: string;
  value: string;
  subtext: string;
  subtextTone?: "muted" | "green" | "amber" | "red" | "teal";
  highlighted?: boolean;
}) {
  const subColor =
    subtextTone === "green"
      ? "text-[var(--df-status-green-text)]"
      : subtextTone === "amber"
      ? "text-[var(--df-status-amber-text)]"
      : subtextTone === "red"
      ? "text-[var(--df-status-red-text)]"
      : subtextTone === "teal"
      ? "text-[var(--df-teal)]"
      : "text-[var(--df-text-muted)]";

  return (
    <div
      className={`df-card p-4 transition-all ${
        highlighted
          ? "bg-[var(--df-teal-soft)] border-[var(--df-teal-border)]"
          : "bg-[var(--df-surface)]"
      }`}
    >
      <p className="text-xs font-medium text-[var(--df-text-muted)]">{label}</p>
      <p className="df-serif text-2xl sm:text-[26px] font-semibold text-[var(--df-text)] mt-1 leading-tight tracking-tight">
        {value}
      </p>
      <p className={`text-xs mt-1 font-medium ${subColor}`}>{subtext}</p>
    </div>
  );
}

const BRANCH_OPTIONS: BranchName[] = [
  "Station Road branch",
  "Civil Lines branch",
  "MG Road branch",
  "All 3 branches",
];

export function DentflowBranchSelector() {
  const { state, setActiveBranch } = useDentflow();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label="Select active clinic branch"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl pl-3 pr-2.5 py-1.5 text-xs font-semibold text-[var(--df-text)] hover:border-[var(--df-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--df-teal)]/20 cursor-pointer transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Building2 className="h-3.5 w-3.5 text-[var(--df-teal)] shrink-0" />
        <span className="truncate max-w-[150px] sm:max-w-none">{state.activeBranch}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[var(--df-text-muted)] shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 mt-1.5 w-56 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] p-1.5 shadow-xl z-50"
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
            Select clinic branch
          </div>
          {BRANCH_OPTIONS.map((branch) => {
            const isSelected = state.activeBranch === branch;
            return (
              <button
                key={branch}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => {
                  setActiveBranch(branch);
                  setOpen(false);
                  toast.success(`Switched active branch to ${branch}`);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] font-bold"
                    : "text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] focus-visible:bg-[var(--df-surface-hover)]"
                }`}
              >
                <span className="truncate">{branch}</span>
                {isSelected && <Check className="h-4 w-4 text-[var(--df-teal)] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DentflowPageHeader({
  title,
  subtitle,
  defaultBranch,
  defaultUserOverride,
}: {
  title: React.ReactNode;
  subtitle: string;
  defaultBranch?: BranchName;
  defaultUserOverride?: { name: string; subtitle: string; initials: string };
}) {
  const router = useRouter();
  const {
    state,
    backendConnected,
    searchQuery,
    setSearchQuery,
    setActiveBranch,
    setActiveRole,
    updateState,
  } = useDentflow();

  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    toast.success("Logging out...");
    await performDentflowLogout();
  };

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setIsDarkMode(isDark);
  };

  const handleSwitchRole = async (newRole: DentflowRoleKey) => {
    setActiveRole(newRole);
    const authRole = staffRoleKeyToAuthRole(newRole);
    try {
      await fetch("/api/dentflow/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SWITCH_ROLE",
          role: authRole,
          staffRoleKey: newRole,
        }),
      });
    } catch {
      // local state already updated
    }
    toast.success(`Switched active staff role to ${newRole}`);
  };

  const userProfile = useMemo(() => {
    if (defaultUserOverride) return defaultUserOverride;

    const customOwner = state.clinicSetup.ownerName;
    const rosterStaff = state.clinicSetup.staffRoster?.find(
      (s) => s.role === state.activeRole
    );
    const base = ROLE_USER_PROFILES[state.activeRole] || {
      name: "Dr. Sneha Kulkarni",
      subtitle: "Dentist — owner",
      initials: "SK",
    };

    if (state.activeRole === "Owner") {
      const name = customOwner || rosterStaff?.name || base.name;
      const initials = name
        .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, "")
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "SK";
      return {
        name,
        subtitle: "Dentist — owner",
        initials,
      };
    }

    if (rosterStaff?.name) {
      const initials = rosterStaff.name
        .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, "")
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || base.initials;
      return {
        ...base,
        name: rosterStaff.name,
        initials,
      };
    }

    return base;
  }, [defaultUserOverride, state.activeRole, state.clinicSetup.staffRoster, state.clinicSetup.ownerName]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const pats = state.patients
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q),
      )
      .map((p) => ({
        id: p.id,
        title: p.name,
        meta: `${p.code} · ${p.phone} · ${p.homeBranch}`,
        href: `/app/patients?patientId=${p.id}`,
      }));
    const invs = state.invoices
      .filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.patientName.toLowerCase().includes(q),
      )
      .map((i) => ({
        id: i.id,
        title: `${i.invoiceNumber} · ${i.patientName}`,
        meta: `₹${Math.abs(i.amount).toLocaleString("en-IN")} · ${i.status}`,
        href: `/app/billing`,
      }));
    return [...pats, ...invs].slice(0, 6);
  }, [searchQuery, state.patients, state.invoices]);

  const activeAlertsCount = state.needsAttention.filter((n) => !n.resolved).length;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--df-border)]">
      <div className="min-w-0">
        <h1 className="df-serif text-xl sm:text-2xl font-semibold text-[var(--df-text)] tracking-tight leading-snug">
          {title}
        </h1>
        <p className="text-xs text-[var(--df-text-muted)] mt-0.5">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Branch selector */}
        <DentflowBranchSelector />

        {/* Search patient, phone, invoice */}
        <div className="relative hidden md:block w-64">
          <Search className="h-3.5 w-3.5 text-[var(--df-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search patients, appointments, or invoices"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search patients, appointments..."
            className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl pl-8 pr-8 py-1.5 text-xs text-[var(--df-text)] placeholder:text-[var(--df-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--df-teal)]/20"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--df-text-muted)] bg-[var(--df-surface-muted)] px-1.5 py-0.5 rounded border border-[var(--df-border)] font-mono pointer-events-none">
            /
          </kbd>
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute right-0 mt-1.5 w-72 df-card p-1.5 z-50 shadow-lg">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onMouseDown={() => router.push(r.href)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--df-surface-hover)] transition-colors"
                >
                  <p className="text-xs font-semibold text-[var(--df-text)]">{r.title}</p>
                  <p className="text-[11px] text-[var(--df-text-muted)]">{r.meta}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label="Toggle color theme"
          className="h-8 w-8 rounded-xl bg-[var(--df-surface)] border border-[var(--df-border)] flex items-center justify-center text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
          title="Toggle color theme"
        >
          {isDarkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Clinic notifications"
            className="relative h-8 w-8 rounded-xl bg-[var(--df-surface)] border border-[var(--df-border)] flex items-center justify-center text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
              9+
            </span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-1.5 w-80 df-card p-3 z-50 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--df-text)]">
                  Needs attention ({activeAlertsCount})
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    backendConnected
                      ? "bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)]"
                      : "bg-[var(--df-status-amber-bg)] text-[var(--df-status-amber-text)]"
                  }`}
                >
                  {backendConnected ? "NestJS API Live" : "Local Sync Mode"}
                </span>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {state.needsAttention.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      router.push(`/app/${item.targetRoute}`);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-[var(--df-surface-muted)] hover:bg-[var(--df-surface-hover)] border border-[var(--df-border)]"
                  >
                    <p className="text-xs font-semibold text-[var(--df-text)]">{item.title}</p>
                    <p className="text-[11px] text-[var(--df-text-muted)]">{item.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Links: Marketing Landing */}
        <div className="hidden xl:flex items-center gap-1.5">
          <Link
            href="/"
            target="_blank"
            title="Open CRM Marketing Landing Page"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] hover:border-[var(--df-border-strong)] text-[var(--df-text-muted)] hover:text-[var(--df-text)] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Marketing Page</span>
          </Link>
        </div>

        {/* Role Switcher */}
        <div className="relative hidden md:block">
          <select
            aria-label="Active role"
            value={state.activeRole}
            onChange={(e) => handleSwitchRole(e.target.value as DentflowRoleKey)}
            title="Switch active staff role"
            className="appearance-none bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl pl-2.5 pr-6 py-1.5 text-[11px] font-semibold text-[var(--df-teal)] hover:border-[var(--df-teal-border)] focus:outline-none cursor-pointer"
          >
            {DENTFLOW_ROLES.map((r) => (
              <option key={r} value={r}>
                Role: {r}
              </option>
            ))}
          </select>
          <ChevronDown className="h-3 w-3 text-[var(--df-teal)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* User Profile & Account Dropdown (matching reference image) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label="User account menu"
            className="flex items-center gap-2 bg-[var(--df-surface)] border border-[var(--df-border)] rounded-full sm:rounded-xl px-1 sm:px-2.5 py-1 hover:border-[var(--df-teal-border)] transition-colors cursor-pointer group"
          >
            <div className="h-7 w-7 rounded-full bg-[#0EA5E9] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              {userProfile.initials || "DS"}
            </div>
            <div className="leading-tight hidden sm:block text-left pr-1">
              <p className="text-xs font-semibold text-[var(--df-text)]">{userProfile.name}</p>
              <p className="text-[10px] text-[var(--df-text-muted)]">{userProfile.subtitle}</p>
            </div>
          </button>

          {/* Popup Dropdown Card matching image exactly */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-64 df-card p-3.5 z-50 shadow-2xl rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] animate-in fade-in zoom-in-95 duration-100">
                {/* User info & badge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--df-text)]">
                      {userProfile.name}
                    </p>
                    {state.activeRole === "Owner" && (
                      <button
                        type="button"
                        onClick={async () => {
                          const newName = prompt(
                            "Enter new Clinic Owner / Principal Dentist name:",
                            userProfile.name,
                          );
                          if (!newName || !newName.trim()) return;
                          const trimmed = newName.trim();
                          updateState((prev) => ({
                            ...prev,
                            clinicSetup: {
                              ...prev.clinicSetup,
                              ownerName: trimmed,
                              staffRoster: (prev.clinicSetup.staffRoster || []).map((s) =>
                                s.role === "Owner" ? { ...s, name: trimmed } : s,
                              ),
                            },
                          }));
                          try {
                            await fetch("/api/dentflow/session", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "UPDATE_OWNER", name: trimmed }),
                            });
                          } catch {}
                          toast.success(`Owner name changed to "${trimmed}"`);
                        }}
                        className="text-[11px] text-[var(--df-teal)] hover:underline font-semibold cursor-pointer"
                      >
                        Change name
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[var(--df-text-muted)]">
                    {state.activeRole === "Owner"
                      ? state.clinicSetup.ownerEmail || "sneha@smilestudio.in"
                      : `${state.activeRole.toLowerCase().replace(/\s+/g, "")}@smilestudio.in`}
                  </p>
                  <div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)] tracking-wide shadow-xs">
                      {state.activeRole}
                    </span>
                  </div>
                </div>

                <div className="my-2.5 border-t border-[var(--df-border)]" />

                {/* Role Switcher in popup */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-[var(--df-text-muted)] uppercase tracking-wider px-1">
                    Switch Staff Role
                  </p>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    {DENTFLOW_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          handleSwitchRole(r);
                          setUserMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          state.activeRole === r
                            ? "bg-[var(--df-teal)] text-white font-bold"
                            : "bg-[var(--df-surface-muted)] text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] border border-[var(--df-border)]"
                        }`}
                      >
                        <span className="truncate">{r}</span>
                        {state.activeRole === r && <Check className="h-3 w-3 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="my-2.5 border-t border-[var(--df-border)]" />

                {/* Profile & Settings Navigation */}
                <div className="space-y-0.5">
                  <Link
                    href="/app/settings?tab=website"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] transition-colors"
                  >
                    <Palette className="h-4 w-4 text-[var(--df-teal)]" />
                    <span>Website &amp; Landing Page Editor</span>
                  </Link>

                  <Link
                    href="/app/settings?tab=leads"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-[var(--df-teal)]" />
                    <span>Website Leads &amp; Demo Requests</span>
                  </Link>

                  <Link
                    href="/"
                    target="_blank"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-[var(--df-text-muted)]" />
                    <span>DentFlow CRM Marketing Page</span>
                  </Link>

                  <Link
                    href="/app/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] transition-colors"
                  >
                    <User className="h-4 w-4 text-[var(--df-text-muted)]" />
                    <span>Edit Owner &amp; Clinic Profile</span>
                  </Link>

                  <Link
                    href="/app/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] transition-colors"
                  >
                    <Settings className="h-4 w-4 text-[var(--df-text-muted)]" />
                    <span>Settings &amp; Permissions</span>
                  </Link>
                </div>

                <div className="my-2.5 border-t border-[var(--df-border)]" />

                {/* Log out action */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-[#EF4444]" />
                    <span>Log out</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await performDentflowLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[var(--df-text-muted)] hover:text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] transition-colors cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5 text-[var(--df-text-muted)]" />
                    <span>Log in as different user</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export interface ChromeTabItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function DentflowChromeTabs({
  tabs,
  activeId,
  className = "",
}: {
  tabs: ChromeTabItem[];
  activeId: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-end gap-1.5 border-b border-[var(--df-border)] bg-[var(--df-surface-muted)]/50 pt-2 px-3 rounded-t-xl overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`group relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-t-2 border-x -mb-[1px] select-none ${
              isActive
                ? "bg-[var(--df-surface)] text-[var(--df-teal)] border-t-[var(--df-teal)] border-x-[var(--df-border)] shadow-xs z-10"
                : "border-transparent text-[var(--df-text-muted)] hover:text-[var(--df-text)] hover:bg-[var(--df-surface)]/70 hover:border-x-[var(--df-border)]/40"
            }`}
          >
            {Icon && (
              <Icon
                className={`h-3.5 w-3.5 transition-colors ${
                  isActive
                    ? "text-[var(--df-teal)]"
                    : "text-[var(--df-text-muted)] group-hover:text-[var(--df-text)]"
                }`}
              />
            )}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.badge && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)]"
                    : "bg-[var(--df-border)] text-[var(--df-text-muted)]"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

const SIDEBAR_GROUPS_STORAGE_KEY = "dentflow_sidebar_collapsed_groups";
const SIDEBAR_RAIL_STORAGE_KEY = "dentflow_sidebar_rail_collapsed";

export function DentflowSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { state } = useDentflow();

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [railCollapsed, setRailCollapsed] = useState<boolean>(false);

  // Restore saved collapsed groups & rail preference from localStorage
  useEffect(() => {
    try {
      const savedGroups = window.localStorage.getItem(SIDEBAR_GROUPS_STORAGE_KEY);
      if (savedGroups) setCollapsedGroups(JSON.parse(savedGroups));
      const savedRail = window.localStorage.getItem(SIDEBAR_RAIL_STORAGE_KEY);
      if (savedRail === "true") setRailCollapsed(true);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      try {
        window.localStorage.setItem(SIDEBAR_GROUPS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleRail = () => {
    setRailCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_RAIL_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const postOpAlertCount = state.postOpCases.filter((p) => p.status === "Alert").length;

  const sidebarContent = (
    <aside
      className={`${
        railCollapsed ? "w-[68px]" : "w-[236px]"
      } shrink-0 bg-[var(--df-sidebar-bg)] text-[var(--df-sidebar-text)] flex flex-col h-full select-none transition-all duration-200`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 pt-3.5 pb-2.5 border-b border-[var(--df-sidebar-border)]">
        <Link
          href="/Dashboard/today"
          onClick={onCloseMobile}
          title="DentFlow Home"
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="h-7 w-7 rounded-lg bg-[var(--df-teal)] flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
            W
          </div>
          {!railCollapsed && (
            <span className="df-serif text-lg font-semibold tracking-tight text-white truncate">
              DentFlow
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={toggleRail}
          className="hidden lg:inline-flex text-[var(--df-sidebar-muted)] hover:text-white p-1 rounded cursor-pointer"
          aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {railCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden text-[var(--df-sidebar-muted)] hover:text-white p-1"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto overflow-x-visible px-2 py-2.5 space-y-2.5">
        {DENTFLOW_SIDEBAR_SECTIONS.map((section, idx) => {
          const visibleItems = section.items.filter((item) =>
            canRoleAccessNavItem(state.activeRole, item, state.rolePermissions),
          );
          if (visibleItems.length === 0) return null;

          const hasTitle = Boolean(section.title && section.title.trim().length > 0);
          const isCollapsed = !railCollapsed && hasTitle && Boolean(collapsedGroups[section.title]);

          return (
            <div key={section.title || `section-${idx}`} className="space-y-0.5">
              {/* Group Title (hidden when icon-only rail is collapsed; divider shown instead) */}
              {hasTitle && !railCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(section.title)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10.5px] font-bold tracking-wider uppercase text-[var(--df-sidebar-section)] hover:text-white rounded transition-colors cursor-pointer group"
                  aria-expanded={!isCollapsed}
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`h-3 w-3 text-[var(--df-sidebar-muted)] group-hover:text-white transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </button>
              )}
              {hasTitle && railCollapsed && idx > 0 && (
                <div className="my-1.5 border-t border-[var(--df-sidebar-border)]/70" />
              )}

              {/* Group Items */}
              {!isCollapsed && (
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const href = item.slug === "today" ? "/Dashboard/today" : `/app/${item.slug}`;
                    const isItemExactActive =
                      item.slug === "today"
                        ? pathname === "/Dashboard/today" ||
                          pathname === "/dashboard/today" ||
                          pathname === "/app/today" ||
                          pathname === "/Dashboard" ||
                          pathname === "/dashboard"
                        : pathname === href || pathname?.startsWith(`${href}/`);
                    const isFamilyActive =
                      isItemExactActive ||
                      (item.slug === "patients" && pathname?.startsWith("/app/dental-chart")) ||
                      (item.slug === "treatment-plans" &&
                        (pathname?.startsWith("/app/explainers") ||
                          pathname?.startsWith("/app/treatment-recovery")));
                    const Icon = NAV_ICONS[item.id] || Home;

                    return (
                      <li key={item.id} className="relative group/nav">
                        <Link
                          href={href}
                          onClick={onCloseMobile}
                          title={railCollapsed ? item.label : undefined}
                          aria-label={item.label}
                          className={`w-full flex items-center ${
                            railCollapsed ? "justify-center px-2" : "justify-between px-2.5"
                          } gap-2 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                            isItemExactActive
                              ? "bg-[var(--df-sidebar-active)] text-white font-semibold"
                              : isFamilyActive
                              ? "text-white font-semibold bg-[var(--df-sidebar-hover)]/70"
                              : "text-[var(--df-sidebar-text)]/90 hover:bg-[var(--df-sidebar-hover)] hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                isFamilyActive
                                  ? "text-white"
                                  : "text-[var(--df-sidebar-muted)] group-hover/nav:text-white"
                              }`}
                            />
                            {!railCollapsed && <span className="truncate">{item.label}</span>}
                          </span>

                          {!railCollapsed && item.badgeType === "count" && (
                            <span className="inline-flex items-center justify-center h-4 min-w-4 px-1.5 rounded-full text-[10.5px] font-bold bg-[var(--df-sidebar-hover)] text-white border border-[var(--df-sidebar-border)] shrink-0">
                              {postOpAlertCount || item.badgeText}
                            </span>
                          )}
                        </Link>

                        {/* Floating Tooltip when rail is collapsed */}
                        {railCollapsed && (
                          <span
                            role="tooltip"
                            className="pointer-events-none opacity-0 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100 transition-opacity absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-lg bg-[#0B1F1A] text-white text-xs font-semibold whitespace-nowrap shadow-lg border border-[var(--df-sidebar-border)] z-50"
                          >
                            {item.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer Link to Public Marketing Landing Page */}
      {!railCollapsed ? (
        <div className="p-2 border-t border-[var(--df-sidebar-border)] space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--df-sidebar-muted)] hover:text-white hover:bg-[var(--df-sidebar-hover)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-[var(--df-teal)]" />
              <span>Marketing Site</span>
            </span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="p-2 border-t border-[var(--df-sidebar-border)] flex flex-col items-center gap-1.5">
          <Link
            href="/"
            target="_blank"
            title="Marketing Site"
            className="p-1.5 text-[var(--df-sidebar-muted)] hover:text-white rounded-lg hover:bg-[var(--df-sidebar-hover)]"
          >
            <Globe className="h-4 w-4 text-[var(--df-teal)]" />
          </Link>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sticky rail */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">{sidebarContent}</div>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

export function DentflowDashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state } = useDentflow();

  const trialInfo = state.clinicSetup?.trialInfo;
  const isTrial = trialInfo?.status === "trial";
  const isExpired = trialInfo?.status === "expired";

  const trialDaysLeft = useMemo(() => {
    if (!trialInfo?.trialEnd) return 14;
    const diff = new Date(trialInfo.trialEnd).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [trialInfo?.trialEnd]);

  const showTrialBanner = isTrial && trialDaysLeft > 0;
  const showExpiredBanner = isExpired || (isTrial && trialDaysLeft <= 0);

  return (
    <div className="min-h-screen flex df-canvas">
      <DentflowSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile menu trigger bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-[var(--df-sidebar-bg)] text-white">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="flex items-center gap-2 text-xs font-semibold"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>
          <span className="df-serif text-base font-semibold">DentFlow</span>
          <span className="text-[10px] text-[var(--df-sidebar-muted)]">
            {state.clinicSetup?.clinicGroupName || "Smile Studio"}
          </span>
        </div>

        {/* 14-Day Free Trial Notice Banner */}
        {showTrialBanner && (
          <div className="bg-[var(--df-teal-soft)] border-b border-[var(--df-teal-border)] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[var(--df-teal)] font-medium">
              <Sparkles className="h-4 w-4 shrink-0 text-[var(--df-teal)]" />
              <span>
                <strong>14-day free trial active:</strong> {trialDaysLeft} days remaining on your {trialInfo?.plan || "Growth"} plan.
              </span>
            </div>
            <Link
              href="/app/settings"
              className="df-btn-primary px-3 py-1 text-[11px] font-bold shrink-0"
            >
              Upgrade now →
            </Link>
          </div>
        )}

        {/* Trial Expired Alert Banner */}
        {showExpiredBanner && (
          <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-red-700 dark:text-red-300 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-red-600" />
              <span>
                <strong>Trial period expired:</strong> Your 14-day trial has ended. Please upgrade your plan to continue full scheduling, billing, and AI WhatsApp automations.
              </span>
            </div>
            <Link
              href="/app/settings"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-lg text-[11px] shrink-0 transition-colors"
            >
              Choose subscription plan
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export function DentflowDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[var(--df-surface)] border-l border-[var(--df-border)] h-full overflow-y-auto p-5 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[var(--df-border)]">
          <div>
            <h3 className="df-serif text-lg font-semibold text-[var(--df-text)]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[var(--df-text-muted)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            title="Close panel"
            className="p-1.5 rounded-lg hover:bg-[var(--df-surface-hover)] text-[var(--df-text-muted)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

