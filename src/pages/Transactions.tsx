import { useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories, useCategoryMap } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import TransactionList from '../components/TransactionList';
import SummaryCards from '../components/SummaryCards';
import Select from '../components/Select';
import type { TransactionType, Importance, RecurringInterval, Account, TxFilters } from '../types';
import { IMPORTANCE_OPTIONS, RECURRING_INTERVALS } from '../types';
import { useAccounts } from '../hooks/useAccounts';
import { defaultTxFilters } from '../utils/filters';

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'expense',  label: 'Expense'  },
  { value: 'income',   label: 'Income'   },
  { value: 'transfer', label: 'Transfer' },
];

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function PillGroup<T extends string>({
  options, selected, onToggle, activeColor = 'bg-[#e94560] text-white border-[#e94560]',
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (v: T) => void;
  activeColor?: string;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onPointerDown={() => onToggle(o.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all touch-manipulation ${
            selected.includes(o.value)
              ? activeColor
              : 'bg-[#1e1e35] border-[#2e2e4e] text-slate-400'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface Props {
  filters: TxFilters;
  onFiltersChange: (f: TxFilters) => void;
}

export default function Transactions({ filters, onFiltersChange }: Props) {
  const transactions   = useTransactions();
  const categories     = useCategories();
  const categoryMap    = useCategoryMap();
  const accountList    = useAccounts();
  const { enabledCurrencies } = useSettings();

  const {
    open, nameQ, dateFrom, dateTo, types, accounts, categoryId,
    importances, currencies, priceMin, priceMax,
    filterRecurring, filterInstallment, recurringIntervals, installmentIntervals,
  } = filters;

  const set = <K extends keyof TxFilters>(key: K, val: TxFilters[K]) =>
    onFiltersChange({ ...filters, [key]: val });

  const setOpen               = (v: boolean)             => set('open', v);
  const setNameQ              = (v: string)              => set('nameQ', v);
  const setDateFrom           = (v: string)              => set('dateFrom', v);
  const setDateTo             = (v: string)              => set('dateTo', v);
  const setTypes              = (v: TransactionType[])   => set('types', v);
  const setAccounts           = (v: Account[])           => set('accounts', v);
  const setCategoryId         = (v: string)              => set('categoryId', v);
  const setImportances        = (v: Importance[])        => set('importances', v);
  const setCurrencies         = (v: string[])            => set('currencies', v);
  const setPriceMin           = (v: string)              => set('priceMin', v);
  const setPriceMax           = (v: string)              => set('priceMax', v);
  const setFilterRecurring    = (v: boolean)             => set('filterRecurring', v);
  const setFilterInstallment  = (v: boolean)             => set('filterInstallment', v);
  const setRecurringIntervals   = (v: RecurringInterval[]) => set('recurringIntervals', v);
  const setInstallmentIntervals = (v: RecurringInterval[]) => set('installmentIntervals', v);

  function clearAll() { onFiltersChange(defaultTxFilters()); }

  const { dateFrom: defaultFrom, dateTo: defaultTo } = useMemo(defaultTxFilters, []);

  const activeCount = [
    nameQ !== '',
    dateFrom !== defaultFrom || dateTo !== defaultTo,
    types.length > 0,
    accounts.length > 0,
    categoryId !== '',
    importances.length > 0,
    currencies.length > 0,
    priceMin !== '',
    priceMax !== '',
    filterRecurring,
    filterInstallment,
  ].filter(Boolean).length;

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = transactions.filter((t) => {
    if (nameQ && !t.name.toLowerCase().includes(nameQ.toLowerCase())) return false;
    if (t.date < dateFrom || t.date > dateTo) return false;
    if (types.length) {
      const match =
        (types.includes('transfer') && !!t.transferCounterpart) ||
        (types.includes('expense')  && t.type === 'expense' && !t.transferCounterpart) ||
        (types.includes('income')   && t.type === 'income'  && !t.transferCounterpart);
      if (!match) return false;
    }
    if (accounts.length  && !accounts.includes(t.account))   return false;
    if (categoryId       && t.categoryId !== categoryId)      return false;
    if (importances.length && t.importance && !importances.includes(t.importance)) return false;
    if (currencies.length && t.currency && !currencies.includes(t.currency)) return false;
    if (priceMin         && t.price < Number(priceMin))      return false;
    if (priceMax         && t.price > Number(priceMax))      return false;
    if (filterRecurring  && !t.isRecurring)                  return false;
    if (filterInstallment && !t.isInstallment)               return false;
    if (filterRecurring  && recurringIntervals.length   && t.recurringInterval   && !recurringIntervals.includes(t.recurringInterval))     return false;
    if (filterInstallment && installmentIntervals.length && t.installmentInterval && !installmentIntervals.includes(t.installmentInterval)) return false;
    return true;
  });

  const inputClass = 'w-full bg-[#1e1e35] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560] transition-colors text-sm';
  const labelClass = 'block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide';

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];
  const currencyOptions = enabledCurrencies.map((c) => ({ value: c, label: c }));

  return (
    <div className="flex flex-col min-h-dvh">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Browse</p>
          <h1 className="text-xl font-bold text-white mt-0.5">Transactions</h1>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onPointerDown={clearAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1e1e35] text-slate-400 text-xs touch-manipulation"
            >
              <X size={11} /> Clear
            </button>
          )}
          <button
            onPointerDown={() => setOpen(!open)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all touch-manipulation ${
              open || activeCount > 0
                ? 'border-[#e94560] text-[#e94560] bg-[#e94560]/10'
                : 'border-[#2e2e4e] text-slate-400 bg-[#1e1e35]'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {open && (
        <div className="px-4 pb-4 space-y-4 border-b border-[#2e2e4e]">

          {/* Name search */}
          <div>
            <label className={labelClass}>Search</label>
            <input
              className={inputClass}
              placeholder="Search by name…"
              value={nameQ}
              onChange={(e) => setNameQ(e.target.value)}
            />
          </div>

          {/* Date range */}
          <div>
            <label className={labelClass}>Date range</label>
            <div className="flex gap-2">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
              <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className={inputClass} />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Type</label>
            <PillGroup options={TYPE_OPTIONS} selected={types} onToggle={(v) => setTypes(toggle(types, v))} />
          </div>

          {/* Account */}
          <div>
            <label className={labelClass}>Account</label>
            <PillGroup
              options={accountList.map((a) => ({ value: a.id, label: a.name }))}
              selected={accounts}
              onToggle={(v) => setAccounts(toggle(accounts, v as Account))}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <Select value={categoryId} onChange={setCategoryId} options={categoryOptions} />
          </div>

          {/* Importance */}
          <div>
            <label className={labelClass}>Importance</label>
            <PillGroup
              options={IMPORTANCE_OPTIONS}
              selected={importances}
              onToggle={(v) => setImportances(toggle(importances, v as Importance))}
              activeColor="bg-[#a78bfa] text-white border-[#a78bfa]"
            />
          </div>

          {/* Currency */}
          {currencyOptions.length > 1 && (
            <div>
              <label className={labelClass}>Currency</label>
              <PillGroup
                options={currencyOptions}
                selected={currencies}
                onToggle={(v) => setCurrencies(toggle(currencies, v))}
                activeColor="bg-[#22c55e] text-white border-[#22c55e]"
              />
            </div>
          )}

          {/* Price range */}
          <div>
            <label className={labelClass}>Price range</label>
            <div className="flex gap-2">
              <input
                type="number" inputMode="decimal" min="0" placeholder="Min"
                className={inputClass} value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <input
                type="number" inputMode="decimal" min="0" placeholder="Max"
                className={inputClass} value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <button
              type="button"
              onPointerDown={() => { setFilterRecurring(!filterRecurring); setRecurringIntervals([]); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all touch-manipulation ${
                filterRecurring
                  ? 'border-[#e94560] text-[#e94560] bg-[#e94560]/10'
                  : 'border-[#2e2e4e] text-slate-400 bg-[#1e1e35]'
              }`}
            >
              Recurring only
            </button>
            {filterRecurring && (
              <div className="mt-2">
                <PillGroup
                  options={RECURRING_INTERVALS}
                  selected={recurringIntervals}
                  onToggle={(v) => setRecurringIntervals(toggle(recurringIntervals, v))}
                />
              </div>
            )}
          </div>

          {/* Installment */}
          <div>
            <button
              type="button"
              onPointerDown={() => { setFilterInstallment(!filterInstallment); setInstallmentIntervals([]); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all touch-manipulation ${
                filterInstallment
                  ? 'border-[#a78bfa] text-[#a78bfa] bg-[#a78bfa]/10'
                  : 'border-[#2e2e4e] text-slate-400 bg-[#1e1e35]'
              }`}
            >
              Installments only
            </button>
            {filterInstallment && (
              <div className="mt-2">
                <PillGroup
                  options={RECURRING_INTERVALS}
                  selected={installmentIntervals}
                  onToggle={(v) => setInstallmentIntervals(toggle(installmentIntervals, v))}
                  activeColor="bg-[#a78bfa] text-white border-[#a78bfa]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <SummaryCards transactions={filtered} />

      {/* Result count */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-slate-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <TransactionList transactions={filtered} categoryMap={categoryMap} />
    </div>
  );
}
