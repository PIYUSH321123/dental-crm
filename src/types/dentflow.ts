// Complete TypeScript interfaces for all 38 DentFlow screens (C01-C17, O01-O05, P01-P13, S01, L01, A01)

import {
  DentflowRoleKey,
  RolePermissionRow,
  StatusTone,
} from "@/lib/dentflow-theme";

export type BranchName =
  | "Station Road branch"
  | "Civil Lines branch"
  | "MG Road branch"
  | "All 3 branches";

export interface DentflowPatient {
  id: string;
  code: string; // e.g., DF-10482
  name: string;
  age: number;
  gender: "Female" | "Male" | "Other";
  phone: string;
  homeBranch: string;
  patientSince: string;
  abhaLinked: boolean;
  abhaAddress?: string;
  abhaNumber?: string;
  abhaSharingEnabled: boolean;
  flags: ("Anxious" | "Allergy" | "VIP" | "New")[];
  allergies: string[];
  allergyNote?: string;
  conditions: string;
  medication: string;
  bloodThinners: string;
  pregnancy: string;
  habits: string;
  lastHba1c: string;
  medicalUpdatedAt: string;
  comfortProfile: {
    anxietyScore: number; // 0-10
    triggers: string[];
    whatHelps: string[];
    autoBufferMin: number;
  };
  familyGroupId?: string;
  familyMembers: { id: string; initials: string; name: string; relation: string; age: number }[];
  openPlanSummary?: {
    planCode: string;
    title: string;
    total: number;
    stageLabel: string;
    nextSitting: string;
  };
  consents: {
    id: string;
    title: string;
    status: "Signed" | "Due";
    dateOrNote: string;
  }[];
  recentActivity: {
    date: string;
    text: string;
  }[];
  distanceKm: number;
  language: "English" | "हिन्दी" | "मराठी" | "ગુજરાતી" | "தமிழ்" | "తెలుగు" | "ಕನ್ನಡ" | "বাংলা";
  whatsappConsent: boolean;
  visitsCount: number;
  lifetimeValue: number;
  referredCount: number;
}

export interface ClinicAppointment {
  id: string;
  time: string;
  endTime: string;
  durationMin: number;
  anxietyBufferMin: number;
  patientId: string;
  patientName: string;
  flags: ("Anxious" | "Allergy" | "VIP" | "New")[];
  procedure: string;
  doctor: string;
  chair: string; // C1, C2, C3, C4
  branch: string;
  status:
    | "Done"
    | "In chair"
    | "Checked in"
    | "Late 10 min"
    | "Confirmed"
    | "Not confirmed"
    | "Cancelled";
  depositRequested?: boolean;
  remindWhatsApp?: boolean;
  sendPreVisitForm?: boolean;
}

export interface NeedsAttentionItem {
  id: string;
  title: string;
  subtitle: string;
  tone: "red" | "amber" | "teal" | "blue";
  targetRoute: string;
  resolved?: boolean;
}

export interface TreatmentPlanOptionItem {
  code: "A" | "B" | "C";
  label: string;
  title: string;
  price: number;
  subtitle: string;
  recommended?: boolean;
  patientChose?: boolean;
}

export interface TreatmentPlanStageItem {
  id: string;
  stageNum: number;
  procedure: string;
  tooth: string;
  doctor: string;
  visitLabel: string;
  fee: number;
  includedInPrev?: boolean;
  status: "Done" | "Booked" | "Not booked";
}

export interface TreatmentPlanRecord {
  id: string;
  planCode: string; // TP-2231
  patientId: string;
  patientName: string;
  proposedBy: string;
  proposedDate: string;
  pipelineStep: "Proposed" | "Explained" | "Accepted" | "In progress" | "Completed" | "Review";
  pipelineDates: {
    Proposed: string;
    Explained: string;
    Accepted: string;
    "In progress": string;
    Completed: string;
    Review: string;
  };
  options: TreatmentPlanOptionItem[];
  stages: TreatmentPlanStageItem[];
  costSummary: {
    planTotal: number;
    discount: number;
    insuranceEstimate: string;
    paidSoFar: number;
    balance: number;
    labCostInternal: number;
  };
  emiPlan: {
    active: boolean;
    installments: number;
    amountPerMonth: number;
    debitDay: number;
    lendingPartner: string;
  };
  engagement: {
    sentInfo: string;
    watchedInfo: string;
    acceptedInfo: string;
  };
}

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientMeta: string; // "34 F · DF-10482"
  date: string;
  contextSubtitle: string; // "After RCT 36 sitting 1 · 29 Sep"
  template: string;
  diagnosis: string;
  allergyAlert?: {
    blockedDrug: string;
    allergy: string;
    alternative: string;
    conditionNote: string;
  };
  medicines: {
    id: string;
    medicine: string;
    dose: string;
    frequency: string;
    days: string;
    instructions: string;
  }[];
  advice: string;
  nextVisit: string;
  signedDigitally: boolean;
  sentOnWhatsApp?: boolean;
}

export interface PostOpRecoveryRecord {
  id: string;
  patientId: string;
  patientName: string;
  procedure: string;
  procedureDate: string;
  doctor: string;
  dayLabel: string; // "Day 3"
  checkInsCompleted: ("D1" | "D3" | "D7")[];
  painScore: number | null;
  painHistory: { day: string; score: number }[];
  status: "Alert" | "No reply" | "On track" | "Closed";
  replyTimestamp?: string;
  symptomsSummary?: string;
  hasPhoto?: boolean;
  ruleMatched?: string;
  doctorNote?: string;
}

export interface BillingInvoiceRecord {
  id: string;
  invoiceNumber: string; // INV-SR-2026-04417
  patientName: string;
  method: string;
  amount: number;
  status: "Paid" | "EMI" | "Part paid" | "Refund";
  date: string;
  branch: string;
}

export interface RecoveryPlanRecord {
  id: string;
  patientId: string;
  patientName: string;
  pendingTreatment: string;
  value: number;
  idleDays: number;
  reason: "Cost" | "Unsure" | "Fear" | "Time" | "Unknown" | "Family";
  bucket: "proposed" | "accepted" | "started";
  nextAutomaticStep: string;
  status: "Active" | "Stopped" | "Recovered";
  lastMessagedDaysAgo: number;
}

export interface GapFillerCandidate {
  rank: number;
  patientId: string;
  patientName: string;
  needs: string;
  whyMatched: string;
  score: number;
  offerStatus: "Viewed" | "Sent" | "Declined" | "Wave 2" | "Confirmed";
  wave: 1 | 2;
}

export interface CampaignRecord {
  id: string;
  name: string;
  type: "Automation" | "Broadcast" | "Sequence";
  audience: string;
  sent: number | null;
  booked: number | null;
  status: "Live" | "Scheduled" | "Draft" | "Done";
}

export interface InventoryItemRecord {
  id: string;
  item: string;
  category: string;
  inStock: number;
  reorderAt: number;
  nearestExpiry: string;
  status: "Low" | "Expiring" | "OK" | "Transfer in";
  unitCost: number;
}

export interface ProcedureProfitRecord {
  procedure: string;
  profit: number;
  marginPct: number;
  breakdownNote: string;
  materialsBarPct: number;
  labBarPct: number;
  doctorBarPct: number;
  marginBarPct: number;
}

export interface LabCaseRecord {
  id: string;
  caseNumber: string; // LC-8841
  clinicBranch: string; // "Smile Studio · Station Rd"
  patientName: string;
  work: string;
  tooth: string;
  materialShade: string;
  labPartner: "Precision Dental Lab" | "Crown Craft" | "ALIGNER PARTNER";
  dueLabel: string;
  isOverdue?: boolean;
  status: "Impression / scan" | "Sent to lab" | "In fabrication" | "Received" | "Fitted / closed" | "Query sent";
  implantSystem?: string;
  abutment?: string;
  doctor: string;
  clinicDueDate: string;
  queryNotes?: string;
}

export interface SterilisationCycleRecord {
  id: string;
  cycleNumber: string; // #1419
  autoclave: string;
  startTime: string;
  parameters: string;
  kits: string[];
  indicator: string;
  result: "Pass" | "Running" | "Not logged" | "Fail";
}

export interface KitTraceUsage {
  kitCode: string;
  kitCategory: string;
  cycleNumber: string;
  cycleTime: string;
  patients: {
    patientName: string;
    procedure: string;
    time: string;
    chair: string;
  }[];
}

export interface StaffMemberCommission {
  id: string;
  name: string;
  role: string;
  branches: string;
  todayStatus: "Present" | "Visiting" | "Off" | "Leave";
  collections: number | null;
  payModel: string;
  payable: number | null;
  workingDetails: {
    subtitle: string;
    modelLabel: string;
    sharePct: string;
    minimumMonth: string;
    exceptions: { procedure: string; rule: string }[];
    collectionsPaid: number;
    lessLabCosts: number;
    netAmount: number;
    shareAmount: number;
    tdsNote: string;
    approved?: boolean;
  };
}

export interface VoiceCallRecord {
  id: string;
  callerLabel: string;
  timeAndLang: string;
  topic: string;
  outcome: "Booked" | "Answered" | "Urgent" | "Rescheduled" | "Transferred";
  headerTitle: string;
  headerMeta: string;
  tags: string[];
  messages: { sender: "AI receptionist" | "Caller"; text: string }[];
}

export interface SpecialistReferralItem {
  id: string;
  patientLabel: string;
  summary: string;
  fromInfo: string;
  status: "Pending" | "Accepted" | "Replied";
  adviceReply?: string;
}

export interface TenantAccountRecord {
  id: string;
  clinicGroup: string;
  branchesLabel: string;
  plan: "Growth" | "Starter" | "Chain" | "Trial";
  branchesCount: number;
  mrrLabel: string;
  whatsappCredits: number;
  lastActive: string;
  health: "Healthy" | "At risk" | "Trial" | "Overdue";
}

export interface DentflowAppState {
  activeRole: DentflowRoleKey;
  activeBranch: BranchName;
  patients: DentflowPatient[];
  appointments: ClinicAppointment[];
  needsAttention: NeedsAttentionItem[];
  treatmentPlans: TreatmentPlanRecord[];
  prescriptions: PrescriptionRecord[];
  postOpCases: PostOpRecoveryRecord[];
  invoices: BillingInvoiceRecord[];
  recoveryPlans: RecoveryPlanRecord[];
  gapFillerCandidates: GapFillerCandidate[];
  campaigns: CampaignRecord[];
  inventoryItems: InventoryItemRecord[];
  procedureProfits: ProcedureProfitRecord[];
  labCases: LabCaseRecord[];
  sterilisationCycles: SterilisationCycleRecord[];
  kitTraces: KitTraceUsage[];
  staffMembers: StaffMemberCommission[];
  voiceCalls: VoiceCallRecord[];
  voicePermissions: {
    bookAppointments: boolean;
    rescheduleCancel: boolean;
    quoteStandardFees: boolean;
    shareDirectionsHours: boolean;
    sendSelfCheckLink: boolean;
    discussMedicines: boolean;
  };
  rolePermissions: RolePermissionRow[];
  specialistReferrals: SpecialistReferralItem[];
  tenantAccounts: TenantAccountRecord[];
  dpdpAccessLogs: {
    id: string;
    timestamp: string;
    actor: string;
    role: string;
    patientName: string;
    screenId: string;
    action: string;
  }[];
  patientApp: {
    selectedPatientId: string;
    activeScreen:
      | "P01"
      | "P02"
      | "P03"
      | "P04"
      | "P05"
      | "P06"
      | "P07"
      | "P08"
      | "P09"
      | "P10"
      | "P11"
      | "P12"
      | "P13";
    alignerWornMinutesToday: number;
    alignerTimerRunning: boolean;
    alignerConsentPublic: boolean;
    selectedExplainerOption: "A" | "B" | "C";
    explainerLanguage: "हिन्दी" | "मराठी" | "EN";
    selfCheckSubmitted?: {
      area: string;
      pain: number;
      symptoms: string[];
      duration: string;
      urgency: "Routine" | "Soon" | "Today" | "Emergency";
    };
  };
}
