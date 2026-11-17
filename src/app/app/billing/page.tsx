"use client";

import React, { useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

interface InvoiceLineItem {
  id: string;
  procedure: string;
  tooth: string;
  fee: number;
  discount: number;
  isCosmeticGst: boolean;
}

const INITIAL_LINE_ITEMS: InvoiceLineItem[] = [
  {
    id: "li-1",
    procedure: "Zirconia crown",
    tooth: "46",
    fee: 14500,
    discount: 0,
    isCosmeticGst: false,
  },
  {
    id: "li-2",
    procedure: "Crown cementation & bite check",
    tooth: "46",
    fee: 0,
    discount: 0,
    isCosmeticGst: false,
  },
  {
    id: "li-3",
    procedure: "Teeth whitening (in-clinic)",
    tooth: "All",
    fee: 4000,
    discount: 1000,
    isCosmeticGst: true,
  },
];

export default function BillingPage() {
  const { state, updateState } = useDentflow();
  const [items, setItems] = useState<InvoiceLineItem[]>(INITIAL_LINE_ITEMS);
  const [payTab, setPayTab] = useState<"UPI" | "Card" | "Cash" | "EMI">("UPI");
  const [splitPayment, setSplitPayment] = useState(false);
  const [cashSplit, setCashSplit] = useState("5000");

  const subtotal = items.reduce((acc, it) => acc + Math.max(0, it.fee - it.discount), 0);
  const gstAmount = items.reduce(
    (acc, it) =>
      acc + (it.isCosmeticGst ? Math.round(Math.max(0, it.fee - it.discount) * 0.18) : 0),
    0,
  );
  const advanceAdjusted = 5000;
  const dueNow = Math.max(0, subtotal + gstAmount - advanceAdjusted);

  const handleRecordPayment = () => {
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: "INV-SR-2026-04418",
      patientName: "Neha Gupta",
      method: splitPayment ? "Cash + UPI" : payTab,
      amount: dueNow,
      status: "Paid" as const,
      date: "Today",
      branch: state.activeBranch,
    };
    updateState((prev) => ({
      ...prev,
      invoices: [newInv, ...prev.invoices.filter((i) => i.invoiceNumber !== newInv.invoiceNumber)],
    }));
    toast.success(
      `Payment of ₹${dueNow.toLocaleString("en-IN")} recorded (${newInv.method}) · WhatsApp receipt sent to Neha Gupta`,
    );
  };

  return (
    <div>
      <DentflowPageHeader
        title="Billing"
        subtitle="Invoice INV-SR-2026-04418 · Neha Gupta"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col stack: Invoice items + Recent invoices */}
        <div className="xl:col-span-8 space-y-5">
          {/* Invoice items card */}
          <div className="df-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">Invoice items</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Pulled Zirconia crown 46 from Neha Gupta's active plan")
                  }
                  className="df-btn-secondary px-3 py-1 text-xs cursor-pointer"
                >
                  Pull from treatment plan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => [
                      ...prev,
                      {
                        id: `li-${Date.now()}`,
                        procedure: "Periapical digital X-ray",
                        tooth: "46",
                        fee: 500,
                        discount: 0,
                        isCosmeticGst: false,
                      },
                    ])
                  }
                  className="df-btn-secondary inline-flex items-center gap-1 px-2.5 py-1 text-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Item
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    <th className="py-2 pr-2 text-left">Procedure</th>
                    <th className="py-2 px-2 text-left">Tooth</th>
                    <th className="py-2 px-2 text-right">Fee</th>
                    <th className="py-2 px-2 text-right">Discount</th>
                    <th className="py-2 px-2 text-left">GST</th>
                    <th className="py-2 pl-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--df-border)]">
                  {items.map((it) => {
                    const net = Math.max(0, it.fee - it.discount);
                    const gst = it.isCosmeticGst ? Math.round(net * 0.18) : 0;
                    const rowTotal = net + gst;
                    return (
                      <tr key={it.id}>
                        <td className="py-2.5 pr-2 font-semibold text-[var(--df-text)]">
                          {it.procedure}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                          {it.tooth}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[var(--df-text)]">
                          ₹{it.fee.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[var(--df-text-muted)]">
                          {it.discount > 0 ? `− ₹${it.discount.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                          {it.isCosmeticGst
                            ? `18% · ₹${gst.toLocaleString("en-IN")}`
                            : "Exempt"}
                        </td>
                        <td className="py-2.5 pl-2 text-right font-bold text-[var(--df-text)]">
                          ₹{rowTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="pt-3 border-t border-[var(--df-border)] flex justify-end">
              <div className="w-full max-w-xs space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--df-text-muted)]">Subtotal</span>
                  <span className="font-semibold text-[var(--df-text)]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--df-text-muted)]">
                    GST (18% on cosmetic items only)
                  </span>
                  <span className="text-[var(--df-text-secondary)]">
                    ₹{gstAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--df-text-muted)]">Advance adjusted</span>
                  <span className="text-[var(--df-text-secondary)]">
                    − ₹{advanceAdjusted.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="pt-2 border-t border-[var(--df-border)] flex justify-between items-baseline">
                  <span className="font-bold text-[var(--df-text)]">Due now</span>
                  <span className="df-serif text-xl font-semibold text-[var(--df-text)]">
                    ₹{dueNow.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent invoices · today */}
          <div className="df-card p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--df-text)]">
                Recent invoices · today
              </h2>
              <button
                type="button"
                onClick={() =>
                  toast.success("Downloaded Tally XML voucher export for 29 Sep 2026")
                }
                className="df-btn-secondary inline-flex items-center gap-1.5 px-3 py-1 text-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Export for Tally / accountant
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <tbody className="divide-y divide-[var(--df-border)]">
                  {state.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[var(--df-surface-hover)]/60">
                      <td className="py-2.5 pr-2 font-medium text-[var(--df-text-muted)] whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-2 font-bold text-[var(--df-text)]">
                        {inv.patientName}
                      </td>
                      <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                        {inv.method}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-[var(--df-text)] whitespace-nowrap">
                        {inv.amount < 0
                          ? `− ₹${Math.abs(inv.amount).toLocaleString("en-IN")}`
                          : `₹${inv.amount.toLocaleString("en-IN")}`}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <DentflowStatusPill
                          label={inv.status}
                          tone={
                            inv.status === "Paid"
                              ? "green"
                              : inv.status === "EMI"
                              ? "blue"
                              : inv.status === "Part paid"
                              ? "amber"
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
        </div>

        {/* Right 4-col stack: Collect + Today at this branch */}
        <div className="xl:col-span-4 space-y-4">
          <div className="df-card p-5 space-y-3.5">
            <h2 className="df-serif text-lg font-semibold text-[var(--df-text)]">
              Collect ₹{dueNow.toLocaleString("en-IN")}
            </h2>

            {/* Payment method tabs (single active highlight; clears split mode when a single tab is picked) */}
            <div
              role="tablist"
              aria-label="Payment method"
              className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[var(--df-canvas-subtle)] border border-[var(--df-border)]"
            >
              {(["UPI", "Card", "Cash", "EMI"] as const).map((tab) => {
                const isSelected = !splitPayment && payTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSplitPayment(false);
                      setPayTab(tab);
                    }}
                    className={`py-2 px-1 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-[var(--df-teal)] text-white font-bold shadow-xs ring-1 ring-[var(--df-teal)]"
                        : "bg-transparent text-[var(--df-text-secondary)] font-semibold hover:bg-[var(--df-surface)] hover:text-[var(--df-text)] hover:shadow-xs"
                    }`}
                  >
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-white shrink-0"
                      />
                    )}
                    <span>{tab}</span>
                  </button>
                );
              })}
            </div>

            {!splitPayment && payTab === "UPI" && (
              <div
                role="tabpanel"
                aria-label="UPI payment details"
                className="p-3.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex items-center gap-3.5"
              >
                {/* Deterministic Dynamic UPI QR Matrix */}
                <svg
                  viewBox="0 0 84 84"
                  aria-label="Dynamic UPI QR code"
                  className="h-20 w-20 shrink-0 rounded-lg bg-white p-1.5 border border-[var(--df-border)]"
                >
                  <rect x="4" y="4" width="22" height="22" fill="none" stroke="#18221E" strokeWidth="4" />
                  <rect x="10" y="10" width="10" height="10" fill="#18221E" />
                  <rect x="58" y="4" width="22" height="22" fill="none" stroke="#18221E" strokeWidth="4" />
                  <rect x="64" y="10" width="10" height="10" fill="#18221E" />
                  <rect x="4" y="58" width="22" height="22" fill="none" stroke="#18221E" strokeWidth="4" />
                  <rect x="10" y="64" width="10" height="10" fill="#18221E" />
                  <rect x="34" y="8" width="6" height="6" fill="#18221E" />
                  <rect x="44" y="14" width="6" height="12" fill="#18221E" />
                  <rect x="32" y="32" width="10" height="10" fill="#146C58" />
                  <rect x="46" y="34" width="8" height="6" fill="#18221E" />
                  <rect x="10" y="36" width="12" height="6" fill="#18221E" />
                  <rect x="60" y="38" width="14" height="6" fill="#18221E" />
                  <rect x="34" y="50" width="6" height="14" fill="#18221E" />
                  <rect x="48" y="54" width="10" height="10" fill="#18221E" />
                  <rect x="64" y="62" width="12" height="12" fill="#18221E" />
                  <rect x="36" y="70" width="14" height="6" fill="#18221E" />
                </svg>
                <p className="text-xs text-[var(--df-text-secondary)] leading-relaxed">
                  Dynamic UPI QR for exact amount. Auto-marks paid on bank confirmation. Or send
                  payment link on WhatsApp.
                </p>
              </div>
            )}

            {!splitPayment && payTab === "Card" && (
              <div
                role="tabpanel"
                aria-label="Card payment details"
                className="p-3.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-xs text-[var(--df-text-secondary)]"
              >
                <p className="font-semibold text-[var(--df-text)] mb-0.5">Card POS Terminal</p>
                Pine Labs POS terminal ready · Tap/insert card for ₹{dueNow.toLocaleString("en-IN")}.
              </div>
            )}

            {!splitPayment && payTab === "Cash" && (
              <div
                role="tabpanel"
                aria-label="Cash payment details"
                className="p-3.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-xs text-[var(--df-text-secondary)]"
              >
                <p className="font-semibold text-[var(--df-text)] mb-0.5">Cash Counter</p>
                Cash drawer #1 active · Exact receipt generated upon confirmation.
              </div>
            )}

            {!splitPayment && payTab === "EMI" && (
              <div
                role="tabpanel"
                aria-label="EMI payment details"
                className="p-3.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-xs text-[var(--df-text-secondary)]"
              >
                <p className="font-semibold text-[var(--df-text)] mb-0.5">0% Health EMI Plan</p>
                Bajaj Finserv Health / UPI AutoPay: 3 × ₹
                {Math.round(dueNow / 3).toLocaleString("en-IN")}/mo.
              </div>
            )}

            <label className="flex items-center gap-2 text-xs text-[var(--df-text)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={splitPayment}
                onChange={(e) => setSplitPayment(e.target.checked)}
                className="accent-[var(--df-teal)] h-4 w-4 rounded"
              />
              <span>Split payment (part cash, part UPI)</span>
            </label>

            {splitPayment && (
              <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-teal-border)] space-y-2.5 text-xs">
                <p className="font-semibold text-[var(--df-teal)]">
                  Split collection active · Cash + UPI
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">
                      Cash (₹)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Cash split amount in rupees"
                      value={cashSplit}
                      onChange={(e) => setCashSplit(e.target.value.replace(/[^\d]/g, ""))}
                      className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">
                      UPI balance (₹)
                    </label>
                    <input
                      type="text"
                      readOnly
                      aria-label="UPI balance amount in rupees"
                      value={Math.max(0, dueNow - (Number(cashSplit) || 0)).toLocaleString("en-IN")}
                      className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleRecordPayment}
              className="w-full df-btn-primary py-2.5 text-xs cursor-pointer"
            >
              Record payment &amp; send receipt
            </button>
          </div>

          {/* Today at this branch */}
          <div className="df-card p-5 space-y-2.5 text-xs">
            <h3 className="text-sm font-bold text-[var(--df-text)]">Today at this branch</h3>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Invoiced</span>
              <span className="font-semibold text-[var(--df-text)]">₹61,700</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Collected</span>
              <span className="font-semibold text-[var(--df-status-green-text)]">₹48,200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Outstanding (all time)</span>
              <span className="font-semibold text-[var(--df-text)]">₹1,84,300</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Advances held</span>
              <span className="font-semibold text-[var(--df-text)]">₹22,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--df-text-muted)]">Refunds</span>
              <span className="font-semibold text-[var(--df-text)]">₹500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
