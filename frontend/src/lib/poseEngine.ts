// Hira AI — pose form engine.
// Pure functions: MediaPipe pose landmarks -> joint angles -> rep state machine ->
// rule-based form cues. Deterministic and unit-testable. No ML claims beyond
// landmark detection (MediaPipe Pose Landmarker); everything else is explicit geometry.

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type ExerciseKey =
  | 'squat'
  | 'pushup'
  | 'bicep-curl'
  | 'lunge'
  | 'shoulder-press'
  | 'jumping-jack'
  | 'situp'
  | 'glute-bridge'
  | 'plank';

export interface ExerciseDef {
  key: ExerciseKey;
  name: string;
  /** 'reps' counts full cycles; 'hold' accumulates clean-form seconds. */
  type?: 'reps' | 'hold';
  /** For holds: target seconds per set. */
  holdTargetSec?: number;
  /** Primary angle used for the rep state machine. */
  primary: { a: number; b: number; c: number };
  /** Down-phase threshold (angle below => "down"). */
  downAt: number;
  /** Up-phase threshold (angle above => "up" / rep complete). */
  upAt: number;
  /** Form rules evaluated every frame while in view. */
  rules: FormRule[];
}

type AngleTriple = { a: number; b: number; c: number };

export interface FormRule {
  id: string;
  /** Human-readable cue when the rule is violated. */
  cue: string;
  /** Returns violation severity 0..1 (>0 means show cue). */
  check: (lm: Landmark[], sides: SideAngles) => number;
}

interface SideAngles {
  leftKnee: number;
  rightKnee: number;
  leftHip: number;
  rightHip: number;
  leftElbow: number;
  rightElbow: number;
  leftShoulder: number;
  rightShoulder: number;
  kneeAngleDiff: number;
  torsoLean: number;
}

// ---------- geometry helpers ----------

export function angleAt(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);
  if (magAB === 0 || magCB === 0) return 180;
  const cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

const LM = {
  nose: 0,
  leftShoulder: 11, rightShoulder: 12,
  leftElbow: 13, rightElbow: 14,
  leftWrist: 15, rightWrist: 16,
  leftHip: 23, rightHip: 24,
  leftKnee: 25, rightKnee: 26,
  leftAnkle: 27, rightAnkle: 28,
} as const;

function sideAngles(lm: Landmark[]): SideAngles {
  const vis = (i: number) => lm[i]?.visibility ?? 1;
  const best = (leftIdx: number, rightIdx: number) =>
    vis(leftIdx) >= vis(rightIdx) ? leftIdx : rightIdx;

  const shoulder = best(LM.leftShoulder, LM.rightShoulder);
  const hip = best(LM.leftHip, LM.rightHip);

  return {
    leftKnee: angleAt(lm[LM.leftHip], lm[LM.leftKnee], lm[LM.leftAnkle]),
    rightKnee: angleAt(lm[LM.rightHip], lm[LM.rightKnee], lm[LM.rightAnkle]),
    leftHip: angleAt(lm[LM.leftShoulder], lm[LM.leftHip], lm[LM.leftKnee]),
    rightHip: angleAt(lm[LM.rightShoulder], lm[LM.rightHip], lm[LM.rightKnee]),
    leftElbow: angleAt(lm[LM.leftShoulder], lm[LM.leftElbow], lm[LM.leftWrist]),
    rightElbow: angleAt(lm[LM.rightShoulder], lm[LM.rightElbow], lm[LM.rightWrist]),
    leftShoulder: angleAt(lm[LM.leftElbow], lm[LM.leftShoulder], lm[LM.leftHip]),
    rightShoulder: angleAt(lm[LM.rightElbow], lm[LM.rightShoulder], lm[LM.rightHip]),
    kneeAngleDiff: Math.abs(
      angleAt(lm[LM.leftHip], lm[LM.leftKnee], lm[LM.leftAnkle]) -
        angleAt(lm[LM.rightHip], lm[LM.rightKnee], lm[LM.rightAnkle])
    ),
    // Torso lean: angle of the shoulder->hip line away from vertical.
    torsoLean: Math.abs(
      (Math.atan2(lm[hip].x - lm[shoulder].x, lm[hip].y - lm[shoulder].y) * 180) / Math.PI
    ),
  };
}

// ---------- exercise definitions ----------

export const EXERCISES: Record<ExerciseKey, ExerciseDef> = {
  squat: {
    key: 'squat',
    name: 'Squat',
    primary: { a: LM.leftHip, b: LM.leftKnee, c: LM.leftAnkle },
    downAt: 100,
    upAt: 155,
    rules: [
      {
        id: 'knees-aligned',
        cue: 'Keep both knees bending evenly.',
        check: (_lm, s) => (s.kneeAngleDiff > 25 ? Math.min(1, s.kneeAngleDiff / 50) : 0),
      },
      {
        id: 'chest-up',
        cue: 'Chest up — avoid leaning too far forward.',
        check: (_lm, s) => (s.torsoLean > 45 ? Math.min(1, (s.torsoLean - 45) / 30) : 0),
      },
    ],
  },
  pushup: {
    key: 'pushup',
    name: 'Push-up',
    primary: { a: LM.leftShoulder, b: LM.leftElbow, c: LM.leftWrist },
    downAt: 95,
    upAt: 158,
    rules: [
      {
        id: 'hips-line',
        cue: 'Keep hips in line with shoulders — no sagging.',
        check: (_lm, s) => {
          const hipAngle = (s.leftHip + s.rightHip) / 2;
          return hipAngle < 150 ? Math.min(1, (150 - hipAngle) / 40) : 0;
        },
      },
      {
        id: 'even-arms',
        cue: 'Bend both elbows evenly.',
        check: (_lm, s) => {
          const diff = Math.abs(s.leftElbow - s.rightElbow);
          return diff > 30 ? Math.min(1, diff / 60) : 0;
        },
      },
    ],
  },
  'bicep-curl': {
    key: 'bicep-curl',
    name: 'Bicep Curl',
    primary: { a: LM.leftShoulder, b: LM.leftElbow, c: LM.leftWrist },
    downAt: 55,
    upAt: 145,
    rules: [
      {
        id: 'stable-shoulder',
        cue: 'Keep upper arms still — move only the forearms.',
        check: (_lm, s) => {
          const shoulder = (s.leftShoulder + s.rightShoulder) / 2;
          return shoulder < 40 ? Math.min(1, (40 - shoulder) / 30) : 0;
        },
      },
    ],
  },
  lunge: {
    key: 'lunge',
    name: 'Lunge',
    primary: { a: LM.leftHip, b: LM.leftKnee, c: LM.leftAnkle },
    downAt: 110,
    upAt: 160,
    rules: [
      {
        id: 'front-knee',
        cue: 'Keep the front knee above the ankle — do not push past the toes.',
        check: (lm) => {
          // Horizontal offset between the most-bent knee and its ankle, normalised by leg length.
          const legLen = Math.hypot(
            lm[LM.leftHip].x - lm[LM.leftAnkle].x,
            lm[LM.leftHip].y - lm[LM.leftAnkle].y
          );
          if (legLen === 0) return 0;
          const offsetL = (lm[LM.leftKnee].x - lm[LM.leftAnkle].x) / legLen;
          const offsetR = (lm[LM.rightKnee].x - lm[LM.rightAnkle].x) / legLen;
          const worst = Math.max(offsetL, offsetR);
          return worst > 0.25 ? Math.min(1, (worst - 0.25) / 0.25) : 0;
        },
      },
      {
        id: 'torso-up',
        cue: 'Stay tall — torso upright.',
        check: (_lm, s) => (s.torsoLean > 30 ? Math.min(1, (s.torsoLean - 30) / 25) : 0),
      },
    ],
  },
  'shoulder-press': {
    key: 'shoulder-press',
    name: 'Shoulder Press',
    primary: { a: LM.leftShoulder, b: LM.leftElbow, c: LM.leftWrist },
    downAt: 75,
    upAt: 155,
    rules: [
      {
        id: 'no-back-arch',
        cue: 'Do not arch your back — brace your core.',
        check: (_lm, s) => (s.torsoLean > 28 ? Math.min(1, (s.torsoLean - 28) / 22) : 0),
      },
      {
        id: 'even-press',
        cue: 'Press both arms evenly.',
        check: (_lm, s) => {
          const diff = Math.abs(s.leftElbow - s.rightElbow);
          return diff > 35 ? Math.min(1, diff / 70) : 0;
        },
      },
    ],
  },
  'jumping-jack': {
    key: 'jumping-jack',
    name: 'Jumping Jack',
    // Shoulder line angle (elbow-shoulder-hip): arms down ~20°, overhead ~150°.
    primary: { a: LM.leftElbow, b: LM.leftShoulder, c: LM.leftHip },
    downAt: 45,
    upAt: 125,
    rules: [
      {
        id: 'full-range',
        cue: 'Reach fully overhead at the top.',
        check: (lm) => {
          const wristUp =
            lm[LM.leftWrist].y < lm[LM.nose].y || lm[LM.rightWrist].y < lm[LM.nose].y;
          return wristUp ? 0 : 0.5;
        },
      },
    ],
  },
  situp: {
    key: 'situp',
    name: 'Sit-up',
    // Hip angle (shoulder-hip-knee): lying ~155°+, sitting up <100°.
    primary: { a: LM.leftShoulder, b: LM.leftHip, c: LM.leftKnee },
    downAt: 105,
    upAt: 148,
    rules: [
      {
        id: 'no-neck-pull',
        cue: 'Lead with your chest, not your neck.',
        check: (lm) => {
          // Heuristic: nose drifting far ahead of shoulders while rising.
          const shoulder = lm[LM.leftShoulder];
          const nose = lm[LM.nose];
          const dx = Math.abs(nose.x - shoulder.x);
          const dy = Math.abs(shoulder.y - nose.y);
          return dy > 0.02 && dx / Math.max(dy, 0.001) > 2.2 ? 0.6 : 0;
        },
      },
      {
        id: 'knees-bent',
        cue: 'Keep knees bent throughout.',
        check: (_lm, s) => {
          const knee = (s.leftKnee + s.rightKnee) / 2;
          return knee > 165 ? 0.7 : 0;
        },
      },
    ],
  },
  'glute-bridge': {
    key: 'glute-bridge',
    name: 'Glute Bridge',
    // Hip angle (shoulder-hip-knee): hips down ~110-130°, bridge top >160°.
    primary: { a: LM.leftShoulder, b: LM.leftHip, c: LM.leftKnee },
    downAt: 140,
    upAt: 162,
    rules: [
      {
        id: 'even-hips',
        cue: 'Lift both hips evenly — do not favour one side.',
        check: (_lm, s) => (s.kneeAngleDiff > 30 ? Math.min(1, s.kneeAngleDiff / 60) : 0),
      },
    ],
  },
  plank: {
    key: 'plank',
    name: 'Plank Hold',
    type: 'hold',
    holdTargetSec: 30,
    // Not used for counting; hip line drives form scoring.
    primary: { a: LM.leftShoulder, b: LM.leftHip, c: LM.leftKnee },
    downAt: 0,
    upAt: 180,
    rules: [
      {
        id: 'hips-sagging',
        cue: 'Hips are sagging — lift to a straight line.',
        check: (_lm, s) => {
          const hipAngle = (s.leftHip + s.rightHip) / 2;
          return hipAngle < 158 ? Math.min(1, (158 - hipAngle) / 35) : 0;
        },
      },
      {
        id: 'hips-too-high',
        cue: 'Lower your hips slightly — body in one straight line.',
        check: (_lm, s) => {
          const hipAngle = (s.leftHip + s.rightHip) / 2;
          return hipAngle > 196 ? Math.min(1, (hipAngle - 196) / 25) : 0;
        },
      },
    ],
  },
};

export interface RepEngineState {
  stage: 'up' | 'down';
  reps: number;
  /** Accumulated clean-form hold time for 'hold' exercises (ms). */
  holdMs: number;
  formScore: number; // rolling 0-100
  activeCues: string[]; // currently violated cues (deduped)
  lastRepMs: number | null;
}

export interface FrameResult extends RepEngineState {
  primaryAngle: number;
  feedback: string[]; // new cues to speak this frame
  personVisible: boolean;
}

const MIN_VISIBILITY = 0.5;

export function createRepEngine(): RepEngineState {
  return { stage: 'up', reps: 0, holdMs: 0, formScore: 100, activeCues: [], lastRepMs: null };
}

/** Smooth an angle series with EMA to prevent noisy rep counts. */
export function smooth(prev: number | null, next: number, alpha = 0.4): number {
  return prev === null ? next : alpha * next + (1 - alpha) * prev;
}

export function processFrame(
  state: RepEngineState,
  landmarks: Landmark[] | null,
  def: ExerciseDef,
  smoothedAngle: number | null,
  now: number,
  opts: { minRepGapMs?: number } = {},
): { nextState: RepEngineState; result: FrameResult } {
  const minRepGapMs = opts.minRepGapMs ?? 800;

  if (!landmarks || landmarks.length < 29) {
    return {
      nextState: state,
      result: { ...state, primaryAngle: smoothedAngle ?? 0, feedback: [], personVisible: false },
    };
  }

  const vis = (i: number) => landmarks[i]?.visibility ?? 0;
  const personVisible =
    vis(LM.leftShoulder) > MIN_VISIBILITY &&
    vis(LM.rightShoulder) > MIN_VISIBILITY &&
    vis(LM.leftHip) > MIN_VISIBILITY;

  if (!personVisible) {
    return {
      nextState: state,
      result: { ...state, primaryAngle: smoothedAngle ?? 0, feedback: [], personVisible: false },
    };
  }

  const s = sideAngles(landmarks);

  // Evaluate form rules.
  const violations: Array<{ cue: string; severity: number }> = [];
  for (const rule of def.rules) {
    const severity = rule.check(landmarks, s);
    if (severity > 0.15) violations.push({ cue: rule.cue, severity });
  }
  const activeCues = violations.map((v) => v.cue);
  const feedback = violations.filter((v) => v.severity > 0.3).map((v) => v.cue);

  // Rolling form score: recent violations pull it down, clean frames recover it.
  const framePenalty = violations.reduce((acc, v) => acc + v.severity * 10, 0);
  const targetScore = Math.max(0, 100 - framePenalty);
  const formScore = Math.round(state.formScore * 0.9 + targetScore * 0.1);

  // Hold mode: accumulate time while form is acceptable.
  if (def.type === 'hold') {
    const holdMs = formScore >= 55 ? state.holdMs + Math.min(100, now - (state.lastRepMs ?? now - 40)) : state.holdMs;
    return {
      nextState: { stage: state.stage, reps: Math.floor(holdMs / 1000), holdMs, formScore, activeCues, lastRepMs: now },
      result: { stage: state.stage, reps: Math.floor(holdMs / 1000), holdMs, formScore, activeCues, lastRepMs: now, primaryAngle: smoothedAngle ?? angleAt(landmarks[def.primary.a], landmarks[def.primary.b], landmarks[def.primary.c]), feedback, personVisible: true },
    };
  }

  // Rep state machine on the smoothed primary angle.
  let { stage, reps, lastRepMs } = state;
  const angle = smoothedAngle ?? angleAt(landmarks[def.primary.a], landmarks[def.primary.b], landmarks[def.primary.c]);

  if (stage === 'up' && angle < def.downAt) {
    stage = 'down';
  } else if (stage === 'down' && angle > def.upAt) {
    if (lastRepMs === null || now - lastRepMs >= minRepGapMs) {
      reps += 1;
      lastRepMs = now;
    }
    stage = 'up';
  }

  return {
    nextState: { stage, reps, holdMs: state.holdMs, formScore, activeCues, lastRepMs },
    result: { stage, reps, holdMs: state.holdMs, formScore, activeCues, lastRepMs, primaryAngle: angle, feedback, personVisible: true },
  };
}
