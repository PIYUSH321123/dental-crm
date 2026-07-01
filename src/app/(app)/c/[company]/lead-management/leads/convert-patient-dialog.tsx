"use client"

import React from "react"
import { CheckCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lead } from "./_lead-data-table/lead-data"

interface ConvertPatientDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead: Lead | null
    onConfirm: () => void
}

export function ConvertPatientDialog({
    open,
    onOpenChange,
    lead,
    onConfirm,
}: ConvertPatientDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Convert to Patient</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to convert the lead <b>{lead?.name}</b> into a permanent registered Patient?
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 my-2 text-emerald-800 text-xs dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
                    <div className="font-semibold flex items-center gap-1.5 mb-1.5">
                        <CheckCircle className="h-4 w-4" />
                        <span>Post-Conversion Actions</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 font-medium">
                        <li>Patient record will be instantly created from details.</li>
                        <li>Lead status auto-updates to "Converted".</li>
                        <li>Generates sequential Patient ID: P-XXXX.</li>
                    </ul>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Discard
                    </Button>
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                        onClick={onConfirm}
                    >
                        Confirm Conversion
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
