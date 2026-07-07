"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, ArrowLeft } from "lucide-react"

// Import custom dynamic catalog parts
import ExerciseLibrary from "./components/ExerciseLibrary"
import PrescriptionTable from "./components/PrescriptionTable"

export default function ExercisePrescriptionPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()
    
    // Manage explicit navigation tabs state
    const [activeTab, setActiveTab] = React.useState<"library" | "prescription">("library")

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
                <CardHeader className="flex flex-row items-center gap-3.5 border-b pb-4">
                    <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-md shrink-0">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Exercise Prescription Module</CardTitle>
                        <CardDescription>Exercise library, patient-specific prescription, WhatsApp delivery, video guidance</CardDescription>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-4 space-y-4">
                    {/* JSX tab toggle switch navigation header */}
                    <div className="flex border-b border-border text-xs font-medium">
                        <button 
                            type="button" 
                            onClick={() => setActiveTab("library")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors ${
                                activeTab === "library" 
                                ? "border-primary text-primary" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Exercise Library
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setActiveTab("prescription")}
                            className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors ${
                                activeTab === "prescription" 
                                ? "border-primary text-primary" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Patient Prescriptions
                        </button>
                    </div>

                    {/* Conditional rendering depending on tab selections */}
                    <div className="pt-2">
                        {activeTab === "library" ? <ExerciseLibrary /> : <PrescriptionTable />}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
