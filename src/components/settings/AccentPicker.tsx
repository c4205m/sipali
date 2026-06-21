import { useRef } from "react"
import { Check } from "lucide-react"
import { useSettings, saveSettings } from "@/hooks/useSettings"
import { applyAccent } from "@/lib/accent"
import { ACCENT_OPTIONS, DEFAULT_ACCENT } from "@/types"
import { cn } from "@/lib/cn"

export function AccentPicker() {
  const settings = useSettings()
  const saveTimer = useRef<number | undefined>(undefined)
  if (!settings) return null

  const current = (settings.accentColor ?? DEFAULT_ACCENT).toLowerCase()

  function pick(hex: string) {
    clearTimeout(saveTimer.current)
    applyAccent(hex)
    saveSettings({ accentColor: hex })
  }

  function pickLive(hex: string) {
    applyAccent(hex)
    clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => saveSettings({ accentColor: hex }), 250)
  }

  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto py-1">
      {ACCENT_OPTIONS.map((o) => {
        const active = o.hex.toLowerCase() === current
        return (
          <button
            key={o.hex}
            type="button"
            aria-label={o.label}
            onClick={() => pick(o.hex)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-bg transition-all",
              active ? "ring-fg" : "ring-transparent",
            )}
            style={{ background: o.hex }}
          >
            {active && <Check size={16} className="text-white" />}
          </button>
        )
      })}
      <label
        className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-sm font-medium text-white"
        style={{ background: current }}
      >
        +
        <input
          type="color"
          value={current}
          onChange={(e) => pickLive(e.target.value)}
          className="absolute h-0 w-0 opacity-0"
        />
      </label>
    </div>
  )
}
