import { useState } from "react"
import { Plus } from "lucide-react"
import { Drawer, Button } from "@/components/ui"
import { TxForm } from "@/components/domain/TxForm"
import { cn } from "@/lib/cn"

// Round brand button + new-transaction drawer. Caller positions it via className
// (corner FAB on desktop, cradle-buried center button in the mobile navbar).
export function AddTransactionCenterButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Add transaction"
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-glow transition-transform hover:scale-105 active:translate-y-0.5 active:scale-90",
          className,
        )}
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
