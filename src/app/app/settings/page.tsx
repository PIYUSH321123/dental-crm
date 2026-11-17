"use client";

import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Key,
  Laptop,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react";
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
] as const;

type SettingsMenuType = (typeof SETTINGS_NAV)[number];

const NEXT_PERM: Record<PermissionCode, PermissionCode> = {
  F: "V",
  V: "O",
  O: "-",
  "-": "F",
};

export default function SettingsPage() {
  const { state, updateState } = useDentflow();
  const [activeMenu, setActiveMenu] = useState<SettingsMenuType>("Clinic profile");

  // Permission cycle handler
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
    <div className="space-y-5 pb-12">
      <DentflowPageHeader
        title="Settings"
        subtitle={`${activeMenu} · applies across all branches`}
        defaultBranch="All 3 branches"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 3-col Settings Navigation rail */}
        <div className="xl:col-span-3 df-card p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
            Practice Preferences
          </p>
          {SETTINGS_NAV.map((item) => {
            const active = item === activeMenu;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setActiveMenu(item)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                  active
                    ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] font-bold shadow-xs"
                    : "text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                }`}
              >
                <span>{item}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-teal)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right 9-col Content Area */}
        <div className="xl:col-span-9 space-y-5">
          {activeMenu === "Clinic profile" && (
            <ClinicProfileSection clinicSetup={state.clinicSetup} updateState={updateState} />
          )}

          {activeMenu === "Branches" && (
            <BranchesSection clinicSetup={state.clinicSetup} updateState={updateState} />
          )}

          {activeMenu === "Chairs & rooms" && (
            <ChairsRoomsSection clinicSetup={state.clinicSetup} updateState={updateState} />
          )}

          {activeMenu === "Working hours & holidays" && (
            <WorkingHoursHolidaysSection clinicSetup={state.clinicSetup} />
          )}

          {activeMenu === "Procedure catalogue & fees" && (
            <ProcedureCatalogueSection clinicSetup={state.clinicSetup} updateState={updateState} />
          )}

          {activeMenu === "Users & roles" && (
            <UsersRolesSection
              rolePermissions={state.rolePermissions}
              staffRoster={state.clinicSetup.staffRoster}
              cyclePermission={cyclePermission}
              renderPermBadge={renderPermBadge}
            />
          )}

          {activeMenu === "Message templates" && <MessageTemplatesSection />}

          {activeMenu === "Consent & form templates" && <ConsentTemplatesSection />}

          {activeMenu === "Integrations" && <IntegrationsSection />}

          {activeMenu === "Data & privacy (DPDP)" && (
            <DataPrivacySection dpdpLogs={state.dpdpAccessLogs} />
          )}

          {activeMenu === "Subscription & billing" && <SubscriptionBillingSection />}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. Clinic Profile Section
// ----------------------------------------------------------------------
function ClinicProfileSection({
  clinicSetup,
  updateState,
}: {
  clinicSetup: ReturnType<typeof useDentflow>["state"]["clinicSetup"];
  updateState: ReturnType<typeof useDentflow>["updateState"];
}) {
  const [formData, setFormData] = useState({
    clinicGroupName: clinicSetup.clinicGroupName || "Smile Studio Dental",
    legalEntity: "Smile Studio Healthcare Pvt Ltd",
    ceaRegNo: "CEA-MH-2021-8842",
    dentalCouncilReg: "MSDC-14920",
    gstin: clinicSetup.gstin || "27AABCS4821D1Z5",
    city: clinicSetup.city || "Pune, Maharashtra",
    address: "2nd Floor, Orchid Plaza, Station Road, Pune 411001",
    phone: clinicSetup.phone || "+91 20 2612 4400",
    whatsappNumber: clinicSetup.whatsappNumber || "+91 98220 44100",
    email: "care@smilestudiodental.in",
    timezone: "Asia/Kolkata (IST, UTC+05:30)",
    currency: "INR (₹)",
    nabhStatus: "NABH Pre-Accredited Dental Healthcare Facility",
    numberingSystem: (clinicSetup.numberingSystem || "FDI") as "FDI" | "Universal" | "Palmer",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateState((prev) => ({
      ...prev,
      clinicSetup: {
        ...prev.clinicSetup,
        clinicGroupName: formData.clinicGroupName,
        gstin: formData.gstin,
        city: formData.city,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber,
        numberingSystem: formData.numberingSystem,
      },
    }));
    toast.success(`Clinic profile saved (Dental numbering: ${formData.numberingSystem})`);
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="df-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--df-teal)]" />
              Clinic Profile &amp; Regulatory Identity
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Appears on prescriptions, tax invoices, and legal informed consent documents
            </p>
          </div>
          <DentflowStatusPill label="Verified Clinic" tone="green" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              Clinic Brand Name
            </label>
            <input
              type="text"
              value={formData.clinicGroupName}
              onChange={(e) => setFormData({ ...formData, clinicGroupName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              Legal Registered Entity
            </label>
            <input
              type="text"
              value={formData.legalEntity}
              onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              CEA Reg. No. (Clinical Establishments Act)
            </label>
            <input
              type="text"
              value={formData.ceaRegNo}
              onChange={(e) => setFormData({ ...formData, ceaRegNo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              State Dental Council Registration
            </label>
            <input
              type="text"
              value={formData.dentalCouncilReg}
              onChange={(e) => setFormData({ ...formData, dentalCouncilReg: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              GSTIN (Tax Identification)
            </label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              Primary Reception Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              WhatsApp Business API Number
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
              Head Office Postal Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] focus:border-[var(--df-teal)] outline-none"
            />
          </div>

          <div className="md:col-span-2 pt-2 border-t border-[var(--df-border)]">
            <label className="block font-semibold text-[var(--df-text)] mb-1.5">
              Dental Chart Numbering System (Clinic-Wide Default)
            </label>
            <p className="text-[11px] text-[var(--df-text-muted)] mb-2">
              Applies across Odontogram, Periodontal chart, Treatment Plans, and Imaging tooth links.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  { id: "FDI", label: "FDI (ISO 3950)", sample: "18–11 | 21–28 · Primary 55–85" },
                  { id: "Universal", label: "Universal (ADA)", sample: "1–32 · Primary A–T" },
                  { id: "Palmer", label: "Palmer Notation", sample: "8┘..1┘ | └1..└8 · Primary E┘..└E" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, numberingSystem: opt.id });
                    updateState((prev) => ({
                      ...prev,
                      clinicSetup: { ...prev.clinicSetup, numberingSystem: opt.id },
                    }));
                    toast.success(`Clinic tooth numbering switched to ${opt.label}`);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    formData.numberingSystem === opt.id
                      ? "bg-[var(--df-teal-soft)] border-[var(--df-teal)] ring-1 ring-[var(--df-teal)]"
                      : "bg-[var(--df-surface-muted)] border-[var(--df-border)] hover:border-[var(--df-teal)]"
                  }`}
                >
                  <p className="font-bold text-xs text-[var(--df-text)]">{opt.label}</p>
                  <p className="text-[11px] font-mono text-[var(--df-text-muted)] mt-0.5">
                    {opt.sample}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--df-border)]">
          <p className="text-[11px] text-[var(--df-text-muted)]">
            Accreditation: {formData.nabhStatus}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.success("Letterhead and logo preview generated")}
              className="df-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Letterhead
            </button>
            <button
              type="submit"
              className="df-btn-primary px-4 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------------
// 2. Branches Section
// ----------------------------------------------------------------------
function BranchesSection({
  clinicSetup,
  updateState,
}: {
  clinicSetup: ReturnType<typeof useDentflow>["state"]["clinicSetup"];
  updateState: ReturnType<typeof useDentflow>["updateState"];
}) {
  const [branches, setBranches] = useState([
    {
      id: "br-1",
      name: "Station Road branch",
      isFlagship: true,
      chairs: 4,
      address: "2nd Floor, Orchid Plaza, Station Road, Pune 411001",
      manager: "Prakash Jha",
      phone: "+91 20 2612 4401",
      status: "Active",
    },
    {
      id: "br-2",
      name: "Civil Lines branch",
      isFlagship: false,
      chairs: 3,
      address: "14 Residency Road, Civil Lines, Pune 411005",
      manager: "Anita Pawar",
      phone: "+91 20 2612 4402",
      status: "Active",
    },
    {
      id: "br-3",
      name: "MG Road branch",
      isFlagship: false,
      chairs: 2,
      address: "301 Aurora Towers, MG Road, Pune 411001",
      manager: "Ravi Gaikwad",
      phone: "+91 20 2612 4403",
      status: "Active",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: "",
    chairs: 2,
    address: "",
    manager: "",
    phone: "+91 20 ",
  });

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim()) {
      toast.error("Please provide a branch name");
      return;
    }
    const created = {
      id: `br-${Date.now()}`,
      name: newBranch.name,
      isFlagship: false,
      chairs: Number(newBranch.chairs),
      address: newBranch.address || "Pune, Maharashtra",
      manager: newBranch.manager || "Branch Manager",
      phone: newBranch.phone,
      status: "Active",
    };
    setBranches((prev) => [...prev, created]);
    setShowAddModal(false);
    setNewBranch({ name: "", chairs: 2, address: "", manager: "", phone: "+91 20 " });
    toast.success(`Branch ${created.name} configured successfully`);
  };

  const toggleBranchStatus = (id: string) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id !== id
          ? b
          : { ...b, status: b.status === "Active" ? "Paused" : "Active" },
      ),
    );
    toast.info("Branch operating status toggled");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--df-teal)]" />
            Practice Branches ({branches.length} Active Locations)
          </h2>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
            Manage multi-chair branch configurations, managers, and operatory quotas
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="df-btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((b) => (
          <div key={b.id} className="df-card p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[var(--df-text)] truncate">{b.name}</h3>
                  <p className="text-[11px] text-[var(--df-text-muted)]">
                    {b.chairs} Dental Operatories
                  </p>
                </div>
                <DentflowStatusPill
                  label={b.status}
                  tone={b.status === "Active" ? "green" : "grey"}
                />
              </div>

              <div className="text-[11px] space-y-1 text-[var(--df-text-secondary)] pt-1">
                <p className="flex items-start gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0 text-[var(--df-text-muted)] mt-0.5" />
                  <span className="line-clamp-2">{b.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <UserCheck className="h-3 w-3 shrink-0 text-[var(--df-text-muted)]" />
                  <span>Manager: {b.manager}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0 text-[var(--df-text-muted)]" />
                  <span>{b.phone}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--df-border)] text-xs">
              <button
                type="button"
                onClick={() => toggleBranchStatus(b.id)}
                className="text-[11px] font-semibold text-[var(--df-text-muted)] hover:text-[var(--df-text)] cursor-pointer"
              >
                {b.status === "Active" ? "Pause Bookings" : "Resume"}
              </button>
              <button
                type="button"
                onClick={() => toast.info(`Editing branch parameters for ${b.name}`)}
                className="df-btn-secondary px-2 py-1 text-[11px] cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="df-card w-full max-w-md p-5 space-y-4 bg-[var(--df-surface)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-2.5">
              <h3 className="text-sm font-bold text-[var(--df-text)]">Create New Practice Branch</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[var(--df-text-muted)] hover:text-[var(--df-text)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddBranch} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kothrud branch"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
                    Operatory Chairs
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newBranch.chairs}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, chairs: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Shinde"
                    value={newBranch.manager}
                    onChange={(e) => setNewBranch({ ...newBranch, manager: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-[var(--df-text-secondary)] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Street, locality, landmark"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--df-border)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="df-btn-secondary px-3 py-1.5 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="df-btn-primary px-3 py-1.5 text-xs cursor-pointer"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Chairs & Rooms Section
// ----------------------------------------------------------------------
function ChairsRoomsSection({
  clinicSetup,
  updateState,
}: {
  clinicSetup: ReturnType<typeof useDentflow>["state"]["clinicSetup"];
  updateState: ReturnType<typeof useDentflow>["updateState"];
}) {
  const [operatories, setOperatories] = useState([
    {
      id: "ch-1",
      name: "Chair 1 · General & Prophylaxis",
      doctor: "Dr. Arjun Mehta",
      equipment: "Ultrasonic scaler, Intraoral camera, Woodpecker LED curing light",
      branch: "Station Road branch",
      status: "In Service",
    },
    {
      id: "ch-2",
      name: "Chair 2 · Endodontics & Microscope",
      doctor: "Dr. Sneha Kulkarni",
      equipment: "Zeiss Pico Surgical Microscope, Woodpecker Endo Motor, Apex Locator, RVG",
      branch: "Station Road branch",
      status: "In Service",
    },
    {
      id: "ch-3",
      name: "Chair 3 · Orthodontics & Aligners",
      doctor: "Dr. Karan S.",
      equipment: "iTero Element 5D Scanner, UV light cure, Bracket positioning gauge",
      branch: "Station Road branch",
      status: "In Service",
    },
    {
      id: "ch-4",
      name: "Chair 4 · Implant & Surgical Suite",
      doctor: "Dr. Farhan Ali",
      equipment: "W&H Implantmed Motor, Physiodispenser, PRF Centrifuge, Surgical Suction",
      branch: "Station Road branch",
      status: "In Service",
    },
    {
      id: "ch-5",
      name: "Digital RVG & OPG X-ray Suite",
      doctor: "Radiology In-Charge",
      equipment: "Carestream CS8100 3D OPG, Vatech EzSensor, Lead-shielded glass barrier",
      branch: "Station Road branch",
      status: "In Service",
    },
    {
      id: "ch-6",
      name: "Central Sterilisation Bay",
      doctor: "Ravi Gaikwad",
      equipment: "Class-B 23L Vacuum Autoclave, Ultrasonic Bath, Medical Heat Sealer",
      branch: "Station Road branch",
      status: "In Service",
    },
  ]);

  const toggleStatus = (id: string) => {
    setOperatories((prev) =>
      prev.map((op) =>
        op.id !== id
          ? op
          : {
              ...op,
              status: op.status === "In Service" ? "Under Maintenance" : "In Service",
            },
      ),
    );
    toast.info("Operatory chair status updated");
  };

  const handleAddChair = () => {
    const chairNum = operatories.length + 1;
    const newOperatory = {
      id: `ch-${Date.now()}`,
      name: `Chair ${chairNum} · Multi-Specialty Operatory`,
      doctor: "Duty Dentist",
      equipment: "Standard dental unit, Air-rotor, Ultrasonic scaler",
      branch: "Station Road branch",
      status: "In Service",
    };
    setOperatories((prev) => [...prev, newOperatory]);
    toast.success(`Operatory Chair ${chairNum} added to practice roster`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-[var(--df-teal)]" />
            Operatory Chairs &amp; Clinical Suites
          </h2>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
            Monitor clinical operatory units, equipment calibrations, and specialist assignments
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddChair}
          className="df-btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add Operatory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {operatories.map((op) => {
          const isService = op.status === "In Service";
          return (
            <div key={op.id} className="df-card p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-bold text-[var(--df-text)]">{op.name}</h3>
                  <DentflowStatusPill
                    label={op.status}
                    tone={isService ? "green" : "amber"}
                  />
                </div>
                <p className="text-[11px] font-medium text-[var(--df-teal)]">
                  Primary: {op.doctor}
                </p>
                <p className="text-[11px] text-[var(--df-text-muted)] leading-relaxed">
                  <span className="font-semibold text-[var(--df-text-secondary)]">Equipment:</span>{" "}
                  {op.equipment}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--df-border)] text-xs">
                <span className="text-[10px] text-[var(--df-text-muted)] font-mono">
                  {op.branch}
                </span>
                <button
                  type="button"
                  onClick={() => toggleStatus(op.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    isService
                      ? "text-[var(--df-status-amber-text)] hover:bg-[var(--df-status-amber-bg)]"
                      : "text-[var(--df-status-green-text)] hover:bg-[var(--df-status-green-bg)]"
                  }`}
                >
                  {isService ? "Mark for Maintenance" : "Restore to Service"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. Working Hours & Holidays Section
// ----------------------------------------------------------------------
function WorkingHoursHolidaysSection({
  clinicSetup,
}: {
  clinicSetup: ReturnType<typeof useDentflow>["state"]["clinicSetup"];
}) {
  const [schedule, setSchedule] = useState([
    { day: "Monday", hours: "09:30 AM – 08:30 PM", lunch: "01:30 PM – 02:30 PM", status: "Open" },
    { day: "Tuesday", hours: "09:30 AM – 08:30 PM", lunch: "01:30 PM – 02:30 PM", status: "Open" },
    { day: "Wednesday", hours: "09:30 AM – 08:30 PM", lunch: "01:30 PM – 02:30 PM", status: "Open" },
    { day: "Thursday", hours: "09:30 AM – 08:30 PM", lunch: "01:30 PM – 02:30 PM", status: "Open" },
    { day: "Friday", hours: "09:30 AM – 08:30 PM", lunch: "01:30 PM – 02:30 PM", status: "Open" },
    { day: "Saturday", hours: "09:30 AM – 08:30 PM", lunch: "01:30 PM – 02:30 PM", status: "Open" },
    { day: "Sunday", hours: "10:00 AM – 02:00 PM", lunch: "No lunch break", status: "Emergency only" },
  ]);

  const [holidays, setHolidays] = useState([
    { id: "h-1", name: "Diwali / Deepavali", dates: "24 Oct – 26 Oct", type: "Full Clinic Closure" },
    { id: "h-2", name: "Guru Nanak Jayanti", dates: "15 Nov", type: "Emergency Consultations Only" },
    { id: "h-3", name: "Christmas Day", dates: "25 Dec", type: "Half-Day (09:30 AM – 01:30 PM)" },
    { id: "h-4", name: "New Year's Day", dates: "01 Jan", type: "Full Clinic Closure" },
    { id: "h-5", name: "Republic Day", dates: "26 Jan", type: "Full Clinic Closure" },
  ]);

  const handleAddHoliday = () => {
    const title = prompt("Enter holiday or closure name (e.g. Mahashivratri):");
    if (!title) return;
    const dateStr = prompt("Enter date range (e.g. 26 Feb):") || "Upcoming";
    setHolidays((prev) => [
      ...prev,
      { id: `h-${Date.now()}`, name: title, dates: dateStr, type: "Full Clinic Closure" },
    ]);
    toast.success(`Holiday "${title}" scheduled on practice calendar`);
  };

  return (
    <div className="space-y-5">
      {/* Weekly Hours */}
      <div className="df-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--df-teal)]" />
              Operating Hours &amp; Practice Timings
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Syncs with patient WhatsApp self-scheduling and chair slot availability
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.success("Working hours saved to online scheduler")}
            className="df-btn-primary px-3 py-1.5 text-xs cursor-pointer"
          >
            Save Timings
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                <th className="py-2 text-left">Day</th>
                <th className="py-2 text-left">Consultation Hours</th>
                <th className="py-2 text-left">Turnaround / Lunch Break</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--df-border)]">
              {schedule.map((row) => (
                <tr key={row.day} className="hover:bg-[var(--df-surface-hover)]/40">
                  <td className="py-2.5 font-bold text-[var(--df-text)]">{row.day}</td>
                  <td className="py-2.5 text-[var(--df-text-secondary)] font-mono">{row.hours}</td>
                  <td className="py-2.5 text-[var(--df-text-muted)]">{row.lunch}</td>
                  <td className="py-2.5 text-right">
                    <DentflowStatusPill
                      label={row.status}
                      tone={row.status === "Open" ? "green" : "amber"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buffers configuration */}
        <div className="pt-3 border-t border-[var(--df-border)] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[11px] font-bold text-[var(--df-text)]">Default Slot Interval</p>
            <p className="text-lg font-bold text-[var(--df-teal)] mt-0.5">30 mins</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">Standard appointment grid size</p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[11px] font-bold text-[var(--df-text)]">Anxiety Auto-Buffer</p>
            <p className="text-lg font-bold text-[var(--df-teal)] mt-0.5">+15 mins</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">Auto-added when anxiety score ≥ 6</p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[11px] font-bold text-[var(--df-text)]">Operatory Sterilisation</p>
            <p className="text-lg font-bold text-[var(--df-teal)] mt-0.5">10 mins</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">Turnover between patients</p>
          </div>
        </div>
      </div>

      {/* Holidays & Clinic Closures */}
      <div className="df-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--df-teal)]" />
              Upcoming Practice Holidays &amp; Closures
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Online booking automatically prevents appointments on marked closure dates
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddHoliday}
            className="df-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Holiday
          </button>
        </div>

        <div className="divide-y divide-[var(--df-border)]">
          {holidays.map((h) => (
            <div key={h.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-[var(--df-text)]">{h.name}</p>
                <p className="text-[11px] text-[var(--df-text-muted)] font-mono">{h.dates}</p>
              </div>
              <DentflowStatusPill label={h.type} tone="grey" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. Procedure Catalogue & Fees Section
// ----------------------------------------------------------------------
function ProcedureCatalogueSection({
  clinicSetup,
  updateState,
}: {
  clinicSetup: ReturnType<typeof useDentflow>["state"]["clinicSetup"];
  updateState: ReturnType<typeof useDentflow>["updateState"];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [procedures, setProcedures] = useState([
    { id: "pf-1", code: "PR-01", name: "Consultation & digital X-ray", category: "Diagnostic", timeMin: 15, fee: 500, gstPct: 0 },
    { id: "pf-2", code: "PR-02", name: "Scaling & ultrasonic polishing", category: "Preventive", timeMin: 30, fee: 1500, gstPct: 0 },
    { id: "pf-3", code: "PR-03", name: "Posterior composite restoration", category: "Restorative", timeMin: 45, fee: 2200, gstPct: 0 },
    { id: "pf-4", code: "PR-04", name: "Single-sitting molar RCT", category: "Endodontics", timeMin: 60, fee: 8000, gstPct: 0 },
    { id: "pf-5", code: "PR-05", name: "Monolithic Zirconia Crown (5-yr warranty)", category: "Prosthodontics", timeMin: 45, fee: 14500, gstPct: 0 },
    { id: "pf-6", code: "PR-06", name: "Premium Titanium Dental Implant", category: "Surgery", timeMin: 60, fee: 35000, gstPct: 0 },
    { id: "pf-7", code: "PR-07", name: "Clear Aligner Complete Case", category: "Orthodontics", timeMin: 45, fee: 120000, gstPct: 0 },
    { id: "pf-8", code: "PR-08", name: "In-clinic laser teeth whitening", category: "Cosmetic", timeMin: 60, fee: 8500, gstPct: 18 },
    { id: "pf-9", code: "PR-09", name: "Complete acrylic denture set (upper + lower)", category: "Prosthodontics", timeMin: 45, fee: 28000, gstPct: 0 },
    { id: "pf-10", code: "PR-10", name: "Surgical extraction of impacted molar 38", category: "Surgery", timeMin: 45, fee: 6500, gstPct: 0 },
  ]);

  const categories = ["All", "Diagnostic", "Preventive", "Restorative", "Endodontics", "Prosthodontics", "Surgery", "Orthodontics", "Cosmetic"];

  const filtered = procedures.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleEditFee = (id: string, currentFee: number) => {
    const promptVal = prompt(`Enter new fee (₹) for procedure:`, String(currentFee));
    if (!promptVal || isNaN(Number(promptVal))) return;
    const newFee = Number(promptVal);
    setProcedures((prev) =>
      prev.map((p) => (p.id === id ? { ...p, fee: newFee } : p)),
    );
    toast.success(`Standard fee updated to ₹${newFee.toLocaleString("en-IN")}`);
  };

  const handleAddProcedure = () => {
    const name = prompt("Enter procedure name:");
    if (!name) return;
    const feeStr = prompt("Enter standard fee in ₹:") || "1000";
    const newProc = {
      id: `pf-${Date.now()}`,
      code: `PR-${String(procedures.length + 1).padStart(2, "0")}`,
      name,
      category: "Restorative",
      timeMin: 30,
      fee: Number(feeStr),
      gstPct: 0,
    };
    setProcedures((prev) => [...prev, newProc]);
    toast.success(`Procedure "${name}" added to master catalogue`);
  };

  return (
    <div className="df-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] pb-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-[var(--df-teal)]" />
            Standard Procedure Catalogue &amp; Fees Schedule
          </h2>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
            Prices sync directly with treatment plan builders, quotes, and billing invoices
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddProcedure}
          className="df-btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add Procedure
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--df-teal)] text-white font-semibold"
                  : "bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)] hover:text-[var(--df-text)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-[var(--df-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search procedure or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
              <th className="py-2 text-left">Code</th>
              <th className="py-2 text-left">Procedure</th>
              <th className="py-2 text-left">Category</th>
              <th className="py-2 text-left">Chair Time</th>
              <th className="py-2 text-right">Standard Fee</th>
              <th className="py-2 text-right">GST %</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--df-border)]">
            {filtered.map((proc) => (
              <tr key={proc.id} className="hover:bg-[var(--df-surface-hover)]/40">
                <td className="py-2.5 font-mono text-[var(--df-text-muted)]">{proc.code}</td>
                <td className="py-2.5 font-bold text-[var(--df-text)]">{proc.name}</td>
                <td className="py-2.5 text-[var(--df-text-secondary)]">{proc.category}</td>
                <td className="py-2.5 text-[var(--df-text-muted)] font-mono">{proc.timeMin} mins</td>
                <td className="py-2.5 text-right font-bold text-[var(--df-teal)] font-mono">
                  ₹{proc.fee.toLocaleString("en-IN")}
                </td>
                <td className="py-2.5 text-right text-[var(--df-text-muted)] font-mono">
                  {proc.gstPct}%
                </td>
                <td className="py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleEditFee(proc.id, proc.fee)}
                    className="df-btn-secondary px-2 py-1 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" /> Edit Fee
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. Users & Roles Section
// ----------------------------------------------------------------------
function UsersRolesSection({
  rolePermissions,
  staffRoster,
  cyclePermission,
  renderPermBadge,
}: {
  rolePermissions: ReturnType<typeof useDentflow>["state"]["rolePermissions"];
  staffRoster: ReturnType<typeof useDentflow>["state"]["clinicSetup"]["staffRoster"];
  cyclePermission: (permKey: string, role: DentflowRoleKey) => void;
  renderPermBadge: (code: PermissionCode) => React.ReactNode;
}) {
  const [staff, setStaff] = useState([
    { id: "st-1", name: "Dr. Sneha Kulkarni", role: "Owner", email: "sneha@smilestudiodental.in", branch: "Station Road (Flagship)", status: "Active" },
    { id: "st-2", name: "Prakash Jha", role: "Branch mgr", email: "prakash@smilestudiodental.in", branch: "Station Road branch", status: "Active" },
    { id: "st-3", name: "Dr. Arjun Mehta", role: "Dentist", email: "arjun.m@smilestudiodental.in", branch: "Station Road branch", status: "Active" },
    { id: "st-4", name: "Dr. Farhan Ali", role: "Visiting", email: "farhan.surgeon@smilestudiodental.in", branch: "All 3 branches", status: "Active" },
    { id: "st-5", name: "Dr. Karan S.", role: "Visiting", email: "karan.ortho@smilestudiodental.in", branch: "All 3 branches", status: "Active" },
    { id: "st-6", name: "Ravi Gaikwad", role: "Assistant", email: "ravi.g@smilestudiodental.in", branch: "Station Road branch", status: "Active" },
    { id: "st-7", name: "Anita Pawar", role: "Front desk", email: "anita.p@smilestudiodental.in", branch: "Station Road branch", status: "Active" },
    { id: "st-8", name: "Meenakshi Joshi", role: "Accounts", email: "accounts@smilestudiodental.in", branch: "Station Road branch", status: "Active" },
  ]);

  const handleInviteStaff = () => {
    const name = prompt("Enter new staff member name:");
    if (!name) return;
    const role = (prompt("Enter role (Dentist / Visiting / Assistant / Front desk / Accounts):") || "Dentist") as DentflowRoleKey;
    const newStaff = {
      id: `st-${Date.now()}`,
      name,
      role,
      email: `${name.toLowerCase().replace(/[^a-z]/g, "")}@smilestudiodental.in`,
      branch: "Station Road branch",
      status: "Active",
    };
    setStaff((prev) => [...prev, newStaff]);
    toast.success(`Invitation email sent to ${name} (${role})`);
  };

  return (
    <div className="space-y-5">
      {/* Staff directory */}
      <div className="df-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--df-teal)]" />
              Staff Accounts &amp; Specialist Roster ({staff.length} Members)
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Active clinicians, visiting specialists, and practice staff credentials
            </p>
          </div>
          <button
            type="button"
            onClick={handleInviteStaff}
            className="df-btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Invite Staff Member
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                <th className="py-2 text-left">Staff Member</th>
                <th className="py-2 text-left">Role Designation</th>
                <th className="py-2 text-left">Branch Assignment</th>
                <th className="py-2 text-left">Email Address</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--df-border)]">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--df-surface-hover)]/40">
                  <td className="py-2.5 font-bold text-[var(--df-text)]">{s.name}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)]">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-[var(--df-text-secondary)]">{s.branch}</td>
                  <td className="py-2.5 text-[var(--df-text-muted)] font-mono">{s.email}</td>
                  <td className="py-2.5 text-right">
                    <DentflowStatusPill label={s.status} tone="green" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="df-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--df-border)] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--df-teal)]" />
              Role Permission Access Matrix
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Click any cell in the table to toggle access levels live across the application
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.info("Click any cell in the matrix below to toggle F / V / O / —")}
            className="df-btn-secondary px-2.5 py-1 text-xs cursor-pointer"
          >
            Custom Rule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                <th className="py-2 pr-2 text-left">Clinical &amp; Financial Action</th>
                {DENTFLOW_ROLES.map((role) => (
                  <th key={role} className="py-2 px-1.5 text-center">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--df-border)]">
              {rolePermissions.map((row) => (
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
          F = full · V = view · O = own patients only · — = no access. Every read/write action is logged to the DPDP audit trail.
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. Message Templates Section
// ----------------------------------------------------------------------
function MessageTemplatesSection() {
  const [templates, setTemplates] = useState([
    {
      id: "tpl-1",
      name: "Appointment Confirmation (WhatsApp)",
      category: "Appointments",
      trigger: "Instant on booking",
      body: "Dear {{patient_name}}, your appointment at Smile Studio Dental with {{doctor_name}} is confirmed for {{appointment_date}} at {{appointment_time}} ({{branch_name}}).\n\nIf you experience dental anxiety, rest assured our team provides dedicated buffer time and gentle care.\n\nNeed to reschedule? Reply directly to this message.",
    },
    {
      id: "tpl-2",
      name: "24-Hour Visit Reminder",
      category: "Reminders",
      trigger: "24 hours before visit",
      body: "Hi {{patient_name}}, gentle reminder of your upcoming dental visit tomorrow at {{appointment_time}} with {{doctor_name}}.\n\nPlease arrive 5 minutes early. Operatory {{chair_name}} has been sanitized for you. Reply 1 to Confirm, 2 to Reschedule.",
    },
    {
      id: "tpl-3",
      name: "Day 1 Post-Op Check-In",
      category: "Post-op",
      trigger: "Day 1 after procedure at 09:00 AM",
      body: "Hello {{patient_name}}, how are you feeling today following your {{procedure_name}} yesterday?\n\nPlease tap here to complete your 30-second comfort check: {{checkin_link}}\n\nDr. Sneha's clinical team is monitoring your recovery.",
    },
    {
      id: "tpl-4",
      name: "6-Month Preventive Recall & Cleaning",
      category: "Recall",
      trigger: "6 months from last visit",
      body: "Namaste {{patient_name}}, it has been 6 months since your last professional cleaning on {{last_visit_date}}. Regular scaling prevents plaque buildup and gum inflammation.\n\nBook your 30-min routine check-in here: {{booking_link}}",
    },
    {
      id: "tpl-5",
      name: "Invoice & UPI Payment Link",
      category: "Billing",
      trigger: "When invoice is generated",
      body: "Dear {{patient_name}}, thank you for visiting Smile Studio Dental today. Your invoice {{invoice_number}} for ₹{{amount}} has been generated.\n\nPay securely via UPI QR or card: {{payment_link}}\nDownload GST receipt: {{pdf_link}}",
    },
  ]);

  const [selectedId, setSelectedId] = useState("tpl-1");
  const activeTemplate = templates.find((t) => t.id === selectedId) || templates[0];
  const [editedBody, setEditedBody] = useState(activeTemplate.body);

  const handleSelectTemplate = (id: string) => {
    setSelectedId(id);
    const found = templates.find((t) => t.id === id);
    if (found) setEditedBody(found.body);
  };

  const handleSave = () => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, body: editedBody } : t)),
    );
    toast.success(`Template "${activeTemplate.name}" saved successfully`);
  };

  const handleSendTest = () => {
    toast.success("Test WhatsApp message sent to Dr. Sneha Kulkarni (+91 98220 44100)");
  };

  const insertVariable = (variable: string) => {
    setEditedBody((prev) => prev + " " + variable);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--df-teal)]" />
          Automated WhatsApp, SMS &amp; Email Templates
        </h2>
        <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
          Configure patient communication triggers, localized Hindi/English copy, and variables
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Template List */}
        <div className="lg:col-span-5 df-card p-3 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)] px-2 py-1">
            Standard Notification Triggers
          </p>
          {templates.map((tpl) => {
            const isSel = tpl.id === selectedId;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isSel
                    ? "bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-teal)] font-bold shadow-xs"
                    : "hover:bg-[var(--df-surface-hover)] text-[var(--df-text)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{tpl.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--df-surface)] border border-[var(--df-border)] font-normal text-[var(--df-text-muted)]">
                    {tpl.category}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--df-text-muted)] font-normal mt-0.5">
                  Trigger: {tpl.trigger}
                </p>
              </button>
            );
          })}
        </div>

        {/* Template Editor & WhatsApp Preview */}
        <div className="lg:col-span-7 df-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-[var(--df-text)]">{activeTemplate.name}</h3>
              <p className="text-[10px] text-[var(--df-text-muted)]">Official WhatsApp Business Cloud format</p>
            </div>
            <DentflowStatusPill label="Meta Approved" tone="green" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--df-text-secondary)] mb-1">
              Template Message Body
            </label>
            <textarea
              rows={6}
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="w-full p-3 text-xs rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none font-sans leading-relaxed focus:border-[var(--df-teal)]"
            />
          </div>

          {/* Variables helper */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)] mb-1.5">
              Insert Dynamic Patient Variables
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "{{patient_name}}",
                "{{doctor_name}}",
                "{{appointment_time}}",
                "{{appointment_date}}",
                "{{branch_name}}",
                "{{booking_link}}",
                "{{checkin_link}}",
                "{{payment_link}}",
              ].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="px-2 py-0.5 rounded bg-[var(--df-surface-muted)] hover:bg-[var(--df-teal-soft)] hover:text-[var(--df-teal)] text-[10px] font-mono text-[var(--df-text-secondary)] border border-[var(--df-border)] cursor-pointer transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--df-border)]">
            <button
              type="button"
              onClick={handleSendTest}
              className="df-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3 w-3" /> Send Test WhatsApp
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="df-btn-primary px-4 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" /> Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 8. Consent & Form Templates Section
// ----------------------------------------------------------------------
function ConsentTemplatesSection() {
  const [consents, setConsents] = useState([
    {
      id: "cf-1",
      title: "General Medical History & DPDP Data Privacy Consent",
      version: "v3.2",
      type: "Mandatory intake",
      eSignEnabled: true,
      updatedAt: "15 Sep 2026",
    },
    {
      id: "cf-2",
      title: "Informed Consent for Root Canal Treatment (RCT) & Post-Endo Crown",
      version: "v2.1",
      type: "Endodontics",
      eSignEnabled: true,
      updatedAt: "01 Aug 2026",
    },
    {
      id: "cf-3",
      title: "Informed Consent for Surgical Tooth Extraction & Minor Oral Surgery",
      version: "v2.4",
      type: "Oral Surgery",
      eSignEnabled: true,
      updatedAt: "10 Jul 2026",
    },
    {
      id: "cf-4",
      title: "Clear Aligner & Orthodontic Treatment Compliance Agreement",
      version: "v1.9",
      type: "Orthodontics",
      eSignEnabled: true,
      updatedAt: "20 May 2026",
    },
    {
      id: "cf-5",
      title: "Local Anesthesia & Vasoconstrictor Administration Consent",
      version: "v2.0",
      type: "Clinical Anesthesia",
      eSignEnabled: true,
      updatedAt: "12 Apr 2026",
    },
    {
      id: "cf-6",
      title: "Intraoral Photography, Radiograph & Educational Media Release",
      version: "v1.5",
      type: "Media & Case Records",
      eSignEnabled: false,
      updatedAt: "18 Jan 2026",
    },
  ]);

  const [previewModal, setPreviewModal] = useState<string | null>(null);

  const toggleESign = (id: string) => {
    setConsents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, eSignEnabled: !c.eSignEnabled } : c)),
    );
    toast.info("Digital e-signature requirement toggled");
  };

  const handleDownload = (title: string) => {
    toast.success(`Downloaded official PDF template: ${title}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--df-teal)]" />
            Legal Consent &amp; Clinical Form Templates
          </h2>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
            DCI compliant informed consents with digital signature capture and DPDP timestamping
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Consent form upload dialogue opened")}
          className="df-btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Upload Form Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {consents.map((form) => (
          <div key={form.id} className="df-card p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-bold text-[var(--df-text)] line-clamp-2 leading-snug">
                  {form.title}
                </h3>
                <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-muted)]">
                  {form.version}
                </span>
              </div>
              <p className="text-[11px] text-[var(--df-text-muted)]">Category: {form.type}</p>
              <div className="flex items-center gap-2 pt-1">
                <DentflowStatusPill
                  label={form.eSignEnabled ? "E-Sign Required" : "Paper Scan Allowed"}
                  tone={form.eSignEnabled ? "green" : "grey"}
                />
                <span className="text-[10px] text-[var(--df-text-muted)]">
                  Revised: {form.updatedAt}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-[var(--df-border)] text-xs">
              <button
                type="button"
                onClick={() => setPreviewModal(form.title)}
                className="text-[11px] font-semibold text-[var(--df-teal)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Eye className="h-3 w-3" /> Preview Form
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleESign(form.id)}
                  className="df-btn-secondary px-2 py-1 text-[10px] cursor-pointer"
                >
                  {form.eSignEnabled ? "Disable E-Sign" : "Enable E-Sign"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(form.title)}
                  className="df-btn-secondary px-2 py-1 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" /> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="df-card w-full max-w-lg p-5 space-y-4 bg-[var(--df-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-2.5">
              <h3 className="text-xs font-bold text-[var(--df-text)] flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-[var(--df-teal)]" />
                Preview: {previewModal}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="text-[var(--df-text-muted)] hover:text-[var(--df-text)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/40 text-[11px] space-y-2 text-[var(--df-text-secondary)] leading-relaxed max-h-64 overflow-y-auto">
              <p className="font-bold text-[var(--df-text)]">
                Smile Studio Dental Group · Informed Clinical Consent
              </p>
              <p>
                I hereby grant consent to Dr. Sneha Kulkarni and the associate clinical team to perform the diagnostic evaluation and necessary dental procedures. The risks, benefits, and reasonable alternatives have been explained to me in understandable language.
              </p>
              <p>
                I acknowledge that unforeseen conditions may require an extension of the planned procedure or modification of the anesthesia regimen. I confirm that I have disclosed all relevant medical conditions, allergies, and current medications.
              </p>
              <div className="p-2 border border-dashed border-[var(--df-border)] rounded bg-[var(--df-surface)] text-center text-[10px] text-[var(--df-text-muted)]">
                [Digital Patient Signature &amp; Aadhaar/OTP Verification Block]
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--df-border)]">
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="df-btn-primary px-3 py-1.5 text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 9. Integrations Section
// ----------------------------------------------------------------------
interface IntegrationItem {
  id: string;
  name: string;
  provider: string;
  description: string;
  status: string;
  badgeTone: "green" | "amber" | "grey";
  detail: string;
}

function IntegrationsSection() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: "int-wa",
      name: "WhatsApp Business Cloud API",
      provider: "Meta Graph API v19.0",
      description: "Official interactive messaging, reminders, and auto-appointment confirmation bot",
      status: "Connected",
      badgeTone: "green" as const,
      detail: "+91 98220 44100 · 99.8% delivery SLA",
    },
    {
      id: "int-abdm",
      name: "ABDM / ABHA M1 & M2",
      provider: "National Health Authority (NHA)",
      description: "Health ID generation, digital health record sharing & consent artifact management",
      status: "Connected",
      badgeTone: "green" as const,
      detail: "HFR Facility ID: MH-PU-2026-902",
    },
    {
      id: "int-razorpay",
      name: "UPI Smart Gateway & Razorpay",
      provider: "Razorpay Live Gateway",
      description: "Dynamic clinic QR codes at chairside, UPI AutoPay recurring installments & net banking",
      status: "Connected",
      badgeTone: "green" as const,
      detail: "Merchant ID: rzp_live_dentflow99",
    },
    {
      id: "int-emi",
      name: "0% Patient EMI Partner",
      provider: "Bajaj Finserv Health",
      description: "Instant chairside credit approvals for root canals, implants, and clear aligners",
      status: "Connected",
      badgeTone: "green" as const,
      detail: "Instant approval for plans > ₹10,000",
    },
    {
      id: "int-tally",
      name: "Tally Prime & Zoho Books Sync",
      provider: "Tally XML / Cloud Bridge",
      description: "Automatic end-of-day reconciliation of B2C clinical invoices, lab POs, and GST ledgers",
      status: "Connected",
      badgeTone: "green" as const,
      detail: "Sync schedule: Daily at 11:59 PM",
    },
    {
      id: "int-gmb",
      name: "Google Business Profile & Maps",
      provider: "Google My Business API",
      description: "Synchronizes appointment booking buttons and triggers 5-star review request links",
      status: "Connected",
      badgeTone: "green" as const,
      detail: "3 branch locations verified",
    },
    {
      id: "int-imaging",
      name: "Carestream / Vatech RVG & DICOM",
      provider: "PACS Local Bridge",
      description: "Direct DICOM radiograph import from dental sensor into patient chart automatically",
      status: "Connected",
      badgeTone: "green" as const,
      detail: "Auto-associates RVG with active chair",
    },
    {
      id: "int-sms",
      name: "Transactional DLT SMS Gateway",
      provider: "Airtel / Jio DLT Registered",
      description: "TRAI mandated template-compliant SMS fallback for OTPs and appointment updates",
      status: "Connected",
      badgeTone: "green" as const,
      detail: "DLT Header: DNTFLW · 100% compliant",
    },
  ]);

  const handleSync = (name: string) => {
    toast.success(`Sync completed for ${name}`);
  };

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              status: item.status === "Connected" ? "Disconnected" : "Connected",
              badgeTone: item.status === "Connected" ? ("amber" as const) : ("green" as const),
            },
      ),
    );
    toast.info("Integration status updated");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
            <Laptop className="h-4 w-4 text-[var(--df-teal)]" />
            Integrations, Hardware Bridges &amp; Gateways
          </h2>
          <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
            Connected platforms powering dental imaging, payments, accounting, and messaging
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.success("All integration connections verified and healthy")}
          className="df-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Test All Connections
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => {
          const isConnected = item.status === "Connected";
          return (
            <div key={item.id} className="df-card p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--df-text)]">{item.name}</h3>
                    <p className="text-[10px] text-[var(--df-text-muted)] font-mono">{item.provider}</p>
                  </div>
                  <DentflowStatusPill label={item.status} tone={item.badgeTone} />
                </div>
                <p className="text-[11px] text-[var(--df-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
                <p className="text-[10px] font-mono text-[var(--df-teal)]">{item.detail}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--df-border)] text-xs">
                <button
                  type="button"
                  onClick={() => toggleConnection(item.id)}
                  className={`text-[11px] font-semibold transition-colors cursor-pointer ${
                    isConnected
                      ? "text-[var(--df-text-muted)] hover:text-red-500"
                      : "text-[var(--df-teal)]"
                  }`}
                >
                  {isConnected ? "Disconnect" : "Connect Account"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSync(item.name)}
                  className="df-btn-secondary px-2.5 py-1 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Sync Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 10. Data & Privacy (DPDP) Section
// ----------------------------------------------------------------------
function DataPrivacySection({
  dpdpLogs,
}: {
  dpdpLogs: ReturnType<typeof useDentflow>["state"]["dpdpAccessLogs"];
}) {
  const [filter, setFilter] = useState("");

  const filteredLogs = dpdpLogs.filter(
    (log) =>
      log.actor.toLowerCase().includes(filter.toLowerCase()) ||
      log.patientName.toLowerCase().includes(filter.toLowerCase()) ||
      log.screenName.toLowerCase().includes(filter.toLowerCase()) ||
      log.role.toLowerCase().includes(filter.toLowerCase()) ||
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(filter.toLowerCase()),
  );

  const handleExportCSV = () => {
    toast.success("DPDP audit trail exported to compliance-audit-log.csv");
  };

  return (
    <div className="space-y-5">
      {/* Compliance Overview */}
      <div className="df-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--df-teal)]" />
              Digital Personal Data Protection Act (DPDP 2023) Compliance
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Strict access governance, patient consent records, and immutable audit logs
            </p>
          </div>
          <DentflowStatusPill label="DPDP Compliant" tone="green" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[10px] font-bold text-[var(--df-text-muted)] uppercase">Data Fiduciary</p>
            <p className="text-xs font-bold text-[var(--df-text)] mt-1">Smile Studio Healthcare</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">Pvt. Ltd. (Corporate)</p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[10px] font-bold text-[var(--df-text-muted)] uppercase">Data Protection Officer</p>
            <p className="text-xs font-bold text-[var(--df-text)] mt-1">Dr. Sneha Kulkarni</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">dpo@smilestudiodental.in</p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[10px] font-bold text-[var(--df-text-muted)] uppercase">Retention Schedule</p>
            <p className="text-xs font-bold text-[var(--df-teal)] mt-1">7 Years (DCI Compliant)</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">Auto-archival enabled</p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[10px] font-bold text-[var(--df-text-muted)] uppercase">Audit Trail Hash</p>
            <p className="text-xs font-bold text-[var(--df-text)] mt-1 font-mono">SHA-256 Valid</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">Tamper-evident ledger</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="df-card p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-[var(--df-text)]">
              DPDP Patient Record Access Log (Real-time Audit Trail)
            </h3>
            <p className="text-[10px] text-[var(--df-text-muted)]">
              Every clinician access to medical history, prescriptions, and dental charts is tracked
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter actor or patient..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none"
            />
            <button
              type="button"
              onClick={handleExportCSV}
              className="df-btn-secondary px-2.5 py-1 text-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3 w-3" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase text-[var(--df-text-muted)]">
                <th className="py-2 text-left">Time</th>
                <th className="py-2 text-left">Staff Member</th>
                <th className="py-2 text-left">Role</th>
                <th className="py-2 text-left">Patient Record</th>
                <th className="py-2 text-left">Module / Screen</th>
                <th className="py-2 text-left">Details</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--df-border)]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--df-surface-hover)]/40">
                  <td
                    className="py-2 pr-2 text-[var(--df-text-muted)] font-mono whitespace-nowrap"
                    title={log.isoTimestamp || log.timestamp}
                  >
                    {log.timestamp}
                  </td>
                  <td className="py-2 pr-2 font-bold text-[var(--df-text)] whitespace-nowrap">{log.actor}</td>
                  <td className="py-2 pr-2 text-[var(--df-text-secondary)] whitespace-nowrap">{log.role}</td>
                  <td className="py-2 pr-2 font-semibold text-[var(--df-text)] whitespace-nowrap">{log.patientName}</td>
                  <td className="py-2 pr-2 text-[var(--df-text-secondary)] whitespace-nowrap">{log.screenName}</td>
                  <td className="py-2 pr-2 text-[11px] text-[var(--df-text-secondary)] max-w-xs">
                    {log.details || "—"}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <DentflowStatusPill
                      label={log.action}
                      tone={
                        log.action.includes("BLOCKED") || log.action.includes("REJECTED")
                          ? "red"
                          : log.action.includes("CONSENT") || log.action.includes("APPROVED") || log.action.includes("SIGNED")
                          ? "green"
                          : log.action === "READ"
                          ? "blue"
                          : "amber"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 11. Subscription & Billing Section
// ----------------------------------------------------------------------
function SubscriptionBillingSection() {
  const [invoices, setInvoices] = useState([
    { id: "inv-2026-089", date: "28 Oct 2026", description: "DentFlow Enterprise Multi-Branch (Annual)", amount: 84000, status: "Paid" },
    { id: "inv-2026-042", date: "15 Sep 2026", description: "WhatsApp Broadcast Pack (5,000 messages)", amount: 1250, status: "Paid" },
    { id: "inv-2025-081", date: "28 Oct 2025", description: "DentFlow Enterprise Multi-Branch (Annual)", amount: 78000, status: "Paid" },
  ]);

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Downloaded tax invoice receipt: ${id}.pdf`);
  };

  return (
    <div className="space-y-5">
      {/* Current Subscription Tier */}
      <div className="df-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                DentFlow Enterprise Edition (Multi-Branch Suite)
              </h2>
              <DentflowStatusPill label="Active · Auto-Renewing" tone="green" />
            </div>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Annual billing cycle · Next renewal date: 28 October 2027
            </p>
          </div>
          <p className="text-lg font-bold text-[var(--df-teal)] font-mono">
            ₹84,000 <span className="text-xs font-normal text-[var(--df-text-muted)]">/ year</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[10px] font-bold text-[var(--df-text-muted)] uppercase">Practice Scope</p>
            <p className="text-sm font-bold text-[var(--df-text)] mt-1">3 Branches Included</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">Station Rd, Civil Lines, MG Rd</p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[10px] font-bold text-[var(--df-text-muted)] uppercase">Operatory Units</p>
            <p className="text-sm font-bold text-[var(--df-text)] mt-1">Up to 12 Chairs</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">9 currently configured</p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface-muted)]/30">
            <p className="text-[10px] font-bold text-[var(--df-text-muted)] uppercase">Messaging Credits</p>
            <p className="text-sm font-bold text-[var(--df-teal)] mt-1">10,000 msgs / mo</p>
            <p className="text-[10px] text-[var(--df-text-muted)]">WhatsApp Cloud API included</p>
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="df-card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] pb-2.5">
          <h3 className="text-xs font-bold text-[var(--df-text)] flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[var(--df-teal)]" />
            Payment Method on File
          </h3>
          <button
            type="button"
            onClick={() => toast.info("Payment card update gateway opened")}
            className="df-btn-secondary px-2.5 py-1 text-xs cursor-pointer"
          >
            Update Card
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="h-10 w-14 rounded-lg bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] flex items-center justify-center font-bold text-[var(--df-teal)] text-sm">
            VISA
          </div>
          <div>
            <p className="font-bold text-[var(--df-text)]">
              Corporate Platinum Visa ending in <span className="font-mono">4821</span>
            </p>
            <p className="text-[11px] text-[var(--df-text-muted)]">
              Expires 09/2029 · Cardholder: Dr. Sneha Kulkarni · GSTIN: 27AABCS4821D1Z5
            </p>
          </div>
        </div>
      </div>

      {/* Invoices and Tax Receipts */}
      <div className="df-card p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[var(--df-text)]">
            Tax Invoices &amp; Payment Receipts
          </h3>
          <DentflowStatusPill label="All Paid" tone="green" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase text-[var(--df-text-muted)]">
                <th className="py-2 text-left">Invoice No</th>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-right">Amount (₹)</th>
                <th className="py-2 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--df-border)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[var(--df-surface-hover)]/40">
                  <td className="py-2.5 font-mono font-bold text-[var(--df-text)]">{inv.id}</td>
                  <td className="py-2.5 text-[var(--df-text-muted)]">{inv.date}</td>
                  <td className="py-2.5 text-[var(--df-text-secondary)]">{inv.description}</td>
                  <td className="py-2.5 text-right font-bold text-[var(--df-text)] font-mono">
                    ₹{inv.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="df-btn-secondary px-2.5 py-1 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
