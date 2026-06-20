import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

// Thin wrapper over the native date input — reliable, accessible, no extra deps.
// Value is an ISO date string (yyyy-MM-dd).
export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value: string
  onValueChange: (iso: string) => void
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker({ value, onValueChange, className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg",
          "transition-colors focus-visible:outline-none focus-visible:border-brand",
          "focus-visible:ring-2 focus-visible:ring-brand/30",
          "[color-scheme:dark]",
          className,
        )}
        {...rest}
      />
    )
  },
)
