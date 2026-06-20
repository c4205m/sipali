import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/cn"
import { Spinner } from "@/components/ui/Spinner"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
export type ButtonSize = "sm" | "md" | "lg"

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-fg shadow-glow-sm hover:bg-brand/90 hover:shadow-glow active:bg-brand/80",
  secondary: "bg-surface-3 text-fg hover:bg-surface-3/80",
  ghost: "bg-transparent text-fg hover:bg-surface-2",
  danger: "bg-red-500 text-white hover:bg-red-500/90",
  outline: "border border-border bg-transparent text-fg hover:bg-surface-2",
}

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading && <Spinner size={size === "lg" ? 18 : 14} />}
      {children}
    </button>
  )
})
