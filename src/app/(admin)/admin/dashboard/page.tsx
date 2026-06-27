import * as React from "react"
import { ChartAreaInteractive } from "@/app/(admin)/admin/dashboard/chart-area-interactive"
import { DataTable } from "@/app/(admin)/admin/dashboard/data-table"
import { SectionCards } from "@/app/(admin)/admin/dashboard/section-cards"

// Local Data
import data from "./data.json"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  )
}
