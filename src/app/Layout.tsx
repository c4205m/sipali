import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "@/app/Navbar"

export function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-[100dvh] flex-col">
      <Navbar />
      <main key={pathname} className="mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-24 pt-4 md:pb-10">
        <Outlet />
      </main>
    </div>
  )
}
