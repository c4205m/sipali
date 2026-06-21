// ── Core enums ────────────────────────────────────────────────────────────
export type TransactionType = "expense" | "income" | "transfer"
export type Importance = "need" | "want" | "saving"
export type RecurringInterval = "daily" | "weekly" | "monthly" | "yearly"
export type Account = string

// ── Records ───────────────────────────────────────────────────────────────
export interface AccountRecord {
  id: string
  name: string
  isDefault: boolean
  isArchived?: boolean
}

export interface Transaction {
  id: string
  name: string
  price: number
  currency: string
  date: string
  type: TransactionType
  categoryId: string
  importance?: Importance
  isRecurring: boolean
  recurringInterval?: RecurringInterval
  isSkip?: boolean
  isInstallment?: boolean
  installmentIndex?: number
  installmentTotal?: number
  installmentCount?: number
  installmentsPaid?: number
  installmentInterval?: RecurringInterval
  account: Account
  toAccount?: Account
  transferCounterpart?: string
  transferPairId?: string
  isArchived?: boolean
  createdAt: string
  templateId?: string
  planId?: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  categoryType?: "expense" | "income"
}

// Recurring template — the source of truth for a repeating transaction.
// Real Transaction rows are materialized from it on confirm.
export interface RecurringTemplate {
  id: string
  name: string
  price: number
  currency: string
  type: TransactionType
  categoryId: string
  importance?: Importance
  account: Account
  toAccount?: Account
  interval: RecurringInterval
  anchorDate: string // first occurrence (ISO date)
  nextDue: string // next unmaterialized occurrence (ISO date)
  lastPaid?: string
  isArchived?: boolean
  createdAt: string
}

// Installment plan — source of truth for an N-payment purchase.
export interface InstallmentPlan {
  id: string
  name: string
  totalPrice: number
  perPayment: number
  currency: string
  account: Account
  categoryId: string
  importance?: Importance
  installmentTotal: number
  installmentsPaid: number
  interval: RecurringInterval
  startDate: string
  nextDue: string // next unmaterialized payment (ISO date)
  isArchived?: boolean
  createdAt: string
}

// Projected, not-yet-materialized due item (Home scroller / confirm flow).
export type UpcomingKind = "recurring" | "installment"

export interface UpcomingItem {
  kind: UpcomingKind
  sourceId: string
  name: string
  amount: number
  currency: string
  type: TransactionType
  categoryId: string
  account: Account
  toAccount?: Account
  dueDate: string
  // installment-only
  installmentIndex?: number
  installmentTotal?: number
}

// ── History fields (configurable tx detail display) ─────────────────────────
export type HistoryField =
  | "amount"
  | "currency"
  | "account"
  | "category"
  | "importance"
  | "recurring"
  | "installment"

export const ALL_HISTORY_FIELDS: { value: HistoryField; label: string }[] = [
  { value: "amount", label: "Amount" },
  { value: "currency", label: "Currency" },
  { value: "account", label: "Account" },
  { value: "category", label: "Category" },
  { value: "importance", label: "Importance" },
  { value: "recurring", label: "Recurring" },
  { value: "installment", label: "Installment" },
]

export const DEFAULT_HISTORY_FIELDS: HistoryField[] = [
  "amount",
  "currency",
  "account",
  "category",
  "importance",
  "recurring",
  "installment",
]

// ── Settings / rates ────────────────────────────────────────────────────────
export interface AppSettings {
  id: "app"
  displayCurrency: string
  enabledCurrencies: string[]
  iosShortcutName?: string
  accentColor?: string
  historyFields?: HistoryField[]
  // Show amounts converted to the display currency in transaction lists.
  convertOnList?: boolean
}

export interface ExchangeRates {
  id: "rates"
  base: string
  rates: Record<string, number>
  updatedAt: string
}

export interface RateHistoryRecord {
  date: string
  rates: Record<string, number>
}

export const DEFAULT_ACCENT = "#6e7bf2"

export const ACCENT_OPTIONS: { label: string; hex: string }[] = [
  { label: "Indigo", hex: "#6e7bf2" },
  { label: "Blue", hex: "#3b82f6" },
  { label: "Cyan", hex: "#06b6d4" },
  { label: "Teal", hex: "#14b8a6" },
  { label: "Emerald", hex: "#10b981" },
  { label: "Violet", hex: "#8b5cf6" },
  { label: "Pink", hex: "#ec4899" },
  { label: "Rose", hex: "#f43f5e" },
  { label: "Amber", hex: "#f59e0b" },
  { label: "Orange", hex: "#f97316" },
]

export const DEFAULT_CURRENCIES = ["USD", "EUR", "TRY"]

export const ALL_CURRENCIES: { code: string; label: string }[] = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "TRY", label: "Turkish Lira" },
  { code: "GBP", label: "British Pound" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "INR", label: "Indian Rupee" },
  { code: "BRL", label: "Brazilian Real" },
  { code: "MXN", label: "Mexican Peso" },
  { code: "KRW", label: "South Korean Won" },
  { code: "SEK", label: "Swedish Krona" },
  { code: "NOK", label: "Norwegian Krone" },
  { code: "DKK", label: "Danish Krone" },
  { code: "PLN", label: "Polish Złoty" },
  { code: "AED", label: "UAE Dirham" },
  { code: "SAR", label: "Saudi Riyal" },
  { code: "SGD", label: "Singapore Dollar" },
  { code: "HKD", label: "Hong Kong Dollar" },
  { code: "NZD", label: "New Zealand Dollar" },
  { code: "ZAR", label: "South African Rand" },
  { code: "HUF", label: "Hungarian Forint" },
  { code: "CZK", label: "Czech Koruna" },
  { code: "RON", label: "Romanian Leu" },
  { code: "BGN", label: "Bulgarian Lev" },
  { code: "ISK", label: "Icelandic Króna" },
  { code: "PHP", label: "Philippine Peso" },
  { code: "IDR", label: "Indonesian Rupiah" },
  { code: "MYR", label: "Malaysian Ringgit" },
  { code: "THB", label: "Thai Baht" },
  { code: "XAU", label: "Ounce Gold" },
  { code: "GXAU", label: "Gram Gold" },
]

export const IMPORTANCE_OPTIONS: {
  value: Importance
  label: string
  color: string
}[] = [
  { value: "need", label: "Need", color: "#f87171" },
  { value: "want", label: "Want", color: "#fb923c" },
  { value: "saving", label: "Saving", color: "#4ade80" },
]

// Single source of truth for transaction-type presentation.
export const TYPE_META: Record<
  TransactionType,
  { label: string; sign: string; textClass: string; bgClass: string; hex: string }
> = {
  expense: { label: "Expense", sign: "−", textClass: "text-red-400", bgClass: "bg-red-500", hex: "#f87171" },
  income: { label: "Income", sign: "+", textClass: "text-green-400", bgClass: "bg-green-400", hex: "#4ade80" },
  transfer: { label: "Transfer", sign: "⇄", textClass: "text-blue-400", bgClass: "bg-blue-400", hex: "#60a5fa" },
}

export const TYPE_OPTIONS: { value: TransactionType; label: string }[] = (
  Object.keys(TYPE_META) as TransactionType[]
).map((value) => ({ value, label: TYPE_META[value].label }))

export const RECURRING_INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

// ── UI filter state ─────────────────────────────────────────────────────────
export type HomeInterval = "today" | "week" | "month" | "year" | "custom"

export interface HomeFilters {
  interval: HomeInterval
  customFrom: string
  customTo: string
}

export interface TxFilters {
  open: boolean
  nameQ: string
  dateFrom: string
  dateTo: string
  types: TransactionType[]
  accounts: Account[]
  categoryId: string
  importances: Importance[]
  currencies: string[]
  priceMin: string
  priceMax: string
  filterRecurring: boolean
  filterInstallment: boolean
  recurringIntervals: RecurringInterval[]
  installmentIntervals: RecurringInterval[]
}
