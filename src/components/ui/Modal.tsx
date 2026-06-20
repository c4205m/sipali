import * as Dialog from "@radix-ui/react-dialog"
import { Drawer as Vaul } from "vaul"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import { IconButton } from "@/components/ui/IconButton"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { useBlurOnOpen } from "@/hooks/useBlurOnOpen"
import { guardSheetClose } from "@/lib/overlay"

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

// Responsive dialog: centered modal on desktop, bottom sheet on phones.
export function Modal(props: ModalProps) {
  const isMobile = useIsMobile()
  useBlurOnOpen(props.open)
  return isMobile ? <MobileSheet {...props} /> : <CenteredModal {...props} />
}

// Phone: Vaul bottom sheet with grab handle + swipe-to-dismiss.
function MobileSheet({ open, onOpenChange, title, description, children, footer }: ModalProps) {
  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange}>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Vaul.Content
          onInteractOutside={guardSheetClose}
          onPointerDownOutside={guardSheetClose}
          className="glass fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-2xl outline-none"
        >
          <div className="flex justify-center pt-2.5">
            <Vaul.Handle className="!h-1.5 !w-10 !bg-surface-3" />
          </div>
          {(title || description) && (
            <div className="px-5 pb-2 pt-3">
              {title && (
                <Vaul.Title className="text-base font-semibold text-fg">{title}</Vaul.Title>
              )}
              {description && (
                <Vaul.Description className="mt-1 text-sm text-muted">
                  {description}
                </Vaul.Description>
              )}
            </div>
          )}
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-border p-4">{footer}</div>
          )}
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  )
}

// Desktop: centered dialog with backdrop, animated via framer.
function CenteredModal({
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
            <Dialog.Content
              asChild
              forceMount
              onInteractOutside={guardSheetClose}
              onPointerDownOutside={guardSheetClose}
            >
              <div className="fixed inset-0 z-50 grid place-items-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className={cn("glass relative w-full max-w-md rounded-2xl p-5", className)}
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
                    <IconButton label="Close" size="sm" className="absolute right-3 top-3">
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
