import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isWithinInterval,
} from "date-fns"
import type { RecurringInterval, HomeInterval } from "@/types"

export const ISO = "yyyy-MM-dd"

// Today as an ISO date string (no time component).
export function todayISO(): string {
  return format(new Date(), ISO)
}

export function toISO(d: Date): string {
  return format(d, ISO)
}

export function fromISO(s: string): Date {
  return parseISO(s)
}

// Advance an ISO date by one interval step.
export function addInterval(dateISO: string, interval: RecurringInterval, steps = 1): string {
  const d = parseISO(dateISO)
  switch (interval) {
    case "daily":
      return toISO(addDays(d, steps))
    case "weekly":
      return toISO(addWeeks(d, steps))
    case "monthly":
      return toISO(addMonths(d, steps))
    case "yearly":
      return toISO(addYears(d, steps))
  }
}

export interface DateRange {
  from: Date
  to: Date
}

// Resolve a Home interval chip to a concrete date range.
export function resolveRange(
  interval: HomeInterval,
  customFrom?: string,
  customTo?: string,
): DateRange {
  const now = new Date()
  switch (interval) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) }
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) }
    case "year":
      return { from: startOfYear(now), to: endOfYear(now) }
    case "custom":
      return {
        from: customFrom ? startOfDay(parseISO(customFrom)) : startOfMonth(now),
        to: customTo ? endOfDay(parseISO(customTo)) : endOfDay(now),
      }
  }
}

export function isInRange(dateISO: string, range: DateRange): boolean {
  return isWithinInterval(parseISO(dateISO), { start: range.from, end: range.to })
}

// Human label, e.g. "Jun 20, 2026".
export function formatDate(dateISO: string, fmt = "MMM d, yyyy"): string {
  return format(parseISO(dateISO), fmt)
}
