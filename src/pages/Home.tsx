import { Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import SummaryCards from '../components/SummaryCards';
import TransactionList from '../components/TransactionList';
import RecurringReminders from '../components/RecurringReminders';
import { useTransactions } from '../hooks/useTransactions';
import { useCategoryMap } from '../hooks/useCategories';
import { useAccountMap } from '../hooks/useAccounts';
import type { Transaction, HomeFilters } from '../types';

const INTERVALS: { value: HomeFilters['interval']; label: string }[] = [
  { value: 'today',  label: 'Today'  },
  { value: 'week',   label: 'Week'   },
  { value: 'month',  label: 'Month'  },
  { value: 'custom', label: 'Custom' },
];

interface Props {
  onAddTransaction: (prefill?: Transaction) => void;
  filters: HomeFilters;
  onFiltersChange: (f: HomeFilters) => void;
}

export default function Home({ onAddTransaction, filters, onFiltersChange }: Props) {
  const transactions = useTransactions();
  const accountMap   = useAccountMap();
  const categoryMap  = useCategoryMap();
  const now = new Date();

  const { interval, customFrom, customTo } = filters;
  const setInterval   = (v: HomeFilters['interval']) => onFiltersChange({ ...filters, interval: v });
  const setCustomFrom = (v: string) => onFiltersChange({ ...filters, customFrom: v });
  const setCustomTo   = (v: string) => onFiltersChange({ ...filters, customTo: v });

  function getRange(): [string, string] {
    switch (interval) {
      case 'today':
        const today = format(now, 'yyyy-MM-dd');
        return [today, today];
      case 'week':
        return [
          format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          format(endOfWeek(now,   { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        ];
      case 'month':
        return [format(startOfMonth(now), 'yyyy-MM-dd'), format(endOfMonth(now), 'yyyy-MM-dd')];
      case 'year':
        return [format(startOfYear(now),  'yyyy-MM-dd'), format(endOfYear(now),  'yyyy-MM-dd')];
      case 'custom':
        return [customFrom, customTo];
    }
  }

  const [rangeFrom, rangeTo] = getRange();
  const filtered = transactions
    .filter(
      (t) => t.date >= rangeFrom && t.date <= rangeTo && !t.isInstallment && !t.isSkip
        && !t.isArchived && t.type !== 'transfer' && accountMap[t.account] !== undefined
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  const dateInputClass =
    'flex-1 bg-[#12122a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#e94560] transition-colors';

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Overview</p>
          <h1 className="text-xl font-bold text-white mt-0.5">
            {now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
        </div>
        <button
          onClick={() => onAddTransaction()}
          className="w-11 h-11 rounded-2xl bg-[#e94560] hover:bg-[#d63651] flex items-center justify-center text-white shadow-lg transition-colors"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Interval selector */}
      <div className="px-4 pt-2 space-y-2">
        <div className="flex gap-1.5">
          {INTERVALS.map((opt) => (
            <button
              key={opt.value}
              onPointerDown={() => setInterval(opt.value)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all touch-manipulation ${
                interval === opt.value
                  ? 'bg-[#e94560] text-white'
                  : 'bg-[#1a1a35] text-slate-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {interval === 'custom' && (
          <div className="flex gap-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={dateInputClass} />
            <input type="date" value={customTo}   onChange={(e) => setCustomTo(e.target.value)}   className={dateInputClass} />
          </div>
        )}
      </div>

      <RecurringReminders onQuickAdd={(t) => onAddTransaction(t)} />

      <SummaryCards transactions={filtered} />

      <div className="mt-5 px-4 mb-2">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Recent
        </h2>
      </div>

      <TransactionList transactions={filtered} categoryMap={categoryMap} />
    </div>
  );
}
