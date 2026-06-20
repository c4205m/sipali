import { useMemo, useState } from "react"
import {
  Button,
  Field,
  Input,
  NumberInput,
  DatePicker,
  Select,
  SegmentedControl,
  ChipGroup,
  SwitchRow,
} from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { useAccounts } from "@/hooks/useAccounts"
import { useCategories } from "@/hooks/useCategories"
import { useSettings } from "@/hooks/useSettings"
import { addTransaction, updateTransaction } from "@/lib/transactions"
import { addRecurringTemplate } from "@/hooks/useRecurring"
import { addInstallmentPlan } from "@/hooks/useInstallments"
import { currencyOptions } from "@/lib/currency-options"
import { todayISO } from "@/lib/dates"
import {
  TYPE_OPTIONS,
  IMPORTANCE_OPTIONS,
  RECURRING_INTERVALS,
  type Transaction,
  type TransactionType,
  type Importance,
  type RecurringInterval,
} from "@/types"

// Create or edit a transaction. When `recurring` or `installment` is enabled
// on a new entry, a schedule (template/plan) is created instead of a plain row.
export function TxForm({
  existing,
  onDone,
}: {
  existing?: Transaction
  onDone: () => void
}) {
  const { toast } = useToast()
  const accounts = useAccounts() ?? []
  const categories = useCategories() ?? []
  const settings = useSettings()
  const isEdit = !!existing

  const [type, setType] = useState<TransactionType>(existing?.type ?? "expense")
  const [name, setName] = useState(existing?.name ?? "")
  const [price, setPrice] = useState<number | "">(existing?.price ?? "")
  const [currency, setCurrency] = useState(
    existing?.currency ?? settings?.displayCurrency ?? "USD",
  )
  const [date, setDate] = useState(existing?.date ?? todayISO())
  const [account, setAccount] = useState(
    existing?.account ?? accounts.find((a) => a.isDefault)?.name ?? accounts[0]?.name ?? "",
  )
  const [toAccount, setToAccount] = useState(existing?.toAccount ?? "")
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "")
  const [importance, setImportance] = useState<Importance[]>(
    existing?.importance ? [existing.importance] : [],
  )
  const [recurring, setRecurring] = useState(false)
  const [interval, setInterval] = useState<RecurringInterval>("monthly")
  const [installment, setInstallment] = useState(false)
  const [installmentTotal, setInstallmentTotal] = useState<number | "">(12)

  const accountOptions = useMemo(
    () => accounts.map((a) => ({ value: a.name, label: a.name })),
    [accounts],
  )
  const categoryOptions = useMemo(() => {
    const filtered = categories.filter(
      (c) => !c.categoryType || (type !== "transfer" && c.categoryType === type),
    )
    return filtered.map((c) => ({ value: c.id, label: c.name }))
  }, [categories, type])

  const currencyOpts = useMemo(
    () => currencyOptions(settings?.enabledCurrencies ?? [currency]),
    [settings?.enabledCurrencies, currency],
  )

  async function submit() {
    if (!name.trim()) return toast("Name is required", "error")
    if (price === "" || price <= 0) return toast("Enter a valid amount", "error")
    if (!account) return toast("Pick an account", "error")
    if (type === "transfer" && !toAccount) return toast("Pick a destination account", "error")

    try {
      if (isEdit) {
        await updateTransaction(existing.id, {
          name: name.trim(),
          price: Number(price),
          currency,
          date,
          type,
          categoryId,
          importance: importance[0],
          account,
          toAccount: type === "transfer" ? toAccount : undefined,
        })
        toast("Transaction updated", "success")
      } else if (recurring) {
        await addRecurringTemplate({
          name: name.trim(),
          price: Number(price),
          currency,
          type,
          categoryId,
          importance: importance[0],
          account,
          toAccount: type === "transfer" ? toAccount : undefined,
          interval,
          anchorDate: date,
        })
        toast("Recurring schedule added", "success")
      } else if (installment) {
        if (installmentTotal === "" || installmentTotal < 1)
          return toast("Enter installment count", "error")
        await addInstallmentPlan({
          name: name.trim(),
          totalPrice: Number(price),
          currency,
          account,
          categoryId,
          importance: importance[0],
          installmentTotal: Number(installmentTotal),
          interval,
          startDate: date,
        })
        toast("Installment plan added", "success")
      } else {
        await addTransaction({
          name: name.trim(),
          price: Number(price),
          currency,
          date,
          type,
          categoryId,
          importance: importance[0],
          account,
          toAccount: type === "transfer" ? toAccount : undefined,
        })
        toast("Transaction added", "success")
      }
      onDone()
    } catch (e) {
      console.error(e)
      toast("Something went wrong", "error")
    }
  }

  return (
    <div className="space-y-4">
      <SegmentedControl
        className="w-full"
        value={type}
        onChange={(v) => setType(v)}
        options={TYPE_OPTIONS}
      />

      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Coffee" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={installment ? "Total amount" : "Amount"}>
          <NumberInput value={price} onValueChange={setPrice} placeholder="0.00" />
        </Field>
        <Field label="Currency">
          <Select value={currency} onValueChange={setCurrency} options={currencyOpts} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <DatePicker value={date} onValueChange={setDate} />
        </Field>
        <Field label={type === "transfer" ? "From account" : "Account"}>
          <Select value={account} onValueChange={setAccount} options={accountOptions} />
        </Field>
      </div>

      {type === "transfer" && (
        <Field label="To account">
          <Select
            value={toAccount}
            onValueChange={setToAccount}
            options={accountOptions.filter((o) => o.value !== account)}
          />
        </Field>
      )}

      {type !== "transfer" && (
        <Field label="Category">
          <Select
            value={categoryId}
            onValueChange={setCategoryId}
            options={categoryOptions}
            placeholder="Pick a category"
          />
        </Field>
      )}

      {type === "expense" && (
        <Field label="Importance">
          <ChipGroup
            options={IMPORTANCE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
              color: o.color,
            }))}
            value={importance}
            onChange={(v) => setImportance(v as Importance[])}
          />
        </Field>
      )}

      {!isEdit && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
          <SwitchRow
            label="Recurring"
            description="Repeats on a schedule"
            checked={recurring}
            onCheckedChange={(v) => {
              setRecurring(v)
              if (v) setInstallment(false)
            }}
          />
          {type === "expense" && (
            <SwitchRow
              label="Installment"
              description="Split into equal payments"
              checked={installment}
              onCheckedChange={(v) => {
                setInstallment(v)
                if (v) setRecurring(false)
              }}
            />
          )}
          {(recurring || installment) && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Field label="Interval">
                <Select
                  value={interval}
                  onValueChange={(v) => setInterval(v as RecurringInterval)}
                  options={RECURRING_INTERVALS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </Field>
              {installment && (
                <Field label="# payments">
                  <NumberInput value={installmentTotal} onValueChange={setInstallmentTotal} />
                </Field>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={submit}>{isEdit ? "Save" : "Add"}</Button>
      </div>
    </div>
  )
}
