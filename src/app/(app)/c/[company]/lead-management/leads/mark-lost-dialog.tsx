"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Lead } from "./_lead-data-table/lead-data"

interface MarkLostDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead: Lead | null
    onSubmit: (reason: string, notes: string) => void
}

export function MarkLostDialog({
    open,
    onOpenChange,
    lead,
    onSubmit,
}: MarkLostDialogProps) {
    const [lostReason, setLostReason] = useState<string>("")
    const [lostReasonNotes, setLostReasonNotes] = useState("")

    React.useEffect(() => {
        if (open && lead) {
            setLostReason("")
            setLostReasonNotes("")
        }
    }, [open, lead])

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!lostReason) {
            return
        }
        onSubmit(lostReason, lostReasonNotes)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Mark Lead as Lost</DialogTitle>
                    <DialogDescription>
                        Specify the primary reason why {lead?.name} is being marked as Lost.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-4 py-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="lost-reason-sel" className="text-xs font-semibold">Reason Category *</Label>
                        <Select value={lostReason} onValueChange={setLostReason} required>
                            <SelectTrigger id="lost-reason-sel" className="h-9">
                                <SelectValue placeholder="Choose reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cost">Cost (Pricing too high)</SelectItem>
                                <SelectItem value="Distance">Distance (Too far from clinic)</SelectItem>
                                <SelectItem value="No Response">No Response (Ghosted calls)</SelectItem>
                                <SelectItem value="Chose Competitor">Chose Competitor</SelectItem>
                                <SelectItem value="Other">Other Reason</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="lost-notes" className="text-xs font-semibold">Additional Details</Label>
                        <textarea 
                            id="lost-notes"
                            value={lostReasonNotes}
                            onChange={(e) => setLostReasonNotes(e.target.value)}
                            placeholder="E.g. Disagree with pricing of shoulder bundle. Going to local provider."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive">
                            Mark as Lost
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
