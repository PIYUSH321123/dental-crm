"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { PlusCircle, Search, CreditCard, Sparkles, CheckCircle2, AlertCircle, X, Trash2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { CreateSubscriptionDialog } from "../../_navigation/subscription/CreateSubscriptionDialog"

export interface Subscription {
    id: string
    patientId: string
    patientName: string
    planName: string
    price: number
    cycle: string
    startDate: string
    renewalDate: string
    status: "Active" | "Past Due" | "Completed"
}

const defaultSubscriptions: Subscription[] = [
    {
        id: "SUB-384",
        patientId: "P-0142",
        patientName: "Ravi Kumar",
        planName: "Physio Care Premium",
        price: 3500,
        cycle: "monthly",
        startDate: "2026-05-10",
        renewalDate: "2026-06-10",
        status: "Active"
    },
    {
        id: "SUB-719",
        patientId: "P-0141",
        patientName: "Meera Shah",
        planName: "Yoga Plus Pro",
        price: 2500,
        cycle: "monthly",
        startDate: "2026-05-20",
        renewalDate: "2026-06-20",
        status: "Active"
    },
    {
        id: "SUB-902",
        patientId: "P-0139",
        patientName: "Arjun Singh",
        planName: "Sports Rehab Intensive",
        price: 6000,
        cycle: "monthly",
        startDate: "2026-04-15",
        renewalDate: "2026-05-15",
        status: "Past Due"
    }
]

export default function SubscriptionsPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<"All" | "Active" | "Past Due" | "Completed">("All")
    const [dialogOpen, setDialogOpen] = React.useState(false)

    // Load from localStorage
    const loadSubscriptions = () => {
        const saved = localStorage.getItem("sg-subscriptions")
        if (saved) {
            setSubscriptions(JSON.parse(saved))
        } else {
            localStorage.setItem("sg-subscriptions", JSON.stringify(defaultSubscriptions))
            setSubscriptions(defaultSubscriptions)
        }
    }

    useEffect(() => {
        loadSubscriptions()

        const handleUpdate = () => {
            loadSubscriptions()
        }

        window.addEventListener("storage", handleUpdate)
        window.addEventListener("sg-subscriptions-updated", handleUpdate)

        return () => {
            window.removeEventListener("storage", handleUpdate)
            window.removeEventListener("sg-subscriptions-updated", handleUpdate)
        }
    }, [])

    // Helper hook simulation for useEffect
    function useEffect(cb: () => void, deps: any[]) {
        React.useEffect(cb, deps)
    }

    // Stats calculations
    const stats = React.useMemo(() => {
        const activeCount = subscriptions.filter(s => s.status === "Active").length
        const pastDueCount = subscriptions.filter(s => s.status === "Past Due").length
        const totalRevenue = subscriptions
            .filter(s => s.status === "Active")
            .reduce((acc, s) => acc + s.price, 0)
        return { activeCount, pastDueCount, totalRevenue }
    }, [subscriptions])

    // Filtered list
    const filteredSubs = React.useMemo(() => {
        return subscriptions.filter(sub => {
            const matchesSearch = sub.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.id.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "All" || sub.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [subscriptions, searchQuery, statusFilter])

    // Cancel / Delete Subscription
    const handleCancelSubscription = (subId: string) => {
        const updated = subscriptions.filter(s => s.id !== subId)
        localStorage.setItem("sg-subscriptions", JSON.stringify(updated))
        setSubscriptions(updated)
        window.dispatchEvent(new Event("storage"))
        toast.success(`Subscription ${subId} has been cancelled successfully.`)
    }

    // Update Status
    const toggleStatus = (subId: string) => {
        const updated = subscriptions.map(s => {
            if (s.id === subId) {
                const nextStatus: Subscription["status"] = s.status === "Active" ? "Past Due" : s.status === "Past Due" ? "Completed" : "Active"
                return { ...s, status: nextStatus }
            }
            return s
        })
        localStorage.setItem("sg-subscriptions", JSON.stringify(updated))
        setSubscriptions(updated)
        window.dispatchEvent(new Event("storage"))
        toast.info(`Subscription ${subId} status updated.`)
    }

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 bg-background/50">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:px-6 md:py-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <CreditCard className="h-6 w-6 text-primary shrink-0" />
                        Subscriptions
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Active plans, recurring billing cycles, and customer renewal status.
                    </p>
                </div>
                <div className="flex items-center">
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer rounded-md font-semibold px-4 flex items-center gap-1.5"
                    >
                        <PlusCircle className="h-4.5 w-4.5" />
                        Create Subscription
                    </Button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Active Subscriptions</span>
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-foreground">{stats.activeCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Generating monthly recurring revenues
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Monthly Recurring Revenue</span>
                        <CreditCard className="h-4.5 w-4.5 text-brand-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-foreground">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Active billing subscriptions
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Past Due Subscriptions</span>
                        <ShieldAlert className="h-4.5 w-4.5 text-destructive animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-destructive">{stats.pastDueCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Awaiting renewal payment collections
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-xl p-4 shadow-xs">
                <div className="flex items-center w-full sm:max-w-xs gap-1.5">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by client or plan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 pl-9 bg-background border border-border text-foreground text-xs rounded-md focus:outline-none w-full"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="h-9 border border-border rounded-md text-xs bg-background text-foreground px-2 focus:outline-none cursor-pointer font-medium"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Past Due">Past Due</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {searchQuery || statusFilter !== "All" ? (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery("")
                                setStatusFilter("All")
                            }}
                            className="h-9 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <X className="h-4 w-4" /> Reset Filters
                        </Button>
                    ) : null}
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <Table className="table-fixed">
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-foreground/80 h-11 text-xs w-[12%]">Sub ID</TableHead>
                            <TableHead className="font-semibold text-foreground/80 h-11 text-xs w-[20%]">Patient Name</TableHead>
                            <TableHead className="font-semibold text-foreground/80 h-11 text-xs w-[25%]">Active Plan</TableHead>
                            <TableHead className="font-semibold text-foreground/80 h-11 text-xs w-[13%]">Price / Cycle</TableHead>
                            <TableHead className="font-semibold text-foreground/80 h-11 text-xs w-[15%]">Renewal Date</TableHead>
                            <TableHead className="font-semibold text-foreground/80 h-11 text-xs w-[10%]">Status</TableHead>
                            <TableHead className="font-semibold text-foreground/80 h-11 text-xs text-right w-[15%]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-xs font-semibold">
                                    No subscriptions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSubs.map((sub) => (
                                <TableRow key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-border text-xs text-foreground/80">
                                    <TableCell className="font-bold font-mono text-muted-foreground">{sub.id}</TableCell>
                                    <TableCell className="font-bold text-foreground">{sub.patientName}</TableCell>
                                    <TableCell className="font-semibold text-foreground/95 truncate">{sub.planName}</TableCell>
                                    <TableCell className="font-semibold text-foreground/80">
                                        ₹{sub.price.toLocaleString()} <span className="text-[10px] text-muted-foreground capitalize">/{sub.cycle.substring(0, 2)}</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-semibold">{sub.renewalDate}</TableCell>
                                    <TableCell>
                                        <span 
                                            onClick={() => toggleStatus(sub.id)}
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border cursor-pointer select-none hover:opacity-80 transition-opacity ${
                                                sub.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                                    : sub.status === "Completed"
                                                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                                                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                                            }`}
                                        >
                                            {sub.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                                            onClick={() => handleCancelSubscription(sub.id)}
                                            title="Cancel Subscription"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateSubscriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
    )
}
