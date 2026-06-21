import type { ReactNode } from "react"
import { Card, CardHeader, CardTitle, EmptyState, Skeleton } from "@/components/ui"

// Card wrapper for a chart with title, loading skeleton and empty fallback.
export function ChartCard({
  title,
  loading,
  isEmpty,
  emptyText = "No data for this range",
  children,
}: {
  title: string
  loading?: boolean
  isEmpty?: boolean
  emptyText?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {loading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : isEmpty ? (
        <EmptyState title={emptyText} className="border-0 py-8" />
      ) : (
        <div className="w-full">{children}</div>
      )}
    </Card>
  )
}
