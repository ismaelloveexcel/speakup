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
 */
export function getActiveWeek(sessions: SessionLog[]): number {
  if (sessions.length === 0) return 1
  const started = sessions.map((s) => s.weekNumber)
  return Math.max(...started)
}
