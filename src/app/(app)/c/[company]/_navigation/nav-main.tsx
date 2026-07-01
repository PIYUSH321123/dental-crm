"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

    // Helper to determine if a sub-menu item is currently active
    const isSubActive = React.useCallback((subUrl: string) => {
        if (!pathname) return false

        const [subPath, subQuery] = subUrl.split("?")
        const [currentPath] = pathname.split(/[?#]/)

        if (currentPath !== subPath) return false

        if (subQuery) {
            const subParams = new URLSearchParams(subQuery)
            let matchesAll = true
            subParams.forEach((val, key) => {
                if (searchParams.get(key) !== val) {
                    matchesAll = false
                }
            })
            return matchesAll
        }

        // If the subUrl has no query params, it is only active if the current browser search params are also empty
        return searchParams.toString() === ""
    }, [pathname, searchParams])

    // Update collapsible states when route changes to expand the active category folder
    useEffect(() => {
        const nextOpen = { ...openItems }
        let changed = false

        items.forEach((item) => {
            const hasActiveSub = item.items?.some((subItem) => isSubActive(subItem.url))
            if (hasActiveSub && !openItems[item.title]) {
                nextOpen[item.title] = true
                changed = true
            }
        })

        if (changed) {
            setOpenItems(nextOpen)
        }
    }, [pathname, searchParams, items, isSubActive])

    return (
        <SidebarGroup>
            <SidebarGroupLabel>CRM</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasActiveSub = item.items?.some((subItem) => isSubActive(subItem.url))
                    
                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            open={openItems[item.title] ?? hasActiveSub ?? item.isActive}
                            onOpenChange={(isOpen) => 
                                setOpenItems((prev) => ({ ...prev, [item.title]: isOpen }))
                            }
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title} className={hasActiveSub ? "text-primary font-medium" : ""}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => {
                                            const active = isSubActive(subItem.url)
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={active}>
                                                        <a href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </a>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            )
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
