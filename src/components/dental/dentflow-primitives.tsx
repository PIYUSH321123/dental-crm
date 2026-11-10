"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardList,
  Clock,
  FilePlay,
  FileText,
  FlaskConical,
  Home,
  LogOut,
  Megaphone,
  Menu,
  Package,
  PhoneCall,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
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
  calendar: Calendar,
  patients: Users,
  "gap-filler": Clock,
  "ai-receptionist": PhoneCall,
  "dental-chart": Activity,
  "treatment-plans": ClipboardList,
  explainers: FilePlay,
  prescriptions: FileText,
  "post-op": Activity,
  billing: Receipt,
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
      <p className="text-[11px] font-medium text-[var(--df-text-muted)]">{label}</p>
      <p className="df-serif text-2xl sm:text-[26px] font-semibold text-[var(--df-text)] mt-1 leading-tight tracking-tight">
        {value}
      </p>
      <p className={`text-[11px] mt-1 font-medium ${subColor}`}>{subtext}</p>
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
  } = useDentflow();

  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const displayedBranch = defaultBranch || state.activeBranch;
  const userProfile = defaultUserOverride || ROLE_USER_PROFILES[state.activeRole];

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
        <div className="relative">
          <Building2 className="h-3.5 w-3.5 text-[var(--df-teal)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            aria-label="Select branch"
            value={displayedBranch}
            onChange={(e) => setActiveBranch(e.target.value as BranchName)}
            className="appearance-none bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl pl-8 pr-7 py-1.5 text-xs font-semibold text-[var(--df-text)] hover:border-[var(--df-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--df-teal)]/20 cursor-pointer"
          >
            <option value="Station Road branch">Station Road branch</option>
            <option value="Civil Lines branch">Civil Lines branch</option>
            <option value="MG Road branch">MG Road branch</option>
            <option value="All 3 branches">All 3 branches</option>
          </select>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--df-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Search patient, phone, invoice */}
        <div className="relative hidden md:block w-56">
          <Search className="h-3.5 w-3.5 text-[var(--df-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search patient, phone, invo..."
            className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--df-text)] placeholder:text-[var(--df-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--df-teal)]/20"
          />
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

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Clinic notifications"
            className="relative h-8 w-8 rounded-xl bg-[var(--df-surface)] border border-[var(--df-border)] flex items-center justify-center text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--df-alert-red-accent)]" />
            )}
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

        {/* Role Switcher (enforces Settings > Users & roles matrix live) */}
        <div className="relative hidden lg:block">
          <select
            aria-label="Active role"
            value={state.activeRole}
            onChange={(e) => setActiveRole(e.target.value as DentflowRoleKey)}
            title="Switch active staff role (controlled by Settings > Users & roles)"
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

        {/* User Chip */}
        <div className="flex items-center gap-2 bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1">
          <div className="h-6 w-6 rounded-full bg-[var(--df-teal)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {userProfile.initials}
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-xs font-semibold text-[var(--df-text)]">{userProfile.name}</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">{userProfile.subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DentflowSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useDentflow();

  const postOpAlertCount = state.postOpCases.filter((p) => p.status === "Alert").length;

  const handleLogout = async () => {
    await fetch("/api/dentflow/session", { method: "DELETE" }).catch(() => {});
    router.push("/login");
    router.refresh();
  };

  const sidebarContent = (
    <aside className="w-[224px] shrink-0 bg-[var(--df-sidebar-bg)] text-[var(--df-sidebar-text)] flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--df-sidebar-border)]">
        <Link
          href={state.activeRole === "Owner" ? "/app/group-dashboard" : "/app/today"}
          onClick={onCloseMobile}
          className="flex items-center gap-2.5"
        >
          <div className="h-7 w-7 rounded-lg bg-[var(--df-teal)] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            W
          </div>
          <span className="df-serif text-lg font-semibold tracking-tight text-white">
            DentFlow
          </span>
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden text-[var(--df-sidebar-muted)] hover:text-white p-1"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 5 Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {DENTFLOW_SIDEBAR_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) =>
            canRoleAccessNavItem(state.activeRole, item, state.rolePermissions),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <p className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-[var(--df-sidebar-section)]">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const href = `/app/${item.slug}`;
                  const isActive = pathname === href || pathname?.startsWith(`${href}/`);
                  const Icon = NAV_ICONS[item.id] || Home;

                  return (
                    <li key={item.id}>
                      <Link
                        href={href}
                        onClick={onCloseMobile}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
                          isActive
                            ? "bg-[var(--df-sidebar-active)] text-white font-semibold"
                            : "text-[var(--df-sidebar-text)]/85 hover:bg-[var(--df-sidebar-hover)] hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Icon
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isActive ? "text-white" : "text-[var(--df-sidebar-muted)]"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badgeType === "unique" && <DentflowUniquePill dark />}
                        {item.badgeType === "new" && <DentflowNewPill dark />}
                        {item.badgeType === "count" && (
                          <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold bg-[var(--df-sidebar-hover)] text-white border border-[var(--df-sidebar-border)]">
                            {postOpAlertCount || item.badgeText}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Connected Portals & Session Footer */}
      <div className="p-2.5 border-t border-[var(--df-sidebar-border)] space-y-1.5">
        <p className="px-2 text-[9.5px] font-bold uppercase tracking-wider text-[var(--df-sidebar-section)]">
          Connected portals
        </p>
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <Link
            href="/patient"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--df-sidebar-hover)] hover:bg-[var(--df-sidebar-active)] text-white font-medium"
          >
            <Smartphone className="h-3 w-3 text-[#F5B076]" />
            <span>Patient app</span>
          </Link>
          <Link
            href="/specialist"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--df-sidebar-hover)] hover:bg-[var(--df-sidebar-active)] text-white font-medium"
          >
            <Stethoscope className="h-3 w-3 text-[#6EE7B7]" />
            <span>Specialist</span>
          </Link>
          <Link
            href="/lab"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--df-sidebar-hover)] hover:bg-[var(--df-sidebar-active)] text-white font-medium"
          >
            <FlaskConical className="h-3 w-3 text-[#93C5FD]" />
            <span>Lab portal</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--df-sidebar-hover)] hover:bg-[var(--df-sidebar-active)] text-white font-medium cursor-pointer"
          >
            <LogOut className="h-3 w-3 text-[#FCA5A5]" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop fixed rail */}
      <div className="hidden lg:block shrink-0 min-h-screen">{sidebarContent}</div>

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
            className="flex items-center gap-2 text-xs font-semibold"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>
          <span className="df-serif text-base font-semibold">DentFlow</span>
          <span className="text-[10px] text-[var(--df-sidebar-muted)]">Smile Studio</span>
        </div>

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

