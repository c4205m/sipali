import { useState, useRef, useEffect } from 'react';
import { RefreshCw, Trash2, Share2, CreditCard, Zap, ArrowLeftRight } from 'lucide-react';
import type { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/currency';
import { useAccountMap } from '../hooks/useAccounts';

const ACTION_W = 60;

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

interface SwipeAction {
  icon: React.ReactNode;
  bg: string;
  onAction: () => void;
}

function SwipeCard({
  isOpen, onOpen, onClose, onTap, actions, outerClass, innerClass, children,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTap?: () => void;
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
    else if (Math.abs(dx) < 8 && !isOpen) onTap?.();
    else onClose();
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${outerClass ?? ''}`}>
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

interface Props {
  transaction: Transaction;
  categoryMap: Record<string, Category>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTap: () => void;
  onShare: () => void;
  onDelete: () => void;
  onShortcut?: () => void;
}

export default function TransactionCard({
  transaction: t, categoryMap,
  isOpen, onOpen, onClose, onTap,
  onShare, onDelete, onShortcut,
}: Props) {
  const accountMap = useAccountMap();
  const cat        = categoryMap[t.categoryId];
  const isPlan     = !!t.isInstallment;
  const isArchived = !!t.isArchived && t.type !== 'transfer';
  const isDisabled = isPlan || isArchived;

  const actions: SwipeAction[] = [
    { icon: <Share2 size={16} />, bg: '#334155', onAction: onShare },
    ...(onShortcut ? [{ icon: <Zap size={16} />, bg: '#3ca389', onAction: onShortcut }] : []),
    { icon: <Trash2 size={16} />, bg: '#ef4444', onAction: onDelete },
  ];

  return (
    <SwipeCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      onTap={onTap}
      actions={actions}
      outerClass={isDisabled ? 'border border-[#a78bfa]/20' : ''}
      innerClass={`flex items-center gap-3 px-4 py-3 ${isDisabled ? 'bg-[#0f0f19]' : 'bg-[#1a1a35]'}`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
        style={{ backgroundColor: isDisabled ? '#a78bfa22' : t.transferCounterpart ? '#3b82f622' : (cat?.color ? `${cat.color}22` : '#2e2e4e') }}
      >
        <span style={{ color: isDisabled ? '#a78bfa' : t.transferCounterpart ? '#60a5fa' : (cat?.color ?? '#94a3b8') }}>
          {isPlan ? <CreditCard size={15} /> : t.transferCounterpart ? <ArrowLeftRight size={15} /> : t.name.charAt(0).toUpperCase()}
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
            : t.transferCounterpart
            ? <span className="inline-flex items-center gap-0.5 text-blue-400">
                <ArrowLeftRight size={9} />
                {t.type === 'expense' ? `To: ${t.transferCounterpart}` : `From: ${t.transferCounterpart}`}
              </span>
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
}

export { TYPE_COLORS, TYPE_SIGNS };
