"use client"

import * as React from "react"
import { ClinicalData } from "../../clinical-data-helper"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DiagnosisAreaProps {
    clinicalData?: ClinicalData
}

export default function DiagnosisArea({ clinicalData }: DiagnosisAreaProps) {
    const diagnosis = clinicalData?.diagnosis ?? "Knee OA (Kellgren-Lawrence Grade II)"
    const icdCode = clinicalData?.icdCode ?? "M17.12"
    
    // Derived values
    let affectedArea = "Left Knee"
    let aggravating = "Stair climbing, prolonged standing"
    let relieving = "Rest, ice application"
    
    if (diagnosis.includes("Shoulder") || diagnosis.includes("Capsulitis")) {
        affectedArea = "Right Shoulder"
        aggravating = "Overhead movements, sleeping on affected side"
        relieving = "Rest, warm compress"
    } else if (diagnosis.includes("ACL") || diagnosis.includes("Sports Knee")) {
        affectedArea = "Left Knee"
        aggravating = "Pivoting, deep squats, prolonged walking"
        relieving = "Rest, brace application"
    }

    const [selectedArea, setSelectedArea] = React.useState(affectedArea)

    React.useEffect(() => {
        setSelectedArea(affectedArea)
    }, [affectedArea])

    return (
        <Card className="bg-card border-border shadow-xs h-full">
            <CardHeader className="p-3.5 border-b border-border pb-2.5">
                <CardTitle className="text-[10px] font-bold text-primary tracking-wider uppercase">
                    DIAGNOSIS & AREA
                </CardTitle>
            </CardHeader>
            
            <CardContent className="p-3.5 space-y-3">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Diagnosis
                    </Label>
                    <Input 
                        type="text" 
                        key={diagnosis}
                        defaultValue={diagnosis} 
                        className="h-8 text-[11px] focus-visible:ring-3 focus-visible:ring-ring/50 border-input bg-card"
                    />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Affected Area
                    </Label>
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                        <SelectTrigger className="h-8 text-[11px] bg-card border-input focus:ring-3 focus:ring-ring/50 w-full flex">
                            <SelectValue placeholder="Select Area" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Left Knee">Left Knee</SelectItem>
                            <SelectItem value="Right Knee">Right Knee</SelectItem>
                            <SelectItem value="Left Shoulder">Left Shoulder</SelectItem>
                            <SelectItem value="Right Shoulder">Right Shoulder</SelectItem>
                            <SelectItem value="Bilateral Knee">Bilateral Knee</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        ICD-10 Code
                    </Label>
                    <Input 
                        type="text" 
                        key={icdCode}
                        defaultValue={icdCode} 
                        placeholder="e.g. M17.12" 
                        className="h-8 text-[11px] focus-visible:ring-3 focus-visible:ring-ring/50 border-input bg-card"
                    />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Aggravating Factors
                    </Label>
                    <textarea 
                        className="w-full text-[11px] px-2.5 py-1.5 border border-input rounded-lg text-foreground bg-transparent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors h-10 resize-none dark:bg-input/30"
                        key={aggravating}
                        defaultValue={aggravating}
                    />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Relieving Factors
                    </Label>
                    <textarea 
                        className="w-full text-[11px] px-2.5 py-1.5 border border-input rounded-lg text-foreground bg-transparent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors h-10 resize-none dark:bg-input/30"
                        key={relieving}
                        defaultValue={relieving}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
