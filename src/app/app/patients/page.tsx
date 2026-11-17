"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertCircle,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Sliders,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DentflowChromeTabs,
  DentflowDrawer,
  DentflowPageHeader,
  DentflowStatusPill,
  DentflowUniquePill,
} from "@/components/dental/dentflow-primitives";
import { CONSENT_TEXT_VERSIONS } from "@/lib/dentflow-migrations";
import { useDentflow } from "@/lib/dentflow-store";
import { ROLE_USER_PROFILES } from "@/lib/dentflow-theme";
import { DentflowPatient, PatientConsentRecord } from "@/types/dentflow";

const ALLERGY_OPTIONS = ["Penicillin", "Sulfa drugs", "NSAIDs / Ibuprofen", "Latex", "Local anaesthetic", "Aspirin"];
const CONDITION_OPTIONS = ["Diabetes", "Hypertension", "Cardiac condition", "Asthma", "Thyroid", "Bleeding disorder"];
const TRIGGER_OPTIONS = ["Needles / Injections", "Drill sound", "Lying completely flat", "Gagging", "Numbness feeling"];

function PatientsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState, logPatientRead } = useDentflow();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [doctorFilter, setDoctorFilter] = useState("All Doctors");
  const [genderFilter, setGenderFilter] = useState("All Genders");
  const [pendingDuesOnly, setPendingDuesOnly] = useState(false);

  // Drawers & Modals
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat-priya");
  const [activeProfileTab, setActiveProfileTab] = useState<string>("Overview");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [actionMenuPatientId, setActionMenuPatientId] = useState<string | null>(null);

  const INITIAL_REGISTRATION_FORM = {
    firstName: "",
    lastName: "",
    dob: "1995-05-12",
    age: "31",
    gender: "Female" as "Female" | "Male" | "Other",
    photo: "",
    phone: "",
    whatsappConsent: false,
    whatsappDeclined: false,
    email: "",
    address: "",
    city: "Pune",
    pincode: "411001",
    preferredLanguage: "English" as "English" | "हिन्दी" | "मराठी" | "ગુજરાતી",
    allergies: [] as string[],
    customAllergy: "",
    conditions: [] as string[],
    medications: "",
    bloodThinners: "None",
    pregnancy: "No",
    anxietyScore: 5,
    triggers: [] as string[],
    comfortNotes: "",
    source: "Google search",
    treatmentConsent: false,
    dpdpConsent: false,
  };

  // New Patient Form State — all consents start unticked by default
  const [form, setForm] = useState(INITIAL_REGISTRATION_FORM);
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);
  const [consentError, setConsentError] = useState<string | null>(null);

  // Live duplicate check on phone number
  const duplicatePhonePatient = useMemo(() => {
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 7) return null;
    const tail = digits.slice(-10);
    return (
      state.patients.find((p) => {
        const pDigits = p.phone.replace(/\D/g, "");
        return pDigits.length >= 7 && (pDigits.endsWith(tail) || tail.endsWith(pDigits.slice(-7)));
      }) || null
    );
  }, [form.phone, state.patients]);

  // URL sync for profile drawer
  useEffect(() => {
    const pid = searchParams?.get("patientId");
    if (pid) {
      setSelectedPatientId(pid);
      setProfileDrawerOpen(true);
    }
  }, [searchParams]);

  const selectedPatient = useMemo(() => {
    return state.patients.find((p) => p.id === selectedPatientId) || state.patients[0];
  }, [state.patients, selectedPatientId]);

  // DPDP access log on viewing patient
  const handleOpenProfile = (patient: DentflowPatient) => {
    setSelectedPatientId(patient.id);
    setProfileDrawerOpen(true);
    logPatientRead(patient.name, "Patients", "READ");
  };

  // Filter logic
  const filteredPatients = useMemo(() => {
    return state.patients.filter((p) => {
      // Search
      const q = searchTerm.trim().toLowerCase();
      if (q) {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesPhone = p.phone.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCode) return false;
      }

      // Status Filter
      if (statusFilter !== "All Status") {
        if (statusFilter === "Recall due" && !p.flags.includes("New")) return false;
        if (statusFilter === "High risk" && !p.flags.includes("Anxious") && !p.flags.includes("Allergy")) return false;
        if (statusFilter === "VIP" && !p.flags.includes("VIP")) return false;
      }

      // Gender Filter
      if (genderFilter !== "All Genders" && p.gender !== genderFilter) {
        return false;
      }

      // Pending dues
      if (pendingDuesOnly && (p.lifetimeValue || 0) < 30000) {
        // mock dues condition
        return false;
      }

      return true;
    });
  }, [state.patients, searchTerm, statusFilter, genderFilter, pendingDuesOnly]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Patient ID", "Name", "Phone", "Age", "Gender", "Branch", "Allergies", "Anxiety Score", "Lifetime Value"];
    const rows = filteredPatients.map((p) => [
      p.code,
      `"${p.name}"`,
      p.phone,
      p.age,
      p.gender,
      `"${p.homeBranch}"`,
      `"${p.allergies.join(", ")}"`,
      p.comfortProfile.anxietyScore,
      p.lifetimeValue,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DentFlow-Patients-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredPatients.length} patient records to CSV.`);
  };

  // Allergy toggle
  const toggleAllergy = (allergy: string) => {
    setForm((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  // Condition toggle
  const toggleCondition = (condition: string) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  // Trigger toggle
  const toggleTrigger = (trigger: string) => {
    setForm((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter((t) => t !== trigger)
        : [...prev.triggers, trigger],
    }));
  };

  // Save new patient
  const handleSavePatient = (andBookAppointment = false) => {
    setConsentError(null);
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter first and last name.");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Check duplicate phone
    const isDuplicate = state.patients.some((p) => p.phone.replace(/\D/g, "").endsWith(cleanPhone.slice(-10)));
    if (isDuplicate) {
      toast.error("A patient with this phone number already exists.");
      return;
    }

    // Explicit consent enforcement (DPDP Act 2023 + Clinical Exam + explicit WhatsApp choice)
    if (!form.dpdpConsent || !form.treatmentConsent || (!form.whatsappConsent && !form.whatsappDeclined)) {
      const msg = !form.dpdpConsent
        ? "Explicit DPDP data privacy consent must be ticked before registering a patient."
        : !form.treatmentConsent
        ? "Explicit general examination & diagnosis consent must be ticked before registering."
        : "Please explicitly tick WhatsApp consent (opt-in) or mark WhatsApp updates as declined.";
      setRegStep(4);
      setConsentError(msg);
      toast.error(msg);
      return;
    }

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
    const autoBuffer = form.anxietyScore >= 5 ? 15 : 0;
    const newId = `pat-${Date.now()}`;
    const newCode = `DF-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowIso = new Date().toISOString();
    const nowDisplay = new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    const recorderProfile = ROLE_USER_PROFILES[state.activeRole];
    const recordedBy = recorderProfile?.name || "Clinic Staff";

    const consentRecords: PatientConsentRecord[] = [
      {
        id: `c-exam-${Date.now()}`,
        type: "clinical_exam",
        title: CONSENT_TEXT_VERSIONS.clinicalExam.title,
        status: "Signed",
        dateOrNote: `Signed ${nowDisplay} · ${CONSENT_TEXT_VERSIONS.clinicalExam.version}`,
        recordedAt: nowIso,
        consentTextVersion: CONSENT_TEXT_VERSIONS.clinicalExam.version,
        consentTextSnapshot: CONSENT_TEXT_VERSIONS.clinicalExam.text,
        recordedBy,
        recordedByRole: state.activeRole,
        explicitlyAccepted: true,
      },
      {
        id: `c-dpdp-${Date.now()}`,
        type: "dpdp",
        title: CONSENT_TEXT_VERSIONS.dpdp.title,
        status: "Signed",
        dateOrNote: `Signed ${nowDisplay} · ${CONSENT_TEXT_VERSIONS.dpdp.version}`,
        recordedAt: nowIso,
        consentTextVersion: CONSENT_TEXT_VERSIONS.dpdp.version,
        consentTextSnapshot: CONSENT_TEXT_VERSIONS.dpdp.text,
        recordedBy,
        recordedByRole: state.activeRole,
        explicitlyAccepted: true,
      },
      {
        id: `c-wa-${Date.now()}`,
        type: "whatsapp",
        title: CONSENT_TEXT_VERSIONS.whatsapp.title,
        status: form.whatsappConsent ? "Signed" : "Declined",
        dateOrNote: form.whatsappConsent
          ? `Opted in ${nowDisplay} · ${CONSENT_TEXT_VERSIONS.whatsapp.version}`
          : `Declined ${nowDisplay} · ${CONSENT_TEXT_VERSIONS.whatsapp.version}`,
        recordedAt: nowIso,
        consentTextVersion: CONSENT_TEXT_VERSIONS.whatsapp.version,
        consentTextSnapshot: CONSENT_TEXT_VERSIONS.whatsapp.text,
        recordedBy,
        recordedByRole: state.activeRole,
        explicitlyAccepted: form.whatsappConsent,
      },
    ];

    const newPatient: DentflowPatient = {
      id: newId,
      code: newCode,
      name: fullName,
      age: parseInt(form.age, 10) || 30,
      dob: form.dob,
      gender: form.gender,
      phone: `+91 ${cleanPhone.slice(-10)}`,
      homeBranch: state.activeBranch.replace(" branch", "") || "Station Road",
      patientSince: "Today",
      abhaLinked: false,
      abhaSharingEnabled: false,
      flags: form.anxietyScore >= 7 ? ["Anxious"] : [],
      allergies: form.allergies,
      allergyNote: form.allergies.join(", "),
      conditions: form.conditions.join(", ") || "None",
      medication: form.medications || "None",
      bloodThinners: form.bloodThinners,
      pregnancy: form.pregnancy,
      habits: "Non-smoker",
      lastHba1c: "—",
      medicalUpdatedAt: "Registered today",
      comfortProfile: {
        anxietyScore: form.anxietyScore,
        triggers: form.triggers,
        whatHelps: ["Explain each step before starting", "Raise hand = stop signal"],
        autoBufferMin: autoBuffer,
      },
      familyMembers: [{ id: newId, initials: `${form.firstName[0]}${form.lastName[0]}`, name: fullName, relation: "Me", age: parseInt(form.age, 10) || 30 }],
      consents: consentRecords,
      recentActivity: [{ date: "Today", text: `Registered by ${recordedBy} (consents: ${CONSENT_TEXT_VERSIONS.dpdp.version}, ${CONSENT_TEXT_VERSIONS.whatsapp.version})` }],
      distanceKm: 2.1,
      language: form.preferredLanguage,
      whatsappConsent: form.whatsappConsent,
      visitsCount: 1,
      lifetimeValue: 0,
      referredCount: 0,
    };

    const consentAuditEntry = {
      id: `dl-consent-${Date.now()}`,
      timestamp: nowDisplay,
      isoTimestamp: nowIso,
      actor: recordedBy,
      role: state.activeRole,
      patientName: fullName,
      screenName: "Patients",
      action: "CONSENT_RECORDED",
      entityType: "consent" as const,
      entityId: newId,
      details: `DPDP (${CONSENT_TEXT_VERSIONS.dpdp.version}): Signed; Exam (${CONSENT_TEXT_VERSIONS.clinicalExam.version}): Signed; WhatsApp (${CONSENT_TEXT_VERSIONS.whatsapp.version}): ${form.whatsappConsent ? "Opted in" : "Declined"}`,
    };

    updateState((prev) => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
      dpdpAccessLogs: [consentAuditEntry, ...prev.dpdpAccessLogs].slice(0, 200),
    }));

    toast.success(`Patient ${fullName} (${newCode}) registered with audited consent!`);
    setForm(INITIAL_REGISTRATION_FORM);
    setRegStep(1);
    setConsentError(null);
    setNewPatientOpen(false);

    if (andBookAppointment) {
      router.push(`/app/calendar?bookPatientId=${newId}`);
    } else {
      handleOpenProfile(newPatient);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header Pattern */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--df-border)]">
        <div>
          <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)] tracking-tight">
            Patients
          </h1>
          <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
            Manage patient records and history
          </p>
        </div>

        {/* Right side buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="df-btn-secondary px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[var(--df-text-muted)]" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="df-btn-secondary px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-[var(--df-text-muted)]" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={() => setNewPatientOpen(true)}
            className="df-btn-primary px-4 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Patient</span>
          </button>
        </div>
      </div>

      {/* Chrome-style Tab Bar for Patient Section */}
      <DentflowChromeTabs
        activeId="overview"
        tabs={[
          { id: "overview", label: "Overview", href: "/app/patients", icon: Users },
          { id: "chart", label: "Chart & Plans", href: "/app/dental-chart", icon: Activity },
        ]}
      />

      {/* Filter Card */}
      <div className="df-card p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="h-4 w-4 text-[var(--df-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or patient ID..."
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--df-text)] placeholder:text-[var(--df-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--df-teal)]/20"
            />
          </div>

          {/* Status Select */}
          <div className="lg:col-span-2">
            <select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 text-xs font-medium text-[var(--df-text)] focus:outline-none cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Recall due">Recall due</option>
              <option value="High risk">High risk / Anxious</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          {/* Doctors Select */}
          <div className="lg:col-span-2">
            <select
              aria-label="Filter doctor"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 text-xs font-medium text-[var(--df-text)] focus:outline-none cursor-pointer"
            >
              <option value="All Doctors">All Doctors</option>
              <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni</option>
              <option value="Dr. Arjun Mehta">Dr. Arjun Mehta</option>
              <option value="Dr. Farhan Ali">Dr. Farhan Ali</option>
              <option value="Dr. Karan Shah">Dr. Karan Shah</option>
            </select>
          </div>

          {/* Gender Select */}
          <div className="lg:col-span-2">
            <select
              aria-label="Filter gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 text-xs font-medium text-[var(--df-text)] focus:outline-none cursor-pointer"
            >
              <option value="All Genders">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Pending Dues Checkbox */}
          <div className="lg:col-span-1 flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--df-text-secondary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pendingDuesOnly}
                onChange={(e) => setPendingDuesOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-[var(--df-teal)] border-[var(--df-border)] focus:ring-[var(--df-teal)] cursor-pointer"
              />
              <span className="whitespace-nowrap">Dues</span>
            </label>
          </div>
        </div>

        {/* Count Pill */}
        <div className="flex items-center justify-between text-[11px] text-[var(--df-text-muted)] pt-1">
          <span>Showing {filteredPatients.length} of {state.patients.length} patients</span>
          {(searchTerm || statusFilter !== "All Status" || genderFilter !== "All Genders" || pendingDuesOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All Status");
                setGenderFilter("All Genders");
                setPendingDuesOnly(false);
              }}
              className="text-[var(--df-teal)] hover:underline font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Patients Table Card */}
      <div className="df-card overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-[var(--df-surface-muted)] text-[var(--df-text-muted)] flex items-center justify-center mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <p className="df-serif text-lg font-semibold text-[var(--df-text)]">
              No patients found
            </p>
            <p className="text-xs text-[var(--df-text-muted)] max-w-sm mx-auto">
              Try adjusting your search query or filters, or register a new patient for your clinic.
            </p>
            <button
              type="button"
              onClick={() => setNewPatientOpen(true)}
              className="df-btn-primary px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Patient</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--df-border)] bg-[var(--df-surface-muted)] text-[11px] font-bold text-[var(--df-text-muted)] uppercase tracking-wider">
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Last Visit</th>
                  <th className="py-3 px-4">Next Appointment</th>
                  <th className="py-3 px-4">Dues</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {filteredPatients.map((patient) => {
                  const initials = patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const duesAmount = patient.id === "pat-priya" ? "₹9,500" : patient.id === "pat-kavya" ? "₹4,200" : "₹0";
                  const hasDues = duesAmount !== "₹0";

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => handleOpenProfile(patient)}
                      className="hover:bg-[var(--df-surface-hover)] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-[var(--df-text-secondary)]">
                        {patient.code}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-[var(--df-teal)] font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-[var(--df-text)] group-hover:text-[var(--df-teal)] transition-colors">
                              {patient.name}
                            </span>
                            {patient.flags.includes("Anxious") && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800">
                                Anxious +15m
                              </span>
                            )}
                            {patient.allergies.length > 0 && (
                              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-red-100 text-red-800">
                                Allergy
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-[var(--df-text)]">{patient.phone}</p>
                        <p className="text-[10.5px] text-[var(--df-text-muted)]">
                          {patient.id.replace("pat-", "")}@example.com
                        </p>
                      </td>

                      <td className="py-3 px-4 text-[var(--df-text-secondary)]">
                        {patient.age} / {patient.gender === "Female" ? "F" : "M"}
                      </td>

                      <td className="py-3 px-4 text-[var(--df-text-secondary)]">
                        {patient.medicalUpdatedAt}
                      </td>

                      <td className="py-3 px-4">
                        {patient.openPlanSummary ? (
                          <span className="font-semibold text-[var(--df-teal)]">
                            {patient.openPlanSummary.nextSitting}
                          </span>
                        ) : (
                          <span className="text-[var(--df-text-muted)]">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            hasDues ? "text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200" : "text-[var(--df-text-muted)]"
                          }`}
                        >
                          {duesAmount}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <DentflowStatusPill
                          label={patient.homeBranch}
                          tone={patient.flags.includes("VIP") ? "purple" : "teal"}
                        />
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenProfile(patient)}
                            title="View patient profile"
                            className="p-1.5 rounded-lg hover:bg-[var(--df-surface-muted)] text-[var(--df-text-muted)] hover:text-[var(--df-teal)] cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/app/calendar?bookPatientId=${patient.id}`}
                            title="Book appointment"
                            className="p-1.5 rounded-lg hover:bg-[var(--df-surface-muted)] text-[var(--df-text-muted)] hover:text-[var(--df-teal)]"
                          >
                            <Calendar className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* "+ New Patient" Right-Side Progressive Registration Drawer */}
      <DentflowDrawer
        open={newPatientOpen}
        onClose={() => {
          setNewPatientOpen(false);
          setRegStep(1);
        }}
        title="New Patient Registration"
        subtitle="Quick 1-step intake with optional medical, comfort & audited consent steps"
      >
        <div className="space-y-5 text-[13px] pb-10">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { step: 1, label: "1. Basics", req: true },
                  { step: 2, label: "2. Medical", req: false },
                  { step: 3, label: "3. Comfort", req: false },
                  { step: 4, label: "4. Consent", req: true },
                ] as const
              ).map((s) => {
                const isActive = regStep === s.step;
                const isPast = regStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setRegStep(s.step)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border text-center cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[var(--df-teal)] text-white border-[var(--df-teal)]"
                        : isPast
                        ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border-[var(--df-teal-border)]"
                        : "bg-[var(--df-surface-muted)] text-[var(--df-text-secondary)] border-[var(--df-border)] hover:border-[var(--df-teal)]"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--df-surface-muted)] overflow-hidden">
              <div
                className="h-full bg-[var(--df-teal)] transition-all duration-200"
                style={{ width: `${(regStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Short Basics (Name, Phone + Duplicate Check, Age/DOB) */}
          {regStep === 1 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">First name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Last name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patel"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--df-text)]">Phone (+91) *</label>
                <input
                  type="tel"
                  required
                  placeholder="98220 12345"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full bg-[var(--df-surface)] border rounded-xl px-3 py-2 ${
                    duplicatePhonePatient ? "border-red-500 ring-1 ring-red-400" : "border-[var(--df-border)]"
                  }`}
                />
                {duplicatePhonePatient && (
                  <div
                    role="alert"
                    className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-2 text-xs text-red-900"
                  >
                    <div>
                      <p className="font-bold">Duplicate phone detected</p>
                      <p className="text-[11px]">
                        Matches <strong>{duplicatePhonePatient.name}</strong> ({duplicatePhonePatient.code})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPatientOpen(false);
                        handleOpenProfile(duplicatePhonePatient);
                      }}
                      className="df-btn-secondary px-2.5 py-1 text-[11px] shrink-0 cursor-pointer"
                    >
                      Open record
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Date of birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => {
                      const dobYear = new Date(e.target.value).getFullYear();
                      const ageNow = new Date().getFullYear() - dobYear;
                      setForm({ ...form, dob: e.target.value, age: String(ageNow > 0 ? ageNow : 30) });
                    }}
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Age</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--df-text)]">Gender</label>
                <div className="flex gap-2">
                  {(["Female", "Male", "Other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                        form.gender === g
                          ? "bg-[var(--df-teal)] text-white border-[var(--df-teal)]"
                          : "bg-[var(--df-surface)] text-[var(--df-text-secondary)] border-[var(--df-border)]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11.5px] text-[var(--df-text-muted)] pt-1">
                Optional steps (Medical history &amp; Comfort profile) can be filled now or updated later from the patient profile.
              </p>
            </div>
          )}

          {/* Step 2: Optional Medical History & Allergies */}
          {regStep === 2 && (
            <div className="space-y-3.5">
              <p className="text-xs text-[var(--df-text-muted)]">
                Optional step — helps flag drug allergies and clinical alerts automatically.
              </p>
              <div>
                <label className="block font-semibold mb-1.5 text-[var(--df-text)]">Known allergies</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGY_OPTIONS.map((a) => {
                    const active = form.allergies.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAllergy(a)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                          active
                            ? "bg-red-100 border-red-300 text-red-800"
                            : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {active ? `✓ ${a}` : `+ ${a}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[var(--df-text)]">Systemic conditions</label>
                <div className="flex flex-wrap gap-1.5">
                  {CONDITION_OPTIONS.map((c) => {
                    const active = form.conditions.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCondition(c)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                          active
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {active ? `✓ ${c}` : `+ ${c}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--df-text)]">Current medicines</label>
                <input
                  type="text"
                  placeholder="e.g. Metformin 500mg, Telmisartan 40mg"
                  value={form.medications}
                  onChange={(e) => setForm({ ...form, medications: e.target.value })}
                  className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Email address</label>
                  <input
                    type="email"
                    placeholder="ramesh@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Preferred language</label>
                  <select
                    aria-label="Preferred language"
                    value={form.preferredLanguage}
                    onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as any })}
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
                  >
                    <option value="English">English</option>
                    <option value="हिन्दी">हिन्दी</option>
                    <option value="मराठी">मराठी</option>
                    <option value="ગુજરાતી">ગુજરાતી</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Optional Comfort Profile */}
          {regStep === 3 && (
            <div className="space-y-3.5">
              <p className="text-xs text-[var(--df-text-muted)]">
                Optional step — automatically schedules anxiety buffer slots and alerts the clinician.
              </p>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[var(--df-text)]">Dental anxiety score: {form.anxietyScore}/10</label>
                  <span className={`text-xs font-bold ${form.anxietyScore >= 7 ? "text-red-700" : form.anxietyScore >= 5 ? "text-amber-700" : "text-green-700"}`}>
                    {form.anxietyScore >= 7 ? "Severe (+15m buffer)" : form.anxietyScore >= 5 ? "Moderate (+15m buffer)" : "Calm"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={form.anxietyScore}
                  onChange={(e) => setForm({ ...form, anxietyScore: parseInt(e.target.value, 10) })}
                  className="w-full accent-[var(--df-teal)] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[var(--df-text-muted)]">
                  <span>0 · Relaxed</span>
                  <span>5 · Moderate</span>
                  <span>10 · Phobia</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[var(--df-text)]">Known triggers</label>
                <div className="flex flex-wrap gap-1.5">
                  {TRIGGER_OPTIONS.map((t) => {
                    const active = form.triggers.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTrigger(t)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                          active
                            ? "bg-[var(--df-teal-soft)] border-[var(--df-teal-border)] text-[var(--df-teal)]"
                            : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text-secondary)]"
                        }`}
                      >
                        {active ? `✓ ${t}` : `+ ${t}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--df-text)]">Acquisition source</label>
                <select
                  aria-label="Acquisition source"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
                >
                  <option value="Google search">Google search / Maps</option>
                  <option value="Referral">Patient / Family referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Social media">Instagram / Facebook</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Audited Explicit Consents (Always unticked by default) */}
          {regStep === 4 && (
            <div className="space-y-3.5">
              <div
                className={`p-3 rounded-xl border space-y-2.5 ${
                  consentError
                    ? "bg-red-50/70 border-red-300"
                    : "bg-[var(--df-surface-muted)] border-[var(--df-border)]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                  <span>Mandatory Explicit Consents *</span>
                  <span>By: {ROLE_USER_PROFILES[state.activeRole]?.name}</span>
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.treatmentConsent}
                    onChange={(e) => {
                      setForm({ ...form, treatmentConsent: e.target.checked });
                      setConsentError(null);
                    }}
                    className="h-4 w-4 mt-0.5 rounded text-[var(--df-teal)]"
                  />
                  <span className="text-xs text-[var(--df-text-secondary)] leading-snug">
                    <strong className="text-[var(--df-text)]">
                      {CONSENT_TEXT_VERSIONS.clinicalExam.title} *
                    </strong>{" "}
                    <span className="font-mono text-[10.5px] text-[var(--df-text-muted)]">
                      ({CONSENT_TEXT_VERSIONS.clinicalExam.version})
                    </span>
                    <br />
                    {CONSENT_TEXT_VERSIONS.clinicalExam.text}
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.dpdpConsent}
                    onChange={(e) => {
                      setForm({ ...form, dpdpConsent: e.target.checked });
                      setConsentError(null);
                    }}
                    className="h-4 w-4 mt-0.5 rounded text-[var(--df-teal)]"
                  />
                  <span className="text-xs text-[var(--df-text-secondary)] leading-snug">
                    <strong className="text-[var(--df-text)]">
                      {CONSENT_TEXT_VERSIONS.dpdp.title} *
                    </strong>{" "}
                    <span className="font-mono text-[10.5px] text-[var(--df-text-muted)]">
                      ({CONSENT_TEXT_VERSIONS.dpdp.version})
                    </span>
                    <br />
                    {CONSENT_TEXT_VERSIONS.dpdp.text}
                  </span>
                </label>

                <div className="pt-2 border-t border-[var(--df-border)] space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                    WhatsApp Updates * ({CONSENT_TEXT_VERSIONS.whatsapp.version})
                  </p>
                  <label className="flex items-start gap-2 text-xs text-[var(--df-text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.whatsappConsent}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm({
                          ...form,
                          whatsappConsent: checked,
                          whatsappDeclined: checked ? false : form.whatsappDeclined,
                        });
                        setConsentError(null);
                      }}
                      className="h-4 w-4 mt-0.5 rounded text-[var(--df-teal)]"
                    />
                    <span>{CONSENT_TEXT_VERSIONS.whatsapp.text}</span>
                  </label>
                  <label className="flex items-start gap-2 text-xs text-[var(--df-text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.whatsappDeclined}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm({
                          ...form,
                          whatsappDeclined: checked,
                          whatsappConsent: checked ? false : form.whatsappConsent,
                        });
                        setConsentError(null);
                      }}
                      className="h-4 w-4 mt-0.5 rounded text-[var(--df-teal)]"
                    />
                    <span>Patient declined WhatsApp updates (record opt-out)</span>
                  </label>
                </div>

                {consentError && (
                  <p role="alert" className="text-xs font-semibold text-red-700 pt-1">
                    {consentError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progressive Footer Actions: Save & Save+Book available from Step 1 */}
          <div className="pt-4 border-t border-[var(--df-border)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {regStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setRegStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
                  className="df-btn-secondary px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setNewPatientOpen(false)}
                  className="df-btn-secondary px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              )}
              {regStep < 4 && (
                <button
                  type="button"
                  onClick={() => setRegStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
                  className="df-btn-secondary px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  Next step →
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={Boolean(duplicatePhonePatient)}
                onClick={() => handleSavePatient(false)}
                className="df-btn-secondary px-3.5 py-2 text-xs font-semibold text-[var(--df-teal)] border-[var(--df-teal-border)] bg-[var(--df-teal-soft)] cursor-pointer disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                disabled={Boolean(duplicatePhonePatient)}
                onClick={() => handleSavePatient(true)}
                className="df-btn-primary px-3.5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Save &amp; book
              </button>
            </div>
          </div>
        </div>
      </DentflowDrawer>

      {/* Patient Profile Detail Drawer */}
      <DentflowDrawer
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        title={selectedPatient.name}
        subtitle={`${selectedPatient.code} · ${selectedPatient.age} ${selectedPatient.gender} · Patient since ${selectedPatient.patientSince}`}
      >
        <div className="space-y-5 text-xs pb-10">
          {/* Header Profile summary */}
          <div className="p-3.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--df-teal)] text-white font-bold text-sm flex items-center justify-center">
                {selectedPatient.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--df-text)]">{selectedPatient.name}</p>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  {selectedPatient.phone} · {selectedPatient.homeBranch} branch
                </p>
              </div>
            </div>
            <Link
              href={`/app/calendar?bookPatientId=${selectedPatient.id}`}
              className="df-btn-primary px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Book visit</span>
            </Link>
          </div>

          {/* Medical Alerts Banner */}
          {(selectedPatient.allergies.length > 0 || selectedPatient.flags.includes("Anxious")) && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Clinical & Safety Alerts</span>
              </div>
              <p className="text-[11.5px]">
                {selectedPatient.allergies.length > 0 && (
                  <span>Allergies: <strong>{selectedPatient.allergies.join(", ")}</strong>. </span>
                )}
                {selectedPatient.flags.includes("Anxious") && (
                  <span>Anxiety Score: <strong>{selectedPatient.comfortProfile.anxietyScore}/10</strong> (+15 min buffer auto-applied). </span>
                )}
                {selectedPatient.conditions !== "None" && (
                  <span>Condition: {selectedPatient.conditions}.</span>
                )}
              </p>
            </div>
          )}

          {/* Quick Navigation Tabs */}
          <div className="flex border-b border-[var(--df-border)] gap-2 overflow-x-auto pb-1 text-xs">
            {["Overview", "Dental chart", "Treatment plans", "Prescriptions", "Billing"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveProfileTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeProfileTab === tab
                    ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)]"
                    : "text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeProfileTab === "Overview" && (
            <div className="space-y-4">
              {/* Comfort Profile Box */}
              <div className="df-card p-3.5 space-y-2">
                <p className="font-bold text-xs text-[var(--df-text)]">Comfort Profile & Triggers</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[var(--df-text-muted)]">Anxiety Level: </span>
                    <span className="font-semibold text-[var(--df-teal)]">
                      {selectedPatient.comfortProfile.anxietyScore}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--df-text-muted)]">Auto Buffer: </span>
                    <span className="font-semibold text-[var(--df-teal)]">
                      +{selectedPatient.comfortProfile.autoBufferMin} min
                    </span>
                  </div>
                </div>
                {selectedPatient.comfortProfile.triggers.length > 0 && (
                  <p className="text-[11px] text-[var(--df-text-secondary)]">
                    <span className="text-[var(--df-text-muted)]">Triggers: </span>
                    {selectedPatient.comfortProfile.triggers.join(", ")}
                  </p>
                )}
              </div>

              {/* Family Links */}
              <div className="df-card p-3.5 space-y-2">
                <p className="font-bold text-xs text-[var(--df-text)]">Family Group Members</p>
                <div className="space-y-1.5">
                  {selectedPatient.familyMembers.map((fam) => (
                    <div key={fam.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--df-surface-muted)] text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-[var(--df-teal)] text-white text-[10px] font-bold flex items-center justify-center">
                          {fam.initials}
                        </span>
                        <span className="font-semibold text-[var(--df-text)]">{fam.name} ({fam.relation})</span>
                      </div>
                      <span className="text-[var(--df-text-muted)]">{fam.age} yrs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recorded Consents (DPDP Audit) */}
              <div className="df-card p-3.5 space-y-2">
                <p className="font-bold text-xs text-[var(--df-text)]">Recorded Consents (DPDP Audit)</p>
                {selectedPatient.consents.length === 0 ? (
                  <p className="text-[11px] text-[var(--df-text-muted)]">No consents recorded yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedPatient.consents.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 rounded-lg bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-0.5 text-[11px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[var(--df-text)]">{c.title}</span>
                          <DentflowStatusPill
                            label={c.status}
                            tone={c.status === "Signed" ? "green" : c.status === "Declined" ? "red" : "amber"}
                          />
                        </div>
                        <p className="text-[10.5px] text-[var(--df-text-muted)]">
                          {c.consentTextVersion && (
                            <span className="font-mono mr-1.5">{c.consentTextVersion}</span>
                          )}
                          {c.recordedBy && <span>· Recorded by {c.recordedBy}</span>}
                          {c.recordedAt
                            ? ` · ${new Date(c.recordedAt).toLocaleString("en-IN")}`
                            : ` · ${c.dateOrNote}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity & DPDP */}
              <div className="df-card p-3.5 space-y-2">
                <p className="font-bold text-xs text-[var(--df-text)]">Recent Activity & Audit Trail</p>
                <div className="space-y-1.5">
                  {selectedPatient.recentActivity.map((act, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="text-[var(--df-text)]">{act.text}</span>
                      <span className="text-[var(--df-text-muted)] shrink-0">{act.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeProfileTab !== "Overview" && (
            <div className="p-6 text-center df-card space-y-2">
              <p className="font-bold text-xs text-[var(--df-text)]">View {activeProfileTab} in Clinical Section</p>
              <p className="text-xs text-[var(--df-text-muted)]">
                Access full interactive clinical records, charts, and financial statements.
              </p>
              <Link
                href={
                  activeProfileTab === "Dental chart"
                    ? "/app/dental-chart"
                    : activeProfileTab === "Treatment plans"
                    ? "/app/treatment-plans"
                    : activeProfileTab === "Prescriptions"
                    ? "/app/prescriptions"
                    : "/app/billing"
                }
                className="df-btn-primary px-4 py-2 text-xs font-semibold inline-block mt-2"
              >
                Open {activeProfileTab} →
              </Link>
            </div>
          )}
        </div>
      </DentflowDrawer>

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="df-card w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-2.5">
              <h3 className="font-bold text-sm text-[var(--df-text)]">Import Patient Records</h3>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-lg text-[var(--df-text-muted)] hover:bg-[var(--df-surface-muted)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--df-text-secondary)]">
              Upload a CSV or Excel file containing patient demographics, phone numbers, and medical alerts.
            </p>

            <div className="border-2 border-dashed border-[var(--df-border)] rounded-2xl p-6 text-center space-y-2 bg-[var(--df-surface-muted)]">
              <Upload className="h-8 w-8 text-[var(--df-teal)] mx-auto" />
              <p className="text-xs font-semibold text-[var(--df-text)]">Drag & drop CSV file or browse</p>
              <p className="text-[11px] text-[var(--df-text-muted)]">Supports CSV, XLSX up to 10MB</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="df-btn-secondary px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  toast.success("Import simulation complete: 14 patient records verified.");
                }}
                className="df-btn-primary px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                Simulate Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--df-text-muted)]">Loading patients...</div>}>
      <PatientsPageInner />
    </Suspense>
  );
}
