"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useParams } from "next/navigation"
import { 
    Users, 
    UserPlus, 
    Mail, 
    Shield, 
    Loader2, 
    KeyRound, 
    Calendar,
    Briefcase,
    Building2,
    Plus
} from "lucide-react"
import { toast } from "sonner"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { DataTable } from "@/app/(admin)/admin/projects/data-table"

interface StaffMember {
    id: string
    name: string
    email: string
    role: string
    branchId: string | null
    address: string | null
    createdAt: string
}

export default function StaffManagementPage() {
    const params = useParams()
    const companySlug = params.company as string

    const [staff, setStaff] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [dialogOpen, setDialogOpen] = useState(false)

    // Branches state
    const [branches, setBranches] = useState<any[]>([])
    const [branchDialogOpen, setBranchDialogOpen] = useState(false)
    const [newBranchName, setNewBranchName] = useState("")
    const [newBranchAddress, setNewBranchAddress] = useState("")
    const [creatingBranch, setCreatingBranch] = useState(false)

    // Form fields
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("STAFF")
    const [branchId, setBranchId] = useState("")
    const [address, setAddress] = useState("")

    const loadBranches = async () => {
        try {
            const res = await fetch(`/api/branches?companySlug=${companySlug}`)
            const data = await res.json()
            if (data.success) {
                setBranches(data.branches)
                if (data.branches.length === 0) {
                    await seedDefaultBranches()
                } else if (!branchId && data.branches[0]) {
                    setBranchId(data.branches[0].id)
                }
            }
        } catch (error) {
            console.error("Error loading branches:", error)
        }
    }

    const seedDefaultBranches = async () => {
        const defaults = [
            { name: "Mumbai - Andheri West", address: "Andheri Link Road, Mumbai" },
            { name: "Mumbai - Bandra East", address: "BKC Road, Bandra East, Mumbai" },
            { name: "Delhi - Connaught Place", address: "Inner Circle, Connaught Place, New Delhi" },
            { name: "Bengaluru - Indiranagar", address: "100 Feet Road, Indiranagar, Bengaluru" }
        ]
        try {
            for (const item of defaults) {
                await fetch("/api/branches", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        companySlug,
                        name: item.name,
                        address: item.address
                    })
                })
            }
            // Reload branches
            const res = await fetch(`/api/branches?companySlug=${companySlug}`)
            const data = await res.json()
            if (data.success) {
                setBranches(data.branches)
                if (data.branches[0]) {
                    setBranchId(data.branches[0].id)
                }
            }
        } catch (err) {
            console.error("Failed to seed default branches", err)
        }
    }

    const loadStaff = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/staff?companySlug=${companySlug}`)
            const data = await res.json()
            if (data.success) {
                setStaff(data.staff)
            } else {
                toast.error(data.message || "Failed to load staff list.")
            }
        } catch (error) {
            console.error("Error loading staff:", error)
            toast.error("Failed to load staff due to network error.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (companySlug) {
            loadStaff()
            loadBranches()
        }
    }, [companySlug])

    const handleAddStaffSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("Please fill in all required fields.")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.")
            return
        }

        startTransition(async () => {
            try {
                const res = await fetch("/api/staff", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        companySlug,
                        name,
                        email,
                        password,
                        role,
                        branchId,
                        address,
                    }),
                })
                const data = await res.json()

                if (data.success) {
                    toast.success(`Staff member "${name}" registered successfully!`)
                    
                    // Reset form
                    setName("")
                    setEmail("")
                    setPassword("")
                    setRole("STAFF")
                    setBranchId(branches[0]?.id || "")
                    setAddress("")
                    setDialogOpen(false)

                    // Reload list
                    loadStaff()
                    
                    // Dispatch custom event to notify other workspaces
                    window.dispatchEvent(new Event("sg-patients-updated"))
                } else {
                    toast.error(data.message || "Failed to register staff.")
                }
            } catch (error) {
                console.error("Error adding staff:", error)
                toast.error("Failed to register staff due to server error.")
            }
        })
    }

    const handleCreateBranchSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBranchName.trim()) {
            toast.error("Branch name is required")
            return
        }
        setCreatingBranch(true)
        try {
            const res = await fetch("/api/branches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companySlug,
                    name: newBranchName.trim(),
                    address: newBranchAddress.trim(),
                })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Branch "${newBranchName}" created successfully!`)
                setNewBranchName("")
                setNewBranchAddress("")
                setBranchDialogOpen(false)
                loadBranches()
            } else {
                toast.error(data.message || "Failed to create branch.")
            }
        } catch (error) {
            console.error("Error creating branch:", error)
            toast.error("Error creating branch due to a server connection failure.")
        } finally {
            setCreatingBranch(false)
        }
    }

    // Column Definitions matching premium style
    const columns: ColumnDef<StaffMember, any>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const name = row.getValue("name") as string
                const initials = name.substring(0, 2).toUpperCase()
                return (
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {initials}
                        </div>
                        <span className="font-semibold text-foreground text-xs">{name}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "email",
            header: "Email Address",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground font-mono">{row.getValue("email")}</span>
            )
        },
        {
            accessorKey: "role",
            header: "System Access Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string
                const isAdmin = role === "COMPANY_ADMIN"
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isAdmin 
                            ? "bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800" 
                            : "bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                    }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isAdmin ? "bg-indigo-500" : "bg-emerald-500"}`} />
                        {isAdmin ? "Clinic Admin" : "Therapist (Staff)"}
                    </span>
                )
            }
        },
        {
            accessorKey: "branchId",
            header: "Clinic Branch",
            cell: ({ row }) => {
                const bId = row.getValue("branchId") as string
                const branchObj = branches.find((b) => b.id === bId)
                return (
                    <span className="text-xs font-semibold text-foreground">
                        {branchObj ? branchObj.name : "Unassigned"}
                    </span>
                )
            }
        },
        {
            accessorKey: "address",
            header: "Physical Address",
            cell: ({ row }) => {
                const addressVal = row.getValue("address") as string
                return (
                    <span className="text-xs text-muted-foreground truncate max-w-[150px] block" title={addressVal}>
                        {addressVal || "—"}
                    </span>
                )
            }
        },
        {
            accessorKey: "createdAt",
            header: "Joined Date",
            cell: ({ row }) => {
                const dateStr = row.getValue("createdAt") as string
                const formatted = new Date(dateStr).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
                return <span className="text-xs text-muted-foreground">{formatted}</span>
            }
        }
    ]

    const searchFilters = [
        { field: "name", label: "Name" },
        { field: "email", label: "Email" },
    ]

    return (
        <div className="flex-1 space-y-6 p-6 lg:p-8 bg-background text-foreground">
            {/* Header with New Staff button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:px-6 md:py-4 bg-card border border-border rounded-2xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        <Users className="h-6 w-6 text-primary shrink-0" />
                        Staff Directory
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Manage clinical therapists, administrators, and system access rights.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Create Branch Dialog */}
                    <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-1.5 h-9 rounded-md border-border font-semibold text-xs cursor-pointer shadow-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                Create Branch
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md border border-border p-6 rounded-lg bg-card">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-foreground">Create New Branch</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Register a new physical branch location for this clinic.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateBranchSubmit} className="space-y-4 mt-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="branchName" className="text-xs">Branch Name *</Label>
                                    <Input
                                        id="branchName"
                                        value={newBranchName}
                                        onChange={(e) => setNewBranchName(e.target.value)}
                                        placeholder="e.g. Pune - Koregaon Park"
                                        required
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="branchAddress" className="text-xs">Physical Address</Label>
                                    <Input
                                        id="branchAddress"
                                        value={newBranchAddress}
                                        onChange={(e) => setNewBranchAddress(e.target.value)}
                                        placeholder="e.g. North Main Road, Koregaon Park, Pune"
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <DialogFooter className="border-t pt-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" className="h-9 text-xs cursor-pointer">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        disabled={creatingBranch}
                                        className="h-9 text-xs cursor-pointer bg-primary text-primary-foreground"
                                    >
                                        {creatingBranch ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Branch"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Add Staff Dialog */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-1.5 h-9 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs cursor-pointer shadow-sm">
                                <UserPlus className="h-4 w-4" />
                                Add Staff Member
                            </Button>
                        </DialogTrigger>
                    {/* AddPatientDialog styling: max-w-xl border border-border p-6 rounded-lg bg-card */}
                    <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto border border-border p-6 rounded-lg bg-card">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-foreground">Register New Staff Member</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Enter details to create a staff user account. Therapists should be registered with the "STAFF" role.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAddStaffSubmit} className="space-y-6 mt-4">
                            {/* Section: Account Credentials */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">
                                    Account Credentials
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name" className="text-xs">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Dr. Priya Sharma"
                                            required
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-xs">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="priya@physioyoga.com"
                                            required
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password" className="text-xs">Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="h-9 text-xs pl-9"
                                            />
                                            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="role" className="text-xs">Access Role</Label>
                                        <Select value={role} onValueChange={setRole}>
                                            <SelectTrigger id="role" className="h-9 text-xs cursor-pointer">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="STAFF" className="text-xs cursor-pointer">Therapist (STAFF)</SelectItem>
                                                <SelectItem value="COMPANY_ADMIN" className="text-xs cursor-pointer">Clinic Admin (COMPANY_ADMIN)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="branch" className="text-xs">Assigned Branch *</Label>
                                        <Select value={branchId} onValueChange={setBranchId}>
                                            <SelectTrigger id="branch" className="h-9 text-xs cursor-pointer">
                                                <SelectValue placeholder="Select branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map((b) => (
                                                    <SelectItem key={b.id} value={b.id} className="text-xs cursor-pointer">
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="address" className="text-xs">Physical Address</Label>
                                        <Input
                                            id="address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="e.g. Flat 102, Blue Heights, Lokhandwala, Andheri West, Mumbai"
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="border-t pt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" className="h-9 text-xs cursor-pointer">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-9 text-xs cursor-pointer bg-primary text-primary-foreground"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Registering...
                                        </>
                                    ) : (
                                        "Register Staff Member"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                </div>
            </div>

            {/* List Section using Tabs and DataTable */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="flex overflow-x-auto w-full max-w-full bg-muted/60 p-1 rounded-lg gap-1 border border-border/40 justify-start">
                    <TabsTrigger value="all" className="text-xs font-semibold px-4 py-2 cursor-pointer transition-all rounded-md">
                        All Locations ({staff.length})
                    </TabsTrigger>
                    {branches.map((b) => {
                        const count = staff.filter(s => s.branchId === b.id).length
                        return (
                            <TabsTrigger key={b.id} value={b.id} className="text-xs font-semibold px-4 py-2 cursor-pointer transition-all rounded-md">
                                {b.name} ({count})
                            </TabsTrigger>
                        )
                    })}
                </TabsList>

                <TabsContent value="all" className="outline-none">
                    <Card className="border border-border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-foreground">Clinic Registry — All Locations</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Active staff directory details for all clinic branches.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 py-0">
                            <div className="px-6 pb-6">
                                <DataTable
                                    columns={columns}
                                    data={staff}
                                    loading={loading}
                                    searchFilters={searchFilters}
                                    defaultSearchField="name"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {branches.map((b) => {
                    const branchStaff = staff.filter(s => s.branchId === b.id)
                    return (
                        <TabsContent key={b.id} value={b.id} className="outline-none">
                            <Card className="border border-border bg-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold text-foreground">Clinic Registry — {b.name}</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        Active staff directory details for {b.name} location.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-0 py-0">
                                    <div className="px-6 pb-6">
                                        <DataTable
                                            columns={columns}
                                            data={branchStaff}
                                            loading={loading}
                                            searchFilters={searchFilters}
                                            defaultSearchField="name"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )
                })}
            </Tabs>
        </div>
    )
}
