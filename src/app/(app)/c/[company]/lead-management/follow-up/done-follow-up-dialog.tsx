import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { FollowUp } from "./_follow-up-table/follow-up-data"
import { mockTherapists } from "../leads/_lead-data-table/lead-data"

interface DoneFollowUpDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    followUp: FollowUp | null
    onSave: (
        outcome: FollowUp["outcome"] & string,
        notes: string,
        scheduleNext: boolean,
        nextDetails?: {
            type: FollowUp["type"]
            assignedId: string
            dueAt: string
        }
    ) => void
}

export function DoneFollowUpDialog({
    open,
    onOpenChange,
    followUp,
    onSave
}: DoneFollowUpDialogProps) {
    const [outcome, setOutcome] = useState<FollowUp["outcome"] & string>("Answered")
    const [notes, setNotes] = useState("")
    const [scheduleNext, setScheduleNext] = useState(false)
    const [nextType, setNextType] = useState<FollowUp["type"]>("Call")
    const [nextDueAt, setNextDueAt] = useState("")
    const [nextAssignedId, setNextAssignedId] = useState("")

    useEffect(() => {
        if (followUp) {
            setOutcome("Answered")
            setNotes("")
            setScheduleNext(false)
            setNextType("Call")
            setNextDueAt("")
            setNextAssignedId(followUp.assigned_to_id)
        }
    }, [followUp, open])

    const handleSave = () => {
        if (scheduleNext && !nextDueAt) {
            return
        }

        onSave(
            outcome,
            notes,
            scheduleNext,
            scheduleNext ? { type: nextType, assignedId: nextAssignedId, dueAt: nextDueAt } : undefined
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-[480px] border-border bg-card"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">Log Follow-up Outcome</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Select the outcome of your contact attempt for <span className="font-semibold text-foreground">{followUp?.lead_name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-3">
                    <div className="space-y-2">
                        <Label htmlFor="outcome" className="text-xs font-semibold text-muted-foreground">Contact Outcome *</Label>
                        <Select value={outcome} onValueChange={(val) => setOutcome(val as any)}>
                            <SelectTrigger id="outcome" className="border-input bg-background text-foreground">
                                <SelectValue placeholder="Select outcome" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Answered">Answered & Interested</SelectItem>
                                <SelectItem value="Not Answered">No Answer / Busy</SelectItem>
                                <SelectItem value="Callback">Wants Callback Later</SelectItem>
                                <SelectItem value="Interested">Highly Interested</SelectItem>
                                <SelectItem value="Not Interested">Not Interested (Drop Lead)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground">Interaction Notes</Label>
                        <textarea
                            id="notes"
                            className="w-full min-h-[90px] p-2.5 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Details about pain levels, slot preferences, or questions asked..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="scheduleNext" 
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer bg-background"
                            checked={scheduleNext}
                            onChange={(e) => setScheduleNext(e.target.checked)}
                        />
                        <Label htmlFor="scheduleNext" className="text-sm font-medium text-foreground cursor-pointer select-none">
                            Schedule next follow-up task
                        </Label>
                    </div>

                    {scheduleNext && (
                        <div className="p-3.5 bg-muted/30 border border-border rounded-md space-y-3.5 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-muted-foreground">Contact Method</Label>
                                    <Select value={nextType} onValueChange={(v) => setNextType(v as any)}>
                                        <SelectTrigger className="h-8 text-xs border-input bg-background text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Call">📞 Call</SelectItem>
                                            <SelectItem value="WhatsApp">💬 WhatsApp</SelectItem>
                                            <SelectItem value="SMS">📱 SMS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-muted-foreground">Assigned Therapist</Label>
                                    <Select value={nextAssignedId} onValueChange={setNextAssignedId}>
                                        <SelectTrigger className="h-8 text-xs border-input bg-background text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockTherapists.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="nextDueAt" className="text-[11px] font-semibold text-muted-foreground">Due Date & Time *</Label>
                                <Input
                                    id="nextDueAt"
                                    type="datetime-local"
                                    className="h-8 text-xs bg-background border-input text-foreground"
                                    value={nextDueAt}
                                    onChange={(e) => setNextDueAt(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                        onClick={handleSave}
                    >
                        Save Log
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
