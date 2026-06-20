import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/dexie"
import { templateToUpcoming } from "@/lib/recurring"
import { planToUpcoming, isPlanComplete } from "@/lib/installment"
import { addInterval } from "@/lib/dates"
import type { UpcomingItem } from "@/types"

// Projected due items from active recurring templates + installment plans,
// sorted by due date (overdue first). `horizonDays` caps how far ahead to
// look; 0 means no cap.
export function useUpcoming(horizonDays = 60): UpcomingItem[] | undefined {
  return useLiveQuery(async () => {
    const [templates, plans] = await Promise.all([
      db.recurringTemplates.toArray(),
      db.installmentPlans.toArray(),
    ])
    const cutoff =
      horizonDays > 0
        ? addInterval(new Date().toISOString().slice(0, 10), "daily", horizonDays)
        : null

    const items: UpcomingItem[] = [
      ...templates.filter((t) => !t.isArchived).map(templateToUpcoming),
      ...plans
        .filter((p) => !p.isArchived && !isPlanComplete(p))
        .map(planToUpcoming),
    ]

    return items
      .filter((i) => (cutoff ? i.dueDate <= cutoff : true))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [horizonDays])
}
