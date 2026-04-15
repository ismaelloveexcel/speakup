'use client'

import { ProgramWeek } from '@/types'

interface WeekCardProps {
  week: ProgramWeek
  isUnlocked: boolean
  completedSessions: number
  isActive: boolean
  /** Sessions still needed in the PREVIOUS week to unlock this one */
  sessionsToUnlock: number
  onSelect?: (weekNumber: number) => void
}

export default function WeekCard({
  week,
  isUnlocked,
  completedSessions,
  isActive,
  sessionsToUnlock,
  onSelect,
}: WeekCardProps) {
  const target = week.minSessionsToUnlockNext || 5

  return (
    <div
      onClick={() => isUnlocked && onSelect?.(week.weekNumber)}
      className={`rounded-xl border-2 p-4 transition-all ${
        isUnlocked
          ? isActive
            ? 'border-amber-400 bg-white shadow-md cursor-pointer'
            : 'border-amber-200 bg-white cursor-pointer hover:border-amber-300'
          : 'border-gray-300 bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
            isUnlocked ? 'bg-amber-100' : 'bg-gray-200'
          }`}>
            {isUnlocked ? '✅' : '🔒'}
          </div>
          <div>
            <p className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
              Week {week.weekNumber}: {week.title}
            </p>
            <p className={`text-sm ${isUnlocked ? 'text-gray-500' : 'text-gray-400'}`}>
              {week.focus}
            </p>
          </div>
        </div>
        <div className="text-right">
          {isUnlocked ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              {completedSessions} / {target}
            </span>
          ) : (
            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
              Locked
            </span>
          )}
        </div>
      </div>

      {/* Progress bar for unlocked weeks */}
      {isUnlocked && week.minSessionsToUnlockNext > 0 && (
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
              : `${target - completedSessions} more to unlock next week`}
          </p>
        </div>
      )}

      {/* Locked message */}
      {!isUnlocked && (
        <div className="mt-3 rounded-lg bg-gray-200 px-3 py-2">
          <p className="text-xs text-gray-500">
            🔒 Complete {sessionsToUnlock} more session{sessionsToUnlock !== 1 ? 's' : ''} in Week {week.weekNumber - 1} to unlock
          </p>
        </div>
      )}
    </div>
  )
}
