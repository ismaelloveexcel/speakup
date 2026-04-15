'use client'

import { ProgramWeek } from '@/types'

interface WeekCardProps {
  week: ProgramWeek
  isUnlocked: boolean
  completedSessions: number
  isActive: boolean
  remaining: number
  onSelect?: (weekNumber: number) => void
}

export default function WeekCard({
  week,
  isUnlocked,
  completedSessions,
  isActive,
  remaining,
  onSelect,
}: WeekCardProps) {
  return (
    <div
      onClick={() => isUnlocked && onSelect?.(week.weekNumber)}
      className={`rounded-xl border-2 p-4 transition-all ${
        isUnlocked
          ? isActive
            ? 'border-amber-400 bg-white shadow-md cursor-pointer'
            : 'border-amber-200 bg-white cursor-pointer hover:border-amber-300'
          : 'border-gray-200 bg-gray-50 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isUnlocked ? '✅' : '🔒'}</span>
          <div>
            <p className="font-bold text-gray-800">
              Week {week.weekNumber}: {week.title}
            </p>
            <p className="text-sm text-gray-500">{week.focus}</p>
          </div>
        </div>
        <div className="text-right">
          {isUnlocked ? (
            <div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                {completedSessions}/{week.minSessionsToUnlockNext || '∞'}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">
              {remaining} more to unlock
            </span>
          )}
        </div>
      </div>

      {/* Progress bar for unlocked weeks */}
      {isUnlocked && week.minSessionsToUnlockNext > 0 && (
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-amber-100">
            <div
              className="h-1.5 rounded-full bg-amber-400 transition-all"
              style={{
                width: `${Math.min(100, (completedSessions / week.minSessionsToUnlockNext) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
