import {
  Drawer,
  Button,
  Field,
  Input,
  NumberInput,
  DatePicker,
  Select,
  ChipGroup,
  SwitchRow,
} from "@/components/ui"
import { useAccounts } from "@/hooks/useAccounts"
import { useCategories } from "@/hooks/useCategories"
import { useSettings } from "@/hooks/useSettings"
import { emptyTxFilters } from "@/lib/filter"
import {
  TYPE_OPTIONS,
  IMPORTANCE_OPTIONS,
  RECURRING_INTERVALS,
  type TxFilters,
  type TransactionType,
  type Importance,
  type RecurringInterval,
} from "@/types"

// Drawer with the full ledger filter set. Controlled via `value`/`onChange`.
export function AdvancedFilters({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  value: TxFilters
  onChange: (next: TxFilters) => void
}) {
  const accounts = useAccounts() ?? []
  const categories = useCategories() ?? []
  const settings = useSettings()

  const set = <K extends keyof TxFilters>(key: K, v: TxFilters[K]) =>
    onChange({ ...value, [key]: v })

  const intervalOpts = RECURRING_INTERVALS.map((o) => ({ value: o.value, label: o.label }))

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      footer={
        <>
          <Button variant="ghost" onClick={() => onChange({ ...emptyTxFilters, open: true })}>
            Reset
          </Button>
          <Button onClick={() => onOpenChange(false)}>Apply</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Search name">
          <Input
            value={value.nameQ}
            onChange={(e) => set("nameQ", e.target.value)}
            placeholder="e.g. coffee"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="From">
            <DatePicker value={value.dateFrom} onValueChange={(v) => set("dateFrom", v)} />
          </Field>
          <Field label="To">
            <DatePicker value={value.dateTo} onValueChange={(v) => set("dateTo", v)} />
          </Field>
        </div>

        <Field label="Type">
          <ChipGroup
            multi
            options={TYPE_OPTIONS}
            value={value.types}
            onChange={(v) => set("types", v as TransactionType[])}
          />
        </Field>

        {accounts.length > 0 && (
          <Field label="Accounts">
            <ChipGroup
              multi
              options={accounts.map((a) => ({ value: a.name, label: a.name }))}
              value={value.accounts}
              onChange={(v) => set("accounts", v)}
            />
          </Field>
        )}

        <Field label="Category">
          <Select
            value={value.categoryId}
            onValueChange={(v) => set("categoryId", v)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Any category"
          />
        </Field>

        <Field label="Importance">
          <ChipGroup
            multi
            options={IMPORTANCE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
              color: o.color,
            }))}
            value={value.importances}
            onChange={(v) => set("importances", v as Importance[])}
          />
        </Field>

        {(settings?.enabledCurrencies?.length ?? 0) > 0 && (
          <Field label="Currencies">
            <ChipGroup
              multi
              options={(settings?.enabledCurrencies ?? []).map((c) => ({ value: c, label: c }))}
              value={value.currencies}
              onChange={(v) => set("currencies", v)}
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Min amount">
            <NumberInput
              value={value.priceMin === "" ? "" : Number(value.priceMin)}
              onValueChange={(v) => set("priceMin", v === "" ? "" : String(v))}
            />
          </Field>
          <Field label="Max amount">
            <NumberInput
              value={value.priceMax === "" ? "" : Number(value.priceMax)}
              onValueChange={(v) => set("priceMax", v === "" ? "" : String(v))}
            />
          </Field>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
          <SwitchRow
            label="Recurring only"
            checked={value.filterRecurring}
            onCheckedChange={(v) => set("filterRecurring", v)}
          />
          {value.filterRecurring && (
            <ChipGroup
              multi
              options={intervalOpts}
              value={value.recurringIntervals}
              onChange={(v) => set("recurringIntervals", v as RecurringInterval[])}
            />
          )}
          <SwitchRow
            label="Installment only"
            checked={value.filterInstallment}
            onCheckedChange={(v) => set("filterInstallment", v)}
          />
          {value.filterInstallment && (
            <ChipGroup
              multi
              options={intervalOpts}
              value={value.installmentIntervals}
              onChange={(v) => set("installmentIntervals", v as RecurringInterval[])}
            />
          )}
        </div>
      </div>
    </Drawer>
  )
}
