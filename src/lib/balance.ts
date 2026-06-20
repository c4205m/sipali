import { convert } from "@/lib/fx"
import type { Transaction, ExchangeRates } from "@/types"

// Sum income/expense/net for a set of transactions, converted to a target
// currency. Transfers are balance-neutral so excluded from income/expense.
export function totals(
  txs: Transaction[],
  displayCurrency: string,
  rates: ExchangeRates | undefined,
): { income: number; expense: number; net: number } {
  let income = 0
  let expense = 0
  for (const t of txs) {
    if (t.isArchived) continue
    const amount = convert(t.price, t.currency, displayCurrency, rates)
    if (t.type === "income") income += amount
    else if (t.type === "expense") expense += amount
  }
  return { income, expense, net: income - expense }
}

// Per-account running balance (keyed by account name). Income adds, expense
// subtracts, transfer moves from `account` to `toAccount`.
export function accountBalances(
  txs: Transaction[],
  displayCurrency: string,
  rates: ExchangeRates | undefined,
): Map<string, number> {
  const map = new Map<string, number>()
  const bump = (acc: string, delta: number) =>
    map.set(acc, (map.get(acc) ?? 0) + delta)

  for (const t of txs) {
    if (t.isArchived) continue
    const amount = convert(t.price, t.currency, displayCurrency, rates)
    if (t.type === "income") bump(t.account, amount)
    else if (t.type === "expense") bump(t.account, -amount)
    else if (t.type === "transfer") {
      bump(t.account, -amount)
      if (t.toAccount) bump(t.toAccount, amount)
    }
  }
  return map
}

// Total net worth across all accounts in the display currency.
export function netWorth(
  txs: Transaction[],
  displayCurrency: string,
  rates: ExchangeRates | undefined,
): number {
  let sum = 0
  for (const v of accountBalances(txs, displayCurrency, rates).values()) sum += v
  return sum
}
