import * as RSwitch from "@radix-ui/react-switch"
import { cn } from "@/lib/cn"

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
}

export function Switch({ checked, onCheckedChange, disabled, id, className }: SwitchProps) {
  return (
    <RSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border border-border transition-colors",
        "data-[state=checked]:bg-brand data-[state=unchecked]:bg-surface-3",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        "disabled:opacity-50",
        className,
      )}
    >
      <RSwitch.Thumb
        className={cn(
          "block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform",
          "data-[state=checked]:translate-x-6",
        )}
      />
    </RSwitch.Root>
  )
}

// Switch with label + optional description in a row.
export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-fg">{label}</p>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
