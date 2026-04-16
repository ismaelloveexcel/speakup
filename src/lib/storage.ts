import { AppState, SessionLog, AppSettings } from '@/types'

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
  unlockedWeeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

// ─── SSR guard ────────────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeGet<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    // Basic validation: parsed must be same type as fallback
    if (typeof parsed !== typeof fallback) return fallback
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback
    return parsed as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('[SpeakUp] Storage write failed:', e)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function loadState(): AppState {
  const state = safeGet<AppState>(KEYS.STATE, defaultState)
  // Ensure required fields exist even if stored data is stale/partial
  return {
    currentWeek: state.currentWeek ?? 1,
    settings: state.settings ?? defaultSettings,
    sessions: Array.isArray(state.sessions) ? state.sessions : [],
    unlockedWeeks: Array.isArray(state.unlockedWeeks) ? state.unlockedWeeks : [1],
  }
}

export function saveState(state: AppState): void {
  safeSet(KEYS.STATE, state)
}

export function loadSessions(): SessionLog[] {
  const sessions = safeGet<SessionLog[]>(KEYS.SESSIONS, [])
  // Validate it's an array of objects with required fields
  if (!Array.isArray(sessions)) return []
  return sessions.filter(
    (s) => s && typeof s.id === 'string' && typeof s.date === 'string'
  )
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
  const settings = safeGet<AppSettings>(KEYS.SETTINGS, defaultSettings)
  // Merge with defaults to fill any missing fields
  return { ...defaultSettings, ...settings }
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings)
}

export function clearAll(): void {
  if (!isBrowser()) return
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
