import * as React from "react"
import { Suspense } from "react"
import { CampaignsClient } from "./campaigns-client"

export default async function CampaignPage({ params }: { params: Promise<{ company: string }> }) {
    // Await params as required by Next.js 15/16 page props signature
    await params

    return (
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground animate-pulse">Loading Campaigns...</div>}>
            <CampaignsClient />
        </Suspense>
    )
}
