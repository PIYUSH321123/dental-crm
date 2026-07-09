"use client"

import * as React from "react"
import { Search, ChevronsUpDown, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PatientOption {
    value: string
    label: string
}

interface PatientSearchSelectProps {
    options: PatientOption[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function PatientSearchSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select patient…",
    className,
}: PatientSearchSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder

    const filtered = React.useMemo(() => {
        if (!query.trim()) return options
        return options.filter((o) =>
            o.label.toLowerCase().includes(query.toLowerCase())
        )
    }, [options, query])

    // Close on outside click
    React.useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
                setQuery("")
            }
        }
        document.addEventListener("mousedown", handleOutside)
        return () => document.removeEventListener("mousedown", handleOutside)
    }, [])

    function handleOpen() {
        setOpen(true)
        setQuery("")
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    function handleSelect(val: string) {
        onValueChange(val)
        setOpen(false)
        setQuery("")
    }

    return (
        <div ref={containerRef} className={cn("relative w-56", className)}>
            {/* Trigger */}
            <button
                type="button"
                onClick={handleOpen}
                className={cn(
                    "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    open && "ring-2 ring-ring/50"
                )}
            >
                <span className="truncate text-xs font-medium">{selectedLabel}</span>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
                    {/* Search input */}
                    <div className="flex items-center gap-1.5 border-b border-border px-2.5 py-2">
                        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search patient…"
                            className="h-6 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-muted-foreground/60"
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-48 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                No patients found
                            </div>
                        ) : (
                            filtered.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        value === option.value && "bg-accent/60 font-semibold text-accent-foreground"
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "h-3 w-3 shrink-0 text-primary",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
