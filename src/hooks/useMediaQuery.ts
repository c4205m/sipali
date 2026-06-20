import { useEffect, useState } from "react"

// Subscribe to a CSS media query. SSR-safe (defaults to false).
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return matches
}

// True on phone-width viewports (below the md breakpoint).
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)")
}
