'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadState, loadSessions, addSession, saveState, generateId, todayISO } from '@/lib/storage'
import { getActiveWeek } from '@/lib/unlock'
import { getTodayPrompt, getAlternatePrompt } from '@/lib/prompts'
import { programWeeks } from '@/data/programWeeks'
import Timer from '@/components/Timer'
import Recorder from '@/components/Recorder'
import BottomNav from '@/components/BottomNav'
import { SessionLog, WeekDurations } from '@/types'

type SessionPhase = 'ready' | 'warmup' | 'practice' | 'speaking' | 'rating'

export default function SessionPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [weekNumber, setWeekNumber] = useState(1)
  const [durations, setDurations] = useState<WeekDurations>({ warmUp: 30, practice: 60, speaking: 120 })
  const [phase, setPhase] = useState<SessionPhase>('ready')
  const [confidence, setConfidence] = useState(0)
  const [recordingUrl, setRecordingUrl] = useState<string | undefined>()
  const [totalElapsed, setTotalElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const sessions = loadSessions()
    const active = getActiveWeek(sessions)
    setWeekNumber(active)

    const week = programWeeks.find((w) => w.weekNumber === active)
    if (week) {
      setDurations(week.durations)
    }

    setPrompt(getTodayPrompt(active, sessions))
  }, [])

  // Track total elapsed seconds across all phases
  useEffect(() => {
    if (phase === 'warmup' || phase === 'practice' || phase === 'speaking') {
      elapsedRef.current = 0
      elapsedTimerRef.current = setInterval(() => {
        elapsedRef.current += 1
      }, 1000)
    }

    return () => {
      if (elapsedTimerRef.current) {
        setTotalElapsed((prev) => prev + elapsedRef.current)
        clearInterval(elapsedTimerRef.current)
        elapsedTimerRef.current = null
      }
    }
  }, [phase])

  const handleWarmupComplete = useCallback(() => {
    setPhase('practice')
  }, [])

  const handlePracticeComplete = useCallback(() => {
    setPhase('speaking')
  }, [])

  const handleSpeakingComplete = useCallback(() => {
    setPhase('rating')
  }, [])

  function startSession() {
    setPhase('warmup')
  }

  function skipToNext() {
    if (phase === 'warmup') setPhase('practice')
    else if (phase === 'practice') setPhase('speaking')
    else if (phase === 'speaking') setPhase('rating')
  }

  function submitSession() {
    if (confidence === 0) return

    // Calculate total duration including the final phase
    const finalTotal = totalElapsed + elapsedRef.current
    const session: SessionLog = {
      id: generateId(),
      date: todayISO(),
      weekNumber,
      prompt,
      durationMinutes: Math.max(1, Math.round(finalTotal / 60)),
      confidence,
      recordingUrl,
      completed: true,
    }
    addSession(session)

    // Update state
    const state = loadState()
    saveState({ ...state, unlockedWeeks: programWeeks.map((w) => w.weekNumber) })

    router.push('/progress')
  }

  function swapPrompt() {
    const sessions = loadSessions()
    setPrompt(getAlternatePrompt(weekNumber, prompt, sessions))
  }

  const week = programWeeks.find((w) => w.weekNumber === weekNumber)

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="mx-auto max-w-md overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-900">Week {weekNumber} Session</h1>
          <Link href="/" className="text-sm text-amber-600 underline hover:text-amber-800">
            ← Home
          </Link>
        </div>

        {/* Prompt card */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-500">Today&apos;s Topic</p>
          <p className="text-lg font-medium text-gray-800 leading-relaxed">{prompt}</p>
          {phase === 'ready' && (
            <button
              onClick={swapPrompt}
              className="mt-3 text-sm text-amber-600 underline hover:text-amber-800"
            >
              Try a different topic
            </button>
          )}
        </div>

        {/* Phase indicators */}
        {phase !== 'ready' && phase !== 'rating' && (() => {
          const timerPhases = ['warmup', 'practice', 'speaking'] as const
          const currentIdx = timerPhases.indexOf(phase as typeof timerPhases[number])
          return (
            <div className="mb-4 flex items-center justify-center gap-2">
              {timerPhases.map((p, pIdx) => {
                const isCurrent = phase === p
                const isPast = pIdx < (currentIdx >= 0 ? currentIdx : -1)
                return (
                  <div
                    key={p}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                      isCurrent
                        ? 'bg-amber-400 text-white'
                        : isPast
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCurrent ? '●' : isPast ? '✓' : '○'} {p === 'warmup' ? 'Warm-up' : p === 'practice' ? 'Practice' : 'Speaking'}
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Timers */}
        {phase !== 'ready' && phase !== 'rating' && (
          <div className="mb-6 space-y-4">
            {phase === 'warmup' && (
              <div>
                <Timer
                  label="🌟 Warm-up"
                  totalSeconds={durations.warmUp}
                  isActive={true}
                  onComplete={handleWarmupComplete}
                />
                <p className="mt-2 text-center text-sm text-gray-500">
                  Take a deep breath. Think about what you want to say.
                </p>
              </div>
            )}

            {phase === 'practice' && (
              <div>
                <Timer
                  label="🗣 Practice"
                  totalSeconds={durations.practice}
                  isActive={true}
                  onComplete={handlePracticeComplete}
                />
                <p className="mt-2 text-center text-sm text-gray-500">
                  Practice your thoughts out loud. It&apos;s okay to make mistakes!
                </p>
              </div>
            )}

            {phase === 'speaking' && (
              <div>
                <Timer
                  label="🎤 Speaking"
                  totalSeconds={durations.speaking}
                  isActive={true}
                  onComplete={handleSpeakingComplete}
                />
                <Recorder
                  isEnabled={true}
                  onRecordingComplete={(url) => setRecordingUrl(url)}
                />
                <p className="mt-2 text-center text-sm text-gray-500">
                  You&apos;re recording! Speak clearly and have fun.
                </p>
              </div>
            )}

            {/* Skip button */}
            <button
              onClick={skipToNext}
              className="w-full rounded-xl border-2 border-amber-200 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 active:scale-95 transition-transform"
            >
              Skip to {phase === 'warmup' ? 'Practice' : phase === 'practice' ? 'Speaking' : 'Finish'} →
            </button>
          </div>
        )}

        {/* Start button */}
        {phase === 'ready' && (
          <button
            onClick={startSession}
            className="w-full rounded-2xl bg-amber-400 py-5 text-xl font-bold text-white shadow-md hover:bg-amber-500 active:scale-95 transition-transform"
          >
            🎤 Start Speaking
          </button>
        )}

        {/* Rating phase */}
        {phase === 'rating' && (
          <div className="space-y-5">
            {recordingUrl && (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="mb-2 text-sm font-semibold text-gray-600">Listen back</p>
                <audio controls src={recordingUrl} className="w-full" />
              </div>
            )}

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="mb-4 text-center font-bold text-gray-800">How did you feel?</p>
              <div className="flex justify-center gap-3">
                {[
                  { v: 1, emoji: '😟', label: 'Hard' },
                  { v: 2, emoji: '😐', label: 'Okay' },
                  { v: 3, emoji: '🙂', label: 'Good' },
                  { v: 4, emoji: '😄', label: 'Great' },
                  { v: 5, emoji: '🌟', label: 'Amazing' },
                ].map(({ v, emoji, label }) => (
                  <button
                    key={v}
                    onClick={() => setConfidence(v)}
                    className={`flex flex-col items-center rounded-xl p-3 transition-all ${
                      confidence === v
                        ? 'bg-amber-400 scale-110 shadow-md'
                        : 'bg-gray-100 hover:bg-amber-100'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs text-gray-600">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={submitSession}
              disabled={confidence === 0}
              className="w-full rounded-2xl bg-green-500 py-4 text-lg font-bold text-white shadow-md hover:bg-green-600 disabled:opacity-40 active:scale-95 transition-transform"
            >
              ✅ Save Session
            </button>
          </div>
        )}

        {/* Session info */}
        {week && phase === 'ready' && (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-bold text-gray-700">Session Flow</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">1</span>
                <span>Warm-up ({Math.floor(durations.warmUp / 60)}:{String(durations.warmUp % 60).padStart(2, '0')})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">2</span>
                <span>Practice ({Math.floor(durations.practice / 60)}:{String(durations.practice % 60).padStart(2, '0')})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">3</span>
                <span>Speaking ({Math.floor(durations.speaking / 60)}:{String(durations.speaking % 60).padStart(2, '0')})</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <BottomNav />
      </div>
    </main>
  )
}
