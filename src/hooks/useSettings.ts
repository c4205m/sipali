import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { DEFAULT_CURRENCIES, DEFAULT_HISTORY_FIELDS } from '../types';
import type { AppSettings } from '../types';

const FALLBACK: AppSettings = {
  id: 'app',
  displayCurrency: 'USD',
  enabledCurrencies: DEFAULT_CURRENCIES,
  historyFields: DEFAULT_HISTORY_FIELDS,
};

export function useSettings(): AppSettings {
  return useLiveQuery(() => db.settings.get('app'), []) ?? FALLBACK;
}
