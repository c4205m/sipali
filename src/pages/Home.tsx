import { useMemo, useState } from "react"
import { Card } from "@/components/ui"
import { StatCards } from "@/components/domain/StatCards"
import { UpcomingScroller } from "@/components/domain/UpcomingScroller"
import { IntervalFilter } from "@/components/domain/IntervalFilter"
import { TxList } from "@/components/domain/TxList"
import { AddTransactionFab } from "@/components/domain/AddTransaction"
import { useTransactions } from "@/hooks/useTransactions"
import { useSettings } from "@/hooks/useSettings"
import { useRates } from "@/hooks/useRates"
import { totals, netWorth } from "@/lib/balance"
import { resolveRange, isInRange, todayISO } from "@/lib/dates"
import type { HomeFilters } from "@/types"

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export default function Home() {
  const txs = useTransactions()
  const settings = useSettings()
  const rates = useRates()
  const [filters, setFilters] = useState<HomeFilters>({
    interval: "month",
    customFrom: todayISO(),
    customTo: todayISO(),
  })
  // Collapse the Upcoming scroller once the recent list is scrolled down.
  const [upcomingCollapsed, setUpcomingCollapsed] = useState(false)
  function onListScroll(e: React.UIEvent<HTMLDivElement>) {
    const top = e.currentTarget.scrollTop
    setUpcomingCollapsed((prev) => (top > 32 ? true : top < 8 ? false : prev))
  }

  const displayCurrency = settings?.displayCurrency ?? "USD"

  const inRange = useMemo(() => {
    if (!txs) return []
    const range = resolveRange(filters.interval, filters.customFrom, filters.customTo)
    return txs.filter((t) => isInRange(t.date, range))
  }, [txs, filters])

  const rangeTotals = useMemo(
    () => totals(inRange, displayCurrency, rates),
    [inRange, displayCurrency, rates],
  )
  const balance = useMemo(
    () => netWorth(txs ?? [], displayCurrency, rates),
    [txs, displayCurrency, rates],
  )

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-6 md:h-[calc(100dvh-6.5rem)]">
      <header>
        <p className="text-sm text-muted">{greeting()}</p>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      </header>

      <StatCards
        balance={balance}
        income={rangeTotals.income}
        expense={rangeTotals.expense}
        currency={displayCurrency}
      />

      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: upcomingCollapsed ? "0fr" : "1fr", opacity: upcomingCollapsed ? 0 : 1 }}
      >
        <div className="min-h-0 overflow-hidden">
          <UpcomingScroller />
        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">Recent activity</h2>
        </div>
        <IntervalFilter value={filters} onChange={setFilters} />
        <Card className="min-h-0 flex-1 overflow-hidden p-2">
          <div className="no-scrollbar h-full overflow-y-auto" onScroll={onListScroll}>
            <TxList
              txs={inRange}
              emptyTitle="Nothing here yet"
              emptyDescription="Add a transaction to see it in this range."
            />
          </div>
        </Card>
      </section>

      <AddTransactionFab />
    </div>
  )
}
