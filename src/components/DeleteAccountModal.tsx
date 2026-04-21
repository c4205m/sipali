import { useState } from 'react';
import { db } from '../db/db';
import { formatCurrency } from '../utils/currency';
import type { AccountRecord } from '../types';

interface Props {
  account: AccountRecord;
  balance: number;
  displayCurrency: string;
  txCount: number;
  onClose: () => void;
}

type Step = 'choose' | 'confirm-delete-all';

export default function DeleteAccountModal({
  account, balance, displayCurrency, txCount, onClose,
}: Props) {
  const [step, setStep] = useState<Step>(txCount === 0 ? 'confirm-delete-all' : 'choose');

  async function doArchive() {
    await db.accounts.update(account.id, { isArchived: true });
    await db.transactions
      .where('account').equals(account.id)
      .filter((t) => t.type !== 'transfer')
      .modify({ isArchived: true });
    onClose();
  }

  async function doDeleteAll() {
    // Delete non-transfer transactions; keep transfers so destination account balances stay intact
    await db.transactions
      .filter((t) => (t.account === account.id || t.toAccount === account.id) && t.type !== 'transfer')
      .delete();
    // Replace deleted account ID with its name so the entry still shows a readable source/destination
    try {
      await db.transactions
        .where('account').equals(account.id)
        .filter((t) => t.type === 'transfer')
        .modify({ account: account.name });
      await db.transactions
        .filter((t) => t.toAccount === account.id && t.type === 'transfer')
        .modify({ toAccount: account.name });
    } catch {
      // non-critical: transfers already deleted above if they existed
    }
    await db.accounts.delete(account.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-0">
      <div className="bg-[#1a1a35] rounded-2xl w-full max-w-sm overflow-hidden">

        {step === 'choose' && (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-base font-semibold text-white">Delete &quot;{account.name}&quot;?</p>
              <p className="text-sm text-slate-500 mt-1">
                {txCount} transaction{txCount !== 1 ? 's' : ''}
                {balance > 0 ? ` · ${formatCurrency(balance, displayCurrency)} balance` : ''}
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={doArchive}
                className="w-full text-left px-4 py-3 rounded-xl bg-[#12122a] active:bg-[#1e1e35] transition-colors"
              >
                <p className="text-sm font-medium text-white">Archive history</p>
                <p className="text-xs text-slate-500 mt-0.5">Keep entries as archived history — excluded from stats</p>
              </button>
              <button
                onClick={() => setStep('confirm-delete-all')}
                className="w-full text-left px-4 py-3 rounded-xl bg-[#12122a] active:bg-[#1e1e35] transition-colors"
              >
                <p className="text-sm font-medium text-red-400">Delete account + all entries</p>
                <p className="text-xs text-slate-500 mt-0.5">Permanently erase everything</p>
              </button>
            </div>
            <button onClick={onClose} className="w-full py-2 text-sm text-slate-500">
              Cancel
            </button>
          </div>
        )}

        {step === 'confirm-delete-all' && (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-base font-semibold text-white">
                {txCount === 0 ? `Delete "${account.name}"?` : 'Delete everything?'}
              </p>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {txCount > 0
                  ? `${txCount} transaction${txCount !== 1 ? 's' : ''} will be permanently erased. This cannot be undone.`
                  : 'This cannot be undone.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={doDeleteAll} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl">
                Delete
              </button>
              <button
                onClick={() => txCount === 0 ? onClose() : setStep('choose')}
                className="flex-1 py-2.5 bg-[#2e2e4e] text-slate-400 text-sm rounded-xl"
              >
                {txCount === 0 ? 'Cancel' : 'Back'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
