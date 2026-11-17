"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Printer,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import {
  DEFAULT_CLINIC_PRESCRIPTION_CONFIG,
  validatePrescription,
  validateTemplateForPatient,
} from "@/lib/prescription-validation";
import { useDentflow } from "@/lib/dentflow-store";
import { ROLE_USER_PROFILES } from "@/lib/dentflow-theme";
import { AllergyConflictRule, ClinicPrescriptionConfig } from "@/types/dentflow";

export default function PrescriptionsPage() {
  const { state, updateState, logAuditEvent } = useDentflow();
  const baseRx = state.prescriptions[0];
  const rxConfig: ClinicPrescriptionConfig =
    state.prescriptionConfig || DEFAULT_CLINIC_PRESCRIPTION_CONFIG;

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    baseRx?.patientId || state.patients[0]?.id || "pat-priya",
  );

  const activePatient = useMemo(() => {
    return (
      state.patients.find((p) => p.id === selectedPatientId) || state.patients[0]
    );
  }, [state.patients, selectedPatientId]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const match = rxConfig.templates.find((t) => t.name === baseRx?.template);
    return match?.id || rxConfig.templates[0]?.id || "tpl-post-rct";
  });
  const [diagnosis, setDiagnosis] = useState<string>(
    baseRx?.diagnosis || "Irreversible pulpitis, 36 — RCT initiated",
  );
  const [medicines, setMedicines] = useState(
    baseRx?.medicines || [],
  );
  const [advice, setAdvice] = useState<string>(baseRx?.advice || "");
  const [signed, setSigned] = useState<boolean>(Boolean(baseRx?.signedDigitally));
  const [templateBlockMessage, setTemplateBlockMessage] = useState<string | null>(null);

  // Rules & Clinician Approval Drawer State
  const [rulesOpen, setRulesOpen] = useState(false);
  const [newRuleKeyword, setNewRuleKeyword] = useState("");
  const [newRuleDrugs, setNewRuleDrugs] = useState("");
  const [newRuleSeverity, setNewRuleSeverity] = useState<"block" | "warn">("block");
  const [newRuleNote, setNewRuleNote] = useState("");

  const activeTemplate = useMemo(
    () => rxConfig.templates.find((t) => t.id === selectedTemplateId),
    [rxConfig.templates, selectedTemplateId],
  );

  const validation = useMemo(() => {
    if (!activePatient) {
      return { isValid: true, hasBlocks: false, hasWarnings: false, issues: [] };
    }
    return validatePrescription({
      template: activeTemplate,
      patient: {
        id: activePatient.id,
        name: activePatient.name,
        age: activePatient.age,
        weightKg: activePatient.weightKg,
        allergies: activePatient.allergies,
      },
      medicines,
      config: rxConfig,
      requireClinicianDose: true,
    });
  }, [activePatient, activeTemplate, medicines, rxConfig]);

  const blockingIssues = validation.issues.filter((i) => i.severity === "block");
  const warningIssues = validation.issues.filter((i) => i.severity === "warn");

  const handlePatientWeightChange = (val: string) => {
    if (!activePatient) return;
    const numeric = val.trim() === "" ? undefined : Number(val);
    updateState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) =>
        p.id === activePatient.id
          ? {
              ...p,
              weightKg:
                typeof numeric === "number" && Number.isFinite(numeric) && numeric > 0
                  ? numeric
                  : undefined,
            }
          : p,
      ),
    }));
    setTemplateBlockMessage(null);
  };

  const handleSelectTemplate = (templateId: string) => {
    const tpl = rxConfig.templates.find((t) => t.id === templateId);
    if (!tpl || !activePatient) return;

    const check = validateTemplateForPatient(
      tpl,
      {
        id: activePatient.id,
        name: activePatient.name,
        age: activePatient.age,
        weightKg: activePatient.weightKg,
        allergies: activePatient.allergies,
      },
      rxConfig,
    );

    if (check.hasBlocks) {
      const reasons = check.issues
        .filter((i) => i.severity === "block")
        .map((i) => i.message)
        .join(" ");
      setTemplateBlockMessage(reasons);
      logAuditEvent({
        patientName: activePatient.name,
        screenName: "Prescriptions",
        action: "RX_TEMPLATE_BLOCKED",
        entityType: "prescription",
        entityId: tpl.id,
        details: `Blocked template "${tpl.name}": ${reasons}`,
      });
      toast.error(reasons);
      return;
    }

    setTemplateBlockMessage(null);
    setSelectedTemplateId(tpl.id);
    setDiagnosis(tpl.diagnosis);
    setMedicines(tpl.medicines.map((m) => ({ ...m, id: `${m.id}-${Date.now()}` })));
    setAdvice(tpl.advice);
    setSigned(false);

    logAuditEvent({
      patientName: activePatient.name,
      screenName: "Prescriptions",
      action: "RX_TEMPLATE_APPLIED",
      entityType: "prescription",
      entityId: tpl.id,
      details: `Applied template "${tpl.name}" (${tpl.ageBand})`,
    });

    if (check.hasWarnings) {
      toast.warning(check.issues.map((i) => i.message).join(" "));
    } else {
      toast.success(`Applied clinician template "${tpl.name}"`);
    }
  };

  const handleSignAndSend = () => {
    if (!activePatient) return;
    if (validation.hasBlocks) {
      toast.error(
        blockingIssues[0]?.message ||
          "Resolve blocking clinical safety alerts before signing this prescription.",
      );
      return;
    }

    const actor = ROLE_USER_PROFILES[state.activeRole]?.name || "Clinic Dentist";
    const nowIso = new Date().toISOString();
    const nowDisplay = new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    setSigned(true);
    updateState((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((rx, i) =>
        i === 0
          ? {
              ...rx,
              patientId: activePatient.id,
              patientName: activePatient.name,
              patientMeta: `${activePatient.age} ${activePatient.gender[0]} · ${activePatient.code}`,
              template: activeTemplate?.name || rx.template,
              diagnosis,
              medicines,
              advice,
              signedDigitally: true,
              sentOnWhatsApp: true,
            }
          : rx,
      ),
      dpdpAccessLogs: [
        {
          id: `dl-rx-${Date.now()}`,
          timestamp: nowDisplay,
          isoTimestamp: nowIso,
          actor,
          role: state.activeRole,
          patientName: activePatient.name,
          screenName: "Prescriptions",
          action: "RX_SIGNED_AND_SENT",
          entityType: "prescription" as const,
          entityId: baseRx?.id || `rx-${Date.now()}`,
          details: `Signed Rx (${activeTemplate?.name || "Custom"}) · Dx: ${diagnosis} · ${medicines.length} item(s)`,
        },
        ...prev.dpdpAccessLogs,
      ].slice(0, 200),
    }));
    toast.success(`Prescription digitally signed and sent to ${activePatient.name} on WhatsApp`);
  };

  const updateRxConfig = (updater: (cfg: ClinicPrescriptionConfig) => ClinicPrescriptionConfig) => {
    updateState((prev) => ({
      ...prev,
      prescriptionConfig: updater(prev.prescriptionConfig || DEFAULT_CLINIC_PRESCRIPTION_CONFIG),
    }));
  };

  const handleAddAllergyRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleKeyword.trim() || !newRuleDrugs.trim()) {
      toast.error("Enter an allergy keyword and at least one conflicting drug name.");
      return;
    }
    const newRule: AllergyConflictRule = {
      id: `rule-${Date.now()}`,
      allergyKeyword: newRuleKeyword.trim().toLowerCase(),
      conflictingDrugs: newRuleDrugs
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      severity: newRuleSeverity,
      suggestedAlternativeNote:
        newRuleNote.trim() || "Verify safe alternative with attending dentist.",
      clinicianApproved: true,
    };
    updateRxConfig((cfg) => ({
      ...cfg,
      allergyRules: [...cfg.allergyRules, newRule],
    }));
    logAuditEvent({
      patientName: "Clinic Formulary",
      screenName: "Prescriptions",
      action: "RX_RULE_ADDED",
      entityType: "prescription",
      entityId: newRule.id,
      details: `Added ${newRule.severity.toUpperCase()} allergy rule for "${newRule.allergyKeyword}" (${newRule.conflictingDrugs.join(", ")})`,
    });
    setNewRuleKeyword("");
    setNewRuleDrugs("");
    setNewRuleNote("");
    toast.success(`Added allergy conflict rule for "${newRule.allergyKeyword}"`);
  };

  const handleApproveAllRules = () => {
    const actor = ROLE_USER_PROFILES[state.activeRole]?.name || "Clinic Dentist";
    const nowIso = new Date().toISOString();
    updateRxConfig((cfg) => ({
      ...cfg,
      approvedBy: actor,
      approvedAt: nowIso,
      allergyRules: cfg.allergyRules.map((r) => ({ ...r, clinicianApproved: true })),
      templates: cfg.templates.map((t) => ({
        ...t,
        clinicianApproved: true,
        approvedBy: actor,
        approvedAt: nowIso,
      })),
    }));
    logAuditEvent({
      patientName: "Clinic Formulary",
      screenName: "Prescriptions",
      action: "RX_RULES_APPROVED",
      entityType: "prescription",
      details: `All clinic prescription rules & templates clinician-approved by ${actor}`,
    });
    toast.success(`Prescription rules & templates marked clinician-approved by ${actor}`);
  };

  const isPaediatricPatient =
    activePatient && activePatient.age <= rxConfig.paediatricMaxAgeYears;

  return (
    <div>
      <DentflowPageHeader
        title={`New prescription · ${activePatient?.name || baseRx?.patientName || "Patient"}`}
        subtitle={baseRx?.contextSubtitle || "Validated against patient age, weight & allergies"}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col builder */}
        <div className="xl:col-span-8 df-card p-5 space-y-4">
          {/* Patient Context + Weight + Rules Button */}
          <div className="flex flex-wrap items-end justify-between gap-3 pb-3 border-b border-[var(--df-border)]">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="rx-patient-select"
                  className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1"
                >
                  Patient
                </label>
                <select
                  id="rx-patient-select"
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    setTemplateBlockMessage(null);
                    setSigned(false);
                  }}
                  className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--df-text)] cursor-pointer"
                >
                  {state.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age}y {p.gender[0]} · {p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="rx-patient-weight"
                  className="block text-[11px] font-semibold text-[var(--df-text-muted)] mb-1"
                >
                  Weight (kg){activeTemplate?.requiresWeight ? " *" : ""}
                </label>
                <input
                  id="rx-patient-weight"
                  type="number"
                  min={1}
                  max={250}
                  step="0.5"
                  placeholder="e.g. 62"
                  value={activePatient?.weightKg ?? ""}
                  onChange={(e) => handlePatientWeightChange(e.target.value)}
                  className="w-24 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--df-text)]"
                />
              </div>

              {activePatient && (
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  <DentflowStatusPill
                    label={isPaediatricPatient ? `Paediatric (${activePatient.age}y)` : `Adult (${activePatient.age}y)`}
                    tone={isPaediatricPatient ? "purple" : "teal"}
                  />
                  {activePatient.allergies.length > 0 ? (
                    <DentflowStatusPill
                      label={`Allergy: ${activePatient.allergies.join(", ")}`}
                      tone="red"
                    />
                  ) : (
                    <DentflowStatusPill label="No known allergies" tone="green" />
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="df-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--df-teal)]" />
              <span>Configure rules</span>
            </button>
          </div>

          {/* Templates bar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--df-text-muted)] mr-1">
                Templates:
              </span>
              {rxConfig.templates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                const check = activePatient
                  ? validateTemplateForPatient(
                      tpl,
                      {
                        id: activePatient.id,
                        name: activePatient.name,
                        age: activePatient.age,
                        weightKg: activePatient.weightKg,
                        allergies: activePatient.allergies,
                      },
                      rxConfig,
                    )
                  : { hasBlocks: false, hasWarnings: false };

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    title={
                      check.hasBlocks
                        ? `Blocked for ${activePatient?.name}: age band or weight requirement not met`
                        : `Apply ${tpl.name} (${tpl.ageBand})`
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[var(--df-sidebar-bg)] text-white"
                        : check.hasBlocks
                        ? "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                        : "bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                    }`}
                  >
                    <span>{tpl.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : tpl.ageBand === "paediatric"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-black/5 text-current"
                      }`}
                    >
                      {tpl.ageBand === "paediatric" ? "Kids" : tpl.ageBand === "adult" ? "Adult" : "All"}
                    </span>
                  </button>
                );
              })}
            </div>

            {templateBlockMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-[var(--df-status-red-bg)] border border-[var(--df-status-red-border)] flex items-start gap-2.5 text-xs text-[var(--df-status-red-text)]"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Template blocked by clinic safety rules</p>
                  <p className="mt-0.5 leading-relaxed">{templateBlockMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Diagnosis */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[var(--df-text-muted)]">
              Diagnosis
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => {
                setDiagnosis(e.target.value);
                setSigned(false);
              }}
              onBlur={() => {
                if (activePatient) {
                  logAuditEvent({
                    patientName: activePatient.name,
                    screenName: "Prescriptions",
                    action: "RX_DIAGNOSIS_UPDATED",
                    entityType: "prescription",
                    details: `Diagnosis updated: ${diagnosis}`,
                  });
                }
              }}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs font-medium text-[var(--df-text)]"
            />
          </div>

          {/* Clinical Safety Alerts (Blocks & Warnings) */}
          {blockingIssues.length > 0 && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-[var(--df-status-red-bg)] border border-[var(--df-status-red-border)] space-y-1.5 text-xs text-[var(--df-status-red-text)]"
            >
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Blocking clinical safety checks ({blockingIssues.length})</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {blockingIssues.map((issue, idx) => (
                  <li key={`${issue.code}-${idx}`} className="leading-relaxed">
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warningIssues.length > 0 && (
            <div className="p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] space-y-1 text-xs text-[var(--df-status-amber-text)]">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Clinical advisories ({warningIssues.length})</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {warningIssues.map((issue, idx) => (
                  <li key={`${issue.code}-${idx}`} className="leading-relaxed">
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medicine table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                  <th className="py-2 pr-2 text-left">Medicine</th>
                  <th className="py-2 px-1.5 text-left">Dose (clinician-verified)</th>
                  <th className="py-2 px-1.5 text-left">Frequency</th>
                  <th className="py-2 px-1.5 text-left">Days</th>
                  <th className="py-2 px-1.5 text-left">Instructions</th>
                  <th className="py-2 pl-1 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {medicines.map((m) => {
                  const rowConflict = validation.issues.find(
                    (i) => i.medicineId === m.id && i.code === "ALLERGY_CONFLICT",
                  );
                  const rowDoseMissing = validation.issues.find(
                    (i) => i.medicineId === m.id && i.code === "DOSE_REQUIRED",
                  );

                  return (
                    <tr
                      key={m.id}
                      className={rowConflict ? "bg-red-50/60" : undefined}
                    >
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          aria-label="Medicine name"
                          value={m.medicine}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMedicines((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, medicine: val } : x)),
                            );
                            setSigned(false);
                          }}
                          onBlur={() => {
                            if (activePatient && m.medicine.trim()) {
                              logAuditEvent({
                                patientName: activePatient.name,
                                screenName: "Prescriptions",
                                action: "RX_MEDICINE_UPDATED",
                                entityType: "prescription",
                                entityId: m.id,
                                details: `Medicine set to "${m.medicine}" (dose: ${m.dose || "unset"})`,
                              });
                            }
                          }}
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-medium bg-[var(--df-surface)] ${
                            rowConflict
                              ? "border-red-500 text-red-900"
                              : "border-[var(--df-border)]"
                          }`}
                        />
                        {rowConflict && (
                          <p className="text-[10.5px] font-semibold text-red-700 mt-1">
                            Allergy conflict ({rowConflict.matchedAllergy})
                          </p>
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="text"
                          aria-label="Dose"
                          placeholder="Clinician dose"
                          value={m.dose}
                          onChange={(e) => {
                            setMedicines((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, dose: e.target.value } : x,
                              ),
                            );
                            setSigned(false);
                          }}
                          onBlur={() => {
                            if (activePatient && m.dose.trim()) {
                              logAuditEvent({
                                patientName: activePatient.name,
                                screenName: "Prescriptions",
                                action: "RX_DOSE_UPDATED",
                                entityType: "prescription",
                                entityId: m.id,
                                details: `Clinician dose set for "${m.medicine || "medicine"}": ${m.dose}`,
                              });
                            }
                          }}
                          className={`w-28 rounded-lg border px-2 py-1.5 text-xs bg-[var(--df-surface)] ${
                            rowDoseMissing
                              ? "border-amber-500"
                              : "border-[var(--df-border)]"
                          }`}
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="text"
                          aria-label="Frequency"
                          value={m.frequency}
                          onChange={(e) => {
                            setMedicines((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, frequency: e.target.value } : x,
                              ),
                            );
                            setSigned(false);
                          }}
                          className="w-20 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="text"
                          aria-label="Days"
                          value={m.days}
                          onChange={(e) => {
                            setMedicines((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, days: e.target.value } : x,
                              ),
                            );
                            setSigned(false);
                          }}
                          className="w-20 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="text"
                          aria-label="Instructions"
                          value={m.instructions}
                          onChange={(e) => {
                            setMedicines((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, instructions: e.target.value } : x,
                              ),
                            );
                            setSigned(false);
                          }}
                          className="w-full min-w-[140px] rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="py-2 pl-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setMedicines((prev) => prev.filter((x) => x.id !== m.id));
                            setSigned(false);
                            if (activePatient) {
                              logAuditEvent({
                                patientName: activePatient.name,
                                screenName: "Prescriptions",
                                action: "RX_MEDICINE_REMOVED",
                                entityType: "prescription",
                                entityId: m.id,
                                details: `Removed medicine: ${m.medicine || "(blank row)"}`,
                              });
                            }
                          }}
                          aria-label="Remove medicine"
                          className="p-1 text-[var(--df-text-muted)] hover:text-[var(--df-status-red-text)] cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => {
              const newId = `m-${Date.now()}`;
              setMedicines((prev) => [
                ...prev,
                {
                  id: newId,
                  medicine: "",
                  dose: "",
                  frequency: "1-0-0",
                  days: "3 days",
                  instructions: "After food",
                },
              ]);
              setSigned(false);
              if (activePatient) {
                logAuditEvent({
                  patientName: activePatient.name,
                  screenName: "Prescriptions",
                  action: "RX_MEDICINE_ADDED",
                  entityType: "prescription",
                  entityId: newId,
                  details: "Added blank medicine row to draft prescription",
                });
              }
            }}
            className="df-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add medicine
          </button>

          {/* Advice */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[var(--df-text-muted)]">
              Advice for patient (translated in their language on WhatsApp)
            </label>
            <textarea
              rows={2}
              value={advice}
              onChange={(e) => {
                setAdvice(e.target.value);
                setSigned(false);
              }}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] p-3 text-xs text-[var(--df-text)] leading-relaxed"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (!activeTemplate) return;
                const actor = ROLE_USER_PROFILES[state.activeRole]?.name || "Clinic Dentist";
                updateRxConfig((cfg) => ({
                  ...cfg,
                  templates: cfg.templates.map((t) =>
                    t.id === activeTemplate.id
                      ? {
                          ...t,
                          diagnosis,
                          medicines,
                          advice,
                          clinicianApproved: true,
                          approvedBy: actor,
                          approvedAt: new Date().toISOString(),
                        }
                      : t,
                  ),
                }));
                logAuditEvent({
                  patientName: "Clinic Formulary",
                  screenName: "Prescriptions",
                  action: "RX_TEMPLATE_APPROVED",
                  entityType: "prescription",
                  entityId: activeTemplate.id,
                  details: `Saved and clinician-approved template "${activeTemplate.name}" (${medicines.length} medicines)`,
                });
                toast.success(`Saved & clinician-approved "${activeTemplate.name}" template`);
              }}
              className="df-btn-secondary px-3.5 py-2 text-xs cursor-pointer"
            >
              Save &amp; approve template
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="df-btn-secondary px-3.5 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button
                type="button"
                onClick={handleSignAndSend}
                disabled={validation.hasBlocks}
                className="df-btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" /> Sign &amp; send on WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Right 4-col live printable letterhead preview */}
        <div className="xl:col-span-4 df-card p-5 space-y-3.5 bg-[var(--df-surface)]">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--df-border)]">
            <div>
              <p className="df-serif text-base font-bold text-[var(--df-teal)]">
                {state.clinicSetup.clinicGroupName || "Smile Studio Dental"}
              </p>
              <p className="text-[10.5px] text-[var(--df-text-muted)]">
                {state.activeBranch} · {state.clinicSetup.city}
              </p>
            </div>
            <div className="text-right text-[10.5px] text-[var(--df-text-muted)]">
              <p className="font-bold text-[var(--df-text)]">
                {ROLE_USER_PROFILES[state.activeRole]?.name || "Dr. Sneha Kulkarni"}
              </p>
              <p>BDS, MDS · Reg. MH-28419</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--df-text-secondary)]">
            <span>
              <strong>{activePatient?.name || baseRx?.patientName}</strong> ·{" "}
              {activePatient
                ? `${activePatient.age} ${activePatient.gender[0]}${
                    activePatient.weightKg ? ` · ${activePatient.weightKg} kg` : ""
                  } · ${activePatient.code}`
                : baseRx?.patientMeta}
            </span>
            <span>{baseRx?.date || "Today"}</span>
          </div>

          {activePatient && activePatient.allergies.length > 0 && (
            <p className="text-[11px] font-semibold text-[var(--df-status-red-text)]">
              Allergy: {activePatient.allergies.join(", ")}
            </p>
          )}

          <p className="text-xs font-semibold text-[var(--df-text)]">Dx: {diagnosis}</p>

          <div className="pt-1 space-y-2.5">
            <p className="df-serif text-lg font-bold text-[var(--df-teal)]">℞</p>
            {medicines.map((m) => (
              <div
                key={m.id}
                className="pb-2 border-b border-[var(--df-border)] last:border-b-0 text-xs"
              >
                <p className="font-bold text-[var(--df-text)]">
                  {m.medicine || "(Unnamed medicine)"} ·{" "}
                  {m.dose || <span className="text-amber-700 italic">Dose required</span>}
                </p>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  {m.frequency} × {m.days} · {m.instructions}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[var(--df-text-secondary)] leading-relaxed pt-1">
            {advice}
          </p>

          <div className="pt-4 border-t border-[var(--df-border)] flex items-end justify-between text-[11px]">
            <span className="text-[var(--df-text-muted)]">Next visit: {baseRx?.nextVisit || "As scheduled"}</span>
            <span className="df-serif italic text-sm font-semibold text-[var(--df-text)]">
              {signed ? "Signed digitally" : "Draft — unsigned"}
            </span>
          </div>
        </div>
      </div>

      {/* Configurable Clinician-Approved Rules Drawer */}
      <DentflowDrawer
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="Prescription Safety Rules & Approval"
        subtitle="Configurable clinic formulary guardrails — clinician sign-off required"
      >
        <div className="space-y-5 text-xs pb-8">
          {/* Approval banner */}
          <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex items-center justify-between gap-2">
            <div>
              <p className="font-bold text-[var(--df-text)]">Clinician rule governance</p>
              <p className="text-[11px] text-[var(--df-text-muted)]">
                {rxConfig.approvedBy
                  ? `Approved by ${rxConfig.approvedBy} (${rxConfig.approvedAt ? new Date(rxConfig.approvedAt).toLocaleDateString("en-IN") : ""})`
                  : "Pending clinic dentist sign-off on starter guardrails"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleApproveAllRules}
              className="df-btn-primary px-3 py-1.5 text-[11px] inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve all
            </button>
          </div>

          {/* Age band settings */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--df-teal)]">
              Age-Band Guardrails
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[var(--df-text)]">
                  Paediatric max age (yrs)
                </label>
                <input
                  type="number"
                  min={1}
                  max={18}
                  value={rxConfig.paediatricMaxAgeYears}
                  onChange={(e) =>
                    updateRxConfig((cfg) => ({
                      ...cfg,
                      paediatricMaxAgeYears: Math.max(1, Number(e.target.value) || 14),
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[var(--df-text)]">
                  Adult min age (yrs)
                </label>
                <input
                  type="number"
                  min={12}
                  max={21}
                  value={rxConfig.adultMinAgeYears}
                  onChange={(e) =>
                    updateRxConfig((cfg) => ({
                      ...cfg,
                      adultMinAgeYears: Math.max(12, Number(e.target.value) || 15),
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-1.5"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-[var(--df-text-secondary)]">
              <input
                type="checkbox"
                checked={rxConfig.strictAgeBandBlocking}
                onChange={(e) =>
                  updateRxConfig((cfg) => ({
                    ...cfg,
                    strictAgeBandBlocking: e.target.checked,
                  }))
                }
                className="h-3.5 w-3.5 rounded accent-[var(--df-teal)]"
              />
              <span>Hard-block mismatched age-band templates (untick to warn only)</span>
            </label>
          </div>

          {/* Allergy rules list */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--df-teal)]">
              Drug–Allergy Conflict Rules
            </h3>
            {rxConfig.allergyRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[var(--df-text)] capitalize">
                    Allergy: {rule.allergyKeyword}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <select
                      aria-label={`Severity for ${rule.allergyKeyword}`}
                      value={rule.severity}
                      onChange={(e) =>
                        updateRxConfig((cfg) => ({
                          ...cfg,
                          allergyRules: cfg.allergyRules.map((r) =>
                            r.id === rule.id
                              ? { ...r, severity: e.target.value as "block" | "warn" }
                              : r,
                          ),
                        }))
                      }
                      className="rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-0.5 text-[11px] font-semibold"
                    >
                      <option value="block">Block</option>
                      <option value="warn">Warn</option>
                    </select>
                    <button
                      type="button"
                      aria-label={`Delete ${rule.allergyKeyword} rule`}
                      onClick={() =>
                        updateRxConfig((cfg) => ({
                          ...cfg,
                          allergyRules: cfg.allergyRules.filter((r) => r.id !== rule.id),
                        }))
                      }
                      className="p-1 text-[var(--df-text-muted)] hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--df-text-secondary)]">
                  Drugs: <span className="font-mono">{rule.conflictingDrugs.join(", ")}</span>
                </p>
                <p className="text-[11px] text-[var(--df-text-muted)]">
                  {rule.suggestedAlternativeNote}
                </p>
              </div>
            ))}

            {/* Add new rule */}
            <form
              onSubmit={handleAddAllergyRule}
              className="p-3 rounded-xl border border-dashed border-[var(--df-border-strong)] space-y-2"
            >
              <p className="font-bold text-[var(--df-text)]">Add allergy rule</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Allergy keyword (e.g. latex)"
                  value={newRuleKeyword}
                  onChange={(e) => setNewRuleKeyword(e.target.value)}
                  className="rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
                />
                <select
                  aria-label="New rule severity"
                  value={newRuleSeverity}
                  onChange={(e) => setNewRuleSeverity(e.target.value as "block" | "warn")}
                  className="rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
                >
                  <option value="block">Block</option>
                  <option value="warn">Warn</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Conflicting drug names (comma-separated)"
                value={newRuleDrugs}
                onChange={(e) => setNewRuleDrugs(e.target.value)}
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
              />
              <input
                type="text"
                placeholder="Clinical guidance note (no hardcoded doses)"
                value={newRuleNote}
                onChange={(e) => setNewRuleNote(e.target.value)}
                className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5"
              />
              <button
                type="submit"
                className="w-full df-btn-secondary py-1.5 text-xs font-semibold cursor-pointer"
              >
                + Add rule
              </button>
            </form>
          </div>
        </div>
      </DentflowDrawer>
    </div>
  );
}
