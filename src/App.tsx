import { HashRouter } from "react-router-dom"
import { ToastProvider } from "@/components/ui/Toast"
import { AppRoutes } from "@/app/router"
import { useSeed } from "@/hooks/useSeed"
import { Spinner } from "@/components/ui/Spinner"

export default function App() {
  const ready = useSeed()

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner size={24} className="text-muted" />
      </div>
    )
  }

  return (
    <ToastProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ToastProvider>
  )
}
