import * as React from "react"
import { Suspense } from "react"
import SharedLayout from "../shared-layout"

export default async function ProductsPage({ params }: { params: Promise<{ company: string }> }) {
    // Await params as required by Next.js 15/16 page props signature
    await params

    return (
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground animate-pulse font-sans">Loading Products Register...</div>}>
            <SharedLayout activeTab="products" />
        </Suspense>
    )
}
