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
import { MoreHorizontal, Play, Pause, Trash, Eye, BarChart4 } from "lucide-react"
import { Campaign } from "./data"

export const columns: ColumnDef<Campaign>[] = [
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
        header: "Campaign Name",
        cell: ({ row }) => {
            const name = row.getValue("name") as string
            return <div className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">{name}</div>
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
            } else if (source === "Google Ads") {
                badgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
            } else if (source === "Instagram") {
                badgeClass = "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/50"
            } else if (source === "LinkedIn") {
                badgeClass = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50"
            } else if (source === "YouTube") {
                badgeClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
            }

            return (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeClass}`}>
                    {source}
                </span>
            )
        }
    },
    {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("budget"))
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }).format(amount)
            return <div className="font-semibold text-foreground font-mono">{formatted}</div>
        },
    },
    {
        accessorKey: "leads",
        header: "Leads",
        cell: ({ row }) => {
            return <div className="font-medium text-foreground font-mono">{row.getValue("leads")}</div>
        }
    },
    {
        accessorKey: "converted",
        header: "Converted",
        cell: ({ row }) => {
            const converted = row.original.converted
            const leads = row.original.leads
            const rate = leads > 0 ? ((converted / leads) * 100).toFixed(1) : "0.0"
            return (
                <div>
                    <span className="font-medium text-foreground font-mono">{converted}</span>
                    <span className="text-xs text-muted-foreground ml-1">({rate}%)</span>
                </div>
            )
        }
    },
    {
        id: "costPerLead",
        header: "Cost/Lead",
        cell: ({ row }) => {
            const budget = row.original.budget
            const leads = row.original.leads
            const cpl = leads > 0 ? budget / leads : 0
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }).format(cpl)
            return <div className="font-medium text-foreground font-mono">{formatted}</div>
        }
    },
    {
        id: "roi",
        header: "ROI",
        cell: ({ row }) => {
            const budget = row.original.budget
            const revenue = row.original.revenue
            const roi = budget > 0 ? ((revenue - budget) / budget) * 100 : 0
            const formatted = `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%`
            
            return (
                <div className={`font-semibold font-mono ${roi >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatted}
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border bg-muted/30 text-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                        status === "Active"
                            ? "bg-emerald-500 animate-pulse"
                            : status === "Paused"
                                ? "bg-amber-500"
                                : status === "Completed"
                                    ? "bg-indigo-500"
                                    : "bg-zinc-400" // Draft
                    }`} />
                    {status}
                </span>
            )
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }) => {
            const campaign = row.original

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/80">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                <BarChart4 className="h-3.5 w-3.5" />
                                <span>Analytics</span>
                            </DropdownMenuItem>
                            {campaign.status === "Active" ? (
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <Pause className="h-3.5 w-3.5" />
                                    <span>Pause</span>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <Play className="h-3.5 w-3.5" />
                                    <span>Activate</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-rose-600 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400 cursor-pointer">
                                <Trash className="h-3.5 w-3.5" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    }
]
