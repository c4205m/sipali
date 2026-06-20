import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import type { Transaction } from "@/types"

// All active (non-archived) transactions, newest first.
export function useTransactions(includeArchived = false): Transaction[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.transactions.orderBy("date").reverse().toArray()
    return includeArchived ? all : all.filter((t) => !t.isArchived)
  }, [includeArchived])
}

export function useRecentTransactions(limit = 10): Transaction[] | undefined {
  const all = useTransactions()
  return all?.slice(0, limit)
}
