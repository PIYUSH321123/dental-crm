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
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1 rounded-full h-8 w-8 hover:bg-slate-105 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-pointer flex items-center justify-center shrink-0" />
        <Link 
          href={companyStr ? `/c/${companyStr}/dashboard` : `/admin/dashboard`} 
          className="hover:underline flex items-center gap-2"
        >
          <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200">Dashboard</h1>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
