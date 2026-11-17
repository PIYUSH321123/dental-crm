import type {
  AllergyConflictRule,
  ClinicPrescriptionConfig,
  RxTemplateDefinition,
} from "../types/dentflow";

export interface PatientValidationSubject {
  id: string;
  name: string;
  age: number;
  weightKg?: number;
  allergies: string[];
}

export interface MedicineInput {
  id: string;
  medicine: string;
  dose: string;
  frequency?: string;
  days?: string;
  instructions?: string;
}

export type ValidationSeverity = "block" | "warn";

export type ValidationIssueCode =
  | "AGE_BAND_MISMATCH"
  | "WEIGHT_REQUIRED"
  | "ALLERGY_CONFLICT"
  | "TEMPLATE_UNAPPROVED"
  | "DOSE_REQUIRED";

export interface PrescriptionValidationIssue {
  code: ValidationIssueCode;
  severity: ValidationSeverity;
  message: string;
  medicineId?: string;
  drugName?: string;
  matchedAllergy?: string;
  suggestedAlternativeNote?: string;
}

export interface PrescriptionValidationResult {
  isValid: boolean;
  hasBlocks: boolean;
  hasWarnings: boolean;
  issues: PrescriptionValidationIssue[];
}

/**
 * Starter configurable rules & templates.
 * IMPORTANT: No clinical dose values are hardcoded here; doses must be entered
 * and approved by a licensed clinician in the clinic formulary/rules configuration.
 */
export const DEFAULT_CLINIC_PRESCRIPTION_CONFIG: ClinicPrescriptionConfig = {
  paediatricMaxAgeYears: 14,
  adultMinAgeYears: 15,
  strictAgeBandBlocking: true,
  approvedBy: undefined,
  approvedAt: undefined,
  allergyRules: [
    {
      id: "rule-penicillin",
      allergyKeyword: "penicillin",
      conflictingDrugs: [
        "penicillin",
        "amoxicillin",
        "amoxiclav",
        "augmentin",
        "ampicillin",
        "cloxacillin",
        "piperacillin",
      ],
      severity: "block",
      suggestedAlternativeNote:
        "Select a clinician-approved non-beta-lactam antibiotic from your clinic formulary.",
      clinicianApproved: false,
    },
    {
      id: "rule-nsaids",
      allergyKeyword: "nsaid",
      conflictingDrugs: [
        "ibuprofen",
        "aceclofenac",
        "diclofenac",
        "ketorolac",
        "naproxen",
        "piroxicam",
      ],
      severity: "block",
      suggestedAlternativeNote:
        "Avoid NSAIDs. Choose a clinician-approved non-NSAID analgesic per clinic protocol.",
      clinicianApproved: false,
    },
    {
      id: "rule-aspirin",
      allergyKeyword: "aspirin",
      conflictingDrugs: ["aspirin", "ecosprin", "acetylsalicylic"],
      severity: "block",
      suggestedAlternativeNote:
        "Avoid salicylates/aspirin. Verify alternative analgesic with the attending dentist.",
      clinicianApproved: false,
    },
    {
      id: "rule-sulfa",
      allergyKeyword: "sulfa",
      conflictingDrugs: ["sulfamethoxazole", "cotrimoxazole", "bactrim", "sulfadiazine"],
      severity: "warn",
      suggestedAlternativeNote:
        "Review sulfonamide cross-reactivity before confirming prescription.",
      clinicianApproved: false,
    },
  ],
  templates: [
    {
      id: "tpl-post-rct",
      name: "Post-RCT",
      ageBand: "adult",
      minAge: 15,
      requiresWeight: false,
      diagnosis: "Irreversible pulpitis — post-RCT care",
      medicines: [
        {
          id: "m-rct-1",
          medicine: "Azithromycin",
          dose: "",
          frequency: "1-0-0",
          days: "3 days",
          instructions: "After food (clinician to verify dose)",
        },
        {
          id: "m-rct-2",
          medicine: "Ibuprofen + Paracetamol",
          dose: "",
          frequency: "1-0-1",
          days: "3 days",
          instructions: "After food, only if pain (clinician to verify dose)",
        },
        {
          id: "m-rct-3",
          medicine: "Chlorhexidine mouthwash",
          dose: "",
          frequency: "0-1-1",
          days: "7 days",
          instructions: "Rinse 30 sec, no water after",
        },
      ],
      advice:
        "Avoid chewing on the treated side until the crown is fitted. Warm salt-water rinse twice a day. Call the clinic if swelling increases.",
      clinicianApproved: false,
    },
    {
      id: "tpl-post-extraction",
      name: "Post-extraction",
      ageBand: "adult",
      minAge: 15,
      requiresWeight: false,
      diagnosis: "Extraction socket — post-operative care",
      medicines: [
        {
          id: "m-ext-1",
          medicine: "Azithromycin",
          dose: "",
          frequency: "1-0-0",
          days: "3 days",
          instructions: "After food (clinician to verify dose)",
        },
        {
          id: "m-ext-2",
          medicine: "Aceclofenac + Paracetamol",
          dose: "",
          frequency: "1-0-1",
          days: "3 days",
          instructions: "After food (clinician to verify dose)",
        },
      ],
      advice:
        "Bite on gauze for 30 minutes. No spitting, straw, or hot food for 24 hours. Cold compress externally.",
      clinicianApproved: false,
    },
    {
      id: "tpl-post-implant",
      name: "Post-implant",
      ageBand: "adult",
      minAge: 18,
      requiresWeight: false,
      diagnosis: "Endosseous implant placement — stage 1",
      medicines: [
        {
          id: "m-imp-1",
          medicine: "Azithromycin",
          dose: "",
          frequency: "1-0-0",
          days: "5 days",
          instructions: "After food (clinician to verify dose)",
        },
        {
          id: "m-imp-2",
          medicine: "Chlorhexidine mouthwash",
          dose: "",
          frequency: "0-1-1",
          days: "10 days",
          instructions: "Gentle rinse starting next day",
        },
      ],
      advice: "Soft diet for 5 days. Do not disturb sutures with tongue or brush.",
      clinicianApproved: false,
    },
    {
      id: "tpl-scaling",
      name: "Scaling",
      ageBand: "all",
      requiresWeight: false,
      diagnosis: "Chronic generalized gingivitis — post-scaling",
      medicines: [
        {
          id: "m-sc-1",
          medicine: "Chlorhexidine mouthwash",
          dose: "",
          frequency: "0-1-1",
          days: "7 days",
          instructions: "Rinse 30 sec, no water after",
        },
        {
          id: "m-sc-2",
          medicine: "Desensitizing toothpaste",
          dose: "",
          frequency: "1-0-1",
          days: "14 days",
          instructions: "Leave foam for 2 min before rinse",
        },
      ],
      advice: "Mild cold sensitivity for 2–3 days is normal. Brush gently with soft bristles.",
      clinicianApproved: false,
    },
    {
      id: "tpl-kids-mild-pain",
      name: "Kids · mild pain",
      ageBand: "paediatric",
      maxAge: 14,
      requiresWeight: true,
      diagnosis: "Deciduous molar caries — paediatric symptomatic relief",
      medicines: [
        {
          id: "m-kid-1",
          medicine: "Paracetamol suspension",
          dose: "",
          frequency: "As directed",
          days: "2 days",
          instructions: "Weight-based dose verified by dentist after food",
        },
      ],
      advice: "Avoid sticky sweets and cold drinks until next visit.",
      clinicianApproved: false,
    },
  ],
};

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function validateTemplateForPatient(
  template: RxTemplateDefinition,
  patient: PatientValidationSubject,
  config: ClinicPrescriptionConfig,
): PrescriptionValidationResult {
  const issues: PrescriptionValidationIssue[] = [];
  const age = Number(patient.age);
  const ageSeverity: ValidationSeverity = config.strictAgeBandBlocking ? "block" : "warn";

  // 1. Paediatric template applied to adult
  if (template.ageBand === "paediatric") {
    const maxAge = template.maxAge ?? config.paediatricMaxAgeYears;
    if (age > maxAge) {
      issues.push({
        code: "AGE_BAND_MISMATCH",
        severity: ageSeverity,
        message: `Paediatric template "${template.name}" (max age ${maxAge}y) cannot be applied to adult patient ${patient.name} (${age}y).`,
      });
    }
  }

  // 2. Adult template applied to child
  if (template.ageBand === "adult") {
    const minAge = template.minAge ?? config.adultMinAgeYears;
    if (age < minAge) {
      issues.push({
        code: "AGE_BAND_MISMATCH",
        severity: ageSeverity,
        message: `Adult template "${template.name}" (min age ${minAge}y) cannot be applied to paediatric patient ${patient.name} (${age}y).`,
      });
    }
  }

  // 3. Explicit custom age bounds for "all" templates if configured
  if (template.ageBand === "all") {
    if (typeof template.minAge === "number" && age < template.minAge) {
      issues.push({
        code: "AGE_BAND_MISMATCH",
        severity: ageSeverity,
        message: `Template "${template.name}" requires patient age >= ${template.minAge}y (patient is ${age}y).`,
      });
    }
    if (typeof template.maxAge === "number" && age > template.maxAge) {
      issues.push({
        code: "AGE_BAND_MISMATCH",
        severity: ageSeverity,
        message: `Template "${template.name}" is limited to patient age <= ${template.maxAge}y (patient is ${age}y).`,
      });
    }
  }

  // 4. Weight requirement check (e.g. paediatric weight-based dosing)
  if (template.requiresWeight) {
    if (typeof patient.weightKg !== "number" || !Number.isFinite(patient.weightKg) || patient.weightKg <= 0) {
      issues.push({
        code: "WEIGHT_REQUIRED",
        severity: "block",
        message: `Patient weight (kg) is required before using "${template.name}". Record current weight to verify dosing.`,
      });
    }
  }

  // 5. Clinician approval advisory
  if (!template.clinicianApproved) {
    issues.push({
      code: "TEMPLATE_UNAPPROVED",
      severity: "warn",
      message: `Template "${template.name}" has not been marked clinician-approved in clinic rules. Verify all entries before signing.`,
    });
  }

  const hasBlocks = issues.some((i) => i.severity === "block");
  const hasWarnings = issues.some((i) => i.severity === "warn");

  return {
    isValid: !hasBlocks,
    hasBlocks,
    hasWarnings,
    issues,
  };
}

export function validateMedicinesAgainstAllergies(
  medicines: MedicineInput[],
  patientAllergies: string[],
  allergyRules: AllergyConflictRule[],
): PrescriptionValidationIssue[] {
  const normalizedAllergies = patientAllergies
    .map(normalizeToken)
    .filter(Boolean);

  if (normalizedAllergies.length === 0 || medicines.length === 0) {
    return [];
  }

  const issues: PrescriptionValidationIssue[] = [];

  for (const med of medicines) {
    const drugNorm = normalizeToken(med.medicine);
    if (!drugNorm) continue;

    for (const rule of allergyRules) {
      const keywordNorm = normalizeToken(rule.allergyKeyword);
      if (!keywordNorm) continue;

      const matchedAllergy = patientAllergies.find((a) =>
        normalizeToken(a).includes(keywordNorm) || keywordNorm.includes(normalizeToken(a)),
      );
      if (!matchedAllergy) continue;

      const conflicts = rule.conflictingDrugs.some((c) => {
        const cn = normalizeToken(c);
        return cn.length > 0 && drugNorm.includes(cn);
      });

      if (conflicts) {
        issues.push({
          code: "ALLERGY_CONFLICT",
          severity: rule.severity,
          medicineId: med.id,
          drugName: med.medicine,
          matchedAllergy,
          suggestedAlternativeNote: rule.suggestedAlternativeNote,
          message: `Allergy conflict: "${med.medicine}" conflicts with recorded allergy "${matchedAllergy}". ${rule.suggestedAlternativeNote}`,
        });
      }
    }
  }

  return issues;
}

export function validatePrescription(params: {
  template?: RxTemplateDefinition;
  patient: PatientValidationSubject;
  medicines: MedicineInput[];
  config: ClinicPrescriptionConfig;
  requireClinicianDose?: boolean;
}): PrescriptionValidationResult {
  const { template, patient, medicines, config, requireClinicianDose = true } = params;
  const issues: PrescriptionValidationIssue[] = [];

  if (template) {
    const tplResult = validateTemplateForPatient(template, patient, config);
    issues.push(...tplResult.issues);
  }

  const allergyIssues = validateMedicinesAgainstAllergies(
    medicines,
    patient.allergies || [],
    config.allergyRules || [],
  );
  issues.push(...allergyIssues);

  if (requireClinicianDose) {
    for (const med of medicines) {
      if (med.medicine.trim() && !med.dose.trim()) {
        issues.push({
          code: "DOSE_REQUIRED",
          severity: "block",
          medicineId: med.id,
          drugName: med.medicine,
          message: `Clinician-verified dose is required for "${med.medicine}" before signing.`,
        });
      }
    }
  }

  const hasBlocks = issues.some((i) => i.severity === "block");
  const hasWarnings = issues.some((i) => i.severity === "warn");

  return {
    isValid: !hasBlocks,
    hasBlocks,
    hasWarnings,
    issues,
  };
}
