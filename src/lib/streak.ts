import { SessionLog, StreakData } from '@/types'

/**
 * Computes a real consecutive-day streak.
 * A "day" counts if there is at least 1 completed session on that date.
 * The streak breaks if any calendar day is skipped (no completed session).
 */
export function computeStreak(sessions: SessionLog[]): StreakData {
  const completed = sessions.filter((s) => s.completed)

  if (completed.length === 0) {
    return { current: 0, longest: 0, lastSessionDate: null }
  }

  // Unique dates with at least 1 completed session, sorted ascending
  const uniqueDates = Array.from(
    new Set(completed.map((s) => s.date))
  ).sort()

  const lastSessionDate = uniqueDates[uniqueDates.length - 1]

  // ─── Current streak ────────────────────────────────────────────────────────
  // Walk backwards from today (or last session date), counting consecutive days
  const today = new Date().toISOString().split('T')[0]
  const dateSet = new Set(uniqueDates)

  let current = 0

  // If last session was not today or yesterday, streak is broken
  const daysBetween = dateDiffDays(lastSessionDate, today)
  if (daysBetween > 1) {
    current = 0
  } else {
    // Walk back from last session date
    let check = lastSessionDate
    while (dateSet.has(check)) {
      current++
      check = subtractOneDay(check)
    }
  }

  // ─── Longest streak ────────────────────────────────────────────────────────
  let longest = 0
  let running = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = dateDiffDays(uniqueDates[i - 1], uniqueDates[i])
    if (diff === 1) {
      running++
    } else {
      longest = Math.max(longest, running)
      running = 1
    }
  }
  longest = Math.max(longest, running, current)

  return { current, longest, lastSessionDate }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function dateDiffDays(earlier: string, later: string): number {
  const a = new Date(earlier).getTime()
  const b = new Date(later).getTime()
  return Math.round((b - a) / 86_400_000)
}

function subtractOneDay(dateStr: string): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

/**
 * Returns true if the child has already completed a session today.
 */
export function hasSessionToday(sessions: SessionLog[]): boolean {
  const today = new Date().toISOString().split('T')[0]
  return sessions.some((s) => s.date === today && s.completed)
}
