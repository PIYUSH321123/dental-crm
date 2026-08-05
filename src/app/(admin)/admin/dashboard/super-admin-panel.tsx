"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Building,
    ShieldAlert,
    Plus,
    Activity,
    CheckCircle,
    Users,
    DollarSign,
    Sparkles,
    Lock,
    Unlock,
    Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { toggleClinicModule, updateClinicStatus, createClinic } from "@/lib/actions/super-admin"

interface Clinic {
    id: string
    name: string
    slug: string
    status: string
    staff: number
    patients: string
    accessConfig: {
        marketing: boolean
        appointments: boolean
        billing: boolean
        patientManagement: boolean
    }
}

interface SuperAdminPanelProps {
    initialClinics: Clinic[]
}

const colors = [
    {
        light: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dark: "dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60"
    },
    {
        light: "bg-purple-50 text-purple-700 border-purple-200",
        dark: "dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60"
    },
    {
        light: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dark: "dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
    },
    {
        light: "bg-rose-50 text-rose-700 border-rose-200",
        dark: "dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60"
    },
    {
        light: "bg-cyan-50 text-cyan-700 border-cyan-200",
        dark: "dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/60"
    }
]

const getClinicColor = (id: string) => {
    let sum = 0
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
    return colors[sum % colors.length]
}

const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean)
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
}

export default function SuperAdminPanel({ initialClinics }: SuperAdminPanelProps) {
    const [clinics, setClinics] = useState<Clinic[]>(initialClinics)
    const [activities, setActivities] = useState([
        { title: "New clinic registered", meta: "Active Life Physio · 2h ago" },
        { title: "Role assigned: John → Company Admin", meta: "Wellness Plus · 5h ago" },
        { title: "Clinic suspended", meta: "SportsRehab Center · 1d ago" },
    ])

    const [isPending, startTransition] = useTransition()
    const [newClinicName, setNewClinicName] = useState("")
    const [newClinicSlug, setNewClinicSlug] = useState("")
    const [registerOpen, setRegisterOpen] = useState(false)
    const [suspendOpen, setSuspendOpen] = useState(false)
    const [selectedClinicToSuspend, setSelectedClinicToSuspend] = useState("")
    
    // Toggling Loading States for specific modules to avoid full page lock
    const [loadingModule, setLoadingModule] = useState<string | null>(null) // Format: "clinicId-moduleKey"

    const addActivity = (title: string, meta: string) => {
        setActivities(prev => [{ title, meta }, ...prev])
    }

    const handleCreateClinic = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newClinicName || !newClinicSlug) {
            toast.error("Please fill in all clinic fields.")
            return
        }

        const sanitizedSlug = newClinicSlug.toLowerCase().replace(/[^a-z0-9-]/g, "")

        startTransition(async () => {
            const res = await createClinic(newClinicName, sanitizedSlug)
            if (res.success) {
                toast.success(`Clinic "${newClinicName}" registered successfully!`)
                
                // Add to client list
                const addedClinic: Clinic = {
                    id: res.company?.id || Math.random().toString(),
                    name: newClinicName,
                    slug: sanitizedSlug,
                    status: "Active",
                    staff: 0,
                    patients: "0",
                    accessConfig: {
                        marketing: true,
                        appointments: true,
                        billing: false,
                        patientManagement: true
                    }
                }
                setClinics(prev => [...prev, addedClinic])
                addActivity("New clinic registered", `${newClinicName} · Just now`)
                
                // Reset form
                setNewClinicName("")
                setNewClinicSlug("")
                setRegisterOpen(false)
            } else {
                toast.error(res.error || "Failed to create clinic.")
            }
        })
    }

    const handleToggleModule = (clinicId: string, moduleKey: keyof Clinic["accessConfig"]) => {
        const clinic = clinics.find(c => c.id === clinicId)
        if (!clinic || clinic.status === "Suspended") return

        const currentValue = clinic.accessConfig[moduleKey]
        const nextValue = !currentValue
        
        const loadingKey = `${clinicId}-${moduleKey}`
        setLoadingModule(loadingKey)

        startTransition(async () => {
            const res = await toggleClinicModule(clinicId, moduleKey, nextValue)
            setLoadingModule(null)
            if (res.success) {
                // Update state
                setClinics(prev => prev.map(c => {
                    if (c.id === clinicId) {
                        return {
                            ...c,
                            accessConfig: {
                                ...c.accessConfig,
                                [moduleKey]: nextValue
                            }
                        }
                    }
                    return c
                }))
                toast.success(`Updated ${moduleKey} access for ${clinic.name}`)
                addActivity(`Module updated: ${moduleKey} → ${nextValue ? "Enabled" : "Disabled"}`, `${clinic.name} · Just now`)
            } else {
                toast.error(res.error || "Failed to update module access.")
            }
        })
    }

    const handleToggleStatus = (clinicId: string, currentStatus: string) => {
        const nextStatus = currentStatus === "Active" ? "Suspended" : "Active"
        const clinic = clinics.find(c => c.id === clinicId)
        if (!clinic) return

        startTransition(async () => {
            const res = await updateClinicStatus(clinicId, nextStatus)
            if (res.success) {
                setClinics(prev => prev.map(c => {
                    if (c.id === clinicId) {
                        return { ...c, status: nextStatus }
                    }
                    return c
                }))
                toast.success(`Clinic "${clinic.name}" is now ${nextStatus}`)
                addActivity(`Clinic status updated`, `${clinic.name} · ${nextStatus} · Just now`)
                
                if (suspendOpen) {
                    setSuspendOpen(false)
                }
            } else {
                toast.error(res.error || "Failed to update clinic status.")
            }
        })
    }

    // Dynamic stats computation
    const totalClinics = clinics.length
    const activeClinics = clinics.filter(c => c.status === "Active").length
    const totalStaffCount = clinics.reduce((sum, c) => sum + c.staff, 0)
    
    // Parse patient counts
    const parsePatients = (val: string) => {
        if (val.includes("K")) {
            return parseFloat(val.replace("K", "")) * 1000
        }
        return parseInt(val, 10) || 0
    }
    const totalPatientsCount = clinics.reduce((sum, c) => sum + parsePatients(c.patients), 0)
    const formatCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`
        }
        return count.toString()
    }

    const computedMrr = (activeClinics * 1500 + totalPatientsCount * 0.1).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-6 md:p-10 font-sans transition-colors duration-200">
            {/* Top Bar Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 mb-2 border border-emerald-200/50 dark:border-emerald-800/30">
                        <Activity className="h-3 w-3 text-emerald-600 dark:text-emerald-400 animate-pulse" /> Platform Administration
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        Super Admin Panel <Sparkles className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        All Services Operational
                    </div>

                    {/* Register New Clinic Trigger */}
                    <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 text-xs font-bold rounded-xl gap-2 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md border-0">
                                <Plus className="h-4 w-4" /> Register Clinic
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                            <form onSubmit={handleCreateClinic}>
                                <DialogHeader>
                                    <DialogTitle className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                                        <Building className="h-5 w-5 text-emerald-500 dark:text-emerald-400" /> Register Clinic
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
                                        Create a new clinic profile. The slug determines the login sub-path.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="clinic-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clinic Name</Label>
                                        <Input
                                            id="clinic-name"
                                            value={newClinicName}
                                            onChange={e => {
                                                setNewClinicName(e.target.value)
                                                setNewClinicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"))
                                            }}
                                            placeholder="Active Life Physio"
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-10 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="clinic-slug" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subdomain/Slug</Label>
                                        <Input
                                            id="clinic-slug"
                                            value={newClinicSlug}
                                            onChange={e => setNewClinicSlug(e.target.value)}
                                            placeholder="activelife"
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-10 rounded-xl font-mono text-xs"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="ghost" className="h-10 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        disabled={isPending}
                                        className="h-10 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Clinic"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Clinics", value: totalClinics.toString(), delta: `${activeClinics} active now`, icon: Building, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40" },
                    { label: "Total Patients", value: formatCount(totalPatientsCount), delta: "Across all clinic locations", icon: Users, color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40" },
                    { label: "Active Staff", value: formatCount(totalStaffCount), delta: "Physiotherapists & Admins", icon: Users, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" },
                    { label: "Platform MRR", value: computedMrr, delta: "Based on active subscription tiers", icon: DollarSign, color: "text-amber-600 bg-amber-50 dark:text-yellow-400 dark:bg-yellow-950/40" },
                ].map((stat) => (
                    <Card
                        key={stat.label}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700/80"
                    >
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.delta}</p>
                        </div>
                        <div className={`p-3.5 rounded-xl ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Area Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Clinics Directory (2/3 Width) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registered Clinics</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Configure status and module access rules per clinic.</p>
                        </div>
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-750 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-800/30 text-[10px] font-bold px-2.5 py-1">
                            {totalClinics} registered
                        </Badge>
                    </div>

                    <div className="flex flex-col gap-3">
                        {clinics.map((clinic) => {
                            const isSuspended = clinic.status === "Suspended"
                            const avatarColor = getClinicColor(clinic.id)

                            return (
                                <Card
                                    key={clinic.id}
                                    className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                                        isSuspended ? "opacity-60 grayscale-[40%]" : ""
                                    }`}
                                >
                                    {/* Left: Clinic Initials and Info */}
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`h-11 w-11 rounded-xl flex items-center justify-center text-sm font-extrabold shadow-xs border border-slate-200 dark:border-white/5 ${
                                                isSuspended ? "bg-slate-200 text-slate-500" : `${avatarColor.light} ${avatarColor.dark}`
                                            }`}
                                        >
                                            {getInitials(clinic.name)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                                                {clinic.name}
                                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-normal">/{clinic.slug}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{clinic.staff}</span> staff members ·{" "}
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{clinic.patients}</span> patients
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Modules and Action Buttons */}
                                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t border-slate-100 dark:border-slate-800/50 pt-3 sm:pt-0 sm:border-0">
                                        {/* Module Access Settings */}
                                        {!isSuspended ? (
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">
                                                    Modules:
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {(Object.keys(clinic.accessConfig) as Array<keyof Clinic["accessConfig"]>).map((key) => {
                                                        const isEnabled = clinic.accessConfig[key]
                                                        const label = key.replace(/([A-Z])/g, " $1")
                                                        const isLoading = loadingModule === `${clinic.id}-${key}`

                                                        return (
                                                            <button
                                                                key={key}
                                                                disabled={isPending || isSuspended}
                                                                onClick={() => handleToggleModule(clinic.id, key)}
                                                                title={`Toggle ${label}`}
                                                                className={`group flex items-center justify-center p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                                                    isEnabled
                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80 dark:hover:bg-emerald-900/40"
                                                                        : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 dark:bg-slate-900/60 dark:text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                                                }`}
                                                            >
                                                                {isLoading ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <span className="capitalize">{key.substring(0, 3)}</span>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic flex items-center gap-1.5">
                                                <Lock className="h-3.5 w-3.5" /> All modules locked
                                            </div>
                                        )}

                                        {/* Status Badge & Toggle Action */}
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={`rounded-lg border-0 px-2.5 py-1 text-[10px] font-bold ${
                                                    !isSuspended
                                                        ? "bg-emerald-50 text-emerald-750 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                        : "bg-rose-50 text-rose-750 dark:bg-rose-500/10 dark:text-rose-400"
                                                }`}
                                            >
                                                {clinic.status}
                                            </Badge>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title={isSuspended ? "Reactivate Clinic" : "Suspend Clinic"}
                                                onClick={() => handleToggleStatus(clinic.id, clinic.status)}
                                                className={`h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                                                    isSuspended ? "text-emerald-600 dark:text-emerald-400 hover:text-emerald-500" : "text-rose-600 dark:text-rose-400 hover:text-rose-500"
                                                }`}
                                            >
                                                {isSuspended ? <Unlock className="h-4.5 w-4.5" /> : <Lock className="h-4.5 w-4.5" />}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
                            {/* Sidebar (Activity + Danger Zone) */}
                <div className="space-y-6">
                    {/* Activity Feed */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Platform Activity
                        </h3>
                        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3 shadow-xs">
                            {activities.map((item, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 items-start ${i > 0 ? "border-t border-slate-100 dark:border-slate-800/40 pt-3" : ""}`}
                                >
                                    <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mt-0.5">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.meta}</p>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </div>

                    {/* Danger Zone */}
                    <div>
                        <h3 className="text-sm font-bold text-rose-650 dark:text-rose-450 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" /> Danger Zone
                        </h3>
                        <Card className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/10 dark:bg-rose-950/10 p-5 space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Deactivate Organization</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    Deactivating an organization locks out all associated staff members and blocks patient portal operations.
                                </p>
                            </div>

                            <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 border-rose-200 dark:border-rose-900 bg-white hover:bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-300 dark:hover:bg-rose-900 dark:hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                                    >
                                        Suspend Clinic Account
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                                    <DialogHeader>
                                        <DialogTitle className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                                            <ShieldAlert className="h-5 w-5 text-rose-500 dark:text-rose-450 animate-bounce" /> Suspend Organization
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
                                            Please choose a clinic organization to suspend. This blocks all access to dashboard features.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-1.5">
                                        <Label htmlFor="clinic-select" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clinic Name</Label>
                                        <Select
                                            value={selectedClinicToSuspend}
                                            onValueChange={(val) => setSelectedClinicToSuspend(val)}
                                        >
                                            <SelectTrigger
                                                id="clinic-select"
                                                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 text-sm focus:border-slate-300 dark:focus:border-slate-600 focus-visible:ring-1 focus-visible:ring-emerald-500"
                                            >
                                                <SelectValue placeholder="-- Select Active Clinic --" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl">
                                                {clinics.filter(c => c.status === "Active").map(c => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.id}
                                                        className="cursor-pointer hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
                                                    >
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="ghost" className="h-10 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            disabled={!selectedClinicToSuspend}
                                            onClick={() => {
                                                if (selectedClinicToSuspend) {
                                                    handleToggleStatus(selectedClinicToSuspend, "Active")
                                                }
                                            }}
                                            className="h-10 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
                                        >
                                            Suspend Account
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
