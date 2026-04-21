import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { DEFAULT_CURRENCIES } from '../types';
import type { AppSettings } from '../types';

const FALLBACK: AppSettings = {
  id: 'app',
  displayCurrency: 'USD',
  enabledCurrencies: DEFAULT_CURRENCIES,
};

export function useSettings(): AppSettings {
  return useLiveQuery(() => db.settings.get('app'), []) ?? FALLBACK;
}
