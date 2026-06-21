import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Card, CardHeader, CardTitle, Button } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { checkForUpdates } from "@/lib/pwa"

export function AppSettings() {
  const { toast } = useToast()
  const [checking, setChecking] = useState(false)

  async function check() {
    setChecking(true)
    try {
      const updating = await checkForUpdates()
      if (!updating) toast("You're on the latest version", "success")
    } catch {
      toast("Couldn't check for updates", "error")
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App</CardTitle>
      </CardHeader>
      <p className="mb-4 text-xs leading-relaxed text-muted">
        Updates install automatically on launch. Check manually anytime.
      </p>
      <Button variant="secondary" size="sm" onClick={check} disabled={checking}>
        <RefreshCw size={16} className={checking ? "animate-spin" : undefined} /> Check for updates
      </Button>
    </Card>
  )
}
