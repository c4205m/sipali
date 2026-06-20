import { Routes, Route } from "react-router-dom"
import { Layout } from "@/app/Layout"
import Home from "@/pages/Home"
import Ledger from "@/pages/Ledger"
import Stats from "@/pages/Stats"
import Settings from "@/pages/Settings"
import Design from "@/pages/Design"
import SplitView from "@/pages/SplitView"

export function AppRoutes() {
  return (
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
    </Routes>
  )
}
