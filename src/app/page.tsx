'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadState, loadSessions, saveState } from '@/lib/storage'
import { computeUnlockedWeeks, sessionsUntilUnlock } from '@/lib/unlock'
import { computeStreak, hasSessionToday } from '@/lib/streak'
import { programWeeks } from '@/data/programWeeks'
import { AppState, SessionLog } from '@/types'
import WeekCard from '@/components/WeekCard'

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null)
  const [sessions, setSessions] = useState<SessionLog[]>([])

  useEffect(() => {
    const s = loadState()
    const sess = loadSessions()
    const unlocked = computeUnlockedWeeks(sess)
    setState({ ...s, unlockedWeeks: unlocked })
    setSessions(sess)
  }, [])

  if (!state) return null

  const streak = computeStreak(sessions)
  const doneToday = hasSessionToday(sessions)
  const childName = state.settings.childName

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">
            Hi {childName}! 👋
          </h1>
          <p className="mt-1 text-amber-700">
            {doneToday ? "Great job — you practised today! 🎉" : "Ready to practise speaking today?"}
          </p>
        </div>
        <Link href="/parent" className="rounded-full bg-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-300">
          👩‍💼 Parent
        </Link>
      </div>

      {/* Streak bar */}
      <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-500">🔥 {streak.current}</p>
            <p className="text-sm text-gray-500">Day streak</p>
          </div>
          <div className="h-12 w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-500">{sessions.filter(s => s.completed).length}</p>
            <p className="text-sm text-gray-500">Total sessions</p>
          </div>
          <div className="h-12 w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-500">{streak.longest}</p>
            <p className="text-sm text-gray-500">Best streak</p>
          </div>
        </div>
      </div>

      {/* Start session CTA */}
      {!doneToday && (
        <Link
          href="/session"
          className="mb-8 flex items-center justify-center rounded-2xl bg-amber-400 py-5 text-xl font-bold text-white shadow-md hover:bg-amber-500 active:scale-95 transition-transform"
        >
          🎤 Start Today's Practice
        </Link>
      )}

      {/* Week cards */}
      <h2 className="mb-4 text-lg font-bold text-amber-900">Your 12-Week Journey</h2>
      <div className="grid gap-3">
        {programWeeks.map((week) => {
          const unlocked = state.unlockedWeeks.includes(week.weekNumber)
          const completedCount = sessions.filter(
            (s) => s.weekNumber === week.weekNumber && s.completed
          ).length
          const remaining = sessionsUntilUnlock(week.weekNumber, sessions)
          const isActive = week.weekNumber === state.currentWeek

          return (
            <WeekCard
              key={week.weekNumber}
              week={week}
              isUnlocked={unlocked}
              completedSessions={completedCount}
              isActive={isActive}
              remaining={remaining}
            />
          )
        })}
      </div>

      {/* Nav */}
      <nav className="mt-10 flex justify-around border-t border-amber-200 pt-6">
        <Link href="/" className="flex flex-col items-center text-amber-600">
          <span className="text-2xl">🏠</span>
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/session" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">🎤</span>
          <span className="text-xs">Session</span>
        </Link>
        <Link href="/progress" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">📊</span>
          <span className="text-xs">Progress</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">⚙️</span>
          <span className="text-xs">Settings</span>
        </Link>
      </nav>
    </main>
  )
}
