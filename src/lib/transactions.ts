import { db } from "@/db/dexie"
import { uid } from "@/lib/id"
import { todayISO } from "@/lib/dates"
import type { Transaction } from "@/types"

// Required fields to create a transaction; the rest are filled with defaults.
export type NewTransaction = Omit<Transaction, "id" | "createdAt" | "isRecurring"> &
  Partial<Pick<Transaction, "isRecurring">>

// Build a complete Transaction object (id + createdAt + defaults applied).
export function buildTransaction(input: NewTransaction): Transaction {
  return {
    isRecurring: false,
    ...input,
    id: uid("tx"),
    createdAt: new Date().toISOString(),
    date: input.date || todayISO(),
  }
}

export async function addTransaction(input: NewTransaction): Promise<string> {
  const tx = buildTransaction(input)
  await db.transactions.add(tx)
  return tx.id
}

export async function updateTransaction(
  id: string,
  patch: Partial<Transaction>,
): Promise<void> {
  await db.transactions.update(id, patch)
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id)
}

// Soft-archive (keeps row for stats/history but hides from active lists).
export async function archiveTransaction(id: string, archived = true): Promise<void> {
  await db.transactions.update(id, { isArchived: archived })
}
