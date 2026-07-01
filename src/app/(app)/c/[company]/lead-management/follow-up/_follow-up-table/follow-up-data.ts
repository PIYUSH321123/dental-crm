export interface FollowUp {
    id: string
    lead_id: string
    lead_name: string
    lead_mobile: string
    type: "Call" | "WhatsApp" | "SMS"
    due_at: string // ISO string
    status: "Pending" | "Completed"
    outcome?: "Answered" | "Not Answered" | "Interested" | "Not Interested" | "Callback"
    notes?: string
    assigned_to_id: string // therapist id
    last_activity?: string
    completed_at?: string
    category?: "today" | "overdue" | "upcoming" | "completed" | "all"
}

export interface AutomationRule {
    id: string
    trigger: string
    delay: string
    action: string
    template: string
    status: "ON" | "OFF"
}

export interface ChatMessage {
    id: string
    sender: "agent" | "lead"
    text: string
    timestamp: string
    isTemplate?: boolean
}

// Initial Mock Follow-ups
export const defaultFollowUps = (): FollowUp[] => {
    const today = new Date()
    return [
        {
            id: "fw-1",
            lead_id: "lead-1",
            lead_name: "Rajesh Kumar",
            lead_mobile: "+919876543210",
            type: "Call",
            due_at: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), // Today 10:00 AM
            status: "Pending",
            assigned_to_id: "ther-1", // Dr. Rahul Sharma
            last_activity: "WhatsApp sent 3d ago"
        },
        {
            id: "fw-2",
            lead_id: "lead-2",
            lead_name: "Anjali Sharma",
            lead_mobile: "+919123456789",
            type: "WhatsApp",
            due_at: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), // Today 2:00 PM
            status: "Pending",
            assigned_to_id: "ther-2", // Dr. Kavita Rao
            last_activity: "Called 5d ago"
        },
        {
            id: "fw-3",
            lead_id: "lead-3",
            lead_name: "Vikram Malhotra",
            lead_mobile: "+919988776655",
            type: "Call",
            due_at: new Date(today.getTime() - 26 * 60 * 60 * 1000).toISOString(), // Yesterday (Overdue)
            status: "Pending",
            assigned_to_id: "ther-3", // Dr. Rohan Joshi
            last_activity: "Created 4d ago"
        },
        {
            id: "fw-4",
            lead_id: "lead-4",
            lead_name: "Sneha Reddy",
            lead_mobile: "+918877665544",
            type: "WhatsApp",
            due_at: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            status: "Pending",
            assigned_to_id: "ther-4", // Dr. Sneha Patil
            last_activity: "Created 3h ago"
        },
        {
            id: "fw-5",
            lead_id: "lead-5",
            lead_name: "Amit Patel",
            lead_mobile: "+917766554433",
            type: "SMS",
            due_at: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // In 2 Days
            status: "Pending",
            assigned_to_id: "ther-1", // Dr. Rahul Sharma
            last_activity: "Assessment Done 6d ago"
        }
    ]
}

export const defaultAutomationRules = (): AutomationRule[] => [
    { id: "rule-1", trigger: "New Lead Created", delay: "Immediate", action: "WhatsApp", template: "Welcome Message", status: "ON" },
    { id: "rule-2", trigger: "Lead Not Contacted", delay: "24 hours", action: "Alert Staff", template: "Reminder to call", status: "ON" },
    { id: "rule-3", trigger: "No Response After Call", delay: "48 hours", action: "WhatsApp", template: "Follow-up Template 1", status: "ON" },
    { id: "rule-4", trigger: "Missed Appointment", delay: "2 hours", action: "SMS + WA", template: "Reschedule Request", status: "ON" },
    { id: "rule-5", trigger: "Consultation Booked", delay: "1 day before", action: "WhatsApp + SMS", template: "Appointment Reminder", status: "ON" },
    { id: "rule-6", trigger: "Lead Inactive 7 days", delay: "7 days", action: "WhatsApp", template: "Re-engagement Offer", status: "OFF" }
]

export const defaultChats = (): Record<string, ChatMessage[]> => ({
    "lead-1": [
        { id: "m1", sender: "agent", text: "Hello Rajesh, thank you for reaching out to PhysioYoga. I noticed you inquired about L4-L5 herniated disc treatment. How can we assist you today?", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "m2", sender: "lead", text: "Hi doctor, I have severe pain while sitting. Do you provide home care assessment?", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 300000).toISOString() },
        { id: "m3", sender: "agent", text: "Yes, we do! However, for herniated disc cases, we recommend an initial clinic assessment for precise diagnosis. We can schedule a time for you.", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 600000).toISOString() }
    ],
    "lead-2": [
        { id: "m4", sender: "agent", text: "Hi Anjali, welcome to PhysioYoga! Let us know if you would like to book an assessment for frozen shoulder.", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "m5", sender: "lead", text: "Thanks, yes, I want to book. Can I get a slot this weekend?", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 120000).toISOString() }
    ],
    "lead-3": [
        { id: "m6", sender: "agent", text: "Hello Vikram, this is Dr. Rohan from PhysioYoga. Regarding your knee osteoarthritis reference, when would be a good time to connect?", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
    ],
    "lead-4": [
        { id: "m7", sender: "agent", text: "Welcome Sneha! We received your inquiry regarding neck and upper back stiffness. What times work best for a callback?", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() }
    ]
})
