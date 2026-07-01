import { redirect } from "next/navigation"

export default async function LeadManagementPage({ params }: { params: Promise<{ company: string }> }) {
    const { company } = await params
    redirect(`/c/${company}/lead-management/leads`)
}