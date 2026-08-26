// Exercise library browser: search/filter 144 exercises, see cues, start tracked ones.
import { useMemo, useState } from 'react';
import { Search, Play } from 'lucide-react';
import libraryData from '@/data/exercise.library.json';

interface LibExercise {
  id: string;
  name: string;
  group: string;
  equipment: string;
  difficulty: string;
  met: number;
  cue: string;
  tracked: boolean;
}

const GROUPS = ['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'fullbody'];
const DIFFS = ['all', 'Beginner', 'Intermediate', 'Advanced'];
const EX = libraryData.exercises as LibExercise[];

export default function ExerciseLibrary({ onStartTracked }: { onStartTracked?: (name: string) => void }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('all');
  const [diff, setDiff] = useState('all');
  const [equip, setEquip] = useState('all');

  const equipmentOptions = useMemo(
    () => ['all', ...Array.from(new Set(EX.map((e) => e.equipment))).sort()],
    [],
  );

  const filtered = useMemo(
    () =>
      EX.filter(
        (e) =>
          (group === 'all' || e.group === group) &&
          (diff === 'all' || e.difficulty === diff) &&
          (equip === 'all' || e.equipment === equip) &&
          (!q.trim() || e.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, group, diff, equip],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${EX.length} exercises…`}
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 focus:border-cyan-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100"
          />
        </div>
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="rounded-full border border-slate-200 bg-white px-3 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100">
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={diff} onChange={(e) => setDiff(e.target.value)} className="rounded-full border border-slate-200 bg-white px-3 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100">
          {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={equip} onChange={(e) => setEquip(e.target.value)} className="rounded-full border border-slate-200 bg-white px-3 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100">
          {equipmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <p className="text-xs font-semibold text-slate-500">{filtered.length} exercises · general fitness reference, not medical advice</p>

      <div className="grid max-h-[52vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{e.name}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                e.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                e.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {e.difficulty.slice(0, 5)}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 capitalize">{e.group} · {e.equipment}</p>
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-slate-400">{e.cue}</p>
            {e.tracked && onStartTracked && (
              <button
                onClick={() => onStartTracked(e.name)}
                className="mt-2 flex items-center gap-1 rounded-full bg-cyan-500 px-3 py-1 text-[10px] font-black text-black hover:bg-cyan-400"
              >
                <Play size={10} /> Track with camera
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
