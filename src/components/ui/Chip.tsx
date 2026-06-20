import { cn } from "@/lib/cn"

export interface ChipProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  // Optional accent color when active (e.g. category/importance color).
  color?: string
}

export function Chip({ active, onClick, children, className, color }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        active
          ? "border-transparent bg-brand text-brand-fg"
          : "border-border bg-surface-2 text-muted hover:text-fg hover:bg-surface-3",
        className,
      )}
      style={
        active && color
          ? { backgroundColor: color, borderColor: color, color: "#0b0d10" }
          : undefined
      }
    >
      {children}
    </button>
  )
}

export interface ChipOption<T extends string> {
  value: T
  label: string
  color?: string
}

// Single- or multi-select chip group. `multi` toggles between the two modes.
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  multi = false,
  className,
}: {
  options: ChipOption<T>[]
  value: T[]
  onChange: (next: T[]) => void
  multi?: boolean
  className?: string
}) {
  function toggle(v: T) {
    if (multi) {
      onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
    } else {
      onChange(value[0] === v ? [] : [v])
    }
  }
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => (
        <Chip
          key={o.value}
          active={value.includes(o.value)}
          color={o.color}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  )
}
