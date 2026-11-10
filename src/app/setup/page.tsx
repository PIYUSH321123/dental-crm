"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DentflowProvider, useDentflow } from "@/lib/dentflow-store";
import { DENTFLOW_ROLES, DentflowRoleKey } from "@/lib/dentflow-theme";

const WIZARD_STEPS = [
  "Clinic profile",
  "Branches",
  "Chairs and rooms",
  "Working hours",
  "Staff and roles",
  "Procedure fees",
  "WhatsApp connect",
  "Done",
] as const;

function SetupWizardInner() {
  const router = useRouter();
  const { state, updateState } = useDentflow();
  const [stepIdx, setStepIdx] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const [profile, setProfile] = useState({
    clinicGroupName: state.clinicSetup.clinicGroupName || "Smile Studio Dental",
    gstin: state.clinicSetup.gstin || "27AABCS4821D1Z5",
    city: state.clinicSetup.city || "Pune, Maharashtra",
    phone: state.clinicSetup.phone || "+91 20 2612 4400",
  });

  const [branches, setBranches] = useState(state.clinicSetup.branches);
  const [newBranchName, setNewBranchName] = useState("");
  const [chairsAndRooms, setChairsAndRooms] = useState(state.clinicSetup.chairsAndRooms);
  const [newChair, setNewChair] = useState("");
  const [workingHours, setWorkingHours] = useState(state.clinicSetup.workingHours);
  const [staffRoster, setStaffRoster] = useState(state.clinicSetup.staffRoster);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<DentflowRoleKey>("Dentist");
  const [procedureFees, setProcedureFees] = useState(state.clinicSetup.procedureFees);
  const [whatsappNumber, setWhatsappNumber] = useState(state.clinicSetup.whatsappNumber);
  const [whatsappConnected, setWhatsappConnected] = useState(true);

  const handleFinish = async () => {
    setFinishing(true);
    const clinicSetup = {
      completed: true,
      ...profile,
      branches,
      chairsAndRooms,
      workingHours,
      staffRoster,
      procedureFees,
      whatsappConnected,
      whatsappNumber,
    };
    updateState((prev) => ({
      ...prev,
      activeRole: "Owner",
      clinicSetup,
    }));

    try {
      const res = await fetch("/api/dentflow/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE_SETUP",
          clinicSetup,
        }),
      });
      const data = await res.json();
      toast.success("Clinic setup complete! Opening All branches group dashboard.");
      router.push(data?.redirectTo || "/app/group-dashboard");
      router.refresh();
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="min-h-screen df-canvas flex flex-col">
      {/* Top Bar */}
      <header className="bg-[var(--df-sidebar-bg)] text-white px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[var(--df-teal)] flex items-center justify-center font-bold text-sm">
            W
          </div>
          <span className="df-serif text-lg font-semibold">DentFlow</span>
          <span className="text-xs text-[var(--df-sidebar-muted)] hidden sm:inline">
            · One-time clinic onboarding
          </span>
        </div>
        <span className="text-xs font-semibold text-[#6EE7B7]">
          Step {stepIdx + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[stepIdx]}
        </span>
      </header>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Stepper Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {WIZARD_STEPS.map((label, idx) => {
            const done = idx < stepIdx;
            const current = idx === stepIdx;
            return (
              <button
                key={label}
                type="button"
                onClick={() => idx <= stepIdx && setStepIdx(idx)}
                className={`p-2 rounded-xl border text-left text-[11px] font-semibold transition-colors ${
                  current
                    ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                    : done
                    ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border-[var(--df-teal-border)] cursor-pointer"
                    : "bg-[var(--df-surface)] text-[var(--df-text-muted)] border-[var(--df-border)]"
                }`}
              >
                <span className="block text-[10px] opacity-75">Step {idx + 1}</span>
                <span className="truncate block">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Step Content Card */}
        <div className="df-card p-6 sm:p-8 space-y-5">
          {stepIdx === 0 && (
            <div className="space-y-4 text-xs">
              <div>
                <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
                  Clinic profile
                </h1>
                <p className="text-[var(--df-text-muted)] mt-0.5">
                  Appears on prescriptions, GST invoices, and patient WhatsApp messages.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Clinic group name</label>
                  <input
                    type="text"
                    value={profile.clinicGroupName}
                    onChange={(e) => setProfile({ ...profile, clinicGroupName: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">GSTIN (optional)</label>
                  <input
                    type="text"
                    value={profile.gstin}
                    onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5 df-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">City & state</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Reception phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
                  />
                </div>
              </div>
            </div>
          )}

          {stepIdx === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">Branches</h1>
                <p className="text-[var(--df-text-muted)] mt-0.5">
                  Configure each physical clinic location in your group.
                </p>
              </div>
              <div className="space-y-2">
                {branches.map((br) => (
                  <div
                    key={br.id}
                    className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-[var(--df-text)]">{br.name}</p>
                      <p className="text-[11px] text-[var(--df-text-muted)]">
                        {br.address} · {br.chairs} chairs
                      </p>
                    </div>
                    {branches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBranches(branches.filter((b) => b.id !== br.id))}
                        className="p-1.5 text-[var(--df-text-muted)] hover:text-[var(--df-status-red-text)] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add another branch (e.g., Kothrud branch)"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="flex-1 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBranchName.trim()) return;
                    setBranches([
                      ...branches,
                      {
                        id: `br-${Date.now()}`,
                        name: newBranchName.trim(),
                        chairs: 2,
                        address: profile.city,
                      },
                    ]);
                    setNewBranchName("");
                  }}
                  className="df-btn-secondary px-3.5 py-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add branch
                </button>
              </div>
            </div>
          )}

          {stepIdx === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
                  Chairs and rooms
                </h1>
                <p className="text-[var(--df-text-muted)] mt-0.5">
                  Used for chair-level calendar scheduling and sterilisation kit traceability.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {chairsAndRooms.map((room, idx) => (
                  <div
                    key={`${room}-${idx}`}
                    className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] flex items-center justify-between"
                  >
                    <span className="font-semibold text-[var(--df-text)]">{room}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setChairsAndRooms(chairsAndRooms.filter((_, i) => i !== idx))
                      }
                      className="text-[var(--df-text-muted)] hover:text-[var(--df-status-red-text)] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add chair or room (e.g., Chair 5 · Pediatric Suite)"
                  value={newChair}
                  onChange={(e) => setNewChair(e.target.value)}
                  className="flex-1 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newChair.trim()) return;
                    setChairsAndRooms([...chairsAndRooms, newChair.trim()]);
                    setNewChair("");
                  }}
                  className="df-btn-secondary px-3.5 py-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          )}

          {stepIdx === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
                  Working hours
                </h1>
                <p className="text-[var(--df-text-muted)] mt-0.5">
                  Defines online booking slots and WhatsApp quiet hours (no automations after 9 pm).
                </p>
              </div>
              <div>
                <label className="block font-semibold mb-1">Standard clinic hours</label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-teal)] font-medium">
                Quiet hours enforced automatically: 9:00 pm – 8:00 am IST for all recovery & gap
                filler messages.
              </div>
            </div>
          )}

          {stepIdx === 4 && (
            <div className="space-y-4 text-xs">
              <div>
                <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
                  Staff and roles
                </h1>
                <p className="text-[var(--df-text-muted)] mt-0.5">
                  Each role inherits its exact permissions from Settings → Users & roles.
                </p>
              </div>
              <div className="divide-y divide-[var(--df-border)] border border-[var(--df-border)] rounded-xl overflow-hidden">
                {staffRoster.map((st) => (
                  <div
                    key={st.id}
                    className="px-3.5 py-2.5 bg-[var(--df-surface)] flex items-center justify-between"
                  >
                    <span className="font-semibold text-[var(--df-text)]">{st.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--df-status-blue-bg)] text-[var(--df-status-blue-text)]">
                      {st.role}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Doctor or staff name"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="flex-1 min-w-44 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as DentflowRoleKey)}
                  className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 font-semibold"
                >
                  {DENTFLOW_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!newStaffName.trim()) return;
                    setStaffRoster([
                      ...staffRoster,
                      { id: `st-${Date.now()}`, name: newStaffName.trim(), role: newStaffRole },
                    ]);
                    setNewStaffName("");
                  }}
                  className="df-btn-secondary px-3.5 py-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Invite
                </button>
              </div>
            </div>
          )}

          {stepIdx === 5 && (
            <div className="space-y-4 text-xs">
              <div>
                <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
                  Procedure fees
                </h1>
                <p className="text-[var(--df-text-muted)] mt-0.5">
                  Clinical dental procedures are GST-exempt (0%); cosmetic procedures apply 18% GST.
                </p>
              </div>
              <div className="divide-y divide-[var(--df-border)] border border-[var(--df-border)] rounded-xl overflow-hidden">
                {procedureFees.map((pf, idx) => (
                  <div
                    key={pf.id}
                    className="px-3.5 py-2.5 bg-[var(--df-surface)] flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-[var(--df-text)]">{pf.name}</p>
                      <p className="text-[10.5px] text-[var(--df-text-muted)]">
                        GST: {pf.gstPct === 0 ? "Exempt (0%)" : "18% Cosmetic"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--df-text-muted)]">₹</span>
                      <input
                        type="number"
                        value={pf.fee}
                        onChange={(e) => {
                          const next = [...procedureFees];
                          next[idx] = { ...pf, fee: Number(e.target.value) };
                          setProcedureFees(next);
                        }}
                        className="w-24 rounded-lg border border-[var(--df-border)] px-2 py-1 text-right df-mono font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stepIdx === 6 && (
            <div className="space-y-4 text-xs">
              <div>
                <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
                  WhatsApp connect
                </h1>
                <p className="text-[var(--df-text-muted)] mt-0.5">
                  Connect your official WhatsApp Business API number for reminders, gap filler, and
                  treatment explainers.
                </p>
              </div>
              <div>
                <label className="block font-semibold mb-1">WhatsApp Business number</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2.5"
                />
              </div>
              <div className="p-4 rounded-xl bg-[var(--df-status-green-bg)] border border-[var(--df-status-green-border)] flex items-center justify-between">
                <div className="text-[var(--df-status-green-text)]">
                  <p className="font-bold">WhatsApp Cloud API verified</p>
                  <p className="text-[11px] mt-0.5">
                    Utility & authentication templates approved · Zero PHI policy active
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappConnected((v) => !v)}
                  className="px-3 py-1 rounded-full bg-white text-[var(--df-status-green-text)] font-bold text-[11px] border border-[var(--df-status-green-border)] cursor-pointer"
                >
                  {whatsappConnected ? "Connected" : "Connect"}
                </button>
              </div>
            </div>
          )}

          {stepIdx === 7 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)]">
                    {profile.clinicGroupName} is ready
                  </h1>
                  <p className="text-[var(--df-text-muted)]">
                    Review your workspace summary and launch your group dashboard.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)]">
                  <p className="text-[10.5px] text-[var(--df-text-muted)]">Branches</p>
                  <p className="df-serif text-xl font-semibold mt-0.5">{branches.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)]">
                  <p className="text-[10.5px] text-[var(--df-text-muted)]">Chairs & rooms</p>
                  <p className="df-serif text-xl font-semibold mt-0.5">{chairsAndRooms.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)]">
                  <p className="text-[10.5px] text-[var(--df-text-muted)]">Staff invited</p>
                  <p className="df-serif text-xl font-semibold mt-0.5">{staffRoster.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)]">
                  <p className="text-[10.5px] text-[var(--df-text-muted)]">WhatsApp</p>
                  <p className="df-serif text-xl font-semibold mt-0.5 text-[var(--df-status-green-text)]">
                    Active
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-[var(--df-border)] flex items-center justify-between">
            <button
              type="button"
              disabled={stepIdx === 0}
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              className="df-btn-secondary px-4 py-2 text-xs disabled:opacity-40 cursor-pointer"
            >
              ← Previous
            </button>

            {stepIdx < WIZARD_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStepIdx((i) => Math.min(WIZARD_STEPS.length - 1, i + 1))}
                className="df-btn-primary px-5 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: {WIZARD_STEPS[stepIdx + 1]}</span>
                <Check className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={finishing}
                onClick={handleFinish}
                className="df-btn-primary px-6 py-2.5 text-xs cursor-pointer disabled:opacity-60"
              >
                {finishing ? "Launching..." : "Finish setup & open All branches →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetupWizardPage() {
  return (
    <DentflowProvider>
      <SetupWizardInner />
    </DentflowProvider>
  );
}

