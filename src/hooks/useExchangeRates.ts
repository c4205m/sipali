import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { ExchangeRates } from '../types';

const FALLBACK: ExchangeRates = { id: 'rates', base: 'USD', rates: {}, updatedAt: '' };

export function useExchangeRates(): ExchangeRates {
  const result = useLiveQuery(() => db.exchangeRates.get('rates'), []);
  if (!result?.rates) return FALLBACK;
  return result;
}
