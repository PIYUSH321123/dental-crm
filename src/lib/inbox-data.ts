export type InboxChannel = "whatsapp" | "email" | "sms" | "internal"

export interface InboxMessage {
    id: string
    senderName: string
    senderRole?: "patient" | "doctor" | "receptionist" | "system"
    avatar?: string
    channel: InboxChannel
    content: string
    timestamp: string
    isOutgoing: boolean
    status?: "sent" | "delivered" | "read"
    attachments?: { name: string; size: string; type: string }[]
    mentions?: string[]
}

export interface PatientClinicalContext {
    patientId: string
    name: string
    phone: string
    email: string
    age: number
    gender: string
    condition: string
    nextAppointment?: string
    assignedDoctor: string
    lastSession: string
    status: "Active" | "Recovery" | "New"
}

export interface InboxThread {
    id: string
    patientContext: PatientClinicalContext
    channel: InboxChannel
    subject?: string
    snippet: string
    unreadCount: number
    isStarred: boolean
    isArchived: boolean
    isUrgent?: boolean
    assignedStaff: string
    updatedAt: string
    messages: InboxMessage[]
}

export interface CannedTemplate {
    id: string
    title: string
    category: "Appointments" | "Clinical" | "Billing" | "General"
    content: string
}

export const CANNED_TEMPLATES: CannedTemplate[] = [
    {
        id: "appt-confirm",
        title: "Appointment Confirmation",
        category: "Appointments",
        content: "Hello [Patient Name], your upcoming therapy session at PhysioYoga is confirmed for tomorrow at [Time]. Please arrive 10 minutes early in comfortable clothing. Let us know if you need to adjust your slot."
    },
    {
        id: "post-exercise",
        title: "Post-Session Exercise Reminder",
        category: "Clinical",
        content: "Hi [Patient Name], following your session today, please ensure you perform the prescribed knee flexion stretches twice daily (10 reps each). If you experience pain exceeding 4/10, pause and notify us."
    },
    {
        id: "reschedule-slots",
        title: "Reschedule Options Available",
        category: "Appointments",
        content: "Hi [Patient Name], we have openings for your reschedule request: Thursday at 3:30 PM or Friday at 11:00 AM with Dr. Priya. Please reply with your preferred slot."
    },
    {
        id: "invoice-link",
        title: "Invoice & Payment Receipt",
        category: "Billing",
        content: "Hello [Patient Name], thank you for visiting PhysioYoga Clinic. You can view your invoice and make a secure online payment via our patient portal link: https://physioyoga.clinic/portal/billing"
    },
    {
        id: "urgent-symptoms",
        title: "Urgent Symptoms Escalation",
        category: "Clinical",
        content: "Dear [Patient Name], thank you for flagging your symptoms. Our Senior Physical Therapist has been notified. Please ice the affected joint for 15 minutes. If symptoms worsen, please call our emergency desk directly."
    }
]

export const CLINIC_STAFF = [
    { id: "staff-1", name: "Dr. Priya Sharma", role: "Lead Physiotherapist", avatar: "PS" },
    { id: "staff-2", name: "Dr. Sameer Joshi", role: "Sports Rehabilitation Specialist", avatar: "SJ" },
    { id: "staff-3", name: "Ananya Desai", role: "Clinic Coordinator", avatar: "AD" },
    { id: "staff-4", name: "Rohan Varma", role: "Physical Therapist", avatar: "RV" }
]

export const INITIAL_INBOX_THREADS: InboxThread[] = [
    {
        id: "thread-1",
        patientContext: {
            patientId: "PAT-1082",
            name: "Rahul Sharma",
            phone: "+91 98201 44521",
            email: "rahul.sharma92@gmail.com",
            age: 34,
            gender: "Male",
            condition: "ACL Reconstruction Post-Op (Week 6)",
            nextAppointment: "Tomorrow, 10:30 AM",
            assignedDoctor: "Dr. Priya Sharma",
            lastSession: "2 days ago",
            status: "Active"
        },
        channel: "whatsapp",
        snippet: "Doctor, I felt a slight twinge in my right knee after doing the quad sets yesterday evening. Should I continue?",
        unreadCount: 2,
        isStarred: true,
        isUrgent: true,
        isArchived: false,
        assignedStaff: "Dr. Priya Sharma",
        updatedAt: "10 mins ago",
        messages: [
            {
                id: "msg-101",
                senderName: "Dr. Priya Sharma",
                senderRole: "doctor",
                channel: "whatsapp",
                content: "Hello Rahul! How is the knee feeling after the manual therapy session on Tuesday?",
                timestamp: "Yesterday, 4:15 PM",
                isOutgoing: true,
                status: "read"
            },
            {
                id: "msg-102",
                senderName: "Rahul Sharma",
                senderRole: "patient",
                channel: "whatsapp",
                content: "It felt much lighter! But I felt a slight twinge in my right knee after doing the quad sets yesterday evening. Should I continue today?",
                timestamp: "10:20 AM",
                isOutgoing: false
            },
            {
                id: "msg-103",
                senderName: "Rahul Sharma",
                senderRole: "patient",
                channel: "whatsapp",
                content: "Also, here is the short video of my walking gait as requested.",
                timestamp: "10:22 AM",
                isOutgoing: false,
                attachments: [{ name: "gait_video_week6.mp4", size: "4.2 MB", type: "video" }]
            }
        ]
    },
    {
        id: "thread-2",
        patientContext: {
            patientId: "PAT-1044",
            name: "Meera Patel",
            phone: "+91 97112 33400",
            email: "meera.patel.design@outlook.com",
            age: 29,
            gender: "Female",
            condition: "Cervical Spondylosis & Posture Ergonomics",
            nextAppointment: "Friday, 04:00 PM",
            assignedDoctor: "Dr. Sameer Joshi",
            lastSession: "5 days ago",
            status: "Active"
        },
        channel: "email",
        subject: "Request to Reschedule Friday Physiotherapy Session",
        snippet: "Hi Team, I have an urgent client call on Friday at 4 PM. Can we move my ergonomic alignment session to Saturday morning?",
        unreadCount: 1,
        isStarred: false,
        isUrgent: false,
        isArchived: false,
        assignedStaff: "Ananya Desai",
        updatedAt: "25 mins ago",
        messages: [
            {
                id: "msg-201",
                senderName: "Meera Patel",
                senderRole: "patient",
                channel: "email",
                content: "Hi Team,\n\nI have an unexpected client presentation this Friday at 4 PM. Could we move my cervical posture alignment session with Dr. Sameer to Saturday between 10:00 AM - 12:00 PM?\n\nBest regards,\nMeera Patel",
                timestamp: "09:55 AM",
                isOutgoing: false
            }
        ]
    },
    {
        id: "thread-3",
        patientContext: {
            patientId: "PAT-1090",
            name: "Vikram Malhotra",
            phone: "+91 99402 18765",
            email: "v.malhotra@zenithcorp.in",
            age: 46,
            gender: "Male",
            condition: "Lumbar Disc Herniation L4-L5",
            nextAppointment: "Today, 02:00 PM",
            assignedDoctor: "Dr. Priya Sharma",
            lastSession: "1 week ago",
            status: "Active"
        },
        channel: "internal",
        subject: "Clinical Handover: Pre-session MRI Review",
        snippet: "Note from Reception: Patient brought updated Lumbar Spine MRI disc from Apollo Hospital. Kept on Dr. Priya's desk.",
        unreadCount: 1,
        isStarred: true,
        isUrgent: false,
        isArchived: false,
        assignedStaff: "Dr. Priya Sharma",
        updatedAt: "1 hour ago",
        messages: [
            {
                id: "msg-301",
                senderName: "Ananya Desai",
                senderRole: "receptionist",
                channel: "internal",
                content: "@Dr. Priya Sharma Patient Vikram Malhotra dropped off his updated 3T Lumbar MRI reports & CD at the front desk. He mentioned reduced morning stiffness. Physical copy is placed in File Tray #4.",
                timestamp: "09:15 AM",
                isOutgoing: false,
                mentions: ["Dr. Priya Sharma"]
            }
        ]
    },
    {
        id: "thread-4",
        patientContext: {
            patientId: "PAT-1015",
            name: "Sneha Reddy",
            phone: "+91 94481 29831",
            email: "sneha.reddy@techsol.com",
            age: 41,
            gender: "Female",
            condition: "Frozen Shoulder (Adhesive Capsulitis - Stage 2)",
            nextAppointment: "Saturday, 11:30 AM",
            assignedDoctor: "Dr. Sameer Joshi",
            lastSession: "3 days ago",
            status: "Active"
        },
        channel: "sms",
        snippet: "Thank you for the session summary. Range of motion feels 20% better with the pulley exercises.",
        unreadCount: 0,
        isStarred: false,
        isUrgent: false,
        isArchived: false,
        assignedStaff: "Dr. Sameer Joshi",
        updatedAt: "3 hours ago",
        messages: [
            {
                id: "msg-401",
                senderName: "PhysioYoga Automated SMS",
                senderRole: "system",
                channel: "sms",
                content: "PhysioYoga Reminder: Sneha, your shoulder mobilization session is on Sat 11:30 AM. Reply YES to confirm or CALL to reschedule.",
                timestamp: "Yesterday, 06:00 PM",
                isOutgoing: true,
                status: "delivered"
            },
            {
                id: "msg-402",
                senderName: "Sneha Reddy",
                senderRole: "patient",
                channel: "sms",
                content: "YES. Thank you for the session summary. Range of motion feels 20% better with the pulley exercises.",
                timestamp: "07:30 AM",
                isOutgoing: false
            }
        ]
    },
    {
        id: "thread-5",
        patientContext: {
            patientId: "PAT-1104",
            name: "Arjun Nambiar",
            phone: "+91 98860 77123",
            email: "arjun.nambiar@creatives.co",
            age: 26,
            gender: "Male",
            condition: "Rotator Cuff Tendinopathy",
            nextAppointment: "Monday, 03:00 PM",
            assignedDoctor: "Rohan Varma",
            lastSession: "Yesterday",
            status: "New"
        },
        channel: "whatsapp",
        snippet: "Can you send the invoice copy with clinic GST number for insurance claim submission?",
        unreadCount: 1,
        isStarred: false,
        isUrgent: false,
        isArchived: false,
        assignedStaff: "Ananya Desai",
        updatedAt: "4 hours ago",
        messages: [
            {
                id: "msg-501",
                senderName: "Arjun Nambiar",
                senderRole: "patient",
                channel: "whatsapp",
                content: "Hi Ananya! Could you please email me the official PDF invoice with the clinic's GST registration number? My health insurance needs it for reimbursement.",
                timestamp: "06:15 AM",
                isOutgoing: false
            }
        ]
    },
    {
        id: "thread-6",
        patientContext: {
            patientId: "PAT-1065",
            name: "Kavita Singhal",
            phone: "+91 98104 55998",
            email: "kavita.singhal@yahoo.co.in",
            age: 52,
            gender: "Female",
            condition: "Osteoarthritis Knee & Balance Training",
            nextAppointment: "Thursday, 05:00 PM",
            assignedDoctor: "Dr. Priya Sharma",
            lastSession: "4 days ago",
            status: "Recovery"
        },
        channel: "email",
        subject: "Therapy Progress and Home Exercise Routine",
        snippet: "Good morning doctor. Completed the 10-day isometric exercise plan. Swelling has reduced completely.",
        unreadCount: 0,
        isStarred: true,
        isUrgent: false,
        isArchived: false,
        assignedStaff: "Dr. Priya Sharma",
        updatedAt: "Yesterday",
        messages: [
            {
                id: "msg-601",
                senderName: "Kavita Singhal",
                senderRole: "patient",
                channel: "email",
                content: "Good morning Dr. Priya,\n\nI have completed the 10-day isometric exercise cycle. The morning swelling has completely subsided and I can walk 2km without discomfort.\n\nLooking forward to Thursday's review.\n\nWarm regards,\nKavita Singhal",
                timestamp: "Yesterday, 08:30 AM",
                isOutgoing: false
            },
            {
                id: "msg-602",
                senderName: "Dr. Priya Sharma",
                senderRole: "doctor",
                channel: "email",
                content: "Wonderful progress Kavita! Keep the resistance band exercises steady. We will progress to dynamic balance training on Thursday.",
                timestamp: "Yesterday, 11:00 AM",
                isOutgoing: true,
                status: "read"
            }
        ]
    }
]

const STORAGE_KEY = "sg-clinic-unified-inbox"
const EVENT_NAME = "sg-inbox-updated"

export function getInboxThreads(company = "clinic"): InboxThread[] {
    if (typeof window === "undefined") return INITIAL_INBOX_THREADS
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY}-${company}`)
        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
    } catch (e) {}
    return INITIAL_INBOX_THREADS
}

export function saveInboxThreads(threads: InboxThread[], company = "clinic") {
    if (typeof window === "undefined") return
    try {
        localStorage.setItem(`${STORAGE_KEY}-${company}`, JSON.stringify(threads))
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { company, threads } }))
    } catch (e) {}
}

export function getUnreadCount(company = "clinic"): number {
    const threads = getInboxThreads(company)
    return threads.reduce((acc, t) => acc + (t.unreadCount > 0 ? 1 : 0), 0)
}
