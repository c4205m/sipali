import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, RefreshCw, Download, Upload, Zap, HelpCircle, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { db } from '../db/db';
import { useCategories } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { useTransactions } from '../hooks/useTransactions';
import { fetchAndCacheRates } from '../utils/rates';
import { getCurrencySymbol } from '../utils/currency';
import { convertCurrency, formatCurrency } from '../utils/currency';
import { isApplePlatform } from '../utils/platform';
import { ALL_CURRENCIES, ALL_HISTORY_FIELDS, DEFAULT_HISTORY_FIELDS } from '../types';
import type { Category, AccountRecord, HistoryField } from '../types';
import { useAccounts } from '../hooks/useAccounts';
import MoveEntriesModal from '../components/MoveEntriesModal';
import DeleteAccountModal from '../components/DeleteAccountModal';

const PRESET_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#34d399',
  '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8', '#e94560',
];

export default function Settings() {
  const categories    = useCategories();
  const settings      = useSettings();
  const exchangeRates = useExchangeRates();
  const transactions  = useTransactions();
  const accounts      = useAccounts();
  const { base, rates } = useExchangeRates();

  const [editing,         setEditing]         = useState<Category | null>(null);
  const [adding,          setAdding]          = useState<'expense' | 'income' | null>(null);
  const [catTab,          setCatTab]          = useState<'expense' | 'income'>('expense');
  const [name,            setName]            = useState('');
  const [color,           setColor]           = useState(PRESET_COLORS[0]);
  const [refreshing,      setRefreshing]      = useState(false);
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [importStatus,    setImportStatus]    = useState('');
  const [shortcutName,    setShortcutName]    = useState('');
  const [showShortcutInfo, setShowShortcutInfo] = useState(false);
  const [editingAccount,   setEditingAccount]   = useState<AccountRecord | null>(null);
  const [accountName,      setAccountName]      = useState('');
  const [addingAccount,    setAddingAccount]    = useState(false);
  const [deletingAccount,  setDeletingAccount]  = useState<AccountRecord | null>(null);
  const [moveEntriesAcc,   setMoveEntriesAcc]   = useState<AccountRecord | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShortcutName(settings.iosShortcutName ?? '');
  }, [settings.iosShortcutName]);

  const inputClass =
    'w-full bg-[#12122a] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560] transition-colors text-sm';

  // ── Category helpers ───────────────────────────────────────────
  const expenseCats = categories.filter((c) => (c.categoryType ?? 'expense') === 'expense');
  const incomeCats  = categories.filter((c) => c.categoryType === 'income');
  const visibleCats = catTab === 'expense' ? expenseCats : incomeCats;

  function openEdit(cat: Category) {
    setEditing(cat); setAdding(null); setName(cat.name); setColor(cat.color);
  }
  function openAdd() {
    setAdding(catTab); setEditing(null); setName(''); setColor(PRESET_COLORS[0]);
  }
  function cancelForm() { setEditing(null); setAdding(null); }

  async function saveEdit() {
    if (!name.trim() || !editing) return;
    await db.categories.update(editing.id, { name: name.trim(), color });
    cancelForm();
  }
  async function saveAdd() {
    if (!name.trim()) return;
    await db.categories.add({
      id: crypto.randomUUID(), name: name.trim(), color, icon: 'Tag',
      categoryType: adding ?? catTab,
    });
    cancelForm();
  }
  async function deleteCategory(id: string) {
    const count = await db.transactions.where('categoryId').equals(id).count();
    if (count > 0) { alert(`${count} transaction(s) use this category. Remove them first.`); return; }
    await db.categories.delete(id);
  }

  // ── Currency helpers ──────────────────────────────────────────
  async function setDisplayCurrency(code: string) {
    await db.settings.update('app', { displayCurrency: code });
  }
  async function addCurrency(code: string) {
    if (settings.enabledCurrencies.includes(code)) return;
    await db.settings.update('app', { enabledCurrencies: [...settings.enabledCurrencies, code] });
    setShowAddCurrency(false);
  }
  async function removeCurrency(code: string) {
    if (settings.enabledCurrencies.length <= 1) return;
    const next = settings.enabledCurrencies.filter((c) => c !== code);
    const patch: Partial<typeof settings> = { enabledCurrencies: next };
    if (settings.displayCurrency === code) patch.displayCurrency = next[0];
    await db.settings.update('app', patch);
  }
  async function handleRefreshRates() {
    setRefreshing(true);
    await db.exchangeRates.delete('rates');
    await fetchAndCacheRates();
    setRefreshing(false);
  }

  // ── Import / Export ───────────────────────────────────────────
  async function handleExport() {
    const [txns, cats, sett] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.settings.toArray(),
    ]);
    const payload = JSON.stringify({ version: 1, transactions: txns, categories: cats, settings: sett }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `sipali-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('Reading…');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.transactions || !Array.isArray(data.transactions)) {
        setImportStatus('Invalid file — no transactions array found.');
        return;
      }
      const confirmed = window.confirm(
        `Import ${data.transactions.length} transactions and ${data.categories?.length ?? 0} categories?\n\nThis will REPLACE all existing data.`,
      );
      if (!confirmed) { setImportStatus(''); return; }

      await db.transaction('rw', [db.transactions, db.categories, db.settings], async () => {
        await db.transactions.clear();
        await db.categories.clear();
        await db.transactions.bulkAdd(data.transactions);
        if (data.categories?.length) await db.categories.bulkAdd(data.categories);
        if (data.settings?.length)   await db.settings.bulkPut(data.settings);
      });
      setImportStatus(`Imported ${data.transactions.length} transactions successfully.`);
    } catch {
      setImportStatus('Failed to parse file. Make sure it is a valid sipali backup.');
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  const availableToAdd = ALL_CURRENCIES.filter((c) => !settings.enabledCurrencies.includes(c.code));
  const ratesAge = exchangeRates.updatedAt
    ? formatDistanceToNow(new Date(exchangeRates.updatedAt), { addSuffix: true })
    : null;

  // ── Account helpers ───────────────────────────────────────
  function accountBalance(accountId: string): number {
    const dc = settings.displayCurrency;
    let b = 0;
    for (const t of transactions) {
      if (t.isArchived) continue;
      if (t.isInstallment && !t.installmentIndex) continue;
      const amount = convertCurrency(t.price, t.currency ?? dc, dc, rates, base);
      if (t.account === accountId) {
        if (t.type === 'income')  b += amount;
        if (t.type === 'expense') b -= amount;
      }
    }
    return b;
  }

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  return (
    <>
    <div className="flex flex-col pb-28 pt-6 px-4 gap-4">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      {/* ── Currencies ───────────────────────────────────────────── */}
      <div className="bg-[#1a1a35] rounded-2xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-white">Currencies</h2>

        <div>
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Display in</p>
          <div className="flex gap-2 flex-wrap">
            {settings.enabledCurrencies.map((code) => (
              <button
                key={code}
                onClick={() => setDisplayCurrency(code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                  settings.displayCurrency === code
                    ? 'bg-[#e94560] border-[#e94560] text-white'
                    : 'bg-[#12122a] border-[#2e2e4e] text-slate-400 hover:text-white'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">My currencies</p>
          <div className="space-y-2">
            {settings.enabledCurrencies.map((code) => {
              const info = ALL_CURRENCIES.find((c) => c.code === code);
              return (
                <div key={code} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-white font-medium">{getCurrencySymbol(code)}{' '}{refreshing ? '…' : (exchangeRates.rates[code]?.toFixed(4) ?? '—')}</p>
                      <p className="text-xs text-slate-500">{info?.label ?? code}</p>
                    </div>
                  </div>
                  {settings.enabledCurrencies.length > 1 && (
                    <button onClick={() => removeCurrency(code)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {showAddCurrency ? (
            <div className="mt-3 bg-[#12122a] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">Add currency</p>
                <button onClick={() => setShowAddCurrency(false)}><X size={14} className="text-slate-500" /></button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide">
                {availableToAdd.map((c) => (
                  <button key={c.code} onClick={() => addCurrency(c.code)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#1e1e35] transition-colors text-left"
                  >
                    <span className="text-sm text-slate-400 w-6 text-center">{getCurrencySymbol(c.code)}</span>
                    <span className="text-sm font-medium text-white">{c.code}</span>
                    <span className="text-xs text-slate-500">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddCurrency(true)}
              className="mt-3 flex items-center gap-1.5 text-xs text-[#e94560] hover:text-white transition-colors"
            >
              <Plus size={14} /> Add currency
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-[#2e2e4e]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Exchange rates</p>
              <p className="text-xs text-slate-600 mt-0.5">{ratesAge ? `Updated ${ratesAge}` : 'Not yet fetched'}</p>
            </div>
            <button onClick={handleRefreshRates} disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1">Source: frankfurter.app · Auto-refresh every 24 h</p>
        </div>
      </div>

      {/* ── Categories ───────────────────────────────────────────── */}
      <div className="bg-[#1a1a35] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Categories</h2>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-xs text-[#e94560] hover:text-white transition-colors">
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Expense / Income tabs */}
        <div className="flex gap-1 bg-[#12122a] rounded-xl p-1 mb-3">
          {(['expense', 'income'] as const).map((tab) => (
            <button key={tab} onClick={() => { setCatTab(tab); cancelForm(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                catTab === tab ? 'bg-[#1e1e35] text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {adding === catTab && (
          <CategoryForm name={name} color={color} onNameChange={setName} onColorChange={setColor}
            onSave={saveAdd} onCancel={cancelForm} inputClass={inputClass}
          />
        )}

        <div className="space-y-1">
          {visibleCats.map((cat) => (
            <div key={cat.id}>
              {editing?.id === cat.id ? (
                <CategoryForm name={name} color={color} onNameChange={setName} onColorChange={setColor}
                  onSave={saveEdit} onCancel={cancelForm} inputClass={inputClass}
                />
              ) : (
                <div className="flex items-center gap-3 py-2">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm text-slate-300">{cat.name}</span>
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-500 hover:text-white transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              )}
            </div>
          ))}
          {visibleCats.length === 0 && (
            <p className="text-xs text-slate-600 py-3 text-center">No {catTab} categories yet</p>
          )}
        </div>
      </div>

      {/* ── Accounts ─────────────────────────────────────────────── */}
      <div className="bg-[#1a1a35] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Accounts</h2>
          <button
            onClick={() => { setAddingAccount(true); setAccountName(''); setEditingAccount(null); }}
            className="flex items-center gap-1.5 text-xs text-[#e94560] hover:text-white transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {addingAccount && (
          <AccountForm
            name={accountName}
            onNameChange={setAccountName}
            onSave={async () => {
              if (!accountName.trim()) return;
              await db.accounts.add({ id: crypto.randomUUID(), name: accountName.trim(), isDefault: false });
              setAddingAccount(false);
              setAccountName('');
            }}
            onCancel={() => { setAddingAccount(false); setAccountName(''); }}
            inputClass={inputClass}
          />
        )}

        <div className="space-y-1">
          {activeAccounts.map((acc) => {
            const bal = accountBalance(acc.id);
            return (
              <div key={acc.id}>
                {editingAccount?.id === acc.id ? (
                  <AccountForm
                    name={accountName}
                    onNameChange={setAccountName}
                    onSave={async () => {
                      if (!accountName.trim()) return;
                      await db.accounts.update(acc.id, { name: accountName.trim() });
                      setEditingAccount(null);
                      setAccountName('');
                    }}
                    onCancel={() => { setEditingAccount(null); setAccountName(''); }}
                    inputClass={inputClass}
                  />
                ) : (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">{acc.name}{acc.isDefault && <span className="ml-1.5 text-[10px] text-slate-600 uppercase tracking-wide">default</span>}</p>
                      <p className={`text-xs ${bal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(Math.abs(bal), settings.displayCurrency)}{bal < 0 ? ' deficit' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => { setEditingAccount(acc); setAccountName(acc.name); setAddingAccount(false); }}
                      className="p-1.5 text-slate-500 hover:text-white transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setMoveEntriesAcc(acc)}
                      className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      <ArrowLeftRight size={13} />
                    </button>
                    {!acc.isDefault && (
                      <button
                        onClick={() => setDeletingAccount(acc)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {activeAccounts.length === 0 && (
            <p className="text-xs text-slate-600 py-3 text-center">No accounts yet</p>
          )}
        </div>
      </div>

      {/* ── iOS Shortcuts ────────────────────────────────────────── */}
      {isApplePlatform && (
        <div className="bg-[#1a1a35] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#e94560]" />
              <h2 className="text-sm font-semibold text-white">Shortcuts</h2>
            </div>
            <button
              onClick={() => setShowShortcutInfo((v) => !v)}
              className={`p-1 rounded-full transition-colors ${showShortcutInfo ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <HelpCircle size={15} />
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter the exact name of your Shortcut. When you tap ⚡ on a transaction card, it will run that shortcut with the transaction details as JSON input.
          </p>
          {showShortcutInfo && (
            <div className="rounded-xl border border-[#2e2e4e] overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-[#0f0f1a] px-3 py-2 text-slate-500 uppercase tracking-wide font-medium">
                <span>Field</span><span>Example</span>
              </div>
              {[
                ['name',             'Grocery run'],
                ['amount',           '45.50'],
                ['currency',         'USD'],
                ['type',             'expense / income / transfer'],
                ['account',          'cash / savings / …'],
                ['date',             '2026-04-18'],
                ['isPlan?',           'true / false'],
                ['installmentIndex?', '2'],
                ['installmentCount?', '12'],
              ].map(([field, example]) => (
                <div key={field} className="grid grid-cols-2 px-3 py-2 border-t border-[#2e2e4e] text-slate-400">
                  <span className="font-mono text-[#a78bfa]">{field}</span>
                  <span className="text-slate-500">{example}</span>
                </div>
              ))}
            </div>
          )}
          <input
            className={inputClass}
            placeholder="Shortcut name…"
            value={shortcutName}
            onChange={(e) => setShortcutName(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await db.settings.update('app', { iosShortcutName: shortcutName.trim() || undefined });
              }}
              disabled={shortcutName.trim() === (settings.iosShortcutName ?? '')}
              className="flex-1 py-2.5 bg-[#e94560] disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-opacity"
            >
              Save
            </button>
            {settings.iosShortcutName && (
              <button
                onClick={async () => {
                  await db.settings.update('app', { iosShortcutName: undefined });
                }}
                className="px-4 py-2.5 bg-[#1e1e35] border border-[#2e2e4e] text-slate-400 text-sm rounded-xl"
              >
                Clear
              </button>
            )}
          </div>
          {settings.iosShortcutName && (
            <p className="text-xs text-green-400">Active: {settings.iosShortcutName}</p>
          )}
        </div>
      )}

      {/* ── History autofill ─────────────────────────────────────── */}
      <div className="bg-[#1a1a35] rounded-2xl p-4 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-white">History Autofill</h2>
          <p className="text-xs text-slate-500 mt-0.5">Fields restored when selecting from description history</p>
        </div>
        <div className="space-y-1">
          {ALL_HISTORY_FIELDS.map(({ value, label }) => {
            const enabled = (settings.historyFields ?? DEFAULT_HISTORY_FIELDS).includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={async () => {
                  const current = settings.historyFields ?? DEFAULT_HISTORY_FIELDS;
                  const next = enabled
                    ? current.filter((f) => f !== value)
                    : [...current, value as HistoryField];
                  await db.settings.update('app', { historyFields: next });
                }}
                className="w-full flex items-center justify-between py-2.5 px-1"
              >
                <span className="text-sm text-slate-300">{label}</span>
                <span className={`w-9 h-5 rounded-full transition-colors relative ${enabled ? 'bg-[#e94560]' : 'bg-[#2e2e4e]'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-4' : 'left-0.5'}`} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Import / Export ──────────────────────────────────────── */}
      <div className="bg-[#1a1a35] rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-white">Data</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          All your data lives exclusively in this browser's local storage — nothing is sent to any server or collected anywhere. Clearing browser data or switching devices will erase everything.
        </p>
        <p className="text-xs text-[#e94560]/80 leading-relaxed">
          Back up regularly. Export saves your transactions, categories, and settings as a JSON file you can restore anytime.
        </p>

        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e1e35] hover:bg-[#2e2e4e] border border-[#2e2e4e] text-slate-300 text-sm rounded-xl transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e1e35] hover:bg-[#2e2e4e] border border-[#2e2e4e] text-slate-300 text-sm rounded-xl transition-colors"
          >
            <Upload size={14} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        {importStatus && (
          <p className={`text-xs ${importStatus.startsWith('Imported') ? 'text-green-400' : 'text-red-400'}`}>
            {importStatus}
          </p>
        )}

        <p className="text-xs text-slate-600">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} stored locally ·{' '}
          {categories.length} categories
        </p>
      </div>

      <a
        href="https://github.com/c4205m/sipali"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-[#1a1a35] rounded-2xl p-4 text-slate-300 active:bg-[#2e2e4e] transition-colors"
      >
        <ExternalLink size={16} className="shrink-0" />
        <span className="text-sm">View on GitHub</span>
      </a>
    </div>

    {moveEntriesAcc && (
      <MoveEntriesModal
        account={moveEntriesAcc}
        accounts={activeAccounts}
        onClose={() => setMoveEntriesAcc(null)}
      />
    )}

    {deletingAccount && (
      <DeleteAccountModal
        account={deletingAccount}
        balance={accountBalance(deletingAccount.id)}
        displayCurrency={settings.displayCurrency}
        txCount={transactions.filter((t) => !t.isArchived && (t.account === deletingAccount.id || t.toAccount === deletingAccount.id)).length}
        onClose={() => setDeletingAccount(null)}
      />
    )}
    </>
  );
}

function AccountForm({ name, onNameChange, onSave, onCancel, inputClass }: {
  name: string;
  onNameChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  inputClass: string;
}) {
  return (
    <div className="bg-[#12122a] rounded-xl p-3 mb-3 space-y-2">
      <input className={inputClass} placeholder="Account name" value={name} onChange={(e) => onNameChange(e.target.value)} autoFocus />
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#e94560] text-white text-sm rounded-xl">
          <Check size={14} /> Save
        </button>
        <button onClick={onCancel} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#2e2e4e] text-slate-400 text-sm rounded-xl">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}

function CategoryForm({ name, color, onNameChange, onColorChange, onSave, onCancel, inputClass }: {
  name: string; color: string;
  onNameChange: (v: string) => void; onColorChange: (v: string) => void;
  onSave: () => void; onCancel: () => void; inputClass: string;
}) {
  return (
    <div className="bg-[#12122a] rounded-xl p-3 mb-3 space-y-3">
      <input className={inputClass} placeholder="Category name" value={name} onChange={(e) => onNameChange(e.target.value)} autoFocus />
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button key={c} type="button" onClick={() => onColorChange(c)}
            className="w-7 h-7 rounded-full transition-transform hover:scale-110"
            style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#e94560] text-white text-sm rounded-xl">
          <Check size={14} /> Save
        </button>
        <button onClick={onCancel} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#2e2e4e] text-slate-400 text-sm rounded-xl">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}
