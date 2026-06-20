import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import { todayISO } from "@/lib/dates"
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
