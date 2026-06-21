import { useMemo } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import type { Transaction, TransactionType } from "@/types"

const MAX = 5

export function useNameSuggestions(query: string, type: TransactionType): Transaction[] {
  const txs = useTransactions()
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || !txs) return []
    const latest = new Map<string, Transaction>()
    for (const t of txs) {
      if (t.type !== type) continue
      const n = t.name.toLowerCase()
      if (!n.includes(q) || n === q) continue
      const prev = latest.get(t.name)
      if (!prev || t.date > prev.date) latest.set(t.name, t)
    }
    return Array.from(latest.values())
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, MAX)
  }, [query, type, txs])
}
