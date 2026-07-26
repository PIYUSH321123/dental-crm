"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default function DocumentUpload() {
    return (
        <Card className="bg-card border-border shadow-xs mt-3.5">
            <CardHeader className="p-3.5 border-b border-border pb-2.5">
                <CardTitle className="text-[10px] font-bold text-primary tracking-wider uppercase">
                    DOCUMENTS & REPORTS
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 flex gap-2.5 items-center flex-wrap">
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 cursor-pointer font-semibold">
                    <Upload className="h-3 w-3" /> Upload X-Ray
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 cursor-pointer font-semibold">
                    <Upload className="h-3 w-3" /> Upload MRI
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 cursor-pointer font-semibold">
                    <Upload className="h-3 w-3" /> Upload Reports
                </Button>
                <div className="text-[10px] text-muted-foreground ml-2">
                    Uploaded: X-Ray (2), MRI Report.pdf
                </div>
            </CardContent>
        </Card>
    )
}
