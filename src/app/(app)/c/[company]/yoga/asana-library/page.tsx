"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import AsanaLibraryTable from "../components/AsanaLibraryTable"

export default function AsanaLibraryPage() {
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
                    onClick={() => router.push(`/c/${company}/yoga`)}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Classes & Batches
                </Button>
            </div>
            
            <Card className="w-full border border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center border-b pb-4 gap-3">
                    <div className="h-10 w-10 bg-[#8e44ad]/10 text-[#8e44ad] flex items-center justify-center rounded-md shrink-0 text-lg shadow-2xs">
                        🧘
                    </div>
                    <div>
                        <CardTitle className="text-lg">Asana Library & Yoga Curriculum</CardTitle>
                        <CardDescription>Pose database, Pranayama, Meditation, class sequence planner</CardDescription>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                    <AsanaLibraryTable />
                </CardContent>
            </Card>
        </div>
    )
}
