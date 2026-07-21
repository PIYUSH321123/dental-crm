import { redirect } from "next/navigation"

export default async function AppointmentsIndexPage({ params }: { params: Promise<{ company: string }> }) {
    const { company } = await params
    redirect(`/c/${company}/dashboard/appointments/timeline-calendar`)
}
