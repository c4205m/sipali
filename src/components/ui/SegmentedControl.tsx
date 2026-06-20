import { motion } from "framer-motion"
import { cn } from "@/lib/cn"

export interface Segment<T extends string> {
  value: T
  label: string
}

// Animated segmented control (single select). A single persistent highlight
// slides to the active segment by translating one segment-width per index —
// avoids layout-id remeasuring issues inside animated sheets.
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
  const n = options.length || 1
  const idx = Math.max(0, options.findIndex((o) => o.value === value))

  return (
    <div
      role="tablist"
      className={cn(
        "relative inline-flex rounded-xl border border-border bg-surface-2 p-1",
        className,
      )}
    >
      {/* Sliding highlight: width = one segment, translated by index. */}
      <motion.span
        aria-hidden
        className="absolute bottom-1 top-1 left-1 rounded-lg bg-brand"
        style={{ width: `calc((100% - 0.5rem) / ${n})` }}
        animate={{ x: `${idx * 100}%` }}
        transition={{ type: "spring", stiffness: 400, damping: 34 }}
      />
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative z-10 flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-medium transition-colors",
              active ? "text-brand-fg" : "text-muted hover:text-fg",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
