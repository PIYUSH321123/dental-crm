"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

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

import { 
    Lead, 
    mockTherapists, 
    mockBranches, 
    mockCampaigns 
} from "./_lead-data-table/lead-data"

interface AddLeadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    existingLeads: Lead[]
    onLeadCreated: (newLead: Lead) => void
}

export function AddLeadDialog({
    open,
    onOpenChange,
    existingLeads,
    onLeadCreated,
}: AddLeadDialogProps) {
    const [formName, setFormName] = useState("")
    const [formMobile, setFormMobile] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formAge, setFormAge] = useState("")
    const [formGender, setFormGender] = useState<"Male" | "Female" | "Other" | "">("")
    const [formCity, setFormCity] = useState("")
    const [formOccupation, setFormOccupation] = useState("")
    const [formPainArea, setFormPainArea] = useState("")
    const [formCondition, setFormCondition] = useState("")
    const [formSource, setFormSource] = useState<Lead["source"] | "">("")
    const [formCampaign, setFormCampaign] = useState("")
    const [formTherapist, setFormTherapist] = useState("")
    const [formBranch, setFormBranch] = useState("")
    const [formNotes, setFormNotes] = useState("")
    
    const [errors, setErrors] = useState<Record<string, string>>({})

    const resetForm = () => {
        setFormName("")
        setFormMobile("")
        setFormEmail("")
        setFormAge("")
        setFormGender("")
        setFormCity("")
        setFormOccupation("")
        setFormPainArea("")
        setFormCondition("")
        setFormSource("")
        setFormCampaign("")
        setFormTherapist("")
        setFormBranch("")
        setFormNotes("")
        setErrors({})
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const tempErrors: Record<string, string> = {}
        
        if (!formName.trim()) tempErrors.name = "Name is required"
        
        if (!formMobile.trim()) {
            tempErrors.mobile = "Mobile is required"
        } else if (!/^\+?[1-9]\d{9,14}$/.test(formMobile.replace(/\s+/g, ''))) {
            tempErrors.mobile = "Invalid mobile number. Use E.164 format (e.g. +919876543210)"
        } else {
            const duplicate = existingLeads.find(
                l => l.mobile.replace(/\s+/g, '') === formMobile.replace(/\s+/g, '')
            )
            if (duplicate) {
                tempErrors.mobile = "A lead with this mobile number already exists."
            }
        }
        
        if (!formBranch) tempErrors.branch = "Branch is required"
        if (!formSource) tempErrors.source = "Source is required"

        if (Object.keys(tempErrors).length > 0) {
            setErrors(tempErrors)
            return
        }

        const newId = `lead-${Date.now()}`
        const timestamp = new Date().toISOString()
        const assignedTherapist = formTherapist || "ther-1" // Default is Dr. Rahul Sharma

        const newLead: Lead = {
            id: newId,
            name: formName,
            mobile: formMobile,
            email: formEmail || undefined,
            age: formAge ? Number(formAge) : undefined,
            gender: formGender || undefined,
            city: formCity || undefined,
            occupation: formOccupation || undefined,
            pain_area: formPainArea || undefined,
            condition: formCondition || undefined,
            source: formSource as Lead["source"],
            campaign_id: formCampaign || undefined,
            assigned_therapist_id: assignedTherapist,
            status: "New",
            notes: formNotes || undefined,
            branch_id: formBranch,
            created_at: timestamp
        }

        onLeadCreated(newLead)
        resetForm()
        onOpenChange(false)
    }

    return (
        <Dialog 
            open={open} 
            onOpenChange={(newOpen) => {
                onOpenChange(newOpen)
                if (!newOpen) resetForm()
            }}
        >
            <DialogContent 
                className="max-w-4xl lg:max-w-[70vw] max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                        Create a new lead opportunity. Auto-triggers WhatsApp welcome and default therapist assignment.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="add-name" className="text-xs font-semibold">Name *</Label>
                            <Input 
                                id="add-name"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Enter full name"
                                className="h-9"
                            />
                            {errors.name && <span className="text-xxs text-destructive font-semibold">{errors.name}</span>}
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label htmlFor="add-mobile" className="text-xs font-semibold">Mobile (E.164) *</Label>
                            <Input 
                                id="add-mobile"
                                value={formMobile}
                                onChange={(e) => setFormMobile(e.target.value)}
                                placeholder="e.g. +919876543210"
                                className="h-9 font-mono"
                            />
                            {errors.mobile && <span className="text-xxs text-destructive font-semibold">{errors.mobile}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-email" className="text-xs font-semibold">Email Address</Label>
                            <Input 
                                id="add-email"
                                type="email"
                                value={formEmail}
                                onChange={(e) => setFormEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-age" className="text-xs font-semibold">Age</Label>
                            <Input 
                                id="add-age"
                                type="number"
                                value={formAge}
                                onChange={(e) => setFormAge(e.target.value)}
                                placeholder="1-120"
                                min="1"
                                max="120"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-gender" className="text-xs font-semibold">Gender</Label>
                            <Select value={formGender} onValueChange={(val: any) => setFormGender(val)}>
                                <SelectTrigger id="add-gender" className="h-9">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-city" className="text-xs font-semibold">City</Label>
                            <Input 
                                id="add-city"
                                value={formCity}
                                onChange={(e) => setFormCity(e.target.value)}
                                placeholder="City name"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-occupation" className="text-xs font-semibold">Occupation</Label>
                            <Input 
                                id="add-occupation"
                                value={formOccupation}
                                onChange={(e) => setFormOccupation(e.target.value)}
                                placeholder="e.g. Software Engineer"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-pain" className="text-xs font-semibold">Pain Area / Symptoms</Label>
                            <Input 
                                id="add-pain"
                                value={formPainArea}
                                onChange={(e) => setFormPainArea(e.target.value)}
                                placeholder="e.g. Lower Back, Spine"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-condition" className="text-xs font-semibold">Condition (Diagnostic)</Label>
                            <Input 
                                id="add-condition"
                                value={formCondition}
                                onChange={(e) => setFormCondition(e.target.value)}
                                placeholder="e.g. Lumbar Spondylosis"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-source" className="text-xs font-semibold">Marketing Source *</Label>
                            <Select value={formSource} onValueChange={(val: any) => setFormSource(val)}>
                                <SelectTrigger id="add-source" className="h-9">
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["Facebook", "Google", "Instagram", "YouTube", "WhatsApp", "Doctor Referral", "Walk-in", "Health Camp", "Corporate", "Newspaper", "QR Code"].map(src => (
                                        <SelectItem key={src} value={src}>{src}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.source && <span className="text-xxs text-destructive font-semibold">{errors.source}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-campaign" className="text-xs font-semibold">Campaign Link</Label>
                            <Select value={formCampaign} onValueChange={setFormCampaign}>
                                <SelectTrigger id="add-campaign" className="h-9">
                                    <SelectValue placeholder="Linked Campaign" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockCampaigns.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-therapist" className="text-xs font-semibold">Assigned Therapist</Label>
                            <Select value={formTherapist} onValueChange={setFormTherapist}>
                                <SelectTrigger id="add-therapist" className="h-9">
                                    <SelectValue placeholder="Auto-assigned if empty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockTherapists.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add-branch" className="text-xs font-semibold">Branch Location *</Label>
                            <Select value={formBranch} onValueChange={setFormBranch}>
                                <SelectTrigger id="add-branch" className="h-9">
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockBranches.map(b => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.branch && <span className="text-xxs text-destructive font-semibold">{errors.branch}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="add-notes" className="text-xs font-semibold">Consultation Notes / Intake details</Label>
                        <textarea 
                            id="add-notes"
                            value={formNotes}
                            onChange={(e) => setFormNotes(e.target.value)}
                            placeholder="Add specific pain triggers, prior clinical history, or slot preference..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary text-primary-foreground">
                            Save Lead
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
