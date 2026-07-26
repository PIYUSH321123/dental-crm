"use client"

import * as React from "react"
import { ClinicalData } from "../../clinical-data-helper"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PhysicalTestingProps {
    clinicalData?: ClinicalData
}

export default function PhysicalTesting({ clinicalData }: PhysicalTestingProps) {
    const diagnosis = clinicalData?.diagnosis ?? "Knee OA (Kellgren-Lawrence Grade II)"
    
    // Derived values
    let flexion = "95°"
    let extensionLabel = "ROM — Extension"
    let extensionValue = "-5°"
    let extensionPlaceholder = "Normal: 0°"
    let strengthText = (
        <div className="flex gap-4 p-2.5 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg text-[10px] font-medium justify-around text-muted-foreground">
            <span>Quads: <b className="text-primary">3+/5</b></span>
            <span>Hams: <b className="text-primary">4/5</b></span>
            <span>Calves: <b className="text-primary">4/5</b></span>
        </div>
    )
    let swelling = "Grade 1 – Mild"
    let specialTests = "Patellar Grinding: +ve, Joint line tenderness: medial"
    let posture = "Mild valgus deformity, antalgic gait"

    if (diagnosis.includes("Shoulder") || diagnosis.includes("Capsulitis")) {
        flexion = "95°"
        extensionLabel = "ROM — Abduction"
        extensionValue = "85°"
        extensionPlaceholder = "Normal: 180°"
        strengthText = (
            <div className="flex gap-4 p-2.5 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg text-[10px] font-medium justify-around text-muted-foreground">
                <span>Deltoid: <b className="text-primary">4/5</b></span>
                <span>Rotator Cuff: <b className="text-primary">3+/5</b></span>
                <span>Traps: <b className="text-primary">4/5</b></span>
            </div>
        )
        swelling = "Grade 0 – None"
        specialTests = "Neer's Test: +ve, Hawkins-Kennedy: +ve"
        posture = "Scapular dyskinesia, rounded shoulder posture"
    } else if (diagnosis.includes("ACL") || diagnosis.includes("Sports Knee")) {
        flexion = "125°"
        extensionLabel = "ROM — Extension"
        extensionValue = "0°"
        extensionPlaceholder = "Normal: 0°"
        strengthText = (
            <div className="flex gap-4 p-2.5 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg text-[10px] font-medium justify-around text-muted-foreground">
                <span>Quads: <b className="text-primary">4-/5</b></span>
                <span>Hams: <b className="text-primary">4/5</b></span>
                <span>Calves: <b className="text-primary">4+/5</b></span>
            </div>
        )
        swelling = "Grade 1 – Mild"
        specialTests = "Lachman: +ve (Grade 1), Anterior Drawer: +ve"
        posture = "Quadriceps lag present, symmetrical gait with brace"
    }

    const [selectedSwelling, setSelectedSwelling] = React.useState(swelling)

    React.useEffect(() => {
        setSelectedSwelling(swelling)
    }, [swelling])

    return (
        <Card className="bg-card border-border shadow-xs h-full">
            <CardHeader className="p-3.5 border-b border-border pb-2.5">
                <CardTitle className="text-[10px] font-bold text-primary tracking-wider uppercase">
                    PHYSICAL TESTING
                </CardTitle>
            </CardHeader>
            
            <CardContent className="p-3.5 space-y-3">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Range of Motion — Flexion
                    </Label>
                    <Input 
                        type="text" 
                        key={flexion}
                        defaultValue={flexion} 
                        placeholder="Normal: 135°" 
                        className="h-8 text-[11px] focus-visible:ring-3 focus-visible:ring-ring/50 border-input bg-card"
                    />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        {extensionLabel}
                    </Label>
                    <Input 
                        type="text" 
                        key={extensionValue}
                        defaultValue={extensionValue} 
                        placeholder={extensionPlaceholder} 
                        className="h-8 text-[11px] focus-visible:ring-3 focus-visible:ring-ring/50 border-input bg-card"
                    />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Muscle Strength (0–5)
                    </Label>
                    {strengthText}
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Swelling
                    </Label>
                    <Select value={selectedSwelling} onValueChange={setSelectedSwelling}>
                        <SelectTrigger className="h-8 text-[11px] bg-card border-input focus:ring-3 focus:ring-ring/50 w-full flex">
                            <SelectValue placeholder="Select Swelling Grade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Grade 0 – None">Grade 0 – None</SelectItem>
                            <SelectItem value="Grade 1 – Mild">Grade 1 – Mild</SelectItem>
                            <SelectItem value="Grade 2 – Moderate">Grade 2 – Moderate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Special Tests
                    </Label>
                    <Input 
                        type="text" 
                        key={specialTests}
                        defaultValue={specialTests} 
                        className="h-8 text-[11px] focus-visible:ring-3 focus-visible:ring-ring/50 border-input bg-card"
                    />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Posture Assessment
                    </Label>
                    <textarea 
                        className="w-full text-[11px] px-2.5 py-1.5 border border-input rounded-lg text-foreground bg-transparent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors h-10 resize-none dark:bg-input/30"
                        key={posture}
                        defaultValue={posture}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
