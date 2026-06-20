import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import { uid } from "@/lib/id"
import type { RecurringTemplate } from "@/types"

export function useRecurringTemplates(
  includeArchived = false,
): RecurringTemplate[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.recurringTemplates.toArray()
    return includeArchived ? all : all.filter((t) => !t.isArchived)
  }, [includeArchived])
}

export type NewRecurring = Omit<
  RecurringTemplate,
  "id" | "createdAt" | "nextDue"
> & { nextDue?: string }

export async function addRecurringTemplate(input: NewRecurring): Promise<string> {
  const t: RecurringTemplate = {
    ...input,
    id: uid("rec"),
    createdAt: new Date().toISOString(),
    nextDue: input.nextDue ?? input.anchorDate,
  }
  await db.recurringTemplates.add(t)
  return t.id
}

export async function updateRecurringTemplate(
  id: string,
  patch: Partial<RecurringTemplate>,
): Promise<void> {
  await db.recurringTemplates.update(id, patch)
}

export async function deleteRecurringTemplate(id: string): Promise<void> {
  await db.recurringTemplates.delete(id)
}
