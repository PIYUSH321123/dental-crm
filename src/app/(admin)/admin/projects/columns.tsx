"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Project, getProjectSlug } from "./data"
export const columns: ColumnDef<Project>[] = [
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
        accessorKey: "project_name",
        header: "Project Name",
        cell: ({ row }) => {
            const projectName = row.getValue("project_name") as string
            const companyName = row.original.company_name
            const slug = getProjectSlug(projectName, companyName)
            return (
                <Link
                    href={`/c/${slug}/`}
                    className="font-semibold text-primary hover:underline"
                >
                    {projectName}
                </Link>
            )
        }
    },
    {
        accessorKey: "company_name",
        header: "Company Name",
        cell: ({ row }) => {
            return <div className="font-semibold text-foreground">{row.getValue("company_name")}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border bg-muted/30 text-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${status === "Active"
                        ? "bg-emerald-500 animate-pulse"
                        : status === "Pending"
                            ? "bg-amber-500"
                            : status === "Suspended"
                                ? "bg-rose-500"
                                : "bg-zinc-400" // Inactive
                        }`} />
                    {status}
                </span>
            )
        },
    },
    {
        accessorKey: "subscription_plan",
        header: "Subscription Plan",
        cell: ({ row }) => {
            const plan = row.getValue("subscription_plan") as string
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {plan}
                </span>
            )
        }
    },
    {
        accessorKey: "renewal_date",
        header: "Renewal Date",
        cell: ({ row }) => {
            const dateStr = row.getValue("renewal_date") as string
            const date = new Date(dateStr)
            const formatted = date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            return <div className="text-xs font-mono text-muted-foreground">{formatted}</div>
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
            return <div className="font-medium text-foreground">{formatted}</div>
        },
    },
    {
        accessorKey: "lead_name",
        header: "Lead Contact",
        cell: ({ row }) => {
            return (
                <div className="text-xs">
                    <div className="font-medium text-foreground">{row.getValue("lead_name")}</div>
                    <div className="text-muted-foreground font-mono">{row.original.email}</div>
                </div>
            )
        }
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => {
            const dateStr = row.getValue("created_at") as string
            const date = new Date(dateStr)
            const formatted = date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            return <div className="text-xs text-muted-foreground">{formatted}</div>
        }
    }
]
