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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Lead, mockTherapists } from "./_lead-data-table/lead-data"

interface BookConsultationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead: Lead | null
    onSubmit: (date: string, time: string, therapistId: string, notes: string) => void
}

export function BookConsultationDialog({
    open,
    onOpenChange,
    lead,
    onSubmit,
}: BookConsultationDialogProps) {
    const [consultDate, setConsultDate] = useState("")
    const [consultTime, setConsultTime] = useState("")
    const [consultTherapist, setConsultTherapist] = useState("")
    const [consultNotes, setConsultNotes] = useState("")

    React.useEffect(() => {
        if (open && lead) {
            setConsultDate("")
            setConsultTime("")
            setConsultTherapist(lead.assigned_therapist_id || "")
            setConsultNotes("")
        }
    }, [open, lead])

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!consultDate || !consultTime) {
            return
        }
        onSubmit(consultDate, consultTime, consultTherapist, consultNotes)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Book Consultation Appointment</DialogTitle>
                    <DialogDescription>
                        Create an appointment for {lead?.name}. This will update status to "Consultation Booked".
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-4 py-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="con-date" className="text-xs font-semibold">Select Date *</Label>
                            <Input 
                                id="con-date"
                                type="date"
                                value={consultDate}
                                onChange={(e) => setConsultDate(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="con-time" className="text-xs font-semibold">Select Time *</Label>
                            <Input 
                                id="con-time"
                                type="time"
                                value={consultTime}
                                onChange={(e) => setConsultTime(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="con-therapist" className="text-xs font-semibold">Assign Therapist</Label>
                        <Select value={consultTherapist} onValueChange={setConsultTherapist}>
                            <SelectTrigger id="con-therapist" className="h-9">
                                <SelectValue placeholder="Select therapist" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockTherapists.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="con-notes" className="text-xs font-semibold">Appointment Notes</Label>
                        <textarea 
                            id="con-notes"
                            value={consultNotes}
                            onChange={(e) => setConsultNotes(e.target.value)}
                            placeholder="E.g. Assessment package discussed. Prefers first slot."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white">
                            Book & Update Lead
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
