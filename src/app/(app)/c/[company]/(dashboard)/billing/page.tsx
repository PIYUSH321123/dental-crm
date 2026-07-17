import { redirect } from "next/navigation"

export default async function BillingIndexPage({ params }: { params: Promise<{ company: string }> }) {
    const { company } = await params
    redirect(`/c/${company}/billing/invoices`)
}
