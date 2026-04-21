export type TransactionType = 'expense' | 'income' | 'transfer';
export type Importance = 'need' | 'want' | 'saving';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Account = string;

export interface AccountRecord {
  id: string;
  name: string;
  isDefault: boolean;
  isArchived?: boolean;
}

export interface Transaction {
  id: string;
  name: string;
  price: number;
  currency: string;
  date: string;
  type: TransactionType;
  categoryId: string;
  importance?: Importance;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  isSkip?: boolean;
  isInstallment?: boolean;
  installmentIndex?: number;
  installmentTotal?: number;
  installmentCount?: number;
  installmentsPaid?: number;
  installmentInterval?: RecurringInterval;
  account: Account;
  toAccount?: Account;
  transferCounterpart?: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  categoryType?: 'expense' | 'income';
}

export type HistoryField = 'amount' | 'currency' | 'account' | 'category' | 'importance' | 'recurring' | 'installment';

export const ALL_HISTORY_FIELDS: { value: HistoryField; label: string }[] = [
  { value: 'amount',      label: 'Amount'      },
  { value: 'currency',    label: 'Currency'    },
  { value: 'account',     label: 'Account'     },
  { value: 'category',    label: 'Category'    },
  { value: 'importance',  label: 'Importance'  },
  { value: 'recurring',   label: 'Recurring'   },
  { value: 'installment', label: 'Installment' },
];

export const DEFAULT_HISTORY_FIELDS: HistoryField[] = [
  'amount', 'currency', 'account', 'category', 'importance', 'recurring', 'installment',
];

export interface AppSettings {
  id: 'app';
  displayCurrency: string;
  enabledCurrencies: string[];
  iosShortcutName?: string;
  historyFields?: HistoryField[];
}

export interface ExchangeRates {
  id: 'rates';
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
}

// Default 3 currencies; others can be added in Settings
export const DEFAULT_CURRENCIES = ['USD', 'EUR', 'TRY'];

export const ALL_CURRENCIES: { code: string; label: string }[] = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'TRY', label: 'Turkish Lira' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'CHF', label: 'Swiss Franc' },
  { code: 'CNY', label: 'Chinese Yuan' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'BRL', label: 'Brazilian Real' },
  { code: 'MXN', label: 'Mexican Peso' },
  { code: 'KRW', label: 'South Korean Won' },
  { code: 'SEK', label: 'Swedish Krona' },
  { code: 'NOK', label: 'Norwegian Krone' },
  { code: 'DKK', label: 'Danish Krone' },
  { code: 'PLN', label: 'Polish Złoty' },
  { code: 'AED', label: 'UAE Dirham' },
  { code: 'SAR', label: 'Saudi Riyal' },
  { code: 'SGD', label: 'Singapore Dollar' },
  { code: 'HKD', label: 'Hong Kong Dollar' },
  { code: 'NZD', label: 'New Zealand Dollar' },
  { code: 'ZAR', label: 'South African Rand' },
  { code: 'HUF', label: 'Hungarian Forint' },
  { code: 'CZK', label: 'Czech Koruna' },
  { code: 'RON', label: 'Romanian Leu' },
  { code: 'BGN', label: 'Bulgarian Lev' },
  { code: 'ISK', label: 'Icelandic Króna' },
  { code: 'PHP', label: 'Philippine Peso' },
  { code: 'IDR', label: 'Indonesian Rupiah' },
  { code: 'MYR', label: 'Malaysian Ringgit' },
  { code: 'THB', label: 'Thai Baht' },
  { code: 'XAU', label: 'Ounce Gold' },
  { code: 'GXAU', label: 'Gram Gold' },
];


export const IMPORTANCE_OPTIONS: { value: Importance; label: string; color: string }[] = [
  { value: 'need', label: 'Need', color: '#f87171' },
  { value: 'want', label: 'Want', color: '#fb923c' },
  { value: 'saving', label: 'Saving', color: '#4ade80' },
];

export const RECURRING_INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export type HomeInterval = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface HomeFilters {
  interval: HomeInterval;
  customFrom: string;
  customTo: string;
}

export interface TxFilters {
  open: boolean;
  nameQ: string;
  dateFrom: string;
  dateTo: string;
  types: TransactionType[];
  accounts: Account[];
  categoryId: string;
  importances: Importance[];
  currencies: string[];
  priceMin: string;
  priceMax: string;
  filterRecurring: boolean;
  filterInstallment: boolean;
  recurringIntervals: RecurringInterval[];
  installmentIntervals: RecurringInterval[];
}
