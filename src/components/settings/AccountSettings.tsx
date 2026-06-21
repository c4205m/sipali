import { useMemo, useState } from "react"
import { Plus, Star, Archive, ArchiveRestore } from "lucide-react"
import {
  CollapsibleCard,
  Button,
  IconButton,
  Input,
  ListItem,
  Badge,
  Tooltip,
  CurrencyAmount,
} from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { useAccounts, addAccount, archiveAccount } from "@/hooks/useAccounts"
import { useTransactions } from "@/hooks/useTransactions"
import { useSettings } from "@/hooks/useSettings"
import { useRates } from "@/hooks/useRates"
import { accountBalances } from "@/lib/balance"
import { db } from "@/db/dexie"

export function AccountSettings() {
  const accounts = useAccounts(true) ?? []
  const txs = useTransactions()
  const settings = useSettings()
  const rates = useRates()
  const { toast } = useToast()
  const [name, setName] = useState("")

  const displayCurrency = settings?.displayCurrency ?? "USD"
  const balances = useMemo(
    () => accountBalances(txs ?? [], displayCurrency, rates),
    [txs, displayCurrency, rates],
  )

  async function add() {
    if (!name.trim()) return
    await addAccount(name.trim(), accounts.length === 0)
    setName("")
    toast("Account added", "success")
  }

  async function makeDefault(id: string) {
    // Single default — clear others.
    await db.transaction("rw", db.accounts, async () => {
      await db.accounts.toCollection().modify({ isDefault: false })
      await db.accounts.update(id, { isDefault: true })
    })
    toast("Default account set", "success")
  }

  return (
    <CollapsibleCard id="accounts" title="Accounts">
      <div className="mb-3 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New account name"
          className="flex-1"
        />
        <Button onClick={add}>
          <Plus size={14} /> Add
        </Button>
      </div>

      <div className="divide-y divide-border">
        {accounts.map((a) => (
          <ListItem
            key={a.id}
            title={
              <span className="flex items-center gap-2">
                {a.name}
                {a.isDefault && <Badge tone="brand">Default</Badge>}
                {a.isArchived && <Badge>Archived</Badge>}
              </span>
            }
            subtitle={
              <CurrencyAmount
                amount={balances.get(a.name) ?? 0}
                currency={displayCurrency}
                muted
              />
            }
            trailing={
              <div className="flex gap-1">
                {!a.isDefault && !a.isArchived && (
                  <Tooltip content="Set default">
                    <IconButton label="Set default" size="sm" onClick={() => makeDefault(a.id)}>
                      <Star size={15} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip content={a.isArchived ? "Restore" : "Archive"}>
                  <IconButton
                    label={a.isArchived ? "Restore" : "Archive"}
                    size="sm"
                    onClick={() => archiveAccount(a.id, !a.isArchived)}
                  >
                    {a.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                  </IconButton>
                </Tooltip>
              </div>
            }
          />
        ))}
      </div>
    </CollapsibleCard>
  )
}