import { redirect } from "next/navigation"

export default async function PatientManagementPage({ params }: { params: Promise<{ company: string }> }) {
    const { company } = await params
    redirect(`/c/${company}/patient-management/patients`)
}
