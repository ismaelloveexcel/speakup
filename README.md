# SpeakUp 🎤

A 12-week speaking confidence programme for children. Built as a Next.js PWA with localStorage — no backend required for Phase 1.

## Features

- ✅ 12 weeks × 10 prompts = 120 unique speaking topics
- ✅ Real consecutive-day streak calculation
- ✅ Sequential week unlocking (5 sessions per week to unlock next)
- ✅ Deterministic prompt rotation (no repeats within a week)
- ✅ Visible countdown timer with progress ring
- ✅ Voice recording via MediaRecorder (with fallback)
- ✅ Confidence rating (1–5 emoji scale)
- ✅ Parent dashboard with PIN gate + data export
- ✅ Installable as PWA (Add to Home Screen)
- ✅ Zero external CDN dependencies

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- localStorage (Phase 1 — no backend)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  types/          # TypeScript interfaces
  data/           # 12-week seed data
  lib/            # Pure logic (storage, unlock, streak, prompts, progress)
  app/            # Next.js pages
    page.tsx          # Home
    session/          # Daily session
    progress/         # Progress view
    parent/           # Parent dashboard (PIN-gated)
    settings/         # App settings
```

## Phase 2 Roadmap

- Supabase backend for cross-device sync
- Audio storage in Supabase Storage
- Push notifications for daily reminders
- PDF progress report export
- Multi-child support
