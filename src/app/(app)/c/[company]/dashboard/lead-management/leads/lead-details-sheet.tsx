"use client"

import React, { useState, useEffect } from "react"
import { 
    Save, 
    Activity, 
    Sparkles, 
    MessageSquare, 
    Phone, 
    Clock, 
    Check 
} from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { 
    Lead, 
    ActivityLog, 
    mockTherapists, 
    mockBranches, 
    mockCampaigns 
} from "./_lead-data-table/lead-data"

interface LeadDetailsSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead: Lead | null
    activities: ActivityLog[]
    onSave: (updatedLead: Lead) => void
}

export function LeadDetailsSheet({
    open,
    onOpenChange,
    lead,
    activities,
    onSave,
}: LeadDetailsSheetProps) {
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
    const [formStatus, setFormStatus] = useState<Lead["status"]>("New")
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (open && lead) {
            setFormName(lead.name)
            setFormMobile(lead.mobile)
            setFormEmail(lead.email || "")
            setFormAge(lead.age ? String(lead.age) : "")
            setFormGender(lead.gender || "")
            setFormCity(lead.city || "")
            setFormOccupation(lead.occupation || "")
            setFormPainArea(lead.pain_area || "")
            setFormCondition(lead.condition || "")
            setFormSource(lead.source)
            setFormCampaign(lead.campaign_id || "")
            setFormTherapist(lead.assigned_therapist_id || "")
            setFormBranch(lead.branch_id)
            setFormNotes(lead.notes || "")
            setFormStatus(lead.status)
            setErrors({})
        }
    }, [open, lead])

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!lead) return

        const tempErrors: Record<string, string> = {}
        if (!formName.trim()) tempErrors.name = "Name is required"
        if (!formMobile.trim()) tempErrors.mobile = "Mobile is required"
        if (!formBranch) tempErrors.branch = "Branch is required"
        if (!formSource) tempErrors.source = "Source is required"

        if (Object.keys(tempErrors).length > 0) {
            setErrors(tempErrors)
            return
        }

        const updatedLead: Lead = {
            ...lead,
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
            assigned_therapist_id: formTherapist || undefined,
            branch_id: formBranch,
            notes: formNotes || undefined,
            status: formStatus
        }

        onSave(updatedLead)
        onOpenChange(false)
    }

    const leadActivities = lead ? activities.filter(a => a.lead_id === lead.id) : []
    const kanbanStatuses: Lead["status"][] = [
        "New", "Contacted", "Interested", "Consultation Booked", "Assessment Done", "Converted", "Lost"
    ]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-lg font-bold">
                        Lead Profile: {lead?.name}
                    </SheetTitle>
                    <SheetDescription>
                        Edit details or view timeline of logged events and messages.
                    </SheetDescription>
                </SheetHeader>

                {lead && (
                    <Tabs defaultValue="details" className="mt-6 space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Details Form</TabsTrigger>
                            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
                        </TabsList>

                        {/* DETAILS FORM TAB */}
                        <TabsContent value="details">
                            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-name" className="text-xs font-semibold">Name *</Label>
                                        <Input 
                                            id="edit-name"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="h-9"
                                        />
                                        {errors.name && <span className="text-xxs text-destructive font-semibold">{errors.name}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-mobile" className="text-xs font-semibold">Mobile (E.164) *</Label>
                                        <Input 
                                            id="edit-mobile"
                                            value={formMobile}
                                            onChange={(e) => setFormMobile(e.target.value)}
                                            className="h-9 font-mono"
                                        />
                                        {errors.mobile && <span className="text-xxs text-destructive font-semibold">{errors.mobile}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-email" className="text-xs font-semibold">Email Address</Label>
                                        <Input 
                                            id="edit-email"
                                            value={formEmail}
                                            onChange={(e) => setFormEmail(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-status" className="text-xs font-semibold">Lead Status</Label>
                                        <Select value={formStatus} onValueChange={(val: any) => setFormStatus(val)}>
                                            <SelectTrigger id="edit-status" className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {kanbanStatuses.map(st => (
                                                    <SelectItem key={st} value={st}>{st}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-age" className="text-xs font-semibold">Age</Label>
                                        <Input 
                                            id="edit-age"
                                            type="number"
                                            value={formAge}
                                            onChange={(e) => setFormAge(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-gender" className="text-xs font-semibold">Gender</Label>
                                        <Select value={formGender} onValueChange={(val: any) => setFormGender(val)}>
                                            <SelectTrigger id="edit-gender" className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-city" className="text-xs font-semibold">City</Label>
                                        <Input 
                                            id="edit-city"
                                            value={formCity}
                                            onChange={(e) => setFormCity(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-occupation" className="text-xs font-semibold">Occupation</Label>
                                        <Input 
                                            id="edit-occupation"
                                            value={formOccupation}
                                            onChange={(e) => setFormOccupation(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-pain" className="text-xs font-semibold">Pain Area</Label>
                                        <Input 
                                            id="edit-pain"
                                            value={formPainArea}
                                            onChange={(e) => setFormPainArea(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-condition" className="text-xs font-semibold">Condition</Label>
                                        <Input 
                                            id="edit-condition"
                                            value={formCondition}
                                            onChange={(e) => setFormCondition(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-therapist" className="text-xs font-semibold">Assigned Therapist</Label>
                                        <Select value={formTherapist} onValueChange={setFormTherapist}>
                                            <SelectTrigger id="edit-therapist" className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockTherapists.map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-branch" className="text-xs font-semibold">Branch Location *</Label>
                                        <Select value={formBranch} onValueChange={setFormBranch}>
                                            <SelectTrigger id="edit-branch" className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockBranches.map(b => (
                                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-notes" className="text-xs font-semibold">Clinical / Booking Notes</Label>
                                    <textarea 
                                        id="edit-notes"
                                        value={formNotes}
                                        onChange={(e) => setFormNotes(e.target.value)}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="gap-1.5 bg-primary text-primary-foreground">
                                        <Save className="h-4 w-4" />
                                        <span>Save Profile</span>
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>

                        {/* ACTIVITY TIMELINE TAB */}
                        <TabsContent value="timeline">
                            <div className="space-y-6 pt-2">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    Interaction Timeline
                                </h3>
                                
                                {leadActivities.length > 0 ? (
                                    <div className="relative pl-6 border-l border-muted space-y-6">
                                        {leadActivities.map((act) => {
                                            let iconColor = "bg-muted text-muted-foreground border-border"
                                            let icon = <Activity className="h-3 w-3" />

                                            if (act.type === "creation") {
                                                iconColor = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400"
                                                icon = <Sparkles className="h-3 w-3" />
                                            } else if (act.type === "whatsapp") {
                                                iconColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                                                icon = <MessageSquare className="h-3 w-3" />
                                            } else if (act.type === "call") {
                                                iconColor = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400"
                                                icon = <Phone className="h-3 w-3" />
                                            } else if (act.type === "conversion") {
                                                iconColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                                                icon = <Check className="h-3 w-3" />
                                            } else if (act.type === "followup") {
                                                iconColor = "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400"
                                                icon = <Clock className="h-3 w-3" />
                                            }

                                            return (
                                                <div key={act.id} className="relative group">
                                                    <span className={`absolute -left-[35px] mt-0.5 rounded-full border p-1.5 ${iconColor}`}>
                                                        {icon}
                                                    </span>
                                                    
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <h4 className="font-bold text-sm text-foreground">{act.title}</h4>
                                                            <span className="text-xxs text-muted-foreground font-mono">
                                                                {new Date(act.timestamp).toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {act.description}
                                                        </p>
                                                        {act.operator && (
                                                            <span className="text-[10px] text-muted-foreground font-medium mt-1">
                                                                Logged by: {act.operator}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-sm text-muted-foreground">
                                        No logged activities found for this lead.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </SheetContent>
        </Sheet>
    )
}
