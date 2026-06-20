import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { CHART, tooltipStyle, tooltipItemStyle, tooltipLabelStyle } from "@/components/charts/chartTheme"
import { formatNumber } from "@/lib/money"
import type { NamedValue } from "@/lib/stats"

export { ChartCard } from "@/components/charts/ChartCard"

const axisProps = {
  stroke: CHART.axis,
  tick: { fill: CHART.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
}

const commonTooltip = {
  contentStyle: tooltipStyle,
  itemStyle: tooltipItemStyle,
  labelStyle: tooltipLabelStyle,
  formatter: (v: number) => formatNumber(v, 2),
}

// Grouped income vs expense bars by month.
export function IncomeExpenseChart({
  data,
}: {
  data: { period: string; income: number; expense: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height={224} minWidth={0}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="period" {...axisProps} />
        <YAxis {...axisProps} width={44} tickFormatter={(v) => formatNumber(v)} />
        <Tooltip {...(commonTooltip as object)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" fill={CHART.income} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill={CHART.expense} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Daily expense/income area trend.
export function ActivityChart({
  data,
}: {
  data: { date: string; expense: number; income: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height={224} minWidth={0}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="g-exp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.expense} stopOpacity={0.5} />
            <stop offset="100%" stopColor={CHART.expense} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="g-inc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.income} stopOpacity={0.5} />
            <stop offset="100%" stopColor={CHART.income} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="date" {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} width={44} tickFormatter={(v) => formatNumber(v)} />
        <Tooltip {...(commonTooltip as object)} />
        <Area type="monotone" dataKey="income" stroke={CHART.income} fill="url(#g-inc)" strokeWidth={2} />
        <Area type="monotone" dataKey="expense" stroke={CHART.expense} fill="url(#g-exp)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Donut for category / importance breakdowns.
export function CategoryDonut({ data }: { data: NamedValue[] }) {
  return (
    <ResponsiveContainer width="100%" height={224} minWidth={0}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          stroke="none"
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.color ?? CHART.palette[i % CHART.palette.length]} />
          ))}
        </Pie>
        <Tooltip {...(commonTooltip as object)} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Horizontal bars for top expenses by description.
export function TopExpensesChart({ data }: { data: NamedValue[] }) {
  return (
    <ResponsiveContainer width="100%" height={224} minWidth={0}>
      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid stroke={CHART.grid} horizontal={false} />
        <XAxis type="number" {...axisProps} tickFormatter={(v) => formatNumber(v)} />
        <YAxis type="category" dataKey="name" {...axisProps} width={90} />
        <Tooltip {...(commonTooltip as object)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="value" fill={CHART.brand} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
