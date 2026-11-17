import { INITIAL_DENTFLOW_STATE } from "@/lib/dentflow-data";
import { createSeedDentalChart } from "@/lib/dental-chart-logic";
import { DEFAULT_CLINIC_PRESCRIPTION_CONFIG } from "@/lib/prescription-validation";
import { INITIAL_ROLE_PERMISSIONS } from "@/lib/dentflow-theme";
import {
  DentflowAppState,
  DentflowAuditLogEntry,
  DentflowPatient,
  PatientConsentRecord,
  PatientDentalChart,
} from "@/types/dentflow";

export const CURRENT_SCHEMA_VERSION = 4;

export const CONSENT_TEXT_VERSIONS = {
  dpdp: {
    version: "DPDP-2023-v1.0",
    title: "DPDP Act 2023 Health Data Storage & Processing Consent",
    text: "I explicitly consent under the Digital Personal Data Protection (DPDP) Act 2023 to the collection, storage, and clinical processing of my personal and dental health records by this clinic.",
  },
  whatsapp: {
    version: "WA-OPTIN-v1.0",
    title: "WhatsApp Appointment & Clinical Updates Opt-In",
    text: "I explicitly opt in to receive appointment reminders, treatment explainers, and clinical follow-up messages on WhatsApp.",
  },
  clinicalExam: {
    version: "CLINICAL-EXAM-v1.0",
    title: "General Dental Examination & Diagnosis Consent",
    text: "I consent to a general dental examination, diagnostic imaging where clinically indicated, and discussion of treatment options.",
  },
} as const;

function migrateConsentRecord(consent: PatientConsentRecord): PatientConsentRecord {
  return {
    ...consent,
    consentTextVersion: consent.consentTextVersion || "LEGACY-v0",
    recordedBy: consent.recordedBy || "Migrated record",
    explicitlyAccepted:
      typeof consent.explicitlyAccepted === "boolean"
        ? consent.explicitlyAccepted
        : consent.status === "Signed",
  };
}

function migratePatient(patient: DentflowPatient): DentflowPatient {
  return {
    ...patient,
    consents: Array.isArray(patient.consents)
      ? patient.consents.map(migrateConsentRecord)
      : [],
  };
}

function migrateAuditEntry(entry: DentflowAuditLogEntry): DentflowAuditLogEntry {
  return {
    ...entry,
    entityType: entry.entityType || "patient",
  };
}

/**
 * Losslessly migrates persisted `.data/dentflow-state.json` payloads from older
 * schema versions to `CURRENT_SCHEMA_VERSION` while keeping all existing records working.
 */
export function migrateDentflowState(raw: unknown): DentflowAppState {
  if (!raw || typeof raw !== "object") {
    return {
      ...INITIAL_DENTFLOW_STATE,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
  }

  const parsed = raw as Partial<DentflowAppState>;
  const patients = Array.isArray(parsed.patients)
    ? parsed.patients.map(migratePatient)
    : INITIAL_DENTFLOW_STATE.patients.map(migratePatient);

  // Preserve existing dental charts and seed missing patients without data loss
  const existingCharts = (parsed.dentalCharts || {}) as Record<string, PatientDentalChart>;
  const dentalCharts: Record<string, PatientDentalChart> = { ...existingCharts };
  for (const p of patients) {
    if (!dentalCharts[p.id]) {
      dentalCharts[p.id] = createSeedDentalChart(p.id, p.age);
    }
  }

  const merged: DentflowAppState = {
    ...INITIAL_DENTFLOW_STATE,
    ...parsed,
    clinicSetup: {
      ...INITIAL_DENTFLOW_STATE.clinicSetup,
      ...(parsed.clinicSetup || {}),
      numberingSystem: parsed.clinicSetup?.numberingSystem || "FDI",
      timeFormat: parsed.clinicSetup?.timeFormat || "12h",
    },
    rolePermissions: parsed.rolePermissions?.length
      ? parsed.rolePermissions
      : INITIAL_ROLE_PERMISSIONS,
    patients,
    dentalCharts,
    dpdpAccessLogs: Array.isArray(parsed.dpdpAccessLogs)
      ? parsed.dpdpAccessLogs.map(migrateAuditEntry)
      : INITIAL_DENTFLOW_STATE.dpdpAccessLogs.map(migrateAuditEntry),
    prescriptionConfig: parsed.prescriptionConfig
      ? {
          ...DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
          ...parsed.prescriptionConfig,
          allergyRules: Array.isArray(parsed.prescriptionConfig.allergyRules)
            ? parsed.prescriptionConfig.allergyRules
            : DEFAULT_CLINIC_PRESCRIPTION_CONFIG.allergyRules,
          templates: Array.isArray(parsed.prescriptionConfig.templates)
            ? parsed.prescriptionConfig.templates
            : DEFAULT_CLINIC_PRESCRIPTION_CONFIG.templates,
        }
      : DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };

  return merged;
}
