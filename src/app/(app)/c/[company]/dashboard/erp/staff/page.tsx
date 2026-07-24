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
    Briefcase
} from "lucide-react"
import { toast } from "sonner"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    createdAt: string
}

export default function StaffManagementPage() {
    const params = useParams()
    const companySlug = params.company as string

    const [staff, setStaff] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [dialogOpen, setDialogOpen] = useState(false)

    // Form fields
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("STAFF")

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
            <div className="flex flex-row justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Staff Directory
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Manage clinical therapists, administrators, and system access rights.
                    </p>
                </div>

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

            {/* List Section using DataTable */}
            <Card className="border border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-foreground">Clinic Registry</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        Active staff directory details for this clinic location.
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
        </div>
    )
}
