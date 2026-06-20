// Currency codes that are not ISO-4217 and must be formatted manually.
const NON_ISO: Record<string, string> = {
  XAU: "oz",
  GXAU: "g",
}

// Format a numeric amount for a currency code. Falls back gracefully for
// non-ISO codes (e.g. gold) that Intl cannot handle.
export function formatMoney(
  amount: number,
  currency: string,
  opts: { signDisplay?: "auto" | "never" | "always" } = {},
): string {
  const suffix = NON_ISO[currency]
  if (suffix) {
    const n = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
      signDisplay: opts.signDisplay ?? "auto",
    }).format(amount)
    return `${n} ${suffix} gold`
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      signDisplay: opts.signDisplay ?? "auto",
    }).format(amount)
  } catch {
    // Unknown ISO code → plain number with code suffix.
    return `${amount.toFixed(2)} ${currency}`
  }
}

// Compact symbol-less number (for chart axes / tight UI).
export function formatNumber(amount: number, maxFrac = 0): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: maxFrac,
  }).format(amount)
}
