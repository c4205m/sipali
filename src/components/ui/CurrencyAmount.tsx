import { formatMoney } from "@/lib/money"
import { TYPE_META, type TransactionType } from "@/types"
import { cn } from "@/lib/cn"

// Presentational money value. When `type` is set, applies the type's sign
// and color. Conversion is the caller's job — pass the final amount/currency.
export function CurrencyAmount({
  amount,
  currency,
  type,
  className,
  showSign = true,
  muted,
}: {
  amount: number
  currency: string
  type?: TransactionType
  className?: string
  showSign?: boolean
  muted?: boolean
}) {
  const meta = type ? TYPE_META[type] : null
  const formatted = formatMoney(amount, currency, { signDisplay: "never" })
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        meta && !muted ? meta.textClass : muted ? "text-muted" : "text-fg",
        className,
      )}
    >
      {meta && showSign ? `${meta.sign} ` : ""}
      {formatted}
    </span>
  )
}
