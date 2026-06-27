"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Laptop } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-[110px] h-8 bg-muted/50 rounded-md animate-pulse" />
    )
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-[110px] h-8 text-xs font-medium focus:ring-0">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light" className="text-xs">
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Light</span>
          </span>
        </SelectItem>
        <SelectItem value="dark" className="text-xs">
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Dark</span>
          </span>
        </SelectItem>
        <SelectItem value="system" className="text-xs">
          <span className="flex items-center gap-2">
            <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
            <span>System</span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
