<p align="center">
  <img src="docs/hero.svg" width="100%" alt="Hira Tracker Animated Hero" />
</p>

<h1 align="center">Hira Tracker</h1>

<p align="center">
  <strong>Minimalist Daily Habit & Goal Tracker</strong><br/>
  Track streaks, set reminders, visualize consistency — all offline-first with PWA support.
</p>

<p align="center">
  <a href="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:16a085&text=Hira+Tracker&fontSize=36&fontColor=ffffff&height=120&animation=fadeIn">
    <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:16a085&text=Hira+Tracker&fontSize=36&fontColor=ffffff&height=120&animation=fadeIn" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vitest-6E9F17?style=flat-square&logo=vitest&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/Tests-7%2F7-brightgreen?style=flat-square" />
</p>

---

### The Problem

Existing habit trackers are bloated — social features, subscriptions, gamification that distracts from the actual habit. Hira Tracker strips it down to what works: **streak, consistency, simplicity**.

### What It Does

```
  ┌──────────┐     ┌──────────────┐     ┌──────────────┐
  │  Define  │────▶│  Daily Check │────▶│  Streak &    │
  │  Habit   │     │  -In         │     │  Analytics   │
  └──────────┘     └──────────────┘     └──────┬───────┘
                                                │
                    ┌──────────────┐     ┌──────▼───────┐
                    │  Reminders   │     │  Consistency │
                    │  & PWA       │◀────│  Heat Map    │
                    └──────────────┘     └──────────────┘
```

### Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Quick Check-In** | One tap to mark today's habit done |
| 2 | **Streak Counter** | Current streak + longest streak tracking |
| 3 | **Consistency %** | Rolling 7/30/90 day completion rates |
| 4 | **Heat Map** | GitHub-style green squares for activity |
| 5 | **Multiple Habits** | Track unlimited habits with categories |
| 6 | **Streak Freeze** | Grace days so one miss doesn't reset |
| 7 | **PWA Install** | Add to home screen, offline support |
| 8 | **Data Export** | JSON backup of all habit history |
| 9 | **Dark Mode** | System preference + manual toggle |
| 10 | **Zero Accounts** | Everything local, no sign-up needed |

### Quick Start

```bash
npm install
npm run dev        # → http://localhost:5173
npm test           # 7/7 tests pass
npm run build      # production + PWA
```

### Architecture

```
hira-tracker/
├── src/
│   ├── components/    # HabitCard, HeatMap, StreakBadge
│   ├── hooks/         # useHabits, useStreak, useConsistency
│   ├── lib/           # Types, store (localStorage), utils
│   └── App.tsx
├── docs/hero.svg
└── package.json
```

### Data Honesty

| What we store | Where | Retention |
|---------------|-------|-----------|
| Habit data | localStorage | Forever (until user clears) |
| Preferences | localStorage | Forever |
| No cloud sync | — | — |
| No accounts | — | — |
| No PII | — | — |
| No analytics | — | — |

### Test Suite

```
 ✓ habits/create.test.ts     — CRUD operations
 ✓ habits/streak.test.ts     — Streak calculation
 ✓ habits/consistency.test.ts — % over time windows
 ✓ habits/freeze.test.ts     — Streak freeze logic
 ✓ habits/export.test.ts     — JSON export/import
 ✓ store/persist.test.ts     — localStorage round-trip
 ✓ utils/heatmap.test.ts     — Grid generation
 ─────────────────────────────
 7/7 passing (0.8s)
```

### Built by

**[@joshiyaa-dev](https://github.com/joshiyaa-dev)** — Simplicity is the ultimate sophistication.

---

<p align="center">
  <img src="docs/hero.svg" width="60%" />
</p>
<p align="center">
  <sub>No sign-up. No cloud. Just you and your habits.</sub>
</p>
