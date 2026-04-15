import { AppState, SessionLog, AppSettings, StreakData } from '@/types'

const KEYS = {
  STATE: 'speakup_state',
  SESSIONS: 'speakup_sessions',
  SETTINGS: 'speakup_settings',
} as const

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultSettings: AppSettings = {
  childName: 'Aidan',
  parentPin: '1234',
  sessionTargetMinutes: 5,
  soundEnabled: true,
  theme: 'light',
}

const defaultState: AppState = {
  currentWeek: 1,
  settings: defaultSettings,
  sessions: [],
  unlockedWeeks: [1],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('[SpeakUp] Storage write failed:', e)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function loadState(): AppState {
  return safeGet<AppState>(KEYS.STATE, defaultState)
}

export function saveState(state: AppState): void {
  safeSet(KEYS.STATE, state)
}

export function loadSessions(): SessionLog[] {
  return safeGet<SessionLog[]>(KEYS.SESSIONS, [])
}

export function saveSessions(sessions: SessionLog[]): void {
  safeSet(KEYS.SESSIONS, sessions)
}

export function addSession(session: SessionLog): void {
  const sessions = loadSessions()
  sessions.push(session)
  saveSessions(sessions)
}

export function loadSettings(): AppSettings {
  return safeGet<AppSettings>(KEYS.SETTINGS, defaultSettings)
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings)
}

export function clearAll(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}

export function exportData(): string {
  return JSON.stringify({
    state: loadState(),
    sessions: loadSessions(),
    settings: loadSettings(),
    exportedAt: new Date().toISOString(),
  }, null, 2)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
