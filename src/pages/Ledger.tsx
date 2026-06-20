import { useMemo, useState } from "react"
import { SlidersHorizontal, Search } from "lucide-react"
import { Card, Input, Button, Badge } from "@/components/ui"
import { TxList } from "@/components/domain/TxList"
import { AdvancedFilters } from "@/components/domain/AdvancedFilters"
import { AddTransactionFab } from "@/components/domain/AddTransaction"
import { useTransactions } from "@/hooks/useTransactions"
import { applyTxFilters, emptyTxFilters } from "@/lib/filter"
import { activeFilterCount } from "@/lib/filter-count"
import type { TxFilters } from "@/types"

export default function Ledger() {
  const txs = useTransactions()
  const [filters, setFilters] = useState<TxFilters>(emptyTxFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(
    () => applyTxFilters(txs ?? [], filters),
    [txs, filters],
  )
  const count = activeFilterCount(filters)

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Ledger</h1>
        <span className="text-sm text-muted">{filtered.length} entries</span>
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

      <Card className="p-2">
        <TxList
          txs={filtered}
          emptyTitle="No matching transactions"
          emptyDescription={count > 0 ? "Try adjusting your filters." : "Add your first transaction."}
        />
      </Card>

      <AdvancedFilters
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        value={filters}
        onChange={setFilters}
      />
      <AddTransactionFab />
    </div>
  )
}
