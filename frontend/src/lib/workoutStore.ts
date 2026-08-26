// HIRA workout persistence: session history, personal records, streaks.
// localStorage only — nothing leaves the device.

export interface SetRecord {
  reps: number;
  formScore: number; // 0-100 rolling average during the set
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: SetRecord[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO
  durationSec: number;
  exercises: SessionExercise[];
  avgFormScore: number;
  totalReps: number;
}

const KEYS = { history: 'hira-sessions', prs: 'hira-prs' } as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* quota */
  }
}

export function getSessions(): WorkoutSession[] {
  return read<WorkoutSession[]>(KEYS.history, []);
}

export function saveSession(s: Omit<WorkoutSession, 'id'>): WorkoutSession {
  const session: WorkoutSession = { ...s, id: `ws-${Date.now()}` };
  const all = getSessions();
  all.unshift(session);
  write(KEYS.history, all.slice(0, 365));
  updatePRs(session);
  return session;
}

export function clearSessions() {
  localStorage.removeItem(KEYS.history);
}

// ---------- PRs ----------

export interface PR {
  exerciseName: string;
  bestReps: number;
  bestFormScore: number;
  date: string;
}

function getPRs(): Record<string, PR> {
  return read<Record<string, PR>>(KEYS.prs, {});
}

function updatePRs(session: WorkoutSession) {
  const prs = getPRs();
  for (const ex of session.exercises) {
    const reps = ex.sets.reduce((a, s) => a + s.reps, 0);
    const form = ex.sets.length ? Math.round(ex.sets.reduce((a, s) => a + s.formScore, 0) / ex.sets.length) : 0;
    const prev = prs[ex.name];
    if (!prev || reps > prev.bestReps || form > prev.bestFormScore) {
      prs[ex.name] = {
        exerciseName: ex.name,
        bestReps: Math.max(reps, prev?.bestReps ?? 0),
        bestFormScore: Math.max(form, prev?.bestFormScore ?? 0),
        date: session.date,
      };
    }
  }
  write(KEYS.prs, prs);
}

export function getPersonalRecords(): PR[] {
  return Object.values(getPRs()).sort((a, b) => b.date.localeCompare(a.date));
}

// ---------- streak ----------

/** Consecutive-day workout streak ending today or yesterday. */
export function getStreak(): number {
  const days = new Set(getSessions().map((s) => s.date.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  // allow today not-yet-trained
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

/** Last N days as [{date, trained}] oldest-first, for heatmap. */
export function getLastDays(nDays: number): Array<{ date: string; trained: boolean }> {
  const days = new Set(getSessions().map((s) => s.date.slice(0, 10)));
  const out: Array<{ date: string; trained: boolean }> = [];
  const d = new Date();
  d.setDate(d.getDate() - (nDays - 1));
  for (let i = 0; i < nDays; i++) {
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, trained: days.has(key) });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Weekly rep volume for last nWeeks (oldest-first). */
export function getWeeklyVolume(nWeeks = 8): Array<{ weekStart: string; reps: number }> {
  const sessions = getSessions();
  const buckets = new Map<string, number>();
  for (let w = nWeeks - 1; w >= 0; w--) {
    const d = new Date();
    d.setDate(d.getDate() - w * 7 - ((d.getDay() + 6) % 7)); // Monday start
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of sessions) {
    const d = new Date(s.date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = d.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + s.totalReps);
  }
  return [...buckets.entries()].map(([weekStart, reps]) => ({ weekStart, reps }));
}

/** Rolling average form score per session (chronological). */
export function getFormTrend(n = 14): Array<{ date: string; form: number }> {
  return getSessions()
    .slice(0, n)
    .map((s) => ({ date: s.date.slice(5, 10), form: s.avgFormScore }))
    .reverse();
}
