export interface Campaign {
    id: string
    campaign_name: string
    source: "Facebook" | "Google" | "Instagram" | "YouTube" | "WhatsApp" | "Doctor Referral" | "Walk-in" | "Health Camp" | "Corporate" | "Newspaper" | "QR Code"
    budget: number
    leads: number
    converted: number
    revenue: number
    status: "Active" | "Paused" | "Completed" | "Draft"
    start_date: string
    end_date: string | null
    target_condition?: string
    landing_page_url?: string
    assigned_staff_id?: string
    branch_id: string
    notes?: string
    created_by: string
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    name: string
    role: string
}

export interface Branch {
    id: string
    name: string
}

export const mockUsers: User[] = [
    { id: "usr-1", name: "Dr. Rahul Sharma", role: "Physiotherapist" },
    { id: "usr-2", name: "Priya Patel", role: "Marketing Lead" },
    { id: "usr-3", name: "Amit Verma", role: "Clinic Coordinator" },
    { id: "usr-4", name: "Siddharth Sen", role: "Senior Consultant" }
]

export const mockBranches: Branch[] = [
    { id: "br-1", name: "Mumbai - Andheri West" },
    { id: "br-2", name: "Mumbai - Bandra East" },
    { id: "br-3", name: "Delhi - Connaught Place" },
    { id: "br-4", name: "Bengaluru - Indiranagar" }
]

export async function fetchMockUsers(): Promise<User[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockUsers)
        }, 800)
    })
}

export async function fetchMockBranches(): Promise<Branch[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockBranches)
        }, 600)
    })
}

export const mockCampaigns: Campaign[] = [
    {
        id: "camp-1",
        campaign_name: "Summer Physio Special",
        source: "Facebook",
        budget: 45000,
        leads: 320,
        converted: 48,
        revenue: 144000,
        status: "Active",
        start_date: "2026-05-01",
        end_date: "2026-08-31",
        target_condition: "Knee pain, Shoulder stiffness",
        landing_page_url: "https://clinic.com/summer-special",
        assigned_staff_id: "usr-2",
        branch_id: "br-1",
        notes: "Targeting people aged 35-60 in Andheri West area.",
        created_by: "usr-1",
        created_at: "2026-04-28T10:00:00Z",
        updated_at: "2026-04-28T10:00:00Z",
    },
    {
        id: "camp-2",
        campaign_name: "Google Search - Clinic Near Me",
        source: "Google",
        budget: 80000,
        leads: 450,
        converted: 90,
        revenue: 315000,
        status: "Active",
        start_date: "2026-01-10",
        end_date: null,
        target_condition: "Back pain, Neck pain, General physio",
        landing_page_url: "https://clinic.com/search-leads",
        assigned_staff_id: "usr-3",
        branch_id: "br-1",
        notes: "Always-on search campaign with high intent keywords.",
        created_by: "usr-1",
        created_at: "2026-01-09T08:30:00Z",
        updated_at: "2026-01-09T08:30:00Z",
    },
    {
        id: "camp-3",
        campaign_name: "Corporate Health Workshops",
        source: "Corporate",
        budget: 60000,
        leads: 120,
        converted: 15,
        revenue: 180000,
        status: "Active",
        start_date: "2026-04-15",
        end_date: "2026-07-15",
        target_condition: "Ergonomics, Posture alignment",
        landing_page_url: "https://clinic.com/corporate-wellness",
        assigned_staff_id: "usr-4",
        branch_id: "br-2",
        notes: "B2B reach out to corporate offices in Bandra Kurla Complex.",
        created_by: "usr-2",
        created_at: "2026-04-10T12:00:00Z",
        updated_at: "2026-04-10T12:00:00Z",
    },
    {
        id: "camp-4",
        campaign_name: "Back Pain Recovery Reels",
        source: "Instagram",
        budget: 25000,
        leads: 210,
        converted: 32,
        revenue: 85000,
        status: "Active",
        start_date: "2026-06-01",
        end_date: "2026-07-31",
        target_condition: "Back pain, Spine alignment",
        landing_page_url: "https://clinic.com/back-pain-rehab",
        assigned_staff_id: "usr-2",
        branch_id: "br-1",
        notes: "Video campaign featuring exercise tutorials.",
        created_by: "usr-2",
        created_at: "2026-05-28T09:15:00Z",
        updated_at: "2026-05-28T09:15:00Z",
    },
    {
        id: "camp-5",
        campaign_name: "Posture Correction Exercises",
        source: "YouTube",
        budget: 35000,
        leads: 180,
        converted: 22,
        revenue: 54000,
        status: "Paused",
        start_date: "2026-03-01",
        end_date: "2026-05-31",
        target_condition: "Posture correction, Kyphosis",
        landing_page_url: "https://clinic.com/posture-rehab",
        assigned_staff_id: "usr-3",
        branch_id: "br-3",
        notes: "YouTube bumper and in-stream ads.",
        created_by: "usr-1",
        created_at: "2026-02-25T14:40:00Z",
        updated_at: "2026-03-15T11:00:00Z",
    },
    {
        id: "camp-6",
        campaign_name: "Q2 Health Checkup Drive",
        source: "Health Camp",
        budget: 50000,
        leads: 280,
        converted: 42,
        revenue: 110000,
        status: "Completed",
        start_date: "2026-04-01",
        end_date: "2026-06-30",
        target_condition: "General assessment, Bone density",
        landing_page_url: "https://clinic.com/q2-health-checkup",
        assigned_staff_id: "usr-4",
        branch_id: "br-2",
        notes: "Physical camps conducted inside societies.",
        created_by: "usr-3",
        created_at: "2026-03-25T16:00:00Z",
        updated_at: "2026-06-30T18:00:00Z",
    },
    {
        id: "camp-7",
        campaign_name: "Doctor Referral Network",
        source: "Doctor Referral",
        budget: 30000,
        leads: 85,
        converted: 12,
        revenue: 45000,
        status: "Completed",
        start_date: "2026-05-10",
        end_date: "2026-06-10",
        target_condition: "Post-surgery rehab, Joint replacement",
        landing_page_url: "",
        assigned_staff_id: "usr-1",
        branch_id: "br-3",
        notes: "Referral flyers and packages sent to local orthopedic clinics.",
        created_by: "usr-1",
        created_at: "2026-05-05T11:20:00Z",
        updated_at: "2026-06-10T17:00:00Z",
    },
    {
        id: "camp-8",
        campaign_name: "Monsoon Fitness Challenge",
        source: "WhatsApp",
        budget: 15000,
        leads: 95,
        converted: 14,
        revenue: 28000,
        status: "Draft",
        start_date: "2026-07-15",
        end_date: "2026-08-15",
        target_condition: "Core strength, Cardiorespiratory fitness",
        landing_page_url: "https://clinic.com/monsoon-challenge",
        assigned_staff_id: "usr-2",
        branch_id: "br-2",
        notes: "WhatsApp broadcasts to existing inactive patients.",
        created_by: "usr-2",
        created_at: "2026-06-25T10:00:00Z",
        updated_at: "2026-06-25T10:00:00Z",
    },
    {
        id: "camp-9",
        campaign_name: "Walk-in Desk Flyers",
        source: "Walk-in",
        budget: 12000,
        leads: 65,
        converted: 8,
        revenue: 16000,
        status: "Paused",
        start_date: "2026-02-15",
        end_date: "2026-04-15",
        target_condition: "Knee pain, Arthritis",
        landing_page_url: "",
        assigned_staff_id: "usr-3",
        branch_id: "br-1",
        notes: "In-clinic banners and brochure stands.",
        created_by: "usr-3",
        created_at: "2026-02-10T09:00:00Z",
        updated_at: "2026-04-15T18:00:00Z",
    },
    {
        id: "camp-10",
        campaign_name: "Newspaper Ad - Spine Alignment",
        source: "Newspaper",
        budget: 100000,
        leads: 620,
        converted: 115,
        revenue: 420000,
        status: "Active",
        start_date: "2026-02-01",
        end_date: "2026-11-30",
        target_condition: "Spine alignment, Chronic back pain",
        landing_page_url: "",
        assigned_staff_id: "usr-4",
        branch_id: "br-3",
        notes: "Sunday insert in local newspapers.",
        created_by: "usr-1",
        created_at: "2026-01-20T10:15:00Z",
        updated_at: "2026-01-20T10:15:00Z",
    }
]
