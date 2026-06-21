import { db } from "@/db/dexie"
import { todayISO } from "@/lib/dates"

// Shape of an exported backup file.
export interface BackupData {
  app: "sipali"
  exportedAt: string
  transactions: unknown[]
  accounts: unknown[]
  categories: unknown[]
  recurringTemplates: unknown[]
  installmentPlans: unknown[]
  settings: unknown[]
  rates: unknown[]
}

// Gather all tables into a single backup object.
export async function exportData(): Promise<BackupData> {
  const [transactions, accounts, categories, recurringTemplates, installmentPlans, settings, rates] =
    await Promise.all([
      db.transactions.toArray(),
      db.accounts.toArray(),
      db.categories.toArray(),
      db.recurringTemplates.toArray(),
      db.installmentPlans.toArray(),
      db.settings.toArray(),
      db.rates.toArray(),
    ])
  return {
    app: "sipali",
    exportedAt: new Date().toISOString(),
    transactions,
    accounts,
    categories,
    recurringTemplates,
    installmentPlans,
    settings,
    rates,
  }
}

// Trigger a browser download of the current data as JSON.
export async function downloadBackup(): Promise<void> {
  const data = await exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `sipali-backup-${todayISO()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Replace all data with a parsed backup. Validates the app marker first.
export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json) as Partial<BackupData>
  if (data.app !== "sipali") throw new Error("Not a valid sipali backup file")

  await db.transaction(
    "rw",
    [
      db.transactions,
      db.accounts,
      db.categories,
      db.recurringTemplates,
      db.installmentPlans,
      db.settings,
      db.rates,
    ],
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.accounts.clear(),
        db.categories.clear(),
        db.recurringTemplates.clear(),
        db.installmentPlans.clear(),
        db.settings.clear(),
        db.rates.clear(),
      ])
      await db.transactions.bulkAdd((data.transactions as never[]) ?? [])
      await db.accounts.bulkAdd((data.accounts as never[]) ?? [])
      await db.categories.bulkAdd((data.categories as never[]) ?? [])
      await db.recurringTemplates.bulkAdd((data.recurringTemplates as never[]) ?? [])
      await db.installmentPlans.bulkAdd((data.installmentPlans as never[]) ?? [])
      await db.settings.bulkAdd((data.settings as never[]) ?? [])
      await db.rates.bulkAdd((data.rates as never[]) ?? [])
    },
  )
}

// Wipe every table (factory reset). Re-seeds on next load.
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.transactions.clear(),
    db.accounts.clear(),
    db.categories.clear(),
    db.recurringTemplates.clear(),
    db.installmentPlans.clear(),
    db.settings.clear(),
    db.rates.clear(),
  ])
}
