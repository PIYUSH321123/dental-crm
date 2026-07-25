"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Campaign, User, Branch, fetchMockBranches } from "./data"
import { createMetaCampaignAction, createCampaignAction } from "@/lib/actions/campaigns"

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

    const params = useParams()
    const companySlug = (params?.company as string) || "clinic"

    // Form fields state
    const [campaignName, setCampaignName] = useState("")
    const [source, setSource] = useState<string>("")
    const [budget, setBudget] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [isOngoing, setIsOngoing] = useState(false)
    const [targetCondition, setTargetCondition] = useState("")
    const [landingPageUrl, setLandingPageUrl] = useState("")
    const [assignedStaffId, setAssignedStaffId] = useState<string>("")
    const [status, setStatus] = useState<string>("Draft")
    const [branchId, setBranchId] = useState<string>("")
    const [notes, setNotes] = useState("")

    // Meta-specific settings
    const [objective, setObjective] = useState<string>("OUTCOME_LEADS")
    const [specialAdCategories, setSpecialAdCategories] = useState<string[]>(["NONE"])
    const [buyingType, setBuyingType] = useState<string>("AUCTION")
    const [bidStrategy, setBidStrategy] = useState<string>("LOWEST_COST_WITHOUT_CAP")
    const [budgetType, setBudgetType] = useState<string>("daily")
    const [spendCap, setSpendCap] = useState<string>("")

    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    // Fetch branches and staff options dynamically on dialog open
    useEffect(() => {
        if (!open) return

        async function loadOptions() {
            setLoadingOptions(true)
            try {
                const [staffRes, branchRes] = await Promise.all([
                    fetch(`/api/staff?companySlug=${companySlug}`),
                    fetch(`/api/branches?companySlug=${companySlug}`)
                ])
                const staffData = await staffRes.json()
                const branchData = await branchRes.json()

                if (staffData.success) {
                    const mappedUsers: User[] = staffData.staff.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        role: s.role === "COMPANY_ADMIN" ? "Clinic Admin" : "Therapist"
                    }))
                    setUsers(mappedUsers)
                } else {
                    toast.error("Failed to load staff list from database")
                }

                if (branchData.success && branchData.branches.length > 0) {
                    setBranches(branchData.branches)
                    if (!branchId && branchData.branches[0]) {
                        setBranchId(branchData.branches[0].id)
                    }
                } else {
                    const fallback = await fetchMockBranches()
                    setBranches(fallback)
                    if (!branchId && fallback[0]) {
                        setBranchId(fallback[0].id)
                    }
                }
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
        setIsOngoing(false)
        setTargetCondition("")
        setLandingPageUrl("")
        setAssignedStaffId("")
        setStatus("Draft")
        setBranchId("")
        setNotes("")
        setObjective("OUTCOME_LEADS")
        setSpecialAdCategories(["NONE"])
        setBuyingType("AUCTION")
        setBidStrategy("LOWEST_COST_WITHOUT_CAP")
        setBudgetType("daily")
        setSpendCap("")
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

        if (startDate && endDate && !isOngoing) {
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

        if ((source === "Facebook" || source === "Instagram") && spendCap) {
            const numSpendCap = Number(spendCap)
            if (isNaN(numSpendCap) || numSpendCap <= 0) {
                tempErrors.spendCap = "Spend cap must be a positive number"
            }
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

        // Call API / Server Action if campaign source is Meta
        const isMetaSource = source === "Facebook" || source === "Instagram"
        let metaCampaignId = `camp-${Date.now()}`

        try {
            if (isMetaSource) {
                const apiInput = {
                    name: campaignName.trim(),
                    objective: objective,
                    status: (status === "Active" ? "ACTIVE" : "PAUSED") as "ACTIVE" | "PAUSED",
                    special_ad_categories: specialAdCategories,
                    buying_type: buyingType as any,
                    bid_strategy: bidStrategy as any,
                    daily_budget: budgetType === "daily" ? parseFloat(budget) : undefined,
                    lifetime_budget: budgetType === "lifetime" ? parseFloat(budget) : undefined,
                    spend_cap: spendCap ? parseFloat(spendCap) : undefined,
                }

                const response = await createMetaCampaignAction(companySlug, apiInput)
                if (response.success && response.data?.id) {
                    metaCampaignId = response.data.id
                    if (response.data.simulated) {
                        toast.success("Meta Ads Campaign created (Simulated)")
                    } else {
                        toast.success(`Synced with Meta Ads (Campaign ID: ${response.data.id})`)
                    }
                } else {
                    toast.error(`Meta Ads Sync Failed: ${response.error || "Integration is disconnected."}`)
                    setSubmitting(false)
                    return
                }
            } else {
                // Simulate regular API latency
                await new Promise((resolve) => setTimeout(resolve, 800))
            }

            const newCampaign: Campaign = {
                id: metaCampaignId,
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

            const dbResponse = await createCampaignAction(companySlug, {
                id: newCampaign.id,
                campaign_name: newCampaign.campaign_name,
                source: newCampaign.source,
                budget: newCampaign.budget,
                status: newCampaign.status,
                start_date: newCampaign.start_date,
                end_date: newCampaign.end_date,
                target_condition: newCampaign.target_condition,
                landing_page_url: newCampaign.landing_page_url,
                assigned_staff_id: newCampaign.assigned_staff_id,
                branch_id: newCampaign.branch_id,
                notes: newCampaign.notes,
            })

            if (!dbResponse.success) {
                toast.error(`Database Error: ${dbResponse.error || "Failed to save to database."}`)
                setSubmitting(false)
                return
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
                className="max-w-2xl lg:max-w-[70vw] w-full p-6 sm:p-8 rounded-2xl border bg-card text-foreground shadow-lg overflow-y-auto max-h-[90vh]"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Campaign Name */}
                            <div className="space-y-2 col-span-2 lg:col-span-3">
                                <Label htmlFor="campaignName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Campaign Name <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="campaignName"
                                    placeholder="e.g. Back Pain Awareness Month"
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
                                    <Label htmlFor="endDate" className={`text-xs font-semibold uppercase tracking-wider ${isOngoing ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                                        End Date
                                    </Label>
                                    <div className="ml-3 flex items-center gap-2">
                                        <Checkbox
                                            id="isOngoing"
                                            checked={isOngoing}
                                            onCheckedChange={(checked) => {
                                                setIsOngoing(!!checked)
                                                if (checked) {
                                                    setEndDate("")
                                                    if (errors.endDate) {
                                                        setErrors((prev) => {
                                                            const { endDate: _, ...rest } = prev
                                                            return rest
                                                        })
                                                    }
                                                }
                                            }}
                                        />
                                        <Label
                                            htmlFor="isOngoing"
                                            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none"
                                        >
                                            Ongoing
                                        </Label>
                                    </div>
                                </div>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    disabled={isOngoing}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={`h-10 text-sm ${errors.endDate ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                />
                                {errors.endDate && !isOngoing && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.endDate}
                                    </span>
                                )}
                            </div>



                            {/* Landing Page URL */}
                            <div className="space-y-2 col-span-2 lg:col-span-3">
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

                        {(source === "Facebook" || source === "Instagram") && (
                            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/10 dark:bg-blue-950/5 space-y-4">
                                <div className="flex items-center gap-2 border-b border-blue-150 dark:border-blue-900/40 pb-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        Meta Ads Campaign Settings
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Campaign Objective */}
                                    <div className="space-y-2">
                                        <Label htmlFor="metaObjective" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Campaign Objective
                                        </Label>
                                        <Select value={objective} onValueChange={setObjective}>
                                            <SelectTrigger id="metaObjective" className="h-10 w-full flex bg-card">
                                                <SelectValue placeholder="Select Objective" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OUTCOME_LEADS">Leads (OUTCOME_LEADS)</SelectItem>
                                                <SelectItem value="OUTCOME_TRAFFIC">Traffic (OUTCOME_TRAFFIC)</SelectItem>
                                                <SelectItem value="OUTCOME_SALES">Sales (OUTCOME_SALES)</SelectItem>
                                                <SelectItem value="OUTCOME_AWARENESS">Awareness (OUTCOME_AWARENESS)</SelectItem>
                                                <SelectItem value="OUTCOME_ENGAGEMENT">Engagement (OUTCOME_ENGAGEMENT)</SelectItem>
                                                <SelectItem value="OUTCOME_APP_PROMOTION">App Promotion (OUTCOME_APP_PROMOTION)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Budget Distribution */}
                                    <div className="space-y-2">
                                        <Label htmlFor="metaBudgetType" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Budget Distribution
                                        </Label>
                                        <Select value={budgetType} onValueChange={setBudgetType}>
                                            <SelectTrigger id="metaBudgetType" className="h-10 w-full flex bg-card">
                                                <SelectValue placeholder="Select Budget Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily Budget</SelectItem>
                                                <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Buying Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="metaBuyingType" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Buying Type
                                        </Label>
                                        <Select value={buyingType} onValueChange={setBuyingType}>
                                            <SelectTrigger id="metaBuyingType" className="h-10 w-full flex bg-card">
                                                <SelectValue placeholder="Select Buying Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AUCTION">Auction (AUCTION)</SelectItem>
                                                <SelectItem value="RESERVED">Reserved (RESERVED)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Special Ad Category */}
                                    <div className="space-y-2">
                                        <Label htmlFor="metaSpecialAdCategory" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Special Ad Category <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select 
                                            value={specialAdCategories[0] || "NONE"} 
                                            onValueChange={(val) => setSpecialAdCategories([val])}
                                        >
                                            <SelectTrigger id="metaSpecialAdCategory" className="h-10 w-full flex bg-card">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NONE">None (NONE)</SelectItem>
                                                <SelectItem value="HOUSING">Housing (HOUSING)</SelectItem>
                                                <SelectItem value="EMPLOYMENT">Employment (EMPLOYMENT)</SelectItem>
                                                <SelectItem value="CREDIT">Credit (CREDIT)</SelectItem>
                                                <SelectItem value="ISSUES_ELECTIONS_POLITICS">Issues/Elections/Politics</SelectItem>
                                                <SelectItem value="ONLINE_GAMBLING_AND_GAMING">Online Gambling & Gaming</SelectItem>
                                                <SelectItem value="FINANCIAL_PRODUCTS_SERVICES">Financial Products & Services</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Bid Strategy */}
                                    <div className="space-y-2">
                                        <Label htmlFor="metaBidStrategy" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Bid Strategy
                                        </Label>
                                        <Select value={bidStrategy} onValueChange={setBidStrategy}>
                                            <SelectTrigger id="metaBidStrategy" className="h-10 w-full flex bg-card">
                                                <SelectValue placeholder="Select Bid Strategy" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOWEST_COST_WITHOUT_CAP">Lowest Cost (No Cap)</SelectItem>
                                                <SelectItem value="LOWEST_COST_WITH_BID_CAP">Lowest Cost (Bid Cap)</SelectItem>
                                                <SelectItem value="COST_CAP">Cost Cap</SelectItem>
                                                <SelectItem value="LOWEST_COST_WITH_MIN_ROAS">Min ROAS Strategy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Spend Cap */}
                                    <div className="space-y-2">
                                        <Label htmlFor="metaSpendCap" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Spend Cap (INR, Optional)
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-semibold">₹</span>
                                            <Input
                                                id="metaSpendCap"
                                                type="number"
                                                placeholder="e.g. 100000"
                                                value={spendCap}
                                                onChange={(e) => setSpendCap(e.target.value)}
                                                className={`h-10 pl-7 bg-card ${errors.spendCap ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                            />
                                        </div>
                                        {errors.spendCap && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.spendCap}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

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
