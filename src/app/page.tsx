'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadState, loadSessions } from '@/lib/storage'
import { computeStreak, hasSessionToday } from '@/lib/streak'
import { programWeeks } from '@/data/programWeeks'
import { AppState, SessionLog } from '@/types'
import WeekCard from '@/components/WeekCard'
import BottomNav from '@/components/BottomNav'

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null)
  const [sessions, setSessions] = useState<SessionLog[]>([])

  useEffect(() => {
    const s = loadState()
    const sess = loadSessions()
    setState(s)
    setSessions(sess)
  }, [])

  if (!state) return null

  const streak = computeStreak(sessions)
  const doneToday = hasSessionToday(sessions)
  const childName = state.settings.childName
  const completedTotal = sessions.filter(s => s.completed).length

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="mx-auto max-w-lg overflow-hidden">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
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
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">🔥 {streak.current}</p>
              <p className="text-xs text-gray-500">Day streak</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{completedTotal}</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{streak.longest}</p>
              <p className="text-xs text-gray-500">Best streak</p>
            </div>
          </div>
        </div>

        {/* Start session CTA */}
        {!doneToday && (
          <Link
            href="/session"
            className="mb-6 flex items-center justify-center rounded-2xl bg-amber-400 py-5 text-xl font-bold text-white shadow-md hover:bg-amber-500 active:scale-95 transition-transform"
          >
            🎤 Start Today&apos;s Practice
          </Link>
        )}

        {doneToday && (
          <Link
            href="/session"
            className="mb-6 flex items-center justify-center rounded-2xl border-2 border-amber-300 bg-white py-4 text-lg font-bold text-amber-700 shadow-sm hover:bg-amber-50 active:scale-95 transition-transform"
          >
            🎤 Practice Again
          </Link>
        )}

        {/* Week cards */}
        <h2 className="mb-4 text-lg font-bold text-amber-900">Your 12-Week Journey</h2>
        <div className="grid gap-3">
          {programWeeks.map((week) => {
            const completedCount = sessions.filter(
              (s) => s.weekNumber === week.weekNumber && s.completed
            ).length
            const isActive = week.weekNumber === state.currentWeek

            return (
              <WeekCard
                key={week.weekNumber}
                week={week}
                completedSessions={completedCount}
                isActive={isActive}
              />
            )
          })}
        </div>

        <BottomNav />
      </div>
    </main>
  )
}
