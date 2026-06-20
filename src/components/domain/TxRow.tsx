import { Repeat, CreditCard, ArrowRightLeft } from "lucide-react"
import { ListItem, IconBubble, CurrencyAmount, Badge } from "@/components/ui"
import { formatDate } from "@/lib/dates"
import { convert } from "@/lib/fx"
import { CategoryIcon } from "@/components/domain/CategoryIcon"
import type { Transaction, Category, ExchangeRates } from "@/types"

// One transaction row. Presentational — caller supplies resolved category,
// display currency and rates.
export function TxRow({
  tx,
  category,
  displayCurrency,
  rates,
  convertOnList = true,
  onClick,
}: {
  tx: Transaction
  category?: Category
  displayCurrency: string
  rates: ExchangeRates | undefined
  convertOnList?: boolean
  onClick?: () => void
}) {
  const showConverted = convertOnList && tx.currency !== displayCurrency
  const shownAmount = showConverted
    ? convert(tx.price, tx.currency, displayCurrency, rates)
    : tx.price
  const shownCurrency = showConverted ? displayCurrency : tx.currency

  const sub: string[] = [tx.account]
  if (tx.type === "transfer" && tx.toAccount) sub[0] = `${tx.account} → ${tx.toAccount}`
  else if (category) sub.push(category.name)
  sub.push(formatDate(tx.date))

  return (
    <ListItem
      onClick={onClick}
      leading={
        tx.type === "transfer" ? (
          <IconBubble color="#60a5fa">
            <ArrowRightLeft size={16} />
          </IconBubble>
        ) : (
          <IconBubble color={category?.color ?? "#2a2f3a"}>
            <CategoryIcon name={category?.icon} size={16} />
          </IconBubble>
        )
      }
      title={
        <span className="flex items-center gap-1.5">
          {tx.name}
          {tx.isRecurring && <Repeat size={12} className="text-muted" />}
          {tx.isInstallment && <CreditCard size={12} className="text-muted" />}
        </span>
      }
      subtitle={sub.join(" · ")}
      trailing={
        <div className="flex flex-col items-end">
          <CurrencyAmount amount={shownAmount} currency={shownCurrency} type={tx.type} />
          {tx.isInstallment && tx.installmentIndex && tx.installmentTotal && (
            <Badge className="mt-0.5">
              {tx.installmentIndex}/{tx.installmentTotal}
            </Badge>
          )}
        </div>
      }
    />
  )
}
