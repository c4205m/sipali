import type { HTMLAttributes } from "react"
import { cn } from "@/lib/cn"

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info"

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-3 text-muted",
  brand: "bg-brand/15 text-brand",
  success: "bg-green-500/15 text-green-400",
  warning: "bg-orange-500/15 text-orange-400",
  danger: "bg-red-500/15 text-red-400",
  info: "bg-blue-500/15 text-blue-400",
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  // Custom dot/text color (overrides tone text color when set).
  color?: string
}

export function Badge({ tone = "neutral", color, className, style, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      style={color ? { color, backgroundColor: `${color}26`, ...style } : style}
      {...rest}
    >
      {children}
    </span>
  )
}
