import { Repeat, CreditCard, Check, SkipForward } from "lucide-react"
import { Card, Button, Badge, CurrencyAmount } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { useUpcoming } from "@/hooks/useUpcoming"
import { confirmRecurring, skipRecurring } from "@/lib/recurring"
import { confirmInstallment } from "@/lib/installment"
import { formatDate, todayISO } from "@/lib/dates"
import type { UpcomingItem } from "@/types"

// Horizontal scroller of upcoming recurring + installment payments.
export function UpcomingScroller() {
  const items = useUpcoming(60)
  const { toast } = useToast()

  if (!items || items.length === 0) return null

  async function confirm(item: UpcomingItem) {
    if (item.kind === "recurring") await confirmRecurring(item.sourceId)
    else await confirmInstallment(item.sourceId)
    toast("Payment recorded", "success")
  }
  async function skip(item: UpcomingItem) {
    if (item.kind === "recurring") {
      await skipRecurring(item.sourceId)
      toast("Skipped", "info")
    }
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-fg">Upcoming</h2>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {items.map((item) => {
          const overdue = item.dueDate < todayISO()
          return (
            <Card
              key={`${item.kind}-${item.sourceId}`}
              className="w-56 shrink-0 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <Badge tone={item.kind === "installment" ? "info" : "brand"}>
                  {item.kind === "installment" ? (
                    <>
                      <CreditCard size={11} /> {item.installmentIndex}/{item.installmentTotal}
                    </>
                  ) : (
                    <>
                      <Repeat size={11} /> Recurring
                    </>
                  )}
                </Badge>
                <span className={overdue ? "text-xs text-red-400" : "text-xs text-muted"}>
                  {overdue ? "Overdue" : formatDate(item.dueDate, "MMM d")}
                </span>
              </div>
              <div className="truncate text-sm font-medium text-fg">{item.name}</div>
              <div className="mb-3">
                <CurrencyAmount amount={item.amount} currency={item.currency} type={item.type} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => confirm(item)}>
                  <Check size={14} /> Pay
                </Button>
                {item.kind === "recurring" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Skip"
                    onClick={() => skip(item)}
                  >
                    <SkipForward size={14} />
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
