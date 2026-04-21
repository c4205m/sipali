import { useState, useEffect, useRef } from 'react';
import { X, Share2, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Transaction, Category } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { formatCurrency, convertCurrency } from '../utils/currency';

interface Split { name: string; amount: string }

interface CardOpts {
  name: string; amount: string; sign: string;
  date: string; type: string; category?: string;
  typeColor: string; splits: Split[]; displayCurrency: string;
}

interface Props {
  transaction: Transaction;
  category?: Category;
  onClose: () => void;
}

const TYPE_COLORS = { expense: '#f87171', income: '#4ade80', transfer: '#60a5fa' } as const;
const TYPE_LABELS = { expense: 'Expense',  income: 'Income',  transfer: 'Transfer' } as const;
const TYPE_SIGNS  = { expense: '−',        income: '+',       transfer: '⇄' } as const;

// ─── Canvas card generator ─────────────────────────────────────────────────

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number | [number, number, number, number],
) {
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

function drawCard(canvas: HTMLCanvasElement, opts: CardOpts, scale = 2) {
  const { name, amount, sign, date, type, category, typeColor, splits, displayCurrency } = opts;

  const hasSplits = splits.some((s) => s.name.trim());
  const W = 400;
  const BASE_H  = 210;
  const SPLIT_HEADER_H = hasSplits ? 52 : 0;
  const SPLIT_ROW_H    = 40;
  const validSplits    = splits.filter((s) => s.name.trim());
  const H = BASE_H + SPLIT_HEADER_H + validSplits.length * SPLIT_ROW_H;

  canvas.width  = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  const font = (w: string, size: number) =>
    `${w} ${size}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif`;

  // ── Background ──────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
  bg.addColorStop(0, '#1e1e38');
  bg.addColorStop(1, '#0e0e20');
  ctx.fillStyle = bg;
  drawRoundRect(ctx, 0, 0, W, H, 20);
  ctx.fill();
  ctx.clip();

  // ── Subtle inner glow border ─────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  drawRoundRect(ctx, 0.5, 0.5, W - 1, H - 1, 20);
  ctx.stroke();

  // ── Top accent bar (type color) ──────────────────────────────────────────
  const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
  accentGrad.addColorStop(0, typeColor);
  accentGrad.addColorStop(1, typeColor + '00');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, W, 4);

  // ── Faint radial glow top-left ───────────────────────────────────────────
  const glow = ctx.createRadialGradient(60, 40, 0, 60, 40, 120);
  glow.addColorStop(0, typeColor + '18');
  glow.addColorStop(1, typeColor + '00');
  ctx.fillStyle = glow;
  drawRoundRect(ctx, 0, 0, W, H, 20);
  ctx.fill();

  // ── Logo "sipali" ─────────────────────────────────────────────────────────
  ctx.font = font('600', 13);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText('sipali', 24, 34);

  // ── Type badge ────────────────────────────────────────────────────────────
  const badge = type.toUpperCase();
  ctx.font = font('600', 10);
  const bw = ctx.measureText(badge).width + 18;
  const bx = W - bw - 20, by = 20, bh = 20;
  ctx.fillStyle = typeColor + '22';
  drawRoundRect(ctx, bx, by, bw, bh, 6);
  ctx.fill();
  ctx.fillStyle = typeColor;
  ctx.textAlign = 'center';
  ctx.fillText(badge, bx + bw / 2, by + 13.5);
  ctx.textAlign = 'left';

  // ── Amount ────────────────────────────────────────────────────────────────
  ctx.font = font('700', 38);
  ctx.fillStyle = typeColor;
  ctx.fillText(`${sign}${amount}`, 24, 90);

  // ── Transaction name ──────────────────────────────────────────────────────
  const displayName = name.length > 32 ? name.slice(0, 32) + '…' : name;
  ctx.font = font('600', 16);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillText(displayName, 24, 120);

  // ── Date · category ───────────────────────────────────────────────────────
  const meta = [date, category].filter(Boolean).join('  ·  ');
  ctx.font = font('400', 12);
  ctx.fillStyle = '#475569';
  ctx.fillText(meta, 24, 142);

  // ── Divider ───────────────────────────────────────────────────────────────
  const divY = 164;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, divY);
  ctx.lineTo(W - 24, divY);
  ctx.stroke();

  // ── Split section ─────────────────────────────────────────────────────────
  if (hasSplits) {
    ctx.font = font('500', 10);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('SPLIT WITH', 24, divY + 20);

    validSplits.forEach((s, i) => {
      const rowY = divY + 40 + i * SPLIT_ROW_H;

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      drawRoundRect(ctx, 20, rowY - 14, W - 40, 28, 8);
      ctx.fill();

      ctx.font = font('500', 13);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(s.name, 32, rowY + 4);

      const shareDisplay = s.amount
        ? formatCurrency(Number(s.amount), displayCurrency)
        : '—';
      ctx.font = font('600', 13);
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'right';
      ctx.fillText(shareDisplay, W - 32, rowY + 4);
      ctx.textAlign = 'left';
    });
  }

  // ── Footer branding ───────────────────────────────────────────────────────
  const footerY = H - 14;
  ctx.font = font('400', 10);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.textAlign = 'right';
  ctx.fillText('shared via sipali', W - 24, footerY);
  ctx.textAlign = 'left';
}

async function generateCard(opts: CardOpts): Promise<Blob> {
  const canvas = document.createElement('canvas');
  drawCard(canvas, opts, 2);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

// ─── Modal ─────────────────────────────────────────────────────────────────

export default function ShareModal({ transaction: t, category, onClose }: Props) {
  const { displayCurrency } = useSettings();
  const { base, rates }     = useExchangeRates();

  const [splitting, setSplitting] = useState(false);
  const [splits,    setSplits]    = useState<Split[]>([{ name: '', amount: '' }]);
  const [busy,      setBusy]      = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const converted = convertCurrency(t.price, t.currency ?? displayCurrency, displayCurrency, rates, base);
  const formatted  = formatCurrency(converted, displayCurrency);
  const typeColor  = TYPE_COLORS[t.type];
  const sign       = TYPE_SIGNS[t.type];
  const dateStr    = format(parseISO(t.date), 'MMM d, yyyy');
  const dateExportStr    = format(parseISO(t.date), 'MM-dd-yyyy');

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
  function addSplit()    { setSplits((p) => [...p, { name: '', amount: '' }]); }
  function removeSplit(i: number) { setSplits((p) => p.filter((_, idx) => idx !== i)); }

  async function handleShare() {
    setBusy(true);
    try {
      const blob = await generateCard(cardOpts);
      const file = new File([blob], `Transaction-${cardOpts.name}-${dateExportStr}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t.name });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Transaction-${cardOpts.name}-${dateExportStr}.png`; a.click();
        URL.revokeObjectURL(url);
      }
      onClose();
    } catch { /* user cancelled */ }
    finally { setBusy(false); }
  }

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

        {/* Share button */}
        <button
          onPointerDown={handleShare}
          disabled={busy}
          className="w-full py-4 bg-[#e94560] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation transition-colors active:bg-[#d63651]"
        >
          <Share2 size={16} />
          {busy ? 'Generating…' : 'Generate & Share'}
        </button>
      </div>
    </div>
  );
}
