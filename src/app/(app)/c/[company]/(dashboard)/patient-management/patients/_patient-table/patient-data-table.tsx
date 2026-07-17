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
import { Patient, mockTherapists } from "./patient-data"

interface PatientDataTableProps {
    columns: ColumnDef<Patient, any>[]
    data: Patient[]
    onAddPatient: () => void
    onExport: () => void
}

export function PatientDataTable({
    columns,
    data,
    onAddPatient,
    onExport
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
        <div className="space-y-4 flex-1 font-sans text-slate-700 bg-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2 flex-1 max-w-4xl">
                    {/* Search Field */}
                    <div className="flex items-center w-full sm:max-w-xs gap-1.5">
                        <Input
                            placeholder="🔍 Search name, mobile, ID, condition..."
                            value={globalFilter}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="h-9 bg-white border border-slate-300 text-slate-800 rounded-[5px] focus:border-[#1a6eb5] focus:outline-none"
                        />
                    </div>

                    {/* Status Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 cursor-pointer border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[5px]">
                                <span className="text-xs text-slate-400">Status:</span>
                                <span className="text-xs font-semibold text-slate-700">{selectedStatus || "All"}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-white border border-slate-200 shadow-sm rounded-md">
                            <DropdownMenuItem onClick={() => handleStatusFilter("")} className={!selectedStatus ? "bg-slate-100 font-medium text-xs text-slate-800" : "cursor-pointer text-xs text-slate-700 hover:bg-slate-50"}>
                                All Status
                            </DropdownMenuItem>
                            {["Active", "Completed", "On Hold"].map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    className={selectedStatus === status ? "bg-slate-100 font-medium text-xs text-slate-800" : "cursor-pointer text-xs text-slate-700 hover:bg-slate-50"}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Therapist Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 cursor-pointer border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[5px]">
                                <span className="text-xs text-slate-400">Therapist:</span>
                                <span className="text-xs font-semibold text-slate-700 font-sans">
                                    {selectedTherapist ? (mockTherapists.find(t => t.id === selectedTherapist)?.name || "Selected") : "All"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto bg-white border border-slate-200 shadow-sm rounded-md">
                            <DropdownMenuItem onClick={() => handleTherapistFilter("")} className={!selectedTherapist ? "bg-slate-100 font-medium text-xs text-slate-800" : "cursor-pointer text-xs text-slate-700 hover:bg-slate-50"}>
                                All Therapists
                            </DropdownMenuItem>
                            {mockTherapists.map((therapist) => (
                                <DropdownMenuItem
                                    key={therapist.id}
                                    onClick={() => handleTherapistFilter(therapist.id)}
                                    className={selectedTherapist === therapist.id ? "bg-slate-100 font-medium text-xs text-slate-800" : "cursor-pointer text-xs text-slate-700 hover:bg-slate-50"}
                                >
                                    {therapist.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Condition Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 cursor-pointer border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[5px]">
                                <span className="text-xs text-slate-400">Condition:</span>
                                <span className="text-xs font-semibold text-slate-700">{selectedCondition || "All"}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto bg-white border border-slate-200 shadow-sm rounded-md">
                            <DropdownMenuItem onClick={() => handleConditionFilter("")} className={!selectedCondition ? "bg-slate-100 font-medium text-xs text-slate-800" : "cursor-pointer text-xs text-slate-700 hover:bg-slate-50"}>
                                All Conditions
                            </DropdownMenuItem>
                            {uniqueConditions.map((condition) => (
                                <DropdownMenuItem
                                    key={condition}
                                    onClick={() => handleConditionFilter(condition)}
                                    className={selectedCondition === condition ? "bg-slate-100 font-medium text-xs text-slate-800" : "cursor-pointer text-xs text-slate-700 hover:bg-slate-50"}
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
                            className="h-9 px-2 gap-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                            <span className="text-xs">Reset</span>
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 cursor-pointer border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[5px]" onClick={onExport}>
                        <Download className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-semibold">Export</span>
                    </Button>
                    <Button size="sm" className="h-9 gap-1.5 bg-[#27ae60] text-white hover:bg-[#219653] cursor-pointer rounded-[5px] font-semibold" onClick={onAddPatient}>
                        <Plus className="h-4 w-4" />
                        <span className="text-xs">Add Patient</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 cursor-pointer border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-slate-900 rounded-[5px]">
                                <ListChecksIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-xs hidden sm:inline">Columns</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-sm rounded-md">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize cursor-pointer text-xs text-slate-700 hover:bg-slate-50"
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
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-bold text-slate-700 h-11 text-xs">
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
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500 text-sm">
                                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                                        <Info className="h-6 w-6 text-slate-400" />
                                        <p className="font-semibold text-slate-600">No patients found</p>
                                        <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow 
                                    key={row.id} 
                                    className="hover:bg-slate-50 border-b border-slate-200 transition-colors text-xs text-slate-700"
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
