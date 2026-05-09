import { format, isToday, isTomorrow, parseISO, startOfDay } from "date-fns"

export function toUtcMidnight(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date
  return startOfDay(d)
}

export function todayUtc(): Date {
  return startOfDay(new Date())
}

export function formatDateLabel(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  if (isToday(d)) return "Today"
  if (isTomorrow(d)) return "Tomorrow"
  return format(d, "EEE, MMM d")
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "EEE, MMM d · h:mm a")
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "h:mm a")
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}
