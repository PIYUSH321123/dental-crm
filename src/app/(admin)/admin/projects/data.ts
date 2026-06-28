export interface Project {
    id: string
    project_name: string
    company_name: string
    status: "Active" | "Inactive" | "Pending" | "Suspended"
    subscription_plan: "Basic" | "Pro" | "Growth" | "Enterprise"
    renewal_date: string
    budget: number
    lead_name: string
    email: string
    created_at: string
}

export const mockProjects: Project[] = [
    {
        id: "proj-1",
        project_name: "Physio",
        company_name: "XYZ Hospital",
        status: "Active",
        subscription_plan: "Enterprise",
        renewal_date: "2026-11-20",
        budget: 450000,
        lead_name: "Alice Johnson",
        email: "alice@acme.com",
        created_at: "2025-01-15",
    },
    {
        id: "proj-2",
        project_name: "CRM Implementation",
        company_name: "Globex Corporation",
        status: "Active",
        subscription_plan: "Growth",
        renewal_date: "2026-09-12",
        budget: 280000,
        lead_name: "Bob Smith",
        email: "bob@globex.com",
        created_at: "2025-03-22",
    },
    {
        id: "proj-3",
        project_name: "TPS Reporting System",
        company_name: "Initech LLC",
        status: "Pending",
        subscription_plan: "Pro",
        renewal_date: "2027-01-05",
        budget: 180000,
        lead_name: "Peter Gibbons",
        email: "peter@initech.com",
        created_at: "2026-01-05",
    },
    {
        id: "proj-4",
        project_name: "Bio-security Gateway",
        company_name: "Umbrella Corp",
        status: "Suspended",
        subscription_plan: "Enterprise",
        renewal_date: "2026-07-30",
        budget: 600000,
        lead_name: "Albert Wesker",
        email: "albert@umbrella.com",
        created_at: "2024-06-18",
    },
    {
        id: "proj-5",
        project_name: "Nucleus Compression Platform",
        company_name: "Hooli Inc",
        status: "Active",
        subscription_plan: "Growth",
        renewal_date: "2026-10-10",
        budget: 350000,
        lead_name: "Gavin Belson",
        email: "gavin@hooli.com",
        created_at: "2025-05-12",
    },
    {
        id: "proj-6",
        project_name: "Distribution Logistics",
        company_name: "Soylent Green Co",
        status: "Inactive",
        subscription_plan: "Basic",
        renewal_date: "2026-05-01",
        budget: 95000,
        lead_name: "Robert Thorn",
        email: "thorn@soylent.com",
        created_at: "2025-02-10",
    },
    {
        id: "proj-7",
        project_name: "Patient Portal V2",
        company_name: "Veer Meditech",
        status: "Active",
        subscription_plan: "Pro",
        renewal_date: "2027-03-15",
        budget: 220000,
        lead_name: "Vikram Sharma",
        email: "vikram@veer.in",
        created_at: "2026-03-15",
    },
    {
        id: "proj-8",
        project_name: "Neural Network Architecture",
        company_name: "Cyberdyne Systems",
        status: "Active",
        subscription_plan: "Enterprise",
        renewal_date: "2027-05-29",
        budget: 850000,
        lead_name: "Miles Dyson",
        email: "mdyson@cyberdyne.com",
        created_at: "2025-08-24",
    },
    {
        id: "proj-9",
        project_name: "Arc Reactor Grid",
        company_name: "Stark Industries",
        status: "Active",
        subscription_plan: "Enterprise",
        renewal_date: "2027-04-18",
        budget: 1200000,
        lead_name: "Pepper Potts",
        email: "pepper@stark.com",
        created_at: "2024-12-01",
    },
    {
        id: "proj-10",
        project_name: "Satellite Defense Network",
        company_name: "Wayne Enterprises",
        status: "Active",
        subscription_plan: "Enterprise",
        renewal_date: "2027-02-14",
        budget: 1500000,
        lead_name: "Lucius Fox",
        email: "lfox@wayne.com",
        created_at: "2025-01-20",
    }
]

export function getProjectSlug(projectName: string, companyName: string): string {
    const companyAbbr = companyName.split(" ")[0].toLowerCase()
    const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    return `${projectSlug}-${companyAbbr}`
}
