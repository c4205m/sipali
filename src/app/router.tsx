import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/app/Layout"
import { Spinner } from "@/components/ui/Spinner"

// Lazy-load pages so heavy deps (recharts, etc.) load on demand.
const Home = lazy(() => import("@/pages/Home"))
const Ledger = lazy(() => import("@/pages/Ledger"))
const Stats = lazy(() => import("@/pages/Stats"))
const Settings = lazy(() => import("@/pages/Settings"))
const Design = lazy(() => import("@/pages/Design"))
const SplitView = lazy(() => import("@/pages/SplitView"))

function PageFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Spinner size={22} className="text-muted" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
          <Route path="design" element={<Design />} />
        </Route>
        {/* Standalone — no navbar, for shared split links. */}
        <Route path="split" element={<SplitView />} />
        {/* Unknown routes fall back to Home. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
