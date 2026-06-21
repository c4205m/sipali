import { todayISO } from "@/lib/dates"

const GRAMS_PER_TROY_OZ = 31.1034768

function sources(version: string): string[] {
  return [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${version}/v1/currencies/usd.json`,
    `https://${version}.currency-api.pages.dev/v1/currencies/usd.json`,
  ]
}

async function fetchJson(url: string): Promise<{ usd?: Record<string, number> }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Rate fetch failed (${res.status})`)
  return res.json()
}

async function fetchUsd(version: string): Promise<Record<string, number>> {
  const [primary, fallback] = sources(version)
  let data: { usd?: Record<string, number> }
  try {
    data = await fetchJson(primary)
  } catch {
    data = await fetchJson(fallback)
  }
  if (!data.usd) throw new Error("Rate provider returned no data")
  return data.usd
}

function buildMap(usd: Record<string, number>, codes: string[]): Record<string, number> {
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
  if (usd["xau"] != null) out.XAU = usd["xau"]
  return out
}

export async function fetchLiveRates(codes: string[]): Promise<Record<string, number>> {
  return buildMap(await fetchUsd("latest"), codes)
}

export async function fetchRatesByDate(
  date: string,
  codes: string[],
): Promise<Record<string, number>> {
  return buildMap(await fetchUsd(date === todayISO() ? "latest" : date), codes)
}
