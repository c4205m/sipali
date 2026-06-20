import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import { uid } from "@/lib/id"
import type { InstallmentPlan } from "@/types"

export function useInstallmentPlans(
  includeArchived = false,
): InstallmentPlan[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.installmentPlans.toArray()
    return includeArchived ? all : all.filter((p) => !p.isArchived)
  }, [includeArchived])
}

export type NewInstallment = Omit<
  InstallmentPlan,
  "id" | "createdAt" | "nextDue" | "installmentsPaid" | "perPayment"
> & { nextDue?: string; perPayment?: number; installmentsPaid?: number }

export async function addInstallmentPlan(input: NewInstallment): Promise<string> {
  const perPayment =
    input.perPayment ?? input.totalPrice / Math.max(1, input.installmentTotal)
  const p: InstallmentPlan = {
    ...input,
    perPayment,
    installmentsPaid: input.installmentsPaid ?? 0,
    id: uid("inst"),
    createdAt: new Date().toISOString(),
    nextDue: input.nextDue ?? input.startDate,
  }
  await db.installmentPlans.add(p)
  return p.id
}

export async function updateInstallmentPlan(
  id: string,
  patch: Partial<InstallmentPlan>,
): Promise<void> {
  await db.installmentPlans.update(id, patch)
}

export async function deleteInstallmentPlan(id: string): Promise<void> {
  await db.installmentPlans.delete(id)
}
