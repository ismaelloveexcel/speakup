import { SessionLog } from '@/types'
import { programWeeks } from '@/data/programWeeks'

/**
 * Returns the highest week the child has actively started (has at least 1 session).
 * Filters out sessions with invalid weekNumber values and clamps to valid range.
 */
export function getActiveWeek(sessions: SessionLog[]): number {
  const validWeekNumbers = sessions
    .map((s) => s.weekNumber)
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= programWeeks.length)
  if (validWeekNumbers.length === 0) return 1
  return Math.max(...validWeekNumbers)
}
