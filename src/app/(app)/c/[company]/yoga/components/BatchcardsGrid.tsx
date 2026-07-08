"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"

interface Batch {
    id: number
    name: string
    schedule: string
    instructor: string
    students: string
    room: string
    level: string
    theme: string
    seatsLeft?: number
}

// Move static style classes and array data outside the component to prevent recreation on every render
const INPUT_STYLES = "p-1.5 border border-[#cfd8dc] rounded-[5px] text-[11px] bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8e44ad]";

const BATCHES: Batch[] = [
    { 
        id: 1, 
        name: "Morning Hatha (Batch A)", 
        schedule: "Mon, Wed, Fri — 6:00–7:00 AM", 
        instructor: "Priya Yoga", 
        students: "14 / 15", 
        room: "Studio 1", 
        level: "Beginner", 
        theme: "from-[#8e44ad] to-[#c0392b]",
        seatsLeft: 1
    },
    { 
        id: 2, 
        name: "Evening Vinyasa (Batch B)", 
        schedule: "Tue, Thu, Sat — 6:30–7:30 PM", 
        instructor: "Anil Yoga", 
        students: "10 / 12", 
        room: "Studio 2", 
        level: "Intermediate", 
        theme: "from-[#27ae60] to-[#1a6eb5]" 
    },
    { 
        id: 3, 
        name: "Prenatal Yoga (Batch C)", 
        schedule: "Sat, Sun — 8:00–9:00 AM", 
        instructor: "Dr. Meena", 
        students: "6 / 8", 
        room: "Quiet Room", 
        level: "Prenatal", 
        theme: "from-[#e67e22] to-[#e74c3c]" 
    }
];

export default function BatchCardsGrid() {
    // Add state hooks for live filtering controls
    const [selectedType, setSelectedType] = React.useState("All Types")
    const [selectedTiming, setSelectedTiming] = React.useState("All Timings")

    // Memoize the filtered batches array to optimize render performance
    const filteredBatches = React.useMemo(() => {
        return BATCHES.filter((batch) => {
            const matchesType = 
                selectedType === "All Types" || 
                batch.name.toLowerCase().includes(selectedType.toLowerCase())

            const matchesTiming = 
                selectedTiming === "All Timings" || 
                batch.name.toLowerCase().includes(selectedTiming.toLowerCase())

            return matchesType && matchesTiming
        })
    }, [selectedType, selectedTiming])

    return (
        <div className="space-y-4">
            {/* Live Filter Controls Bar */}
            <div className="flex flex-wrap gap-2 items-center">
                <select 
                    className={INPUT_STYLES} 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    <option value="All Types">All Types</option>
                    <option value="Hatha">Hatha</option>
                    <option value="Vinyasa">Vinyasa</option>
                </select>
                <select 
                    className={INPUT_STYLES} 
                    value={selectedTiming}
                    onChange={(e) => setSelectedTiming(e.target.value)}
                >
                    <option value="All Timings">All Timings</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                </select>
                <div className="ml-auto flex gap-1.5">
                    <Button variant="outline" size="sm" className="text-xs">
                        + Add Student to Batch
                    </Button>
                    <Button size="sm" className="text-xs bg-[#8e44ad] text-white hover:bg-[#6a1b9a]">
                        + New Batch
                    </Button>
                </div>
            </div>

            {/* Grid Layout containing Batch cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredBatches.map((b) => (
                    <div 
                        key={b.id} 
                        className="bg-white rounded-lg border border-[#dde3ed] overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                    >
                        {/* Card header with dynamic gradient */}
                        <div className={`bg-gradient-to-r ${b.theme} p-3 text-white`}>
                            <div className="text-[13px] font-bold">{b.name}</div>
                            <div className="text-[10px] opacity-90">{b.schedule}</div>
                        </div>

                        {/* Card body content */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                            <div className="text-[11px] text-muted-foreground space-y-0.5">
                                <div>👨‍🏫 Instructor: <span className="text-foreground font-medium">{b.instructor}</span></div>
                                <div>👥 Students: <span className="text-foreground font-medium">{b.students}</span>{b.seatsLeft !== undefined && b.seatsLeft > 0 && <span className="text-[#e67e22] font-semibold ml-1">({b.seatsLeft} {b.seatsLeft === 1 ? 'seat' : 'seats'} left)</span>}</div>
                                <div>📍 Room: <span className="text-foreground font-medium">{b.room}</span></div>
                                <div>🎯 Level: <span className="text-foreground font-medium">{b.level}</span></div>
                            </div>
                            <div className="flex gap-1.5 pt-2 border-t border-[#eceff1]">
                                <button 
                                    type="button" 
                                    className="flex-1 text-[11px] py-1 font-semibold rounded bg-[#8e44ad] text-white hover:bg-[#732d91] cursor-pointer transition-colors"
                                >
                                    Manage
                                </button>
                                <button 
                                    type="button" 
                                    className="flex-1 text-[11px] py-1 font-semibold rounded bg-[#27ae60] text-white hover:bg-[#219653] cursor-pointer transition-colors"
                                >
                                    ✓ Attendance
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredBatches.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                    No batches found matching the selected filters.
                </div>
            )}
        </div>
    )
}
