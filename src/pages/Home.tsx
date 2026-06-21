import { useMemo, useRef } from "react"
import { usePersistentState } from "@/hooks/usePersistentState"
import { Card } from "@/components/ui"
import { StatCards } from "@/components/domain/StatCards"
import { UpcomingScroller } from "@/components/domain/UpcomingScroller"
import { IntervalFilter } from "@/components/domain/IntervalFilter"
import { TxList } from "@/components/domain/TxList"
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
  const [filters, setFilters] = usePersistentState<HomeFilters>("home.filters", {
    interval: "month",
    customFrom: todayISO(),
    customTo: todayISO(),
  })
  const [upcomingCollapsed, setUpcomingCollapsed] = usePersistentState("home.upcomingCollapsed", false)
  const touchY = useRef(0)
  // deltaY > 0: swipe up / scroll down -> focus list. deltaY < 0: swipe down ->
  // reveal Upcoming, but only once the list is at the top (intent is sure).
  function applyGesture(deltaY: number, atTop: boolean) {
    if (deltaY > 0) setUpcomingCollapsed(true)
    else if (deltaY < 0 && atTop) setUpcomingCollapsed(false)
  }
  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(e.deltaY) < 4) return
    applyGesture(e.deltaY, e.currentTarget.scrollTop <= 0)
  }
  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchY.current = e.touches[0].clientY
  }
  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const dy = touchY.current - e.touches[0].clientY
    if (Math.abs(dy) < 8) return
    applyGesture(dy, e.currentTarget.scrollTop <= 0)
    touchY.current = e.touches[0].clientY
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
          <div
            className="no-scrollbar h-full overflow-y-auto"
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          >
            <TxList
              txs={inRange}
              loading={txs === undefined}
              emptyTitle="Nothing here yet"
              emptyDescription="Add a transaction to see it in this range."
            />
          </div>
        </Card>
      </section>
    </div>
  )
}
