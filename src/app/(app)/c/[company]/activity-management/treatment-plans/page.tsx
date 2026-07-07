"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, ArrowLeft } from "lucide-react"

// Import custom folder layout blocks
import PlanDetails from "./components/PlanDetails"
import TherapyAndPhases from "./components/TheapyAndPhases"
import PlanActionBtns from "./components/PlanActionBtns"

export default function TreatmentPlansPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    return (
        <div className="flex-1 p-6 space-y-6">
            <div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40" 
                    onClick={() => router.push(`/c/${company}/patient-management/patients`)}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Patients
                </Button>
            </div>
            
            <Card className="max-w-7xl mx-auto border border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-md shrink-0">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Treatment Plan Management</CardTitle>
                            <CardDescription>Goal setting, therapy types, session planning, expected recovery timeline</CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs">View Previous Plans</Button>
                        <Button size="sm" className="text-xs bg-[#27ae60] text-white hover:bg-[#219653]">+ New Plan</Button>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-4">
                    <div className="text-sm font-semibold text-foreground mb-1">
                        📋 Treatment Plan — Ravi Kumar (P-0142)
                    </div>

                    {/* Master 2-Column Side-by-Side Configuration layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <PlanDetails />
                        <TherapyAndPhases />
                    </div>

                    {/* Footer Operations Row Component */}
                    <PlanActionBtns />
                </CardContent>
            </Card>
        </div>
    )
}
