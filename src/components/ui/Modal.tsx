import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import { IconButton } from "@/components/ui/IconButton"

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

// Centered dialog with backdrop. Animated mount/unmount via framer.
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
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
              <div className="fixed inset-0 z-50 grid place-items-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className={cn(
                  "glass relative w-full max-w-md rounded-2xl p-5",
                  className,
                )}
              >
                {(title || description) && (
                  <div className="mb-4 pr-8">
                    {title && (
                      <Dialog.Title className="text-base font-semibold text-fg">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="mt-1 text-sm text-muted">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                )}
                <Dialog.Close asChild>
                  <IconButton
                    label="Close"
                    size="sm"
                    className="absolute right-3 top-3"
                  >
                    <X size={18} />
                  </IconButton>
                </Dialog.Close>
                <div>{children}</div>
                {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
              </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
