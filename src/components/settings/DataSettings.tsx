import { useRef, useState } from "react"
import { Download, Upload, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, Button, Modal } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { downloadBackup, importData, clearAllData } from "@/lib/data-io"

export function DataSettings() {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  async function onImportFile(file: File) {
    try {
      const text = await file.text()
      await importData(text)
      toast("Data imported", "success")
    } catch (e) {
      console.error(e)
      toast(e instanceof Error ? e.message : "Import failed", "error")
    }
  }

  async function reset() {
    await clearAllData()
    setConfirmClear(false)
    toast("All data cleared", "success")
    // Reload so defaults re-seed cleanly.
    setTimeout(() => location.reload(), 400)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data</CardTitle>
      </CardHeader>
      <p className="mb-4 text-xs text-muted">
        Everything is stored locally in your browser. Export regularly to keep a backup.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => downloadBackup()}>
          <Download size={16} /> Export
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload size={16} /> Import
        </Button>
        <Button variant="danger" onClick={() => setConfirmClear(true)}>
          <Trash2 size={16} /> Clear all
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImportFile(f)
            e.target.value = ""
          }}
        />
      </div>

      <Modal
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear all data?"
        description="This permanently deletes every transaction, account and category. This cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={reset}>
              Delete everything
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">Consider exporting a backup first.</p>
      </Modal>
    </Card>
  )
}
