export interface Lead {
    id: string
    name: string
    mobile: string // Unique index, E.164 format (+91...)
    email?: string
    age?: number
    gender?: "Male" | "Female" | "Other"
    city?: string
    occupation?: string
    pain_area?: string // Free text / Tag picker
    condition?: string
    source: "Facebook" | "Google" | "Instagram" | "YouTube" | "WhatsApp" | "Doctor Referral" | "Walk-in" | "Health Camp" | "Corporate" | "Newspaper" | "QR Code"
    campaign_id?: string
    assigned_therapist_id?: string
    status: "New" | "Contacted" | "Interested" | "Consultation Booked" | "Assessment Done" | "Converted" | "Lost"
    lost_reason?: "Cost" | "Distance" | "No Response" | "Chose Competitor" | "Other" | string
    notes?: string
    branch_id: string
    created_at: string
    converted_at?: string
    patient_id?: string // Format: P-XXXX (only if Converted)
}

export interface ActivityLog {
    id: string
    lead_id: string
    type: "creation" | "status_change" | "call" | "sms" | "whatsapp" | "followup" | "conversion" | "edit"
    title: string
    description: string
    timestamp: string
    operator?: string
}

export interface Therapist {
    id: string
    name: string
    role: string
}

export interface Branch {
    id: string
    name: string
}

export interface Campaign {
    id: string
    name: string
    source: string
}

export const mockTherapists: Therapist[] = [
    { id: "ther-1", name: "Dr. Rahul Sharma", role: "Physiotherapist" },
    { id: "ther-2", name: "Dr. Kavita Rao", role: "Spine Specialist" },
    { id: "ther-3", name: "Dr. Rohan Joshi", role: "Sports Rehab Expert" },
    { id: "ther-4", name: "Dr. Sneha Patil", role: "Pediatric Physio" }
]

export const mockBranches: Branch[] = [
    { id: "br-1", name: "Mumbai - Andheri West" },
    { id: "br-2", name: "Mumbai - Bandra East" },
    { id: "br-3", name: "Delhi - Connaught Place" },
    { id: "br-4", name: "Bengaluru - Indiranagar" }
]

export const mockCampaigns: Campaign[] = [
    { id: "camp-1", name: "Summer Physio Special", source: "Facebook" },
    { id: "camp-2", name: "Google Search - Clinic Near Me", source: "Google" },
    { id: "camp-3", name: "Back Pain Recovery Reels", source: "Instagram" },
    { id: "camp-4", name: "Monsoon Fitness Challenge", source: "WhatsApp" }
]

export const initialLeads: Lead[] = [
    {
        id: "lead-1",
        name: "Rajesh Kumar",
        mobile: "+919876543210",
        email: "rajesh.kumar@gmail.com",
        age: 45,
        gender: "Male",
        city: "Mumbai",
        occupation: "Software Engineer",
        pain_area: "Lower Back, Sciatica",
        condition: "L4-L5 Herniated Disc",
        source: "Google",
        campaign_id: "camp-2",
        assigned_therapist_id: "ther-1",
        status: "Interested",
        notes: "Experiencing pain while sitting for long hours. Recommended posture correction assessment.",
        branch_id: "br-1",
        created_at: "2026-06-28T09:30:00Z"
    },
    {
        id: "lead-2",
        name: "Anjali Sharma",
        mobile: "+919123456789",
        email: "anjali.sharma@yahoo.com",
        age: 32,
        gender: "Female",
        city: "Mumbai",
        occupation: "Homemaker",
        pain_area: "Right Shoulder",
        condition: "Frozen Shoulder",
        source: "Facebook",
        campaign_id: "camp-1",
        assigned_therapist_id: "ther-2",
        status: "Consultation Booked",
        notes: "Pain since 3 months. Restrictive movement. Prefers morning appointments.",
        branch_id: "br-1",
        created_at: "2026-06-29T10:15:00Z"
    },
    {
        id: "lead-3",
        name: "Vikram Malhotra",
        mobile: "+919988776655",
        email: "vikram.m@outlook.com",
        age: 58,
        gender: "Male",
        city: "Delhi",
        occupation: "Business Owner",
        pain_area: "Both Knees",
        condition: "Osteoarthritis Stage 2",
        source: "Doctor Referral",
        assigned_therapist_id: "ther-3",
        status: "Contacted",
        notes: "Referred by Dr. Khanna. Pain increases during stairs climbing.",
        branch_id: "br-3",
        created_at: "2026-06-30T14:20:00Z"
    },
    {
        id: "lead-4",
        name: "Sneha Reddy",
        mobile: "+918877665544",
        email: "sneha.reddy@gmail.com",
        age: 26,
        gender: "Female",
        city: "Bengaluru",
        occupation: "UI Designer",
        pain_area: "Neck, Upper Back",
        condition: "Text Neck Syndrome",
        source: "Instagram",
        campaign_id: "camp-3",
        assigned_therapist_id: "ther-4",
        status: "New",
        notes: "Inquired via Instagram DM. Complaining of stiff neck and headaches.",
        branch_id: "br-4",
        created_at: "2026-07-01T02:10:00Z"
    },
    {
        id: "lead-5",
        name: "Amit Patel",
        mobile: "+917766554433",
        email: "amit.patel@gmail.com",
        age: 39,
        gender: "Male",
        city: "Mumbai",
        occupation: "Bank Manager",
        pain_area: "Left Ankle",
        condition: "Ankle Sprain Grade 2",
        source: "Walk-in",
        assigned_therapist_id: "ther-1",
        status: "Assessment Done",
        notes: "Sprained ankle during weekend football. Assessment done, recommended 10 sessions.",
        branch_id: "br-2",
        created_at: "2026-06-25T11:00:00Z"
    },
    {
        id: "lead-6",
        name: "Meera Sen",
        mobile: "+919898989898",
        email: "meera.sen@hotmail.com",
        age: 67,
        gender: "Female",
        city: "Mumbai",
        occupation: "Retired Teacher",
        pain_area: "Hip Joint",
        condition: "Post-THR Rehab",
        source: "Doctor Referral",
        assigned_therapist_id: "ther-2",
        status: "Converted",
        patient_id: "P-1002",
        converted_at: "2026-06-29T16:00:00Z",
        notes: "Had Total Hip Replacement 2 weeks back. Home care transitioned to clinic visits.",
        branch_id: "br-1",
        created_at: "2026-06-20T08:00:00Z"
    },
    {
        id: "lead-7",
        name: "Rohan Das",
        mobile: "+919000011111",
        email: "rohan.das@gmail.com",
        age: 29,
        gender: "Male",
        city: "Delhi",
        occupation: "Gym Trainer",
        pain_area: "Elbow",
        condition: "Tennis Elbow",
        source: "YouTube",
        status: "Lost",
        lost_reason: "Cost",
        notes: "Inquired about dry needling. Found pricing package higher than competitors.",
        branch_id: "br-3",
        created_at: "2026-06-24T12:00:00Z"
    }
]

export const initialActivities: ActivityLog[] = [
    {
        id: "act-1",
        lead_id: "lead-1",
        type: "creation",
        title: "Lead Created",
        description: "Lead automatically captured from Google Search campaign 'Google Search - Clinic Near Me'",
        timestamp: "2026-06-28T09:30:00Z",
        operator: "System"
    },
    {
        id: "act-2",
        lead_id: "lead-1",
        type: "whatsapp",
        title: "WhatsApp Welcome Sent",
        description: "Sent welcome message template automatically. Status: Delivered.",
        timestamp: "2026-06-28T09:31:00Z",
        operator: "System"
    },
    {
        id: "act-3",
        lead_id: "lead-1",
        type: "status_change",
        title: "Status Updated",
        description: "Changed status from New to Interested",
        timestamp: "2026-06-28T11:45:00Z",
        operator: "Dr. Rahul Sharma"
    },
    {
        id: "act-4",
        lead_id: "lead-2",
        type: "creation",
        title: "Lead Created",
        description: "Lead captured from Facebook campaign 'Summer Physio Special'",
        timestamp: "2026-06-29T10:15:00Z",
        operator: "System"
    },
    {
        id: "act-5",
        lead_id: "lead-2",
        type: "whatsapp",
        title: "WhatsApp Welcome Sent",
        description: "Sent welcome template via WhatsApp Business API",
        timestamp: "2026-06-29T10:15:30Z",
        operator: "System"
    },
    {
        id: "act-6",
        lead_id: "lead-2",
        type: "call",
        title: "Call Logged",
        description: "Outcome: Interested. Duration: 4m 12s. Notes: Patient wishes to book frozen shoulder treatment.",
        timestamp: "2026-06-29T11:00:00Z",
        operator: "Amit Verma"
    },
    {
        id: "act-7",
        lead_id: "lead-2",
        type: "status_change",
        title: "Status Updated",
        description: "Status set to Consultation Booked",
        timestamp: "2026-06-29T11:05:00Z",
        operator: "Amit Verma"
    },
    {
        id: "act-8",
        lead_id: "lead-6",
        type: "creation",
        title: "Lead Created",
        description: "Referral from Orthopedics Specialist",
        timestamp: "2026-06-20T08:00:00Z",
        operator: "System"
    },
    {
        id: "act-9",
        lead_id: "lead-6",
        type: "conversion",
        title: "Converted to Patient",
        description: "Lead successfully converted to Patient with ID P-1002.",
        timestamp: "2026-06-29T16:00:00Z",
        operator: "Dr. Kavita Rao"
    }
]
