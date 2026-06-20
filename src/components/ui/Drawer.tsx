import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import { IconButton } from "@/components/ui/IconButton"

export type DrawerSide = "right" | "left" | "bottom"

const SIDE_CLASSES: Record<DrawerSide, string> = {
  right: "inset-y-0 right-0 h-full w-[min(28rem,90vw)] rounded-l-2xl",
  left: "inset-y-0 left-0 h-full w-[min(28rem,90vw)] rounded-r-2xl",
  bottom: "inset-x-0 bottom-0 max-h-[88vh] w-full rounded-t-2xl",
}

const SIDE_MOTION: Record<
  DrawerSide,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
  bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
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

// Slide-in panel (sheet). Used for forms and advanced filters.
export function Drawer({
  open,
  onOpenChange,
  side = "right",
  title,
  children,
  footer,
  className,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                {...SIDE_MOTION[side]}
                transition={{ type: "spring", stiffness: 360, damping: 34 }}
                className={cn(
                  "glass fixed z-50 flex flex-col",
                  SIDE_CLASSES[side],
                  className,
                )}
              >
                <div className="flex items-center justify-between border-b border-border p-4">
                  <Dialog.Title className="text-base font-semibold text-fg">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <IconButton label="Close" size="sm">
                      <X size={18} />
                    </IconButton>
                  </Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto p-4">{children}</div>
                {footer && (
                  <div className="flex justify-end gap-2 border-t border-border p-4">
                    {footer}
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
