import { Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/cn"

interface Stat {
  label: string
  value: number
  currency: string
  icon: typeof Wallet
  tone: string
}

// Balance / income / expense summary cards.
export function StatCards({
  balance,
  income,
  expense,
  currency,
}: {
  balance: number
  income: number
  expense: number
  currency: string
}) {
  const stats: Stat[] = [
    {
      label: "Balance",
      value: balance,
      currency,
      icon: Wallet,
      tone: balance < 0 ? "text-red-400" : "text-fg",
    },
    { label: "Income", value: income, currency, icon: TrendingUp, tone: "text-green-400" },
    { label: "Expense", value: expense, currency, icon: TrendingDown, tone: "text-red-400" },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted">
            <s.icon size={14} />
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          <div className={cn("truncate text-base font-semibold tabular-nums sm:text-lg", s.tone)}>
            {formatMoney(s.value, s.currency, { signDisplay: "never" })}
          </div>
          <div className="text-xs text-muted sm:hidden">{s.label}</div>
        </Card>
      ))}
    </div>
  )
}
