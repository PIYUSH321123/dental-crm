import * as React from "react"

export default async function FollowUpPage({ params }: { params: Promise<{ company: string }> }) {
    await params
    
    return (
        <div className="flex flex-1 items-center justify-center p-8 min-h-[400px]">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Follow-up Workspace</h1>
                <p className="text-muted-foreground text-sm">this is follow up page</p>
            </div>
        </div>
    )
}
