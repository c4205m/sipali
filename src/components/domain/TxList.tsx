import { useState } from "react"
import { Trash2, Split } from "lucide-react"
import { Drawer, Button, EmptyState } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { TxRow } from "@/components/domain/TxRow"
import { TxForm } from "@/components/domain/TxForm"
import { SplitModal } from "@/components/domain/SplitModal"
import { useCategoryMap } from "@/hooks/useCategories"
import { useSettings } from "@/hooks/useSettings"
import { useRates } from "@/hooks/useRates"
import { deleteTransaction } from "@/lib/transactions"
import type { Transaction } from "@/types"

// Renders a transaction list with built-in edit/delete drawer.
export function TxList({
  txs,
  emptyTitle = "No transactions",
  emptyDescription,
}: {
  txs: Transaction[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  const catMap = useCategoryMap()
  const settings = useSettings()
  const rates = useRates()
  const { toast } = useToast()
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [splitting, setSplitting] = useState<Transaction | null>(null)

  if (txs.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  async function remove() {
    if (!editing) return
    await deleteTransaction(editing.id)
    toast("Transaction deleted", "success")
    setEditing(null)
  }

  return (
    <>
      <div className="divide-y divide-border">
        {txs.map((tx) => (
          <TxRow
            key={tx.id}
            tx={tx}
            category={catMap.get(tx.categoryId)}
            displayCurrency={settings?.displayCurrency ?? "USD"}
            rates={rates}
            convertOnList={settings?.convertOnList ?? true}
            onClick={() => setEditing(tx)}
          />
        ))}
      </div>

      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit transaction"
      >
        {editing && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={remove}>
                <Trash2 size={14} /> Delete
              </Button>
              {editing.type === "expense" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSplitting(editing)
                    setEditing(null)
                  }}
                >
                  <Split size={14} /> Split
                </Button>
              )}
            </div>
            <TxForm existing={editing} onDone={() => setEditing(null)} />
          </div>
        )}
      </Drawer>

      <SplitModal
        open={!!splitting}
        onOpenChange={(o) => !o && setSplitting(null)}
        prefill={
          splitting
            ? { title: splitting.name, total: splitting.price, currency: splitting.currency }
            : undefined
        }
      />
    </>
  )
}
