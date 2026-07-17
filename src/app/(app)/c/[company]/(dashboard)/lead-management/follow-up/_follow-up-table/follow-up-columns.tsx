import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Phone, MessageSquare, Mail, Check, Calendar, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FollowUp } from "./follow-up-data"

interface GetColumnsProps {
    onDone: (fw: FollowUp) => void
    onChat: (fw: FollowUp) => void
    onReschedule: (fw: FollowUp) => void
    getTherapistName: (id: string) => string
    getFormattedTime: (dateStr: string) => string
}

export const getColumns = ({
    onDone,
    onChat,
    onReschedule,
    getTherapistName,
    getFormattedTime,
}: GetColumnsProps): ColumnDef<FollowUp>[] => [
    {
        accessorKey: "lead_name",
        header: "Lead Name",
        cell: ({ row }) => {
            const fw = row.original
            const isCompleted = fw.status === "Completed"
            return (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {fw.lead_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-foreground">{fw.lead_name}</div>
                        {isCompleted && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                Outcome: {fw.outcome}
                            </Badge>
                        )}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "lead_mobile",
        header: "Mobile",
        cell: ({ row }) => <span className="text-muted-foreground text-sm font-medium">{row.original.lead_mobile}</span>
    },
    {
        accessorKey: "type",
        header: "Follow-up Type",
        cell: ({ row }) => {
            const type = row.original.type
            return (
                <>
                    {type === "Call" && (
                        <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 dark:text-blue-400 gap-1 rounded-full text-xs font-semibold px-2.5 py-0.5">
                            <Phone className="h-3 w-3" /> Call
                        </Badge>
                    )}
                    {type === "WhatsApp" && (
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 gap-1 rounded-full text-xs font-semibold px-2.5 py-0.5">
                            <MessageSquare className="h-3 w-3" /> WhatsApp
                        </Badge>
                    )}
                    {type === "SMS" && (
                        <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 dark:text-amber-400 gap-1 rounded-full text-xs font-semibold px-2.5 py-0.5">
                            <Mail className="h-3 w-3" /> SMS
                        </Badge>
                    )}
                </>
            )
        }
    },
    {
        accessorKey: "due_at",
        header: "Due Date",
        cell: ({ row }) => {
            const fw = row.original
            const isOverdue = fw.category === "overdue"
            const isToday = fw.category === "today"
            return (
                <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${
                        isOverdue ? "text-destructive" : 
                        isToday ? "text-primary" : "text-foreground"
                    }`}>
                        {getFormattedTime(fw.due_at)}
                    </span>
                    {isOverdue && <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">Overdue</span>}
                    {isToday && <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Today</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "assigned_to_id",
        header: "Assigned To",
        cell: ({ row }) => <span className="text-foreground text-sm font-medium">{getTherapistName(row.original.assigned_to_id)}</span>
    },
    {
        accessorKey: "last_activity",
        header: "Last Activity",
        cell: ({ row }) => <span className="text-muted-foreground text-xs block max-w-[150px] truncate">{row.original.last_activity || "No recent activity"}</span>
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const fw = row.original
            const isCompleted = fw.status === "Completed"
            return (
                <div className="flex items-center justify-end gap-1.5">
                    {!isCompleted ? (
                        <>
                            <Button 
                                size="sm" 
                                className="h-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs transition-all duration-200 cursor-pointer"
                                onClick={() => onDone(fw)}
                            >
                                <Check className="h-3.5 w-3.5 mr-1" /> Done
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/20 font-semibold text-xs cursor-pointer"
                                onClick={() => onChat(fw)}
                            >
                                <MessageSquare className="h-3.5 w-3.5 mr-1 text-emerald-500" /> WA
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-foreground font-semibold text-xs cursor-pointer"
                                onClick={() => onReschedule(fw)}
                            >
                                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Reschedule
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1 cursor-default">
                            <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-500" /> Completed
                        </div>
                    )}
                </div>
            )
        }
    }
]
