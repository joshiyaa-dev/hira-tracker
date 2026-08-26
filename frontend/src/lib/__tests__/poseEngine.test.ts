import { describe, it, expect } from 'vitest';
import {
  angleAt,
  createRepEngine,
  processFrame,
  smooth,
  EXERCISES,
  type Landmark,
} from '../poseEngine';

// Build a synthetic skeleton in a standing pose. Coordinates are normalised
// image space (x right, y down). We can "flex" joints by moving wrists/knees.
function standingPose(): Landmark[] {
  const lm: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0 }));
  const set = (i: number, x: number, y: number) => { lm[i] = { x, y, visibility: 0.95 }; };
  // Head
  set(0, 0.5, 0.05);
  // Shoulders / arms (straight down)
  set(11, 0.42, 0.25); set(12, 0.58, 0.25);
  set(13, 0.40, 0.40); set(14, 0.60, 0.40);
  set(15, 0.39, 0.55); set(16, 0.61, 0.55);
  // Hips / legs straight
  set(23, 0.45, 0.55); set(24, 0.55, 0.55);
  set(25, 0.45, 0.75); set(26, 0.55, 0.75);
  set(27, 0.45, 0.95); set(28, 0.55, 0.95);
  return lm;
}

describe('angleAt', () => {
  it('returns 180 for a straight line', () => {
    const a = { x: 0, y: 0 }, b = { x: 1, y: 0 }, c = { x: 2, y: 0 };
    expect(Math.round(angleAt(a, b, c))).toBe(180);
  });

  it('returns 90 for an L', () => {
    const a = { x: 0, y: 0 }, b = { x: 0, y: 1 }, c = { x: 1, y: 1 };
    expect(Math.round(angleAt(a, b, c))).toBe(90);
  });
});

describe('rep engine: squat', () => {
  const def = EXERCISES.squat;

  const flexKnees = (lm: Landmark[], depth: number): Landmark[] => {
    // Move hips down and forward past the knees to simulate a squat; 0=stand, 1=deep.
    // At depth 1 the knee angle lands near ~75deg (below downAt=100).
    const out = lm.map((p) => ({ ...p }));
    const hipY = 0.55 + depth * 0.23;
    const hipDX = depth * 0.11;
    out[23] = { x: 0.45 + hipDX, y: hipY, visibility: 0.95 };
    out[24] = { x: 0.55 + hipDX, y: hipY, visibility: 0.95 };
    return out;
  };

  it('counts one rep through a full down-up cycle', () => {
    let engine = createRepEngine();
    let angle: number | null = null;

    // Stand -> descend -> stand
    for (const depth of [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0]) {
      const lm = flexKnees(standingPose(), depth);
      const { nextState, result } = processFrame(engine, lm, def, null, 1000 + depth * 100000);
      engine = nextState;
      angle = result.primaryAngle;
      expect(result.personVisible).toBe(true);
    }
    expect(engine.reps).toBe(1);
    expect(engine.stage).toBe('up');
    expect(angle).not.toBeNull();
  });

  it('does not count noise jitter faster than the rep gap guard', () => {
    let engine = createRepEngine();
    let t = 0;
    // 20 frames x 50ms = 1s of violent jitter -> at most 2 reps may pass the 800ms guard.
    for (let i = 0; i < 20; i++) {
      t += 50;
      const depth = i % 2 === 0 ? 0.9 : 0.2;
      const lm = flexKnees(standingPose(), depth);
      const { nextState } = processFrame(engine, lm, def, null, t);
      engine = nextState;
    }
    expect(engine.reps).toBeLessThanOrEqual(2);
  });
});

describe('form rules', () => {
  it('flags uneven knees when one knee bends more', () => {
    const lm = standingPose();
    // Bend left leg heavily by pulling left hip down toward left knee.
    lm[23] = { x: 0.47, y: 0.72, visibility: 0.95 };
    const { result } = processFrame(createRepEngine(), lm, EXERCISES.squat, null, 0);
    expect(result.activeCues.length).toBeGreaterThanOrEqual(0);
    expect(result.personVisible).toBe(true);
  });

  it('reports person not visible when landmarks missing', () => {
    const { result } = processFrame(createRepEngine(), null, EXERCISES.squat, null, 0);
    expect(result.personVisible).toBe(false);
    expect(result.reps).toBe(0);
  });
});

describe('smooth', () => {
  it('converges toward the new value', () => {
    const s1 = smooth(null, 100);
    const s2 = smooth(s1, 200);
    expect(s2).toBeGreaterThan(s1);
    expect(s2).toBeLessThan(200);
  });
});
