import { useEffect, useState } from "react"
import { seedIfEmpty } from "@/db/seed"

// Run the one-time default seed before rendering data-dependent UI.
export function useSeed(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let active = true
    seedIfEmpty()
      .catch((e) => console.error("seed failed", e))
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])
  return ready
}
