'use client'

import { useState } from 'react'
import { ProgramWeek } from '@/types'

interface WeekCardProps {
  week: ProgramWeek
  completedSessions: number
  isActive: boolean
  onSelect?: (weekNumber: number) => void
}

export default function WeekCard({
  week,
  completedSessions,
  isActive,
  onSelect,
}: WeekCardProps) {
  const [expanded, setExpanded] = useState(false)
  const target = week.targetSessions ?? 5

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isActive
          ? 'border-amber-400 bg-white shadow-md'
          : 'border-amber-200 bg-white hover:border-amber-300'
      }`}
    >
      <div
        onClick={() => {
          setExpanded((prev) => !prev)
          onSelect?.(week.weekNumber)
        }}
        className="cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-lg bg-amber-100">
              ✅
            </div>
            <div>
              <p className="font-bold text-gray-800">
                Week {week.weekNumber}: {week.title}
              </p>
              <p className="text-sm text-gray-500">
                {week.focus}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {target > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                {completedSessions} / {target}
              </span>
            )}
            <span className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {target > 0 && (
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-amber-100">
            <div
              className="h-2 rounded-full bg-amber-400 transition-all"
              style={{
                width: `${Math.min(100, (completedSessions / target) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-gray-400">
            {completedSessions >= target
              ? '✓ Complete'
              : `${target - completedSessions} more to complete this week`}
          </p>
        </div>
      )}

      {/* Expandable details */}
      {expanded && (
        <div className="mt-4 border-t border-amber-100 pt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">🎯 Goal</p>
            <p className="mt-1 text-sm text-gray-700">{week.goal}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">📚 Activities</p>
            <ul className="mt-1 space-y-1">
              {week.activities.map((activity, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
