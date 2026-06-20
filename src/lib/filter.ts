import type { Transaction, TxFilters } from "@/types"

// Default empty filter state.
export const emptyTxFilters: TxFilters = {
  open: false,
  nameQ: "",
  dateFrom: "",
  dateTo: "",
  types: [],
  accounts: [],
  categoryId: "",
  importances: [],
  currencies: [],
  priceMin: "",
  priceMax: "",
  filterRecurring: false,
  filterInstallment: false,
  recurringIntervals: [],
  installmentIntervals: [],
}

// Apply advanced ledger filters to a transaction list. All criteria are AND'd;
// multi-value criteria (types, accounts…) are OR'd within themselves.
export function applyTxFilters(txs: Transaction[], f: TxFilters): Transaction[] {
  const q = f.nameQ.trim().toLowerCase()
  const min = f.priceMin ? parseFloat(f.priceMin) : null
  const max = f.priceMax ? parseFloat(f.priceMax) : null

  return txs.filter((t) => {
    if (q && !t.name.toLowerCase().includes(q)) return false
    if (f.dateFrom && t.date < f.dateFrom) return false
    if (f.dateTo && t.date > f.dateTo) return false
    if (f.types.length && !f.types.includes(t.type)) return false
    if (f.accounts.length && !f.accounts.includes(t.account)) return false
    if (f.categoryId && t.categoryId !== f.categoryId) return false
    if (f.importances.length && (!t.importance || !f.importances.includes(t.importance)))
      return false
    if (f.currencies.length && !f.currencies.includes(t.currency)) return false
    if (min !== null && t.price < min) return false
    if (max !== null && t.price > max) return false
    if (f.filterRecurring && !t.isRecurring) return false
    if (f.filterInstallment && !t.isInstallment) return false
    if (
      f.recurringIntervals.length &&
      (!t.recurringInterval || !f.recurringIntervals.includes(t.recurringInterval))
    )
      return false
    if (
      f.installmentIntervals.length &&
      (!t.installmentInterval ||
        !f.installmentIntervals.includes(t.installmentInterval))
    )
      return false
    return true
  })
}
