// Workout + rest timers with Web Audio beeps. Drives session summaries.
import { useCallback, useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';

function beep(freq = 880, durationMs = 180) {
  try {
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); void ctx.close(); }, durationMs);
  } catch {
    /* audio blocked */
  }
}

export function useWorkoutClock() {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const reset = useCallback(() => { setElapsedSec(0); setRunning(false); }, []);
  return { elapsedSec, running, setRunning, reset };
}

export default function WorkoutTimers() {
  const [workSec, setWorkSec] = useState(0);
  const [restSec, setRestSec] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'work' | 'rest'>('idle');
  const [paused, setPaused] = useState(false);
  const [inputWork, setInputWork] = useState(45);
  const [inputRest, setInputRest] = useState(60);
  // Single authoritative countdown.
  useEffect(() => {
    if (phase === 'idle' || paused) return;
    const id = setInterval(() => {
      if (phase === 'work') {
        setWorkSec((s) => {
          if (s <= 1) {
            beep(880, 250);
            if (inputRest > 0) {
              setRestSec(inputRest);
              setPhase('rest');
              return 0;
            }
            beep(1040, 300);
            setPhase('idle');
            return 0;
          }
          if (s <= 3) beep(520, 80);
          return s - 1;
        });
      } else if (phase === 'rest') {
        setRestSec((s) => {
          if (s <= 1) {
            beep(880, 250);
            setPhase('idle');
            return 0;
          }
          if (s <= 3) beep(600, 80);
          return s - 1;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, paused, inputRest]);

  const start = () => {
    setWorkSec(inputWork);
    setPhase('work');
    setPaused(false);
    beep(700, 120);
  };

  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
        <Timer size={15} className="text-purple-500" /> Interval timer
        {phase !== 'idle' && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${phase === 'work' ? 'bg-cyan-100 text-cyan-700' : 'bg-orange-100 text-orange-700'}`}>
            {phase} {paused && '(paused)'}
          </span>
        )}
      </div>

      {phase === 'idle' ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-slate-500">
            Work
            <input type="number" min={5} max={600} value={inputWork} onChange={(e) => setInputWork(Number(e.target.value))}
              className="mt-1 block w-20 rounded-lg border border-slate-200 bg-white p-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100" />
          </label>
          <label className="text-xs text-slate-500">
            Rest
            <input type="number" min={0} max={600} value={inputRest} onChange={(e) => setInputRest(Number(e.target.value))}
              className="mt-1 block w-20 rounded-lg border border-slate-200 bg-white p-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100" />
          </label>
          <button onClick={start} className="flex items-center gap-1.5 rounded-full bg-purple-500 px-4 py-2 text-xs font-black text-white hover:bg-purple-400">
            <Play size={13} /> Start
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <span className={`font-mono text-4xl font-black ${phase === 'work' ? 'text-cyan-500' : 'text-orange-400'}`}>
            {mmss(phase === 'work' ? workSec : restSec)}
          </span>
          <button onClick={() => setPaused(!paused)} className="rounded-full bg-slate-200 p-2 dark:bg-slate-700 dark:text-white" aria-label="pause">
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button onClick={() => { setPhase('idle'); setPaused(false); }} className="rounded-full bg-slate-200 p-2 dark:bg-slate-700 dark:text-white" aria-label="reset">
            <RotateCcw size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

