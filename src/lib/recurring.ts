import { db } from "@/db/dexie"
import { addInterval } from "@/lib/dates"
import { buildTransaction } from "@/lib/transactions"
import type { RecurringTemplate, UpcomingItem } from "@/types"

// Map a template's next due into a projected (unmaterialized) item.
export function templateToUpcoming(t: RecurringTemplate): UpcomingItem {
  return {
    kind: "recurring",
    sourceId: t.id,
    name: t.name,
    amount: t.price,
    currency: t.currency,
    type: t.type,
    categoryId: t.categoryId,
    account: t.account,
    toAccount: t.toAccount,
    dueDate: t.nextDue,
  }
}

// Materialize the current nextDue into a real transaction and advance the
// template to its following occurrence.
export async function confirmRecurring(id: string): Promise<void> {
  await db.transaction("rw", [db.recurringTemplates, db.transactions], async () => {
    const t = await db.recurringTemplates.get(id)
    if (!t) return
    const tx = buildTransaction({
      name: t.name,
      price: t.price,
      currency: t.currency,
      date: t.nextDue,
      type: t.type,
      categoryId: t.categoryId,
      importance: t.importance,
      account: t.account,
      toAccount: t.toAccount,
      isRecurring: true,
      recurringInterval: t.interval,
      templateId: t.id,
    })
    await db.transactions.add(tx)
    await db.recurringTemplates.update(id, {
      lastPaid: t.nextDue,
      nextDue: addInterval(t.nextDue, t.interval),
    })
  })
}

// Advance past the current occurrence without writing a transaction.
export async function skipRecurring(id: string): Promise<void> {
  const t = await db.recurringTemplates.get(id)
  if (!t) return
  await db.recurringTemplates.update(id, {
    nextDue: addInterval(t.nextDue, t.interval),
  })
}
