import type { ExchangeRates } from "@/types"

// Rates are expressed as: units of <code> per 1 unit of <base>.
// Convert an amount from one currency to another via the base.
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates | undefined,
): number {
  if (!rates || from === to) return amount
  const rFrom = rates.rates[from]
  const rTo = rates.rates[to]
  if (!rFrom || !rTo) return amount // missing rate → pass through unchanged
  const inBase = amount / rFrom
  return inBase * rTo
}

// True when a conversion can actually be performed for both codes.
export function canConvert(
  from: string,
  to: string,
  rates: ExchangeRates | undefined,
): boolean {
  if (from === to) return true
  return !!rates && !!rates.rates[from] && !!rates.rates[to]
}
