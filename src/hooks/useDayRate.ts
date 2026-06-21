import { useEffect, useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import { useSettings } from "@/hooks/useSettings"
import { fetchRatesByDate } from "@/lib/fx-fetch"

export function useDayRate(date: string | undefined, extraCodes: string[] = []) {
  const settings = useSettings()
  const cached = useLiveQuery(
    async () => (date ? ((await db.rateHistory.get(date)) ?? null) : null),
    [date],
  )
  const [failedDate, setFailedDate] = useState<string | null>(null)

  const extraKey = extraCodes.join(",")
  const error = !!date && failedDate === date

  useEffect(() => {
    if (!date || !settings || cached === undefined || cached !== null || error) return
    const want = Array.from(
      new Set([
        ...(settings.enabledCurrencies ?? []),
        settings.displayCurrency,
        "USD",
        ...extraCodes,
      ]),
    )
    let cancelled = false
    fetchRatesByDate(date, want)
      .then((rates) => {
        if (!cancelled) return db.rateHistory.put({ date, rates })
      })
      .catch(() => {
        if (!cancelled) setFailedDate(date)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cached, date, settings, error, extraKey])

  return {
    rates: cached?.rates,
    loading: !!date && (cached === undefined || (cached === null && !error)),
    error,
  }
}
