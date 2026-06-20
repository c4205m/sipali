import { db } from "@/db/dexie"
import { addInterval } from "@/lib/dates"
import { buildTransaction } from "@/lib/transactions"
import type { InstallmentPlan, UpcomingItem } from "@/types"

// Project a plan's next payment as an upcoming item.
export function planToUpcoming(p: InstallmentPlan): UpcomingItem {
  return {
    kind: "installment",
    sourceId: p.id,
    name: p.name,
    amount: p.perPayment,
    currency: p.currency,
    type: "expense",
    categoryId: p.categoryId,
    account: p.account,
    dueDate: p.nextDue,
    installmentIndex: p.installmentsPaid + 1,
    installmentTotal: p.installmentTotal,
  }
}

// True once every scheduled payment has been made.
export function isPlanComplete(p: InstallmentPlan): boolean {
  return p.installmentsPaid >= p.installmentTotal
}

// Pay the next installment: write a transaction, advance the counter, and
// archive the plan when the final payment lands.
export async function confirmInstallment(id: string): Promise<void> {
  await db.transaction("rw", [db.installmentPlans, db.transactions], async () => {
    const p = await db.installmentPlans.get(id)
    if (!p || isPlanComplete(p)) return
    const index = p.installmentsPaid + 1
    const tx = buildTransaction({
      name: p.name,
      price: p.perPayment,
      currency: p.currency,
      date: p.nextDue,
      type: "expense",
      categoryId: p.categoryId,
      importance: p.importance,
      account: p.account,
      isRecurring: false,
      isInstallment: true,
      installmentIndex: index,
      installmentTotal: p.installmentTotal,
      installmentInterval: p.interval,
      planId: p.id,
    })
    await db.transactions.add(tx)
    const done = index >= p.installmentTotal
    await db.installmentPlans.update(id, {
      installmentsPaid: index,
      nextDue: done ? p.nextDue : addInterval(p.nextDue, p.interval),
      isArchived: done ? true : p.isArchived,
    })
  })
}
