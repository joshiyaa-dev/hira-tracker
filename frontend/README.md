# HIRA — AI Gym Trainer with Live Form Coaching

A browser-only personal trainer that **watches your form in real time** using
MediaPipe Pose Landmarker (33 landmarks, on-device WASM/GPU inference) and
counts reps, scores your technique, and speaks corrections out loud. Plus a
144-exercise library, interval timers, progress analytics, and a meal planner.
No server, no camera uploads — everything runs locally.

## Features

| Area | What it does |
|---|---|
| Live pose tracking | Camera + mirrored skeleton overlay; model + wasm served from `/public` (no CDN at runtime) |
| 9 tracked exercises | Squat, Push-up, Bicep Curl, Lunge, Shoulder Press, Jumping Jack, Sit-up, Glute Bridge, **Plank Hold** (seconds-based hold mode) |
| Rep engine | Angle thresholds + EMA smoothing (α=0.4) + 800ms debounce → jitter-proof counts |
| Form coaching | Rule-based cues per exercise ("knees evenly", "chest up", "hips in line", knee-over-toe geometry check), spoken with 2.5s throttle |
| Live HUD | Reps/hold-seconds · phase · rolling Form Score % · joint angle in degrees |
| Privacy & safety | Privacy mode (video hidden, skeleton only), brightness detection warns when too dark/backlit, big red EMERGENCY STOP |
| Voice commands | "next" / "previous" / "how many" / "stop" during a session |
| Session summaries | Auto-saved to history on stop (reps, form %, duration) |
| Exercise library | 144 exercises: search + muscle-group/difficulty/equipment filters, cue text |
| Timers | Work/rest interval timer with audio countdown beeps |
| Progress | Weekly rep-volume bars, per-session form-score trend, 35-day streak heatmap, personal records |
| Meal planner | 73-meal DB filtered by goal/diet/allergies; deterministic day plan by protein-per-kcal; grocery list; print/PDF export |

## Data honesty

- Landmark detection is real ML (MediaPipe). Everything after it is explicit,
  documented geometry — no magic "AI accuracy" claims.
- Nutrition values are labeled approximations for education only.
- Not medical advice; the UI says so.

## Run

```bash
npm install
npm run setup:assets   # copies MediaPipe wasm + downloads pose_landmarker_lite.task (~5.8MB)
npm run dev            # http://localhost:5173
npm test               # 7 unit tests (rep cycles, noise rejection, visibility)
npm run build
node scripts/generate-library.mjs   # regenerate exercise library
node scripts/generate-meals.mjs     # regenerate meal DB
```

## Deploy (Vercel)

Framework Vite → deploy. `public/models/` and `public/mediapipe/` are static
assets served as-is; the whole app works from any static host.

## Limitations

- Best tracking with full body visible, side-on view for squats/lunges.
- Pose quality depends on lighting (the app warns you).
- Hold/rep counting assumes standard form ranges; tune thresholds in
  `src/lib/poseEngine.ts` if needed.
