"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
    MoreHorizontal, 
    Eye, 
    CalendarPlus, 
    UserCheck, 
    UserMinus, 
    MessageSquare, 
    Phone, 
    Smartphone, 
    Clock,
    Activity
} from "lucide-react"
import { Lead, mockTherapists } from "./lead-data"

interface ActionCallbacks {
    onEdit: (lead: Lead) => void
    onBookConsultation: (lead: Lead) => void
    onConvertToPatient: (lead: Lead) => void
    onMarkLost: (lead: Lead) => void
    onWhatsApp: (lead: Lead) => void
    onSMS: (lead: Lead) => void
    onLogCall: (lead: Lead) => void
    onScheduleFollowUp: (lead: Lead) => void
}

export const getColumns = (actions: ActionCallbacks): ColumnDef<Lead>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 10,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const lead = row.original
            const details = [
                lead.age ? `${lead.age}y/o` : null,
                lead.gender,
                lead.city
            ].filter(Boolean).join(" • ")

            return (
                <div className="flex flex-col">
                    <span 
                        onClick={() => actions.onEdit(lead)}
                        className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                        {lead.name}
                    </span>
                    {details && <span className="text-xs text-muted-foreground">{details}</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "mobile",
        header: "Contact Info",
        cell: ({ row }) => {
            const lead = row.original
            return (
                <div className="flex flex-col text-xs font-mono">
                    <span className="text-foreground font-medium">{lead.mobile}</span>
                    {lead.email && <span className="text-muted-foreground truncate max-w-[150px]">{lead.email}</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            let badgeStyle = ""

            switch (status) {
                case "New":
                    badgeStyle = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50"
                    break
                case "Contacted":
                    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                    break
                case "Interested":
                    badgeStyle = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50"
                    break
                case "Consultation Booked":
                    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
                    break
                case "Assessment Done":
                    badgeStyle = "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50"
                    break
                case "Converted":
                    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                    break
                case "Lost":
                    badgeStyle = "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-400 dark:border-zinc-800"
                    break
            }

            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${badgeStyle}`}>
                    <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        status === "New" ? "bg-blue-500 animate-pulse" :
                        status === "Contacted" ? "bg-amber-500" :
                        status === "Interested" ? "bg-purple-500" :
                        status === "Consultation Booked" ? "bg-rose-500" :
                        status === "Assessment Done" ? "bg-teal-500" :
                        status === "Converted" ? "bg-emerald-500" : "bg-zinc-400"
                    }`} />
                    {status}
                </span>
            )
        }
    },
    {
        accessorKey: "pain_area",
        header: "Pain Area & Condition",
        cell: ({ row }) => {
            const lead = row.original
            return (
                <div className="flex flex-col max-w-[200px]">
                    <span className="text-sm font-medium text-foreground truncate">{lead.pain_area || "Not specified"}</span>
                    {lead.condition && <span className="text-xs text-muted-foreground truncate">{lead.condition}</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => {
            const source = row.getValue("source") as string
            let badgeClass = "bg-muted/50 text-muted-foreground border-border"

            if (source === "Facebook") {
                badgeClass = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50"
            } else if (source === "Google") {
                badgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
            } else if (source === "Instagram") {
                badgeClass = "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/50"
            } else if (source === "YouTube") {
                badgeClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
            } else if (source === "WhatsApp") {
                badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
            } else if (source === "Doctor Referral") {
                badgeClass = "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50"
            } else if (source === "Walk-in") {
                badgeClass = "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50"
            }

            return (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${badgeClass}`}>
                    {source}
                </span>
            )
        }
    },
    {
        accessorKey: "assigned_therapist_id",
        header: "Therapist",
        cell: ({ row }) => {
            const therapistId = row.getValue("assigned_therapist_id") as string
            const therapist = mockTherapists.find(t => t.id === therapistId)
            return (
                <span className="text-sm font-medium text-foreground">
                    {therapist ? therapist.name : "Unassigned"}
                </span>
            )
        }
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => {
            const dateStr = row.getValue("created_at") as string
            const date = new Date(dateStr)
            return (
                <span className="text-xs text-muted-foreground font-mono">
                    {date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })}
                </span>
            )
        }
    },
    {
        accessorKey: "branch_id",
        header: "Branch",
        enableHiding: true,
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }) => {
            const lead = row.original
            const isLost = lead.status === "Lost"
            const isConverted = lead.status === "Converted"

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/80">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Lead Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => actions.onEdit(lead)}
                            >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>View / Edit Details</span>
                            </DropdownMenuItem>

                            {/* Detail Transitions */}
                            {!isConverted && !isLost && (
                                <>
                                    <DropdownMenuItem 
                                        className="gap-2 cursor-pointer"
                                        onClick={() => actions.onBookConsultation(lead)}
                                    >
                                        <CalendarPlus className="h-3.5 w-3.5 text-rose-500" />
                                        <span>Book Consultation</span>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                        className="gap-2 cursor-pointer"
                                        onClick={() => actions.onConvertToPatient(lead)}
                                    >
                                        <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Convert to Patient</span>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                        className="gap-2 cursor-pointer text-amber-600 focus:text-amber-600"
                                        onClick={() => actions.onMarkLost(lead)}
                                    >
                                        <UserMinus className="h-3.5 w-3.5" />
                                        <span>Mark Lost</span>
                                    </DropdownMenuItem>
                                </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Quick Contacts</DropdownMenuLabel>
                            
                            <DropdownMenuItem 
                                className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600"
                                onClick={() => actions.onWhatsApp(lead)}
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>WhatsApp Template</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => actions.onLogCall(lead)}
                            >
                                <Phone className="h-3.5 w-3.5 text-blue-500" />
                                <span>Log Call</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => actions.onSMS(lead)}
                            >
                                <Smartphone className="h-3.5 w-3.5 text-sky-500" />
                                <span>Send SMS</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => actions.onScheduleFollowUp(lead)}
                            >
                                <Clock className="h-3.5 w-3.5 text-violet-500" />
                                <span>Schedule Follow-up</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    }
]
