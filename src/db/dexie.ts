import Dexie, { type Table } from "dexie"
import type {
  Transaction,
  AccountRecord,
  Category,
  RecurringTemplate,
  InstallmentPlan,
  AppSettings,
  ExchangeRates,
  RateHistoryRecord,
} from "@/types"

// Local-only IndexedDB store. No backend, no sync.
export class SipaliDB extends Dexie {
  transactions!: Table<Transaction, string>
  accounts!: Table<AccountRecord, string>
  categories!: Table<Category, string>
  recurringTemplates!: Table<RecurringTemplate, string>
  installmentPlans!: Table<InstallmentPlan, string>
  settings!: Table<AppSettings, string>
  rates!: Table<ExchangeRates, string>
  rateHistory!: Table<RateHistoryRecord, string>

  constructor() {
    super("sipali")
    this.version(1).stores({
      // Only index fields used for queries/filters.
      transactions:
        "id, date, type, categoryId, account, currency, isRecurring, isInstallment, transferPairId, templateId, planId, isArchived",
      accounts: "id, isDefault, isArchived",
      categories: "id, categoryType",
      recurringTemplates: "id, nextDue, isArchived",
      installmentPlans: "id, nextDue, isArchived",
      settings: "id",
      rates: "id",
      rateHistory: "date",
    })
  }
}

export const db = new SipaliDB()
