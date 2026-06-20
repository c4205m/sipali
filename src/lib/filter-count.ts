import type { TxFilters } from "@/types"

// Count how many filter criteria are active (for a badge on the filter button).
export function activeFilterCount(f: TxFilters): number {
  let n = 0
  if (f.nameQ.trim()) n++
  if (f.dateFrom) n++
  if (f.dateTo) n++
  if (f.types.length) n++
  if (f.accounts.length) n++
  if (f.categoryId) n++
  if (f.importances.length) n++
  if (f.currencies.length) n++
  if (f.priceMin) n++
  if (f.priceMax) n++
  if (f.filterRecurring) n++
  if (f.filterInstallment) n++
  if (f.recurringIntervals.length) n++
  if (f.installmentIntervals.length) n++
  return n
}
