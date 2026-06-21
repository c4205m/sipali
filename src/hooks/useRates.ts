import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import { todayISO } from "@/lib/dates"
import { fetchLiveRates } from "@/lib/fx-fetch"
import type { ExchangeRates } from "@/types"

export function useRates(): ExchangeRates | undefined {
  return useLiveQuery(() => db.rates.get("rates"), [])
}

// Manually set/override one rate (units of code per 1 base unit).
export async function setRate(code: string, value: number): Promise<void> {
  const current = await db.rates.get("rates")
  if (!current) return
  await db.rates.update("rates", {
    rates: { ...current.rates, [code]: value },
    updatedAt: todayISO(),
  })
}

export async function replaceRates(
  rates: Record<string, number>,
  base = "USD",
): Promise<void> {
  await db.rates.put({ id: "rates", base, rates, updatedAt: todayISO() })
}

export async function refreshRates(): Promise<void> {
  const [settings, current] = await Promise.all([
    db.settings.get("app"),
    db.rates.get("rates"),
  ])
  if (!settings || !current) return
  const live = await fetchLiveRates(settings.enabledCurrencies)
  await replaceRates({ ...current.rates, ...live, USD: 1 }, "USD")
}
