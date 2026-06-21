import { useState } from "react"
import { Repeat, CreditCard, Check, SkipForward } from "lucide-react"
import { Card, Button, Badge, CurrencyAmount, Modal } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { useUpcoming } from "@/hooks/useUpcoming"
import { confirmRecurring, skipRecurring } from "@/lib/recurring"
import { confirmInstallment } from "@/lib/installment"
import { updateRecurringTemplate } from "@/hooks/useRecurring"
import { formatDate } from "@/lib/dates"
import { differenceInCalendarDays, parseISO } from "date-fns"
import { cn } from "@/lib/cn"
import type { UpcomingItem } from "@/types"

// Horizontal scroller of upcoming recurring + installment payments.
export function UpcomingScroller() {
  const all = useUpcoming(60)
  const { toast } = useToast()
  // Recurring item pending a skip choice (skip once vs cancel series).
  const [skipTarget, setSkipTarget] = useState<UpcomingItem | null>(null)

  const items = all

  if (!items || items.length === 0) return null

  async function confirm(item: UpcomingItem) {
    if (item.kind === "recurring") await confirmRecurring(item.sourceId)
    else await confirmInstallment(item.sourceId)
    toast("Payment recorded", "success")
  }
  async function skipOnce() {
    if (!skipTarget) return
    await skipRecurring(skipTarget.sourceId)
    toast("Skipped once", "info")
    setSkipTarget(null)
  }
  async function cancelSeries() {
    if (!skipTarget) return
    await updateRecurringTemplate(skipTarget.sourceId, { isArchived: true })
    toast("Recurring cancelled", "info")
    setSkipTarget(null)
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-fg">Upcoming</h2>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {items.map((item) => {
          const daysLeft = differenceInCalendarDays(parseISO(item.dueDate), new Date())
          const overdue = daysLeft < 0
          // Highlight items that are due/overdue or within the next 7 days.
          const urgent = daysLeft <= 7
          return (
            <Card
              key={`${item.kind}-${item.sourceId}`}
              className={cn(
                "w-56 shrink-0 p-3",
                urgent && "border-amber-400/80 shadow-[0_0_16px_-4px_rgba(250,204,21,0.5)]",
                overdue && "border-red-500/70 shadow-[0_0_16px_-4px_rgba(239,68,68,0.5)]",
              )}
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
                    onClick={() => setSkipTarget(item)}
                  >
                    <SkipForward size={14} />
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <Modal
        open={!!skipTarget}
        onOpenChange={(o) => !o && setSkipTarget(null)}
        title="Skip this payment?"
        description={
          skipTarget
            ? `Skip just this one occurrence of "${skipTarget.name}", or cancel the whole recurring series?`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setSkipTarget(null)}>
              Keep
            </Button>
            <Button variant="secondary" onClick={skipOnce}>
              Skip once
            </Button>
            <Button variant="danger" onClick={cancelSeries}>
              Cancel series
            </Button>
          </>
        }
      />
    </section>
  )
}
