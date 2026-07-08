"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function WorkshopsTable() {
    const inputStyles = "p-1.5 border border-[#cfd8dc] rounded-[5px] text-[11px] bg-background text-foreground focus-visible:outline-none";

    const [searchQuery, setSearchQuery] = React.useState("")

    const workshops = [
        { id: 1, title: "Back Pain Relief Intensive", type: "Workshop", instructor: "Dr. Ankita + Priya Yoga", date: "Jul 18, 2026", price: "₹1,500", enrolled: "12 / 20", status: "Open" },
        { id: 2, title: "Prenatal Breathwork Masterclass", type: "Course (4 Weeks)", instructor: "Dr. Meena", date: "Aug 01, 2026", price: "₹4,500", enrolled: "5 / 10", status: "Open" },
    ];

    const filteredWorkshops = workshops.filter(w => 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateProgram = () => {
        toast.info("Create Course / Workshop wizard is coming soon!")
    }

    const handleAction = (action: string, program: string) => {
        toast.success(`${action} for ${program} triggered!`)
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
                <input 
                    type="text" 
                    className={`${inputStyles} flex-1 min-w-[160px]`} 
                    placeholder="🔍 Search courses or masterclasses..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                    size="sm" 
                    className="text-xs bg-[#8e44ad] text-white hover:bg-[#6a1b9a] ml-auto cursor-pointer"
                    onClick={handleCreateProgram}
                >
                    + Create Course / Workshop
                </Button>
            </div>

            <div className="overflow-hidden border border-[#eceff1] rounded-md bg-card shadow-xs">
                <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                        <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
                            <th className="p-2 pl-3">Program Title</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Lead Instructor</th>
                            <th className="p-2">Start Date</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Enrollments</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 pr-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
                        {filteredWorkshops.map((w) => (
                            <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-2 pl-3 text-foreground font-bold">{w.title}</td>
                                <td className="p-2 font-medium">{w.type}</td>
                                <td className="p-2">{w.instructor}</td>
                                <td className="p-2">{w.date}</td>
                                <td className="p-2 text-foreground font-semibold">{w.price}</td>
                                <td className="p-2">{w.enrolled}</td>
                                <td className="p-2">
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#e8f5e9] text-[#2e7d32]">
                                        {w.status}
                                    </span>
                                </td>
                                <td className="p-2 pr-3 text-right space-x-1 whitespace-nowrap">
                                    <button 
                                        type="button" 
                                        onClick={() => handleAction("Edit", w.title)}
                                        className="text-[10px] px-1.5 py-0.5 border rounded hover:bg-muted text-foreground cursor-pointer transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleAction("Add Student", w.title)}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#8e44ad] text-white font-semibold hover:bg-[#6a1b9a] cursor-pointer transition-colors"
                                    >
                                        Add Student
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredWorkshops.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                    No programs found matching search query.
                </div>
            )}
        </div>
    )
}
