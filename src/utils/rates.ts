import { db } from '../db/db';

const RATES_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';

export async function fetchAndCacheRates(): Promise<void> {
  try {
    const cached = await db.exchangeRates.get('rates');
    if (cached) {
      const age = Date.now() - new Date(cached.updatedAt).getTime();
      if (age < RATES_TTL_MS) return;
    }

    const res = await fetch(API_URL);
    if (!res.ok) return;
    const data = await res.json();

    let base: string;
    let rates: Record<string, number>;

    if (data.usd) {
      // fawazahmed0 format: { date, try: { usd: 0.027, eur: 0.025, ... } }
      base = 'USD';
      rates = {};
      for (const [k, v] of Object.entries(data.usd as Record<string, number>)) {
        rates[k.toUpperCase()] = v;
      }
    } else {
      // frankfurter format: { base: "EUR", rates: { USD: 1.09, TRY: 41.2, ... } }
      base = data.base as string;
      rates = data.rates as Record<string, number>;
    }

    if (rates['XAU']) rates['GXAU'] = rates['XAU'] * 31.1035;
    if (!rates || !base) return;
    await db.exchangeRates.put({ id: 'rates', base, rates, updatedAt: new Date().toISOString() });
  } catch {
    // Silently fall back to cached rates when offline
  }
}

