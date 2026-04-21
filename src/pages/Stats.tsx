import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend as RechartLegend,
  CartesianGrid, Area, AreaChart,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useTransactions } from '../hooks/useTransactions';
import { useCategoryMap } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { useAccountMap } from '../hooks/useAccounts';
import { convertCurrency, formatCurrency } from '../utils/currency';

const TOOLTIP = {
  backgroundColor: '#12122a',
  border: '1px solid #3b3b5c',
  borderRadius: 10,
  color: '#e2e8f0',
  fontSize: 12,
};

// Vivid, distinct palette for donut charts
const PALETTE = [
  '#e94560', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6',
];

export default function Stats() {
  const accountMap   = useAccountMap();
  const transactions = useTransactions().filter(
    (t) => !t.isInstallment && !t.isSkip && !t.isArchived && accountMap[t.account] !== undefined
  );
  const categoryMap  = useCategoryMap();
  const { displayCurrency } = useSettings();
  const { base, rates }     = useExchangeRates();
  const now = new Date();

  function cv(price: number, currency: string): number {
    return convertCurrency(price, currency ?? displayCurrency, displayCurrency, rates, base);
  }
  const fmt = (v: number) => formatCurrency(v, displayCurrency, true);

  const expenseCategoryData = useMemo(() => {
    const m = now.getMonth(), y = now.getFullYear();
    const totals: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      const d = new Date(t.date);
      if (d.getMonth() !== m || d.getFullYear() !== y) continue;
      totals[t.categoryId] = (totals[t.categoryId] ?? 0) + cv(t.price, t.currency ?? displayCurrency);
    }
    return Object.entries(totals)
      .map(([id, value], i) => ({
        name:  categoryMap[id]?.name ?? id,
        value,
        color: categoryMap[id]?.color ?? PALETTE[i % PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [transactions, categoryMap, displayCurrency, rates]);

  const incomeCategoryData = useMemo(() => {
    const m = now.getMonth(), y = now.getFullYear();
    const totals: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type !== 'income') continue;
      const d = new Date(t.date);
      if (d.getMonth() !== m || d.getFullYear() !== y) continue;
      totals[t.categoryId] = (totals[t.categoryId] ?? 0) + cv(t.price, t.currency ?? displayCurrency);
    }
    return Object.entries(totals)
      .map(([id, value], i) => ({
        name:  categoryMap[id]?.name ?? id,
        value,
        color: PALETTE[i % PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [transactions, categoryMap, displayCurrency, rates]);

  const monthlyData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const m = d.getMonth(), y = d.getFullYear();
      let income = 0, expense = 0;
      for (const t of transactions) {
        const td = new Date(t.date);
        if (td.getMonth() !== m || td.getFullYear() !== y) continue;
        const amount = cv(t.price, t.currency ?? displayCurrency);
        if (t.type === 'income')  income  += amount;
        if (t.type === 'expense') expense += amount;
      }
      return { name: format(d, 'MMM'), Income: income, Expense: expense };
    }),
  [transactions, displayCurrency, rates]);

  const dailyData = useMemo(() => {
    const byDate: Record<string, { Spent: number; Earned: number }> = {};
    for (const t of transactions) {
      if (t.type !== 'expense' && t.type !== 'income') continue;
      byDate[t.date] ??= { Spent: 0, Earned: 0 };
      const amount = cv(t.price, t.currency ?? displayCurrency);
      if (t.type === 'expense') byDate[t.date].Spent  += amount;
      else                      byDate[t.date].Earned += amount;
    }
    const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) }).slice(0, now.getDate());
    return days.map((day) => {
      const ds = format(day, 'yyyy-MM-dd');
      return { name: format(day, 'd'), ...(byDate[ds] ?? { Spent: 0, Earned: 0 }) };
    });
  }, [transactions, displayCurrency, rates]);

  const topExpensesByName = useMemo(() => {
    const m = now.getMonth(), y = now.getFullYear();
    const totals: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      const d = new Date(t.date);
      if (d.getMonth() !== m || d.getFullYear() !== y) continue;
      totals[t.name] = (totals[t.name] ?? 0) + cv(t.price, t.currency ?? displayCurrency);
    }
    return Object.entries(totals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 50);
  }, [transactions, displayCurrency, rates]);

  const importanceData = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => {
      const d = subMonths(now, 2 - i);
      const m = d.getMonth(), y = d.getFullYear();
      let need = 0, want = 0, saving = 0;
      for (const t of transactions) {
        if (t.type !== 'expense') continue;
        const td = new Date(t.date);
        if (td.getMonth() !== m || td.getFullYear() !== y) continue;
        const amount = cv(t.price, t.currency ?? displayCurrency);
        if (t.importance === 'need')   need   += amount;
        if (t.importance === 'want')   want   += amount;
        if (t.importance === 'saving') saving += amount;
      }
      return { name: format(d, 'MMM'), Need: need, Want: want, Saving: saving };
    }),
  [transactions, displayCurrency, rates]);

  return (
    <div className="flex flex-col pb-28 pt-6 px-4 gap-5">
      <h1 className="text-xl font-bold text-white">Insights</h1>

      {/* Income vs Expense — bar */}
      <Section title="Income vs Expenses" subtitle="Last 6 months">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} barGap={3} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={42} />
            <Tooltip contentStyle={TOOLTIP} formatter={(value: unknown) => formatCurrency(Number(value ?? 0), displayCurrency)} />
            <RechartLegend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
            <Bar dataKey="Income"  fill="#22c55e" radius={[5, 5, 0, 0]} isAnimationActive={true} />
            <Bar dataKey="Expense" fill="#e94560" radius={[5, 5, 0, 0]} isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Daily area */}
      <Section title="Daily Activity" subtitle="This month">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="gSpent"  x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#e94560" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e94560" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="gEarned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={40} />
            <Tooltip contentStyle={TOOLTIP} formatter={(value: unknown) => formatCurrency(Number(value ?? 0), displayCurrency)} />
            <RechartLegend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
            <Area type="monotone" dataKey="Spent"  stroke="#e94560" strokeWidth={2} fill="url(#gSpent)"  dot={false} activeDot={{ r: 4 }} isAnimationActive={true} />
            <Area type="monotone" dataKey="Earned" stroke="#22c55e" strokeWidth={2} fill="url(#gEarned)" dot={false} activeDot={{ r: 4 }} isAnimationActive={true} />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      {/* Expense by category — donut */}
      <Section title="Spending by Category" subtitle="This month">
        {expenseCategoryData.length === 0 ? <Empty /> : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expenseCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" isAnimationActive={true}>
                  {expenseCategoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} formatter={(value: unknown) => formatCurrency(Number(value ?? 0), displayCurrency)} />
              </PieChart>
            </ResponsiveContainer>
            <Legend data={expenseCategoryData} />
          </>
        )}
      </Section>

      {/* Income by category — donut */}
      <Section title="Income Sources" subtitle="This month">
        {incomeCategoryData.length === 0 ? <Empty text="No income recorded this month" /> : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={incomeCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" isAnimationActive={true}>
                  {incomeCategoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} formatter={(value: unknown) => formatCurrency(Number(value ?? 0), displayCurrency)} />
              </PieChart>
            </ResponsiveContainer>
            <Legend data={incomeCategoryData} />
          </>
        )}
      </Section>

      {/* Top 50 expenses by description */}
      <Section title="Top Expenses by Description" subtitle="This month · ranked by total spent">
        {topExpensesByName.length === 0 ? <Empty /> : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-hide pr-1">
            {topExpensesByName.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-600 w-5 text-right shrink-0 font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 gap-2">
                    <span className="text-xs text-slate-300 truncate">{item.name}</span>
                    <span className="text-xs font-semibold text-red-400 shrink-0">{fmt(item.total)}</span>
                  </div>
                  <div className="h-1 rounded-full bg-[#1e1e35] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#e94560]"
                      style={{ width: `${(item.total / topExpensesByName[0].total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Importance breakdown */}
      <Section title="Need / Want / Saving" subtitle="Last 3 months">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={importanceData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={42} />
            <Tooltip contentStyle={TOOLTIP} formatter={(value: unknown) => formatCurrency(Number(value ?? 0), displayCurrency)} />
            <RechartLegend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
            <Bar dataKey="Need"   stackId="a" fill="#e94560" isAnimationActive={true} />
            <Bar dataKey="Want"   stackId="a" fill="#f97316" isAnimationActive={true} />
            <Bar dataKey="Saving" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a35] rounded-2xl p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Legend({ data }: { data: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-2">
      {data.map((c) => (
        <div key={c.name} className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
          {c.name}
        </div>
      ))}
    </div>
  );
}

function Empty({ text = 'No data yet' }: { text?: string }) {
  return <p className="text-slate-600 text-sm text-center py-8">{text}</p>;
}
