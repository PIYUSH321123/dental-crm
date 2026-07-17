import { redirect } from "next/navigation"

export default async function Page({ params }: { params: Promise<{ company: string }> }) {
    const { company } = await params
    redirect(`/c/${company}/marketing/campaign`)
}
