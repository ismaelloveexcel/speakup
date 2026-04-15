'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadSessions, loadSettings, exportData } from '@/lib/storage'
import { computeProgress, getRecentSessions } from '@/lib/progress'
import { computeStreak } from '@/lib/streak'
import { ProgressMetrics, SessionLog, AppSettings } from '@/types'
import { programWeeks } from '@/data/programWeeks'

export default function ParentDashboard() {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null)
  const [recent, setRecent] = useState<SessionLog[]>([])
  const [exported, setExported] = useState(false)

  useEffect(() => {
    const s = loadSettings()
    setSettings(s)
  }, [])

  function checkPin() {
    if (!settings) return
    if (pin === settings.parentPin) {
      setUnlocked(true)
      const sessions = loadSessions()
      setMetrics(computeProgress(sessions))
      setRecent(getRecentSessions(sessions, 10))
    } else {
      setError('Wrong PIN. Try again.')
      setPin('')
    }
  }

  function handleExport() {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `speakup-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-center text-2xl font-bold text-amber-900">👩‍💼 Parent Dashboard</h1>
          <p className="mb-6 text-center text-sm text-gray-500">Enter your 4-digit PIN to continue</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && checkPin()}
            placeholder="••••"
            className="mb-4 w-full rounded-xl border-2 border-amber-200 px-4 py-3 text-center text-2xl tracking-widest focus:border-amber-400 focus:outline-none"
          />
          {error && <p className="mb-3 text-center text-sm text-red-500">{error}</p>}
          <button
            onClick={checkPin}
            className="w-full rounded-xl bg-amber-400 py-3 font-bold text-white hover:bg-amber-500"
          >
            Unlock
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-gray-400 hover:text-gray-600">
            ← Back to app
          </Link>
        </div>
      </main>
    )
  }

  if (!metrics) return null

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-900">📊 Parent Dashboard</h1>
          <Link href="/" className="text-sm text-amber-600 underline">Exit</Link>
        </div>

        {/* Key metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {[
            { label: 'Total sessions', value: metrics.totalSessions, icon: '🎤' },
            { label: 'Minutes spoken', value: metrics.totalMinutes, icon: '⏱' },
            { label: 'Avg confidence', value: `${metrics.averageConfidence}/5`, icon: '⭐' },
            { label: 'Current streak', value: `${metrics.streak.current} days`, icon: '🔥' },
            { label: 'Longest streak', value: `${metrics.streak.longest} days`, icon: '🏅' },
            { label: 'Programme', value: `${metrics.weekCompletionPct}% done`, icon: '🏆' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl">{icon}</p>
              <p className="mt-1 text-xl font-bold text-amber-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Confidence trend */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">Confidence Over Time</h2>
          <div className="flex items-end gap-1.5 h-20">
            {recent.slice().reverse().map((s, i) => (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-amber-400 transition-all"
                  style={{ height: `${(s.confidence / 5) * 64}px` }}
                  title={`${s.date}: ${s.confidence}/5`}
                />
                <span className="text-xs text-gray-400">{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400">Last {recent.length} sessions (oldest → newest)</p>
        </div>

        {/* Week breakdown */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">Week Progress</h2>
          <div className="space-y-2">
            {programWeeks.map((w) => {
              const done = metrics.sessionsByWeek[w.weekNumber] ?? 0
              const target = w.minSessionsToUnlockNext || 5
              return (
                <div key={w.weekNumber} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-gray-400">W{w.weekNumber}</span>
                  <div className="flex-1 h-2 rounded-full bg-amber-100">
                    <div
                      className="h-2 rounded-full bg-amber-400"
                      style={{ width: `${Math.min(100, (done / target) * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-gray-500">{done}/{target}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent sessions table */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">Session Log</h2>
          <div className="space-y-2 text-sm">
            {recent.map((s) => (
              <div key={s.id} className="flex items-start justify-between rounded-lg bg-amber-50 px-3 py-2">
                <div className="flex-1 mr-3">
                  <p className="font-medium text-gray-700 line-clamp-1">{s.prompt}</p>
                  <p className="text-xs text-gray-400">W{s.weekNumber} · {s.date} · {s.durationMinutes} min</p>
                </div>
                <span className="text-base">{'⭐'.repeat(s.confidence)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="w-full rounded-xl border-2 border-amber-300 bg-white py-3 font-medium text-amber-700 hover:bg-amber-50"
        >
          {exported ? '✅ Exported!' : '⬇️ Export Data (JSON)'}
        </button>
      </div>
    </main>
  )
}
