"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowKpiCard,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

const SEGMENT_TAGS = [
  { id: "s1", label: "Last visit > 6 mo", countDelta: 84 },
  { id: "s2", label: "Age 30–55", countDelta: 52 },
  { id: "s3", label: "Has WhatsApp consent", countDelta: 40 },
  { id: "s4", label: "Branch: Station Road", countDelta: 36 },
  { id: "s5", label: "Pending plan", countDelta: -48 },
  { id: "s6", label: "Diabetes", countDelta: -62 },
  { id: "s7", label: "Kids in family", countDelta: -54 },
];

const TOP_REFERRERS = [
  { initials: "MN", name: "Meera Nair", count: "6 referred" },
  { initials: "SP", name: "Suresh Patil", count: "4 referred" },
  { initials: "KR", name: "Kavya Reddy", count: "3 referred" },
  { initials: "FS", name: "Fatima Shaikh", count: "3 referred" },
];

export default function CampaignsPage() {
  const { state, updateState } = useDentflow();
  const [activeSegIds, setActiveSegIds] = useState<string[]>(["s1", "s2", "s3", "s4"]);
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [campName, setCampName] = useState("Year-end dental check-up");
  const [campType, setCampType] = useState<"Automation" | "Broadcast" | "Sequence">("Broadcast");
  const [campAudience, setCampAudience] = useState("Last visit > 6 mo · Station Road");

  const toggleSeg = (id: string) => {
    setActiveSegIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const matchedCount = Math.max(
    18,
    SEGMENT_TAGS.filter((t) => activeSegIds.includes(t.id)).reduce(
      (sum, t) => sum + t.countDelta,
      0,
    ),
  );
  const withConsentCount = Math.round(matchedCount * 0.925);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    updateState((prev) => ({
      ...prev,
      campaigns: [
        {
          id: `cmp-${Date.now()}`,
          name: campName,
          type: campType,
          audience: campAudience,
          sent: null,
          booked: null,
          status: "Scheduled",
        },
        ...prev.campaigns,
      ],
    }));
    setNewCampaignOpen(false);
    toast.success(`Scheduled "${campName}" via approved WhatsApp template`);
  };

  return (
    <div>
      <DentflowPageHeader
        title="Recall & campaigns"
        subtitle="Recalls, reviews, referrals and WhatsApp campaigns"
      />

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5">
        <DentflowKpiCard
          label="6-month recalls due (Oct)"
          value="142"
          subtext="88 sent · 37 booked"
          subtextTone="green"
        />
        <DentflowKpiCard
          label="Overdue > 12 months"
          value="318"
          subtext="Win-back campaign ready"
        />
        <DentflowKpiCard
          label="Referrals this month"
          value="26"
          subtext="19 became patients"
          subtextTone="green"
        />
        <DentflowKpiCard
          label="Opt-outs"
          value="0.8%"
          subtext="Below 2% safe limit"
        />
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col Campaigns & automations */}
        <div className="xl:col-span-8 df-card p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              Campaigns &amp; automations
            </h2>
            <button
              type="button"
              onClick={() => setNewCampaignOpen(true)}
              className="df-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> New campaign
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                  <th className="py-2 pr-2 text-left">Name</th>
                  <th className="py-2 px-2 text-left">Type</th>
                  <th className="py-2 px-2 text-left">Audience</th>
                  <th className="py-2 px-2 text-right">Sent</th>
                  <th className="py-2 px-2 text-right">Booked</th>
                  <th className="py-2 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {state.campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--df-surface-hover)]/60">
                    <td className="py-2.5 pr-2 font-bold text-[var(--df-text)]">{c.name}</td>
                    <td className="py-2.5 px-2 text-[var(--df-text-muted)]">{c.type}</td>
                    <td className="py-2.5 px-2 text-[var(--df-text-secondary)]">
                      {c.audience}
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold text-[var(--df-text)]">
                      {c.sent !== null ? c.sent.toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold text-[var(--df-text)]">
                      {c.booked !== null ? c.booked : "—"}
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <DentflowStatusPill
                        label={c.status}
                        tone={
                          c.status === "Live"
                            ? "green"
                            : c.status === "Scheduled"
                            ? "blue"
                            : "grey"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4-col stack */}
        <div className="xl:col-span-4 space-y-4">
          {/* Build a segment */}
          <div className="df-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--df-text)]">Build a segment</h3>
            <div className="flex flex-wrap gap-1.5">
              {SEGMENT_TAGS.map((tag) => {
                const active = activeSegIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleSeg(tag.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                      active
                        ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border-[var(--df-teal-border)]"
                        : "bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)] border-[var(--df-border)]"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[var(--df-text-secondary)]">
              <strong className="text-[var(--df-text)]">
                Matches {matchedCount} patients
              </strong>{" "}
              · {withConsentCount} with WhatsApp consent
            </p>
          </div>

          {/* Top referrers */}
          <div className="df-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--df-text)]">Top referrers</h3>
            <div className="space-y-2.5">
              {TOP_REFERRERS.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full bg-[var(--df-teal-soft)] text-[var(--df-teal)] text-[10px] font-bold flex items-center justify-center">
                      {r.initials}
                    </span>
                    <span className="font-semibold text-[var(--df-text)]">{r.name}</span>
                  </div>
                  <span className="font-bold text-[var(--df-text)]">{r.count}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--df-text-muted)] pt-2 border-t border-[var(--df-border)]">
              Reward: free scaling for referrer after friend&apos;s first paid visit.
            </p>
          </div>

          {/* Google reviews */}
          <div className="df-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-[var(--df-text)]">Google reviews</h3>
            <p className="text-xs text-[var(--df-text-secondary)] leading-relaxed">
              Asked only after visits rated 4–5 in the feedback message. Lower ratings go to the
              owner privately.
            </p>
            <p className="text-xs font-semibold text-[var(--df-status-green-text)] pt-1">
              This month: 41 requests → 17 new reviews
            </p>
          </div>
        </div>
      </div>

      <DentflowDrawer
        open={newCampaignOpen}
        onClose={() => setNewCampaignOpen(false)}
        title="New WhatsApp campaign"
        subtitle="Zero PHI in template · respects quiet hours & opt-outs"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Campaign name
            </label>
            <input
              type="text"
              required
              value={campName}
              onChange={(e) => setCampName(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Type
            </label>
            <select
              value={campType}
              onChange={(e) =>
                setCampType(e.target.value as "Automation" | "Broadcast" | "Sequence")
              }
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            >
              <option value="Broadcast">Broadcast</option>
              <option value="Automation">Automation</option>
              <option value="Sequence">Sequence</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-[var(--df-text-secondary)] mb-1">
              Audience segment
            </label>
            <input
              type="text"
              value={campAudience}
              onChange={(e) => setCampAudience(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <button type="submit" className="w-full df-btn-primary py-2.5 text-xs cursor-pointer">
            Schedule campaign
          </button>
        </form>
      </DentflowDrawer>
    </div>
  );
}

