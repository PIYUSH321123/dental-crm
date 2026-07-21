"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useParams } from "next/navigation"
import Link from "next/link"

export function SiteHeader() {
  const { company } = useParams()
  const companyStr = (Array.isArray(company) ? company[0] : company) || ""

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Link href={`/c/${companyStr}/dashboard`} className="hover:underline">
          <h1 className="text-base font-medium text-slate-800 dark:text-slate-200">Dashboard</h1>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
