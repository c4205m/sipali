import { Card, Skeleton, ListSkeleton } from "@/components/ui"

// Page-load placeholder shaped like the Home layout (header, stat cards,
// upcoming row, recent list). Used as the route Suspense fallback.
export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pt-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-40" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-2 p-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </Card>
        ))}
      </div>

      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="w-56 shrink-0 space-y-3 p-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>

      <Card className="p-2">
        <ListSkeleton rows={5} />
      </Card>
    </div>
  )
}
