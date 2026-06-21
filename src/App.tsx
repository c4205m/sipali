import { useEffect } from "react"
import { HashRouter } from "react-router-dom"
import { ToastProvider } from "@/components/ui/Toast"
import { AppRoutes } from "@/app/router"
import { useSeed } from "@/hooks/useSeed"

// Fade out and remove the inline boot aurora (index.html) once seeding is done.
// The boot layer covers the app until then, so there's no loader swap / flash.
function dismissBoot() {
  const el = document.getElementById("boot")
  if (!el) return
  el.classList.add("hide")
  setTimeout(() => el.remove(), 500)
}

export default function App() {
  const ready = useSeed()

  useEffect(() => {
    if (ready) dismissBoot()
  }, [ready])

  if (!ready) return null

  return (
    <ToastProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ToastProvider>
  )
}
