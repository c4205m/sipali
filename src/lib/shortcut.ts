import type { Transaction } from "@/types"

// Hand a transaction to the Apple Shortcuts app via URL scheme. Runs entirely
// on-device; the named Shortcut receives the payload as JSON text input.
export function runShortcut(tx: Transaction, name: string) {
  const payload = JSON.stringify({
    name: tx.name,
    amount: tx.price,
    currency: tx.currency,
    type: tx.type,
    account: tx.account,
    date: tx.date,
    isPlan: tx.isInstallment && !tx.installmentIndex,
    installmentIndex: tx.installmentIndex,
    installmentCount: tx.installmentCount ?? tx.installmentTotal,
  })
  window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(name)}&input=text&text=${encodeURIComponent(payload)}`
}
