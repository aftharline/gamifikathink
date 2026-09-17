"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const OPEN_SIDEBAR_EVENT = "gamifikathink:open-sidebar"

export function MobileMenuTrigger({ className }: { className?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 shrink-0 text-[var(--text-secondary)] lg:hidden",
        className
      )}
      onClick={() =>
        window.dispatchEvent(new CustomEvent(OPEN_SIDEBAR_EVENT))
      }
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
