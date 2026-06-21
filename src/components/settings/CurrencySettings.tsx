import { useMemo, useState } from "react"
import { RefreshCw, Plus, Check } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CollapsibleCard,
  Field,
  Select,
  Button,
  Modal,
  Input,
  ListItem,
} from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { useSettings, saveSettings } from "@/hooks/useSettings"
import { useRates, replaceRates } from "@/hooks/useRates"
import { fetchLiveRates } from "@/lib/fx-fetch"
import { currencyOptions, currencyLabel } from "@/lib/currency-options"
import { ALL_CURRENCIES } from "@/types"

export function CurrencySettings() {
  const settings = useSettings()
  const rates = useRates()
  const { toast } = useToast()
  const [fetching, setFetching] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  if (!settings || !rates) return null
  const enabled = settings.enabledCurrencies

  function setEnabled(next: string[]) {
    // Display currency must always stay enabled (guarantees at least one).
    saveSettings({
      enabledCurrencies: Array.from(new Set([...next, settings!.displayCurrency])),
    })
  }

  async function fetchRates() {
    setFetching(true)
    try {
      const live = await fetchLiveRates(enabled)
      await replaceRates({ ...rates!.rates, ...live, USD: 1 }, "USD")
      toast("Rates updated", "success")
    } catch (e) {
      console.error(e)
      toast("Couldn't fetch rates", "error")
    } finally {
      setFetching(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Display currency</CardTitle>
        </CardHeader>
        <Field hint="Amounts across the app convert to this currency.">
          <Select
            value={settings.displayCurrency}
            onValueChange={(v) => saveSettings({ displayCurrency: v })}
            options={currencyOptions(enabled)}
          />
        </Field>
      </Card>

      <CollapsibleCard
        id="exchange-rates"
        title="Rates"
        action={
          <Button size="sm" loading={fetching} onClick={fetchRates}>
            <RefreshCw size={14} /> Fetch
          </Button>
        }
      >
        <p className="mb-2 text-xs text-muted">
          Rates fetched live. Updated {rates.updatedAt}. Gram gold (GXAU) derived from ounce gold.
        </p>
        <div className="divide-y divide-border">
          {enabled.map((code) => {
            const base = rates.rates[settings.displayCurrency]
            const v = rates.rates[code]
            const shown = base && v != null ? v / base : null
            return (
              <ListItem
                key={code}
                title={code}
                subtitle={currencyLabel(code)}
                trailing={
                  <span className="font-mono text-sm tabular-nums text-fg">
                    {shown != null ? formatRate(shown) : "—"}
                  </span>
                }
              />
            )
          })}
        </div>
        <Button
          size="sm"
          variant="outline"
          fullWidth
          className="mt-3"
          onClick={() => setPickerOpen(true)}
        >
          <Plus size={14} /> Currencies
        </Button>
      </CollapsibleCard>

      <CurrencyPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        enabled={enabled}
        pinned={[settings.displayCurrency]}
        onChange={setEnabled}
      />
    </>
  )
}

function formatRate(n: number): string {
  if (n < 0.001) return n.toExponential(2)
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

// Modal list of all currencies with toggle-to-enable.
function CurrencyPicker({
  open,
  onOpenChange,
  enabled,
  pinned,
  onChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  enabled: string[]
  pinned: string[]
  onChange: (next: string[]) => void
}) {
  const [q, setQ] = useState("")
  const set = new Set(enabled)
  const pinnedSet = new Set(pinned)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return ALL_CURRENCIES
    return ALL_CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(query) || c.label.toLowerCase().includes(query),
    )
  }, [q])

  function toggle(code: string) {
    if (pinnedSet.has(code)) return // can't disable pinned
    onChange(set.has(code) ? enabled.filter((c) => c !== code) : [...enabled, code])
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Currencies" className="max-w-md">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search currency…"
        className="mb-3"
      />
      <div className="max-h-[50vh] divide-y divide-border overflow-y-auto">
        {filtered.map((c) => {
          const on = set.has(c.code)
          const locked = pinnedSet.has(c.code)
          return (
            <ListItem
              key={c.code}
              onClick={() => toggle(c.code)}
              title={c.code}
              subtitle={c.label}
              className={locked ? "opacity-60" : ""}
              trailing={
                on ? (
                  <Check size={18} className="text-brand" />
                ) : (
                  <span className="text-xs text-muted">Add</span>
                )
              }
            />
          )
        })}
      </div>
    </Modal>
  )
}
