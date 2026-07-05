import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Patient } from "./_patient-table/patient-data"

interface CollectPaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patient: Patient | null
    onSubmit: (amount: number, mode: string, description: string) => void
}

export function CollectPaymentDialog({ open, onOpenChange, patient, onSubmit }: CollectPaymentDialogProps) {
    const [amount, setAmount] = useState("")
    const [mode, setMode] = useState("UPI")
    const [description, setDescription] = useState("")

    useEffect(() => {
        if (patient) {
            setAmount(String(patient.balance))
            setDescription(`Payment for ${patient.condition} rehab sessions`)
        }
    }, [patient])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            alert("Please enter a valid amount greater than 0.")
            return
        }
        if (patient && amountNum > patient.balance) {
            alert(`Collected amount (₹${amountNum}) exceeds the patient's due balance (₹${patient.balance}).`)
            return
        }

        onSubmit(amountNum, mode, description)
        setAmount("")
        setMode("UPI")
        setDescription("")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md lg:max-w-[50vw] border border-border p-6 rounded-lg bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Collect Outstanding Balance</DialogTitle>
                    <DialogDescription className="text-xs">
                        Record a payment received for patient <b>{patient?.name}</b>. This will update the outstanding balance.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="due" className="text-xs">Current Outstanding Balance</Label>
                            <div className="h-9 px-3 border rounded-md flex items-center text-xs font-mono font-bold bg-muted text-muted-foreground">
                                ₹{patient?.balance.toLocaleString() || "0"}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="amount" className="text-xs">Amount to Collect (₹) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                max={patient?.balance}
                                placeholder="e.g. 2500"
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="mode" className="text-xs">Payment Method</Label>
                            <Select value={mode} onValueChange={setMode}>
                                <SelectTrigger id="mode" className="h-9 text-xs cursor-pointer">
                                    <SelectValue placeholder="Select Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["UPI", "Cash", "Card", "Bank Transfer"].map((m) => (
                                        <SelectItem key={m} value={m} className="text-xs cursor-pointer">
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="description" className="text-xs">Transaction Reference / Description</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. UPI Ref: 123456789..."
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2 gap-2">
                        <Button type="button" variant="outline" className="h-9 text-xs cursor-pointer" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                            Collect Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
