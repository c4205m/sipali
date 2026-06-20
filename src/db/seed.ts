import { db } from "@/db/dexie"
import { uid } from "@/lib/id"
import { todayISO } from "@/lib/dates"
import { DEFAULT_CURRENCIES } from "@/types"
import type { AccountRecord, Category, AppSettings, ExchangeRates } from "@/types"

const DEFAULT_ACCOUNTS: AccountRecord[] = [
  { id: uid("acc"), name: "Cash", isDefault: true },
  { id: uid("acc"), name: "Bank", isDefault: false },
]

const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  // expense
  { name: "Groceries", color: "#f87171", icon: "shopping-cart", categoryType: "expense" },
  { name: "Dining", color: "#fb923c", icon: "utensils", categoryType: "expense" },
  { name: "Transport", color: "#facc15", icon: "car", categoryType: "expense" },
  { name: "Housing", color: "#a78bfa", icon: "home", categoryType: "expense" },
  { name: "Utilities", color: "#38bdf8", icon: "plug", categoryType: "expense" },
  { name: "Health", color: "#f472b6", icon: "heart-pulse", categoryType: "expense" },
  { name: "Entertainment", color: "#34d399", icon: "clapperboard", categoryType: "expense" },
  { name: "Shopping", color: "#c084fc", icon: "shopping-bag", categoryType: "expense" },
  // income
  { name: "Salary", color: "#4ade80", icon: "briefcase", categoryType: "income" },
  { name: "Freelance", color: "#22d3ee", icon: "laptop", categoryType: "income" },
  { name: "Gifts", color: "#fbbf24", icon: "gift", categoryType: "income" },
  // shared
  { name: "Other", color: "#94a3b8", icon: "circle-dashed" },
]

// Seed sensible USD-base rates so conversion works offline before any fetch.
const DEFAULT_RATES: ExchangeRates = {
  id: "rates",
  base: "USD",
  rates: { USD: 1, EUR: 0.92, TRY: 32.5, GBP: 0.79 },
  updatedAt: todayISO(),
}

// Populate defaults exactly once (first run). Idempotent per table.
export async function seedIfEmpty(): Promise<void> {
  await db.transaction(
    "rw",
    [db.accounts, db.categories, db.settings, db.rates],
    async () => {
      if ((await db.accounts.count()) === 0) {
        await db.accounts.bulkAdd(DEFAULT_ACCOUNTS)
      }
      if ((await db.categories.count()) === 0) {
        await db.categories.bulkAdd(
          DEFAULT_CATEGORIES.map((c) => ({ ...c, id: uid("cat") })),
        )
      }
      if (!(await db.settings.get("app"))) {
        const settings: AppSettings = {
          id: "app",
          displayCurrency: "USD",
          enabledCurrencies: [...DEFAULT_CURRENCIES],
          historyFields: undefined,
          convertOnList: true,
        }
        await db.settings.add(settings)
      }
      if (!(await db.rates.get("rates"))) {
        await db.rates.add(DEFAULT_RATES)
      }
    },
  )
}
