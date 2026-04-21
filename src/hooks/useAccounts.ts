import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { AccountRecord } from '../types';

export function useAccounts(): AccountRecord[] {
  return useLiveQuery(() => db.accounts.toArray(), []) ?? [];
}

export function useAccountMap(): Record<string, AccountRecord> {
  const accounts = useAccounts();
  return Object.fromEntries(accounts.map((a) => [a.id, a]));
}
