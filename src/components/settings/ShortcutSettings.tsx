import { useState } from "react"
import { Card, CardHeader, CardTitle, Input, Button } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { useSettings, saveSettings } from "@/hooks/useSettings"
import { isApplePlatform } from "@/lib/platform"

export function ShortcutSettings() {
  const settings = useSettings()
  if (!isApplePlatform || !settings) return null
  return <ShortcutForm current={settings.iosShortcutName ?? ""} />
}

function ShortcutForm({ current }: { current: string }) {
  const { toast } = useToast()
  const [name, setName] = useState(current)
  const trimmed = name.trim()

  async function save() {
    await saveSettings({ iosShortcutName: trimmed || undefined })
    toast(trimmed ? "Shortcut saved" : "Shortcut cleared", "success")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shortcuts</CardTitle>
      </CardHeader>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        Enter the exact name of an Apple Shortcut. Swipe the bolt action on a transaction to run it
        with the transaction details as JSON input.
      </p>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Shortcut name…"
          className="flex-1"
        />
        <Button variant="secondary" size="sm" onClick={save} disabled={trimmed === current}>
          Save
        </Button>
      </div>
      {current && <p className="mt-2 text-xs text-green-400">Active: {current}</p>}
    </Card>
  )
}
