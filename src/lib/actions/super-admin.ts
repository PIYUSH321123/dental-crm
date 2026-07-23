"use server"

import db from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getSuperAdminDashboardData() {
    try {
        const companies = await db.company.findMany({
            include: {
                users: true,
                patients: true,
                accessConfig: true
            }
        })
        
        return {
            success: true,
            companies: companies.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                status: c.status,
                staff: c.users.length,
                patients: c.patients.length.toString(),
                accessConfig: {
                    marketing: c.accessConfig?.marketing ?? false,
                    appointments: c.accessConfig?.appointments ?? false,
                    billing: c.accessConfig?.billing ?? false,
                    patientManagement: c.accessConfig?.patientManagement ?? false,
                }
            }))
        }
    } catch (error) {
        console.warn("Database offline, using mockup data for Super Admin Panel:", error)
        return {
            success: false,
            companies: [
                {
                    id: "1",
                    name: "Active Life Physio",
                    slug: "yogaplus",
                    status: "Active",
                    staff: 142,
                    patients: "3.2K",
                    accessConfig: { marketing: true, appointments: true, billing: false, patientManagement: true }
                },
                {
                    id: "2",
                    name: "Wellness Plus",
                    slug: "wellness",
                    status: "Active",
                    staff: 58,
                    patients: "1.1K",
                    accessConfig: { marketing: true, appointments: false, billing: false, patientManagement: true }
                },
                {
                    id: "3",
                    name: "SportsRehab Center",
                    slug: "sportsrehab",
                    status: "Suspended",
                    staff: 12,
                    patients: "340",
                    accessConfig: { marketing: false, appointments: false, billing: false, patientManagement: false }
                }
            ]
        }
    }
}

export async function toggleClinicModule(companyId: string, moduleKey: string, enabled: boolean) {
    try {
        await db.companyAccessConfig.upsert({
            where: { companyId },
            update: { [moduleKey]: enabled },
            create: { companyId, [moduleKey]: enabled }
        })
        revalidatePath("/admin/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle clinic module:", error)
        return { success: false, error: "Database offline or operation failed." }
    }
}

export async function updateClinicStatus(companyId: string, status: string) {
    try {
        await db.company.update({
            where: { id: companyId },
            data: { status }
        })
        revalidatePath("/admin/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to update clinic status:", error)
        return { success: false, error: "Database offline or operation failed." }
    }
}

export async function createClinic(name: string, slug: string) {
    try {
        const company = await db.company.create({
            data: {
                name,
                slug,
                accessConfig: {
                    create: {
                        marketing: true,
                        appointments: true,
                        billing: false,
                        patientManagement: true
                    }
                }
            }
        })
        revalidatePath("/admin/dashboard")
        return { success: true, company }
    } catch (error) {
        console.error("Failed to create clinic:", error)
        return { success: false, error: "Database offline or operation failed." }
    }
}
