import { useEffect, useMemo, useState } from "react"
import { ClipboardPaste } from "lucide-react"
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
import { NameField } from "@/components/domain/NameField"
import { useAccounts } from "@/hooks/useAccounts"
import { useCategories } from "@/hooks/useCategories"
import { useSettings } from "@/hooks/useSettings"
import { addTransaction, updateTransaction } from "@/lib/transactions"
import { addRecurringTemplate } from "@/hooks/useRecurring"
import { confirmRecurring } from "@/lib/recurring"
import { addInstallmentPlan } from "@/hooks/useInstallments"
import { currencyOptions } from "@/lib/currency-options"
import { decodeOweCode } from "@/lib/split"
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
  // Type-dependent fields swap only after the segmented slide settles, so the
  // layout doesn't jump mid-animation.
  const [layoutType, setLayoutType] = useState<TransactionType>(type)
  useEffect(() => {
    const id = setTimeout(() => setLayoutType(type), 240)
    return () => clearTimeout(id)
  }, [type])
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
  const [code, setCode] = useState("")
  const [showCodeInput, setShowCodeInput] = useState(false)

  // Decode a split code string and populate the form. Returns success.
  function fillFromCode(raw: string): boolean {
    if (!raw.trim()) {
      toast("No code found", "error")
      return false
    }
    try {
      const owe = decodeOweCode(raw)
      setType("expense")
      setName(owe.payer ? `${owe.title} (split)` : owe.title)
      setPrice(owe.amount)
      setCurrency(owe.currency)
      toast("Filled from split code", "success")
      return true
    } catch {
      toast("Invalid split code", "error")
      return false
    }
  }

  // One-tap: read the clipboard and fill. Reveal a manual input if blocked.
  async function pasteCode() {
    try {
      const text = await navigator.clipboard.readText()
      if (fillFromCode(text)) setShowCodeInput(false)
    } catch {
      setShowCodeInput(true)
    }
  }

  function applyManualCode() {
    if (fillFromCode(code)) {
      setCode("")
      setShowCodeInput(false)
    }
  }

  function fillFromHistory(t: Transaction) {
    setName(t.name)
    setPrice(t.price)
    setCurrency(t.currency)
    if (t.categoryId) setCategoryId(t.categoryId)
    if (t.importance) setImportance([t.importance])
    if (t.account) setAccount(t.account)
  }

  const accountOptions = useMemo(
    () => accounts.map((a) => ({ value: a.name, label: a.name })),
    [accounts],
  )
  const categoryOptions = useMemo(() => {
    const filtered = categories.filter(
      (c) => !c.categoryType || (layoutType !== "transfer" && c.categoryType === layoutType),
    )
    return filtered.map((c) => ({ value: c.id, label: c.name }))
  }, [categories, layoutType])

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
        const recId = await addRecurringTemplate({
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
        // If the start date is today or earlier, log that first payment now;
        // only future occurrences belong in Upcoming.
        if (date <= todayISO()) await confirmRecurring(recId)
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
      {!isEdit && (
        <div className="space-y-2">
          <Button type="button" variant="outline" fullWidth onClick={pasteCode}>
            <ClipboardPaste size={16} /> Paste split code
          </Button>
          {showCodeInput && (
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste code here…"
                className="flex-1"
                autoFocus
              />
              <Button variant="secondary" onClick={applyManualCode} disabled={!code.trim()}>
                Fill
              </Button>
            </div>
          )}
        </div>
      )}

      <SegmentedControl
        className="w-full"
        value={type}
        onChange={(v) => setType(v)}
        options={TYPE_OPTIONS}
      />

      <Field label="Name">
        <NameField value={name} onChange={setName} type={type} onPick={fillFromHistory} />
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
        <Field label={layoutType === "transfer" ? "From account" : "Account"}>
          <Select value={account} onValueChange={setAccount} options={accountOptions} />
        </Field>
      </div>

      {layoutType === "transfer" && (
        <Field label="To account">
          <Select
            value={toAccount}
            onValueChange={setToAccount}
            options={accountOptions.filter((o) => o.value !== account)}
          />
        </Field>
      )}

      {layoutType !== "transfer" && (
        <Field label="Category">
          <Select
            value={categoryId}
            onValueChange={setCategoryId}
            options={categoryOptions}
            placeholder="Pick a category"
          />
        </Field>
      )}

      {layoutType === "expense" && (
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
          {layoutType === "expense" && (
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
        <Button fullWidth onClick={submit}>
          {isEdit ? "Save" : "Add"}
        </Button>
      </div>
    </div>
  )
}
