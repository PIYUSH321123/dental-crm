"use client";

import React, { useState } from "react";
import { AlertTriangle, Plus, Printer, Send, X } from "lucide-react";
import { toast } from "sonner";
import { DentflowPageHeader } from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

const RX_TEMPLATES: Record<
  string,
  {
    diagnosis: string;
    hasPenicillinInBase: boolean;
    medicines: {
      id: string;
      medicine: string;
      dose: string;
      frequency: string;
      days: string;
      instructions: string;
    }[];
    advice: string;
  }
> = {
  "Post-RCT": {
    diagnosis: "Irreversible pulpitis, 36 — RCT initiated",
    hasPenicillinInBase: true,
    medicines: [
      {
        id: "m1",
        medicine: "Azithromycin",
        dose: "500 mg",
        frequency: "1-0-0",
        days: "3 days",
        instructions: "After food",
      },
      {
        id: "m2",
        medicine: "Ibuprofen + Paracetamol",
        dose: "400/325 mg",
        frequency: "1-0-1",
        days: "3 days",
        instructions: "After food, only if pain",
      },
      {
        id: "m3",
        medicine: "Chlorhexidine mouthwash",
        dose: "10 ml",
        frequency: "0-1-1",
        days: "7 days",
        instructions: "Rinse 30 sec, no water after",
      },
    ],
    advice:
      "Avoid chewing on the left side until the crown is fitted. Warm salt-water rinse twice a day. Call the clinic if swelling increases.",
  },
  "Post-extraction": {
    diagnosis: "Surgical extraction socket — post-op care",
    hasPenicillinInBase: true,
    medicines: [
      {
        id: "pe1",
        medicine: "Azithromycin",
        dose: "500 mg",
        frequency: "1-0-0",
        days: "3 days",
        instructions: "After food",
      },
      {
        id: "pe2",
        medicine: "Aceclofenac + Paracetamol",
        dose: "100/325 mg",
        frequency: "1-0-1",
        days: "3 days",
        instructions: "After food",
      },
    ],
    advice:
      "Bite on gauze for 30 minutes. No spitting, straw, or hot food for 24 hours. Cold compress externally.",
  },
  "Post-implant": {
    diagnosis: "Endosseous implant placement — stage 1",
    hasPenicillinInBase: true,
    medicines: [
      {
        id: "pi1",
        medicine: "Azithromycin",
        dose: "500 mg",
        frequency: "1-0-0",
        days: "5 days",
        instructions: "After food",
      },
      {
        id: "pi2",
        medicine: "Chlorhexidine 0.2% rinse",
        dose: "10 ml",
        frequency: "0-1-1",
        days: "10 days",
        instructions: "Gentle rinse from tomorrow",
      },
    ],
    advice:
      "Soft diet for 5 days. Do not disturb sutures with tongue or brush.",
  },
  Scaling: {
    diagnosis: "Chronic generalized gingivitis — post-scaling",
    hasPenicillinInBase: false,
    medicines: [
      {
        id: "sc1",
        medicine: "Chlorhexidine mouthwash",
        dose: "10 ml",
        frequency: "0-1-1",
        days: "7 days",
        instructions: "Rinse 30 sec, no water after",
      },
      {
        id: "sc2",
        medicine: "Desensitizing toothpaste",
        dose: "Pea size",
        frequency: "1-0-1",
        days: "14 days",
        instructions: "Leave foam for 2 min before rinse",
      },
    ],
    advice: "Mild cold sensitivity for 2–3 days is normal. Brush gently with soft bristles.",
  },
  "Kids · mild pain": {
    diagnosis: "Deciduous molar caries — symptomatic relief",
    hasPenicillinInBase: false,
    medicines: [
      {
        id: "kd1",
        medicine: "Paracetamol suspension",
        dose: "250 mg / 5 ml",
        frequency: "1-0-1",
        days: "2 days",
        instructions: "Weight-based dose after food",
      },
    ],
    advice: "Avoid sticky sweets and cold drinks until next visit.",
  },
};

export default function PrescriptionsPage() {
  const { state, updateState } = useDentflow();
  const baseRx = state.prescriptions[0];

  const [selectedTemplate, setSelectedTemplate] = useState<string>(baseRx.template || "Post-RCT");
  const [diagnosis, setDiagnosis] = useState<string>(baseRx.diagnosis);
  const [medicines, setMedicines] = useState(baseRx.medicines);
  const [advice, setAdvice] = useState<string>(baseRx.advice);
  const [allergyAlert, setAllergyAlert] = useState(baseRx.allergyAlert);
  const [signed, setSigned] = useState<boolean>(baseRx.signedDigitally);

  const handleSelectTemplate = (tplName: string) => {
    setSelectedTemplate(tplName);
    const tpl = RX_TEMPLATES[tplName];
    if (!tpl) return;
    setDiagnosis(tpl.diagnosis);
    setMedicines(tpl.medicines);
    setAdvice(tpl.advice);
    if (tpl.hasPenicillinInBase) {
      setAllergyAlert({
        blockedDrug: "Amoxicillin",
        allergy: "penicillin allergy",
        alternative: "Azithromycin 500 mg",
        conditionNote: "Metformin noted — no interaction flagged with chosen drugs.",
      });
    } else {
      setAllergyAlert(undefined);
    }
  };

  const handleMedicineNameChange = (id: string, val: string) => {
    const lower = val.toLowerCase();
    if (lower.includes("amoxicillin") || lower.includes("augmentin") || lower.includes("penicillin")) {
      toast.error(
        "Allergy block: Priya Deshmukh has a documented Penicillin allergy! Auto-substituted Azithromycin 500 mg.",
      );
      setAllergyAlert({
        blockedDrug: val,
        allergy: "penicillin allergy",
        alternative: "Azithromycin 500 mg",
        conditionNote: "Rule-based allergy block enforced.",
      });
      setMedicines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, medicine: "Azithromycin", dose: "500 mg" } : m)),
      );
      return;
    }
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, medicine: val } : m)));
  };

  const handleSignAndSend = () => {
    setSigned(true);
    updateState((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((rx, i) =>
        i === 0
          ? {
              ...rx,
              template: selectedTemplate,
              diagnosis,
              medicines,
              advice,
              signedDigitally: true,
              sentOnWhatsApp: true,
            }
          : rx,
      ),
    }));
    toast.success("Prescription digitally signed and sent to Priya Deshmukh on WhatsApp");
  };

  return (
    <div>
      <DentflowPageHeader
        title={`New prescription · ${baseRx.patientName}`}
        subtitle={baseRx.contextSubtitle}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8-col builder */}
        <div className="xl:col-span-8 df-card p-5 space-y-4">
          {/* Templates bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--df-text-muted)] mr-1">
              Templates:
            </span>
            {Object.keys(RX_TEMPLATES).map((tpl) => (
              <button
                key={tpl}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTemplate === tpl
                    ? "bg-[var(--df-sidebar-bg)] text-white"
                    : "bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                }`}
              >
                {tpl}
              </button>
            ))}
          </div>

          {/* Diagnosis */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[var(--df-text-muted)]">
              Diagnosis
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-xs font-medium text-[var(--df-text)]"
            />
          </div>

          {/* Rule-based allergy alert */}
          {allergyAlert && (
            <div className="p-3 rounded-xl bg-[var(--df-alert-amber-bg)] border border-[var(--df-status-amber-border)] flex items-start gap-2.5 text-xs text-[var(--df-status-amber-text)]">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>{allergyAlert.blockedDrug} blocked.</strong> Patient record lists a{" "}
                {allergyAlert.allergy}. Suggested alternative from template:{" "}
                <strong>{allergyAlert.alternative}</strong>. {allergyAlert.conditionNote}
              </p>
            </div>
          )}

          {/* Medicine table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--df-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--df-text-muted)]">
                  <th className="py-2 pr-2 text-left">Medicine</th>
                  <th className="py-2 px-1.5 text-left">Dose</th>
                  <th className="py-2 px-1.5 text-left">Frequency</th>
                  <th className="py-2 px-1.5 text-left">Days</th>
                  <th className="py-2 px-1.5 text-left">Instructions</th>
                  <th className="py-2 pl-1 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {medicines.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={m.medicine}
                        onChange={(e) => handleMedicineNameChange(m.id, e.target.value)}
                        className="w-full rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2.5 py-1.5 text-xs font-medium"
                      />
                    </td>
                    <td className="py-2 px-1.5">
                      <input
                        type="text"
                        value={m.dose}
                        onChange={(e) =>
                          setMedicines((prev) =>
                            prev.map((x) => (x.id === m.id ? { ...x, dose: e.target.value } : x)),
                          )
                        }
                        className="w-24 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
                      />
                    </td>
                    <td className="py-2 px-1.5">
                      <input
                        type="text"
                        value={m.frequency}
                        onChange={(e) =>
                          setMedicines((prev) =>
                            prev.map((x) =>
                              x.id === m.id ? { ...x, frequency: e.target.value } : x,
                            ),
                          )
                        }
                        className="w-16 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
                      />
                    </td>
                    <td className="py-2 px-1.5">
                      <input
                        type="text"
                        value={m.days}
                        onChange={(e) =>
                          setMedicines((prev) =>
                            prev.map((x) => (x.id === m.id ? { ...x, days: e.target.value } : x)),
                          )
                        }
                        className="w-16 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
                      />
                    </td>
                    <td className="py-2 px-1.5">
                      <input
                        type="text"
                        value={m.instructions}
                        onChange={(e) =>
                          setMedicines((prev) =>
                            prev.map((x) =>
                              x.id === m.id ? { ...x, instructions: e.target.value } : x,
                            ),
                          )
                        }
                        className="w-full min-w-[140px] rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-2 py-1.5 text-xs"
                      />
                    </td>
                    <td className="py-2 pl-1 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setMedicines((prev) => prev.filter((x) => x.id !== m.id))
                        }
                        aria-label="Remove medicine"
                        className="p-1 text-[var(--df-text-muted)] hover:text-[var(--df-status-red-text)] cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() =>
              setMedicines((prev) => [
                ...prev,
                {
                  id: `m-${Date.now()}`,
                  medicine: "Pantoprazole",
                  dose: "40 mg",
                  frequency: "1-0-0",
                  days: "3 days",
                  instructions: "Before breakfast",
                },
              ])
            }
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
              onChange={(e) => setAdvice(e.target.value)}
              className="w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] p-3 text-xs text-[var(--df-text)] leading-relaxed"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => toast.success(`Saved "${selectedTemplate}" prescription template`)}
              className="df-btn-secondary px-3.5 py-2 text-xs cursor-pointer"
            >
              Save as template
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
                className="df-btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
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
                Smile Studio Dental
              </p>
              <p className="text-[10.5px] text-[var(--df-text-muted)]">
                Station Road branch · MG Road, Pune
              </p>
            </div>
            <div className="text-right text-[10.5px] text-[var(--df-text-muted)]">
              <p className="font-bold text-[var(--df-text)]">Dr. Sneha Kulkarni</p>
              <p>BDS, MDS · Reg. MH-28419</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--df-text-secondary)]">
            <span>
              <strong>{baseRx.patientName}</strong> · {baseRx.patientMeta}
            </span>
            <span>{baseRx.date}</span>
          </div>

          <p className="text-[11px] font-semibold text-[var(--df-status-red-text)]">
            Allergy: Penicillin
          </p>

          <p className="text-xs font-semibold text-[var(--df-text)]">Dx: {diagnosis}</p>

          <div className="pt-1 space-y-2.5">
            <p className="df-serif text-lg font-bold text-[var(--df-teal)]">℞</p>
            {medicines.map((m) => (
              <div
                key={m.id}
                className="pb-2 border-b border-[var(--df-border)] last:border-b-0 text-xs"
              >
                <p className="font-bold text-[var(--df-text)]">
                  {m.medicine} · {m.dose}
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
            <span className="text-[var(--df-text-muted)]">Next visit: {baseRx.nextVisit}</span>
            <span className="df-serif italic text-sm font-semibold text-[var(--df-text)]">
              {signed ? "Signed digitally" : "Draft — unsigned"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

