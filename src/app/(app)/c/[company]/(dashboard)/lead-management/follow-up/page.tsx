import * as React from "react"
import FollowUpWorkspace from "./follow-up-workspace"

export default async function FollowUpPage({ params }: { params: Promise<{ company: string }> }) {
    await params

    return <FollowUpWorkspace />
}
