'use client'

import { useEffect, useState } from 'react'
import { loadSessions } from '@/lib/storage'
import { computeProgress, getRecentSessions } from '@/lib/progress'
import { ProgressMetrics, SessionLog } from '@/types'
import { programWeeks } from '@/data/programWeeks'
import ProgressCard from '@/components/ProgressCard'
import BottomNav from '@/components/BottomNav'

export default function ProgressPage() {
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null)
  const [recent, setRecent] = useState<SessionLog[]>([])

  useEffect(() => {
    const sessions = loadSessions()
    setMetrics(computeProgress(sessions))
    setRecent(getRecentSessions(sessions, 5))
  }, [])

  if (!metrics) return null

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="mx-auto max-w-lg overflow-hidden">
        <h1 className="mb-6 text-2xl font-bold text-amber-900">My Progress 📊</h1>

        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <ProgressCard icon="🎤" label="Sessions" value={metrics.totalSessions} />
          <ProgressCard icon="⏱" label="Minutes spoken" value={metrics.totalMinutes} />
          <ProgressCard icon="⭐" label="Avg confidence" value={`${metrics.averageConfidence}/5`} />
          <ProgressCard icon="🏆" label="Programme done" value={`${metrics.weekCompletionPct}%`} />
        </div>

        {/* Streak */}
        <div className="mb-6 rounded-2xl bg-amber-400 p-5 text-white shadow-sm">
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold">🔥 {metrics.streak.current}</p>
              <p className="text-sm opacity-80">Current streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">🏅 {metrics.streak.longest}</p>
              <p className="text-sm opacity-80">Best streak</p>
            </div>
          </div>
        </div>

        {/* Week progress */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">Week by Week</h2>
          <div className="space-y-3">
            {programWeeks.map((week) => {
              const done = metrics.sessionsByWeek[week.weekNumber] ?? 0
              const target = week.targetSessions || 5
              const pct = Math.min(100, Math.round((done / target) * 100))
              return (
                <div key={week.weekNumber}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-700">W{week.weekNumber}: {week.title}</span>
                    <span className="font-medium text-gray-500">{done}/{target}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-amber-100">
                    <div
                      className="h-2.5 rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">Recent Sessions</h2>
          {recent.length === 0 ? (
            <p className="text-gray-400">No sessions yet — start your first one!</p>
          ) : (
            <div className="space-y-3">
              {recent.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.prompt}</p>
                    <p className="text-xs text-gray-400">{s.date} · Week {s.weekNumber} · {s.durationMinutes} min</p>
                  </div>
                  <span className="text-lg shrink-0">{'⭐'.repeat(s.confidence)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </main>
  )
}
