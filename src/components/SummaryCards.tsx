import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { Transaction } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { formatCurrency, convertCurrency } from '../utils/currency';

interface Props {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: Props) {
  const { displayCurrency } = useSettings();
  const { base, rates } = useExchangeRates();

  function sumConverted(txns: Transaction[]) {
    return txns.reduce((sum, t) => {
      return sum + convertCurrency(t.price, t.currency ?? displayCurrency, displayCurrency, rates, base);
    }, 0);
  }

  const income  = sumConverted(transactions.filter((t) => t.type === 'income'));
  const expense = sumConverted(transactions.filter((t) => t.type === 'expense'));
  const balance = income - expense;
  const fmt = (n: number) => formatCurrency(n, displayCurrency, true);

  return (
    <div className="grid grid-cols-3 gap-3 px-4 pt-4">
      <Card
        label="Balance"
        value={fmt(balance)}
        icon={<Wallet size={16} />}
        color={balance >= 0 ? 'text-green-400' : 'text-red-400'}
        bg="bg-[#1a1a35]"
      />
      <Card
        label="Income"
        value={fmt(income)}
        icon={<TrendingUp size={16} />}
        color="text-green-400"
        bg="bg-green-950/40"
      />
      <Card
        label="Expenses"
        value={fmt(expense)}
        icon={<TrendingDown size={16} />}
        color="text-red-400"
        bg="bg-red-950/40"
      />
    </div>
  );
}

function Card({ label, value, icon, color, bg }: {
  label: string; value: string;
  icon: React.ReactNode; color: string; bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-3 flex flex-col gap-1.5`}>
      <div className={`flex items-center gap-1.5 ${color}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-base font-bold ${color} leading-none`}>{value}</p>
    </div>
  );
}
