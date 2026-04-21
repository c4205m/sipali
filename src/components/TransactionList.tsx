import { useState, useRef, useEffect } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { RefreshCw, Trash2, Share2, CreditCard, Zap } from 'lucide-react';
import { db } from '../db/db';
import type { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/currency';
import { useSettings } from '../hooks/useSettings';
import { useAccountMap } from '../hooks/useAccounts';
import { isApplePlatform } from '../utils/platform';
import ShareModal from './ShareModal';

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

const TYPE_COLORS: Record<string, string> = {
  expense:  'text-red-400',
  income:   'text-green-400',
  transfer: 'text-blue-400',
};

const TYPE_SIGNS: Record<string, string> = {
  expense:  '−',
  income:   '+',
  transfer: '⇄',
};

// ── Swipe-to-reveal card ──────────────────────────────────────────────────────

const ACTION_W = 60;

interface SwipeAction {
  icon: React.ReactNode;
  bg: string;
  onAction: () => void;
}

function SwipeCard({
  isOpen, onOpen, onClose, actions, outerClass, innerClass, children,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  actions: SwipeAction[];
  outerClass?: string;
  innerClass?: string;
  children: React.ReactNode;
}) {
  const SNAP = actions.length * ACTION_W;
  const startXRef = useRef(0);
  const baseXRef  = useRef(0);
  const [x, setX]           = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setX(isOpen ? -SNAP : 0);
  }, [isOpen, SNAP]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startXRef.current = e.clientX;
    baseXRef.current  = isOpen ? -SNAP : 0;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = e.clientX - startXRef.current;
    setX(Math.max(-SNAP, Math.min(0, baseXRef.current + dx)));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    const dx = e.clientX - startXRef.current;
    if (dx < -20) onOpen();
    else onClose();
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${outerClass ?? ''}`}>
      {/* Action buttons — fade + scale in as card slides */}
      <div
        className="absolute right-0 inset-y-0 flex z-[1]"
        style={{
          opacity: Math.abs(x) / SNAP,
          transition: dragging ? 'none' : 'opacity 0.2s ease',
        }}
      >
        {actions.map((a, i) => (
          <button
            key={i}
            onPointerDown={(e) => { e.stopPropagation(); a.onAction(); onClose(); }}
            style={{
              width: ACTION_W,
              backgroundColor: a.bg,
              transform: `scale(${0.7 + 0.3 * (Math.abs(x) / SNAP)})`,
              transition: dragging ? 'none' : 'transform 0.2s ease',
            }}
            className="flex items-center justify-center text-white shrink-0 touch-manipulation"
          >
            {a.icon}
          </button>
        ))}
      </div>
      {/* Sliding card content */}
      <div
        className={`relative z-[2] ${innerClass ?? ''}`}
        style={{
          transform:  `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TransactionList({ transactions, categoryMap }: Props) {
  const [sharingTx, setSharingTx] = useState<Transaction | null>(null);
  const [openId,    setOpenId]    = useState<string | null>(null);
  const settings     = useSettings();
  const accountMap   = useAccountMap();
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
            {txns.map((t) => {
              const cat        = categoryMap[t.categoryId];
              const isPlan     = !!t.isInstallment;
              const isArchived = !!t.isArchived && t.type !== 'transfer';
              const isDisabled = isPlan || isArchived;

              const actions: SwipeAction[] = [
                {
                  icon: <Share2 size={16} />,
                  bg: '#334155',
                  onAction: () => setSharingTx(t),
                },
                ...(showShortcut ? [{
                  icon: <Zap size={16} />,
                  bg: '#3ca389',
                  onAction: () => runShortcut(t),
                }] : []),
                {
                  icon: <Trash2 size={16} />,
                  bg: '#ef4444',
                  onAction: () => db.transactions.delete(t.id),
                },
              ];

              return (
                <SwipeCard
                  key={t.id}
                  isOpen={openId === t.id}
                  onOpen={() => setOpenId(t.id)}
                  onClose={() => setOpenId(null)}
                  actions={actions}
                  outerClass={isDisabled ? 'border border-[#a78bfa]/20' : ''}
                  innerClass={`flex items-center gap-3 px-4 py-3 ${isDisabled ? 'bg-[#0f0f19]' : 'bg-[#1a1a35]'}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ backgroundColor: isDisabled ? '#a78bfa22' : (cat?.color ? `${cat.color}22` : '#2e2e4e') }}
                  >
                    <span style={{ color: isDisabled ? '#a78bfa' : (cat?.color ?? '#94a3b8') }}>
                      {isPlan ? <CreditCard size={15} /> : t.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-white truncate">{t.name}</p>
                      {isPlan && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[#a78bfa] bg-[#a78bfa]/15 px-1.5 py-0.5 rounded-md">
                          Plan
                        </span>
                      )}
                      {isArchived && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[#a78bfa] bg-[#a78bfa]/15 px-1.5 py-0.5 rounded-md">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {isPlan
                        ? <span className="text-[#a78bfa]/60">{t.installmentCount} payments · not counted in stats</span>
                        : isArchived
                        ? <span className="text-[#a78bfa]/60">{accountMap[t.account]?.name ?? t.account} · not counted in stats</span>
                        : <>
                            {cat?.name ?? t.type[0].toUpperCase() + t.type.slice(1)}
                            {t.isRecurring && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-[#e94560]">
                                <RefreshCw size={9} /> {t.recurringInterval}
                              </span>
                            )}
                            {t.installmentIndex != null && t.installmentTotal != null && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-[#a78bfa]">
                                <CreditCard size={9} /> {t.installmentIndex}/{t.installmentTotal}
                              </span>
                            )}
                          </>
                      }
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${isDisabled ? 'text-[#a78bfa]/60 line-through' : TYPE_COLORS[t.type]}`}>
                      {isDisabled ? '' : TYPE_SIGNS[t.type]}{formatCurrency(t.price, t.currency ?? 'USD')}
                    </p>
                    <p className="text-xs text-slate-600">{accountMap[t.account]?.name ?? t.account}</p>
                  </div>
                </SwipeCard>
              );
            })}
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
    </>
  );
}
