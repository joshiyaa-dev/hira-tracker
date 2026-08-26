// Generates the HIRA exercise library: 108 bodyweight/gym exercises with
// muscle groups, equipment, difficulty, and cue text. Deterministic output.
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const GROUPS = {
  chest: { exercises: ['Push-up', 'Incline Push-up', 'Decline Push-up', 'Wide Push-up', 'Diamond Push-up', 'Knee Push-up', 'Pike Push-up', 'Archer Push-up', 'Chest Squeeze', 'Floor Press', 'Dumbbell Bench Press', 'Barbell Bench Press', 'Incline Dumbbell Press', 'Machine Chest Press', 'Cable Crossover', 'Chest Dip', 'Wall Push-up', 'Explosive Push-up', 'Clap Push-up', 'Single-arm Chest Squeeze'] },
  back: { exercises: ['Pull-up', 'Chin-up', 'Assisted Pull-up', 'Negative Pull-up', 'Inverted Row', 'Superman Hold', 'Bent-over Row', 'One-arm Dumbbell Row', 'Seated Cable Row', 'Lat Pulldown', 'Deadlift', 'Romanian Deadlift', 'T-bar Row', 'Face Pull', 'Reverse Fly', 'Bird Dog', 'Bridge Pull-down', 'Renegade Row', 'Shrug', 'Good Morning'] },
  legs: { exercises: ['Bodyweight Squat', 'Jump Squat', 'Bulgarian Split Squat', 'Goblet Squat', 'Barbell Back Squat', 'Front Squat', 'Lunge', 'Walking Lunge', 'Reverse Lunge', 'Side Lunge', 'Curtsy Lunge', 'Step-up', 'Glute Bridge', 'Single-leg Glute Bridge', 'Hip Thrust', 'Calf Raise', 'Single-leg Calf Raise', 'Wall Sit', 'Leg Press', 'Leg Extension', 'Hamstring Curl', 'Sumo Squat', 'Pistol Squat (assisted)', 'Donkey Kick'] },
  shoulders: { exercises: ['Overhead Press', 'Dumbbell Shoulder Press', 'Arnold Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Row', ' Pike Hold', 'Handstand Hold (wall)', 'Upright Row', 'Plate Front Raise', 'Landmine Press', 'Y-Raise', 'I-Y-T-W Raises', 'Band Pull-apart', 'Scaption Raise', 'Z-Press', 'Push Press', 'Sots Press (light)', 'Wall Slide', 'Prone Y-Raise'] },
  arms: { exercises: ['Bicep Curl', 'Hammer Curl', 'Concentration Curl', 'Incline Curl', 'Preacher Curl', 'Barbell Curl', 'EZ-bar Curl', 'Tricep Dip', 'Bench Dip', 'Overhead Tricep Extension', 'Skull Crusher', 'Close-grip Push-up', 'Tricep Kickback', 'Cable Pushdown', 'Wrist Curl', 'Reverse Wrist Curl', 'Farmer Carry', 'Towel Wring Iso', 'Cross-body Hammer Curl', 'Zottman Curl'] },
  core: { exercises: ['Plank', 'Side Plank', 'Plank Up-down', 'Dead Bug', 'Hollow Hold', 'V-up', 'Sit-up', 'Crunch', 'Bicycle Crunch', 'Russian Twist', 'Mountain Climber', 'Leg Raise', 'Flutter Kick', 'Scissor Kick', 'Toe Touch', 'Bird Dog Core', 'Ab Wheel Rollout', 'Hanging Knee Raise', 'Copenhagen Plank', 'Stir the Pot'] },
  fullbody: { exercises: ['Burpee', 'Half Burpee', 'Jumping Jack', 'High Knees', 'Bear Crawl', 'Crab Walk', 'Inchworm', 'Turkish Get-up (light)', 'Man Maker (light)', 'Thruster', 'Clean & Press (light)', 'Snatch Balance (broomstick)', 'Farmer Walk', 'Sled Push (bodyweight)', 'Shadow Boxing', 'Skipping Rope', 'Star Jump', 'Squat to Press', 'Plank Jack', 'Broad Jump'] },
};

const EQUIPMENT_BY_GROUP_HINT = {
  'Pull-up': 'Pull-up bar', 'Chin-up': 'Pull-up bar', 'Assisted Pull-up': 'Resistance band',
  'Barbell Bench Press': 'Barbell', 'Dumbbell Bench Press': 'Dumbbells', 'Deadlift': 'Barbell',
  'Barbell Back Squat': 'Barbell', 'Front Squat': 'Barbell', 'Overhead Press': 'Barbell',
};

const DIFFICULTY_CYCLE = ['Beginner', 'Intermediate', 'Advanced'];

const CUES = {
  chest: 'Keep elbows about 45 degrees from your torso; squeeze your chest at the top.',
  back: 'Lead with your elbows, keep shoulders down away from ears.',
  legs: 'Track knees over toes; drive through heels.',
  shoulders: 'Keep ribs stacked over pelvis; press without shrugging.',
  arms: 'Control the lowering phase for two seconds; no swinging.',
  core: 'Brace your abs like expecting a poke; breathe steadily.',
  fullbody: 'Land softly; move with rhythm, not rush.',
};

let n = 0;
const library = [];
for (const [groupKey, group] of Object.entries(GROUPS)) {
  group.exercises.forEach((name, i) => {
    n += 1;
    const equipment = EQUIPMENT_BY_GROUP_HINT[name] ?? (/dumbbell/i.test(name) ? 'Dumbbells' : /barbell|deadlift|squat.*bar/i.test(name) ? 'Barbell' : /band/i.test(name) ? 'Resistance band' : /machine|cable|pulldown|press$|curl$/i.test(name) && i % 3 === 0 ? 'Cable/Machine' : 'None');
    library.push({
      id: `ex-${String(n).padStart(3, '0')}`,
      name,
      group: groupKey,
      equipment,
      difficulty: DIFFICULTY_CYCLE[(i + groupKey.length) % 3],
      met: 3.5 + ((i * 7) % 50) / 10, // rough intensity proxy 3.5-8.4
      cue: CUES[groupKey],
      tracked: false,
      description: `${name}: ${CUES[groupKey]} Suitable for ${DIFFICULTY_CYCLE[(i + groupKey.length) % 3].toLowerCase()} level.`,
    });
  });
}

// Mark the pose-tracked exercises available in FormCoach today.
const TRACKED = ['Bodyweight Squat', 'Push-up', 'Bicep Curl', 'Lunge'];
for (const ex of library) if (TRACKED.includes(ex.name)) ex.tracked = true;

const out = {
  meta: {
    generated_by: 'scripts/generate-library.mjs',
    count: library.length,
    note: 'General fitness reference data compiled by HIRA. Educational use only — not medical advice.',
  },
  exercises: library,
};

const dest = resolve(__dirname, '../src/data/exercise.library.json');
writeFileSync(dest, JSON.stringify(out, null, 1));
console.log(`Wrote ${library.length} exercises -> ${dest}`);
