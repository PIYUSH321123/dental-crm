import { INITIAL_DENTFLOW_STATE } from "@/lib/dentflow-data";
import { INITIAL_ROLE_PERMISSIONS } from "@/lib/dentflow-theme";
import {
  DentflowAppState,
  DentflowAuditLogEntry,
  DentflowPatient,
  PatientConsentRecord,
} from "@/types/dentflow";

export const CURRENT_SCHEMA_VERSION = 2;

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
  const merged: DentflowAppState = {
    ...INITIAL_DENTFLOW_STATE,
    ...parsed,
    rolePermissions: parsed.rolePermissions?.length
      ? parsed.rolePermissions
      : INITIAL_ROLE_PERMISSIONS,
    patients: Array.isArray(parsed.patients)
      ? parsed.patients.map(migratePatient)
      : INITIAL_DENTFLOW_STATE.patients.map(migratePatient),
    dpdpAccessLogs: Array.isArray(parsed.dpdpAccessLogs)
      ? parsed.dpdpAccessLogs.map(migrateAuditEntry)
      : INITIAL_DENTFLOW_STATE.dpdpAccessLogs.map(migrateAuditEntry),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };

  return merged;
}
