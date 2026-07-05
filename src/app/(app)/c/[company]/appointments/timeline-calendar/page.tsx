"use client"

import * as React from "react"
import dynamic from "next/dynamic"

// Import CalendarWorkspace dynamically with SSR disabled to prevent server-side 
// compilation issues with FullCalendar (which references window/document).
const CalendarWorkspace = dynamic(
    () => import("./calendar-workspace"),
    { ssr: false }
)

export default function TimelineCalendarPage({ params }: { params: React.Usable<{ company: string }> }) {
    const { company } = React.use(params)

    return <CalendarWorkspace />
}
