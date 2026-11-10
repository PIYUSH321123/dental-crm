export interface MedicalHistory {
  conditions: string;
  surgeries: string;
  allergies: string;
  medications: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface TimelineEvent {
  id: string;
  type: "appointment" | "payment" | "message" | "status_change" | "document" | "edit" | "creation";
  title: string;
  description: string;
  timestamp: string;
  operator?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type: string;
  url: string;
}

export interface InvoiceItem {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Partially Paid";
  description: string;
}

export interface SeedPatient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  blood_group: string;
  mobile: string;
  alt_mobile?: string;
  email: string;
  occupation: string;
  address: string;
  height: number;
  weight: number;
  bmi: string;
  bp: string;
  condition: string;
  assigned_therapist_id: string;
  sessions_attended: number;
  sessions_total: number;
  last_visit: string;
  balance: number;
  status: "Active" | "Completed" | "On Hold";
  created_at: string;
  medical_history: MedicalHistory;
  emergency_contact: EmergencyContact;
  documents: DocumentItem[];
  timeline: TimelineEvent[];
  invoices: InvoiceItem[];
}

export interface SeedDoctor {
  id: string;
  name: string;
  role: string;
}

export const mockTherapists: SeedDoctor[] = [
  { id: "doc-1", name: "Dr. Sneha Kulkarni", role: "Chief Dentist" },
  { id: "doc-2", name: "Dr. Arjun Mehta", role: "Restorative Dentist" },
  { id: "doc-3", name: "Dr. Farhan Ali", role: "Implantologist" },
  { id: "doc-4", name: "Dr. Karan Shah", role: "Orthodontist" },
];

export const initialPatients: SeedPatient[] = [
  {
    id: "PT-10482",
    name: "Priya Deshmukh",
    dob: "1992-04-12",
    gender: "Female",
    blood_group: "B+",
    mobile: "+91 98200 11210",
    alt_mobile: "",
    email: "priya.deshmukh@example.in",
    occupation: "Architect",
    address: "Station Road, Pune – 411001",
    height: 164,
    weight: 60,
    bmi: "22.3 (Normal)",
    bp: "120/78",
    condition: "Deep caries 36 — RCT + crown planned",
    assigned_therapist_id: "doc-1",
    sessions_attended: 2,
    sessions_total: 3,
    last_visit: "29 Sep",
    balance: 15000,
    status: "Active",
    created_at: "2026-09-10T10:00:00Z",
    medical_history: {
      conditions: "Type 2 diabetes, controlled",
      surgeries: "None",
      allergies: "Penicillin",
      medications: "Metformin 500 mg BD",
    },
    emergency_contact: {
      name: "Rohit Deshmukh",
      relation: "Husband",
      phone: "+91 98200 11211",
    },
    documents: [
      { id: "doc-1", name: "IOPA_36.jpg", size: "1.4 MB", uploadedAt: "2026-09-12", type: "JPG", url: "#" },
      { id: "doc-2", name: "OPG_Sep2026.pdf", size: "3.2 MB", uploadedAt: "2026-09-12", type: "PDF", url: "#" },
    ],
    timeline: [
      {
        id: "t-1",
        type: "creation",
        title: "Patient Registered",
        description: "Registered at Station Road branch.",
        timestamp: "2026-09-10T10:00:00Z",
        operator: "Front desk",
      },
      {
        id: "t-2",
        type: "appointment",
        title: "RCT 36 Sitting 1 Completed",
        description: "Completed by Dr. Sneha Kulkarni.",
        timestamp: "2026-09-29T10:30:00Z",
        operator: "Dr. Sneha Kulkarni",
      },
    ],
    invoices: [
      {
        id: "inv-1",
        date: "2026-09-12",
        amount: 24000,
        status: "Partially Paid",
        description: "RCT 36 + Zirconia Crown plan (₹9,000 paid)",
      },
    ],
  },
  {
    id: "PT-10519",
    name: "Rohan Mehta",
    dob: "1985-08-20",
    gender: "Male",
    blood_group: "O+",
    mobile: "+91 98200 22412",
    alt_mobile: "",
    email: "rohan.mehta@example.in",
    occupation: "Consultant",
    address: "Civil Lines, Pune – 411004",
    height: 175,
    weight: 74,
    bmi: "24.2 (Normal)",
    bp: "124/80",
    condition: "Impacted 48 extraction recovery",
    assigned_therapist_id: "doc-3",
    sessions_attended: 1,
    sessions_total: 2,
    last_visit: "26 Sep",
    balance: 0,
    status: "Active",
    created_at: "2026-09-20T14:30:00Z",
    medical_history: {
      conditions: "None",
      surgeries: "Lower right third molar removal",
      allergies: "None",
      medications: "Post-op analgesics",
    },
    emergency_contact: {
      name: "Neha Mehta",
      relation: "Wife",
      phone: "+91 98200 22413",
    },
    documents: [],
    timeline: [
      {
        id: "t-5",
        type: "creation",
        title: "Patient Registered",
        description: "Registered at Station Road branch.",
        timestamp: "2026-09-20T14:30:00Z",
        operator: "Front desk",
      },
    ],
    invoices: [
      {
        id: "inv-2",
        date: "2026-09-26",
        amount: 6500,
        status: "Paid",
        description: "Surgical extraction tooth 48",
      },
    ],
  },
];

