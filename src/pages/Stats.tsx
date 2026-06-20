import { useMemo, useState } from "react"
import { IntervalFilter } from "@/components/domain/IntervalFilter"
import {
  ChartCard,
  IncomeExpenseChart,
  ActivityChart,
  CategoryDonut,
  TopExpensesChart,
} from "@/components/charts"
import { useTransactions } from "@/hooks/useTransactions"
import { useCategoryMap } from "@/hooks/useCategories"
import { useSettings } from "@/hooks/useSettings"
import { useRates } from "@/hooks/useRates"
import { resolveRange, isInRange, todayISO } from "@/lib/dates"
import {
  incomeExpenseByMonth,
  dailyActivity,
  byCategory,
  topByDescription,
  byImportance,
} from "@/lib/stats"
import type { HomeFilters } from "@/types"

export default function Stats() {
  const txs = useTransactions()
  const catMap = useCategoryMap()
  const settings = useSettings()
  const rates = useRates()
  const [filters, setFilters] = useState<HomeFilters>({
    interval: "year",
    customFrom: todayISO(),
    customTo: todayISO(),
  })

  const cur = settings?.displayCurrency ?? "USD"

  const ranged = useMemo(() => {
    if (!txs) return []
    const range = resolveRange(filters.interval, filters.customFrom, filters.customTo)
    return txs.filter((t) => isInRange(t.date, range))
  }, [txs, filters])

  const ie = useMemo(() => incomeExpenseByMonth(ranged, cur, rates), [ranged, cur, rates])
  const daily = useMemo(() => dailyActivity(ranged, cur, rates), [ranged, cur, rates])
  const expCat = useMemo(
    () => byCategory(ranged, "expense", cur, rates, catMap),
    [ranged, cur, rates, catMap],
  )
  const incCat = useMemo(
    () => byCategory(ranged, "income", cur, rates, catMap),
    [ranged, cur, rates, catMap],
  )
  const top = useMemo(() => topByDescription(ranged, cur, rates), [ranged, cur, rates])
  const imp = useMemo(() => byImportance(ranged, cur, rates), [ranged, cur, rates])

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
        <span className="text-sm text-muted">in {cur}</span>
      </header>

      <IntervalFilter value={filters} onChange={setFilters} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <ChartCard title="Income vs expenses" isEmpty={ie.length === 0}>
            <IncomeExpenseChart data={ie} />
          </ChartCard>
        </div>
        <div className="md:col-span-2">
          <ChartCard title="Daily activity" isEmpty={daily.length === 0}>
            <ActivityChart data={daily} />
          </ChartCard>
        </div>
        <ChartCard title="Spending by category" isEmpty={expCat.length === 0}>
          <CategoryDonut data={expCat} />
        </ChartCard>
        <ChartCard title="Income sources" isEmpty={incCat.length === 0}>
          <CategoryDonut data={incCat} />
        </ChartCard>
        <ChartCard title="Top expenses" isEmpty={top.length === 0}>
          <TopExpensesChart data={top} />
        </ChartCard>
        <ChartCard title="Need / Want / Saving" isEmpty={imp.length === 0}>
          <CategoryDonut data={imp} />
        </ChartCard>
      </div>
    </div>
  )
}
