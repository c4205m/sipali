import { Outlet } from "react-router-dom"
import { Navbar } from "@/app/Navbar"

// App shell: nav + scrollable page content. Extra bottom padding leaves room
// for the mobile tab bar.
export function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-4 md:pb-10">
        <Outlet />
      </main>
    </div>
  )
}
