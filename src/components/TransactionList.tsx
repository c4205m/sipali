import { useState } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { RefreshCw, CreditCard, X, Info } from 'lucide-react';
import { db } from '../db/db';
import type { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/currency';
import { useSettings } from '../hooks/useSettings';
import { useAccountMap } from '../hooks/useAccounts';
import { isApplePlatform } from '../utils/platform';
import ShareModal from './ShareModal';
import TransactionCard, { TYPE_COLORS, TYPE_SIGNS } from './TransactionCard';

interface Props {
  transactions: Transaction[];
  categoryMap: Record<string, Category>;
}

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function dateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

export default function TransactionList({ transactions, categoryMap }: Props) {
  const [sharingTx, setSharingTx] = useState<Transaction | null>(null);
  const [detailTx,  setDetailTx]  = useState<Transaction | null>(null);
  const [openId,    setOpenId]    = useState<string | null>(null);
  const settings     = useSettings();
  const showShortcut = isApplePlatform && !!settings.iosShortcutName;

  function runShortcut(t: Transaction) {
    const payload = JSON.stringify({
      name: t.name, amount: t.price, currency: t.currency,
      type: t.type, account: t.account, date: t.date,
      isPlan: t.isInstallment && !t.installmentIndex,
      installmentIndex: t.installmentIndex,
      installmentCount: t.installmentCount ?? t.installmentTotal,
    });
    window.location.href =
      `shortcuts://run-shortcut?name=${encodeURIComponent(settings.iosShortcutName!)}&input=text&text=${encodeURIComponent(payload)}`;
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-600">
        <p className="text-sm">No transactions yet</p>
        <p className="text-xs mt-1">Tap + to add your first entry</p>
      </div>
    );
  }

  const grouped = groupByDate(transactions);

  return (
    <>
    <div className="px-4 pb-28">
      {grouped.map(([date, txns]) => (
        <div key={date} className="mb-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
            {dateLabel(date)}
          </p>
          <div className="space-y-2">
            {txns.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={t}
                categoryMap={categoryMap}
                isOpen={openId === t.id}
                onOpen={() => setOpenId(t.id)}
                onClose={() => setOpenId(null)}
                onTap={() => setDetailTx(t)}
                onShare={() => setSharingTx(t)}
                onDelete={() => db.transactions.delete(t.id)}
                onShortcut={showShortcut ? () => runShortcut(t) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>

    {sharingTx && (
      <ShareModal
        transaction={sharingTx}
        category={categoryMap[sharingTx.categoryId]}
        onClose={() => setSharingTx(null)}
      />
    )}

    {detailTx && (
      <TransactionDetailModal
        transaction={detailTx}
        categoryMap={categoryMap}
        onClose={() => setDetailTx(null)}
      />
    )}
    </>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────

const IMPORTANCE_LABELS: Record<string, { label: string; color: string }> = {
  need:   { label: 'Need',   color: '#f87171' },
  want:   { label: 'Want',   color: '#fb923c' },
  saving: { label: 'Saving', color: '#4ade80' },
};

function TransactionDetailModal({ transaction: t, categoryMap, onClose }: {
  transaction: Transaction;
  categoryMap: Record<string, Category>;
  onClose: () => void;
}) {
  const accountMap = useAccountMap();
  const cat = categoryMap[t.categoryId];
  const isPlan = !!t.isInstallment && !t.installmentIndex;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Date',   value: format(parseISO(t.date), 'MMM d, yyyy') },
    { label: 'Amount', value: (
        <span className={TYPE_COLORS[t.type]}>
          {TYPE_SIGNS[t.type]}{formatCurrency(t.price, t.currency ?? 'USD')}
          {t.currency && t.currency !== 'USD' && (
            <span className="ml-1 text-slate-500 text-xs font-normal">{t.currency}</span>
          )}
        </span>
      ),
    },
  ];

  if (t.transferCounterpart) {
    rows.push({ label: t.type === 'expense' ? 'To' : 'From', value: t.transferCounterpart });
    rows.push({ label: 'Account', value: accountMap[t.account]?.name ?? t.account });
  } else {
    if (cat && t.type !== 'transfer') {
      rows.push({ label: 'Category', value: (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
          {cat.name}
        </span>
      )});
    }
    rows.push({ label: 'Account', value: accountMap[t.account]?.name ?? t.account });
    if (t.toAccount) {
      rows.push({ label: 'To Account', value: accountMap[t.toAccount]?.name ?? t.toAccount });
    }
  }

  if (t.importance && t.type === 'expense') {
    const imp = IMPORTANCE_LABELS[t.importance];
    rows.push({ label: 'Importance', value: imp
      ? <span style={{ color: imp.color }}>{imp.label}</span>
      : t.importance
    });
  }

  if (t.isRecurring && t.recurringInterval) {
    rows.push({ label: 'Recurring', value: (
      <span className="inline-flex items-center gap-1 text-[#e94560]">
        <RefreshCw size={11} /> {t.recurringInterval}
      </span>
    )});
  }

  if (isPlan) {
    rows.push({ label: 'Plan', value: `${t.installmentCount} payments` });
    if (t.installmentInterval) rows.push({ label: 'Interval', value: t.installmentInterval });
  } else if (t.installmentIndex != null && t.installmentTotal != null) {
    rows.push({ label: 'Installment', value: (
      <span className="inline-flex items-center gap-1 text-[#a78bfa]">
        <CreditCard size={11} /> {t.installmentIndex} / {t.installmentTotal}
      </span>
    )});
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-[#12122a] rounded-3xl px-5 pt-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Info size={15} className="text-slate-500 shrink-0" />
            <h2 className="text-base font-semibold text-white truncate">{t.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1e1e35] text-slate-400 hover:text-white shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 uppercase tracking-wide shrink-0">{label}</span>
              <span className="text-sm text-white font-medium text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
