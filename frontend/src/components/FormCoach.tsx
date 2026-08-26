import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Play, Square, EyeOff, Eye, OctagonX, Lightbulb } from 'lucide-react';
import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import {
  EXERCISES,
  angleAt,
  createRepEngine,
  processFrame,
  smooth,
  type ExerciseKey,
  type Landmark,
} from '../lib/poseEngine';
import { saveSession } from '../lib/workoutStore';

const POSE_CONNECTIONS: Array<[number, number]> = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];

function speakCue(text: string) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
};

export default function FormCoach() {
  const [exerciseKey, setExerciseKey] = useState<ExerciseKey>('squat');
  const [cameraOn, setCameraOn] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState('');
  const [hud, setHud] = useState({ reps: 0, stage: 'up' as 'up' | 'down', formScore: 100, angle: 0 });
  const [cues, setCues] = useState<string[]>([]);
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [lightWarning, setLightWarning] = useState('');
  const [summary, setSummary] = useState<{ name: string; reps: number; formScore: number; seconds: number } | null>(null);
  const [voiceCmdOn, setVoiceCmdOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const engineRef = useRef(createRepEngine());
  const smoothedAngleRef = useRef<number | null>(null);
  const lastSpokenRef = useRef<Record<string, number>>({});
  const startedAtRef = useRef<number>(0);
  const exerciseKeyRef = useRef<ExerciseKey>('squat');
  const hudRef = useRef(hud);
  const lastLightCheckRef = useRef(0);
  const exerciseDef = EXERCISES[exerciseKey];

  useEffect(() => { exerciseKeyRef.current = exerciseKey; }, [exerciseKey]);
  useEffect(() => { hudRef.current = hud; }, [hud]);

  // Load the pose model (local assets only — no runtime CDN calls).
  const ensureModel = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    setModelStatus('loading');
    const fileset = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
    const landmarker = await PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: '/models/pose_landmarker_lite.task', delegate: 'GPU' },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
    });
    landmarkerRef.current = landmarker;
    setModelStatus('ready');
    return landmarker;
  }, []);

  // Emergency stop: kill everything immediately and say so.
  const emergencyStop = useCallback(() => {
    stopEverything();
    speakCue('Stopped.');
  }, []);

  const stopEverything = useCallback(() => {
    setTracking(false);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    // Session summary for tracked work.
    const h = hudRef.current;
    const seconds = startedAtRef.current ? Math.round((performance.now() - startedAtRef.current) / 1000) : 0;
    const def = EXERCISES[exerciseKeyRef.current];
    if (startedAtRef.current && seconds >= 10 && (h.reps > 0 || h.formScore < 100)) {
      const session = saveSession({
        date: new Date().toISOString(),
        durationSec: seconds,
        exercises: [{ exerciseId: def.key, name: def.name, sets: [{ reps: h.reps, formScore: h.formScore }] }],
        avgFormScore: h.formScore,
        totalReps: h.reps,
      });
      setSummary({ name: def.name, reps: h.reps, formScore: h.formScore, seconds });
      void session;
    }
    startedAtRef.current = 0;

    setCameraOn(false);
    engineRef.current = createRepEngine();
    smoothedAngleRef.current = null;
    setHud({ reps: 0, stage: 'up', formScore: 100, angle: 0 });
    setCues([]);
    setLightWarning('');
  }, []);

  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const startCamera = async () => {
    setError('');
    setSummary(null);
    try {
      await ensureModel();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      engineRef.current = createRepEngine();
      smoothedAngleRef.current = null;
      startedAtRef.current = performance.now();
      setTracking(true);
      loop();
    } catch (e) {
      const message =
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access to use form coaching.'
          : e instanceof Error && /createFromOptions|FilesetResolver|wasm|task/i.test(e.message)
            ? 'Pose model failed to load. Run "npm run setup:assets" and reload.'
            : 'Could not start the camera. Check that it is not in use by another app.';
      setError(message);
      stopEverything();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  /** Sample frame brightness every ~2.5s; warn when too dark/bright for pose tracking. */
  const checkLighting = () => {
    const now = performance.now();
    if (now - lastLightCheckRef.current < 2500) return;
    lastLightCheckRef.current = now;
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const scratch = document.createElement('canvas');
    scratch.width = 32;
    scratch.height = 18;
    const ctx = scratch.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, 32, 18);
    const { data } = ctx.getImageData(0, 0, 32, 18);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    const brightness = sum / (data.length / 4);
    if (brightness < 45) setLightWarning('Too dark — face a light source so your whole body is visible.');
    else if (brightness > 235) setLightWarning('Too much backlight — avoid standing against a bright window.');
    else setLightWarning('');
  };

  const drawOverlay = (landmarks: Landmark[] | undefined) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!landmarks?.length) return;

    ctx.lineWidth = Math.max(2, canvas.width / 320);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
    for (const [a, b] of POSE_CONNECTIONS) {
      const pa = landmarks[a];
      const pb = landmarks[b];
      if (!pa || !pb || (pa.visibility ?? 1) < 0.4 || (pb.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      // Canvas is CSS-mirrored; mirror x here so lines match the mirrored video.
      ctx.moveTo((1 - pa.x) * canvas.width, pa.y * canvas.height);
      ctx.lineTo((1 - pb.x) * canvas.width, pb.y * canvas.height);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for (const p of landmarks) {
      if ((p.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      ctx.arc((1 - p.x) * canvas.width, p.y * canvas.height, Math.max(3, canvas.width / 214), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const trackingWanted = useRef(false);
  const cmdWantedRef = useRef(false);

  const cycleExercise = (dir: 1 | -1) => {
    const keys = Object.keys(EXERCISES) as ExerciseKey[];
    const idx = keys.indexOf(exerciseKeyRef.current);
    const next = keys[(idx + dir + keys.length) % keys.length];
    setExerciseKey(next);
    engineRef.current = createRepEngine();
    smoothedAngleRef.current = null;
    speakCue(EXERCISES[next].name);
  };

  // Voice commands during workouts.
  useEffect(() => {
    if (!voiceCmdOn) return;
    const w = window as unknown as Record<string, unknown>;
    const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => SpeechRecognitionLike) | undefined;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'en-IN';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = String(e.results[e.results.length - 1]?.[0]?.transcript ?? '').toLowerCase();
      if (/next/.test(text)) cycleExercise(1);
      else if (/previous|back/.test(text)) cycleExercise(-1);
      else if (/how many|count/.test(text)) speakCue(`${hudRef.current.reps} ${EXERCISES[exerciseKeyRef.current].type === 'hold' ? 'seconds' : 'reps'}`);
      else if (/stop|pause camera/.test(text)) stopEverything();
    };
    rec.onend = () => { if (cmdWantedRef.current) { try { rec.start(); } catch { /* */ } } };
    cmdWantedRef.current = true;
    try { rec.start(); } catch { /* */ }
    return () => { cmdWantedRef.current = false; try { rec.stop(); } catch { /* */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceCmdOn]);

  // External exercise selection (from the library browser).
  useEffect(() => {
    const handler = (e: Event) => {
      const name = (e as CustomEvent<string>).detail;
      const entry = (Object.entries(EXERCISES) as Array<[ExerciseKey, typeof EXERCISES[ExerciseKey]]>).find(
        ([, def]) => def.name.toLowerCase() === String(name).toLowerCase(),
      );
      if (entry) {
        setExerciseKey(entry[0]);
        engineRef.current = createRepEngine();
        smoothedAngleRef.current = null;
      }
    };
    window.addEventListener('hira-track-exercise', handler);
    return () => window.removeEventListener('hira-track-exercise', handler);
  }, []);

  const loop = () => {
    const tick = async () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || !trackingWanted.current) return;

      if (video.readyState >= 2 && video.currentTime > 0) {
        try {
          const result: PoseLandmarkerResult = landmarker.detectForVideo(video, performance.now());
          const lm = (result.landmarks?.[0] ?? null) as Landmark[] | null;

          const rawAngle = lm ? angleAt(lm[exerciseDef.primary.a], lm[exerciseDef.primary.b], lm[exerciseDef.primary.c]) : null;
          smoothedAngleRef.current = smooth(smoothedAngleRef.current, rawAngle ?? smoothedAngleRef.current ?? 0);

          const { nextState, result: frame } = processFrame(
            engineRef.current,
            lm,
            exerciseDef,
            smoothedAngleRef.current,
            performance.now(),
          );
          engineRef.current = nextState;

          setHud({ reps: frame.reps, stage: frame.stage, formScore: frame.formScore, angle: Math.round(frame.primaryAngle) });

          // Voice cues: throttle each distinct cue to once per 2.5s.
          const now = performance.now();
          const toSpeak = frame.feedback.filter((cue) => now - (lastSpokenRef.current[cue] ?? -9999) > 2500);
          for (const cue of toSpeak) lastSpokenRef.current[cue] = now;
          if (toSpeak.length > 0) speakCue(toSpeak[toSpeak.length - 1]);
          setCues(frame.activeCues.slice(0, 2));

          drawOverlay(result.landmarks?.[0] as unknown as Landmark[] | undefined);
          checkLighting();
        } catch {
          /* transient detection errors are ignored */
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    trackingWanted.current = true;
    void tick();
  };

  useEffect(() => { trackingWanted.current = tracking; }, [tracking]);

  const isHold = exerciseDef.type === 'hold';

  return (
    <article className="panel formcoach-panel">
      <div className="flex items-center justify-between gap-2">
        <h2>Live form coach</h2>
        <button
          onClick={() => setPrivacyMode(!privacyMode)}
          className="flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:border-cyan-400 hover:text-cyan-600"
          title="Hide the live video; keep the skeleton + HUD only."
        >
          {privacyMode ? <Eye size={12} /> : <EyeOff size={12} />} Privacy mode
        </button>
      </div>
      <p className="formcoach-note">
        Real-time pose analysis runs entirely on your device via MediaPipe Pose Landmarker — the camera feed is never uploaded or stored.
      </p>

      <div className="exercise-picker" role="tablist" aria-label="Exercise">
        {(Object.keys(EXERCISES) as ExerciseKey[]).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={key === exerciseKey}
            className={`exercise-chip ${key === exerciseKey ? 'active' : ''}`}
            onClick={() => { setExerciseKey(key); engineRef.current = createRepEngine(); smoothedAngleRef.current = null; }}
          >
            {EXERCISES[key].name}
          </button>
        ))}
      </div>

      <div className="formcoach-stage">
        {!privacyMode && <video ref={videoRef} playsInline muted />}
        <canvas ref={canvasRef} className={privacyMode ? 'privacy-bg' : ''} />

        {!cameraOn && (
          <div className="formcoach-empty">
            <Camera size={36} />
            <p>Stand 2–3 meters back so your full body fits the frame.</p>
            <p style={{ fontSize: 12 }}>Side view works best for squats and lunges.</p>
          </div>
        )}

        {cameraOn && (
          <>
            <div className="formcoach-hud">
              <span className="hud-chip">{isHold ? 'Seconds' : 'Reps'} <strong>{hud.reps}</strong></span>
              {!isHold && <span className="hud-chip">Phase <strong>{hud.stage}</strong></span>}
              <span className={`hud-chip ${hud.formScore >= 80 ? '' : hud.formScore >= 55 ? 'warn' : 'bad'}`}>
                Form <strong>{hud.formScore}%</strong>
              </span>
              <span className="hud-chip">Joint angle <strong>{hud.angle}°</strong></span>
              <span className="hud-chip">{exerciseDef.name}</span>
            </div>
            {cues.length > 0 && (
              <div className="formcoach-cues">
                {cues.map((cue) => (
                  <span key={cue} className="cue-pill">{cue}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {lightWarning && cameraOn && (
        <p className="formcoach-note flex items-center gap-1" style={{ color: '#fbbf24' }}>
          <Lightbulb size={13} /> {lightWarning}
        </p>
      )}
      {error && <p className="formcoach-note" style={{ color: '#fb7185' }}>{error}</p>}
      {modelStatus === 'loading' && <p className="formcoach-note">Loading pose model…</p>}
      {summary && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
          ✓ Session saved: <b>{summary.name}</b> — {summary.reps} {isHold ? 'sec hold' : 'reps'}, form {summary.formScore}%, {Math.floor(summary.seconds / 60)}m {summary.seconds % 60}s. See Progress tab.
        </div>
      )}

      <div className="action-row">
        {!cameraOn ? (
          <button className="primary-btn" onClick={startCamera} disabled={modelStatus === 'loading'}>
            <Play size={16} /> Start camera &amp; tracking
          </button>
        ) : (
          <button className="ghost-btn" onClick={stopEverything}>
            <Square size={16} /> Stop &amp; save session
          </button>
        )}
        {cameraOn && (
          <button
            onClick={emergencyStop}
            aria-label="Emergency stop"
            className="flex items-center gap-1 rounded-full bg-red-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-red-600/40 transition hover:bg-red-500 active:scale-95"
          >
            <OctagonX size={16} /> EMERGENCY STOP
          </button>
        )}
        {cameraOn && (
          <button className="ghost-btn" onClick={() => { engineRef.current = createRepEngine(); setHud((h) => ({ ...h, reps: 0, formScore: 100 })); }}>
            Reset counters
          </button>
        )}
        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500">
          <input type="checkbox" checked={voiceCmdOn} onChange={(e) => setVoiceCmdOn(e.target.checked)} className="accent-cyan-500" />
          Voice commands
        </label>
      </div>

      <p className="formcoach-note"><CameraOff size={12} /> Educational form guidance only — not a medical assessment. Say “next”, “how many”, or “stop” when voice commands are on.</p>
    </article>
  );
}
