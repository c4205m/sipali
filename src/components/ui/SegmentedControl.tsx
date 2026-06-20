import { motion } from "framer-motion"
import { cn } from "@/lib/cn"

export interface Segment<T extends string> {
  value: T
  label: string
}

// Animated segmented control (single select). Highlight slides via layoutId.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Segment<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-xl border border-border bg-surface-2 p-1",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "text-brand-fg" : "text-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId="segmented-active"
                className="absolute inset-0 rounded-lg bg-brand"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
