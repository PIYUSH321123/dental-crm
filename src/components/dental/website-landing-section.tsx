"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Eye,
  ExternalLink,
  Globe,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ClinicLandingConfig, DentflowAppState } from "@/types/dentflow";
import ClinicLandingClient from "@/app/c/[clinicSlug]/clinic-landing-client";

export function WebsiteLandingSection({
  state,
  updateState,
}: {
  state: DentflowAppState;
  updateState: (updater: (prev: DentflowAppState) => DentflowAppState) => void;
}) {
  const defaultSlug = "smile-studio";
  const landings = state.clinicLandings || {};
  const currentConfig: ClinicLandingConfig = landings[defaultSlug] || {
    clinicName: state.clinicSetup.clinicGroupName || "Smile Studio Dental",
    slug: defaultSlug,
    tagline: "Microscopic, painless & digital dentistry across Pune",
    heroTitle: "State-of-the-art dental care with a gentle, caring touch.",
    heroSubtitle:
      "Specialist root canals, computer-guided implants, and invisible aligners with 3D digital scans and transparent pricing.",
    brandColor: "#0D9488",
    phone: state.clinicSetup.phone || "+91 20 2612 4400",
    email: "care@smilestudio.in",
    address: state.clinicSetup.city || "Station Road, Pune",
    workingHours: state.clinicSetup.workingHours || "Mon – Sat: 09:30 am – 08:30 pm",
    logoText: "Smile Studio",
    services: [
      {
        name: "Microscopic Root Canal",
        description: "Single-sitting rotary endodontics with dental operating microscope.",
      },
      {
        name: "Dental Implants",
        description: "CBCT-guided flapless implant placement with lifetime warranty crowns.",
      },
      {
        name: "Clear Aligners",
        description: "Custom digital aligner therapy with 3D intraoral simulation.",
      },
    ],
    doctors: [
      {
        name: "Dr. Sneha Kulkarni",
        specialty: "Founder & Chief Endodontist",
        degrees: "BDS, MDS · 14 yrs exp",
      },
      {
        name: "Dr. Arjun Mehta",
        specialty: "Aesthetic Dentist & Prosthodontist",
        degrees: "BDS, MDS · 8 yrs exp",
      },
    ],
    testimonials: [
      {
        quote: "Painless root canal! The WhatsApp explainer video helped me understand the process.",
        author: "Priya Deshmukh",
        role: "Patient",
      },
    ],
    pricing: [
      {
        name: "Checkup & Digital X-Ray",
        subtitle: "First visit",
        price: "₹500",
        items: ["5-surface tooth exam", "Digital IOPA radiograph", "Treatment plan breakdown"],
      },
      {
        name: "Ultrasonic Cleaning",
        subtitle: "Preventive",
        price: "₹1,500",
        highlighted: true,
        items: ["Full mouth scaling", "Air polishing", "Fluoride enamel varnish"],
      },
    ],
  };

  const [form, setForm] = useState<ClinicLandingConfig>(currentConfig);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state.clinicLandings && state.clinicLandings[form.slug || defaultSlug]) {
      setForm(state.clinicLandings[form.slug || defaultSlug]);
    }
  }, [state.clinicLandings, form.slug]);

  const handleSave = async () => {
    setSaving(true);
    updateState((prev) => ({
      ...prev,
      clinicLandings: {
        ...(prev.clinicLandings || {}),
        [form.slug]: form,
      },
    }));

    try {
      await fetch("/api/dentflow/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: form.slug, config: form }),
      });
    } catch {}

    setSaving(false);
    toast.success(`Published public landing page for ${form.clinicName}! Live at /c/${form.slug}`);
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { name: "New Dental Treatment", description: "Treatment description and clinical care highlights." },
      ],
    }));
  };

  const removeService = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== idx),
    }));
  };

  const addDoctor = () => {
    setForm((prev) => ({
      ...prev,
      doctors: [
        ...prev.doctors,
        { name: "Dr. New Doctor", specialty: "Associate Dentist", degrees: "BDS · 5 yrs exp" },
      ],
    }));
  };

  const removeDoctor = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      doctors: prev.doctors.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Actions */}
      <div className="df-card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[var(--df-teal)]" />
            <h2 className="text-sm font-bold text-[var(--df-text)]">
              Dynamic Website & Patient Landing Page
            </h2>
          </div>
          <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
            Published online at:{" "}
            <Link
              href={`/c/${form.slug}`}
              target="_blank"
              className="text-[var(--df-teal)] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>/c/{form.slug}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLivePreview((v) => !v)}
            className="df-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-[var(--df-teal)]" />
            <span>{showLivePreview ? "Hide preview" : "Live preview"}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="df-btn-primary px-4 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Pane */}
      {showLivePreview && (
        <div className="df-card p-4 space-y-2 border-2 border-[var(--df-teal)] shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-2 text-xs">
            <span className="font-bold text-[var(--df-text)] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--df-teal)]" />
              Live Landing Page Preview (/c/{form.slug})
            </span>
            <span className="text-[11px] text-[var(--df-text-muted)]">
              Updates in real-time as you edit below
            </span>
          </div>
          <div className="rounded-xl overflow-hidden border border-[var(--df-border)] max-h-[600px] overflow-y-auto">
            <ClinicLandingClient initialConfig={form} slug={form.slug} />
          </div>
        </div>
      )}

      {/* Form Fields Card */}
      <div className="df-card p-5 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
          1. Branding & Hero Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Clinic public name</label>
            <input
              type="text"
              value={form.clinicName}
              onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Clinic URL slug (/c/...)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                })
              }
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Brand accent colour</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.brandColor || "#0D9488"}
                onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                className="h-8 w-10 p-0 rounded border border-[var(--df-border)] cursor-pointer"
              />
              <input
                type="text"
                value={form.brandColor || "#0D9488"}
                onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Clinic tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Hero headline</label>
            <input
              type="text"
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Hero subtitle / patient value proposition</label>
            <textarea
              rows={2}
              value={form.heroSubtitle}
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--df-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)] mb-3">
            2. Contact & Visiting Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Helpline / booking phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Clinic email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Branch address / landmarks</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Working hours</label>
              <input
                type="text"
                value={form.workingHours}
                onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--df-border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
              3. Featured Treatments ({form.services.length})
            </h3>
            <button
              type="button"
              onClick={addService}
              className="df-btn-secondary px-2.5 py-1 text-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add treatment
            </button>
          </div>
          <div className="space-y-2.5">
            {form.services.map((svc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] flex items-start gap-3"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Treatment name"
                    value={svc.name}
                    onChange={(e) => {
                      const updated = [...form.services];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setForm({ ...form, services: updated });
                    }}
                    className="font-semibold rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Treatment description"
                    value={svc.description}
                    onChange={(e) => {
                      const updated = [...form.services];
                      updated[idx] = { ...updated[idx], description: e.target.value };
                      setForm({ ...form, services: updated });
                    }}
                    className="sm:col-span-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeService(idx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--df-border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
              4. Specialist Doctors ({form.doctors.length})
            </h3>
            <button
              type="button"
              onClick={addDoctor}
              className="df-btn-secondary px-2.5 py-1 text-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add doctor
            </button>
          </div>
          <div className="space-y-2.5">
            {form.doctors.map((doc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] flex items-start gap-3"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Doctor name"
                    value={doc.name}
                    onChange={(e) => {
                      const updated = [...form.doctors];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setForm({ ...form, doctors: updated });
                    }}
                    className="font-semibold rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Speciality"
                    value={doc.specialty}
                    onChange={(e) => {
                      const updated = [...form.doctors];
                      updated[idx] = { ...updated[idx], specialty: e.target.value };
                      setForm({ ...form, doctors: updated });
                    }}
                    className="rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Degrees & experience"
                    value={doc.degrees}
                    onChange={(e) => {
                      const updated = [...form.doctors];
                      updated[idx] = { ...updated[idx], degrees: e.target.value };
                      setForm({ ...form, doctors: updated });
                    }}
                    className="rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDoctor(idx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--df-border)] flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="df-btn-primary px-6 py-2 text-xs inline-flex items-center gap-2 cursor-pointer font-bold disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Publishing landing page..." : "Save changes & Publish"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
