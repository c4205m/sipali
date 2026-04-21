import { useState } from 'react';
import { db } from '../db/db';
import type { AccountRecord } from '../types';

interface Props {
  account: AccountRecord;
  accounts: AccountRecord[];
  onClose: () => void;
}

export default function MoveEntriesModal({ account, accounts, onClose }: Props) {
  const others = accounts.filter((a) => a.id !== account.id);
  const [targetId, setTargetId] = useState<string>(others[0]?.id ?? '');
  const [busy, setBusy] = useState(false);

  async function doMove() {
    if (!targetId || busy) return;
    setBusy(true);
    try {
      await db.transactions.where('account').equals(account.id).modify({ account: targetId });
      await db.transactions.filter((t) => t.toAccount === account.id).modify({ toAccount: targetId });
      onClose();
    } catch {
      setBusy(false);
    }
  }

  if (others.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
        <div className="bg-[#1a1a35] rounded-2xl w-full max-w-sm p-5 space-y-4">
          <p className="text-base font-semibold text-white">Move entries from &quot;{account.name}&quot;</p>
          <p className="text-sm text-slate-400">No other accounts to move entries to.</p>
          <button onClick={onClose} className="w-full py-2.5 bg-[#2e2e4e] text-slate-400 text-sm rounded-xl">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-[#1a1a35] rounded-2xl w-full max-w-sm p-5 space-y-4">
        <div>
          <p className="text-base font-semibold text-white">Move entries from &quot;{account.name}&quot;</p>
          <p className="text-xs text-slate-500 mt-1">All transactions will be reassigned. The account is not deleted.</p>
        </div>
        <div className="space-y-1">
          {others.map((a) => (
            <button
              key={a.id}
              onClick={() => setTargetId(a.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                targetId === a.id
                  ? 'bg-[#e94560]/15 border border-[#e94560]/40'
                  : 'bg-[#12122a] active:bg-[#1e1e35]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${targetId === a.id ? 'bg-[#e94560]' : 'bg-slate-600'}`} />
              <span className="text-sm text-white">{a.name}</span>
              {a.isDefault && <span className="text-xs text-slate-600 ml-auto">default</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={doMove}
            disabled={!targetId || busy}
            className="flex-1 py-2.5 bg-[#e94560] disabled:opacity-40 text-white text-sm font-medium rounded-xl"
          >
            {busy ? 'Moving…' : 'Move'}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#2e2e4e] text-slate-400 text-sm rounded-xl">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
