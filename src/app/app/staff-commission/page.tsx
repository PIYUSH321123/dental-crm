"use client";

import React, { useState } from "react";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import { StaffMemberCommission } from "@/types/dentflow";

export default function StaffCommissionPage() {
  const { state, updateState } = useDentflow();
  const [selectedStaffId, setSelectedStaffId] = useState<string>("stf-arjun");
  const [addStaffOpen, setAddStaffOpen] = useState(false);

  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "Associate Dentist",
    branches: "Station Road",
    payModel: "40% net share",
    payable: 35000,
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) return;

    const newStaff: StaffMemberCommission = {
      id: `stf-${Date.now()}`,
      name: staffForm.name.trim(),
      role: staffForm.role,
      branches: staffForm.branches,
      todayStatus: "Present",
      collections: 75000,
      payModel: staffForm.payModel,
      payable: Number(staffForm.payable) || 30000,
      workingDetails: {
        subtitle: `${staffForm.role} · ${staffForm.branches}`,
        modelLabel: staffForm.payModel,
        sharePct: staffForm.payModel.includes("%") ? staffForm.payModel.split(" ")[0] : "100%",
        minimumMonth: "₹25,000 guarantee",
        exceptions: [],
        collectionsPaid: 75000,
        lessLabCosts: 10000,
        netAmount: 65000,
        shareAmount: Number(staffForm.payable) || 30000,
        tdsNote: "10% under 194J",
        approved: false,
      },
    };

    updateState((prev) => ({
      ...prev,
      staffMembers: [...prev.staffMembers, newStaff],
    }));
    setSelectedStaffId(newStaff.id);
    setAddStaffOpen(false);
    setStaffForm({ name: "", role: "Associate Dentist", branches: "Station Road", payModel: "40% net share", payable: 35000 });
    toast.success(`Onboarded ${newStaff.name} (${newStaff.role})`);
  };

  const selectedStaff =
    state.staffMembers.find((s) => s.id === selectedStaffId) || state.staffMembers[0];
  const w = selectedStaff.workingDetails;

  const handleApprovePayout = () => {
    updateState((prev) => ({
      ...prev,
      staffMembers: prev.staffMembers.map((s) =>
        s.id === selectedStaff.id
          ? { ...s, workingDetails: { ...s.workingDetails, approved: true } }
          : s,
      ),
    }));
    toast.success(
      `Approved September payout of ₹${w.shareAmount.toLocaleString("en-IN")} for ${selectedStaff.name}`,
    );
  };

  return (
    <div>
      <DentflowPageHeader
        title="Staff & commission"
        subtitle="September 2026 · payouts calculated from completed, paid procedures"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col Team table */}
        <div className="xl:col-span-8 df-card p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--df-text)]">Team · all branches</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.success("Exported September payroll & TDS 194J CSV")}
                className="df-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Export payroll
              </button>
              <button
                type="button"
                onClick={() => setAddStaffOpen(true)}
                className="df-btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add staff
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                  <th className="py-2 pr-2 text-left">Name</th>
                  <th className="py-2 px-2 text-left">Role</th>
                  <th className="py-2 px-2 text-left">Branches</th>
                  <th className="py-2 px-2 text-left">Today</th>
                  <th className="py-2 px-2 text-right">Collections</th>
                  <th className="py-2 px-2 text-left">Pay model</th>
                  <th className="py-2 pl-2 text-right">Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {state.staffMembers.map((st) => {
                  const isSelected = st.id === selectedStaff.id;
                  return (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStaffId(st.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[var(--df-teal-soft)]/50"
                          : "hover:bg-[var(--df-surface-hover)]/60"
                      }`}
                    >
                      <td className="py-2.5 pr-2 font-bold text-[var(--df-text)] whitespace-nowrap">
                        {st.name}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                        {st.role}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-muted)]">
                        {st.branches}
                      </td>
                      <td className="py-2.5 px-2">
                        <DentflowStatusPill
                          label={st.todayStatus}
                          tone={
                            st.todayStatus === "Present"
                              ? "green"
                              : st.todayStatus === "Visiting"
                              ? "blue"
                              : st.todayStatus === "Leave"
                              ? "amber"
                              : "grey"
                          }
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right text-[var(--df-text)] whitespace-nowrap">
                        {st.collections !== null
                          ? `₹${st.collections.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                        {st.payModel}
                      </td>
                      <td className="py-2.5 pl-2 text-right font-bold text-[var(--df-text)] whitespace-nowrap">
                        {st.payable !== null
                          ? `₹${st.payable.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4-col Pay rule & calculation card */}
        <div className="xl:col-span-4 df-card p-5 space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              Pay rule · {selectedStaff.name}
            </h2>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">{w.subtitle}</p>
          </div>

          <div>
            <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">Model</label>
            <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 font-medium text-[var(--df-text)]">
              {w.modelLabel}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">Share</label>
              <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-1.5 font-semibold">
                {w.sharePct}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">
                Minimum / month
              </label>
              <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-1.5 font-semibold">
                {w.minimumMonth}
              </div>
            </div>
          </div>

          {w.exceptions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-[var(--df-text-muted)]">
                Exceptions by procedure
              </p>
              <div className="divide-y divide-[var(--df-border)] border-t border-b border-[var(--df-border)]">
                {w.exceptions.map((ex) => (
                  <div key={ex.procedure} className="py-2 flex justify-between">
                    <span className="text-[var(--df-text-secondary)]">{ex.procedure}</span>
                    <span className="font-semibold text-[var(--df-text)]">{ex.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <p className="font-bold text-[var(--df-text)]">September working</p>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Collections (paid)</span>
              <span className="font-semibold">
                ₹{w.collectionsPaid.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Less lab costs</span>
              <span>− ₹{w.lessLabCosts.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Net</span>
              <span className="font-semibold">₹{w.netAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="pt-1.5 border-t border-[var(--df-border)] flex justify-between font-bold text-sm">
              <span>{w.sharePct} share</span>
              <span>₹{w.shareAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-[11px] text-[var(--df-text-muted)]">
              <span>TDS (194J) shown on slip</span>
              <span>{w.tdsNote}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApprovePayout}
            className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
          >
            {w.approved ? "Payout approved ✓" : "Approve payout"}
          </button>
        </div>
      </div>

      <DentflowDrawer
        open={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        title="Add clinical or operational staff member"
        subtitle="Configure role, branch assignment, and payout split"
      >
        <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full name</label>
            <input
              required
              type="text"
              placeholder="e.g. Dr. Pooja Rao"
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Staff role</label>
            <select
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            >
              <option>Associate Dentist</option>
              <option>Visiting Specialist</option>
              <option>Branch Manager</option>
              <option>Front Desk</option>
              <option>Dental Assistant</option>
              <option>Accounts & Billing</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Branch assignment</label>
            <select
              value={staffForm.branches}
              onChange={(e) => setStaffForm({ ...staffForm, branches: e.target.value })}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            >
              <option>Station Road</option>
              <option>Civil Lines</option>
              <option>MG Road</option>
              <option>All 3 branches</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Pay structure</label>
              <select
                value={staffForm.payModel}
                onChange={(e) => setStaffForm({ ...staffForm, payModel: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
              >
                <option>40% net share</option>
                <option>50% net share</option>
                <option>Fixed monthly salary</option>
                <option>Per consult fee</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Monthly base / estimate (₹)</label>
              <input
                required
                type="number"
                min="0"
                value={staffForm.payable}
                onChange={(e) => setStaffForm({ ...staffForm, payable: Number(e.target.value) })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
              />
            </div>
          </div>

          <button type="submit" className="w-full df-btn-primary py-2.5 text-xs font-bold cursor-pointer">
            Save &amp; add to staff roster
          </button>
        </form>
      </DentflowDrawer>
    </div>
  );
}

