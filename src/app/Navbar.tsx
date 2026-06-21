import { NavLink } from "react-router-dom"
import { Home, ListOrdered, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/cn"
import { AddTransactionCenterButton } from "@/components/domain/AddTransaction"

const ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/ledger", label: "Ledger", icon: ListOrdered },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
]

const cradle = {
  WebkitMaskImage: "radial-gradient(circle 36px at 50% -4px, transparent 0 35px, #000 41px)",
  maskImage: "radial-gradient(circle 36px at 50% -4px, transparent 0 35px, #000 41px)",
  filter: "drop-shadow(0 -0.5px 0 rgba(255,255,255,0.12))",
}

// Top bar on desktop, bottom cradle bar on mobile.
export function Navbar() {
  const left = ITEMS.slice(0, 2)
  const right = ITEMS.slice(2)
  return (
    <>
      {/* Desktop / tablet */}
      <header className="sticky top-0 z-30 hidden border-b border-border bg-bg/80 backdrop-blur md:block">
        <nav className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-3">
          <span className="mr-3 font-semibold tracking-tight text-fg">sipali</span>
          {ITEMS.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}
        </nav>
      </header>
      <AddTransactionCenterButton className="fixed bottom-6 right-4 z-40 hidden md:flex" />

      {/* Mobile bottom cradle bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 h-16 md:hidden">
        <div className="absolute inset-0 bg-surface backdrop-blur" style={cradle} />
        <div className="relative flex h-full">
          {left.map((it) => (
            <MobileItem key={it.to} {...it} />
          ))}
          <div className="w-16 shrink-0" />
          {right.map((it) => (
            <MobileItem key={it.to} {...it} />
          ))}
        </div>
        <AddTransactionCenterButton className="absolute left-1/2 top-0 z-40 -translate-x-1/2 -translate-y-1/2" />
      </nav>
    </>
  )
}

function MobileItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px]",
          isActive ? "text-brand" : "text-muted",
        )
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          isActive ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
        )
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )
}
