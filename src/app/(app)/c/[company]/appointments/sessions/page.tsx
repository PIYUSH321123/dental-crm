"use client"
import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarRange, ArrowLeft } from "lucide-react"

export default function SessionManagementPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()
    const searchParams = useSearchParams()
    const scheduleFor = searchParams.get("scheduleFor")

    return (
        <div className="flex-1 p-6 space-y-6">
            <div>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40" onClick={() => router.push(`/c/${company}/patient-management/patients`)}>
                    <ArrowLeft className="h-4 w-4" /> Back to Patients
                </Button>
            </div>
            <Card className="max-w-2xl mx-auto border border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3.5 border-b pb-4">
                    <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-md shrink-0">
                        <CalendarRange className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Session Management & Scheduling</CardTitle>
                        <CardDescription>Book appointments, track session attendance, and log clinical notes.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {scheduleFor && (
                        <div className="p-3 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-md">
                            ℹ️ Scheduling request detected for Patient ID: <span className="font-mono">{scheduleFor}</span>. Pre-filling patient metadata.
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This module manages clinician calendars, books appointments, coordinates therapist schedules, and updates patient attendance logs automatically.
                    </p>
                    <div className="bg-muted/40 border border-border p-4 rounded-md text-xs font-medium space-y-2">
                        <div className="font-bold text-primary text-[10px] tracking-wider uppercase">Scheduling Controls:</div>
                        <div>• Live calendar interface showing therapist availability slots</div>
                        <div>• Recurrent booking slots for package treatments</div>
                        <div>• Automated Google Calendar sync and WhatsApp notifications</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
