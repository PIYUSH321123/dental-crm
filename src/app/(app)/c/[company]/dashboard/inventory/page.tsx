"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  DentflowPageHeader,
  DentflowStatusPill,
  DentflowUniquePill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

export default function InventoryPage() {
  const { state, updateState } = useDentflow();
  const [activeTab, setActiveTab] = useState<
    "Stock" | "Procedure costing" | "Purchase orders" | "Transfers between branches"
  >("Stock");

  const handleCreatePO = () => {
    updateState((prev) => ({
      ...prev,
      inventoryItems: prev.inventoryItems.map((it) =>
        it.status === "Low" ? { ...it, inStock: it.reorderAt + 6, status: "OK" } : it,
      ),
    }));
    toast.success("Purchase order PO-2026-091 created & stock replenished for 4 low items");
  };

  return (
    <div>
      <DentflowPageHeader
        title="Inventory & costing"
        subtitle="Consumables auto-deduct when a procedure is marked done"
      />

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        {(
          [
            "Stock",
            "Procedure costing",
            "Purchase orders",
            "Transfers between branches",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-[var(--df-sidebar-bg)] text-white"
                : "bg-[var(--df-surface)] border border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col card */}
        <div className="xl:col-span-8 df-card p-5 space-y-3.5">
          {activeTab === "Stock" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-[var(--df-text)]">
                  Stock · Station Road
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <DentflowStatusPill label="4 below reorder" tone="red" />
                  <DentflowStatusPill label="2 expiring in 30 days" tone="amber" />
                  <button
                    type="button"
                    onClick={handleCreatePO}
                    className="df-btn-secondary px-3 py-1 text-xs cursor-pointer"
                  >
                    Create purchase order
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                      <th className="py-2 pr-2 text-left">Item</th>
                      <th className="py-2 px-2 text-left">Category</th>
                      <th className="py-2 px-2 text-right">In stock</th>
                      <th className="py-2 px-2 text-right">Reorder at</th>
                      <th className="py-2 px-2 text-left">Nearest expiry</th>
                      <th className="py-2 pl-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--df-border)]">
                    {state.inventoryItems.map((it) => (
                      <tr key={it.id} className="hover:bg-[var(--df-surface-hover)]/60">
                        <td className="py-2.5 pr-2 font-bold text-[var(--df-text)]">
                          {it.item}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--df-text-muted)]">
                          {it.category}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-[var(--df-text)]">
                          {it.inStock}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[var(--df-text-muted)]">
                          {it.reorderAt}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                          {it.nearestExpiry}
                        </td>
                        <td className="py-2.5 pl-2 text-right">
                          <DentflowStatusPill
                            label={it.status}
                            tone={
                              it.status === "Low"
                                ? "red"
                                : it.status === "Expiring"
                                ? "amber"
                                : it.status === "OK"
                                ? "green"
                                : "blue"
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "Procedure costing" && (
            <div className="space-y-3 text-xs">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Auto-deduction bill of materials (BOM)
              </h2>
              <p className="text-[var(--df-text-muted)]">
                Marking a procedure Done in C01/C04 automatically deducts batch stock (FEFO) and
                updates net procedure margin.
              </p>
              <div className="divide-y divide-[var(--df-border)]">
                {state.procedureProfits.map((p) => (
                  <div key={p.procedure} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[var(--df-text)]">{p.procedure}</p>
                      <p className="text-[11px] text-[var(--df-text-muted)]">
                        {p.breakdownNote}
                      </p>
                    </div>
                    <DentflowStatusPill
                      label={`Net ₹${p.profit.toLocaleString("en-IN")} (${p.marginPct}%)`}
                      tone="green"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Purchase orders" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--df-text)]">
                  Purchase orders · September 2026
                </h2>
                <button
                  type="button"
                  onClick={handleCreatePO}
                  className="df-btn-primary px-3 py-1.5 text-xs cursor-pointer"
                >
                  + New PO
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[var(--df-text)]">
                    PO-2026-090 · DentCare Supplies Pune
                  </p>
                  <p className="text-[11px] text-[var(--df-text-muted)]">
                    Rotary files, Composite A2, Nitrile gloves · ₹18,450
                  </p>
                </div>
                <DentflowStatusPill label="In transit" tone="blue" />
              </div>
            </div>
          )}

          {activeTab === "Transfers between branches" && (
            <div className="space-y-3 text-xs">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Inter-branch stock transfers
              </h2>
              <div className="p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[var(--df-text)]">
                    Lignocaine 2% + adrenaline (20 cartridges)
                  </p>
                  <p className="text-[11px] text-[var(--df-text-secondary)]">
                    Civil Lines branch → MG Road branch (expiring 18 Oct 2026 — high daily usage at
                    MG Road)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Inter-branch stock transfer approved")}
                  className="df-btn-primary px-3 py-1.5 text-xs cursor-pointer"
                >
                  Approve transfer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 4-col Real profit per procedure */}
        <div className="xl:col-span-4 df-card p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Real profit per procedure
              </h2>
              <DentflowUniquePill />
            </div>
            <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
              Fee minus consumables, lab, doctor share and chair time · last 90 days
            </p>
          </div>

          <div className="space-y-3.5">
            {state.procedureProfits.map((item) => (
              <div key={item.procedure} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--df-text)]">{item.procedure}</span>
                  <span className="font-bold text-[var(--df-text)]">
                    ₹{item.profit.toLocaleString("en-IN")} · {item.marginPct}%
                  </span>
                </div>
                {/* Stacked horizontal bar */}
                <div className="h-2 w-full rounded-full overflow-hidden flex bg-[var(--df-canvas-subtle)]">
                  <div
                    style={{ width: `${item.materialsBarPct}%` }}
                    className="bg-[var(--df-sidebar-bg)]"
                  />
                  {item.labBarPct > 0 && (
                    <div
                      style={{ width: `${item.labBarPct}%` }}
                      className="bg-[var(--df-unique-text)]"
                    />
                  )}
                  <div
                    style={{ width: `${item.doctorBarPct}%` }}
                    className="bg-[var(--df-status-blue-text)]"
                  />
                  <div
                    style={{ width: `${item.marginBarPct}%` }}
                    className="bg-[var(--df-teal)]"
                  />
                </div>
                <p className="text-[10.5px] text-[var(--df-text-muted)]">
                  {item.breakdownNote}
                </p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-[var(--df-border)] flex flex-wrap items-center gap-3 text-[10.5px] text-[var(--df-text-muted)]">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--df-sidebar-bg)]" />
              Materials + chair
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--df-unique-text)]" />
              Lab
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--df-status-blue-text)]" />
              Doctor share
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--df-teal)]" />
              Margin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

