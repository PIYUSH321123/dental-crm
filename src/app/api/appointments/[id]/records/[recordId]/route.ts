import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserSession, getAdminSession } from "@/lib/auth-server"

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string; recordId: string }> }
) {
    try {
        const userSession = (await getUserSession()) || (await getAdminSession())
        if (!userSession) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: appointmentId, recordId } = await context.params

        const existing = await db.meetingRecord.findFirst({
            where: {
                id: recordId,
                appointmentId
            }
        })

        if (!existing) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 })
        }

        await db.meetingRecord.delete({
            where: { id: recordId }
        })

        return NextResponse.json({ success: true, message: "Record deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error("DELETE MeetingRecord error:", error)
        return NextResponse.json({ error: "Failed to delete meeting record" }, { status: 500 })
    }
}
