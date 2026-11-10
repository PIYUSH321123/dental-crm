"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowPageHeader,
  DentflowStatusPill,
  DentflowUniquePill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

function PatientProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState, logPatientRead } = useDentflow();

  const initialId = searchParams?.get("patientId") || "pat-priya";
  const [selectedPatientId, setSelectedPatientId] = useState(initialId);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
  const [waMessage, setWaMessage] = useState(
    "Namaste Priya ji, gentle reminder for your sitting on Thu 1 Oct at 10:00 am with Dr. Sneha.",
  );

  const patient =
    state.patients.find((p) => p.id === selectedPatientId) || state.patients[0];

  useEffect(() => {
    if (patient) {
      logPatientRead(patient.name, "Patients", "READ");
    }
  }, [patient, logPatientRead]);

  const handleSignConsent = (consentId: string) => {
    updateState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) =>
        p.id !== patient.id
          ? p
          : {
              ...p,
              consents: p.consents.map((c) =>
                c.id === consentId
                  ? { ...c, status: "Signed", dateOrNote: "Signed today" }
                  : c,
              ),
              recentActivity: [
                { date: "Today", text: "Crown consent e-signed at clinic" },
                ...p.recentActivity,
              ],
            },
      ),
    }));
    toast.success("Consent e-signed and recorded in DPDP audit log");
  };

  const tabs = [
    { label: "Overview", route: null },
    { label: "Dental chart", route: "/app/dental-chart" },
    { label: "Treatment plans", route: "/app/treatment-plans" },
    { label: "Imaging", route: "/app/dental-chart" },
    { label: "Prescriptions", route: "/app/prescriptions" },
    { label: "Billing", route: "/app/billing" },
    { label: "Messages", route: null },
  ];

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <DentflowPageHeader
        title="Patients"
        subtitle="Patient record · shared across all branches"
      />

      {/* Quick Patient Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {state.patients.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPatientId(p.id);
                setActiveTab("Overview");
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                p.id === patient.id
                  ? "bg-[var(--df-sidebar-bg)] text-white border-[var(--df-sidebar-bg)]"
                  : "bg-[var(--df-surface)] text-[var(--df-text-secondary)] border-[var(--df-border)] hover:bg-[var(--df-surface-hover)]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-[var(--df-text-muted)]">
          DPDP read access automatically logged
        </span>
      </div>

      {/* Main Patient Card */}
      <div className="df-card p-5">
        {/* Hero Row */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--df-border)]">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-teal)] font-bold text-base flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="df-serif text-xl font-semibold text-[var(--df-text)]">
                  {patient.name}
                </h2>
                {patient.abhaLinked && (
                  <DentflowStatusPill label="ABHA linked" tone="green" />
                )}
              </div>
              <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
                {patient.age} · {patient.gender} · ID <span className="df-mono">{patient.code}</span> ·{" "}
                {patient.phone} · Patient since {patient.patientSince} · Home branch:{" "}
                {patient.homeBranch}
              </p>

              {/* Alert & Family Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {patient.allergies.map((al) => (
                  <DentflowStatusPill key={al} label={`Allergy: ${al}`} tone="red" />
                ))}
                {patient.comfortProfile.anxietyScore > 0 && (
                  <DentflowStatusPill
                    label={`Dental anxiety ${patient.comfortProfile.anxietyScore}/10`}
                    tone="amber"
                  />
                )}
                {patient.conditions !== "None" && (
                  <DentflowStatusPill
                    label={patient.conditions.split(",")[0]}
                    tone="blue"
                  />
                )}
                {patient.familyMembers.length > 1 && (
                  <DentflowStatusPill
                    label={`Family of ${patient.familyMembers.length} · ${patient.familyMembers
                      .slice(1)
                      .map((m) => m.name)
                      .join(", ")}`}
                    tone="grey"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMessageDrawerOpen(true)}
              className="df-btn-secondary px-3.5 py-2 text-xs cursor-pointer"
            >
              Message
            </button>
            <button
              type="button"
              onClick={() => router.push("/app/calendar")}
              className="df-btn-primary px-3.5 py-2 text-xs cursor-pointer"
            >
              Book next visit
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-5 border-b border-[var(--df-border)] pt-2 mb-5 overflow-x-auto">
          {tabs.map((tab) => {
            const isCurrent = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  if (tab.route) {
                    router.push(tab.route);
                  } else {
                    setActiveTab(tab.label);
                  }
                }}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? "border-[var(--df-teal)] text-[var(--df-teal)]"
                    : "border-transparent text-[var(--df-text-muted)] hover:text-[var(--df-text)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "Messages" ? (
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold text-[var(--df-text)]">
              WhatsApp &amp; SMS message log (no PHI in template body)
            </p>
            {patient.recentActivity.map((act, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] flex justify-between text-xs"
              >
                <span>{act.text}</span>
                <span className="text-[var(--df-text-muted)]">{act.date}</span>
              </div>
            ))}
          </div>
        ) : (
          /* 3-Column Overview Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Column 1: Medical History */}
            <div className="lg:col-span-4 rounded-xl border border-[var(--df-border)] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-[var(--df-text)]">Medical history</h3>
                  <span className="text-[11px] text-[var(--df-text-muted)]">
                    {patient.medicalUpdatedAt}
                  </span>
                </div>
                <dl className="divide-y divide-[var(--df-border)] text-xs">
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--df-text-muted)]">Allergies</dt>
                    <dd
                      className={`font-semibold text-right ${
                        patient.allergies.length > 0
                          ? "text-[var(--df-status-red-text)]"
                          : "text-[var(--df-text)]"
                      }`}
                    >
                      {patient.allergyNote || (patient.allergies[0] ?? "None")}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--df-text-muted)]">Conditions</dt>
                    <dd className="font-semibold text-[var(--df-text)] text-right">
                      {patient.conditions}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--df-text-muted)]">Medication</dt>
                    <dd className="font-semibold text-[var(--df-text)] text-right">
                      {patient.medication}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--df-text-muted)]">Blood thinners</dt>
                    <dd className="font-semibold text-[var(--df-text)] text-right">
                      {patient.bloodThinners}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--df-text-muted)]">Pregnancy</dt>
                    <dd className="font-semibold text-[var(--df-text)] text-right">
                      {patient.pregnancy}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--df-text-muted)]">Habits</dt>
                    <dd className="font-semibold text-[var(--df-text)] text-right">
                      {patient.habits}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--df-text-muted)]">Last HbA1c (self)</dt>
                    <dd className="font-semibold text-[var(--df-text)] text-right">
                      {patient.lastHba1c}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Column 2: Comfort Profile */}
            <div className="lg:col-span-4 rounded-xl border border-[var(--df-border)] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[var(--df-text)]">Comfort profile</h3>
                  <DentflowUniquePill />
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="df-serif text-3xl font-semibold text-[var(--df-text)]">
                    {patient.comfortProfile.anxietyScore}/10
                  </span>
                  <span className="text-xs text-[var(--df-text-muted)]">
                    anxiety score (self-reported)
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-[11px] font-medium text-[var(--df-text-muted)] mb-1.5">
                    Triggers
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.comfortProfile.triggers.length > 0 ? (
                      patient.comfortProfile.triggers.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text)]"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--df-text-muted)]">None reported</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-[var(--df-text-muted)] mb-1.5">
                    What helps
                  </p>
                  <ul className="space-y-1 text-xs text-[var(--df-text)]">
                    {patient.comfortProfile.whatHelps.map((h) => (
                      <li key={h} className="flex items-start gap-1.5">
                        <span className="text-[var(--df-teal)] font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {patient.comfortProfile.autoBufferMin > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] text-[11px] text-[var(--df-status-amber-text)] leading-relaxed">
                  Auto-adds {patient.comfortProfile.autoBufferMin} min buffer to every booking and
                  sends a calm &ldquo;what to expect&rdquo; message the evening before.
                </div>
              )}
            </div>

            {/* Column 3: Open Treatment Plan + Forms & Consent + Recent Activity */}
            <div className="lg:col-span-4 space-y-3.5">
              {/* Open treatment plan */}
              <div className="rounded-xl border border-[var(--df-border)] p-4">
                <h3 className="text-sm font-bold text-[var(--df-text)] mb-2">
                  Open treatment plan
                </h3>
                {patient.openPlanSummary ? (
                  <>
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--df-text)]">
                      <span>{patient.openPlanSummary.title}</span>
                      <span>₹{patient.openPlanSummary.total.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[11px] text-[var(--df-text-muted)] mt-1">
                      {patient.openPlanSummary.stageLabel} · {patient.openPlanSummary.nextSitting}
                    </p>
                    <Link
                      href="/app/treatment-plans"
                      className="inline-block mt-2 text-xs font-semibold text-[var(--df-teal)] hover:underline"
                    >
                      Open plan
                    </Link>
                  </>
                ) : (
                  <p className="text-xs text-[var(--df-text-muted)]">No open treatment plan</p>
                )}
              </div>

              {/* Forms & consent */}
              <div className="rounded-xl border border-[var(--df-border)] p-4">
                <h3 className="text-sm font-bold text-[var(--df-text)] mb-2.5">
                  Forms &amp; consent
                </h3>
                <ul className="space-y-2 text-xs">
                  {patient.consents.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[var(--df-text)]">
                        {c.status === "Signed" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--df-status-green-text)] shrink-0" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-[var(--df-status-amber-text)] shrink-0" />
                        )}
                        <span>{c.title}</span>
                      </span>
                      {c.status === "Signed" ? (
                        <span className="text-[11px] text-[var(--df-text-muted)]">
                          {c.dateOrNote}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSignConsent(c.id)}
                          className="text-[11px] font-semibold text-[var(--df-status-amber-text)] hover:underline cursor-pointer"
                        >
                          {c.dateOrNote}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent activity */}
              <div className="rounded-xl border border-[var(--df-border)] p-4">
                <h3 className="text-sm font-bold text-[var(--df-text)] mb-2.5">
                  Recent activity
                </h3>
                <ul className="space-y-2 text-[11px]">
                  {patient.recentActivity.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[var(--df-text-muted)] whitespace-nowrap w-11 shrink-0">
                        {act.date}
                      </span>
                      <span className="text-[var(--df-text-secondary)] leading-snug">
                        {act.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Drawer */}
      <DentflowDrawer
        open={messageDrawerOpen}
        onClose={() => setMessageDrawerOpen(false)}
        title={`WhatsApp message · ${patient.name}`}
        subtitle={`Preferred language: ${patient.language} · Quiet hours respected (9 pm – 8 am)`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-xs text-[var(--df-text)]">
            DPDP Guard: Template message sends signed portal link without exposing PHI in WhatsApp body.
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Message preview</label>
            <textarea
              rows={4}
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-[var(--df-border)]"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              updateState((prev) => ({
                ...prev,
                patients: prev.patients.map((p) =>
                  p.id === patient.id
                    ? {
                        ...p,
                        recentActivity: [
                          { date: "Today", text: "WhatsApp appointment reminder sent" },
                          ...p.recentActivity,
                        ],
                      }
                    : p,
                ),
              }));
              toast.success(`WhatsApp reminder sent to ${patient.name}`);
              setMessageDrawerOpen(false);
            }}
            className="df-btn-primary w-full py-2.5 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" /> Send WhatsApp template
          </button>
        </div>
      </DentflowDrawer>
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[var(--df-text-muted)]">Loading patient record...</div>}>
      <PatientProfileContent />
    </Suspense>
  );
}

