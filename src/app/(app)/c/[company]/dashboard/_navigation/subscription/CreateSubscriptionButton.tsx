"use client"

import React, { useState } from "react"
import { PlusCircle } from "lucide-react"
import { CreateSubscriptionDialog } from "./CreateSubscriptionDialog"
import { Button } from "@/components/ui/button"

export function CreateSubscriptionButton() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div className="mt-2.5 border-t border-sidebar-border pt-2.5 px-3">
                <Button
                    onClick={() => setOpen(true)}
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 transition-all duration-200 cursor-pointer h-9"
                >
                    <PlusCircle className="h-4.5 w-4.5" />
                    <span>Create Subscription</span>
                </Button>
            </div>

            <CreateSubscriptionDialog open={open} onOpenChange={setOpen} />
        </>
    )
}
