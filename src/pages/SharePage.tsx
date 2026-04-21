import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { drawCard, decodeShareData } from '../utils/shareCard';

export default function SharePage() {
  const { data } = useParams<{ data: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const opts = data ? decodeShareData(data) : null;

  useEffect(() => {
    if (canvasRef.current && opts) drawCard(canvasRef.current, opts, 2);
  }, [opts]);

  if (!opts) {
    return (
      <div className="min-h-dvh bg-[#0e0e20] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Invalid or expired share link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0e0e20] flex flex-col items-center justify-center px-6 gap-6">
      <canvas
        ref={canvasRef}
        className="w-full max-w-sm rounded-2xl shadow-2xl"
        style={{ imageRendering: 'auto' }}
      />
      <p className="text-xs text-slate-600 tracking-widest uppercase">shared via sipali</p>
    </div>
  );
}
