import * as React from "react"
import { getSuperAdminDashboardData } from "@/lib/actions/super-admin"
import SuperAdminPanel from "./super-admin-panel"

export default async function Page() {
    const data = await getSuperAdminDashboardData()

    return (
        <SuperAdminPanel initialClinics={data.companies} />
    )
}
