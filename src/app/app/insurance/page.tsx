"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  HelpCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowKpiCard,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { formatRelativeFullDate } from "@/lib/date-helpers";
import { useDentflow } from "@/lib/dentflow-store";

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientPhone: string;
  provider: string;
  policyNumber: string;
  procedure: string;
  claimAmount: number;
  approvedAmount: number;
  copayAmount: number;
  status: "Approved" | "In Review" | "Under Query" | "Settled" | "Rejected";
  filingDate: string;
  turnaroundTime: string;
}

const INITIAL_CLAIMS: InsuranceClaim[] = [
  {
    id: "clm-1",
    claimNumber: "CLM-2026-9812",
    patientName: "Priya Deshmukh",
    patientPhone: "+91 98220 44100",
    provider: "Star Health & Allied",
    policyNumber: "SH-9921-48201",
    procedure: "Root canal treatment 36 + zirconia crown",
    claimAmount: 24000,
    approvedAmount: 21500,
    copayAmount: 2500,
    status: "Approved",
    filingDate: formatRelativeFullDate(-1),
    turnaroundTime: "35 mins",
  },
  {
    id: "clm-2",
    claimNumber: "CLM-2026-9805",
    patientName: "Rahul Varma",
    patientPhone: "+91 98220 12345",
    provider: "HDFC ERGO General",
    policyNumber: "HDF-CER-10928",
    procedure: "Surgical extraction of impacted molar 38",
    claimAmount: 8500,
    approvedAmount: 8500,
    copayAmount: 0,
    status: "Settled",
    filingDate: formatRelativeFullDate(-3),
    turnaroundTime: "40 mins",
  },
  {
    id: "clm-3",
    claimNumber: "CLM-2026-9799",
    patientName: "Vikram Singh",
    patientPhone: "+91 98220 77189",
    provider: "Care Health Insurance",
    policyNumber: "CHI-2026-44910",
    procedure: "Full arch periodontal flap surgery & bone graft",
    claimAmount: 32000,
    approvedAmount: 0,
    copayAmount: 0,
    status: "Under Query",
    filingDate: formatRelativeFullDate(0),
    turnaroundTime: "Awaiting OPG",
  },
  {
    id: "clm-4",
    claimNumber: "CLM-2026-9788",
    patientName: "Sunita Rao",
    patientPhone: "+91 98220 67890",
    provider: "Bajaj Allianz General",
    policyNumber: "BAG-POL-88123",
    procedure: "Titanium dental implant 46 + custom abutment",
    claimAmount: 38000,
    approvedAmount: 0,
    copayAmount: 0,
    status: "In Review",
    filingDate: "Today, 09:15 AM",
    turnaroundTime: "Processing",
  },
  {
    id: "clm-5",
    claimNumber: "CLM-2026-9774",
    patientName: "Deepak More",
    patientPhone: "+91 98220 55431",
    provider: "ICICI Lombard",
    policyNumber: "ICICI-HLT-55102",
    procedure: "Single sitting anterior RCT 11",
    claimAmount: 7500,
    approvedAmount: 7500,
    copayAmount: 0,
    status: "Settled",
    filingDate: "24 Sep 2026",
    turnaroundTime: "25 mins",
  },
  {
    id: "clm-6",
    claimNumber: "CLM-2026-9761",
    patientName: "Amit Deshpande",
    patientPhone: "+91 98220 98112",
    provider: "Niva Bupa Health",
    policyNumber: "NB-CORP-33109",
    procedure: "Cosmetic veneers 11-21 (non-trauma)",
    claimAmount: 16000,
    approvedAmount: 0,
    copayAmount: 16000,
    status: "Rejected",
    filingDate: "22 Sep 2026",
    turnaroundTime: "Excluded policy",
  },
];

export default function InsurancePage() {
  const { state } = useDentflow();

  const [claims, setClaims] = useState<InsuranceClaim[]>(INITIAL_CLAIMS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [providerFilter, setProviderFilter] = useState("All");
  const [newClaimOpen, setNewClaimOpen] = useState(false);

  // New claim form state
  const [patientId, setPatientId] = useState("pat-priya");
  const [provider, setProvider] = useState("Star Health & Allied");
  const [policyNumber, setPolicyNumber] = useState("");
  const [procedure, setProcedure] = useState("Root canal treatment + Crown");
  const [estimatedAmount, setEstimatedAmount] = useState("24000");

  const filteredClaims = claims.filter((c) => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(search.toLowerCase()) ||
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.procedure.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesProvider = providerFilter === "All" || c.provider.includes(providerFilter);
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = state.patients.find((p) => p.id === patientId) || state.patients[0];
    const amountNum = Number(estimatedAmount) || 15000;

    const newClaim: InsuranceClaim = {
      id: `clm-${Date.now()}`,
      claimNumber: `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: pat.name,
      patientPhone: pat.phone,
      provider,
      policyNumber: policyNumber || "POL-PENDING-SUBMIT",
      procedure,
      claimAmount: amountNum,
      approvedAmount: 0,
      copayAmount: 0,
      status: "In Review",
      filingDate: "Today, Just now",
      turnaroundTime: "In queue (ETA 30m)",
    };

    setClaims((prev) => [newClaim, ...prev]);
    setNewClaimOpen(false);
    toast.success(
      `Pre-authorization request ${newClaim.claimNumber} submitted to ${provider} cashless desk!`,
    );
  };

  const getStatusTone = (status: InsuranceClaim["status"]) => {
    switch (status) {
      case "Approved":
      case "Settled":
        return "green";
      case "In Review":
        return "blue";
      case "Under Query":
        return "amber";
      case "Rejected":
        return "red";
      default:
        return "grey";
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <DentflowPageHeader
        title="Insurance &amp; TPA Claims"
        subtitle="Cashless dental pre-authorizations, corporate claims, and settlement tracking · All branches"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <DentflowKpiCard
          label="Total Claims Tracked"
          value={String(claims.length)}
          subtext="₹1,26,000 cumulative"
          subtextTone="teal"
          highlighted
        />
        <DentflowKpiCard
          label="Cashless Approvals"
          value="92%"
          subtext="Avg turnaround 35m"
          subtextTone="green"
        />
        <DentflowKpiCard
          label="Pending Settlement"
          value="₹38,000"
          subtext="2 claims in pipeline"
          subtextTone="amber"
        />
        <DentflowKpiCard
          label="Empaneled Insurers"
          value="7 TPAs"
          subtext="ROHINI verified"
          subtextTone="green"
        />
      </div>

      {/* Action Header Card */}
      <div className="df-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative w-56 sm:w-64">
              <Search className="h-3.5 w-3.5 text-[var(--df-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, claim #, policy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none text-xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="In Review">In Review</option>
              <option value="Under Query">Under Query</option>
              <option value="Settled">Settled</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text)] outline-none text-xs cursor-pointer"
            >
              <option value="All">All Insurers</option>
              <option value="Star">Star Health</option>
              <option value="HDFC">HDFC ERGO</option>
              <option value="Care">Care Health</option>
              <option value="Bajaj">Bajaj Allianz</option>
              <option value="ICICI">ICICI Lombard</option>
              <option value="Niva">Niva Bupa</option>
            </select>
          </div>

          {/* New Claim button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.success("Insurance settlement ledger exported to CSV")}
              className="df-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Ledger
            </button>
            <button
              type="button"
              onClick={() => setNewClaimOpen(true)}
              className="df-btn-primary px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> New Pre-Auth Claim
            </button>
          </div>
        </div>

        {/* Claims Table */}
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)] bg-[var(--df-surface-muted)]/40">
                <th className="py-2.5 px-3 text-left">Claim Number</th>
                <th className="py-2.5 px-3 text-left">Patient &amp; Policy</th>
                <th className="py-2.5 px-3 text-left">Insurer / TPA</th>
                <th className="py-2.5 px-3 text-left">Procedure</th>
                <th className="py-2.5 px-3 text-right">Claim Amount</th>
                <th className="py-2.5 px-3 text-right">Approved / Co-pay</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--df-border)]">
              {filteredClaims.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--df-surface-hover)]/40 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-mono font-bold text-[var(--df-text)]">{c.claimNumber}</p>
                    <p className="text-[10px] text-[var(--df-text-muted)]">{c.filingDate}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-[var(--df-text)]">{c.patientName}</p>
                    <p className="text-[10px] font-mono text-[var(--df-text-secondary)]">
                      {c.policyNumber}
                    </p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-[var(--df-text)]">{c.provider}</p>
                    <p className="text-[10px] text-[var(--df-text-muted)]">{c.turnaroundTime}</p>
                  </td>
                  <td className="py-3 px-3 text-[var(--df-text-secondary)] line-clamp-2 max-w-[200px]">
                    {c.procedure}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[var(--df-text)]">
                    ₹{c.claimAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <p className="font-mono font-bold text-[var(--df-teal)]">
                      {c.approvedAmount > 0
                        ? `₹${c.approvedAmount.toLocaleString("en-IN")}`
                        : "—"}
                    </p>
                    {c.copayAmount > 0 && (
                      <p className="text-[10px] text-[var(--df-text-muted)]">
                        Co-pay: ₹{c.copayAmount.toLocaleString("en-IN")}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <DentflowStatusPill label={c.status} tone={getStatusTone(c.status)} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(`Pre-authorization summary for ${c.claimNumber} opened`)
                      }
                      className="df-btn-secondary px-2.5 py-1 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TPA Empanelment & Hospital Network Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="df-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--df-text)]">
            <ShieldCheck className="h-4 w-4 text-[var(--df-teal)]" />
            ROHINI Clinic Registration
          </div>
          <p className="text-xs text-[var(--df-text-secondary)] font-mono">
            ID: ROHINI-MH-PUN-09142
          </p>
          <p className="text-[11px] text-[var(--df-text-muted)] leading-relaxed">
            Registered on the Insurance Information Bureau (IIB) national registry for instant cashless dental settlement.
          </p>
        </div>

        <div className="df-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--df-text)]">
            <Phone className="h-4 w-4 text-[var(--df-teal)]" />
            TPA Helpdesk &amp; Coordinator
          </div>
          <p className="text-xs font-bold text-[var(--df-text)]">Prakash Jha (Branch Manager)</p>
          <p className="text-[11px] text-[var(--df-text-muted)] leading-relaxed">
            Direct helpline: +91 20 2612 4409 · Turnaround desk monitors approvals from 09:00 AM to 08:00 PM.
          </p>
        </div>

        <div className="df-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--df-text)]">
            <FileCheck className="h-4 w-4 text-[var(--df-teal)]" />
            Covered Dental Procedures
          </div>
          <p className="text-[11px] text-[var(--df-text-secondary)] leading-relaxed">
            Major surgical extractions, trauma restorations, periodontal surgeries, and hospitalization-linked root canals are eligible under standard corporate dental riders.
          </p>
        </div>
      </div>

      {/* New Pre-Auth Request Drawer */}
      <DentflowDrawer
        open={newClaimOpen}
        onClose={() => setNewClaimOpen(false)}
        title="New Pre-Authorization Claim"
        subtitle="Submit digital pre-auth request directly to insurer TPA portal"
      >
        <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Select Patient
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs text-[var(--df-text)] outline-none"
            >
              {state.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone}) · {p.homeBranch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Insurance Provider / TPA
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs text-[var(--df-text)] outline-none"
            >
              <option value="Star Health & Allied">Star Health &amp; Allied Insurance</option>
              <option value="HDFC ERGO General">HDFC ERGO Health</option>
              <option value="Care Health Insurance">Care Health Insurance</option>
              <option value="Bajaj Allianz General">Bajaj Allianz General</option>
              <option value="ICICI Lombard">ICICI Lombard Health</option>
              <option value="Niva Bupa Health">Niva Bupa Health Insurance</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Policy / Health Card Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SH-9921-48201"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs font-mono text-[var(--df-text)] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Proposed Procedure / Treatment
            </label>
            <input
              type="text"
              required
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs text-[var(--df-text)] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Estimated Total Treatment Cost (₹)
            </label>
            <input
              type="number"
              required
              min={100}
              value={estimatedAmount}
              onChange={(e) => setEstimatedAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs font-mono text-[var(--df-text)] outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-[var(--df-surface-muted)]/50 border border-[var(--df-border)] space-y-1.5">
            <p className="font-bold text-[var(--df-text)]">Diagnostic Artifact Attachments</p>
            <p className="text-[11px] text-[var(--df-text-muted)]">
              Digital RVG/OPG radiographs and dental chart summary will be automatically attached from patient file.
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--df-teal)] font-semibold">
              <CheckCircle2 className="h-3 w-3" /> Auto-attached from patient record
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full df-btn-primary py-2.5 text-xs font-semibold cursor-pointer shadow-xs"
            >
              Transmit Pre-Auth Request
            </button>
          </div>
        </form>
      </DentflowDrawer>
    </div>
  );
}
