import React from "react";
import Link from "next/link";
import {
  Building2,
  FlaskConical,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  LayoutDashboard,
} from "lucide-react";

const PORTAL_CARDS = [
  {
    id: "C01–C17",
    title: "Clinic Portal",
    subtitle: "Front desk, dentists, assistants & branch managers",
    desc: "Today queue, chair calendar, patient profile, FDI odontogram, treatment plans, 8-language explainer, Rx allergy guard, post-op monitor, GST/UPI billing, recovery & gap filler.",
    href: "/c/smile-studio/dashboard",
    icon: LayoutDashboard,
    badge: "17 screens",
  },
  {
    id: "O01–O05",
    title: "Owner & Multi-Clinic",
    subtitle: "Clinic owner & accounts",
    desc: "All-branches group KPIs, visiting specialists week grid & revenue share, branch P&L, RBAC permission matrix & DPDP logs, patient retention & drop-off insights.",
    href: "/c/smile-studio/dashboard/all-branches",
    icon: Building2,
    badge: "5 screens",
  },
  {
    id: "P01–P13",
    title: "Patient App (PWA & WhatsApp)",
    subtitle: "Patients and families",
    desc: "Online booking, Hindi WhatsApp bot, patient home, anxiety comfort check, symptom self-check, guided photo check, Hindi explainer, UPI AutoPay EMI, ABHA records, family timeline, aligner timer.",
    href: "/smile-studio/patient-portal",
    icon: Smartphone,
    badge: "13 screens",
  },
  {
    id: "S01",
    title: "Visiting Specialist Portal",
    subtitle: "Visiting endodontist / orthodontist / implantologist",
    desc: "Multi-clinic visiting days, patient schedule with comfort flags, referral inbox & monthly settlement statement.",
    href: "/specialist",
    icon: Stethoscope,
    badge: "S01",
  },
  {
    id: "L01",
    title: "Dental Lab Portal",
    subtitle: "Precision Dental Lab · connected clinics",
    desc: "Open crown/bridge/aligner cases across clinics, VITA shades & STL scans, due dates and live dispatch updates.",
    href: "/lab",
    icon: FlaskConical,
    badge: "L01",
  },
  {
    id: "A01",
    title: "SaaS Super-Admin",
    subtitle: "Platform operations & DPDP compliance",
    desc: "Clinic group accounts, MRR, WhatsApp credits, AI voice minutes metering, feature flags and DPDP request queue.",
    href: "/admin/dashboard",
    icon: ShieldCheck,
    badge: "A01",
  },
];

export default function DentflowLauncherPage() {
  return (
    <div className="min-h-screen df-canvas flex flex-col justify-between">
      <header className="bg-[var(--df-sidebar-bg)] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--df-unique-dark-text)]">
            DentFlow · Dental CRM
          </p>
          <h1 className="df-serif text-3xl sm:text-4xl font-semibold tracking-tight">
            Smile Studio Dental — 38-Screen Unified Workspace
          </h1>
          <p className="text-sm text-[var(--df-sidebar-muted)] max-w-2xl">
            Multi-tenant, multi-branch dental practice management across clinic operations,
            owner analytics, patient PWA/WhatsApp journeys, visiting specialists, dental labs
            and platform admin.
          </p>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PORTAL_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className="df-card p-5 flex flex-col justify-between hover:border-[var(--df-teal)] transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-[var(--df-teal-soft)] text-[var(--df-teal)] flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--df-unique-bg)] text-[var(--df-unique-text)]">
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h2 className="df-serif text-lg font-semibold text-[var(--df-text)] group-hover:text-[var(--df-teal)]">
                    {card.title}
                  </h2>
                  <p className="text-[11px] text-[var(--df-text-muted)]">{card.subtitle}</p>
                </div>
                <p className="text-xs text-[var(--df-text-secondary)] leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <p className="text-xs font-bold text-[var(--df-teal)] mt-4">
                Open {card.id} →
              </p>
            </Link>
          );
        })}
      </main>

      <footer className="max-w-5xl w-full mx-auto px-6 py-4 border-t border-[var(--df-border)] text-[11px] text-[var(--df-text-muted)] flex flex-wrap justify-between gap-2">
        <span>DentFlow v1.0 · Smile Studio Dental (Station Road · Civil Lines · MG Road)</span>
        <span>DPDP access logging &amp; RBAC active</span>
      </footer>
    </div>
  );
}
