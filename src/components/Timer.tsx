'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface TimerProps {
  label: string
  totalSeconds: number
  isActive: boolean
  onComplete: () => void
}

export default function Timer({ label, totalSeconds, isActive, onComplete }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Reset when totalSeconds or active state changes
  useEffect(() => {
    setRemaining(totalSeconds)
    setPaused(false)
    completedRef.current = false
  }, [totalSeconds, isActive])

  useEffect(() => {
    clearTimer()

    if (isActive && !paused && remaining > 0) {
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer()
            if (!completedRef.current) {
              completedRef.current = true
              // Defer onComplete to avoid calling setState during render
              setTimeout(() => onComplete(), 0)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return clearTimer
  }, [isActive, paused, remaining, onComplete, clearTimer])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const pct = totalSeconds > 0 ? Math.min(100, ((totalSeconds - remaining) / totalSeconds) * 100) : 0

  function handlePause() {
    setPaused(!paused)
  }

  function handleReset() {
    clearTimer()
    setRemaining(totalSeconds)
    setPaused(false)
    completedRef.current = false
  }

  if (!isActive) {
    return (
      <div className="rounded-2xl bg-gray-100 p-4 text-center opacity-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-400">{mm}:{ss}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-500">
        {label} {remaining === 0 ? '✅' : paused ? '⏸ Paused' : ''}
      </p>

      {/* Progress ring */}
      <div className="mx-auto mb-3 h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#fde68a" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="42"
            fill="none" stroke="#f59e0b" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="relative -mt-[8rem] flex h-32 flex-col items-center justify-center">
          <span className="text-3xl font-bold text-amber-800">{mm}:{ss}</span>
        </div>
      </div>

      {/* Controls */}
      {remaining > 0 && (
        <div className="flex justify-center gap-3">
          <button
            onClick={handlePause}
            className="rounded-xl bg-amber-100 px-5 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 active:scale-95 transition-transform"
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl bg-gray-100 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 active:scale-95 transition-transform"
          >
            ↻ Reset
          </button>
        </div>
      )}
    </div>
  )
}
