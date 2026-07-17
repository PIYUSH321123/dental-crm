import { redirect } from "next/navigation"

export default async function ActivityManagementIndexPage({ params }: { params: Promise<{ company: string }> }) {
    const { company } = await params
    redirect(`/c/${company}/activity-management/assessments`)
}
