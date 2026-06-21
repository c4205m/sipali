import { useState } from "react"
import { Input } from "@/components/ui"
import { useNameSuggestions } from "@/hooks/useNameSuggestions"
import { formatNumber } from "@/lib/money"
import type { Transaction, TransactionType } from "@/types"

export function NameField({
  value,
  onChange,
  type,
  onPick,
  placeholder = "Coffee",
}: {
  value: string
  onChange: (v: string) => void
  type: TransactionType
  onPick: (t: Transaction) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const suggestions = useNameSuggestions(value, type)
  const show = open && suggestions.length > 0

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
      />
      {show && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-border bg-bg shadow-glass">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault()
                  onPick(s)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-fg hover:bg-surface-3"
              >
                <span className="truncate">{s.name}</span>
                <span className="shrink-0 text-xs text-muted">
                  {s.currency} {formatNumber(s.price, 2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
