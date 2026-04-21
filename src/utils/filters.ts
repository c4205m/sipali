import { format, startOfMonth } from 'date-fns';
import type { HomeFilters, TxFilters } from '../types';

export function defaultTxFilters(): TxFilters {
  const now = new Date();
  return {
    open: false,
    nameQ: '',
    dateFrom: format(startOfMonth(now), 'yyyy-MM-dd'),
    dateTo: format(now, 'yyyy-MM-dd'),
    types: [],
    accounts: [],
    categoryId: '',
    importances: [],
    currencies: [],
    priceMin: '',
    priceMax: '',
    filterRecurring: false,
    filterInstallment: false,
    recurringIntervals: [],
    installmentIntervals: [],
  };
}

export function defaultHomeFilters(): HomeFilters {
  const now = new Date();
  return {
    interval: 'month',
    customFrom: format(startOfMonth(now), 'yyyy-MM-dd'),
    customTo: format(now, 'yyyy-MM-dd'),
  };
}
