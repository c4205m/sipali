import * as RPopover from "@radix-ui/react-popover"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

export function Popover({
  trigger,
  children,
  align = "center",
  side = "bottom",
  className,
}: {
  trigger: ReactNode
  children: ReactNode
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}) {
  return (
    <RPopover.Root>
      <RPopover.Trigger asChild>{trigger}</RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content
          align={align}
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 min-w-[12rem] rounded-xl border border-border bg-bg/80 p-2 shadow-xl backdrop-blur-xl animate-fade-in",
            className,
          )}
        >
          {children}
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  )
}

export const PopoverClose = RPopover.Close
