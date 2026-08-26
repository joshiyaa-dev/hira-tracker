// Progress dashboard: weekly volume chart, form trend, streak heatmap, PRs.
import { useMemo } from 'react';
import { Flame, Trophy, TrendingUp, Dumbbell } from 'lucide-react';
import {
  getWeeklyVolume, getFormTrend, getStreak, getLastDays, getPersonalRecords,
} from '@/lib/workoutStore';

function Bars({ data }: { data: Array<{ weekStart: string; reps: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.reps));
  return (
    <div className="flex h-28 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.weekStart} className="group relative flex-1">
          <div
            className="w-full rounded-t bg-gradient-to-t from-cyan-600 to-cyan-300 transition-all"
            style={{ height: `${Math.max(3, (d.reps / max) * 100)}%` }}
          />
          <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 rounded bg-slate-800 px-1 text-[9px] text-white group-hover:block">
            {d.reps}
          </span>
        </div>
      ))}
    </div>
  );
}

function LineTrend({ data }: { data: Array<{ date: string; form: number }> }) {
  if (data.length < 2) return <p className="text-xs italic text-slate-500">Complete more sessions to see your trend.</p>;
  const w = 260;
  const h = 90;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.form / 100) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
      <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - (d.form / 100) * h} r="3" fill="#10b981" />
      ))}
      <text x="2" y="10" fontSize="8" fill="#64748b">100%</text>
      <text x="2" y={h - 2} fontSize="8" fill="#64748b">0%</text>
    </svg>
  );
}

export default function ProgressCharts() {
  const volume = useMemo(() => getWeeklyVolume(8), []);
  const form = useMemo(() => getFormTrend(14), []);
  const streak = useMemo(() => getStreak(), []);
  const days = useMemo(() => getLastDays(35), []);
  const prs = useMemo(() => getPersonalRecords().slice(0, 6), []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
          <Dumbbell size={15} className="text-cyan-500" /> Weekly rep volume (8 weeks)
        </div>
        <Bars data={volume} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
          <TrendingUp size={15} className="text-emerald-500" /> Form score per session
        </div>
        <LineTrend data={form} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
            <Flame size={15} className="text-orange-500" /> Streak: {streak} day{streak === 1 ? '' : 's'}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => (
            <div
              key={d.date}
              title={d.date}
              className={`aspect-square rounded ${d.trained ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
          <Trophy size={15} className="text-amber-500" /> Personal records
        </div>
        {prs.length === 0 ? (
          <p className="text-xs italic text-slate-500">Finish a tracked set to set your first PR.</p>
        ) : (
          <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-200">
            {prs.map((pr) => (
              <li key={pr.exerciseName} className="flex items-center justify-between gap-2">
                <span className="truncate">{pr.exerciseName}</span>
                <span className="shrink-0 font-mono font-bold text-amber-500">{pr.bestReps} reps · {pr.bestFormScore}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
