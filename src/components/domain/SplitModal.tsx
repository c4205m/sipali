import { useMemo, useState } from "react"
import { Plus, X, Copy, Share2, Link2 } from "lucide-react"
import {
  Modal,
  Button,
  IconButton,
  Field,
  Input,
  NumberInput,
  Select,
  SegmentedControl,
  CurrencyAmount,
} from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { useSettings } from "@/hooks/useSettings"
import { currencyOptions } from "@/lib/currency-options"
import {
  computeSplit,
  validateSplit,
  valueSum,
  splitToText,
  buildSplitUrl,
  type SplitInput,
  type SplitMethod,
  type Participant,
} from "@/lib/split"

export interface SplitPrefill {
  title?: string
  total?: number
  currency?: string
}

const METHODS: { value: SplitMethod; label: string }[] = [
  { value: "equal", label: "Equal" },
  { value: "exact", label: "Exact" },
  { value: "percent", label: "Percent" },
]

// Bill-splitting modal. Computes each person's share and shares a read-only
// breakdown via link or plain text. Info only — records nothing.
export function SplitModal({
  open,
  onOpenChange,
  prefill,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  prefill?: SplitPrefill
}) {
  const { toast } = useToast()
  const settings = useSettings()

  const [title, setTitle] = useState(prefill?.title ?? "")
  const [total, setTotal] = useState<number | "">(prefill?.total ?? "")
  const [currency, setCurrency] = useState(
    prefill?.currency ?? settings?.displayCurrency ?? "USD",
  )
  const [method, setMethod] = useState<SplitMethod>("equal")
  const [payer, setPayer] = useState("Me")
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "Me" },
    { name: "" },
  ])

  // Re-seed the form whenever the modal opens with a new prefill.
  const prefillKey = `${open}-${prefill?.title}-${prefill?.total}`
  const [lastKey, setLastKey] = useState("")
  if (open && lastKey !== prefillKey) {
    setLastKey(prefillKey)
    setTitle(prefill?.title ?? "")
    setTotal(prefill?.total ?? "")
    setCurrency(prefill?.currency ?? settings?.displayCurrency ?? "USD")
    setMethod("equal")
    setPayer("Me")
    setParticipants([{ name: "Me" }, { name: "" }])
  }

  const input: SplitInput = useMemo(
    () => ({
      title,
      total: total === "" ? 0 : total,
      currency,
      payer,
      method,
      participants,
    }),
    [title, total, currency, payer, method, participants],
  )

  const error = validateSplit(input)
  const result = useMemo(() => (error ? null : computeSplit(input)), [error, input])

  function setParticipant(i: number, patch: Partial<Participant>) {
    setParticipants((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }
  function addParticipant() {
    setParticipants((prev) => [...prev, { name: "" }])
  }
  function removeParticipant(i: number) {
    setParticipants((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function copyText() {
    if (!result) return
    await navigator.clipboard.writeText(splitToText(result))
    toast("Summary copied", "success")
  }
  async function copyLink() {
    if (!result) return
    await navigator.clipboard.writeText(buildSplitUrl(result))
    toast("Link copied", "success")
  }
  async function nativeShare() {
    if (!result) return
    const url = buildSplitUrl(result)
    if (navigator.share) {
      try {
        await navigator.share({ title: result.title, text: splitToText(result), url })
      } catch {
        /* cancelled */
      }
    } else {
      copyLink()
    }
  }

  const payerOptions = participants
    .filter((p) => p.name.trim())
    .map((p) => ({ value: p.name, label: p.name }))

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Split a bill" className="max-w-lg">
      <div className="space-y-4">
        <Field label="What's it for?">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dinner" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Total">
            <NumberInput value={total} onValueChange={setTotal} placeholder="0.00" />
          </Field>
          <Field label="Currency">
            <Select
              value={currency}
              onValueChange={setCurrency}
              options={currencyOptions(settings?.enabledCurrencies ?? [currency])}
            />
          </Field>
        </div>

        <Field label="Split method">
          <SegmentedControl className="w-full" value={method} onChange={setMethod} options={METHODS} />
        </Field>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">People</span>
            <Button size="sm" variant="ghost" onClick={addParticipant}>
              <Plus size={14} /> Add
            </Button>
          </div>
          {participants.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={p.name}
                onChange={(e) => setParticipant(i, { name: e.target.value })}
                placeholder={`Person ${i + 1}`}
                className="flex-1"
              />
              {method !== "equal" && (
                <NumberInput
                  value={p.value ?? ""}
                  onValueChange={(v) => setParticipant(i, { value: v === "" ? undefined : v })}
                  placeholder={method === "percent" ? "%" : "amount"}
                  className="w-24"
                />
              )}
              <IconButton
                label="Remove"
                size="sm"
                variant="danger"
                onClick={() => removeParticipant(i)}
                disabled={participants.length <= 2}
              >
                <X size={16} />
              </IconButton>
            </div>
          ))}
          {method !== "equal" && (
            <p className="text-xs text-muted">
              Sum: {valueSum(input)}
              {method === "percent" ? "%" : ` ${currency}`}
            </p>
          )}
        </div>

        <Field label="Paid by">
          <Select
            value={payer}
            onValueChange={setPayer}
            options={payerOptions}
            placeholder="Who paid?"
          />
        </Field>

        {/* Live breakdown */}
        <div className="rounded-xl border border-border bg-surface p-3">
          {error ? (
            <p className="text-sm text-muted">{error}</p>
          ) : (
            <div className="space-y-1.5">
              {result!.shares.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className={s.isPayer ? "text-muted" : "text-fg"}>
                    {s.name}
                    {s.isPayer && " (paid)"}
                  </span>
                  {s.isPayer ? (
                    <span className="text-xs text-muted">—</span>
                  ) : (
                    <span>
                      owes <CurrencyAmount amount={s.amount} currency={result!.currency} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" disabled={!result} onClick={copyText}>
            <Copy size={16} /> Copy text
          </Button>
          <Button variant="outline" disabled={!result} onClick={copyLink}>
            <Link2 size={16} /> Copy link
          </Button>
          <Button disabled={!result} onClick={nativeShare}>
            <Share2 size={16} /> Share
          </Button>
        </div>
      </div>
    </Modal>
  )
}
