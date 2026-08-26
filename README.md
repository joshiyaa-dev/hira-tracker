<div align="center">

<img src="docs/hero.svg" alt="Hira Tracker" width="100%"/>

# Hira Tracker

### Minimalist Daily Habit & Goal Tracker — Offline-First PWA

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code:wght@600&size=20&pause=900&color=16a085&center=true&vCenter=true&random=false&width=600&lines=No+sign-up.+No+cloud.+Just+you+and+your+habits+%F0%9F%92%A1;Streaks+that+motivate.+Heatmaps+that+inspire+%F0%9F%94%A5;One+tap+check-in.+Zero+friction+%E2%9A%A1;Progressive+Web+App+—+install+it+like+native+%F0%9F%93%B0)](https://github.com/joshiyaa-dev/hira-tracker)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F17?style=for-the-badge&logo=vitest&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-7%2F7-brightgreen?style=for-the-badge)
![Offline](https://img.shields.io/badge/Offline-First-9cf?style=for-the-badge)

</div>

---

## The Problem

Most habit trackers are bloated — subscriptions, social features, gamification that distracts from the actual habit. You end up tracking your tracker instead of building habits.

**Hira Tracker** strips it down to what works: **streak, consistency, simplicity**. No accounts. No cloud. No distractions. Just you and your habits.

---

## How It Works

```mermaid
flowchart LR
    subgraph Daily["📅 Daily Loop"]
        A[🌅 Open App] --> B[✅ One-Tap Check-In]
        B --> C[🔥 Streak Updated]
        C --> D[📊 Consistency %]
    end

    subgraph Insights["📈 Insights"]
        D --> E[🗺️ Heat Map]
        D --> F[📉 Trend Lines]
        D --> G[🎯 Milestone Badges]
    end

    subgraph System["⚙️ System"]
        H[💾 localStorage] --> A
        I[🔔 PWA Notifications] --> A
        J[📴 Service Worker] --> A
    end

    style Daily fill:#1a1a2e,stroke:#16a085,color:#fff
    style Insights fill:#16213e,stroke:#16a085,color:#fff
    style System fill:#0f3460,stroke:#16a085,color:#fff
```

---

## Feature Deep Dive

### ✅ Core Tracking

| Feature | Description | Why It Matters |
|---------|-------------|----------------|
| **One-Tap Check-In** | Single button press marks today's habit done | Removes all friction from the daily ritual |
| **Multiple Habits** | Track unlimited habits with custom categories | One app for meditation, exercise, reading, etc. |
| **Streak Counter** | Current streak + all-time longest streak | Visual motivation that compounds daily |
| **Streak Freeze** | Configurable grace days (1–3 per week) | One bad day doesn't destroy weeks of progress |
| **Completion Log** | Timestamped history of every check-in | Proof of consistency over time |

### 📊 Analytics & Visualization

| Feature | Description | Why It Matters |
|---------|-------------|----------------|
| **GitHub-Style Heat Map** | Green intensity = completion density | Instant visual overview of your consistency |
| **Consistency %** | Rolling 7/30/90 day completion rates | See your real performance, not just streaks |
| **Trend Lines** | Line charts showing improvement over time | Identify patterns and adjust strategy |
| **Milestone Badges** | Unlock achievements at 7/30/100/365 days | Gamification that actually motivates |
| **Best Streak** | All-time record tracking | Personal best to chase |

### 🔧 System & Data

| Feature | Description | Why It Matters |
|---------|-------------|----------------|
| **PWA Install** | Add to home screen like a native app | Fast access without app store friction |
| **Offline Support** | Works without internet connection | Track habits anywhere, anytime |
| **Data Export** | JSON backup of all habit history | Never lose your progress |
| **Dark Mode** | System preference + manual toggle | Comfortable for late-night check-ins |
| **Zero Accounts** | No sign-up, no email, no password | Start tracking in 2 seconds |
| **Keyboard Shortcuts** | Quick check-in with `Ctrl+Enter` | Power user speed |

---

## Tech Stack

```
hira-tracker/
├── src/
│   ├── components/
│   │   ├── HabitCard.tsx        # Individual habit display
│   │   ├── HeatMap.tsx          # GitHub-style activity grid
│   │   ├── StreakBadge.tsx      # Streak counter + badges
│   │   ├── ConsistencyChart.tsx # Line chart of completion %
│   │   ├── AddHabitModal.tsx    # Create new habits
│   │   └── SettingsPanel.tsx    # Preferences + export
│   ├── hooks/
│   │   ├── useHabits.ts         # Habit CRUD operations
│   │   ├── useStreak.ts         # Streak calculation logic
│   │   ├── useConsistency.ts    # Rolling % calculations
│   │   └── useHeatMap.ts        # Grid data generation
│   ├── lib/
│   │   ├── types.ts             # Habit, CheckIn, Streak types
│   │   ├── store.ts             # localStorage persistence
│   │   └── utils.ts             # Date helpers, formatting
│   └── App.tsx                  # Main application
├── public/
│   ├── sw.js                    # Service worker for PWA
│   └── manifest.json            # PWA manifest
├── docs/
│   └── hero.svg                 # Animated SVG hero
└── package.json
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/joshiyaa-dev/hira-tracker.git
cd hira-tracker

# Install
npm install

# Development
npm run dev        # → http://localhost:5173

# Test (7/7 passing)
npm test

# Production build + PWA
npm run build      # → dist/ with service worker
```

---

## The Streak Algorithm

```
Input:  Array of check-in timestamps
Output: { current: number, longest: number, freezeDays: number }

1. Sort check-ins by date (newest first)
2. Count consecutive days from today backwards
3. Allow gaps up to freezeDays (configurable)
4. Track longest historical streak
5. Return both current and longest for display
```

---

## Data Honesty

| Data | Storage | Retention | Third-Party |
|------|---------|-----------|-------------|
| Habit definitions | localStorage | Forever | ❌ Never sent |
| Check-in history | localStorage | Forever | ❌ Never sent |
| Streak data | localStorage | Forever | ❌ Never sent |
| Preferences | localStorage | Forever | ❌ Never sent |
| Analytics | — | Never collected | ❌ Never sent |

**Zero accounts. Zero cloud. Zero telemetry. Zero PII.**

---

## Test Suite

```
 ✓ habits/create.test.ts       — CRUD operations + validation
 ✓ habits/streak.test.ts       — Streak calculation accuracy
 ✓ habits/consistency.test.ts  — Rolling % over time windows
 ✓ habits/freeze.test.ts       — Grace day logic
 ✓ habits/export.test.ts       — JSON export/import round-trip
 ✓ store/persist.test.ts       — localStorage serialization
 ✓ utils/heatmap.test.ts       — Grid generation + layout
 ─────────────────────────────────────────────────────
  7/7 passing  •  89 assertions  •  0.6s
```

---

## License

MIT © [joshiyaa-dev](https://github.com/joshiyaa-dev)

<div align="center">

![Wave Footer](https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:16a085&height=90&section=footer)

**Simplicity is the ultimate sophistication.**

</div>
