import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string"
import { formatMoney } from "@/lib/money"

export type SplitMethod = "equal" | "exact" | "percent"

export interface Participant {
  name: string
  // For "exact": amount owed. For "percent": percentage (0-100). Ignored for "equal".
  value?: number
}

export interface SplitInput {
  title: string
  total: number
  currency: string
  payer: string // name of the person who paid
  method: SplitMethod
  participants: Participant[]
}

export interface SplitShare {
  name: string
  amount: number
  isPayer: boolean
}

export interface SplitResult {
  title: string
  total: number
  currency: string
  payer: string
  shares: SplitShare[]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Compute each participant's share. Equal distributes the rounding remainder
// onto the first participant so shares sum exactly to the total.
export function computeSplit(input: SplitInput): SplitResult {
  const { participants, total, method } = input
  const n = participants.length || 1
  let amounts: number[]

  if (method === "equal") {
    const base = round2(total / n)
    amounts = participants.map(() => base)
    const drift = round2(total - base * n)
    if (amounts.length) amounts[0] = round2(amounts[0] + drift)
  } else if (method === "percent") {
    amounts = participants.map((p) => round2((total * (p.value ?? 0)) / 100))
  } else {
    amounts = participants.map((p) => round2(p.value ?? 0))
  }

  return {
    title: input.title,
    total,
    currency: input.currency,
    payer: input.payer,
    shares: participants.map((p, i) => ({
      name: p.name,
      amount: amounts[i],
      isPayer: p.name === input.payer,
    })),
  }
}

// Sum of participant values (for live validation feedback in the form).
export function valueSum(input: SplitInput): number {
  return round2(input.participants.reduce((s, p) => s + (p.value ?? 0), 0))
}

// Validate a split; returns an error string or null when valid.
export function validateSplit(input: SplitInput): string | null {
  if (!input.title.trim()) return "Add a title"
  if (input.total <= 0) return "Enter a total amount"
  if (input.participants.length < 2) return "Add at least two people"
  if (input.participants.some((p) => !p.name.trim())) return "Name everyone"
  if (input.method === "exact" && valueSum(input) !== round2(input.total))
    return "Exact amounts must add up to the total"
  if (input.method === "percent" && valueSum(input) !== 100)
    return "Percentages must add up to 100"
  return null
}

// Plain-text summary for pasting into chat.
export function splitToText(r: SplitResult): string {
  const lines = [`${r.title} — ${formatMoney(r.total, r.currency)}`, `Paid by ${r.payer}`, ""]
  for (const s of r.shares) {
    if (s.isPayer) continue
    lines.push(`${s.name} owes ${r.payer}: ${formatMoney(s.amount, r.currency)}`)
  }
  return lines.join("\n")
}

// Compress a result into a URL-safe payload for the share link.
export function encodeSplit(r: SplitResult): string {
  return compressToEncodedURIComponent(JSON.stringify(r))
}

export function decodeSplit(payload: string): SplitResult {
  const json = decompressFromEncodedURIComponent(payload)
  if (!json) throw new Error("Invalid split link")
  return JSON.parse(json) as SplitResult
}

export function buildSplitUrl(r: SplitResult): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#/split?d=${encodeSplit(r)}`
}

// ── Per-person "sipali code" ────────────────────────────────────────────────
// A short, pasteable code (not a URL) encoding one person's owed amount, so the
// ower can fill an expense in their own app via "paste split code".
export interface OweCode {
  title: string
  amount: number
  currency: string
  payer: string
}

const CODE_PREFIX = "SIPALI1:"

export function encodeOweCode(o: OweCode): string {
  const payload = compressToEncodedURIComponent(
    JSON.stringify([o.title, o.amount, o.currency, o.payer]),
  )
  return CODE_PREFIX + payload
}

export function decodeOweCode(code: string): OweCode {
  const trimmed = code.trim()
  const raw = trimmed.startsWith(CODE_PREFIX) ? trimmed.slice(CODE_PREFIX.length) : trimmed
  const json = decompressFromEncodedURIComponent(raw)
  if (!json) throw new Error("Invalid code")
  const arr = JSON.parse(json)
  if (!Array.isArray(arr) || arr.length < 3) throw new Error("Invalid code")
  return { title: String(arr[0]), amount: Number(arr[1]), currency: String(arr[2]), payer: String(arr[3] ?? "") }
}

// Build the owe-code for a single share within a result.
export function shareToCode(r: SplitResult, share: SplitShare): string {
  return encodeOweCode({
    title: r.title,
    amount: share.amount,
    currency: r.currency,
    payer: r.payer,
  })
}
