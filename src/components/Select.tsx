import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  className?: string;
}

export default function Select({ value, onChange, options, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  function openDropdown() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const listH = Math.min(options.length * 44 + 8, 220);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= listH ? rect.bottom + 4 : rect.top - listH - 4;
    setDropStyle({ top, left: rect.left, width: rect.width, maxHeight: 220 });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className={`w-full flex items-center justify-between bg-[#1e1e35] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e94560] transition-colors text-sm ${className}`}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 ml-2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={listRef}
            className="fixed z-[9999] overflow-y-auto scrollbar-hide rounded-xl border border-[#2e2e4e] bg-[#1a1a35] shadow-2xl py-1"
            style={dropStyle}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#2e2e4e] transition-colors text-left"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className={opt.value === value ? 'text-white font-medium' : 'text-slate-300'}>
                  {opt.label}
                </span>
                {opt.value === value && <Check size={13} className="text-[#e94560] shrink-0" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
