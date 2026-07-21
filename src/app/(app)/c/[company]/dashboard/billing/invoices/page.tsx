"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ClipboardList, ArrowLeft, Plus, Download, Send, CreditCard, CheckCircle2, AlertCircle, X, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
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

export interface Invoice {
    id: string
    patientId: string
    patientName: string
    date: string
    amount: number
    status: "Paid" | "Pending" | "Overdue" | "Draft"
    description: string
}

const defaultInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    patientId: "P-0142",
    patientName: "Ravi Kumar",
    date: "2026-06-12",
    amount: 12000,
    status: "Paid",
    description: "8 Sessions Knee Joint Mobilization Package"
  },
  {
    id: "INV-2026-002",
    patientId: "P-0141",
    patientName: "Meera Shah",
    date: "2026-06-14",
    amount: 7500,
    status: "Paid",
    description: "5 Sessions Shoulder Mobilization Package"
  },
  {
    id: "INV-2026-003",
    patientId: "P-0139",
    patientName: "Arjun Singh",
    date: "2026-06-14",
    amount: 15000,
    status: "Paid",
    description: "10 Sessions ACL Post-op Rehab Package"
  },
  {
    id: "INV-2026-004",
    patientId: "P-0142",
    patientName: "Ravi Kumar",
    date: "2026-07-01",
    amount: 10500,
    status: "Pending",
    description: "7 Sessions OA Treatment Plan Dues"
  },
  {
    id: "INV-2026-005",
    patientId: "P-0139",
    patientName: "Arjun Singh",
    date: "2026-07-02",
    amount: 4500,
    status: "Overdue",
    description: "ACL Post-op Progress Assessment Session Dues"
  },
  {
    id: "INV-2026-006",
    patientId: "P-0141",
    patientName: "Meera Shah",
    date: "2026-07-08",
    amount: 5000,
    status: "Draft",
    description: "Draft Invoice for Consultation & Muscle Taping"
  }
];

export default function BillingInvoicesPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const [invoices, setInvoices] = React.useState<Invoice[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<"All" | "Paid" | "Pending" | "Overdue" | "Draft">("All")
    
    // Loading state simulation
    const [isLoading, setIsLoading] = React.useState(true)

    // Sorting states
    const [sortField, setSortField] = React.useState<"date" | "amount" | null>("date")
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc")

    // Date Range filters
    const [dateRangeOption, setDateRangeOption] = React.useState<"All" | "ThisMonth" | "Last30Days" | "Custom">("All")
    const [customStartDate, setCustomStartDate] = React.useState("")
    const [customEndDate, setCustomEndDate] = React.useState("")

    // Bulk selection states
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

    // Create Invoice Modal State
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [newInvoice, setNewInvoice] = React.useState({
        patientId: "P-0142",
        description: "",
        amount: "",
        status: "Pending" as "Paid" | "Pending" | "Overdue" | "Draft"
    })

    // Record Payment Confirmation Modal State
    const [paymentModalInvoice, setPaymentModalInvoice] = React.useState<Invoice | null>(null)
    const [paymentAmount, setPaymentAmount] = React.useState("")
    const [paymentMethod, setPaymentMethod] = React.useState("UPI")
    const [paymentDate, setPaymentDate] = React.useState("")

    // Invoice Detail Modal State
    const [detailInvoice, setDetailInvoice] = React.useState<Invoice | null>(null)

    // Load invoices from localStorage
    React.useEffect(() => {
        setIsLoading(true)
        const saved = localStorage.getItem("sg-invoices")
        let loaded: Invoice[] = []
        if (saved) {
            loaded = JSON.parse(saved)
        } else {
            localStorage.setItem("sg-invoices", JSON.stringify(defaultInvoices))
            loaded = defaultInvoices
        }
        setInvoices(loaded)

        // Simulate a smooth API load
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 600)
        return () => clearTimeout(timer)
    }, [])

    // Trigger skeleton reload on filter changes to show responsiveness
    const handleFilterChange = (changeCallback: () => void) => {
        setIsLoading(true)
        changeCallback()
        setTimeout(() => {
            setIsLoading(false)
        }, 400)
    }

    // Real-time calculations for KPI cards
    const stats = React.useMemo(() => {
        const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0)
        const pendingDues = invoices.filter(i => i.status === "Pending" || i.status === "Overdue").reduce((sum, i) => sum + i.amount, 0)
        const totalCount = invoices.length
        const paidCount = invoices.filter(i => i.status === "Paid").length
        const successRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0
        return { totalRevenue, pendingDues, totalCount, successRate }
    }, [invoices])

    // Sorting implementation
    const handleSort = (field: "date" | "amount") => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    // Filters application
    const filteredInvoices = React.useMemo(() => {
        let result = invoices.filter(i => {
            const matchesSearch = i.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  i.description.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "All" || i.status === statusFilter
            
            // Date Filter computation
            let matchesDate = true
            const invDate = new Date(i.date)
            const today = new Date()

            if (dateRangeOption === "ThisMonth") {
                matchesDate = invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear()
            } else if (dateRangeOption === "Last30Days") {
                const diffTime = Math.abs(today.getTime() - invDate.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                matchesDate = diffDays <= 30
            } else if (dateRangeOption === "Custom") {
                if (customStartDate) {
                    matchesDate = matchesDate && invDate >= new Date(customStartDate)
                }
                if (customEndDate) {
                    matchesDate = matchesDate && invDate <= new Date(customEndDate)
                }
            }

            return matchesSearch && matchesStatus && matchesDate
        })

        // Apply Sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                let valA = sortField === "date" ? new Date(a.date).getTime() : a.amount
                let valB = sortField === "date" ? new Date(b.date).getTime() : b.amount
                return sortDirection === "asc" ? valA - valB : valB - valA
            })
        }

        return result
    }, [invoices, searchQuery, statusFilter, dateRangeOption, customStartDate, customEndDate, sortField, sortDirection])

    // Select/Deselect handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredInvoices.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredInvoices.map(i => i.id)))
        }
    }

    const toggleSelectRow = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        setSelectedIds(next)
    }

    // Bulk actions
    const handleBulkSendReminders = () => {
        const targets = invoices.filter(i => selectedIds.has(i.id) && (i.status === "Pending" || i.status === "Overdue"))
        if (targets.length === 0) {
            toast.error("No pending or overdue invoices selected.")
            return
        }
        toast.success(`Sent bulk reminders for ${targets.length} invoices successfully.`)
        setSelectedIds(new Set())
    }

    // Create Invoice Handler
    const handleCreateInvoice = (e: React.FormEvent) => {
        e.preventDefault()
        const amountNum = parseFloat(newInvoice.amount)
        if (isNaN(amountNum) || amountNum <= 0 || !newInvoice.description) {
            toast.error("Please provide a valid description and amount.")
            return
        }

        let patientName = "Ravi Kumar"
        if (newInvoice.patientId === "P-0141") patientName = "Meera Shah"
        if (newInvoice.patientId === "P-0139") patientName = "Arjun Singh"

        const nextNum = Math.floor(100 + Math.random() * 900)
        const generatedInvoice: Invoice = {
            id: `INV-2026-${nextNum}`,
            patientId: newInvoice.patientId,
            patientName,
            date: new Date().toISOString().split("T")[0],
            amount: amountNum,
            status: newInvoice.status,
            description: newInvoice.description
        }

        const updated = [generatedInvoice, ...invoices]
        localStorage.setItem("sg-invoices", JSON.stringify(updated))
        setInvoices(updated)
        
        // Also update outstanding dues inside patients workspace (simulate integration)
        if (newInvoice.status !== "Paid" && newInvoice.status !== "Draft") {
            const savedPatients = localStorage.getItem("sg-patients")
            if (savedPatients) {
                const parsedPatients = JSON.parse(savedPatients)
                const updatedPatients = parsedPatients.map((p: any) => {
                    if (p.id === newInvoice.patientId) {
                        return { ...p, balance: p.balance + amountNum }
                    }
                    return p
                })
                localStorage.setItem("sg-patients", JSON.stringify(updatedPatients))
            }
        }

        setNewInvoice({
            patientId: "P-0142",
            description: "",
            amount: "",
            status: "Pending"
        })
        setIsCreateOpen(false)
        toast.success(`Generated Invoice ${generatedInvoice.id} successfully.`)
    }

    // Opening payment recording dialog
    const openRecordPayment = (inv: Invoice) => {
        setPaymentModalInvoice(inv)
        setPaymentAmount(inv.amount.toString())
        setPaymentMethod("UPI")
        setPaymentDate(new Date().toISOString().split("T")[0])
    }

    // Confirm Payment Handler
    const handleConfirmPayment = () => {
        if (!paymentModalInvoice) return
        const amountNum = parseFloat(paymentAmount)
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please specify a valid payment amount.")
            return
        }

        const updated = invoices.map(i => {
            if (i.id === paymentModalInvoice.id) {
                return { ...i, status: "Paid" as const }
            }
            return i
        })
        localStorage.setItem("sg-invoices", JSON.stringify(updated))
        setInvoices(updated)

        // Reduce outstanding balance in patients workspace (simulate integration)
        const savedPatients = localStorage.getItem("sg-patients")
        if (savedPatients) {
            const parsedPatients = JSON.parse(savedPatients)
            const updatedPatients = parsedPatients.map((p: any) => {
                if (p.id === paymentModalInvoice.patientId) {
                    return { ...p, balance: Math.max(0, p.balance - amountNum) }
                }
                return p
            })
            localStorage.setItem("sg-patients", JSON.stringify(updatedPatients))
        }

        toast.success(`Payment of ₹${amountNum.toLocaleString()} via ${paymentMethod} recorded for Invoice ${paymentModalInvoice.id}.`)
        setPaymentModalInvoice(null)
    }

    const handleSendReminder = (id: string) => {
        toast.success(`Reminder notification sent for Invoice ${id}.`)
    }

    return (
        <div className="flex-1 p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Billing & Invoices</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Create invoices, record payments, and manage clinical billing dues.
                    </p>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Total Revenue</span>
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Successfully collected payments</p>
                        <p className="text-[10px] font-bold text-emerald-500 mt-0.5">↑ 14.2% vs last month</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Dues</span>
                        <AlertCircle className="h-4.5 w-4.5 text-[#e74c3c]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-[#e74c3c]">₹{stats.pendingDues.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Outstanding collectibles</p>
                        <p className="text-[10px] font-bold text-emerald-500 mt-0.5">↓ 8.5% vs last month</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Invoices Created</span>
                        <ClipboardList className="h-4.5 w-4.5 text-sky-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-foreground">{stats.totalCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Total billing records generated</p>
                        <p className="text-[10px] font-bold text-emerald-500 mt-0.5">↑ 10% vs last month</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Collection Rate</span>
                        <CreditCard className="h-4.5 w-4.5 text-sky-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">{stats.successRate}%</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Percentage of paid invoices</p>
                        <p className="text-[10px] font-bold text-emerald-500 mt-0.5">↑ 4.3% vs last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices List */}
            <div className="border border-[#dde3ed] bg-card rounded-xl overflow-hidden max-w-[1200px] mx-auto shadow-sm">
                
                {/* Light Theme Header Bar */}
                <div className="bg-slate-50 border-b border-[#dde3ed] px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[#2c3e50] text-[12px] font-bold tracking-[0.5px] uppercase ml-1">
                        Invoices Register
                    </span>
                    <Button 
                        onClick={() => setIsCreateOpen(true)}
                        className="h-7 text-[10px] bg-[#1a6eb5] text-white hover:bg-[#1a6eb5]/90 cursor-pointer rounded-[5px] font-semibold gap-1 px-3 py-0"
                    >
                        <Plus className="h-3.5 w-3.5" /> Create Invoice
                    </Button>
                </div>

                <div className="p-4 space-y-4">
                    
                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#dde3ed] rounded-lg p-3 shadow-xs">
                        <div className="flex items-center gap-2 max-w-sm w-full">
                            <Input
                                placeholder="🔍 Search patient, ID, description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 bg-white border border-[#dde3ed] text-slate-800 rounded-[5px] text-[11px] focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 font-semibold">
                            {/* Date range selector */}
                            <div className="flex items-center gap-1.5">
                                <span>Date Range:</span>
                                <select 
                                    className="px-2 py-0.5 border border-[#dde3ed] rounded-[5px] text-[11px] bg-white text-slate-600 focus:outline-none font-semibold h-7.5 cursor-pointer"
                                    value={dateRangeOption}
                                    onChange={(e) => handleFilterChange(() => setDateRangeOption(e.target.value as any))}
                                >
                                    <option value="All">All Time</option>
                                    <option value="ThisMonth">This Month</option>
                                    <option value="Last30Days">Last 30 Days</option>
                                    <option value="Custom">Custom Range</option>
                                </select>
                            </div>

                            {/* Custom Date Pickers */}
                            {dateRangeOption === "Custom" && (
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="date" 
                                        className="px-1.5 py-0.5 border border-[#dde3ed] rounded-[5px] text-[10px] bg-white text-slate-600 focus:outline-none h-7.5"
                                        value={customStartDate}
                                        onChange={(e) => handleFilterChange(() => setCustomStartDate(e.target.value))}
                                    />
                                    <span className="text-[10px] text-slate-400">to</span>
                                    <input 
                                        type="date" 
                                        className="px-1.5 py-0.5 border border-[#dde3ed] rounded-[5px] text-[10px] bg-white text-slate-600 focus:outline-none h-7.5"
                                        value={customEndDate}
                                        onChange={(e) => handleFilterChange(() => setCustomEndDate(e.target.value))}
                                    />
                                </div>
                            )}

                            {/* Status dropdown selector */}
                            <div className="flex items-center gap-1.5">
                                <span>Status:</span>
                                <select 
                                    className="px-2 py-0.5 border border-[#dde3ed] rounded-[5px] text-[11px] bg-white text-slate-600 focus:outline-none font-semibold h-7.5 cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => handleFilterChange(() => setStatusFilter(e.target.value as any))}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Selection Toolbar */}
                    {selectedIds.size > 0 && (
                        <div className="bg-[#e3f2fd] border border-[#1a6eb5]/30 rounded-lg p-2.5 px-4 flex items-center justify-between text-xs text-[#1a6eb5] font-semibold animate-in slide-in-from-top-2 duration-150">
                            <span>Selected: {selectedIds.size} invoices</span>
                            <Button
                                size="sm"
                                onClick={handleBulkSendReminders}
                                className="h-7 text-[10px] bg-[#1a6eb5] text-white hover:bg-[#1a6eb5]/90 rounded-[5px]"
                            >
                                <Send className="h-3 w-3 mr-1" /> Send reminder to selected
                            </Button>
                        </div>
                    )}

                    {/* Table View */}
                    <div className="bg-white border border-[#dde3ed] rounded-lg overflow-hidden shadow-xs">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-[#dde3ed]">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-10">
                                        <input
                                            type="checkbox"
                                            className="h-3.5 w-3.5 rounded border-[#dde3ed] cursor-pointer"
                                            checked={filteredInvoices.length > 0 && selectedIds.size === filteredInvoices.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Invoice ID</TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Patient</TableHead>
                                    
                                    {/* Sortable Date Header */}
                                    <TableHead 
                                        className="font-bold text-slate-700 h-10 text-xs cursor-pointer select-none hover:bg-slate-100/50"
                                        onClick={() => handleSort("date")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date
                                            {sortField === "date" ? (
                                                sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                                            ) : <ArrowUpDown className="h-3 w-3 text-slate-400" />}
                                        </div>
                                    </TableHead>
                                    
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Description</TableHead>
                                    
                                    {/* Sortable Amount Header */}
                                    <TableHead 
                                        className="font-bold text-slate-700 h-10 text-xs cursor-pointer select-none hover:bg-slate-100/50"
                                        onClick={() => handleSort("amount")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Amount
                                            {sortField === "amount" ? (
                                                sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                                            ) : <ArrowUpDown className="h-3 w-3 text-slate-400" />}
                                        </div>
                                    </TableHead>
                                    
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Status</TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs text-right pr-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Pulse Skeleton State Rows
                                    [...Array(4)].map((_, idx) => (
                                        <TableRow key={idx} className="border-b border-[#dde3ed] h-11">
                                            <TableCell><div className="h-3.5 w-3.5 bg-slate-200 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-3.5 w-20 bg-slate-200 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-3.5 w-16 bg-slate-200 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-3.5 w-48 bg-slate-200 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-3.5 w-16 bg-slate-200 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-5 w-14 bg-slate-200 rounded-full animate-pulse" /></TableCell>
                                            <TableCell><div className="h-7 w-20 ml-auto bg-slate-200 rounded animate-pulse" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredInvoices.length === 0 ? (
                                    // Empty State
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-36 text-center text-slate-400 text-xs font-semibold">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <AlertCircle className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                                                <span>No invoices match your filters.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInvoices.map((inv) => (
                                        <TableRow key={inv.id} className="hover:bg-slate-50 border-b border-[#dde3ed] text-xs text-slate-700">
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    className="h-3.5 w-3.5 rounded border-[#dde3ed] cursor-pointer"
                                                    checked={selectedIds.has(inv.id)}
                                                    onChange={() => toggleSelectRow(inv.id)}
                                                />
                                            </TableCell>
                                            
                                            {/* Clickable Invoice ID */}
                                            <TableCell className="font-bold font-mono">
                                                <button
                                                    onClick={() => setDetailInvoice(inv)}
                                                    className="text-[#1a6eb5] hover:underline font-bold focus:outline-none"
                                                >
                                                    {inv.id}
                                                </button>
                                            </TableCell>
                                            
                                            <TableCell className="font-bold text-slate-800">{inv.patientName}</TableCell>
                                            <TableCell className="font-semibold text-slate-600">{inv.date}</TableCell>
                                            <TableCell className="text-slate-600 font-medium max-w-[240px] truncate" title={inv.description}>
                                                {inv.description}
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-900">₹{inv.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                                    inv.status === "Paid" 
                                                    ? "bg-[#eaf7ee] text-[#27ae60] border-[#27ae60]/30" 
                                                    : inv.status === "Pending"
                                                    ? "bg-[#fef2ee] text-[#e67e22] border-[#e67e22]/30"
                                                    : inv.status === "Overdue"
                                                    ? "bg-[#fdf3f2] text-[#e74c3c] border-[#e74c3c]/30"
                                                    : "bg-slate-100 text-slate-500 border-slate-300"
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right space-x-1.5 pr-4">
                                                {inv.status !== "Paid" && inv.status !== "Draft" && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-7 text-[10px] font-semibold border-emerald-300 bg-white text-[#27ae60] hover:bg-emerald-50 rounded-[4px] cursor-pointer"
                                                        onClick={() => openRecordPayment(inv)}
                                                    >
                                                        Record Pay
                                                    </Button>
                                                )}
                                                
                                                {inv.status !== "Paid" && (
                                                    // CSS-based tooltips
                                                    <div className="relative inline-block group">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-7 text-[10px] font-semibold border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-[4px] cursor-pointer"
                                                            onClick={() => handleSendReminder(inv.id)}
                                                        >
                                                            <Send className="h-3 w-3" />
                                                        </Button>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 scale-0 group-hover:scale-100 transition-all duration-100 origin-bottom bg-slate-800 text-white text-[9px] font-bold py-1 px-2 rounded-md shadow-md pointer-events-none whitespace-nowrap z-50">
                                                            Send reminder
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="relative inline-block group">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-7 text-[10px] font-semibold border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-[4px] cursor-pointer"
                                                        onClick={() => toast.success(`Downloading PDF for ${inv.id}...`)}
                                                    >
                                                        <Download className="h-3 w-3" />
                                                    </Button>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 scale-0 group-hover:scale-100 transition-all duration-100 origin-bottom bg-slate-800 text-white text-[9px] font-bold py-1 px-2 rounded-md shadow-md pointer-events-none whitespace-nowrap z-50">
                                                        Download PDF
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Record Payment Confirmation Modal */}
            {paymentModalInvoice && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-[#dde3ed] rounded-xl overflow-hidden max-w-sm w-full shadow-lg font-sans">
                        <div className="bg-slate-50 border-b border-[#dde3ed] px-4 py-3 flex items-center justify-between">
                            <span className="text-[#2c3e50] text-[11px] font-bold uppercase tracking-[0.5px]">
                                Record Payment Confirmation
                            </span>
                            <button onClick={() => setPaymentModalInvoice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4 text-xs text-slate-700">
                            <p className="font-semibold text-slate-500">Invoice: <b className="text-slate-800">{paymentModalInvoice.id} ({paymentModalInvoice.patientName})</b></p>
                            
                            {/* Payment Amount */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Payment Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full text-[11px] px-2 py-1.5 border border-[#dde3ed] rounded-[5px] text-slate-700 bg-white focus:outline-none"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Payment Method</label>
                                <select 
                                    className="w-full text-[11px] px-2 py-1.5 border border-[#dde3ed] rounded-[5px] text-slate-700 bg-white focus:outline-none font-semibold cursor-pointer"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Credit Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            {/* Payment Date */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Payment Date</label>
                                <input
                                    type="date"
                                    className="w-full text-[11px] px-2 py-1.5 border border-[#dde3ed] rounded-[5px] text-slate-700 bg-white focus:outline-none"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="h-8 text-xs font-semibold text-slate-500 border border-[#dde3ed] hover:bg-slate-50 cursor-pointer"
                                    onClick={() => setPaymentModalInvoice(null)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="button" 
                                    className="h-8 text-xs font-semibold bg-[#27ae60] text-white hover:bg-[#27ae60]/95 cursor-pointer"
                                    onClick={handleConfirmPayment}
                                >
                                    Confirm Payment
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clickable Invoice Details Modal Panel */}
            {detailInvoice && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-[#dde3ed] rounded-xl overflow-hidden max-w-lg w-full shadow-lg font-sans">
                        <div className="bg-slate-50 border-b border-[#dde3ed] px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[#2c3e50] text-[11px] font-bold uppercase tracking-[0.5px]">
                                    Invoice Details: {detailInvoice.id}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                    detailInvoice.status === "Paid" 
                                    ? "bg-[#eaf7ee] text-[#27ae60]" 
                                    : "bg-[#fef2ee] text-[#e67e22]"
                                }`}>
                                    {detailInvoice.status}
                                </span>
                            </div>
                            <button onClick={() => setDetailInvoice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[85vh] overflow-y-auto">
                            
                            {/* Patient Contact details */}
                            <div className="bg-slate-50 rounded-lg p-3 border border-[#dde3ed] space-y-1">
                                <h4 className="font-bold text-[#2c3e50] text-[10px] uppercase tracking-wider">Patient Information</h4>
                                <p className="font-bold text-slate-800 text-sm mt-0.5">{detailInvoice.patientName}</p>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-500 text-[10px] font-medium pt-1">
                                    <span>📞 +91 98765 43210</span>
                                    <span>📧 contact@physioyoga.in</span>
                                    <span className="col-span-2">📍 Sector 4, Indiranagar, Bangalore</span>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="space-y-1">
                                <h4 className="font-bold text-[#2c3e50] text-[10px] uppercase tracking-wider">Line Items</h4>
                                <div className="border border-[#dde3ed] rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-[10px] border-collapse">
                                        <thead className="bg-slate-50 border-b border-[#dde3ed]">
                                            <tr>
                                                <th className="p-2 font-bold text-slate-600">Item Details</th>
                                                <th className="p-2 text-center font-bold text-slate-600 w-12">Qty</th>
                                                <th className="p-2 text-right font-bold text-slate-600 w-18">Rate</th>
                                                <th className="p-2 text-right font-bold text-slate-600 w-18">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                                            <tr>
                                                <td className="p-2 font-semibold text-slate-800">{detailInvoice.description}</td>
                                                <td className="p-2 text-center">1</td>
                                                <td className="p-2 text-right">₹{(detailInvoice.amount * 0.85).toFixed(0)}</td>
                                                <td className="p-2 text-right">₹{(detailInvoice.amount * 0.85).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2">PhysioYoga Treatment Consumables</td>
                                                <td className="p-2 text-center">1</td>
                                                <td className="p-2 text-right">₹{(detailInvoice.amount * 0.15).toFixed(0)}</td>
                                                <td className="p-2 text-right">₹{(detailInvoice.amount * 0.15).toFixed(0)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Tax breakdown */}
                            <div className="flex flex-col items-end space-y-1 font-semibold text-[11px] pr-2">
                                <div className="flex justify-between w-40 text-slate-500">
                                    <span>Subtotal:</span>
                                    <span>₹{(detailInvoice.amount * 0.8475).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between w-40 text-slate-500">
                                    <span>CGST (9%):</span>
                                    <span>₹{(detailInvoice.amount * 0.0762).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between w-40 text-slate-500">
                                    <span>SGST (9%):</span>
                                    <span>₹{(detailInvoice.amount * 0.0762).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between w-40 text-slate-800 font-bold border-t border-slate-200 pt-1 text-xs">
                                    <span>Grand Total:</span>
                                    <span>₹{detailInvoice.amount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment History */}
                            <div className="bg-slate-50 rounded-lg p-3 border border-[#dde3ed] space-y-1.5">
                                <h4 className="font-bold text-[#2c3e50] text-[10px] uppercase tracking-wider">Payment Status History</h4>
                                {detailInvoice.status === "Paid" ? (
                                    <p className="text-[#27ae60] font-bold text-[10.5px]">
                                        ✓ Full payment of ₹{detailInvoice.amount.toLocaleString()} received via UPI (Cleared) on {detailInvoice.date}.
                                    </p>
                                ) : detailInvoice.status === "Draft" ? (
                                    <p className="text-slate-400 font-semibold italic text-[10.5px]">
                                        Invoice is in Draft status. No payments recorded or scheduled.
                                    </p>
                                ) : (
                                    <p className="text-[#e74c3c] font-semibold text-[10.5px]">
                                        ✗ Payment Pending. A reminder was sent to patient's WhatsApp register.
                                    </p>
                                )}
                            </div>

                            {/* Footer actions */}
                            <div className="flex justify-end pt-2">
                                <Button 
                                    className="h-8 text-xs font-semibold bg-[#1a6eb5] hover:bg-[#1a6eb5]/90 text-white cursor-pointer"
                                    onClick={() => setDetailInvoice(null)}
                                >
                                    Close details
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Invoice Dialog Overlay */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-[#dde3ed] rounded-xl overflow-hidden max-w-md w-full shadow-lg font-sans">
                        <div className="bg-slate-50 border-b border-[#dde3ed] px-4 py-3 flex items-center justify-between">
                            <span className="text-[#2c3e50] text-[11px] font-bold uppercase tracking-[0.5px]">
                                Generate Clinical Invoice
                            </span>
                            <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="p-4 space-y-4">
                            {/* Patient Select */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Patient</label>
                                <select 
                                    className="w-full text-[11px] px-2 py-1.5 border border-[#dde3ed] rounded-[5px] text-slate-600 bg-white focus:outline-none"
                                    value={newInvoice.patientId}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, patientId: e.target.value })}
                                >
                                    <option value="P-0142">Ravi Kumar (P-0142)</option>
                                    <option value="P-0141">Meera Shah (P-0141)</option>
                                    <option value="P-0139">Arjun Singh (P-0139)</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Description / Details</label>
                                <textarea
                                    className="w-full text-[11px] px-2 py-1.5 border border-[#dde3ed] rounded-[5px] text-slate-600 bg-white focus:outline-none h-16 resize-none"
                                    value={newInvoice.description}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                                    placeholder="e.g. 5 Sessions Shoulder Treatment Dues"
                                    required
                                />
                            </div>

                            {/* Amount */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Billing Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full text-[11px] px-2 py-1.5 border border-[#dde3ed] rounded-[5px] text-slate-600 bg-white focus:outline-none"
                                    value={newInvoice.amount}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                    placeholder="e.g. 7500"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Invoice Status</label>
                                <select 
                                    className="w-full text-[11px] px-2 py-1.5 border border-[#dde3ed] rounded-[5px] text-slate-600 bg-white focus:outline-none"
                                    value={newInvoice.status}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value as any })}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="h-8 text-xs font-semibold text-slate-500 border border-[#dde3ed] hover:bg-slate-50 cursor-pointer"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="h-8 text-xs font-semibold bg-[#1a6eb5] hover:bg-[#1a6eb5]/95 text-white cursor-pointer"
                                >
                                    Generate
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
