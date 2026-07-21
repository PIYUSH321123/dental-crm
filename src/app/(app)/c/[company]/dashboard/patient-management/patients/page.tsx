import * as React from "react"
import PatientsWorkspace from "./patients-workspace"

export default async function PatientsPage({ params }: { params: Promise<{ company: string }> }) {
    await params

    return (
        <React.Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading workspace...</div>}>
            <PatientsWorkspace />
        </React.Suspense>
    )
}
