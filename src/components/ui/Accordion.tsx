import { createContext, useContext, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

interface AccordionCtx {
  openId: string | null
  toggle: (id: string) => void
}

const AccordionContext = createContext<AccordionCtx | null>(null)

export function Accordion({
  children,
  defaultOpenId = null,
  className,
}: {
  children: ReactNode
  defaultOpenId?: string | null
  className?: string
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId)
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id))
  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function CollapsibleCard({
  id,
  title,
  action,
  children,
}: {
  id: string
  title: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  const ctx = useContext(AccordionContext)
  const open = ctx?.openId === id

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 p-4">
        <button
          type="button"
          onClick={() => ctx?.toggle(id)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            size={18}
            className={cn("shrink-0 text-muted transition-transform", open && "rotate-180")}
          />
          <span className="text-sm font-semibold text-fg">{title}</span>
        </button>
        {action}
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
