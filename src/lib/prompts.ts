import { SessionLog } from '@/types'
import { programWeeks } from '@/data/programWeeks'

/**
 * Returns a prompt for today's session using deterministic rotation:
 * 1. If there is already a completed session today for this week, returns the same prompt.
 * 2. Never repeats a prompt already used in this week's completed sessions.
 * 3. Rotates through prompts by day-of-year index (not random).
 * 4. If all prompts exhausted (>10 sessions in a week), cycles from start.
 */
export function getTodayPrompt(weekNumber: number, sessions: SessionLog[]): string {
  const week = programWeeks.find((w) => w.weekNumber === weekNumber)
  if (!week) return 'Tell me about your day.'

  const today = new Date().toISOString().split('T')[0]

  // If there's already a session today in this week, return the same prompt
  const todaySession = sessions.find(
    (s) => s.date === today && s.weekNumber === weekNumber && s.completed
  )
  if (todaySession) return todaySession.prompt

  const usedThisWeek = sessions
    .filter((s) => s.weekNumber === weekNumber && s.completed)
    .map((s) => s.prompt)

  const available = week.prompts.filter((p) => !usedThisWeek.includes(p))

  // All prompts used — cycle from beginning
  const pool = available.length > 0 ? available : week.prompts

  // Deterministic pick: day-of-year mod pool length
  const dayOfYear = getDayOfYear(new Date())
  return pool[dayOfYear % pool.length]
}

/**
 * Returns a different prompt on demand (for "try another topic").
 * Excludes the current prompt and already-used prompts.
 */
export function getAlternatePrompt(
  weekNumber: number,
  currentPrompt: string,
  sessions: SessionLog[]
): string {
  const week = programWeeks.find((w) => w.weekNumber === weekNumber)
  if (!week) return currentPrompt

  const usedThisWeek = sessions
    .filter((s) => s.weekNumber === weekNumber && s.completed)
    .map((s) => s.prompt)

  const available = week.prompts.filter(
    (p) => p !== currentPrompt && !usedThisWeek.includes(p)
  )

  if (available.length === 0) return currentPrompt

  const dayOfYear = getDayOfYear(new Date())
  return available[(dayOfYear + 1) % available.length]
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}
