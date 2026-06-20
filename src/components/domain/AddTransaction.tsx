import { useState } from "react"
import { Plus } from "lucide-react"
import { Drawer, Button } from "@/components/ui"
import { TxForm } from "@/components/domain/TxForm"

// Floating action button that opens the new-transaction drawer.
export function AddTransactionFab() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Add transaction"
        className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-glow transition-transform hover:scale-105 active:scale-95 md:bottom-6"
      >
        <Plus size={24} />
      </button>
      <Drawer open={open} onOpenChange={setOpen} title="New transaction">
        <TxForm onDone={() => setOpen(false)} />
      </Drawer>
    </>
  )
}

// Inline button variant (e.g. empty states).
export function AddTransactionButton({ label = "Add transaction" }: { label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} /> {label}
      </Button>
      <Drawer open={open} onOpenChange={setOpen} title="New transaction">
        <TxForm onDone={() => setOpen(false)} />
      </Drawer>
    </>
  )
}
