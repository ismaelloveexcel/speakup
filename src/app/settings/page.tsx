'use client'

import { useEffect, useState } from 'react'
import { loadSettings, saveSettings, clearAll } from '@/lib/storage'
import { AppSettings } from '@/types'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function update(patch: Partial<AppSettings>) {
    if (!settings) return
    setSettings({ ...settings, ...patch })
  }

  function handleSave() {
    if (!settings) return
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    clearAll()
    router.push('/')
  }

  if (!settings) return null

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-amber-900">⚙️ Settings</h1>

        <div className="space-y-4">
          {/* Child name */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Child&apos;s name</label>
            <input
              type="text"
              value={settings.childName}
              onChange={(e) => update({ childName: e.target.value })}
              className="w-full rounded-xl border-2 border-amber-200 px-4 py-3 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Session duration */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Session target: {settings.sessionTargetMinutes} minutes
            </label>
            <input
              type="range"
              min={2} max={15} step={1}
              value={settings.sessionTargetMinutes}
              onChange={(e) => update({ sessionTargetMinutes: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>2 min</span><span>15 min</span>
            </div>
          </div>

          {/* Parent PIN */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Parent PIN (4 digits)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={settings.parentPin}
              onChange={(e) => update({ parentPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              className="w-full rounded-xl border-2 border-amber-200 px-4 py-3 text-center text-2xl tracking-widest focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div>
              <p className="font-semibold text-gray-700">Sound effects</p>
              <p className="text-sm text-gray-400">Timer beeps and completion sounds</p>
            </div>
            <button
              onClick={() => update({ soundEnabled: !settings.soundEnabled })}
              className={`relative h-7 w-12 rounded-full transition-colors ${settings.soundEnabled ? 'bg-amber-400' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${settings.soundEnabled ? 'left-6' : 'left-0.5'}`}
              />
            </button>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full rounded-2xl bg-amber-400 py-4 font-bold text-white shadow-md hover:bg-amber-500 active:scale-95 transition-transform"
          >
            {saved ? '✅ Saved!' : 'Save Settings'}
          </button>

          {/* Danger zone */}
          <div className="rounded-2xl border-2 border-red-200 bg-white p-5">
            <p className="mb-3 font-semibold text-red-700">⚠️ Danger Zone</p>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full rounded-xl border-2 border-red-300 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Reset all data
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600">This will erase all sessions and progress. Are you sure?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmReset(false)} className="flex-1 rounded-xl bg-gray-100 py-2 text-sm font-medium">Cancel</button>
                  <button onClick={handleReset} className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-bold text-white">Yes, reset</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  )
}
