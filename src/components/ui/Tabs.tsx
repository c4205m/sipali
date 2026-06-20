import * as RTabs from "@radix-ui/react-tabs"
import { cn } from "@/lib/cn"

export interface TabItem {
  value: string
  label: string
}

export function Tabs({
  items,
  value,
  onValueChange,
  className,
}: {
  items: TabItem[]
  value: string
  onValueChange: (v: string) => void
  className?: string
}) {
  return (
    <RTabs.Root value={value} onValueChange={onValueChange} className={className}>
      <RTabs.List className="flex gap-1 border-b border-border">
        {items.map((it) => (
          <RTabs.Trigger
            key={it.value}
            value={it.value}
            className={cn(
              "relative -mb-px px-3 py-2 text-sm font-medium transition-colors",
              "text-muted hover:text-fg",
              "data-[state=active]:text-fg data-[state=active]:border-b-2 data-[state=active]:border-brand",
            )}
          >
            {it.label}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
    </RTabs.Root>
  )
}

export const TabsContent = RTabs.Content
export const TabsRoot = RTabs.Root
