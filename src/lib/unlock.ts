import { SessionLog } from '@/types'
import { programWeeks } from '@/data/programWeeks'

/**
 * Returns the set of week numbers that are currently unlocked.
 * All weeks are always unlocked — users can access any stage.
 */
export function computeUnlockedWeeks(_sessions: SessionLog[]): number[] {
  return programWeeks.map((w) => w.weekNumber)
}

/**
 * Returns true if the given week is accessible.
 * All weeks are always accessible.
 */
export function isWeekUnlocked(_weekNumber: number, _sessions: SessionLog[]): boolean {
  return true
}

/**
 * How many sessions remain before the next week unlocks.
 * Always returns 0 — all weeks are unlocked.
 */
export function sessionsUntilUnlock(_weekNumber: number, _sessions: SessionLog[]): number {
  return 0
}

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
