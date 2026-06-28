"use client"

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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, ListChecksIcon, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react"

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

export interface SearchFilterOption {
    field: string
    label: string
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    loading?: boolean
    searchFilters?: SearchFilterOption[]
    defaultSearchField?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    loading = false,
    searchFilters,
    defaultSearchField,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
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
    })

    const defaultFilters: SearchFilterOption[] = searchFilters ?? [
        { field: "name", label: "Campaign Name" },
        { field: "source", label: "Source" },
        { field: "status", label: "Status" },
    ]

    const [searchField, setSearchField] = useState(
        defaultSearchField ?? defaultFilters[0]?.field ?? "name"
    )
    const [searchValue, setSearchValue] = useState("")

    const changeSearchField = (field: string) => {
        table.getColumn(searchField)?.setFilterValue("")
        setSearchField(field)
        setSearchValue("")
    }

    const resetFilters = () => {
        table.resetColumnFilters()
        setSearchValue("")
    }

    const hasActiveFilters = columnFilters.length > 0 || searchValue !== ""

    // Quick filter helpers for Source and Status
    const selectedSource = (table.getColumn("source")?.getFilterValue() as string) || ""
    const selectedStatus = (table.getColumn("status")?.getFilterValue() as string) || ""

    const handleSourceFilter = (source: string) => {
        table.getColumn("source")?.setFilterValue(source || undefined)
    }

    const handleStatusFilter = (status: string) => {
        table.getColumn("status")?.setFilterValue(status || undefined)
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap justify-between">
                <div className="flex items-center gap-2 flex-wrap flex-1 max-w-2xl">
                    {/* Search Field */}
                    <div className="flex items-center w-full sm:max-w-xs gap-1.5">
                        <Input
                            placeholder={`Search by ${defaultFilters.find(f => f.field === searchField)?.label || searchField}...`}
                            value={searchValue}
                            onChange={(event) => {
                                const value = event.target.value
                                setSearchValue(value)
                                table.getColumn(searchField)?.setFilterValue(value)
                            }}
                            className="h-9"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 shrink-0">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs hidden sm:inline">Search By</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {defaultFilters.map((opt) => (
                                    <DropdownMenuItem
                                        key={opt.field}
                                        onClick={() => changeSearchField(opt.field)}
                                        className={searchField === opt.field ? "bg-accent text-accent-foreground font-medium" : ""}
                                    >
                                        {opt.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Source Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5">
                                <span className="text-xs text-muted-foreground">Source:</span>
                                <span className="text-xs font-semibold">{selectedSource || "All"}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleSourceFilter("")} className={!selectedSource ? "bg-accent font-medium" : ""}>
                                All Sources
                            </DropdownMenuItem>
                            {["Facebook", "Google Ads", "Instagram", "LinkedIn", "YouTube", "Twitter/X"].map((src) => (
                                <DropdownMenuItem
                                    key={src}
                                    onClick={() => handleSourceFilter(src)}
                                    className={selectedSource === src ? "bg-accent font-medium" : ""}
                                >
                                    {src}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Status Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5">
                                <span className="text-xs text-muted-foreground">Status:</span>
                                <span className="text-xs font-semibold">{selectedStatus || "All"}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleStatusFilter("")} className={!selectedStatus ? "bg-accent font-medium" : ""}>
                                All Statuses
                            </DropdownMenuItem>
                            {["Active", "Paused", "Completed", "Draft"].map((st) => (
                                <DropdownMenuItem
                                    key={st}
                                    onClick={() => handleStatusFilter(st)}
                                    className={selectedStatus === st ? "bg-accent font-medium" : ""}
                                >
                                    {st}
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
                            className="h-9 px-2 gap-1 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                            <span className="text-xs">Reset</span>
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1">
                                <ListChecksIcon className="h-4 w-4" />
                                <span className="text-xs hidden sm:inline">Columns</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id.replace(/_/g, ' ')}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table wrapper */}
            <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
                <Table>
                    <TableHeader className="bg-muted/40">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-semibold text-foreground h-11">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        Loading Campaigns...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-muted/30 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">
                                    No marketing campaigns found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-1">
                <div className="flex-1 text-xs text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
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
