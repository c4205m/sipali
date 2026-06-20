import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react"
import { uid } from "@/lib/id"
import { cn } from "@/lib/cn"

export type ToastTone = "success" | "error" | "info"

interface ToastItem {
  id: string
  message: string
  tone: ToastTone
}

interface ToastApi {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}

const TONE_CLASS: Record<ToastTone, string> = {
  success: "text-green-400",
  error: "text-red-400",
  info: "text-blue-400",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = uid("toast")
      setItems((prev) => [...prev, { id, message, tone }])
      setTimeout(() => remove(id), 3500)
    },
    [remove],
  )

  const api = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = ICONS[t.tone]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-bg/85 px-3 py-2.5 shadow-xl backdrop-blur-xl"
              >
                <Icon size={18} className={cn("shrink-0", TONE_CLASS[t.tone])} />
                <span className="flex-1 text-sm text-fg">{t.message}</span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted hover:text-fg"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
