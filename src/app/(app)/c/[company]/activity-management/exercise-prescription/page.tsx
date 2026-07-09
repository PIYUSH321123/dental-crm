"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"

// Import custom dynamic catalog parts
import ExerciseLibrary from "./components/ExerciseLibrary"
import PrescriptionTable from "./components/PrescriptionTable"

export default function ExercisePrescriptionPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                    {/* Page Header — matches lead-management pattern */}
                    <div className="px-4 lg:px-6 flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 pl-1 cursor-pointer hover:bg-accent/40"
                                onClick={() => router.push(`/c/${company}/patient-management/patients`)}
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Patients
                            </Button>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Exercise Prescription</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Exercise library, patient-specific prescription, WhatsApp delivery, and video guidance.
                        </p>
                    </div>

                    {/* Main Content with Tabs */}
                    <div className="px-4 lg:px-6">
                        <Tabs defaultValue="library" className="w-full">
                            <TabsList className="h-9 mb-4">
                                <TabsTrigger value="library" className="text-xs font-semibold">Exercise Library</TabsTrigger>
                                <TabsTrigger value="prescription" className="text-xs font-semibold">Patient Prescriptions</TabsTrigger>
                            </TabsList>
                            <TabsContent value="library">
                                <ExerciseLibrary />
                            </TabsContent>
                            <TabsContent value="prescription">
                                <PrescriptionTable />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}
