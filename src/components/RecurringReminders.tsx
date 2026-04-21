import { useMemo, useState } from 'react';
import { parseISO, addDays, addWeeks, addMonths, addYears, differenceInDays, startOfDay, format } from 'date-fns';
import { RefreshCw, CreditCard, Plus, X } from 'lucide-react';
import type { Transaction, RecurringInterval } from '../types';
import { useTransactions } from '../hooks/useTransactions';
import { useCategoryMap } from '../hooks/useCategories';
import { formatCurrency } from '../utils/currency';
import { db } from '../db/db';

interface Props {
  onQuickAdd: (t: Transaction) => void;
}

function nextRecurringDue(lastDate: string, interval: RecurringInterval): Date {
  const d = parseISO(lastDate);
  switch (interval) {
    case 'daily':   return addDays(d, 1);
    case 'weekly':  return addWeeks(d, 1);
    case 'monthly': return addMonths(d, 1);
    case 'yearly':  return addYears(d, 1);
  }
}

function nextInstallmentDue(startDate: string, paid: number, interval: RecurringInterval): Date {
  const d = parseISO(startDate);
  switch (interval) {
    case 'daily':   return addDays(d, paid);
    case 'weekly':  return addWeeks(d, paid);
    case 'monthly': return addMonths(d, paid);
    case 'yearly':  return addYears(d, paid);
  }
}

type ReminderItem =
  | { kind: 'recurring';    t: Transaction; diff: number }
  | { kind: 'installment';  t: Transaction; diff: number; perAmount: number; remaining: number };

export default function RecurringReminders({ onQuickAdd }: Props) {
  const transactions = useTransactions();
  const categoryMap  = useCategoryMap();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  async function handleSkip(item: ReminderItem) {
    const { t } = item;
    setDismissed((prev) => new Set(prev).add(t.id));
    if (item.kind === 'installment') {
      await db.transactions.update(t.id, { installmentsPaid: (t.installmentsPaid ?? 0) + 1 });
      setDismissed((prev) => { const next = new Set(prev); next.delete(t.id); return next; });
    } else {
      const groupKey = `${t.name}|${t.type}|${t.account}`;
      const toCancel = transactions.filter(
        (tx) => `${tx.name}|${tx.type}|${tx.account}` === groupKey && tx.isRecurring,
      );
      await Promise.all(toCancel.map((tx) => db.transactions.update(tx.id, { isRecurring: false })));
    }
  }

  const reminders = useMemo(() => {
    const today = startOfDay(new Date());
    const items: ReminderItem[] = [];

    // ── Recurring ──────────────────────────────────────────────────────────
    const recurring = transactions.filter((t) => t.isRecurring && t.recurringInterval);
    const groups = new Map<string, Transaction>();
    for (const t of recurring) {
      const key = `${t.name}|${t.type}|${t.account}`;
      const prev = groups.get(key);
      if (!prev || t.date > prev.date) groups.set(key, t);
    }
    for (const t of groups.values()) {
      const diff = differenceInDays(startOfDay(nextRecurringDue(t.date, t.recurringInterval!)), today);
      if (diff <= 7) items.push({ kind: 'recurring', t, diff });
    }

    // ── Installments ───────────────────────────────────────────────────────
    const installments = transactions.filter(
      (t) => t.isInstallment && t.installmentInterval &&
             t.installmentCount != null && t.installmentsPaid != null &&
             t.installmentsPaid < t.installmentCount,
    );
    for (const t of installments) {
      const diff = differenceInDays(
        startOfDay(nextInstallmentDue(t.date, t.installmentsPaid!, t.installmentInterval!)),
        today,
      );
      if (diff <= 7) {
        items.push({
          kind: 'installment',
          t,
          diff,
          perAmount: t.price / t.installmentCount!,
          remaining: t.installmentCount! - t.installmentsPaid!,
        });
      }
    }

    return items.sort((a, b) => a.diff - b.diff);
  }, [transactions]);

  async function handlePayNow(t: Transaction, perAmount: number) {
    const today = format(new Date(), 'yyyy-MM-dd');
    await db.transactions.add({
      id: crypto.randomUUID(),
      name: t.name,
      price: perAmount,
      currency: t.currency,
      date: today,
      type: 'expense',
      categoryId: t.categoryId,
      account: t.account,
      isRecurring: false,
      installmentIndex: (t.installmentsPaid ?? 0) + 1,
      installmentTotal: t.installmentCount,
      createdAt: new Date().toISOString(),
    });
    await db.transactions.update(t.id, { installmentsPaid: (t.installmentsPaid ?? 0) + 1 });
  }

  const visible = reminders.filter((item) => !dismissed.has(item.t.id));
  if (visible.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="px-4 text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <RefreshCw size={10} /> Upcoming
      </p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
        {visible.map((item) => {
          const { t, diff } = item;
          const urgencyColor =
            diff < 0   ? '#f87171' :
            diff === 0 ? '#fb923c' :
            diff <= 3  ? '#fbbf24' : '#64748b';
          const urgencyLabel =
            diff < 0   ? `${Math.abs(diff)}d overdue` :
            diff === 0 ? 'Due today' : `In ${diff}d`;

          if (item.kind === 'recurring') {
            const cat = categoryMap[t.categoryId];
            return (
              <div
                key={t.id}
                className="shrink-0 w-40 bg-[#1a1a35] rounded-2xl p-3 flex flex-col gap-2"
                style={{ borderLeft: `3px solid ${urgencyColor}` }}
              >
                <div className="flex items-start justify-between gap-1 min-w-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: urgencyColor }}>{urgencyLabel}</p>
                  </div>
                  <button onPointerDown={() => handleSkip(item)} className="text-slate-600 active:text-slate-400 shrink-0 touch-manipulation -mr-1 -mt-0.5">
                    <X size={12} />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">
                    {formatCurrency(t.price, t.currency ?? 'USD')}
                  </p>
                  {cat && <p className="text-xs text-slate-600 mt-0.5">{cat.name}</p>}
                </div>
                <button
                  onPointerDown={() => onQuickAdd(t)}
                  className="w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 touch-manipulation"
                  style={{ backgroundColor: urgencyColor + '22', color: urgencyColor }}
                >
                  <Plus size={11} /> Quick Add
                </button>
              </div>
            );
          }

          // installment card
          const { perAmount, remaining } = item;
          return (
            <div
              key={t.id}
              className="shrink-0 w-44 bg-[#1a1a35] rounded-2xl p-3 flex flex-col gap-2"
              style={{ borderLeft: '3px solid #a78bfa' }}
            >
              <div className="flex items-start justify-between gap-1 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <CreditCard size={9} className="text-[#a78bfa] shrink-0" />
                    <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                  </div>
                  <p className="text-xs font-medium" style={{ color: urgencyColor }}>
                    {t.installmentsPaid! + 1} of {t.installmentCount} · {urgencyLabel}
                  </p>
                </div>
                <button onPointerDown={() => handleSkip(item)} className="text-slate-600 active:text-slate-400 shrink-0 touch-manipulation -mr-1 -mt-0.5">
                  <X size={12} />
                </button>
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">
                  {formatCurrency(perAmount, t.currency ?? 'USD')}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {formatCurrency(t.price, t.currency ?? 'USD')} total · {remaining} left
                </p>
              </div>
              <button
                onPointerDown={() => handlePayNow(t, perAmount)}
                className="w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 touch-manipulation bg-[#a78bfa]/15 text-[#a78bfa]"
              >
                <Plus size={11} /> Pay Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
