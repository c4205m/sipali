import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AlertTriangle, Copy, Check } from "lucide-react"
import { Card, CardHeader, CardTitle, Button, EmptyState, CurrencyAmount } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { decodeSplit, splitToText, shareToCode } from "@/lib/split"
import { formatMoney } from "@/lib/money"

// Standalone read-only view of a shared bill split (opened from a split link).
// No navbar — centered full-page so it reads like a shared receipt.
export default function SplitView() {
  const [params] = useSearchParams()
  const { toast } = useToast()
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const payload = params.get("d") ?? ""
  const { result, error } = useMemo(() => {
    if (!payload) return { result: null, error: "No data in link" }
    try {
      return { result: decodeSplit(payload), error: "" }
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : "Invalid link" }
    }
  }, [payload])

  async function copyText() {
    if (!result) return
    await navigator.clipboard.writeText(splitToText(result))
    setCopiedAll(true)
    toast("Summary copied", "success")
    setTimeout(() => setCopiedAll(false), 1500)
  }

  async function copyCode(name: string, code: string) {
    await navigator.clipboard.writeText(code)
    setCopiedCode(name)
    toast("Code copied — paste it in sipali", "success")
    setTimeout(() => setCopiedCode(null), 1500)
  }

  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-md">
        {error || !result ? (
          <EmptyState
            icon={<AlertTriangle size={28} />}
            title="Can't open this split"
            description={error || "Invalid link"}
          />
        ) : (
          <div className="space-y-4">
            <header className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">sipali</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{result.title}</h1>
              <p className="text-sm text-muted">
                {formatMoney(result.total, result.currency)} · paid by {result.payer}
              </p>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Who owes what</CardTitle>
              </CardHeader>
              <div className="divide-y divide-border">
                {result.shares.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-fg">
                        {s.name}
                        {s.isPayer && <span className="text-muted"> (paid)</span>}
                      </p>
                      {!s.isPayer && (
                        <p className="text-xs text-muted">owes {result.payer}</p>
                      )}
                    </div>
                    {s.isPayer ? (
                      <span className="text-xs text-muted">—</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CurrencyAmount amount={s.amount} currency={result.currency} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCode(s.name, shareToCode(result, s))}
                        >
                          {copiedCode === s.name ? <Check size={14} /> : <Copy size={14} />}
                          Code
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <p className="text-center text-xs text-muted">
              Tap <span className="text-fg">Code</span> on your name, then paste it in sipali →
              Add transaction to log your share.
            </p>

            <div className="flex justify-center">
              <Button variant="ghost" onClick={copyText}>
                {copiedAll ? <Check size={16} /> : <Copy size={16} />} Copy full summary
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
