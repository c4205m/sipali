import { ExternalLink } from "lucide-react"
import { Card } from "@/components/ui"
import { CurrencySettings } from "@/components/settings/CurrencySettings"
import { CategorySettings } from "@/components/settings/CategorySettings"
import { AccountSettings } from "@/components/settings/AccountSettings"
import { DataSettings } from "@/components/settings/DataSettings"
import { ShortcutSettings } from "@/components/settings/ShortcutSettings"
import { AppSettings } from "@/components/settings/AppSettings"

const GITHUB_URL = "https://github.com/c4205m/sipali"

// Single scrolling page — every section stacked, no tabs.
export default function Settings() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <CurrencySettings />
      <CategorySettings />
      <AccountSettings />
      <DataSettings />
      <ShortcutSettings />
      <AppSettings />

      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="block">
        <Card className="flex items-center gap-3 transition-colors hover:bg-surface-2">
          <ExternalLink size={16} className="shrink-0 text-muted" />
          <span className="text-sm text-fg">View on GitHub</span>
        </Card>
      </a>
    </div>
  )
}
