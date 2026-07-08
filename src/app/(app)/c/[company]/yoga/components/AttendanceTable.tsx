"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Student {
    id: number
    name: string
    mobile: string
    membership: string
    classesLeft: number
    attendance: "Present" | "Absent" | "Leave" | null
}

const INITIAL_STUDENTS: Student[] = [
    { id: 1, name: "Kavita Sharma", mobile: "+91 98xxx", membership: "Monthly", classesLeft: 8, attendance: "Present" },
    { id: 2, name: "Anita Mehta", mobile: "+91 90xxx", membership: "3-Month", classesLeft: 22, attendance: "Absent" },
    { id: 3, name: "Sunita Rao", mobile: "+91 97xxx", membership: "10-Class Pack", classesLeft: 3, attendance: "Present" }
]

export default function AttendanceTable() {
    const [students, setStudents] = React.useState<Student[]>(INITIAL_STUDENTS)

    // Mark all students as present
    const handleMarkAllPresent = () => {
        setStudents(prev => prev.map(s => ({ ...s, attendance: "Present" })))
        toast.success("Marked all students as Present")
    }

    // Update attendance state for a specific student
    const handleSetAttendance = (id: number, status: "Present" | "Absent" | "Leave") => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, attendance: status } : s))
    }

    // Save attendance list (simulated action)
    const handleSaveAttendance = () => {
        toast.success("Attendance saved successfully")
    }

    // Dynamically derive students with warning limits (3 or fewer classes left)
    const lowBalanceStudents = React.useMemo(() => {
        return students.filter(s => s.classesLeft <= 3)
    }, [students])

    return (
        <div className="space-y-4">
            {/* Header / Operations Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                <div className="text-sm font-semibold text-foreground">
                    ✅ Attendance — Morning Hatha (Jun 14, 2026 — 6:00 AM)
                </div>
                <div className="flex gap-1.5">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs text-muted-foreground cursor-pointer"
                        onClick={handleMarkAllPresent}
                    >
                        Mark All Present
                    </Button>
                    <Button 
                        size="sm" 
                        className="text-xs bg-primary text-white cursor-pointer hover:bg-primary/90"
                        onClick={handleSaveAttendance}
                    >
                        💾 Save Attendance
                    </Button>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-hidden border border-[#eceff1] rounded-md shadow-xs bg-card">
                <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                        <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
                            <th className="p-2.5 pl-3">#</th>
                            <th className="p-2.5">Student Name</th>
                            <th className="p-2.5">Mobile</th>
                            <th className="p-2.5">Membership</th>
                            <th className="p-2.5">Classes Left</th>
                            <th className="p-2.5 pr-3 text-right">Attendance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
                        {students.map((student, idx) => {
                            const isLowClasses = student.classesLeft <= 3
                            const isPresent = student.attendance === "Present"
                            const isAbsent = student.attendance === "Absent"
                            const isLeave = student.attendance === "Leave"

                            return (
                                <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-2.5 pl-3 text-foreground font-medium">{idx + 1}</td>
                                    <td className="p-2.5 text-foreground font-bold">{student.name}</td>
                                    <td className="p-2.5">{student.mobile}</td>
                                    <td className="p-2.5">{student.membership}</td>
                                    <td className={`p-2.5 ${isLowClasses ? "text-destructive font-bold" : "text-foreground"}`}>
                                        {student.classesLeft} left {isLowClasses && "⚠"}
                                    </td>
                                    <td className="p-2.5 pr-3 text-right space-x-1 whitespace-nowrap">
                                        <button 
                                            type="button" 
                                            onClick={() => handleSetAttendance(student.id, "Present")}
                                            className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                                                isPresent 
                                                ? "bg-[#27ae60] text-white" 
                                                : "bg-[#eceff1] text-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {isPresent ? "✅ Present" : "Present"}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleSetAttendance(student.id, "Absent")}
                                            className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                                                isAbsent 
                                                ? "bg-[#e74c3c] text-white" 
                                                : "bg-[#eceff1] text-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {isAbsent ? "❌ Absent" : "Absent"}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleSetAttendance(student.id, "Leave")}
                                            className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                                                isLeave 
                                                ? "bg-[#90a4ae] text-white" 
                                                : "bg-[#eceff1] text-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {isLeave ? "🔄 Leave" : "Leave"}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Dynamic Alerts Section */}
            {lowBalanceStudents.length > 0 && (
                <div className="space-y-1.5">
                    {lowBalanceStudents.map(student => (
                        <div 
                            key={student.id} 
                            className="bg-[#fff3e0] border border-[#ffe0b2] rounded-md p-2.5 text-[11px] text-[#7a4100] font-medium flex items-center gap-1.5"
                        >
                            <span>⚠</span>
                            <span>
                                <strong>{student.name}</strong> has only {student.classesLeft} classes remaining. Remind to renew.
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
