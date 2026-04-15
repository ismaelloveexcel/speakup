// ─── Core Data Models ────────────────────────────────────────────────────────

export interface ProgramWeek {
  weekNumber: number
  title: string
  goal: string
  focus: string
  activities: string[]
  prompts: string[]
  minSessionsToUnlockNext: number
}

export interface SessionLog {
  id: string
  date: string          // ISO date string "YYYY-MM-DD"
  weekNumber: number
  prompt: string
  durationMinutes: number
  confidence: number    // 1–5
  recordingUrl?: string // blob URL or undefined
  completed: boolean
}

export interface StreakData {
  current: number       // consecutive days with at least 1 completed session
  longest: number
  lastSessionDate: string | null
}

export interface ProgressMetrics {
  totalSessions: number
  totalMinutes: number
  averageConfidence: number
  weekCompletionPct: number
  streak: StreakData
  sessionsByWeek: Record<number, number>
}

export interface AppSettings {
  childName: string
  parentPin: string     // 4-digit PIN to access parent dashboard
  sessionTargetMinutes: number
  soundEnabled: boolean
  theme: 'light' | 'dark'
}

export interface AppState {
  currentWeek: number
  settings: AppSettings
  sessions: SessionLog[]
  unlockedWeeks: number[]
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface WeekCardProps {
  week: ProgramWeek
  isUnlocked: boolean
  completedSessions: number
  isActive: boolean
  onSelect: (weekNumber: number) => void
}

export interface TimerProps {
  targetMinutes: number
  onComplete: () => void
  isRunning: boolean
}

export interface ConfidenceRatingProps {
  value: number
  onChange: (rating: number) => void
}
