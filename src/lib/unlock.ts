import { SessionLog } from '@/types'
import { programWeeks } from '@/data/programWeeks'

/**
 * Returns the set of week numbers that are currently unlocked.
 * Week 1 is always unlocked.
 * Each subsequent week unlocks when the previous week has >= minSessionsToUnlockNext completed sessions.
 */
export function computeUnlockedWeeks(sessions: SessionLog[]): number[] {
  const unlocked: number[] = [1]

  for (let i = 0; i < programWeeks.length - 1; i++) {
    const week = programWeeks[i]
    const completedInWeek = sessions.filter(
      (s) => s.weekNumber === week.weekNumber && s.completed
    ).length

    if (completedInWeek >= week.minSessionsToUnlockNext) {
      unlocked.push(week.weekNumber + 1)
    } else {
      // Lock is sequential — if week N is locked, N+1..12 are also locked
      break
    }
  }

  return unlocked
}

/**
 * Returns true if the given week is accessible.
 */
export function isWeekUnlocked(weekNumber: number, sessions: SessionLog[]): boolean {
  return computeUnlockedWeeks(sessions).includes(weekNumber)
}

/**
 * How many sessions remain before the next week unlocks.
 */
export function sessionsUntilUnlock(weekNumber: number, sessions: SessionLog[]): number {
  const week = programWeeks.find((w) => w.weekNumber === weekNumber)
  if (!week || week.minSessionsToUnlockNext === 0) return 0

  const completed = sessions.filter(
    (s) => s.weekNumber === weekNumber && s.completed
  ).length

  return Math.max(0, week.minSessionsToUnlockNext - completed)
}

/**
 * Returns the highest week the child has actively started (has at least 1 session).
 */
export function getActiveWeek(sessions: SessionLog[], unlockedWeeks: number[]): number {
  if (sessions.length === 0) return 1
  const started = sessions.map((s) => s.weekNumber)
  const maxStarted = Math.max(...started)
  // Stay on the highest started week that is still unlocked
  return unlockedWeeks.includes(maxStarted) ? maxStarted : Math.max(...unlockedWeeks)
}
