export interface MedicalHistory {
    conditions: string
    surgeries: string
    allergies: string
    medications: string
}

export interface EmergencyContact {
    name: string
    relation: string
    phone: string
}

export interface TimelineEvent {
    id: string
    type: "appointment" | "payment" | "message" | "status_change" | "document" | "edit" | "creation"
    title: string
    description: string
    timestamp: string
    operator?: string
}

export interface DocumentItem {
    id: string
    name: string
    size: string
    uploadedAt: string
    type: string
    url: string
}

export interface InvoiceItem {
    id: string
    date: string
    amount: number
    status: "Paid" | "Unpaid" | "Partially Paid"
    description: string
}

export interface Patient {
    id: string
    name: string
    dob: string
    gender: string
    blood_group: string
    mobile: string
    alt_mobile?: string
    email: string
    occupation: string
    address: string
    height: number
    weight: number
    bmi: string
    bp: string
    condition: string
    assigned_therapist_id: string
    sessions_attended: number
    sessions_total: number
    last_visit: string
    balance: number
    status: "Active" | "Completed" | "On Hold"
    created_at: string
    medical_history: MedicalHistory
    emergency_contact: EmergencyContact
    documents: DocumentItem[]
    timeline: TimelineEvent[]
    invoices: InvoiceItem[]
}

export interface Therapist {
    id: string
    name: string
    role: string
}

export const mockTherapists: Therapist[] = [
    { id: "ther-1", name: "Dr. Rahul Sharma", role: "Physiotherapist" },
    { id: "ther-2", name: "Dr. Kavita Rao", role: "Spine Specialist" },
    { id: "ther-3", name: "Dr. Rohan Joshi", role: "Sports Rehab Expert" },
    { id: "ther-4", name: "Dr. Sneha Patil", role: "Pediatric Physio" },
    { id: "ther-5", name: "Dr. Ankita", role: "Orthopedic Physio" },
    { id: "ther-6", name: "Dr. Priya", role: "Neuro Rehab Expert" }
]

export const initialPatients: Patient[] = [
    {
        id: "P-0142",
        name: "Ravi Kumar",
        dob: "1981-03-15",
        gender: "Male",
        blood_group: "B+",
        mobile: "+91 98765 43210",
        alt_mobile: "",
        email: "ravi@email.com",
        occupation: "Software Engineer",
        address: "404 Andheri West, Mumbai – 400053",
        height: 174,
        weight: 82,
        bmi: "27.1 (Overweight)",
        bp: "126/82",
        condition: "Knee OA",
        assigned_therapist_id: "ther-5",
        sessions_attended: 8,
        sessions_total: 15,
        last_visit: "Jun 12",
        balance: 2500,
        status: "Active",
        created_at: "2026-05-10T10:00:00Z",
        medical_history: {
            conditions: "Type 2 Diabetes (controlled), Hypertension",
            surgeries: "Right knee arthroscopy – 2019",
            allergies: "Penicillin",
            medications: "Metformin 500mg BD, Amlodipine 5mg OD"
        },
        emergency_contact: {
            name: "Sita Kumar",
            relation: "Wife",
            phone: "+91 99887 65432"
        },
        documents: [
            { id: "doc-1", name: "Knee_Xray_Left.jpg", size: "2.4 MB", uploadedAt: "2026-05-11", type: "JPG", url: "#" },
            { id: "doc-2", name: "MRI_Report_May2026.pdf", size: "4.8 MB", uploadedAt: "2026-05-15", type: "PDF", url: "#" }
        ],
        timeline: [
            { id: "t-1", type: "creation", title: "Patient Registered", description: "Created patient record sequentially from Lead conversion.", timestamp: "2026-05-10T10:00:00Z", operator: "System" },
            { id: "t-2", type: "appointment", title: "Initial Assessment Completed", description: "Initial knee assessment completed by Dr. Ankita. Pain score recorded as 7/10.", timestamp: "2026-05-11T11:30:00Z", operator: "Dr. Ankita" },
            { id: "t-3", type: "payment", title: "Payment Collected - ₹12,000", description: "Advance for 15 sessions package. Mode: UPI.", timestamp: "2026-05-11T12:00:00Z", operator: "Amit Verma" },
            { id: "t-4", type: "message", title: "WhatsApp Welcome Sent", description: "Automated greeting and login details dispatched.", timestamp: "2026-05-11T12:05:00Z", operator: "System" }
        ],
        invoices: [
            { id: "inv-1", date: "2026-05-11", amount: 14500, status: "Partially Paid", description: "15 sessions Package + Consultation fee (₹2,500 due)" }
        ]
    },
    {
        id: "P-0141",
        name: "Meera Shah",
        dob: "1988-08-20",
        gender: "Female",
        blood_group: "O+",
        mobile: "+91 91234 56789",
        alt_mobile: "",
        email: "meera.shah@gmail.com",
        occupation: "Graphic Designer",
        address: "101 Bandra West, Mumbai – 400050",
        height: 162,
        weight: 58,
        bmi: "22.1 (Normal)",
        bp: "118/76",
        condition: "Frozen Shoulder",
        assigned_therapist_id: "ther-6",
        sessions_attended: 5,
        sessions_total: 10,
        last_visit: "Jun 11",
        balance: 0,
        status: "Active",
        created_at: "2026-05-20T14:30:00Z",
        medical_history: {
            conditions: "Hypothyroidism",
            surgeries: "None",
            allergies: "Sulfonamides",
            medications: "Thyronorm 50mcg OD"
        },
        emergency_contact: {
            name: "Rajesh Shah",
            relation: "Husband",
            phone: "+91 99776 55443"
        },
        documents: [
            { id: "doc-3", name: "Shoulder_USG.pdf", size: "1.8 MB", uploadedAt: "2026-05-21", type: "PDF", url: "#" }
        ],
        timeline: [
            { id: "t-5", type: "creation", title: "Patient Registered", description: "Registered directly at clinic front-desk.", timestamp: "2026-05-20T14:30:00Z", operator: "Amit Verma" },
            { id: "t-6", type: "payment", title: "Payment Collected - ₹10,000", description: "Full payment for 10 sessions package. Mode: Card.", timestamp: "2026-05-21T10:00:00Z", operator: "Amit Verma" }
        ],
        invoices: [
            { id: "inv-2", date: "2026-05-21", amount: 10000, status: "Paid", description: "10 sessions Frozen Shoulder package" }
        ]
    },
    {
        id: "P-0139",
        name: "Arjun Singh",
        dob: "1997-11-05",
        gender: "Male",
        blood_group: "A+",
        mobile: "+91 98989 89898",
        alt_mobile: "",
        email: "arjun.singh@gmail.com",
        occupation: "Professional Athlete",
        address: "702 Indiranagar, Bengaluru – 560038",
        height: 185,
        weight: 78,
        bmi: "22.8 (Normal)",
        bp: "120/70",
        condition: "Sports Knee",
        assigned_therapist_id: "ther-5",
        sessions_attended: 10,
        sessions_total: 10,
        last_visit: "May 30",
        balance: 0,
        status: "Completed",
        created_at: "2026-04-10T09:00:00Z",
        medical_history: {
            conditions: "Athletic - High fitness",
            surgeries: "ACL Reconstruction - 2024",
            allergies: "None",
            medications: "Multivitamins"
        },
        emergency_contact: {
            name: "Karan Singh",
            relation: "Father",
            phone: "+91 98888 77777"
        },
        documents: [
            { id: "doc-4", name: "ACL_Discharge_Summary.pdf", size: "3.2 MB", uploadedAt: "2026-04-11", type: "PDF", url: "#" }
        ],
        timeline: [
            { id: "t-7", type: "creation", title: "Patient Registered", description: "Sports rehab protocol registered.", timestamp: "2026-04-10T09:00:00Z", operator: "System" },
            { id: "t-8", type: "status_change", title: "Treatment Completed", description: "Discharged after successfully completing 10/10 sessions.", timestamp: "2026-05-30T16:00:00Z", operator: "Dr. Ankita" }
        ],
        invoices: [
            { id: "inv-3", date: "2026-04-10", amount: 15000, status: "Paid", description: "10 sessions Athlete ACL Rehab protocol" }
        ]
    }
]
