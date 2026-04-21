import Dexie, { type Table } from 'dexie';
import type { Transaction, Category, AppSettings, ExchangeRates, AccountRecord } from '../types';
import { DEFAULT_CURRENCIES } from '../types';

class SipaliDB extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  settings!: Table<AppSettings, string>;
  exchangeRates!: Table<ExchangeRates, string>;
  accounts!: Table<AccountRecord, string>;

  constructor() {
    super('sipali');
    this.version(1).stores({
      transactions: 'id, date, type, categoryId, account, createdAt',
      categories: 'id, name',
    });
    this.version(2).stores({
      transactions: 'id, date, type, categoryId, account, createdAt',
      categories: 'id, name',
      settings: 'id',
      exchangeRates: 'id',
    });
    this.version(3)
      .stores({
        transactions: 'id, date, type, categoryId, account, createdAt',
        categories:   'id, name',
        settings:     'id',
        exchangeRates:'id',
        accounts:     'id, name',
      })
      .upgrade(async (tx) => {
        await tx.table('accounts').bulkPut(DEFAULT_ACCOUNTS);
      });
    this.version(4).stores({
      transactions: 'id, date, type, categoryId, account, createdAt, isArchived',
      categories:   'id, name',
      settings:     'id',
      exchangeRates:'id',
      accounts:     'id, name',
    });
    this.version(5)
      .stores({
        transactions: 'id, date, type, categoryId, account, createdAt, isArchived',
        categories:   'id, name',
        settings:     'id',
        exchangeRates:'id',
        accounts:     'id, name',
      })
      .upgrade(async (tx) => {
        const b1 = await tx.table('accounts').get('bank1');
        if (b1) await tx.table('accounts').update('bank1', { name: 'Savings' });
        const b2 = await tx.table('accounts').get('bank2');
        if (b2) await tx.table('accounts').update('bank2', { name: 'Checking' });
      });
  }
}

export const DEFAULT_ACCOUNTS: AccountRecord[] = [
  { id: 'cash',    name: 'Cash',    isDefault: true  },
  { id: 'savings', name: 'Savings', isDefault: false },
];

export const db = new SipaliDB();

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'groceries',     name: 'Groceries',     color: '#4ade80', icon: 'ShoppingCart', categoryType: 'expense' },
  { id: 'personal',      name: 'Personal',       color: '#a78bfa', icon: 'User',         categoryType: 'expense' },
  { id: 'transport',     name: 'Transport',      color: '#60a5fa', icon: 'Car',          categoryType: 'expense' },
  { id: 'health',        name: 'Health',         color: '#f87171', icon: 'Heart',        categoryType: 'expense' },
  { id: 'entertainment', name: 'Entertainment',  color: '#fb923c', icon: 'Tv',           categoryType: 'expense' },
  { id: 'housing',       name: 'Housing',        color: '#fbbf24', icon: 'Home',         categoryType: 'expense' },
  { id: 'food',          name: 'Food & Dining',  color: '#f472b6', icon: 'UtensilsCrossed', categoryType: 'expense' },
  { id: 'utilities',     name: 'Utilities',      color: '#94a3b8', icon: 'Zap',          categoryType: 'expense' },
  { id: 'savings',       name: 'Savings',        color: '#34d399', icon: 'PiggyBank',    categoryType: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'inc-salary',    name: 'Salary',         color: '#86efac', icon: 'Briefcase',   categoryType: 'income' },
  { id: 'inc-freelance', name: 'Freelance',      color: '#67e8f9', icon: 'Laptop',      categoryType: 'income' },
  { id: 'inc-business',  name: 'Business',       color: '#fde68a', icon: 'Building2',   categoryType: 'income' },
  { id: 'inc-invest',    name: 'Investment',     color: '#a5f3fc', icon: 'TrendingUp',  categoryType: 'income' },
  { id: 'inc-gift',      name: 'Gift',           color: '#fbcfe8', icon: 'Gift',        categoryType: 'income' },
  { id: 'inc-other',     name: 'Other Income',   color: '#d9f99d', icon: 'Plus',        categoryType: 'income' },
];

db.on('populate', async () => {
  await db.categories.bulkPut([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]);
  await db.accounts.bulkPut(DEFAULT_ACCOUNTS);
  await db.settings.put({
    id: 'app',
    displayCurrency: 'USD',
    enabledCurrencies: DEFAULT_CURRENCIES,
  });
});

export async function ensureCategoriesExist() {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkPut([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]);
    return;
  }
  // Upsert income categories for existing installs that predate them
  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    const exists = await db.categories.get(cat.id);
    if (!exists) await db.categories.put(cat);
  }
}

export async function ensureAccountsExist() {
  for (const acc of DEFAULT_ACCOUNTS) {
    const exists = await db.accounts.get(acc.id);
    if (!exists) await db.accounts.put(acc);
  }
}

export async function ensureSettingsExist() {
  const existing = await db.settings.get('app');
  if (!existing) {
    await db.settings.put({
      id: 'app',
      displayCurrency: 'USD',
      enabledCurrencies: DEFAULT_CURRENCIES,
    });
  }
}
