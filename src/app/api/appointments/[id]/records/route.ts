import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserSession, getAdminSession } from "@/lib/auth-server"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userSession = (await getUserSession()) || (await getAdminSession())
        if (!userSession) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: appointmentId } = await context.params

        const records = await db.meetingRecord.findMany({
            where: { appointmentId },
            orderBy: { createdAt: "desc" },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        return NextResponse.json(records, { status: 200 })
    } catch (error) {
        console.error("GET MeetingRecord error:", error)
        return NextResponse.json({ error: "Failed to fetch meeting records" }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userSession = (await getUserSession()) || (await getAdminSession())
        if (!userSession) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: appointmentId } = await context.params
        const body = await request.json()
        const { title, link } = body

        if (!title || typeof title !== "string" || !title.trim()) {
            return NextResponse.json({ error: "Title is required and must not be empty" }, { status: 400 })
        }

        const trimmedLink = (link || "").trim()
        if (!trimmedLink || !/^https?:\/\/.+/i.test(trimmedLink)) {
            return NextResponse.json({ error: "Link must be a valid URL starting with http:// or https://" }, { status: 400 })
        }

        // Ensure appointment exists or create placeholder if needed
        let appointment = await db.appointment.findUnique({
            where: { id: appointmentId }
        })

        if (!appointment) {
            const defaultCompany = await db.company.findFirst()
            if (defaultCompany) {
                appointment = await db.appointment.create({
                    data: {
                        id: appointmentId,
                        companyId: defaultCompany.id,
                        patientName: "Patient",
                        startTime: new Date(),
                        endTime: new Date(Date.now() + 3600000),
                        status: "Scheduled"
                    }
                })
            }
        }

        const record = await db.meetingRecord.create({
            data: {
                appointmentId,
                title: title.trim(),
                link: trimmedLink,
                createdById: userSession.userId || userSession.id || null
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        return NextResponse.json(record, { status: 201 })
    } catch (error) {
        console.error("POST MeetingRecord error:", error)
        return NextResponse.json({ error: "Failed to create meeting record" }, { status: 500 })
    }
}
