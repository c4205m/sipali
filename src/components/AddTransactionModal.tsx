import { useState, useEffect, useMemo } from 'react';
import { X, RefreshCw, CreditCard } from 'lucide-react';
import { db } from '../db/db';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import { getCurrencySymbol } from '../utils/currency';
import Select from './Select';
import type { Transaction, TransactionType, Importance, RecurringInterval, Account } from '../types';
import { IMPORTANCE_OPTIONS, RECURRING_INTERVALS } from '../types';
import { useAccounts } from '../hooks/useAccounts';

interface Props {
  onClose: () => void;
  prefill?: Partial<Transaction>;
}

const INSTALLMENT_INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: 'weekly',  label: 'Wk' },
  { value: 'monthly', label: 'Mo' },
  { value: 'yearly',  label: 'Yr' },
];

const TYPE_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: 'expense',  label: 'Expense',  color: 'bg-red-500'   },
  { value: 'income',   label: 'Income',   color: 'bg-green-400' },
  { value: 'transfer', label: 'Transfer', color: 'bg-blue-400'  },
];

export default function AddTransactionModal({ onClose, prefill }: Props) {
  const categories      = useCategories();
  const allTransactions = useTransactions();
  const { displayCurrency, enabledCurrencies } = useSettings();
  const accountList     = useAccounts();
  const today = new Date().toISOString().split('T')[0];

  const [name,              setName]              = useState(prefill?.name ?? '');
  const [price,             setPrice]             = useState(prefill?.price?.toString() ?? '');
  const [currency,          setCurrency]          = useState(prefill?.currency ?? displayCurrency);
  const [currencyLocked,    setCurrencyLocked]    = useState(!!prefill?.currency);
  const [date,              setDate]              = useState(today);
  const [type,              setType]              = useState<TransactionType>(prefill?.type ?? 'expense');
  const [categoryId,        setCategoryId]        = useState(prefill?.categoryId ?? '');
  const [importance,        setImportance]        = useState<Importance>(prefill?.importance ?? 'need');
  const [isRecurring,          setIsRecurring]          = useState(prefill?.isRecurring ?? false);
  const [recurringInterval,    setRecurringInterval]    = useState<RecurringInterval>(prefill?.recurringInterval ?? 'monthly');
  const [isInstallment,        setIsInstallment]        = useState(prefill?.isInstallment ?? false);
  const [installmentCount,     setInstallmentCount]     = useState(prefill?.installmentCount?.toString() ?? '12');
  const [installmentInterval,  setInstallmentInterval]  = useState<RecurringInterval>(prefill?.installmentInterval ?? 'monthly');
  const [account,           setAccount]           = useState<Account>(prefill?.account ?? 'cash');
  const [toAccount,         setToAccount]         = useState<Account>(prefill?.toAccount ?? 'bank1');
  const [error,             setError]             = useState('');

  useEffect(() => {
    if (!currencyLocked) setCurrency(displayCurrency);
  }, [displayCurrency]);

  useEffect(() => {
    if (accountList.length === 0) return;
    const ids = accountList.map((a) => a.id);
    if (!ids.includes(account))   setAccount(accountList[0].id);
    if (!ids.includes(toAccount)) setToAccount(accountList[1]?.id ?? accountList[0].id);
  }, [accountList, account, toAccount]);

  const filteredCategories = categories.filter((c) => {
    if (type === 'income')   return (c.categoryType ?? 'expense') === 'income';
    if (type === 'expense')  return (c.categoryType ?? 'expense') === 'expense';
    return false;
  });

  useEffect(() => {
    if (filteredCategories.length > 0) setCategoryId(filteredCategories[0].id);
  }, [type]);

  useEffect(() => {
    if (!categoryId && filteredCategories.length > 0) setCategoryId(filteredCategories[0].id);
  }, [filteredCategories]);

  // TEMP: ip-prefixed id for device tracing during testing (crypto unavailable over plain HTTP)
  async function testId() {
    try {
      const { ip } = await fetch('https://api.ipify.org?format=json').then((r) => r.json());
      return `${ip}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    } catch {
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  const suggestions = useMemo(() => {
    if (name.trim().length === 0) return [];
    const seen = new Map<string, { name: string; categoryId: string; importance: Importance | undefined; date: string }>();
    for (const t of allTransactions) {
      if (t.type !== type) continue;
      if (!t.name.toLowerCase().includes(name.toLowerCase())) continue;
      if (t.name.toLowerCase() === name.toLowerCase()) continue;
      const prev = seen.get(t.name);
      if (!prev || t.date > prev.date)
        seen.set(t.name, { name: t.name, categoryId: t.categoryId, importance: t.importance, date: t.date });
    }
    return Array.from(seen.values()).slice(0, 5);
  }, [name, type, allTransactions]);

  const perPayment =
    isInstallment && Number(price) > 0 && Number(installmentCount) >= 2
      ? Number(price) / Number(installmentCount)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      return setError('Enter a valid amount');
    if (type === 'transfer' && account === toAccount)
      return setError('From and To accounts must differ');
    if (isInstallment && (Number(installmentCount) < 2 || isNaN(Number(installmentCount))))
      return setError('Installment count must be at least 2');

    const count = Number(installmentCount);
    await db.transactions.add({
      id: await testId(),//crypto.randomUUID(),
      name: name.trim(),
      price: Number(price),
      currency,
      date,
      type,
      categoryId:          type !== 'transfer' ? categoryId : 'transfer',
      importance:          type === 'expense'  ? importance : undefined,
      isRecurring,
      recurringInterval:   isRecurring   ? recurringInterval : undefined,
      isInstallment:       isInstallment || undefined,
      installmentCount:    isInstallment ? count : undefined,
      installmentsPaid:    isInstallment ? 1     : undefined,
      installmentInterval: isInstallment ? installmentInterval : undefined,
      account,
      toAccount:           type === 'transfer' ? toAccount : undefined,
      createdAt: new Date().toISOString(),
    });

    if (isInstallment) {
      await db.transactions.add({
        id: await testId(),
        name: name.trim(),
        price: Number(price) / count,
        currency,
        date,
        type: 'expense',
        categoryId,
        importance,
        isRecurring: false,
        installmentIndex: 1,
        installmentTotal: count,
        account,
        createdAt: new Date().toISOString(),
      });
    }

    onClose();
  }

  const inputClass =
    'w-full bg-[#1e1e35] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560] transition-colors text-sm';
  const labelClass =
    'block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide';

  const accountOptions = accountList.filter((a) => !a.isArchived).map((a) => ({ value: a.id, label: a.name }));
  const categoryOptions = filteredCategories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[430px] bg-[#12122a] rounded-t-3xl max-h-[92dvh] overflow-y-auto scrollbar-hide">

        {/* Header */}
        <div className="sticky top-0 bg-[#12122a] flex items-center justify-between px-5 pt-5 pb-3 z-10">
          <h2 className="text-lg font-semibold text-white">{prefill ? 'Quick Add' : 'New Transaction'}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1e1e35] text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-5">

          {/* Type toggle */}
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  type === opt.value
                    ? `${opt.color} text-white shadow-lg scale-[1.03]`
                    : 'bg-[#1e1e35] text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <input
              className={inputClass}
              placeholder={type === 'income' ? 'e.g. Monthly salary, Freelance…' : 'e.g. Grocery run, Rent…'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {suggestions.length > 0 && (
              <div className="mt-1 rounded-xl overflow-hidden border border-[#2e2e4e] bg-[#1a1a35]">
                {suggestions.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onPointerDown={() => {
                      setName(s.name);
                      if (s.categoryId) setCategoryId(s.categoryId);
                      if (s.importance && type === 'expense') setImportance(s.importance);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 active:bg-[#2e2e4e] transition-colors touch-manipulation border-b border-[#2e2e4e] last:border-b-0"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount — full width, currency pills below */}
          <div>
            <label className={labelClass}>Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                {getCurrencySymbol(currency)}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className={`${inputClass} ${getCurrencySymbol(currency).length < 3 ? "pl-8" : "pl-12"}`}
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            {/* Currency pills — separate row, never squashes the input */}
            {enabledCurrencies.length > 1 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {enabledCurrencies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCurrency(c); setCurrencyLocked(true); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      currency === c
                        ? 'bg-[#e94560] border-[#e94560] text-white'
                        : 'bg-[#1e1e35] border-[#2e2e4e] text-slate-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {perPayment !== null && (
              <p className="mt-1.5 text-xs font-medium text-[#a78bfa] pl-1">
                {installmentCount} × {getCurrencySymbol(currency)}{perPayment.toFixed(2)} / {installmentInterval}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Category — hidden for transfer, filtered by type */}
          {type !== 'transfer' && categoryOptions.length > 0 && (
            <div>
              <label className={labelClass}>Category</label>
              <Select
                value={categoryId}
                onChange={setCategoryId}
                options={categoryOptions}
              />
            </div>
          )}

          {/* Importance — expense only */}
          {type === 'expense' && (
            <div>
              <label className={labelClass}>Importance</label>
              <div className="flex gap-2">
                {IMPORTANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setImportance(opt.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                      importance === opt.value
                        ? 'border-transparent text-white'
                        : 'border-[#2e2e4e] text-slate-400 hover:text-white bg-[#1e1e35]'
                    }`}
                    style={importance === opt.value ? { backgroundColor: opt.color } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account — single for expense/income, two for transfer */}
          <div className={type === 'transfer' ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <label className={labelClass}>{type === 'transfer' ? 'From' : 'Account'}</label>
              <Select
                value={account}
                onChange={(v) => setAccount(v as Account)}
                options={accountOptions}
              />
            </div>
            {type === 'transfer' && (
              <div>
                <label className={labelClass}>To</label>
                <Select
                  value={toAccount}
                  onChange={(v) => setToAccount(v as Account)}
                  options={accountOptions}
                />
              </div>
            )}
          </div>

          {/* Recurring + Installment — mutually exclusive, expense only for installment */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => { const next = !isRecurring; setIsRecurring(next); if (next) setIsInstallment(false); }}
              disabled={isInstallment}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm border transition-all ${
                isRecurring
                  ? 'border-[#e94560] text-[#e94560] bg-[#e94560]/10'
                  : isInstallment
                  ? 'border-[#2e2e4e] text-slate-600 bg-[#1e1e35] opacity-40 cursor-not-allowed'
                  : 'border-[#2e2e4e] text-slate-400 bg-[#1e1e35] hover:text-white'
              }`}
            >
              <RefreshCw size={14} className={isRecurring ? 'animate-spin' : ''} />
              Recurring
            </button>
            {isRecurring && (
              <div className="flex gap-2">
                {RECURRING_INTERVALS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecurringInterval(opt.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      recurringInterval === opt.value
                        ? 'border-[#e94560] bg-[#e94560]/20 text-[#e94560]'
                        : 'border-[#2e2e4e] text-slate-400 bg-[#1e1e35]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Installment — expense only */}
            {type === 'expense' && (<>
              <button
                type="button"
                onClick={() => { const next = !isInstallment; setIsInstallment(next); if (next) setIsRecurring(false); }}
                disabled={isRecurring}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm border transition-all ${
                  isInstallment
                    ? 'border-[#a78bfa] text-[#a78bfa] bg-[#a78bfa]/10'
                    : isRecurring
                    ? 'border-[#2e2e4e] text-slate-600 bg-[#1e1e35] opacity-40 cursor-not-allowed'
                    : 'border-[#2e2e4e] text-slate-400 bg-[#1e1e35] hover:text-white'
                }`}
              >
                <CreditCard size={14} />
                Installment
              </button>
              {isInstallment && (
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className={labelClass}>Payments</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="2"
                      className={inputClass + ' text-center'}
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(e.target.value)}
                    />
                  </div>
                  <span className="text-slate-500 text-sm pb-3">every</span>
                  <div className="flex-[2]">
                    <label className={labelClass}>Interval</label>
                    <div className="flex gap-1.5">
                      {INSTALLMENT_INTERVALS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setInstallmentInterval(opt.value)}
                          className={`flex-1 py-3 rounded-xl text-xs font-medium border transition-all ${
                            installmentInterval === opt.value
                              ? 'border-[#a78bfa] bg-[#a78bfa]/20 text-[#a78bfa]'
                              : 'border-[#2e2e4e] text-slate-400 bg-[#1e1e35]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>)}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className={`w-full py-4 text-white font-semibold rounded-2xl transition-colors mt-2 ${
              type === 'income'
                ? 'bg-green-500 hover:bg-green-600'
                : type === 'transfer'
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-[#e94560] hover:bg-[#d63651]'
            }`}
          >
            Save {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        </form>
      </div>
    </div>
  );
}
