import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Calendar, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Patient, mockTherapists } from "./patient-data"

interface PatientColumnsCallbacks {
    onView: (patient: Patient) => void
    onSchedule: (patient: Patient) => void
}

export const getColumns = (callbacks: PatientColumnsCallbacks): ColumnDef<Patient>[] => [
    {
        accessorKey: "id",
        header: "Patient ID",
        cell: ({ row }) => {
            return <span className="font-mono text-xs font-semibold text-slate-500">{row.getValue("id")}</span>
        }
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return <span className="font-semibold text-slate-800">{row.getValue("name")}</span>
        }
    },
    {
        id: "age_gender",
        header: "Age/Gender",
        cell: ({ row }) => {
            const dobString = row.original.dob
            const gender = row.original.gender
            // Simple age calculation
            let age = "N/A"
            if (dobString) {
                const birthYear = new Date(dobString).getFullYear()
                const currentYear = new Date().getFullYear()
                if (!isNaN(birthYear)) {
                    age = String(currentYear - birthYear)
                }
            }
            const genderLetter = gender ? gender.charAt(0) : "?"
            return <span className="text-xs text-slate-500">{age} / {genderLetter}</span>
        }
    },
    {
        accessorKey: "condition",
        header: "Condition",
        cell: ({ row }) => {
            return <span className="text-xs font-medium text-slate-800">{row.getValue("condition")}</span>
        }
    },
    {
        accessorKey: "assigned_therapist_id",
        header: "Therapist",
        cell: ({ row }) => {
            const therapistId = row.getValue("assigned_therapist_id") as string
            const therapist = mockTherapists.find((t) => t.id === therapistId)
            return <span className="text-xs text-slate-800">{therapist ? therapist.name : "Unassigned"}</span>
        }
    },
    {
        id: "sessions",
        header: "Sessions",
        cell: ({ row }) => {
            const attended = row.original.sessions_attended
            const total = row.original.sessions_total
            return <span className="text-xs font-mono text-slate-800">{attended}/{total}</span>
        }
    },
    {
        accessorKey: "last_visit",
        header: "Last Visit",
        cell: ({ row }) => {
            return <span className="text-xs text-slate-500">{row.getValue("last_visit")}</span>
        }
    },
    {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => {
            const balance = row.getValue("balance") as number
            if (balance === 0) {
                return <span className="text-xs font-semibold text-[#27ae60]">Paid</span>
            }
            return <span className="text-xs font-semibold text-[#e0431f]">₹{balance.toLocaleString()} due</span>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            if (status === "Active") {
                return (
                    <Badge variant="outline" className="bg-[#eaf7ee] text-[#27ae60] border border-[#27ae60]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Active
                    </Badge>
                )
            } else if (status === "Completed") {
                return (
                    <Badge variant="outline" className="bg-[#e3f2fd] text-[#1a6eb5] border border-[#1a6eb5]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Completed
                    </Badge>
                )
            } else {
                return (
                    <Badge variant="outline" className="bg-[#fef2ee] text-[#e0431f] border border-[#e0431f]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        On Hold
                    </Badge>
                )
            }
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const patient = row.original
            return (
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[5px] cursor-pointer"
                        onClick={() => callbacks.onView(patient)}
                    >
                        View
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer text-xs gap-2 hover:bg-slate-100" onClick={() => callbacks.onView(patient)}>
                                <Eye className="h-3.5 w-3.5" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-xs gap-2 hover:bg-slate-100" onClick={() => callbacks.onSchedule(patient)}>
                                <Calendar className="h-3.5 w-3.5" /> Schedule Appt.
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    }
]
