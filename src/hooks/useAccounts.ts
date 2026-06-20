import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import { uid } from "@/lib/id"
import type { AccountRecord } from "@/types"

export function useAccounts(includeArchived = false): AccountRecord[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.accounts.toArray()
    return includeArchived ? all : all.filter((a) => !a.isArchived)
  }, [includeArchived])
}

export async function addAccount(name: string, isDefault = false): Promise<string> {
  const acc: AccountRecord = { id: uid("acc"), name, isDefault }
  await db.accounts.add(acc)
  return acc.id
}

export async function updateAccount(
  id: string,
  patch: Partial<AccountRecord>,
): Promise<void> {
  await db.accounts.update(id, patch)
}

export async function archiveAccount(id: string, archived = true): Promise<void> {
  await db.accounts.update(id, { isArchived: archived })
}
