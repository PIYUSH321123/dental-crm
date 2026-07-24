import React, { useState, useMemo } from "react"
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
import { ListChecksIcon, ChevronLeft, ChevronRight, X, Info, Download, Plus } from "lucide-react"

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
import { Patient } from "./patient-data"

interface PatientDataTableProps {
    columns: ColumnDef<Patient, any>[]
    data: Patient[]
    onAddPatient: () => void
    onExport: () => void
    therapists?: { id: string; name: string }[]
}

export function PatientDataTable({
    columns,
    data,
    onAddPatient,
    onExport,
    therapists = []
}: PatientDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        dob: false,
        blood_group: false,
        email: false,
        occupation: false,
        address: false,
    })
    const [globalFilter, setGlobalFilter] = useState("")

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) => {
            const val = String(filterValue).toLowerCase().trim()
            if (!val) return true
            
            const original = row.original
            const name = (original.name || "").toLowerCase()
            const id = (original.id || "").toLowerCase()
            const mobile = (original.mobile || "").toLowerCase()
            const condition = (original.condition || "").toLowerCase()
            
            return name.includes(val) || id.includes(val) || mobile.includes(val) || condition.includes(val)
        },
        initialState: {
            pagination: {
                pageSize: 5
            }
        }
    })

    // Dropdown filters mapping
    const selectedStatus = (table.getColumn("status")?.getFilterValue() as string) || ""
    const selectedTherapist = (table.getColumn("assigned_therapist_id")?.getFilterValue() as string) || ""
    const selectedCondition = (table.getColumn("condition")?.getFilterValue() as string) || ""

    // Unique conditions for filter
    const uniqueConditions = useMemo(() => {
        const set = new Set<string>()
        data.forEach(p => {
            if (p.condition) set.add(p.condition)
        })
        return Array.from(set)
    }, [data])

    const handleStatusFilter = (status: string) => {
        table.getColumn("status")?.setFilterValue(status || undefined)
    }

    const handleTherapistFilter = (therapistId: string) => {
        table.getColumn("assigned_therapist_id")?.setFilterValue(therapistId || undefined)
    }

    const handleConditionFilter = (condition: string) => {
        table.getColumn("condition")?.setFilterValue(condition || undefined)
    }

    const hasActiveFilters = columnFilters.length > 0 || globalFilter !== ""
    const resetFilters = () => {
        table.resetColumnFilters()
        setGlobalFilter("")
    }

    return (
        <div className="space-y-4 flex-1 font-sans text-foreground">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2 flex-1 max-w-4xl">
                    {/* Search Field */}
                    <div className="flex items-center w-full sm:max-w-xs gap-1.5">
                        <Input
                            placeholder="🔍 Search name, mobile, ID, condition..."
                            value={globalFilter}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="h-9 bg-background border border-border text-foreground rounded-[5px] focus:outline-none"
                        />
                    </div>

                    {/* Status Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 cursor-pointer border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-[5px]">
                                <span className="text-xs text-muted-foreground">Status:</span>
                                <span className="text-xs font-semibold text-foreground">{selectedStatus || "All"}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-card border border-border shadow-md rounded-md">
                            <DropdownMenuItem onClick={() => handleStatusFilter("")} className={!selectedStatus ? "bg-accent font-medium text-xs text-foreground" : "cursor-pointer text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"}>
                                All Status
                            </DropdownMenuItem>
                            {["Active", "Completed", "On Hold"].map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    className={selectedStatus === status ? "bg-accent font-medium text-xs text-foreground" : "cursor-pointer text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Therapist Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 cursor-pointer border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-[5px]">
                                <span className="text-xs text-muted-foreground">Therapist:</span>
                                <span className="text-xs font-semibold text-foreground font-sans">
                                    {selectedTherapist ? (therapists.find(t => t.id === selectedTherapist)?.name || "Selected") : "All"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto bg-card border border-border shadow-md rounded-md">
                            <DropdownMenuItem onClick={() => handleTherapistFilter("")} className={!selectedTherapist ? "bg-accent font-medium text-xs text-foreground" : "cursor-pointer text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"}>
                                All Therapists
                            </DropdownMenuItem>
                            {therapists.map((therapist) => (
                                <DropdownMenuItem
                                    key={therapist.id}
                                    onClick={() => handleTherapistFilter(therapist.id)}
                                    className={selectedTherapist === therapist.id ? "bg-accent font-medium text-xs text-foreground" : "cursor-pointer text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                                >
                                    {therapist.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Condition Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 cursor-pointer border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-[5px]">
                                <span className="text-xs text-muted-foreground">Condition:</span>
                                <span className="text-xs font-semibold text-foreground">{selectedCondition || "All"}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto bg-card border border-border shadow-md rounded-md">
                            <DropdownMenuItem onClick={() => handleConditionFilter("")} className={!selectedCondition ? "bg-accent font-medium text-xs text-foreground" : "cursor-pointer text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"}>
                                All Conditions
                            </DropdownMenuItem>
                            {uniqueConditions.map((condition) => (
                                <DropdownMenuItem
                                    key={condition}
                                    onClick={() => handleConditionFilter(condition)}
                                    className={selectedCondition === condition ? "bg-accent font-medium text-xs text-foreground" : "cursor-pointer text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                                >
                                    {condition}
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
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 cursor-pointer border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-[5px]" onClick={onExport}>
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold">Export</span>
                    </Button>
                    <Button size="sm" className="h-9 gap-1.5 bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer rounded-[5px] font-semibold" onClick={onAddPatient}>
                        <Plus className="h-4 w-4" />
                        <span className="text-xs">Add Patient</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 cursor-pointer border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-[5px]">
                                <ListChecksIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs hidden sm:inline">Columns</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border shadow-md rounded-md">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize cursor-pointer text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-semibold text-foreground h-11 text-xs">
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
                                        <Info className="h-6 w-6 text-muted-foreground" />
                                        <p className="font-semibold text-foreground/80">No patients found</p>
                                        <p className="text-xs text-muted-foreground">Try adjusting your filters or search terms.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow 
                                    key={row.id} 
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-border transition-colors text-xs text-foreground/80"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-2.5">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-2">
                <div className="flex-1 text-xs text-slate-500 font-semibold">
                    Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} patients
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[5px]"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-slate-500 font-bold">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount() || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[5px]"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
