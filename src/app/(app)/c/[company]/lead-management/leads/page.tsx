import * as React from "react"
import LeadListComponent from "./leads"

export default async function LeadsPage({ params }: { params: Promise<{ company: string }> }) {
    // Await params as required by Next.js 15/16 page props signature
    await params

    return <LeadListComponent />
}
