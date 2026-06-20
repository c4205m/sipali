import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  variant?: "ghost" | "surface" | "danger"
  label: string // accessible label (aria-label)
}

const SIZES = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" }
const VARIANTS = {
  ghost: "hover:bg-surface-2 text-fg",
  surface: "bg-surface-2 hover:bg-surface-3 text-fg",
  danger: "hover:bg-red-500/15 text-red-400",
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ size = "md", variant = "ghost", label, className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
          "disabled:pointer-events-none disabled:opacity-50",
          SIZES[size],
          VARIANTS[variant],
          className,
        )}
        {...rest}
      />
    )
  },
)
