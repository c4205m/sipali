import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import type { AppSettings } from "@/types"

export function useSettings(): AppSettings | undefined {
  return useLiveQuery(() => db.settings.get("app"), [])
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  await db.settings.update("app", patch)
}
