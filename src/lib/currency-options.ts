import { ALL_CURRENCIES } from "@/types"
import type { SelectOption } from "@/components/ui/Select"

const LABELS = new Map(ALL_CURRENCIES.map((c) => [c.code, c.label]))

// Build Select options from a list of currency codes.
export function currencyOptions(codes: string[]): SelectOption[] {
  return codes.map((code) => ({ value: code, label: `${code} — ${LABELS.get(code) ?? code}` }))
}

export function currencyLabel(code: string): string {
  return LABELS.get(code) ?? code
}
