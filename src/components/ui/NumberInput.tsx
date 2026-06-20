import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value: number | ""
  onValueChange: (v: number | "") => void
}

// Numeric input that emits a parsed number (or "" when empty).
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ value, onValueChange, className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const raw = e.target.value
          onValueChange(raw === "" ? "" : Number(raw))
        }}
        className={cn(
          "h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg",
          "placeholder:text-muted/70 transition-colors focus-visible:outline-none",
          "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
          className,
        )}
        {...rest}
      />
    )
  },
)
