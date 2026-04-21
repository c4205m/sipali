const PRECIOUS: Record<string, { symbol: string; decimals: number }> = {
  XAU:  { symbol: 'oz Au', decimals: 4 },
  GXAU: { symbol: 'g Au',  decimals: 4 },
};

export function formatCurrency(amount: number, currency: string, compact = false): string {
  const p = PRECIOUS[currency];
  if (p) {
    const n = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: compact ? 2 : p.decimals,
    });
    return `${n} ${p.symbol}`;
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: string): string {
  const p = PRECIOUS[currency];
  if (p) return p.symbol;
  return (
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currency
  );
}

/**
 * Convert an amount from one currency to another.
 * rates[X] = units of X per 1 base currency.
 * Falls back to the original amount if rates are missing.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
  base = 'USD',
): number {
  if (from === to) return amount;
  const fromRate = from === base ? 1 : (rates[from] ?? null);
  const toRate = to === base ? 1 : (rates[to] ?? null);
  if (fromRate === null || toRate === null) return amount;
  return (amount / fromRate) * toRate;
}
