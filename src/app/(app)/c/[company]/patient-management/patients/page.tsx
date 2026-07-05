import * as React from "react"
import PatientsWorkspace from "./patients-workspace"

export default async function PatientsPage({ params }: { params: Promise<{ company: string }> }) {
    await params

    return <PatientsWorkspace />
}
