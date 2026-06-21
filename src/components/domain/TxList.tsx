import { useState } from "react"
import { Pencil, Trash2, Split } from "lucide-react"
import { Drawer, EmptyState, SwipeList, SwipeRow, ListSkeleton } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { TxRow } from "@/components/domain/TxRow"
import { TxForm } from "@/components/domain/TxForm"
import { SplitModal } from "@/components/domain/SplitModal"
import { TxDetailsModal } from "@/components/domain/TxDetailsModal"
import { useCategoryMap } from "@/hooks/useCategories"
import { useSettings } from "@/hooks/useSettings"
import { useRates } from "@/hooks/useRates"
import { deleteTransaction, restoreTransaction } from "@/lib/transactions"
import type { Transaction } from "@/types"

// Colored swipe-action panel: centered icon over label, fixed min width.
function ActionPanel({
  icon: Icon,
  label,
  bg,
  onClick,
}: {
  icon: typeof Pencil
  label: string
  bg: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-full w-[76px] flex-col items-center justify-center gap-1 text-xs font-medium text-white"
      style={{ background: bg }}
    >
      <Icon size={18} />
      {label}
    </button>
  )
}

// Transaction list: tap a row for details; swipe right for edit/remove, swipe
// left (expenses) for split. Remove is undoable via toast.
export function TxList({
  txs,
  loading,
  emptyTitle = "No transactions",
  emptyDescription,
}: {
  txs: Transaction[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}) {
  const catMap = useCategoryMap()
  const settings = useSettings()
  const rates = useRates()
  const { toast } = useToast()
  const [details, setDetails] = useState<Transaction | null>(null)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [splitting, setSplitting] = useState<Transaction | null>(null)

  if (loading) return <ListSkeleton />
  if (txs.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} className="h-full border-0" />
    )
  }

  function openEdit(tx: Transaction) {
    setDetails(null)
    setEditing(tx)
  }
  function openSplit(tx: Transaction) {
    setDetails(null)
    setSplitting(tx)
  }
  async function removeTx(tx: Transaction) {
    setDetails(null)
    await deleteTransaction(tx.id)
    toast("Transaction deleted", "info", {
      action: { label: "Undo", onClick: () => restoreTransaction(tx) },
    })
  }

  return (
    <>
      <SwipeList className="overflow-hidden rounded-xl">
        {txs.map((tx, i) => (
          <SwipeRow
            key={tx.id}
            className={i < txs.length - 1 ? "border-b border-border" : ""}
            onTap={() => setDetails(tx)}
            leading={
              tx.type === "expense" ? (
                <ActionPanel icon={Split} label="Split" bg="#0ea5e9" onClick={() => openSplit(tx)} />
              ) : undefined
            }
            trailing={
              <>
                <ActionPanel icon={Pencil} label="Edit" bg="#6e7bf2" onClick={() => openEdit(tx)} />
                <ActionPanel icon={Trash2} label="Remove" bg="#ef4444" onClick={() => removeTx(tx)} />
              </>
            }
          >
            <TxRow
              tx={tx}
              category={catMap.get(tx.categoryId)}
              displayCurrency={settings?.displayCurrency ?? "USD"}
              rates={rates}
              convertOnList={settings?.convertOnList ?? true}
            />
          </SwipeRow>
        ))}
      </SwipeList>

      <TxDetailsModal
        tx={details}
        open={!!details}
        onOpenChange={(o) => !o && setDetails(null)}
        onEdit={openEdit}
        onSplit={openSplit}
        onRemove={removeTx}
      />

      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit transaction"
      >
        {editing && <TxForm existing={editing} onDone={() => setEditing(null)} />}
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
