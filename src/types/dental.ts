export type ToothNumber = number; // 1 - 32 Universal Numbering System

export type ToothSurface = "M" | "O" | "D" | "B" | "L" | "F" | "I";

export type ToothConditionType = 
  | "healthy" 
  | "caries" 
  | "composite" 
  | "amalgam" 
  | "crown" 
  | "missing" 
  | "implant" 
  | "root_canal" 
  | "veneer" 
  | "sealant" 
  | "fracture";

export interface ToothSurfaceCondition {
  surface: ToothSurface;
  condition: ToothConditionType;
  cdtCode?: string;
  notes?: string;
}

export interface ToothStatus {
  toothNumber: ToothNumber;
  generalCondition: ToothConditionType;
  surfaces: Record<ToothSurface, ToothConditionType>;
  hasRootCanal?: boolean;
  hasCrown?: boolean;
  isMissing?: boolean;
  hasImplant?: boolean;
  notes?: string;
  history?: Array<{
    date: string;
    procedure: string;
    cdtCode: string;
    surfaces?: ToothSurface[];
    provider: string;
  }>;
}

export interface PeriodontalSite {
  probingDepth: number; // in mm, >= 4 is pathological
  recession: number; // in mm
  bleedingOnProbing: boolean; // BOP
  suppuration: boolean;
}

export interface PeriodontalToothData {
  toothNumber: ToothNumber;
  isMissing: boolean;
  mobility: 0 | 1 | 2 | 3;
  furcation?: 0 | 1 | 2 | 3 | 4;
  buccal: {
    distal: PeriodontalSite;
    mid: PeriodontalSite;
    mesial: PeriodontalSite;
  };
  lingual: {
    distal: PeriodontalSite;
    mid: PeriodontalSite;
    mesial: PeriodontalSite;
  };
}

export interface MedicalAlert {
  id: string;
  category: "allergy" | "anticoagulant" | "bisphosphonate" | "premedication" | "systemic";
  title: string;
  severity: "critical" | "high" | "moderate";
  details: string;
  clinicalSignificance: string; // e.g. "Risk of MRONJ before surgical extractions/implants"
  active: boolean;
  dateAdded: string;
}

export interface AnesthesiaRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  agent: string; // e.g. "Lidocaine HCl 2% with Epinephrine 1:100,000"
  batchNumber: string; // e.g. "LOT-LIDO-8849"
  expirationDate: string;
  cartridges: number; // e.g. 2 carpules
  volumeMl: number; // e.g. 3.4 ml
  vasoconstrictor: string; // "1:100,000 Epinephrine"
  technique: "IANB" | "Infiltration" | "Mental Block" | "PSA Block" | "Palatal Infiltration" | "Intraligamentary";
  quadrantOrTeeth: string; // e.g. "#18, #19"
  patientTolerance: "Normal / Well Tolerated" | "Mild Tachycardia" | "Mild Syncope" | "Adverse Event";
  clinician: string;
  signed: boolean;
}

export type AppointmentTypeColor = "emergency" | "hygiene" | "procedure" | "consultation";

export interface DentalAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  operatoryChair: "Chair 1 - Surgery" | "Chair 2 - Restorative" | "Chair 3 - Endodontics" | "Hygiene Bay 1";
  providerName: string;
  appointmentType: AppointmentTypeColor;
  procedureName: string;
  durationMinutes: number;
  visitPhase?: string; // e.g. "Visit 1 of 2: Cleaning & Instrumentation (60 min)"
  start: string; // ISO string
  end: string;   // ISO string
  status: "Scheduled" | "Confirmed" | "In Chair" | "Completed" | "Cancelled";
  insuranceVerified: boolean;
  notes?: string;
}

export interface WaitingListEntry {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  procedureNeeded: string;
  durationMinutes: number;
  preferredDays: string[];
  preferredTimes: ("morning" | "afternoon" | "any")[];
  notes: string;
  status: "Waiting" | "SMS_Sent" | "Confirmed" | "Declined";
  estimatedValue: number;
  lastContacted?: string;
}

export interface InsuranceEligibility {
  patientId: string;
  patientName: string;
  payerName: string; // e.g. "Delta Dental Premier"
  subscriberId: string;
  groupNumber: string;
  status: "Active" | "Inactive" | "Pending Verification";
  verifiedAt: string;
  annualMaximum: number;
  remainingBenefit: number;
  deductibleTotal: number;
  deductibleRemaining: number;
  coverage: {
    preventativePercent: number; // usually 100%
    basicRestorativePercent: number; // usually 80%
    majorProsthodonticsPercent: number; // usually 50%
    endodonticsPercent: number; // 80% or 50%
    periodonticsPercent: number; // 80%
    orthodonticsPercent: number; // 50% up to lifetime max
  };
  frequencyLimits: {
    cleaningsPerYear: number;
    bitewingsMonths: number;
    panoYears: number;
  };
  missingToothClause: boolean;
  waitingPeriods: string;
}

export interface WriteOffItem {
  id: string;
  procedureCode: string; // e.g. "D2740"
  description: string;   // e.g. "Crown - Porcelain/Ceramic Substrate"
  toothNumber?: ToothNumber;
  surfaces?: string;
  billedUcrFee: number;     // e.g. $1,350
  insuranceAllowedFee: number; // e.g. $920
  contractualWriteOff: number; // e.g. $430 ($1,350 - $920)
  expectedInsurancePayment: number; // e.g. $460 (50% of $920)
  patientCopay: number;    // e.g. $460
  payerName: string;
  date: string;
  status: "Calculated" | "Submitted" | "Settled";
}

export interface AgingBucketSummary {
  bucket: "0-30 days" | "31-60 days" | "61-90 days" | "90+ days";
  patientAmount: number;
  insuranceAmount: number;
  totalAmount: number;
  count: number;
}

export interface OutstandingBalanceItem {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  daysAging: number;
  bucket: "0-30 days" | "31-60 days" | "61-90 days" | "90+ days";
  patientBalance: number;
  insurancePending: number;
  totalBalance: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  payerName: string;
  claimId?: string;
  lastAction: string;
}

export interface DentalLabCase {
  id: string;
  patientId: string;
  patientName: string;
  toothNumber: ToothNumber;
  restorationType: "Zirconia Crown" | "E-Max Veneer" | "Implant Custom Abutment & Crown" | "3-Unit Bridge" | "Nightguard" | "Full Denture";
  shade: string; // e.g. "A2", "BL1", "2M2"
  labName: string; // e.g. "Glidewell Laboratories", "Modern Dental Lab"
  dateSent: string;
  dueDate: string; // SLA Due Date
  patientAppointmentDate: string;
  slaDaysRemaining: number; // computed
  status: "Sent" | "In Production" | "Shipped" | "Received_Checked_In" | "Seated";
  slaAlertStatus: "Normal" | "Due_Soon" | "Critical_Alert" | "Received";
  trackingNumber?: string;
  notes?: string;
}

export interface InventorySupplyItem {
  id: string;
  sku: string;
  name: string;
  category: "Anesthetics" | "Restorative" | "Sterilization & Hygiene" | "Impression & Lab" | "Disposables" | "Surgical";
  currentStock: number;
  unit: string; // "box (50 carpules)", "pack", "bottle"
  reorderPoint: number; // threshold when alert fires
  optimalReorderQty: number;
  unitCost: number;
  supplier: "Henry Schein" | "Patterson Dental" | "Benco Dental";
  isLowStock: boolean;
  status: "In Stock" | "Low Stock" | "Ordered";
  lastOrderedDate?: string;
}

export interface PhasedTreatmentPlanPhase {
  phaseNumber: number;
  title: string;
  urgency: "Urgent / Immediate" | "Moderate / Step 2" | "Elective / Step 3";
  procedures: Array<{
    cdtCode: string;
    tooth?: number;
    surfaces?: string;
    description: string;
    fee: number;
    estimatedInsurance: number;
    patientPortion: number;
  }>;
  phaseTotalFee: number;
  phaseInsuranceEstimate: number;
  phasePatientPortion: number;
  accepted: boolean;
  acceptedAt?: string;
  digitalSignature?: string;
}
