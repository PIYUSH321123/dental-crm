"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Campaign, User, Branch, fetchMockUsers, fetchMockBranches } from "./data"

interface CreateCampaignDialogProps {
    existingCampaigns: Campaign[]
    onCampaignCreated: (newCampaign: Campaign) => void
}

export function CreateCampaignDialog({
    existingCampaigns,
    onCampaignCreated,
}: CreateCampaignDialogProps) {
    const [open, setOpen] = useState(false)
    
    // Dropdown options loaded from dummy APIs
    const [users, setUsers] = useState<User[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loadingOptions, setLoadingOptions] = useState(false)

    // Form fields state
    const [campaignName, setCampaignName] = useState("")
    const [source, setSource] = useState<string>("")
    const [budget, setBudget] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [targetCondition, setTargetCondition] = useState("")
    const [landingPageUrl, setLandingPageUrl] = useState("")
    const [assignedStaffId, setAssignedStaffId] = useState<string>("")
    const [status, setStatus] = useState<string>("Draft")
    const [branchId, setBranchId] = useState<string>("")
    const [notes, setNotes] = useState("")

    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    // Fetch branches and staff options dynamically on dialog open
    useEffect(() => {
        if (!open) return

        async function loadOptions() {
            setLoadingOptions(true)
            try {
                const [fetchedUsers, fetchedBranches] = await Promise.all([
                    fetchMockUsers(),
                    fetchMockBranches()
                ])
                setUsers(fetchedUsers)
                setBranches(fetchedBranches)
            } catch (err) {
                console.error("Failed to load options", err)
                toast.error("Failed to load staff and branch lists")
            } finally {
                setLoadingOptions(false)
            }
        }

        loadOptions()
    }, [open])

    // Reset form states
    const resetForm = () => {
        setCampaignName("")
        setSource("")
        setBudget("")
        setStartDate("")
        setEndDate("")
        setTargetCondition("")
        setLandingPageUrl("")
        setAssignedStaffId("")
        setStatus("Draft")
        setBranchId("")
        setNotes("")
        setErrors({})
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            resetForm()
        }
    }

    // Validation rules
    const validate = (): boolean => {
        const tempErrors: Record<string, string> = {}

        if (!campaignName.trim()) {
            tempErrors.campaignName = "Campaign name is required"
        } else if (campaignName.trim().length < 3) {
            tempErrors.campaignName = "Campaign name must be at least 3 characters"
        } else if (campaignName.trim().length > 200) {
            tempErrors.campaignName = "Campaign name must be under 200 characters"
        }

        if (!source) {
            tempErrors.source = "Campaign source is required"
        }

        if (!budget) {
            tempErrors.budget = "Budget is required"
        } else {
            const numBudget = Number(budget)
            if (isNaN(numBudget) || numBudget <= 0) {
                tempErrors.budget = "Budget must be a positive number"
            }
        }

        if (!startDate) {
            tempErrors.startDate = "Start date is required"
        }

        if (startDate && endDate) {
            if (new Date(endDate) < new Date(startDate)) {
                tempErrors.endDate = "End date cannot be earlier than start date"
            }
        }

        if (landingPageUrl.trim()) {
            try {
                // Quick URL format validation
                new URL(landingPageUrl)
            } catch {
                tempErrors.landingPageUrl = "Please enter a valid URL (e.g. https://example.com)"
            }
        }

        if (!branchId) {
            tempErrors.branchId = "Branch selection is required"
        } else if (campaignName.trim()) {
            // Check for uniqueness of campaign name in the selected branch
            const isDuplicate = existingCampaigns.some(
                (c) =>
                    c.branch_id === branchId &&
                    c.campaign_name.trim().toLowerCase() === campaignName.trim().toLowerCase()
            )
            if (isDuplicate) {
                tempErrors.campaignName = "A campaign with this name already exists in the selected branch"
            }
        }

        if (!status) {
            tempErrors.status = "Status is required"
        }

        setErrors(tempErrors)
        return Object.keys(tempErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) {
            toast.error("Please resolve the validation errors.")
            return
        }

        setSubmitting(true)

        // Simulate API call to save campaign
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const newCampaign: Campaign = {
                id: `camp-${Date.now()}`,
                campaign_name: campaignName.trim(),
                source: source as any,
                budget: parseFloat(budget),
                leads: 0,
                converted: 0,
                revenue: 0,
                status: status as any,
                start_date: startDate,
                end_date: endDate || null,
                target_condition: targetCondition.trim() || undefined,
                landing_page_url: landingPageUrl.trim() || undefined,
                assigned_staff_id: assignedStaffId !== "none_selected" && assignedStaffId ? assignedStaffId : undefined,
                branch_id: branchId,
                notes: notes.trim() || undefined,
                created_by: "usr-2", // Mock creator (e.g. Priya Patel from JWT)
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            onCampaignCreated(newCampaign)
            toast.success("Campaign created successfully!")
            setOpen(false)
            resetForm()
        } catch (err) {
            console.error("Submission failed", err)
            toast.error("Failed to create campaign. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const sources = [
        "Facebook",
        "Google",
        "Instagram",
        "YouTube",
        "WhatsApp",
        "Doctor Referral",
        "Walk-in",
        "Health Camp",
        "Corporate",
        "Newspaper",
        "QR Code",
    ]

    const statuses = ["Draft", "Active", "Paused", "Completed"]

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="shrink-0 gap-2 font-semibold shadow-xs self-start sm:self-auto cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Create Campaign
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl border bg-card text-foreground shadow-lg overflow-y-auto max-h-[90vh]"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold tracking-tight">Create Marketing Campaign</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Fill out the form below to launch or schedule a new marketing campaign across your clinic branches.
                    </DialogDescription>
                </DialogHeader>

                {loadingOptions ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Fetching clinic branches and staff list...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Campaign Name */}
                            <div className="space-y-2">
                                <Label htmlFor="campaignName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Campaign Name <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="campaignName"
                                    placeholder="e.g. Knee Pain Camp 2026"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    className={`h-10 ${errors.campaignName ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                />
                                {errors.campaignName && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.campaignName}
                                    </span>
                                )}
                            </div>

                            {/* Branch Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="branchId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Target Branch <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={branchId} onValueChange={setBranchId}>
                                    <SelectTrigger
                                        id="branchId"
                                        className={`h-10 w-full flex ${errors.branchId ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                    >
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.branchId && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.branchId}
                                    </span>
                                )}
                            </div>

                            {/* Source Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="source" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Campaign Source <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={source} onValueChange={setSource}>
                                    <SelectTrigger
                                        id="source"
                                        className={`h-10 w-full flex ${errors.source ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                    >
                                        <SelectValue placeholder="Select Source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sources.map((src) => (
                                            <SelectItem key={src} value={src}>
                                                {src}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.source && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.source}
                                    </span>
                                )}
                            </div>

                            {/* Budget Input */}
                            <div className="space-y-2">
                                <Label htmlFor="budget" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Budget (INR) <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-semibold">₹</span>
                                    <Input
                                        id="budget"
                                        type="number"
                                        placeholder="e.g. 50000"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        className={`h-10 pl-7 ${errors.budget ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                    />
                                </div>
                                {errors.budget && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.budget}
                                    </span>
                                )}
                            </div>

                            {/* Start Date */}
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Start Date <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={`h-10 text-sm ${errors.startDate ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                />
                                {errors.startDate && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.startDate}
                                    </span>
                                )}
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="endDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        End Date
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground font-medium italic">Leave empty for ongoing</span>
                                </div>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={`h-10 text-sm ${errors.endDate ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                />
                                {errors.endDate && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.endDate}
                                    </span>
                                )}
                            </div>

                            {/* Target Condition */}
                            <div className="space-y-2">
                                <Label htmlFor="targetCondition" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Target Condition
                                </Label>
                                <Input
                                    id="targetCondition"
                                    placeholder="e.g. Knee pain, Lower back pain"
                                    value={targetCondition}
                                    onChange={(e) => setTargetCondition(e.target.value)}
                                    className="h-10"
                                />
                            </div>

                            {/* Landing Page URL */}
                            <div className="space-y-2">
                                <Label htmlFor="landingPageUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Landing Page URL
                                </Label>
                                <Input
                                    id="landingPageUrl"
                                    type="text"
                                    placeholder="e.g. https://yourclinic.com/campaign"
                                    value={landingPageUrl}
                                    onChange={(e) => setLandingPageUrl(e.target.value)}
                                    className={`h-10 ${errors.landingPageUrl ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                />
                                {errors.landingPageUrl && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.landingPageUrl}
                                    </span>
                                )}
                            </div>

                            {/* Assigned Staff */}
                            <div className="space-y-2">
                                <Label htmlFor="assignedStaff" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Assigned Staff
                                </Label>
                                <Select value={assignedStaffId} onValueChange={setAssignedStaffId}>
                                    <SelectTrigger id="assignedStaff" className="h-10 w-full flex">
                                        <SelectValue placeholder="Select Staff Member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none_selected">None (Unassigned)</SelectItem>
                                        {users.map((usr) => (
                                            <SelectItem key={usr.id} value={usr.id}>
                                                {usr.name} ({usr.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Campaign Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Status <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger
                                        id="status"
                                        className={`h-10 w-full flex ${errors.status ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                    >
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((st) => (
                                            <SelectItem key={st} value={st}>
                                                {st}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.status}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Notes Area */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Notes / Remarks
                            </Label>
                            <textarea
                                id="notes"
                                placeholder="Additional details about the target audience, copywriting guidelines, tracking parameters, etc."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30"
                            />
                        </div>

                        <DialogFooter className="-mx-6 -mb-6 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-6 sm:-mx-8 sm:-mb-8 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={submitting}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting} className="min-w-[120px] cursor-pointer">
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Campaign"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
