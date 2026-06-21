import { DEFAULT_ACCENT } from "@/types"

function hexToRgbTriple(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

export function applyAccent(hex: string | undefined): void {
  const triple = hexToRgbTriple(hex ?? DEFAULT_ACCENT) ?? hexToRgbTriple(DEFAULT_ACCENT)!
  document.documentElement.style.setProperty("--brand-rgb", triple)
}
