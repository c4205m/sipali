import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Share2, Plus, Trash2, Copy, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Transaction, Category } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { formatCurrency, convertCurrency } from '../utils/currency';
import { drawCard, encodeShareData } from '../utils/shareCard';
import type { Split, CardOpts } from '../utils/shareCard';

interface Props {
  transaction: Transaction;
  category?: Category;
  onClose: () => void;
}

const TYPE_COLORS = { expense: '#f87171', income: '#4ade80', transfer: '#60a5fa' } as const;
const TYPE_LABELS = { expense: 'Expense',  income: 'Income',  transfer: 'Transfer' } as const;
const TYPE_SIGNS  = { expense: '−',        income: '+',       transfer: '⇄' } as const;

export default function ShareModal({ transaction: t, category, onClose }: Props) {
  const { displayCurrency } = useSettings();
  const { base, rates }     = useExchangeRates();

  const [splitting, setSplitting] = useState(false);
  const [splits,    setSplits]    = useState<Split[]>([{ name: '', amount: '' }]);
  const [busy,      setBusy]      = useState(false);
  const [copied,    setCopied]    = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const converted = convertCurrency(t.price, t.currency ?? displayCurrency, displayCurrency, rates, base);
  const formatted  = formatCurrency(converted, displayCurrency);
  const typeColor  = TYPE_COLORS[t.type];
  const sign       = TYPE_SIGNS[t.type];
  const dateStr    = format(parseISO(t.date), 'MMM d, yyyy');

  const cardOpts: CardOpts = {
    name: t.name, amount: formatted, sign, date: dateStr,
    type: TYPE_LABELS[t.type], category: category?.name, typeColor,
    splits: splitting ? splits : [], displayCurrency,
  };

  useEffect(() => {
    if (previewRef.current) drawCard(previewRef.current, cardOpts, 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitting, splits, formatted]);

  function updateSplit(i: number, field: keyof Split, value: string) {
    setSplits((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }
  function addSplit()             { setSplits((p) => [...p, { name: '', amount: '' }]); }
  function removeSplit(i: number) { setSplits((p) => p.filter((_, idx) => idx !== i)); }

  function buildLink() {
    return `${window.location.origin}/share/${encodeShareData(cardOpts)}`;
  }

  async function handleShare() {
    setBusy(true);
    try {
      const url  = buildLink();
      const text = `Check out this transaction: ${sign}${formatted} — ${t.name} (${dateStr})`;
      await navigator.share({ title: t.name, text, url });
    } catch { /* user cancelled */ }
    finally { setBusy(false); }
  }

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(buildLink());
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [buildLink]);

  const inputClass =
    'w-full bg-[#12122a] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560] transition-colors text-sm';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[430px] bg-[#12122a] rounded-t-3xl px-5 pt-5 pb-8 space-y-4 max-h-[85dvh] overflow-y-auto scrollbar-hide">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Share Transaction</h2>
          <button onPointerDown={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1e1e35] text-slate-400 touch-manipulation">
            <X size={16} />
          </button>
        </div>

        {/* Live card preview */}
        <canvas
          ref={previewRef}
          className="w-full rounded-2xl"
          style={{ imageRendering: 'auto' }}
        />

        {/* Split toggle */}
        <button
          onPointerDown={() => setSplitting((s) => !s)}
          className={`w-full py-3 rounded-xl text-sm font-medium border transition-all touch-manipulation ${
            splitting
              ? 'border-[#e94560] text-[#e94560] bg-[#e94560]/10'
              : 'border-[#2e2e4e] text-slate-400 bg-[#1e1e35]'
          }`}
        >
          {splitting ? 'Splitting with others ✓' : 'Split with someone?'}
        </button>

        {/* Split entries */}
        {splitting && (
          <div className="space-y-3">
            {splits.map((s, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    className={inputClass}
                    placeholder={`Dividend ${i + 1}`}
                    value={s.name}
                    onChange={(e) => updateSplit(i, 'name', e.target.value)}
                    autoFocus={i === 0}
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    className={inputClass}
                    placeholder={`Their share (${displayCurrency})`}
                    value={s.amount}
                    onChange={(e) => updateSplit(i, 'amount', e.target.value)}
                  />
                </div>
                {splits.length > 1 && (
                  <button
                    onPointerDown={() => removeSplit(i)}
                    className="mt-3 p-2 text-slate-600 active:text-red-400 touch-manipulation"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
            <button
              onPointerDown={addSplit}
              className="flex items-center gap-1.5 text-xs text-[#e94560] touch-manipulation"
            >
              <Plus size={13} /> Add another person
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onPointerDown={handleShare}
            disabled={busy}
            className="flex-1 py-4 bg-[#e94560] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation transition-colors active:bg-[#d63651]"
          >
            <Share2 size={16} />
            {busy ? 'Opening…' : 'Share'}
          </button>
          <button
            onPointerDown={handleCopy}
            className="w-14 py-4 bg-[#1e1e35] border border-[#2e2e4e] text-slate-300 font-semibold rounded-2xl flex items-center justify-center touch-manipulation transition-colors active:bg-[#2e2e4e]"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
