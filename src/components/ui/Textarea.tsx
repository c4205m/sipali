import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-fg",
        "placeholder:text-muted/70 transition-colors focus-visible:outline-none",
        "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
        className,
      )}
      {...rest}
    />
  )
})
