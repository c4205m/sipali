// Shared chart theme tokens (kept in sync with Tailwind theme).
export const CHART = {
  grid: "rgba(255,255,255,0.06)",
  axis: "#8b93a8",
  expense: "#f87171",
  income: "#4ade80",
  transfer: "#60a5fa",
  brand: "#6e7bf2",
  // Palette for category slices without their own color.
  palette: [
    "#6e7bf2",
    "#f87171",
    "#4ade80",
    "#fb923c",
    "#38bdf8",
    "#c084fc",
    "#facc15",
    "#f472b6",
    "#34d399",
    "#a78bfa",
  ],
}

// Styling for Recharts <Tooltip contentStyle> to match the glass theme.
export const tooltipStyle = {
  background: "rgba(10,14,28,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#eaf0ff",
  fontSize: 12,
} as const

export const tooltipItemStyle = { color: "#eaf0ff" } as const
export const tooltipLabelStyle = { color: "#8b93a8", marginBottom: 4 } as const
