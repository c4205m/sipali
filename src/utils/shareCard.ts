import { formatCurrency } from './currency';

export interface Split { name: string; amount: string }

export interface CardOpts {
  name: string; amount: string; sign: string;
  date: string; type: string; category?: string;
  typeColor: string; splits: Split[]; displayCurrency: string;
}

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

export function drawCard(canvas: HTMLCanvasElement, opts: CardOpts, scale = 2) {
  const { name, amount, sign, date, type, category, typeColor, splits, displayCurrency } = opts;

  const hasSplits = splits.some((s) => s.name.trim());
  const W = 400;
  const BASE_H         = 210;
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

  const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
  bg.addColorStop(0, '#1e1e38');
  bg.addColorStop(1, '#0e0e20');
  ctx.fillStyle = bg;
  drawRoundRect(ctx, 0, 0, W, H, 20);
  ctx.fill();
  ctx.clip();

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  drawRoundRect(ctx, 0.5, 0.5, W - 1, H - 1, 20);
  ctx.stroke();

  const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
  accentGrad.addColorStop(0, typeColor);
  accentGrad.addColorStop(1, typeColor + '00');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, W, 4);

  const glow = ctx.createRadialGradient(60, 40, 0, 60, 40, 120);
  glow.addColorStop(0, typeColor + '18');
  glow.addColorStop(1, typeColor + '00');
  ctx.fillStyle = glow;
  drawRoundRect(ctx, 0, 0, W, H, 20);
  ctx.fill();

  ctx.font = font('600', 13);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText('sipali', 24, 34);

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

  ctx.font = font('700', 38);
  ctx.fillStyle = typeColor;
  ctx.fillText(`${sign}${amount}`, 24, 90);

  const displayName = name.length > 32 ? name.slice(0, 32) + '…' : name;
  ctx.font = font('600', 16);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillText(displayName, 24, 120);

  const meta = [date, category].filter(Boolean).join('  ·  ');
  ctx.font = font('400', 12);
  ctx.fillStyle = '#475569';
  ctx.fillText(meta, 24, 142);

  const divY = 164;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, divY);
  ctx.lineTo(W - 24, divY);
  ctx.stroke();

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

      const shareDisplay = s.amount ? formatCurrency(Number(s.amount), displayCurrency) : '—';
      ctx.font = font('600', 13);
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'right';
      ctx.fillText(shareDisplay, W - 32, rowY + 4);
      ctx.textAlign = 'left';
    });
  }

  const footerY = H - 14;
  ctx.font = font('400', 10);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.textAlign = 'right';
  ctx.fillText('shared via sipali', W - 24, footerY);
  ctx.textAlign = 'left';
}

export function encodeShareData(opts: CardOpts): string {
  return btoa(encodeURIComponent(JSON.stringify(opts)));
}

export function decodeShareData(encoded: string): CardOpts | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}
