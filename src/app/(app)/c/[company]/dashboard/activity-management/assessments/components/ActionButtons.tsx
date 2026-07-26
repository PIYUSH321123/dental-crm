"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ActionButtons() {
    return (
        <div className="flex gap-2.5 mt-4 flex-wrap font-sans">
            <Button 
                type="button"
                onClick={() => toast.success("Clinical assessment saved successfully!")}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-[11px] font-semibold h-8 cursor-pointer"
            >
                💾 Save Assessment
            </Button>
            <Button 
                type="button"
                onClick={() => toast.success("Assessment saved. Loading treatment plan creation...")}
                className="bg-emerald-650 hover:bg-emerald-750 text-white text-[11px] font-semibold h-8 cursor-pointer"
            >
                💾 Save & Create Treatment Plan
            </Button>
            <Button 
                type="button"
                variant="outline"
                onClick={() => {
                    toast.info("Opening printing preview...")
                    window.print()
                }}
                className="border-primary text-primary hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-semibold h-8 cursor-pointer"
            >
                🖨 Print Assessment
            </Button>
        </div>
    )
}
