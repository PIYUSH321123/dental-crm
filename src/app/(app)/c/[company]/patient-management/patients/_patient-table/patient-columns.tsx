import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Calendar, MoreHorizontal, MessageSquare, DollarSign } from "lucide-react"

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
            return <span className="font-mono text-xs font-semibold text-muted-foreground">{row.getValue("id")}</span>
        }
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return <span className="font-semibold text-foreground">{row.getValue("name")}</span>
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
            return <span className="text-xs text-muted-foreground">{age} / {genderLetter}</span>
        }
    },
    {
        accessorKey: "condition",
        header: "Condition",
        cell: ({ row }) => {
            return <span className="text-xs font-medium text-foreground">{row.getValue("condition")}</span>
        }
    },
    {
        accessorKey: "assigned_therapist_id",
        header: "Therapist",
        cell: ({ row }) => {
            const therapistId = row.getValue("assigned_therapist_id") as string
            const therapist = mockTherapists.find((t) => t.id === therapistId)
            return <span className="text-xs">{therapist ? therapist.name : "Unassigned"}</span>
        }
    },
    {
        id: "sessions",
        header: "Sessions",
        cell: ({ row }) => {
            const attended = row.original.sessions_attended
            const total = row.original.sessions_total
            return <span className="text-xs font-mono">{attended}/{total}</span>
        }
    },
    {
        accessorKey: "last_visit",
        header: "Last Visit",
        cell: ({ row }) => {
            return <span className="text-xs text-muted-foreground">{row.getValue("last_visit")}</span>
        }
    },
    {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => {
            const balance = row.getValue("balance") as number
            if (balance === 0) {
                return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Paid</span>
            }
            return <span className="text-xs font-semibold text-destructive">₹{balance.toLocaleString()} due</span>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            if (status === "Active") {
                return (
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Active
                    </Badge>
                )
            } else if (status === "Completed") {
                return (
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Completed
                    </Badge>
                )
            } else {
                return (
                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
                        className="h-8 text-xs font-medium cursor-pointer"
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
                            <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => callbacks.onView(patient)}>
                                <Eye className="h-3.5 w-3.5" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => callbacks.onSchedule(patient)}>
                                <Calendar className="h-3.5 w-3.5" /> Schedule Appt.
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    }
]
