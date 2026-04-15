'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadSessions, loadSettings, exportData } from '@/lib/storage'
import { computeProgress, computeWeekStats, getRecentSessions, WeekStats } from '@/lib/progress'
import { ProgressMetrics, SessionLog, AppSettings } from '@/types'

export default function ParentDashboard() {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null)
  const [weekStats, setWeekStats] = useState<WeekStats[]>([])
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
      setWeekStats(computeWeekStats(sessions))
      setRecent(getRecentSessions(sessions, 15))
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
            className="w-full rounded-xl bg-amber-400 py-3 font-bold text-white hover:bg-amber-500 active:scale-95 transition-transform"
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
          <Link href="/" className="rounded-full bg-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-300">
            ← Exit
          </Link>
        </div>

        {/* Key metrics */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Sessions', value: metrics.totalSessions, icon: '🎤' },
            { label: 'Minutes', value: metrics.totalMinutes, icon: '⏱' },
            { label: 'Avg confidence', value: `${metrics.averageConfidence}/5`, icon: '⭐' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-2xl bg-white p-4 shadow-sm text-center">
              <p className="text-2xl">{icon}</p>
              <p className="mt-1 text-xl font-bold text-amber-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Streak card */}
        <div className="mb-6 rounded-2xl bg-amber-400 p-5 text-white shadow-sm">
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold">🔥 {metrics.streak.current}</p>
              <p className="text-sm opacity-80">Current streak</p>
            </div>
            <div className="h-10 w-px bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-bold">🏅 {metrics.streak.longest}</p>
              <p className="text-sm opacity-80">Best streak</p>
            </div>
            <div className="h-10 w-px bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-bold">🏆 {metrics.weekCompletionPct}%</p>
              <p className="text-sm opacity-80">Complete</p>
            </div>
          </div>
        </div>

        {/* Confidence trend */}
        {recent.length > 0 && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-gray-800">Confidence Over Time</h2>
            <div className="flex items-end gap-1.5 h-20">
              {recent.slice().reverse().map((s) => (
                <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-amber-400 transition-all"
                    style={{ height: `${(s.confidence / 5) * 64}px` }}
                    title={`${s.date}: ${s.confidence}/5`}
                  />
                  <span className="text-xs text-gray-400">{s.confidence}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">Last {recent.length} sessions (oldest → newest)</p>
          </div>
        )}

        {/* Per-week detailed table */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">Week-by-Week Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-2">Week</th>
                  <th className="pb-2 px-2 text-center">Sessions</th>
                  <th className="pb-2 px-2 text-center">Minutes</th>
                  <th className="pb-2 px-2 text-center">Confidence</th>
                  <th className="pb-2 pl-2 text-right">Progress</th>
                </tr>
              </thead>
              <tbody>
                {weekStats.map((ws) => {
                  const pct = Math.min(100, Math.round((ws.sessions / ws.target) * 100))
                  const hasData = ws.sessions > 0
                  return (
                    <tr key={ws.weekNumber} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-2">
                        <p className="font-medium text-gray-700">W{ws.weekNumber}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[100px]">{ws.title}</p>
                      </td>
                      <td className="py-2 px-2 text-center font-medium text-gray-700">
                        {ws.sessions}/{ws.target}
                      </td>
                      <td className="py-2 px-2 text-center text-gray-600">
                        {hasData ? `${ws.totalMinutes}m` : '—'}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {hasData ? (
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            ws.averageConfidence >= 4 ? 'bg-green-100 text-green-700' :
                            ws.averageConfidence >= 3 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {ws.averageConfidence}/5
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2 pl-2">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 rounded-full bg-amber-100">
                            <div
                              className="h-2 rounded-full bg-amber-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent sessions log */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">Session Log</h2>
          {recent.length === 0 ? (
            <p className="text-gray-400">No sessions recorded yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {recent.map((s) => (
                <div key={s.id} className="flex items-start justify-between rounded-lg bg-amber-50 px-3 py-2">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-medium text-gray-700 truncate">{s.prompt}</p>
                    <p className="text-xs text-gray-400">W{s.weekNumber} · {s.date} · {s.durationMinutes} min</p>
                  </div>
                  <span className="text-base shrink-0">{'⭐'.repeat(s.confidence)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="w-full rounded-xl border-2 border-amber-300 bg-white py-3 font-medium text-amber-700 hover:bg-amber-50 active:scale-95 transition-transform"
        >
          {exported ? '✅ Exported!' : '⬇️ Export Data (JSON)'}
        </button>
      </div>
    </main>
  )
}
