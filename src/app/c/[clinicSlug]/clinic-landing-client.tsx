"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  Calendar,
  Check,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ClinicLandingConfig } from "@/types/dentflow";

export default function ClinicLandingClient({
  initialConfig,
  slug,
}: {
  initialConfig: ClinicLandingConfig;
  slug: string;
}) {
  const [config] = useState<ClinicLandingConfig>(initialConfig);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    email: "",
    preferredDate: "Tomorrow",
    preferredTime: "11:00 AM",
    concern: "General dental checkup & consultation",
    honeypot: "",
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingForm.honeypot) {
      setBookingSubmitted(true);
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/dentflow/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BOOK_DEMO",
          payload: {
            name: bookingForm.name,
            clinicName: config.clinicName,
            phone: bookingForm.phone,
            email: bookingForm.email,
            preferredDateTime: `${bookingForm.preferredDate} at ${bookingForm.preferredTime}`,
            message: bookingForm.concern,
            clinicSlug: slug,
          },
        }),
      });
      setBookingSubmitted(true);
      toast.success(
        `Consultation requested at ${config.clinicName}! Our front desk will call within 30 minutes.`
      );
    } catch {
      toast.error("Unable to submit consultation request. Please call the clinic directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const brandAccent = config.brandColor || "#0D9488";

  return (
    <div className="min-h-screen df-canvas flex flex-col text-[var(--df-text)]">
      {/* Clinic Top Bar */}
      <header className="sticky top-0 z-40 bg-[var(--df-canvas)]/95 backdrop-blur border-b border-[var(--df-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href={`/c/${slug}`} className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ backgroundColor: brandAccent }}
            >
              {(config.logoText || config.clinicName)[0]}
            </div>
            <div>
              <span className="df-serif text-lg font-semibold tracking-tight text-[var(--df-text)]">
                {config.clinicName}
              </span>
              <p className="text-[10px] text-[var(--df-text-muted)] hidden sm:block">
                {config.tagline}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[var(--df-text-secondary)]">
            <a href="#services" className="hover:text-[var(--df-teal)] transition-colors">
              Treatments
            </a>
            <a href="#doctors" className="hover:text-[var(--df-teal)] transition-colors">
              Doctors
            </a>
            <a href="#pricing" className="hover:text-[var(--df-teal)] transition-colors">
              Fees & Packages
            </a>
            <a href="#testimonials" className="hover:text-[var(--df-teal)] transition-colors">
              Reviews
            </a>
            <a href="#contact" className="hover:text-[var(--df-teal)] transition-colors">
              Location & Hours
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:${config.phone.replace(/\s+/g, "")}`}
              className="df-btn-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5 text-[var(--df-teal)]" />
              <span>{config.phone}</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setBookingSubmitted(false);
                setBookingModalOpen(true);
              }}
              className="df-btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
              style={{ backgroundColor: brandAccent }}
            >
              Book consultation
            </button>
            <Link
              href="/patient/login"
              className="df-btn-secondary px-3 py-2 text-xs"
            >
              Patient portal
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--df-border)] bg-[var(--df-surface)] px-4 py-4 space-y-3">
            <div className="flex flex-col gap-2 text-xs font-semibold text-[var(--df-text-secondary)]">
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Treatments & Services
              </a>
              <a href="#doctors" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Our Specialists
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Transparent Fees
              </a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Patient Testimonials
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Hours & Address
              </a>
            </div>
            <div className="pt-2 border-t border-[var(--df-border)] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setBookingSubmitted(false);
                  setBookingModalOpen(true);
                }}
                className="w-full df-btn-primary py-2.5 text-xs text-center font-bold"
                style={{ backgroundColor: brandAccent }}
              >
                Book consultation
              </button>
              <Link
                href="/patient/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full df-btn-secondary py-2 text-xs text-center"
              >
                Patient portal OTP login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[11px] font-bold text-[var(--df-teal)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Certified Multi-Speciality Practice · DPDP Compliant</span>
            </div>

            <h1 className="df-serif text-3xl sm:text-5xl font-semibold text-[var(--df-text)] tracking-tight leading-[1.12]">
              {config.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-[var(--df-text-secondary)] leading-relaxed max-w-xl">
              {config.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBookingSubmitted(false);
                  setBookingModalOpen(true);
                }}
                className="df-btn-primary px-5 py-3 text-xs sm:text-sm inline-flex items-center gap-2 font-bold cursor-pointer"
                style={{ backgroundColor: brandAccent }}
              >
                <Calendar className="h-4 w-4" />
                <span>Book appointment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={`tel:${config.phone.replace(/\s+/g, "")}`}
                className="df-btn-secondary px-5 py-3 text-xs sm:text-sm inline-flex items-center gap-2"
              >
                <Phone className="h-4 w-4 text-[var(--df-teal)]" />
                <span>Call clinic: {config.phone}</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-3 text-[11px] text-[var(--df-text-muted)] font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--df-teal)]" />
                {config.workingHours}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--df-teal)]" />
                {config.address}
              </span>
            </div>
          </div>

          {/* Quick Appointment Booking Card */}
          <div className="lg:col-span-5">
            <div className="df-card p-6 space-y-4 shadow-lg border-2 border-[var(--df-teal)]/20">
              <div className="border-b border-[var(--df-border)] pb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--df-teal)]">
                  Fast Patient Booking
                </p>
                <h3 className="df-serif text-xl font-semibold text-[var(--df-text)] mt-0.5">
                  Request a consultation
                </h3>
                <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
                  Confirm your appointment time with the doctor in 2 minutes
                </p>
              </div>

              {bookingSubmitted ? (
                <div className="py-6 space-y-3 text-xs text-center">
                  <div className="p-4 rounded-xl bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] font-medium border border-[var(--df-status-green-border)]">
                    Thank you, {bookingForm.name || "Patient"}! Your appointment request has been
                    forwarded to {config.clinicName}&apos;s front desk.
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingSubmitted(false)}
                    className="df-btn-secondary py-2 px-4 text-xs"
                  >
                    Book another consultation
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Full name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Priya Deshmukh"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">WhatsApp number</label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98220 44100"
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Email (optional)</label>
                      <input
                        type="email"
                        placeholder="patient@gmail.com"
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                        className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Preferred day</label>
                      <select
                        value={bookingForm.preferredDate}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, preferredDate: e.target.value })
                        }
                        className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                      >
                        <option>Today (Urgent)</option>
                        <option>Tomorrow</option>
                        <option>In 2–3 days</option>
                        <option>This weekend</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Preferred time</label>
                      <select
                        value={bookingForm.preferredTime}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, preferredTime: e.target.value })
                        }
                        className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                      >
                        <option>Morning (10:00 AM - 01:00 PM)</option>
                        <option>Afternoon (02:00 PM - 05:00 PM)</option>
                        <option>Evening (05:00 PM - 08:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Dental concern</label>
                    <input
                      type="text"
                      placeholder="e.g. Toothache, routine checkup, smile design"
                      value={bookingForm.concern}
                      onChange={(e) => setBookingForm({ ...bookingForm, concern: e.target.value })}
                      className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                    />
                  </div>

                  <input
                    type="text"
                    name="website"
                    value={bookingForm.honeypot}
                    onChange={(e) => setBookingForm({ ...bookingForm, honeypot: e.target.value })}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full df-btn-primary py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: brandAccent }}
                  >
                    {submitting ? "Submitting request..." : "Confirm consultation request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {config.services?.length > 0 && (
        <section id="services" className="border-t border-[var(--df-border)] bg-[var(--df-surface)] py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
                Clinical Excellence
              </p>
              <h2 className="df-serif text-2xl sm:text-3xl font-semibold text-[var(--df-text)]">
                Advanced dental treatments under one roof
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {config.services.map((svc) => (
                <div key={svc.name} className="df-card p-5 space-y-3 bg-[var(--df-surface-muted)]">
                  <div className="h-9 w-9 rounded-xl bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] flex items-center justify-center text-[var(--df-teal)]">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--df-text)]">{svc.name}</h3>
                  <p className="text-xs text-[var(--df-text-secondary)] leading-relaxed">
                    {svc.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors Section */}
      {config.doctors?.length > 0 && (
        <section id="doctors" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
              Our Dental Team
            </p>
            <h2 className="df-serif text-2xl sm:text-3xl font-semibold text-[var(--df-text)]">
              Experienced clinicians dedicated to your smile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {config.doctors.map((doc) => (
              <div key={doc.name} className="df-card p-5 space-y-3 text-center bg-[var(--df-surface)]">
                <div className="h-16 w-16 mx-auto rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] flex items-center justify-center text-[var(--df-teal)] text-xl font-bold">
                  {doc.name.replace("Dr. ", "")[0]}
                </div>
                <div>
                  <h3 className="df-serif text-lg font-semibold text-[var(--df-text)]">{doc.name}</h3>
                  <p className="text-xs font-medium text-[var(--df-teal)] mt-0.5">{doc.specialty}</p>
                  <p className="text-[11px] text-[var(--df-text-muted)] mt-1">{doc.degrees}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pricing / Packages Section */}
      {config.pricing?.length > 0 && (
        <section id="pricing" className="border-t border-[var(--df-border)] bg-[var(--df-surface)] py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
                Transparent Pricing
              </p>
              <h2 className="df-serif text-2xl sm:text-3xl font-semibold text-[var(--df-text)]">
                Clear treatment estimates with zero hidden charges
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {config.pricing.map((plan) => (
                <div
                  key={plan.name}
                  className={`df-card p-6 flex flex-col justify-between space-y-6 ${
                    plan.highlighted
                      ? "border-[var(--df-teal)] ring-2 ring-[var(--df-teal)]/20 bg-[var(--df-surface)]"
                      : "bg-[var(--df-surface-muted)]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="df-serif text-lg font-semibold text-[var(--df-text)]">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-[var(--df-text-muted)]">{plan.subtitle}</p>
                      </div>
                      {plan.highlighted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--df-teal-soft)] text-[var(--df-teal)]">
                          Recommended
                        </span>
                      )}
                    </div>

                    <p className="df-serif text-3xl font-semibold text-[var(--df-text)]">
                      {plan.price}
                    </p>

                    <ul className="space-y-2 text-xs text-[var(--df-text-secondary)]">
                      {plan.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-[var(--df-teal)] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingSubmitted(false);
                      setBookingModalOpen(true);
                    }}
                    className={`w-full py-2.5 text-xs text-center font-bold cursor-pointer ${
                      plan.highlighted ? "df-btn-primary" : "df-btn-secondary"
                    }`}
                    style={plan.highlighted ? { backgroundColor: brandAccent } : {}}
                  >
                    Book this treatment
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {config.testimonials?.length > 0 && (
        <section id="testimonials" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-8">
          <div className="space-y-1 text-center max-w-xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--df-teal)]">
              Real Patient Stories
            </p>
            <h2 className="df-serif text-2xl sm:text-3xl font-semibold text-[var(--df-text)]">
              What patients say about our dental care
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {config.testimonials.map((t) => (
              <div key={t.author} className="df-card p-5 space-y-3 bg-[var(--df-surface)]">
                <div className="flex gap-0.5 text-[#D97706]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[var(--df-text)] leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-2 border-t border-[var(--df-border)]">
                  <p className="text-xs font-bold text-[var(--df-text)]">{t.author}</p>
                  <p className="text-[11px] text-[var(--df-text-muted)]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact & Footer Section */}
      <footer id="contact" className="border-t border-[var(--df-border)] bg-[var(--df-sidebar-bg)] text-white py-12 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <span className="df-serif text-xl font-semibold">{config.clinicName}</span>
            <p className="text-xs text-white/70 max-w-sm">{config.tagline}</p>
            <p className="text-xs text-white/70">
              {config.address} · {config.phone} · {config.email}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Working Hours</p>
            <p className="text-xs text-white/75 leading-relaxed">{config.workingHours}</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Quick Access</p>
            <div className="flex flex-col gap-1.5 text-white/75 font-medium">
              <Link href="/patient/login" className="hover:text-[var(--df-teal)]">
                Patient OTP Portal
              </Link>
              <Link href="/login" className="hover:text-[var(--df-teal)]">
                Clinic Staff Sign In
              </Link>
              <Link href="/" className="hover:text-[var(--df-teal)]">
                DentFlow CRM Platform
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-white/10 text-[11px] text-white/50 flex flex-wrap justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} {config.clinicName}. All rights reserved.</span>
          <span>Powered by DentFlow Dental CRM</span>
        </div>
      </footer>

      {/* Booking Drawer / Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="df-card w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-3">
              <div>
                <h3 className="df-serif text-lg font-semibold text-[var(--df-text)]">
                  Book with {config.clinicName}
                </h3>
                <p className="text-xs text-[var(--df-text-muted)]">
                  Direct consultation booking with our clinical specialists
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--df-surface-hover)] text-[var(--df-text-muted)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {bookingSubmitted ? (
              <div className="py-4 space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] font-medium border border-[var(--df-status-green-border)]">
                  Thank you! Your consultation request has been confirmed. Our clinic coordinator
                  will reach out on <strong>{bookingForm.phone}</strong> shortly.
                </div>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="w-full df-btn-primary py-2.5 text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Your name</label>
                  <input
                    required
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="e.g. Priya Deshmukh"
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">WhatsApp phone number</label>
                  <input
                    required
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    placeholder="+91 98220 44100"
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Day</label>
                    <select
                      value={bookingForm.preferredDate}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, preferredDate: e.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                    >
                      <option>Today</option>
                      <option>Tomorrow</option>
                      <option>In 2–3 days</option>
                      <option>This weekend</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Time</label>
                    <select
                      value={bookingForm.preferredTime}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, preferredTime: e.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2"
                    >
                      <option>Morning (10:00 AM)</option>
                      <option>Noon (12:30 PM)</option>
                      <option>Afternoon (03:30 PM)</option>
                      <option>Evening (06:30 PM)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Reason for consultation</label>
                  <textarea
                    rows={2}
                    value={bookingForm.concern}
                    onChange={(e) => setBookingForm({ ...bookingForm, concern: e.target.value })}
                    className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full df-btn-primary py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: brandAccent }}
                >
                  {submitting ? "Booking..." : "Submit consultation request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
