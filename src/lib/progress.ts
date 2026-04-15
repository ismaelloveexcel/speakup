import { SessionLog, ProgressMetrics } from '@/types'
import { computeStreak } from './streak'
import { programWeeks } from '@/data/programWeeks'

export interface WeekStats {
  weekNumber: number
  title: string
  sessions: number
  totalMinutes: number
  averageConfidence: number
  target: number
}

export function computeProgress(sessions: SessionLog[]): ProgressMetrics {
  const completed = sessions.filter((s) => s.completed)

  const totalSessions = completed.length
  const totalMinutes = completed.reduce((sum, s) => sum + s.durationMinutes, 0)
  const averageConfidence =
    totalSessions === 0
      ? 0
      : Math.round((completed.reduce((sum, s) => sum + s.confidence, 0) / totalSessions) * 10) / 10

  // Sessions per week
  const sessionsByWeek: Record<number, number> = {}
  programWeeks.forEach((w) => {
    sessionsByWeek[w.weekNumber] = completed.filter(
      (s) => s.weekNumber === w.weekNumber
    ).length
  })

  // Week completion %: how many weeks have met their minSessionsToUnlockNext target
  const weeksCompleted = programWeeks.filter(
    (w) =>
      w.minSessionsToUnlockNext > 0 &&
      (sessionsByWeek[w.weekNumber] ?? 0) >= w.minSessionsToUnlockNext
  ).length
  const weekCompletionPct = Math.round((weeksCompleted / programWeeks.length) * 100)

  return {
    totalSessions,
    totalMinutes,
    averageConfidence,
    weekCompletionPct,
    streak: computeStreak(sessions),
    sessionsByWeek,
  }
}

/** Detailed per-week stats for the parent dashboard */
export function computeWeekStats(sessions: SessionLog[]): WeekStats[] {
  const completed = sessions.filter((s) => s.completed)

  return programWeeks.map((w) => {
    const weekSessions = completed.filter((s) => s.weekNumber === w.weekNumber)
    const totalMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const averageConfidence =
      weekSessions.length === 0
        ? 0
        : Math.round((weekSessions.reduce((sum, s) => sum + s.confidence, 0) / weekSessions.length) * 10) / 10

    return {
      weekNumber: w.weekNumber,
      title: w.title,
      sessions: weekSessions.length,
      totalMinutes,
      averageConfidence,
      target: w.minSessionsToUnlockNext || 5,
    }
  })
}

export function getWeekSessions(sessions: SessionLog[], weekNumber: number): SessionLog[] {
  return sessions.filter((s) => s.weekNumber === weekNumber && s.completed)
}

export function getRecentSessions(sessions: SessionLog[], limit = 5): SessionLog[] {
  return [...sessions]
    .filter((s) => s.completed)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}
