"use client"

import React, { useState, useEffect } from "react"
import { CalendarIcon, CreditCard, Sparkles, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PatientSearchSelect } from "@/components/ui/patient-search-select"
import { Patient, initialPatients } from "@/app/(app)/c/[company]/dashboard/patient-management/patients/_patient-table/patient-data"

interface CreateSubscriptionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const mockPlans = [
    { id: "plan-1", name: "Physio Restore Basic", price: 1500, cycle: "monthly" },
    { id: "plan-2", name: "Physio Care Premium", price: 3500, cycle: "monthly" },
    { id: "plan-3", name: "Yoga Plus Pro", price: 2500, cycle: "monthly" },
    { id: "plan-4", name: "Sports Rehab Intensive", price: 6000, cycle: "monthly" },
    { id: "plan-5", name: "Annual Health Wellness", price: 25000, cycle: "yearly" },
]

export function CreateSubscriptionDialog({
    open,
    onOpenChange,
}: CreateSubscriptionDialogProps) {
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatientId, setSelectedPatientId] = useState("")
    const [selectedPlanId, setSelectedPlanId] = useState("plan-2")
    const [customPrice, setCustomPrice] = useState("3500")
    const [startDate, setStartDate] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("upi")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load patients from localStorage on open
    useEffect(() => {
        if (open) {
            const savedPatients = localStorage.getItem("sg-patients")
            if (savedPatients) {
                setPatients(JSON.parse(savedPatients))
            } else {
                setPatients(initialPatients)
            }
            const today = new Date().toISOString().split("T")[0]
            setStartDate(today)
        }
    }, [open])

    // Update custom price when plan changes
    const handlePlanChange = (planId: string) => {
        setSelectedPlanId(planId)
        const plan = mockPlans.find((p) => p.id === planId)
        if (plan) {
            setCustomPrice(String(plan.price))
        }
    }

    const patientOptions = patients.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.id})`,
    }))

    const handleCreate = () => {
        if (!selectedPatientId) {
            toast.error("Please select a patient.")
            return
        }

        const patient = patients.find((p) => p.id === selectedPatientId)
        const plan = mockPlans.find((p) => p.id === selectedPlanId)

        if (!patient || !plan) {
            toast.error("Invalid patient or plan selection.")
            return
        }

        setIsSubmitting(true)

        // Mock network delay
         setTimeout(() => {
            const finalAmount = parseFloat(customPrice) || plan.price
            
            // Update patient balance in localStorage
            const updatedPatients = patients.map((p) => {
                if (p.id === selectedPatientId) {
                    return {
                        ...p,
                        balance: p.balance + finalAmount,
                    }
                }
                return p
            })
            localStorage.setItem("sg-patients", JSON.stringify(updatedPatients))
            
            // Create subscription record
            const newSub = {
                id: `SUB-${Math.floor(100 + Math.random() * 900)}`,
                patientId: selectedPatientId,
                patientName: patient.name,
                planName: plan.name,
                price: finalAmount,
                cycle: plan.cycle,
                startDate: startDate,
                renewalDate: new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString().split("T")[0],
                status: "Active"
            }
            
            const savedSubs = localStorage.getItem("sg-subscriptions")
            const currentSubs = savedSubs ? JSON.parse(savedSubs) : []
            localStorage.setItem("sg-subscriptions", JSON.stringify([newSub, ...currentSubs]))
            
            // Dispatch standard storage event so other components sync
            window.dispatchEvent(new Event("storage"))
            window.dispatchEvent(new CustomEvent("sg-patients-updated"))
            window.dispatchEvent(new CustomEvent("sg-subscriptions-updated"))

            toast.success(`Successfully activated "${plan.name}" for ${patient.name}!`)
            
            setIsSubmitting(false)
            onOpenChange(false)
            // Reset state
            setSelectedPatientId("")
            setSelectedPlanId("plan-2")
            setCustomPrice("3500")
        }, 800)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px] bg-card border border-border rounded-xl shadow-xl overflow-hidden p-0 gap-0">
                <DialogHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-border p-5 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-4.5 w-4.5 text-brand-primary animate-pulse" />
                            Create Plan Subscription
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Set up recurring clinical rehab or wellness subscription plans.
                        </p>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4 font-sans text-xs">
                    {/* Select Patient */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-foreground/80 flex items-center gap-1">
                            👤 Select Patient <span className="text-destructive">*</span>
                        </Label>
                        <PatientSearchSelect
                            options={patientOptions}
                            value={selectedPatientId}
                            onValueChange={setSelectedPatientId}
                            placeholder="Type or select a patient..."
                            className="w-full bg-background border border-border"
                        />
                    </div>

                    {/* Subscription Plan */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground/80">
                                📋 Select Program Plan
                            </Label>
                            <select
                                value={selectedPlanId}
                                onChange={(e) => handlePlanChange(e.target.value)}
                                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            >
                                {mockPlans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground/80">
                                💰 Subscription Price (₹)
                            </Label>
                            <Input
                                type="number"
                                value={customPrice}
                                onChange={(e) => setCustomPrice(e.target.value)}
                                className="h-9 bg-background border border-border text-foreground text-xs font-semibold focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground/80 flex items-center gap-1">
                                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /> Start Billing Date
                            </Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 bg-background border border-border text-foreground text-xs focus:outline-none"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground/80 flex items-center gap-1">
                                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> Payment Mode
                            </Label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            >
                                <option value="upi">UPI (GPay / PhonePe)</option>
                                <option value="card">Credit / Debit Card</option>
                                <option value="net_banking">Net Banking</option>
                                <option value="cash">Cash Payment</option>
                            </select>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-border p-4 gap-2 flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-9 text-xs border border-border hover:bg-accent rounded-md cursor-pointer px-4 font-semibold"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer rounded-md font-semibold px-4 flex items-center gap-1.5"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        Activate Subscription
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
