import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
  validateMedicinesAgainstAllergies,
  validatePrescription,
  validateTemplateForPatient,
  type PatientValidationSubject,
} from "../prescription-validation.ts";

const ADULT_PENICILLIN_ALLERGIC: PatientValidationSubject = {
  id: "pat-priya",
  name: "Priya Deshmukh",
  age: 34,
  weightKg: 62,
  allergies: ["Penicillin"],
};

const CHILD_NO_WEIGHT: PatientValidationSubject = {
  id: "pat-aarav",
  name: "Aarav Joshi",
  age: 7,
  allergies: [],
};

const CHILD_WITH_WEIGHT: PatientValidationSubject = {
  id: "pat-aarav",
  name: "Aarav Joshi",
  age: 7,
  weightKg: 23,
  allergies: [],
};

describe("Prescription validation rules", () => {
  it("blocks paediatric template applied to a 34-year-old adult when strictAgeBandBlocking is true", () => {
    const kidsTpl = DEFAULT_CLINIC_PRESCRIPTION_CONFIG.templates.find(
      (t) => t.id === "tpl-kids-mild-pain",
    )!;
    const res = validateTemplateForPatient(
      kidsTpl,
      ADULT_PENICILLIN_ALLERGIC,
      DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
    );
    assert.equal(res.isValid, false);
    assert.equal(res.hasBlocks, true);
    assert.ok(
      res.issues.some((i) => i.code === "AGE_BAND_MISMATCH" && i.severity === "block"),
    );
  });

  it("warns (without blocking) when strictAgeBandBlocking is false for paediatric template on adult", () => {
    const kidsTpl = DEFAULT_CLINIC_PRESCRIPTION_CONFIG.templates.find(
      (t) => t.id === "tpl-kids-mild-pain",
    )!;
    const res = validateTemplateForPatient(kidsTpl, ADULT_PENICILLIN_ALLERGIC, {
      ...DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
      strictAgeBandBlocking: false,
    });
    assert.equal(res.hasBlocks, false);
    assert.equal(res.hasWarnings, true);
    assert.ok(
      res.issues.some((i) => i.code === "AGE_BAND_MISMATCH" && i.severity === "warn"),
    );
  });

  it("blocks adult template applied to a 7-year-old paediatric patient", () => {
    const rctTpl = DEFAULT_CLINIC_PRESCRIPTION_CONFIG.templates.find(
      (t) => t.id === "tpl-post-rct",
    )!;
    const res = validateTemplateForPatient(
      rctTpl,
      CHILD_WITH_WEIGHT,
      DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
    );
    assert.equal(res.isValid, false);
    assert.ok(
      res.issues.some((i) => i.code === "AGE_BAND_MISMATCH" && i.severity === "block"),
    );
  });

  it("blocks when template requires weight and patient weight is missing or invalid", () => {
    const kidsTpl = DEFAULT_CLINIC_PRESCRIPTION_CONFIG.templates.find(
      (t) => t.id === "tpl-kids-mild-pain",
    )!;
    const resMissing = validateTemplateForPatient(
      kidsTpl,
      CHILD_NO_WEIGHT,
      DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
    );
    assert.equal(resMissing.isValid, false);
    assert.ok(
      resMissing.issues.some((i) => i.code === "WEIGHT_REQUIRED" && i.severity === "block"),
    );

    const resPresent = validateTemplateForPatient(
      kidsTpl,
      CHILD_WITH_WEIGHT,
      DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
    );
    assert.equal(resPresent.hasBlocks, false);
    assert.equal(
      resPresent.issues.some((i) => i.code === "WEIGHT_REQUIRED"),
      false,
    );
  });

  it("flags allergy conflict when Amoxicillin/Augmentin/Penicillin is prescribed to a Penicillin-allergic patient", () => {
    const issues = validateMedicinesAgainstAllergies(
      [
        { id: "m1", medicine: "Amoxicillin", dose: "Clinician verified" },
        { id: "m2", medicine: "Augmentin Duo", dose: "Clinician verified" },
      ],
      ADULT_PENICILLIN_ALLERGIC.allergies,
      DEFAULT_CLINIC_PRESCRIPTION_CONFIG.allergyRules,
    );
    assert.equal(issues.length, 2);
    assert.ok(issues.every((i) => i.code === "ALLERGY_CONFLICT" && i.severity === "block"));
    assert.equal(issues[0].matchedAllergy, "Penicillin");
  });

  it("passes cleanly for non-conflicting drugs with clinician-entered dose on matching age band", () => {
    const approvedConfig = {
      ...DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
      templates: DEFAULT_CLINIC_PRESCRIPTION_CONFIG.templates.map((t) => ({
        ...t,
        clinicianApproved: true,
      })),
    };
    const rctTpl = approvedConfig.templates.find((t) => t.id === "tpl-post-rct")!;
    const res = validatePrescription({
      template: rctTpl,
      patient: ADULT_PENICILLIN_ALLERGIC,
      medicines: [{ id: "m1", medicine: "Azithromycin", dose: "Per clinic formulary" }],
      config: approvedConfig,
      requireClinicianDose: true,
    });
    assert.equal(res.isValid, true);
    assert.equal(res.hasBlocks, false);
    assert.equal(res.issues.length, 0);
  });

  it("requires clinician-verified dose when dose is blank and does not hardcode doses in starter templates", () => {
    for (const tpl of DEFAULT_CLINIC_PRESCRIPTION_CONFIG.templates) {
      for (const med of tpl.medicines) {
        assert.equal(
          med.dose,
          "",
          `Starter template "${tpl.name}" medicine "${med.medicine}" must not hardcode a clinical dose`,
        );
      }
    }

    const rctTpl = DEFAULT_CLINIC_PRESCRIPTION_CONFIG.templates.find(
      (t) => t.id === "tpl-post-rct",
    )!;
    const res = validatePrescription({
      template: rctTpl,
      patient: ADULT_PENICILLIN_ALLERGIC,
      medicines: [{ id: "m1", medicine: "Azithromycin", dose: "" }],
      config: DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
      requireClinicianDose: true,
    });
    assert.equal(res.isValid, false);
    assert.ok(res.issues.some((i) => i.code === "DOSE_REQUIRED" && i.severity === "block"));
  });

  it("respects custom clinic-configured allergy rules (e.g. NSAIDs)", () => {
    const nsaidPatient: PatientValidationSubject = {
      id: "pat-2",
      name: "Test Patient",
      age: 40,
      allergies: ["NSAIDs / Ibuprofen"],
    };
    const issues = validateMedicinesAgainstAllergies(
      [{ id: "m1", medicine: "Ibuprofen + Paracetamol", dose: "Clinic protocol" }],
      nsaidPatient.allergies,
      DEFAULT_CLINIC_PRESCRIPTION_CONFIG.allergyRules,
    );
    assert.equal(issues.length, 1);
    assert.equal(issues[0].code, "ALLERGY_CONFLICT");
    assert.equal(issues[0].severity, "block");
  });
});
