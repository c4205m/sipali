import { Chip, DatePicker } from "@/components/ui"
import type { HomeFilters, HomeInterval } from "@/types"

const INTERVALS: { value: HomeInterval; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
]

// Chip-based date range selector with custom range inputs.
export function IntervalFilter({
  value,
  onChange,
}: {
  value: HomeFilters
  onChange: (next: HomeFilters) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {INTERVALS.map((i) => (
          <Chip
            key={i.value}
            active={value.interval === i.value}
            onClick={() => onChange({ ...value, interval: i.value })}
            className="shrink-0 px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm"
          >
            {i.label}
          </Chip>
        ))}
      </div>
      {value.interval === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <DatePicker
            value={value.customFrom}
            onValueChange={(v) => onChange({ ...value, customFrom: v })}
          />
          <DatePicker
            value={value.customTo}
            onValueChange={(v) => onChange({ ...value, customTo: v })}
          />
        </div>
      )}
    </div>
  )
}
