"use client"

import * as React from "react"
import { ClinicalData } from "../../clinical-data-helper"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChiefComplaintProps {
    clinicalData?: ClinicalData
}

export default function ChiefComplaint({ clinicalData }: ChiefComplaintProps) {
    const complaint = clinicalData?.primaryComplaint ?? "Pain in left knee while walking and climbing stairs"
    const scoreVal = clinicalData?.painScore ?? 7
    const duration = clinicalData?.painDuration ?? "1–6 months"
    const pType = clinicalData?.painType ?? "Dull Ache"

    const [activeScore, setActiveScore] = React.useState(scoreVal)
    const [selectedDuration, setSelectedDuration] = React.useState(duration)
    const [activePainType, setActivePainType] = React.useState(pType)

    React.useEffect(() => {
        setActiveScore(scoreVal)
        setSelectedDuration(duration)
        setActivePainType(pType)
    }, [scoreVal, duration, pType])

    return (
        <Card className="bg-card border-border shadow-xs h-full">
            <CardHeader className="p-3.5 border-b border-border pb-2.5">
                <CardTitle className="text-[10px] font-bold text-primary tracking-wider uppercase">
                    CHIEF COMPLAINT
                </CardTitle>
            </CardHeader>
            
            <CardContent className="p-3.5 space-y-3.5">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Primary Complaint
                    </Label>
                    <textarea 
                        className="w-full text-[11px] px-2.5 py-1.5 border border-input rounded-lg text-foreground bg-transparent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors h-14 resize-none dark:bg-input/30"
                        key={complaint}
                        defaultValue={complaint} 
                    />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Pain Score (0–10)
                    </Label>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                            const isActive = score === activeScore
                            return (
                                <button
                                    type="button"
                                    key={score}
                                    onClick={() => setActiveScore(score)}
                                    className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] cursor-pointer transition-all hover:scale-105 ${
                                        isActive 
                                        ? "bg-amber-600 text-white font-bold shadow-xs shadow-orange-500/20" 
                                        : "bg-slate-100 dark:bg-slate-800 text-muted-foreground font-semibold hover:bg-slate-200 dark:hover:bg-slate-750"
                                    }`}
                                >
                                    {score}
                                </button>
                            )
                        })}
                    </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Pain Duration
                    </Label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger className="h-8 text-[11px] bg-card border-input focus:ring-3 focus:ring-ring/50 w-full flex">
                            <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="< 1 week">&lt; 1 week</SelectItem>
                            <SelectItem value="1–4 weeks">1–4 weeks</SelectItem>
                            <SelectItem value="1–6 months">1–6 months</SelectItem>
                            <SelectItem value="> 6 months">&gt; 6 months</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Pain Type
                    </Label>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                        {["Dull Ache", "Sharp", "Burning", "Throbbing"].map((type) => {
                            const isActive = type === activePainType
                            return (
                                <button 
                                    type="button"
                                    key={type}
                                    onClick={() => setActivePainType(type as any)}
                                    className={`px-2 py-1.5 rounded-lg text-[9px] cursor-pointer transition-all hover:scale-105 ${
                                        isActive 
                                        ? "bg-primary text-primary-foreground font-bold" 
                                        : "bg-primary/10 text-primary font-medium hover:bg-primary/20"
                                    }`}
                                >
                                    {type}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}