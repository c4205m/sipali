import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Transaction } from '../types';

export function useTransactions(limit?: number): Transaction[] {
  return (
    useLiveQuery(async () => {
      const query = db.transactions.orderBy('date').reverse();
      return limit ? query.limit(limit).toArray() : query.toArray();
    }, [limit]) ?? []
  );
}

export function useTransactionsByMonth(year: number, month: number): Transaction[] {
  return (
    useLiveQuery(async () => {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = `${year}-${String(month).padStart(2, '0')}-31`;
      return db.transactions
        .where('date')
        .between(start, end, true, true)
        .toArray();
    }, [year, month]) ?? []
  );
}
