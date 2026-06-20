import type { ReactNode } from "react"
import { Card, CardHeader, CardTitle, EmptyState } from "@/components/ui"

// Card wrapper for a chart with title and empty fallback.
export function ChartCard({
  title,
  isEmpty,
  emptyText = "No data for this range",
  children,
}: {
  title: string
  isEmpty?: boolean
  emptyText?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {isEmpty ? (
        <EmptyState title={emptyText} className="border-0 py-8" />
      ) : (
        <div className="w-full">{children}</div>
      )}
    </Card>
  )
}
