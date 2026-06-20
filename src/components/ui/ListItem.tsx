import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

// Generic list row: leading icon/avatar, title + subtitle, trailing content.
export interface ListItemProps {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}

export function ListItem({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  className,
}: ListItemProps) {
  const interactive = !!onClick
  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        interactive && "cursor-pointer hover:bg-surface-2",
        className,
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-fg">{title}</div>
        {subtitle && <div className="truncate text-xs text-muted">{subtitle}</div>}
      </div>
      {trailing && <div className="shrink-0 text-right">{trailing}</div>}
    </div>
  )
}

// Round colored icon bubble for list leading slots.
export function IconBubble({
  color,
  children,
  className,
}: {
  color?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-white",
        className,
      )}
      style={{ backgroundColor: color ?? "#2a2f3a" }}
    >
      {children}
    </div>
  )
}
