import { Drawer as Vaul } from "vaul"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { useBlurOnOpen } from "@/hooks/useBlurOnOpen"
import { guardSheetClose } from "@/lib/overlay"

export type DrawerSide = "right" | "left" | "bottom"

const SIDE_CLASSES: Record<DrawerSide, string> = {
  right: "inset-y-0 right-0 h-full w-[min(28rem,92vw)] rounded-l-2xl",
  left: "inset-y-0 left-0 h-full w-[min(28rem,92vw)] rounded-r-2xl",
  bottom: "inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl",
}

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: DrawerSide
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

// Slide-in sheet. Rises from the bottom (swipe-down to dismiss) on phones,
// slides from the configured side on desktop. Built on Vaul.
export function Drawer({
  open,
  onOpenChange,
  side = "right",
  title,
  children,
  footer,
  className,
}: DrawerProps) {
  const isMobile = useIsMobile()
  const effectiveSide: DrawerSide = isMobile ? "bottom" : side
  useBlurOnOpen(open)

  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange} direction={effectiveSide}>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Vaul.Content
          onInteractOutside={guardSheetClose}
          onPointerDownOutside={guardSheetClose}
          className={cn(
            "glass fixed z-50 flex flex-col outline-none",
            SIDE_CLASSES[effectiveSide],
            className,
          )}
        >
          {effectiveSide === "bottom" && (
            <div className="flex justify-center pt-2.5">
              <Vaul.Handle className="!h-1.5 !w-10 !bg-surface-3" />
            </div>
          )}
          <div className="p-4 pb-3">
            <Vaul.Title className="text-base font-semibold text-fg">{title}</Vaul.Title>
          </div>
          <div className={cn("flex-1 overflow-y-auto px-4 pb-4", isMobile && "no-scrollbar")}>
            {children}
          </div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-border p-4">{footer}</div>
          )}
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  )
}
