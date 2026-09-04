import { Suspense } from "react"
import { InboxWorkspace } from "./inbox-workspace"

export default function InboxPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[400px] text-xs text-muted-foreground">
                Loading Unified Inbox...
            </div>
        }>
            <InboxWorkspace />
        </Suspense>
    )
}
