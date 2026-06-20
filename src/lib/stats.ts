import { convert } from "@/lib/fx"
import { IMPORTANCE_OPTIONS, type Transaction, type Category, type ExchangeRates } from "@/types"
import { format, parseISO } from "date-fns"

type Cur = string
type Rates = ExchangeRates | undefined

// Convert a transaction's amount into the display currency.
function amt(t: Transaction, cur: Cur, rates: Rates): number {
  return convert(t.price, t.currency, cur, rates)
}

export interface NamedValue {
  name: string
  value: number
  color?: string
}

// Income vs expense totals grouped by month (chronological).
export function incomeExpenseByMonth(
  txs: Transaction[],
  cur: Cur,
  rates: Rates,
): { period: string; income: number; expense: number }[] {
  const map = new Map<string, { income: number; expense: number }>()
  for (const t of txs) {
    if (t.type === "transfer") continue
    const key = t.date.slice(0, 7) // yyyy-MM
    const row = map.get(key) ?? { income: 0, expense: 0 }
    if (t.type === "income") row.income += amt(t, cur, rates)
    else row.expense += amt(t, cur, rates)
    map.set(key, row)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      period: format(parseISO(`${key}-01`), "MMM yy"),
      income: round(v.income),
      expense: round(v.expense),
    }))
}

// Daily net/expense/income series (chronological).
export function dailyActivity(
  txs: Transaction[],
  cur: Cur,
  rates: Rates,
): { date: string; expense: number; income: number }[] {
  const map = new Map<string, { expense: number; income: number }>()
  for (const t of txs) {
    if (t.type === "transfer") continue
    const row = map.get(t.date) ?? { expense: 0, income: 0 }
    if (t.type === "income") row.income += amt(t, cur, rates)
    else row.expense += amt(t, cur, rates)
    map.set(t.date, row)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date: format(parseISO(date), "MMM d"),
      expense: round(v.expense),
      income: round(v.income),
    }))
}

// Sum by category for a given transaction type (descending).
export function byCategory(
  txs: Transaction[],
  type: "expense" | "income",
  cur: Cur,
  rates: Rates,
  catMap: Map<string, Category>,
): NamedValue[] {
  const map = new Map<string, number>()
  for (const t of txs) {
    if (t.type !== type) continue
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + amt(t, cur, rates))
  }
  return [...map.entries()]
    .map(([id, value]) => ({
      name: catMap.get(id)?.name ?? "Uncategorized",
      value: round(value),
      color: catMap.get(id)?.color,
    }))
    .sort((a, b) => b.value - a.value)
}

// Top expenses grouped by description/name.
export function topByDescription(
  txs: Transaction[],
  cur: Cur,
  rates: Rates,
  limit = 8,
): NamedValue[] {
  const map = new Map<string, number>()
  for (const t of txs) {
    if (t.type !== "expense") continue
    map.set(t.name, (map.get(t.name) ?? 0) + amt(t, cur, rates))
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

// Need / want / saving breakdown of expenses.
export function byImportance(txs: Transaction[], cur: Cur, rates: Rates): NamedValue[] {
  const map = new Map<string, number>()
  for (const t of txs) {
    if (t.type !== "expense" || !t.importance) continue
    map.set(t.importance, (map.get(t.importance) ?? 0) + amt(t, cur, rates))
  }
  return IMPORTANCE_OPTIONS.filter((o) => map.has(o.value)).map((o) => ({
    name: o.label,
    value: round(map.get(o.value) ?? 0),
    color: o.color,
  }))
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
