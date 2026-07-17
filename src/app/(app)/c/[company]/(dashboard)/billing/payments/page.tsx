"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ClipboardList, ArrowLeft, Search, Receipt, CheckCircle } from "lucide-react"
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
import { Invoice } from "../invoices/page"

export default function BillingPaymentsPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()

    const [invoices, setInvoices] = React.useState<Invoice[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [methodFilter, setMethodFilter] = React.useState<string>("All")

    // Load from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem("sg-invoices")
        if (saved) {
            setInvoices(JSON.parse(saved))
        }
    }, [])

    // Map paid invoices to payment transactions
    const transactions = React.useMemo(() => {
        return invoices.filter(i => i.status === "Paid").map((i, index) => {
            // Predictable simulated payment methods
            let method = "UPI (GPay)"
            if (index % 3 === 1) method = "Credit Card"
            if (index % 3 === 2) method = "Cash"
            
            return {
                id: `TXN-${i.id.slice(-4)}-${1000 + index}`,
                invoiceId: i.id,
                patientName: i.patientName,
                date: i.date,
                amount: i.amount,
                method,
                status: "Cleared"
            }
        })
    }, [invoices])

    // Filter transactions
    const filteredTxns = React.useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  t.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesMethod = methodFilter === "All" || t.method.includes(methodFilter)
            return matchesSearch && matchesMethod
        })
    }, [transactions, searchQuery, methodFilter])

    return (
        <div className="flex-1 p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Payments Ledger</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Track clearing status, payment transactions, and payment methods.
                    </p>
                </div>
            </div>

            {/* Payments Card Register */}
            <div className="border-2 border-slate-300 bg-slate-50 rounded-[10px] overflow-hidden max-w-[1200px] mx-auto shadow-sm">
                <div className="bg-[#37474f] px-3.5 py-2 flex items-center justify-between">
                    <span className="text-[#cfd8dc] text-[11px] font-bold tracking-[0.5px] uppercase ml-2">
                        PAYMENTS LEDGER (CLEARED)
                    </span>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6.5 text-[10px] font-semibold border-slate-400 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer rounded-[4px] px-2.5 py-0"
                        onClick={() => router.push(`/c/${company}/billing/invoices`)}
                    >
                        View Invoices Register
                    </Button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Filters bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                        <div className="flex items-center gap-2 max-w-sm w-full">
                            <Input
                                placeholder="🔍 Search patient, Txn ID, Invoice ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-7.5 bg-white border border-slate-300 text-slate-800 rounded-[5px] text-[11px] focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                            <span>Method:</span>
                            <select 
                                className="px-2 py-0.5 border border-slate-300 rounded-[5px] text-[11px] bg-white text-slate-600 focus:outline-none font-semibold h-7 cursor-pointer"
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                            >
                                <option value="All">All Methods</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Credit Card</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>
                    </div>

                    {/* Table list */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-200">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Txn ID</TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Invoice ID</TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Patient</TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Date Paid</TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Payment Method</TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs">Amount Paid</TableHead>
                                    <TableHead className="font-bold text-slate-700 h-10 text-xs text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTxns.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-400 text-xs font-semibold">
                                            No payment transactions cleared yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTxns.map((txn) => (
                                        <TableRow key={txn.id} className="hover:bg-slate-50 border-b border-slate-100 text-xs text-slate-700">
                                            <TableCell className="font-bold font-mono text-slate-500">{txn.id}</TableCell>
                                            <TableCell className="font-semibold text-slate-500 font-mono">{txn.invoiceId}</TableCell>
                                            <TableCell className="font-bold text-slate-800">{txn.patientName}</TableCell>
                                            <TableCell className="font-semibold text-slate-600">{txn.date}</TableCell>
                                            <TableCell className="text-slate-600 font-semibold">{txn.method}</TableCell>
                                            <TableCell className="font-bold text-[#27ae60]">₹{txn.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border bg-[#eaf7ee] text-[#27ae60] border-[#27ae60]/30">
                                                    <CheckCircle className="h-2.5 w-2.5" /> Cleared
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}
