import { NavLink } from "react-router-dom"
import { Home, ListOrdered, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/cn"

const ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/ledger", label: "Ledger", icon: ListOrdered },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
]

// Top bar on desktop, bottom tab bar on mobile.
export function Navbar() {
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

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-bg/90 backdrop-blur md:hidden">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
                isActive ? "text-brand" : "text-muted",
              )
            }
          >
            <it.icon size={20} />
            {it.label}
          </NavLink>
        ))}
      </nav>
    </>
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
  dev?: boolean
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
