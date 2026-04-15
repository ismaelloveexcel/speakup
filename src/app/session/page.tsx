'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadState, loadSessions, addSession, saveState, generateId, todayISO } from '@/lib/storage'
import { computeUnlockedWeeks, getActiveWeek } from '@/lib/unlock'
import { getTodayPrompt, getAlternatePrompt } from '@/lib/prompts'
import { SessionLog } from '@/types'

type Phase = 'ready' | 'recording' | 'done' | 'rating'

export default function SessionPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [weekNumber, setWeekNumber] = useState(1)
  const [phase, setPhase] = useState<Phase>('ready')
  const [elapsed, setElapsed] = useState(0)          // seconds
  const [targetSec, setTargetSec] = useState(300)    // 5 min default
  const [confidence, setConfidence] = useState(0)
  const [recordingUrl, setRecordingUrl] = useState<string | undefined>()
  const [error, setError] = useState('')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    const state = loadState()
    const sessions = loadSessions()
    const unlocked = computeUnlockedWeeks(sessions)
    const active = getActiveWeek(sessions, unlocked)
    setWeekNumber(active)
    setTargetSec(state.settings.sessionTargetMinutes * 60)
    setPrompt(getTodayPrompt(active, sessions))
  }, [])

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'recording') {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= targetSec) {
            stopSession()
            return e + 1
          }
          return e + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const remaining = Math.max(0, targetSec - elapsed)
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const pct = Math.min(100, (elapsed / targetSec) * 100)

  // ─── Recording ────────────────────────────────────────────────────────────
  async function startSession() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const mr = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setRecordingUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRef.current = mr
      setElapsed(0)
      setPhase('recording')
    } catch (err) {
      // Microphone not available — still allow session without recording
      setError('Microphone not available. Session will be logged without audio.')
      setPhase('recording')
    }
  }

  function stopSession() {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('rating')
  }

  function submitSession() {
    if (confidence === 0) return
    const session: SessionLog = {
      id: generateId(),
      date: todayISO(),
      weekNumber,
      prompt,
      durationMinutes: Math.max(1, Math.round(elapsed / 60)),
      confidence,
      recordingUrl,
      completed: true,
    }
    addSession(session)

    // Update currentWeek in state
    const state = loadState()
    const sessions = loadSessions()
    const unlocked = computeUnlockedWeeks(sessions)
    saveState({ ...state, unlockedWeeks: unlocked })

    router.push('/progress')
  }

  function swapPrompt() {
    const sessions = loadSessions()
    setPrompt(getAlternatePrompt(weekNumber, prompt, sessions))
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="mx-auto max-w-md">

        <h1 className="mb-2 text-2xl font-bold text-amber-900">Week {weekNumber} Session</h1>

        {/* Prompt card */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-500">Today's Topic</p>
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

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {/* Timer ring */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative h-48 w-48">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#fde68a" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45"
                fill="none" stroke="#f59e0b" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-amber-800">{mm}:{ss}</span>
              <span className="text-sm text-amber-600">
                {phase === 'ready' ? 'target time' : phase === 'recording' ? 'remaining' : 'done!'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        {phase === 'ready' && (
          <button
            onClick={startSession}
            className="w-full rounded-2xl bg-amber-400 py-5 text-xl font-bold text-white shadow-md hover:bg-amber-500 active:scale-95 transition-transform"
          >
            🎤 Start Speaking
          </button>
        )}

        {phase === 'recording' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <span className="font-medium text-red-700">Recording…</span>
            </div>
            <button
              onClick={stopSession}
              className="w-full rounded-2xl bg-gray-800 py-4 text-lg font-bold text-white hover:bg-gray-900 active:scale-95 transition-transform"
            >
              ⏹ Stop &amp; Finish
            </button>
          </div>
        )}

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
      </div>
    </main>
  )
}
