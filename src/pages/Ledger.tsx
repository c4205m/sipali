import { useMemo, useState } from "react"
import { usePersistentState } from "@/hooks/usePersistentState"
import { SlidersHorizontal, Search, Split } from "lucide-react"
import { Card, Input, Button, Badge } from "@/components/ui"
import { TxList } from "@/components/domain/TxList"
import { AdvancedFilters } from "@/components/domain/AdvancedFilters"
import { SplitModal } from "@/components/domain/SplitModal"
import { useTransactions } from "@/hooks/useTransactions"
import { applyTxFilters, emptyTxFilters } from "@/lib/filter"
import { activeFilterCount } from "@/lib/filter-count"
import type { TxFilters } from "@/types"

export default function Ledger() {
  const txs = useTransactions()
  const [filters, setFilters] = usePersistentState<TxFilters>("ledger.filters", emptyTxFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [splitOpen, setSplitOpen] = useState(false)

  const filtered = useMemo(
    () => applyTxFilters(txs ?? [], filters),
    [txs, filters],
  )
  const count = activeFilterCount(filters)

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-4 md:h-[calc(100dvh-6.5rem)]">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Ledger</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{filtered.length} entries</span>
          <Button size="sm" variant="outline" onClick={() => setSplitOpen(true)}>
            <Split size={14} /> Split
          </Button>
        </div>
      </header>

      <div className="flex gap-2">
        <Input
          leading={<Search size={16} />}
          value={filters.nameQ}
          onChange={(e) => setFilters({ ...filters, nameQ: e.target.value })}
          placeholder="Search transactions…"
          className="flex-1"
        />
        <Button variant="outline" onClick={() => setDrawerOpen(true)} className="relative">
          <SlidersHorizontal size={16} />
          Filters
          {count > 0 && (
            <Badge tone="brand" className="ml-1">
              {count}
            </Badge>
          )}
        </Button>
      </div>

      <Card className="min-h-0 flex-1 overflow-hidden p-2">
        <div className="no-scrollbar h-full overflow-y-auto">
          <TxList
            txs={filtered}
            loading={txs === undefined}
            emptyTitle="No matching transactions"
            emptyDescription={count > 0 ? "Try adjusting your filters." : "Add your first transaction."}
          />
        </div>
      </Card>

      <AdvancedFilters
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        value={filters}
        onChange={setFilters}
      />
      <SplitModal open={splitOpen} onOpenChange={setSplitOpen} />
    </div>
  )
}
