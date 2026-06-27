"use client"

import * as React from "react"
import "@/app/globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { SlidersHorizontal } from "lucide-react"

// UI Components
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

// App Components
import { AppSidebar } from "@/app/(app)/c/[company]/_navigation/app-sidebar"

export default function CompanyLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const [crmVisible, setCrmVisible] = React.useState(true)
    const [erpVisible, setErpVisible] = React.useState(true)
    const [hiddenCrmModules, setHiddenCrmModules] = React.useState<string[]>([])
    const [hiddenErpModules, setHiddenErpModules] = React.useState<string[]>([])
    const [hiddenSecondaryModules, setHiddenSecondaryModules] = React.useState<string[]>([])

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TooltipProvider>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar
                        crmVisible={crmVisible}
                        erpVisible={erpVisible}
                        hiddenCrmModules={hiddenCrmModules}
                        hiddenErpModules={hiddenErpModules}
                        hiddenSecondaryModules={hiddenSecondaryModules}
                        variant="inset"
                    />
                    <SidebarInset>
                        <SiteHeader />
                        {children}

                        {/* Floating Navigation Controls Bubble */}
                        <div className="fixed bottom-6 right-6 z-50">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
                                    >
                                        <SlidersHorizontal className="h-5 w-5" />
                                        <span className="sr-only">Toggle navigation visibility</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-60 rounded-xl p-2">
                                    <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5 text-muted-foreground uppercase tracking-wider">
                                        Sidebar Sections
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuCheckboxItem
                                        checked={crmVisible}
                                        onCheckedChange={setCrmVisible}
                                        className="text-xs font-medium rounded-lg cursor-pointer"
                                    >
                                        <span>CRM Section</span>
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={erpVisible}
                                        onCheckedChange={setErpVisible}
                                        className="text-xs font-medium rounded-lg cursor-pointer"
                                    >
                                        <span>ERP Section</span>
                                    </DropdownMenuCheckboxItem>

                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5 text-muted-foreground uppercase tracking-wider">
                                        Module Visibility
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="my-1" />

                                    {/* CRM Modules Submenu */}
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="text-xs font-medium rounded-lg">
                                            <span>CRM Modules</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="w-56 rounded-xl p-2">
                                            {["Marketing", "Lead Management", "Patient Management", "Activity Management", "Appoinments", "Product & Services", "Settings"].map((module) => {
                                                const isHidden = hiddenCrmModules.includes(module);
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={module}
                                                        checked={!isHidden}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setHiddenCrmModules(hiddenCrmModules.filter(m => m !== module))
                                                            } else {
                                                                setHiddenCrmModules([...hiddenCrmModules, module])
                                                            }
                                                        }}
                                                        className="text-xs font-medium rounded-lg cursor-pointer"
                                                    >
                                                        <span>{module === "Appoinments" ? "Appointments" : module}</span>
                                                    </DropdownMenuCheckboxItem>
                                                )
                                            })}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    {/* ERP Modules Submenu */}
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="text-xs font-medium rounded-lg">
                                            <span>ERP Modules</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="w-56 rounded-xl p-2">
                                            {["Analytics", "Inventory", "Workflows", "Staff", "Reports"].map((module) => {
                                                const isHidden = hiddenErpModules.includes(module);
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={module}
                                                        checked={!isHidden}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setHiddenErpModules(hiddenErpModules.filter(m => m !== module))
                                                            } else {
                                                                setHiddenErpModules([...hiddenErpModules, module])
                                                            }
                                                        }}
                                                        className="text-xs font-medium rounded-lg cursor-pointer"
                                                    >
                                                        <span>{module}</span>
                                                    </DropdownMenuCheckboxItem>
                                                )
                                            })}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    {/* Secondary Modules (Support / Feedback) */}
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="text-xs font-medium rounded-lg">
                                            <span>Support & Feedback</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="w-56 rounded-xl p-2">
                                            {["Support", "Feedback"].map((module) => {
                                                const isHidden = hiddenSecondaryModules.includes(module);
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={module}
                                                        checked={!isHidden}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setHiddenSecondaryModules(hiddenSecondaryModules.filter(m => m !== module))
                                                            } else {
                                                                setHiddenSecondaryModules([...hiddenSecondaryModules, module])
                                                            }
                                                        }}
                                                        className="text-xs font-medium rounded-lg cursor-pointer"
                                                    >
                                                        <span>{module}</span>
                                                    </DropdownMenuCheckboxItem>
                                                )
                                            })}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}
