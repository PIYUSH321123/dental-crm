import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { FollowUp } from "./_follow-up-table/follow-up-data"

interface RescheduleFollowUpDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    followUp: FollowUp | null
    onSave: (rescheduleDate: string) => void
}

export function RescheduleFollowUpDialog({
    open,
    onOpenChange,
    followUp,
    onSave
}: RescheduleFollowUpDialogProps) {
    const [rescheduleDate, setRescheduleDate] = useState("")

    useEffect(() => {
        if (followUp) {
            const date = new Date(followUp.due_at)
            const tzOffset = date.getTimezoneOffset() * 60000
            const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16)
            setRescheduleDate(localISOTime)
        }
    }, [followUp, open])

    const handleSave = () => {
        if (!rescheduleDate) return
        onSave(rescheduleDate)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-[400px] border-border bg-card"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">Reschedule Follow-up</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Select a new date and time for the follow-up task of <span className="font-semibold text-foreground">{followUp?.lead_name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-3">
                    <div className="space-y-2">
                        <Label htmlFor="rescheduleDate" className="text-xs font-semibold text-muted-foreground">Next Scheduled Time *</Label>
                        <Input
                            id="rescheduleDate"
                            type="datetime-local"
                            className="border-input bg-background text-foreground"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            required
                        />
                    </div>
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
                        Confirm Reschedule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
