'use client'

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
  const target = week.targetSessions || 5

  return (
    <div
      onClick={() => onSelect?.(week.weekNumber)}
      className={`rounded-xl border-2 p-4 transition-all ${
        isActive
          ? 'border-amber-400 bg-white shadow-md cursor-pointer'
          : 'border-amber-200 bg-white cursor-pointer hover:border-amber-300'
      }`}
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
        <div className="text-right">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            {completedSessions} / {target}
          </span>
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
    </div>
  )
}
