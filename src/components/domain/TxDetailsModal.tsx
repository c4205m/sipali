import { Pencil, Split, Trash2 } from "lucide-react"
import { Modal, Button, Badge, CurrencyAmount, IconBubble } from "@/components/ui"
import { CategoryIcon } from "@/components/domain/CategoryIcon"
import { useCategoryMap } from "@/hooks/useCategories"
import { useSettings } from "@/hooks/useSettings"
import { useRates } from "@/hooks/useRates"
import { useDayRate } from "@/hooks/useDayRate"
import { convert } from "@/lib/fx"
import { formatDate } from "@/lib/dates"
import { formatMoney, formatNumber } from "@/lib/money"
import { TYPE_META, IMPORTANCE_OPTIONS, type Transaction } from "@/types"

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right text-fg">{children}</span>
    </div>
  )
}

// Read-only transaction details with Edit / Split / Remove actions.
export function TxDetailsModal({
  tx,
  open,
  onOpenChange,
  onEdit,
  onSplit,
  onRemove,
}: {
  tx: Transaction | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onEdit: (tx: Transaction) => void
  onSplit: (tx: Transaction) => void
  onRemove: (tx: Transaction) => void
}) {
  const catMap = useCategoryMap()
  const settings = useSettings()
  const rates = useRates()
  const displayCurrency = settings?.displayCurrency ?? "USD"
  const isForeign = !!tx && tx.currency !== displayCurrency
  const day = useDayRate(
    isForeign ? tx.date : undefined,
    isForeign ? [tx.currency, displayCurrency] : [],
  )
  if (!tx) return null

  const category = catMap.get(tx.categoryId)
  const meta = TYPE_META[tx.type]
  const converted = isForeign ? convert(tx.price, tx.currency, displayCurrency, rates) : null
  const dayConverted =
    isForeign && day.rates
      ? convert(tx.price, tx.currency, displayCurrency, {
          id: "rates",
          base: "USD",
          rates: day.rates,
          updatedAt: tx.date,
        })
      : null
  const dayRate =
    isForeign && day.rates?.[tx.currency] && day.rates?.[displayCurrency]
      ? day.rates[displayCurrency] / day.rates[tx.currency]
      : null
  const importance = IMPORTANCE_OPTIONS.find((o) => o.value === tx.importance)

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Transaction">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {tx.type === "transfer" ? (
            <IconBubble color={meta.hex}>{meta.sign}</IconBubble>
          ) : (
            <IconBubble color={category?.color ?? "#2a2f3a"}>
              <CategoryIcon name={category?.icon} size={18} />
            </IconBubble>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-fg">{tx.name}</p>
            <p className="text-xs text-muted">{formatDate(tx.date)}</p>
          </div>
          <div className="text-right">
            <CurrencyAmount amount={tx.price} currency={tx.currency} type={tx.type} />
            {converted != null && (
              <p className="text-xs text-muted">
                ≈ {formatMoney(converted, displayCurrency)}
              </p>
            )}
          </div>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border px-3">
          <Row label="Type">
            <Badge color={meta.hex}>{meta.label}</Badge>
          </Row>
          {tx.type === "transfer" ? (
            <Row label="Transfer">
              {tx.account} → {tx.toAccount}
            </Row>
          ) : (
            <>
              <Row label="Account">{tx.account}</Row>
              <Row label="Category">{category?.name ?? "—"}</Row>
            </>
          )}
          {importance && (
            <Row label="Importance">
              <Badge color={importance.color}>{importance.label}</Badge>
            </Row>
          )}
          {isForeign && (
            <Row label="Logged-day rate">
              {day.loading ? (
                "…"
              ) : dayConverted != null && dayRate != null ? (
                <span className="text-right">
                  ≈ {formatMoney(dayConverted, displayCurrency)}
                  <span className="block text-xs text-muted">
                    1 {tx.currency} = {formatNumber(dayRate, 4)} {displayCurrency}
                  </span>
                </span>
              ) : (
                "unavailable"
              )}
            </Row>
          )}
          {tx.isRecurring && <Row label="Recurring">{tx.recurringInterval}</Row>}
          {tx.isInstallment && tx.installmentIndex && tx.installmentTotal && (
            <Row label="Installment">
              {tx.installmentIndex}/{tx.installmentTotal}
            </Row>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => onEdit(tx)}>
            <Pencil size={16} /> Edit
          </Button>
          {tx.type === "expense" && (
            <Button variant="secondary" fullWidth onClick={() => onSplit(tx)}>
              <Split size={16} /> Split
            </Button>
          )}
          <Button variant="danger" fullWidth onClick={() => onRemove(tx)}>
            <Trash2 size={16} /> Remove
          </Button>
        </div>
      </div>
    </Modal>
  )
}
