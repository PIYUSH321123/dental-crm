"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, ArrowLeft } from "lucide-react"

export default function TreatmentPlansPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

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
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Treatment Plans</CardTitle>
                        <CardDescription>Design patient rehab programs, session structures, and long-term recovery goals.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This module manages clinical treatment plans, mapping out sequential milestones, targeting pain reduction phases, and adjusting session frequencies.
                    </p>
                    <div className="bg-muted/40 border border-border p-4 rounded-md text-xs font-medium space-y-2">
                        <div className="font-bold text-primary text-[10px] tracking-wider uppercase">Treatment Plan Features:</div>
                        <div>• Program builder with frequency templates (e.g., 3x/week for 4 weeks)</div>
                        <div>• Recovery goal checklists and prognosis updates</div>
                        <div>• Automated WhatsApp session plan reminders</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
