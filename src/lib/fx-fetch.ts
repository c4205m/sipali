// Live exchange rates from the free, key-less fawazahmed0 currency API (USD base).
// Response shape: { date, usd: { eur: 0.9, xau: 0.0004, ... } } — lowercase codes,
// value = units of <code> per 1 USD.
const PRIMARY = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
const FALLBACK = "https://latest.currency-api.pages.dev/v1/currencies/usd.json"

// Grams in one troy ounce — used to derive gram gold (GXAU) from ounce gold (XAU).
const GRAMS_PER_TROY_OZ = 31.1034768

async function fetchJson(url: string): Promise<{ usd?: Record<string, number> }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Rate fetch failed (${res.status})`)
  return res.json()
}

// Build a USD-based rate map for the requested currency codes. XAU comes from
// the API; GXAU is derived (gram gold = ounce gold × grams/oz).
export async function fetchLiveRates(codes: string[]): Promise<Record<string, number>> {
  let data: { usd?: Record<string, number> }
  try {
    data = await fetchJson(PRIMARY)
  } catch {
    data = await fetchJson(FALLBACK)
  }
  const usd = data.usd
  if (!usd) throw new Error("Rate provider returned no data")

  const out: Record<string, number> = { USD: 1 }
  for (const code of codes) {
    if (code === "USD") continue
    if (code === "GXAU") {
      const oz = usd["xau"]
      if (oz) out.GXAU = oz * GRAMS_PER_TROY_OZ
      continue
    }
    const v = usd[code.toLowerCase()]
    if (v != null) out[code] = v
  }
  // Always include ounce gold if available, even when not explicitly requested.
  if (usd["xau"] != null) out.XAU = usd["xau"]
  return out
}
