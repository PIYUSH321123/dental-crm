import React, { useState } from "react"
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Filter, ListChecksIcon, ChevronLeft, ChevronRight, X, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { FollowUp } from "./follow-up-data"
import { mockTherapists, Therapist } from "../../leads/_lead-data-table/lead-data"

interface FollowUpDataTableProps {
    columns: ColumnDef<FollowUp, any>[]
    data: FollowUp[]
    activeTab: "today" | "overdue" | "upcoming" | "completed" | "all"
    setActiveTab: (tab: "today" | "overdue" | "upcoming" | "completed" | "all") => void
    metrics: {
        today: number
        overdue: number
        upcoming: number
        completed: number
        pending: number
    }
    getTherapistName: (id: string) => string
}

export function FollowUpDataTable({
    columns,
    data,
    activeTab,
    setActiveTab,
    metrics,
    getTherapistName
}: FollowUpDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        last_activity: true,
        assigned_to_id: true,
    })
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize: 5
            }
        }
    })

    const searchOptions = [
        { field: "lead_name", label: "Lead Name" },
        { field: "lead_mobile", label: "Mobile" }
    ]
    const [searchField, setSearchField] = useState("lead_name")
    const [searchValue, setSearchValue] = useState("")

    const changeSearchField = (field: string) => {
        table.getColumn(searchField)?.setFilterValue("")
        setSearchField(field)
        setSearchValue("")
    }

    const hasActiveFilters = columnFilters.length > 0 || searchValue !== ""
    const resetFilters = () => {
        table.resetColumnFilters()
        setSearchValue("")
    }

    // Dropdown filters mapping
    const selectedType = (table.getColumn("type")?.getFilterValue() as string) || ""
    const selectedTherapist = (table.getColumn("assigned_to_id")?.getFilterValue() as string) || ""

    const handleTypeFilter = (type: string) => {
        table.getColumn("type")?.setFilterValue(type || undefined)
    }

    const handleTherapistFilter = (therapistId: string) => {
        table.getColumn("assigned_to_id")?.setFilterValue(therapistId || undefined)
    }

    return (
        <div className="space-y-4">
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardHeader className="pb-3 border-b border-border">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg font-bold">Follow-up Task Board</CardTitle>
                            <CardDescription>Filter and execute pending lead follow-ups by call, WhatsApp, or SMS.</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="bg-muted p-0.5 rounded-md text-xs">
                                <TabsList className="bg-transparent h-8 space-x-0.5">
                                    <TabsTrigger value="today" className="px-3 h-7 text-xs rounded cursor-pointer">Due Today ({metrics.today})</TabsTrigger>
                                    <TabsTrigger value="overdue" className="px-3 h-7 text-xs rounded text-destructive data-[state=active]:text-destructive cursor-pointer">Overdue ({metrics.overdue})</TabsTrigger>
                                    <TabsTrigger value="upcoming" className="px-3 h-7 text-xs rounded cursor-pointer">Upcoming ({metrics.upcoming})</TabsTrigger>
                                    <TabsTrigger value="completed" className="px-3 h-7 text-xs rounded text-emerald-600 dark:text-emerald-400 cursor-pointer">Completed ({metrics.completed})</TabsTrigger>
                                    <TabsTrigger value="all" className="px-3 h-7 text-xs rounded cursor-pointer">All</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardHeader>

                {/* Toolbar */}
                <div className="p-4 bg-muted/20 border-b border-border space-y-4">
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                        <div className="flex items-center gap-2 flex-wrap flex-1 max-w-2xl">
                            {/* Search Field */}
                            <div className="flex items-center w-full sm:max-w-xs gap-1.5">
                                <Input
                                    placeholder={`Search by ${searchOptions.find(f => f.field === searchField)?.label || searchField}...`}
                                    value={searchValue}
                                    onChange={(event) => {
                                        const value = event.target.value
                                        setSearchValue(value)
                                        table.getColumn(searchField)?.setFilterValue(value)
                                    }}
                                    className="h-9 bg-background border-input"
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 shrink-0 cursor-pointer">
                                            <Filter className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs hidden sm:inline">Search By</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {searchOptions.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.field}
                                                onClick={() => changeSearchField(opt.field)}
                                                className={searchField === opt.field ? "bg-accent text-accent-foreground font-medium" : "cursor-pointer"}
                                            >
                                                {opt.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Type Filter Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 cursor-pointer">
                                        <span className="text-xs text-muted-foreground">Type:</span>
                                        <span className="text-xs font-semibold">{selectedType || "All"}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem onClick={() => handleTypeFilter("")} className={!selectedType ? "bg-accent font-medium" : "cursor-pointer"}>
                                        All Types
                                    </DropdownMenuItem>
                                    {["Call", "WhatsApp", "SMS"].map((type) => (
                                        <DropdownMenuItem
                                            key={type}
                                            onClick={() => handleTypeFilter(type)}
                                            className={selectedType === type ? "bg-accent font-medium" : "cursor-pointer"}
                                        >
                                            {type}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Therapist Filter Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 cursor-pointer">
                                        <span className="text-xs text-muted-foreground">Assigned To:</span>
                                        <span className="text-xs font-semibold">
                                            {selectedTherapist ? getTherapistName(selectedTherapist) : "All"}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem onClick={() => handleTherapistFilter("")} className={!selectedTherapist ? "bg-accent font-medium" : "cursor-pointer"}>
                                        All Assigned To
                                    </DropdownMenuItem>
                                    {mockTherapists.map((therapist: Therapist) => (
                                        <DropdownMenuItem
                                            key={therapist.id}
                                            onClick={() => handleTherapistFilter(therapist.id)}
                                            className={selectedTherapist === therapist.id ? "bg-accent font-medium" : "cursor-pointer"}
                                        >
                                            {therapist.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Reset Button */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    onClick={resetFilters}
                                    size="sm"
                                    className="h-9 px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="text-xs">Reset</span>
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-1 cursor-pointer">
                                        <ListChecksIcon className="h-4 w-4" />
                                        <span className="text-xs hidden sm:inline">Columns</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize cursor-pointer"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id.replace(/_/g, ' ')}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Main Data Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-border">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="font-semibold text-foreground h-11">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground text-sm">
                                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                                            <Info className="h-6 w-6 text-muted-foreground/60" />
                                            <p className="font-medium text-muted-foreground">No follow-ups match filters</p>
                                            <p className="text-xs text-muted-foreground/60">Try adjusting your filters or search terms.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow 
                                        key={row.id} 
                                        className="hover:bg-muted/30 border-border transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-2">
                <div className="flex-1 text-xs text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} row(s) available.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount() || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
