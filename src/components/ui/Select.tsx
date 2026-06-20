import * as RSelect from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"
import { notifySelectOpenChange } from "@/lib/overlay"

export interface SelectOption {
  value: string
  label: string
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  className,
  disabled,
}: {
  options: SelectOption[]
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}) {
  return (
    <RSelect.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      onOpenChange={notifySelectOpenChange}
    >
      <RSelect.Trigger
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg",
          "focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
          "disabled:opacity-50",
          className,
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <ChevronDown size={16} className="text-muted" />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-bg/85 shadow-xl backdrop-blur-xl animate-fade-in"
        >
          <RSelect.Viewport className="p-1">
            {options.map((o) => (
              <RSelect.Item
                key={o.value}
                value={o.value}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-fg outline-none",
                  "data-[highlighted]:bg-surface-3 data-[state=checked]:text-brand",
                )}
              >
                <RSelect.ItemText>{o.label}</RSelect.ItemText>
                <RSelect.ItemIndicator>
                  <Check size={15} />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  )
}
