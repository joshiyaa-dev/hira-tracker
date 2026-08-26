export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph' | 'athletic';
export type Goal = 'fat-loss' | 'muscle-gain' | 'strength' | 'recomp' | 'general-fitness';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Focus = 'legs' | 'push' | 'pull' | 'core' | 'full-body' | 'home' | 'recovery';

export interface Profile {
  name: string;
  age: number;
  weight: number;
  height: number;
  bodyType: BodyType;
  goal: Goal;
  experience: Experience;
  homeOnly: boolean;
  timeMinutes: 20 | 30 | 45 | 60;
  dietStyle: 'veg' | 'non-veg' | 'vegan' | 'high-protein';
  photo?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'coach' | 'system';
  text: string;
  timestamp: number;
  focus?: Focus;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note: string;
  image: string;
  mealTag: 'pre-workout' | 'post-workout' | 'recovery' | 'cut' | 'bulk' | 'home';
}

export interface ExerciseItem {
  name: string;
  muscle: string;
  sets: string;
  reps: string;
  rest: string;
  cue: string;
  homeVersion: string;
  image: string;
  youtubeQuery: string;
  focus: Focus;
}

export interface MemoryState {
  profile: Profile;
  streak: number;
  focus: Focus;
  voiceEnabled: boolean;
  autoSpeak: boolean;
  fontScale: number;
  messages: ChatMessage[];
  workoutLog: string[];
  foodLog: string[];
  summaries: string[];
}

const svg = (title: string, from: string, to: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" rx="40" fill="url(#g)" />
      <circle cx="470" cy="90" r="72" fill="rgba(255,255,255,0.18)" />
      <circle cx="110" cy="300" r="88" fill="rgba(255,255,255,0.12)" />
      <text x="50" y="190" fill="#fff" font-size="42" font-family="Arial, Helvetica, sans-serif" font-weight="700">${title}</text>
      <text x="50" y="240" fill="rgba(255,255,255,0.88)" font-size="22" font-family="Arial, Helvetica, sans-serif">Hira AI trainer card</text>
    </svg>
  `)}`;

export const bodyTypeCopy: Record<BodyType, string> = {
  ectomorph: 'lean frame, higher carb tolerance, needs consistent calorie support',
  mesomorph: 'balanced build, responds well to structured training',
  endomorph: 'stores energy easily, benefits from tighter calorie control',
  athletic: 'strong base, can push volume and intensity with good recovery',
};

export const foodCatalog: FoodItem[] = [
  {
    name: 'Chicken Breast Bowl',
    calories: 360,
    protein: 42,
    carbs: 28,
    fat: 9,
    note: 'High protein, low fatigue, ideal post-workout.',
    image: svg('Chicken Breast', '#0f766e', '#22c55e'),
    mealTag: 'post-workout',
  },
  {
    name: 'Paneer Power Plate',
    calories: 410,
    protein: 27,
    carbs: 24,
    fat: 22,
    note: 'Great for vegetarian bulking and recovery.',
    image: svg('Paneer Plate', '#7c3aed', '#ec4899'),
    mealTag: 'bulk',
  },
  {
    name: 'Egg + Oats Combo',
    calories: 340,
    protein: 24,
    carbs: 32,
    fat: 12,
    note: 'Best pre-workout fuel for steady energy.',
    image: svg('Egg Oats', '#f97316', '#facc15'),
    mealTag: 'pre-workout',
  },
  {
    name: 'Greek Yogurt Fruit Bowl',
    calories: 220,
    protein: 18,
    carbs: 26,
    fat: 4,
    note: 'Light and recovery-friendly.',
    image: svg('Yogurt Bowl', '#06b6d4', '#0ea5e9'),
    mealTag: 'recovery',
  },
  {
    name: 'Rice + Dal Stack',
    calories: 390,
    protein: 20,
    carbs: 58,
    fat: 8,
    note: 'Simple Indian meal for training days.',
    image: svg('Rice Dal', '#10b981', '#84cc16'),
    mealTag: 'home',
  },
  {
    name: 'Banana Peanut Toast',
    calories: 280,
    protein: 10,
    carbs: 38,
    fat: 10,
    note: 'Fast pre-gym meal with quick energy.',
    image: svg('Banana Toast', '#eab308', '#f97316'),
    mealTag: 'pre-workout',
  },
  {
    name: 'Fish Curry Plate',
    calories: 330,
    protein: 29,
    carbs: 20,
    fat: 14,
    note: 'Good protein with moderate fat.',
    image: svg('Fish Curry', '#0284c7', '#22d3ee'),
    mealTag: 'post-workout',
  },
  {
    name: 'Curd + Chana Bowl',
    calories: 260,
    protein: 19,
    carbs: 24,
    fat: 8,
    note: 'Good for cut days and digestion.',
    image: svg('Curd Chana', '#14b8a6', '#a78bfa'),
    mealTag: 'cut',
  },
];

export const exerciseCatalog: ExerciseItem[] = [
  {
    name: 'Barbell Squat',
    muscle: 'legs',
    sets: '4',
    reps: '6-10',
    rest: '90 sec',
    cue: 'Brace core, keep knees tracking toes.',
    homeVersion: 'Goblet squat or slow bodyweight squat',
    image: svg('Barbell Squat', '#1d4ed8', '#22c55e'),
    youtubeQuery: 'barbell squat form tutorial',
    focus: 'legs',
  },
  {
    name: 'Romanian Deadlift',
    muscle: 'posterior chain',
    sets: '4',
    reps: '8-12',
    rest: '90 sec',
    cue: 'Hinge hips back and keep spine neutral.',
    homeVersion: 'Single-leg hip hinge with backpack',
    image: svg('Romanian Deadlift', '#0f172a', '#38bdf8'),
    youtubeQuery: 'romanian deadlift form tutorial',
    focus: 'legs',
  },
  {
    name: 'Incline Dumbbell Press',
    muscle: 'chest',
    sets: '4',
    reps: '8-12',
    rest: '75 sec',
    cue: 'Lower under control and press with chest.',
    homeVersion: 'Push-up with slow tempo',
    image: svg('Incline Press', '#ef4444', '#f97316'),
    youtubeQuery: 'incline dumbbell press form tutorial',
    focus: 'push',
  },
  {
    name: 'Lat Pulldown',
    muscle: 'back',
    sets: '4',
    reps: '10-12',
    rest: '75 sec',
    cue: 'Pull elbows down, do not shrug.',
    homeVersion: 'Resistance-band row',
    image: svg('Lat Pulldown', '#14b8a6', '#0ea5e9'),
    youtubeQuery: 'lat pulldown form tutorial',
    focus: 'pull',
  },
  {
    name: 'Plank Row',
    muscle: 'core',
    sets: '3',
    reps: '30-40 sec',
    rest: '45 sec',
    cue: 'Keep hips square and move slow.',
    homeVersion: 'Plank shoulder taps',
    image: svg('Core Plank', '#a855f7', '#ec4899'),
    youtubeQuery: 'core plank row exercise tutorial',
    focus: 'core',
  },
  {
    name: 'Walking Lunges',
    muscle: 'legs',
    sets: '3',
    reps: '10 each leg',
    rest: '60 sec',
    cue: 'Step long enough to keep front heel down.',
    homeVersion: 'Split squats or step-back lunges',
    image: svg('Walking Lunges', '#16a34a', '#84cc16'),
    youtubeQuery: 'walking lunges form tutorial',
    focus: 'legs',
  },
  {
    name: 'Shoulder Press',
    muscle: 'shoulders',
    sets: '4',
    reps: '8-10',
    rest: '75 sec',
    cue: 'Keep ribs down and press in a straight line.',
    homeVersion: 'Pike push-up or backpack press',
    image: svg('Shoulder Press', '#f59e0b', '#f43f5e'),
    youtubeQuery: 'dumbbell shoulder press form tutorial',
    focus: 'push',
  },
];

export const defaultProfile: Profile = {
  name: 'Gym Member',
  age: 24,
  weight: 70,
  height: 172,
  bodyType: 'mesomorph',
  goal: 'recomp',
  experience: 'beginner',
  homeOnly: false,
  timeMinutes: 45,
  dietStyle: 'high-protein',
};

export const defaultMemory: MemoryState = {
  profile: defaultProfile,
  streak: 1,
  focus: 'full-body',
  voiceEnabled: true,
  autoSpeak: false,
  fontScale: 1,
  messages: [],
  workoutLog: [],
  foodLog: [],
  summaries: [],
};

const focusOrder: Focus[] = ['legs', 'push', 'pull', 'core', 'full-body', 'home', 'recovery'];

export function clampGoal(goal: Goal, bodyType: BodyType) {
  if (goal !== 'recomp') return goal;
  return bodyType === 'ectomorph' ? 'muscle-gain' : bodyType === 'endomorph' ? 'fat-loss' : 'general-fitness';
}

export function focusLabel(focus: Focus) {
  switch (focus) {
    case 'legs':
      return 'Legs day';
    case 'push':
      return 'Push day';
    case 'pull':
      return 'Pull day';
    case 'core':
      return 'Core day';
    case 'home':
      return 'Home workout';
    case 'recovery':
      return 'Recovery';
    default:
      return 'Full body';
  }
}

export function detectFocus(text: string): Focus {
  const value = text.toLowerCase();
  if (value.includes('leg')) return 'legs';
  if (value.includes('push') || value.includes('chest') || value.includes('shoulder') || value.includes('tricep')) return 'push';
  if (value.includes('pull') || value.includes('back') || value.includes('bicep') || value.includes('lat')) return 'pull';
  if (value.includes('core') || value.includes('abs') || value.includes('plank')) return 'core';
  if (value.includes('home') || value.includes('no gym') || value.includes('bodyweight')) return 'home';
  if (value.includes('rest') || value.includes('recovery') || value.includes('sore') || value.includes('tired')) return 'recovery';
  return 'full-body';
}

export function calculateTargets(profile: Profile) {
  const bodyBias = profile.bodyType === 'ectomorph' ? 220 : profile.bodyType === 'endomorph' ? -180 : 0;
  const goalBias =
    profile.goal === 'fat-loss'
      ? -250
      : profile.goal === 'muscle-gain'
      ? 250
      : profile.goal === 'strength'
      ? 120
      : 0;
  const calories = Math.max(1600, Math.round(profile.weight * 27 + bodyBias + goalBias));
  const protein = Math.max(90, Math.round(profile.weight * (profile.goal === 'muscle-gain' ? 2 : 1.7)));
  return { calories, protein };
}

export function recommendFood(profile: Profile, focus: Focus) {
  const target = calculateTargets(profile);
  const pool = foodCatalog.filter((food) => {
    if (focus === 'legs' || focus === 'push' || focus === 'pull') return ['pre-workout', 'post-workout', 'bulk'].includes(food.mealTag);
    if (focus === 'recovery') return ['recovery', 'cut', 'home'].includes(food.mealTag);
    if (profile.goal === 'fat-loss') return ['cut', 'recovery', 'pre-workout'].includes(food.mealTag);
    return true;
  });
  const food = pool[0] ?? foodCatalog[0];
  const message =
    focus === 'recovery'
      ? `Good recovery choice for ${bodyTypeCopy[profile.bodyType]}. This is light, helps repair, and should not make you feel heavy.`
      : `Great choice for ${focusLabel(focus).toLowerCase()}. This meal gives about ${food.protein}g protein, ${food.calories} calories, and fits your ${profile.goal} goal.`;
  return { food, target, message };
}

export function recommendWorkout(profile: Profile, focus: Focus) {
  const exercises = exerciseCatalog.filter((item) => item.focus === focus || (focus === 'full-body' && item.focus !== 'home'));
  const plan = exercises.slice(0, 4);
  return {
    title: `${focusLabel(focus)} for ${profile.name}`,
    subtitle: `Built for ${profile.bodyType} body type and ${profile.goal} goal.`,
    exercises: plan,
    youtubeQuery: plan[0]?.youtubeQuery ?? 'gym workout form tutorial',
    note:
      focus === 'home'
        ? 'Home version is ready if you cannot go to gym today.'
        : 'Focus on form first, then add load when movement is clean.',
  };
}

export function recommendHomeWorkout(profile: Profile) {
  const plan = exerciseCatalog.filter((item) => item.focus === 'legs' || item.focus === 'core' || item.focus === 'push').slice(0, 3);
  return {
    title: `${profile.timeMinutes}-minute home plan`,
    subtitle: 'No equipment, no excuses, still a real trainer plan.',
    exercises: plan.map((item) => ({ ...item, name: `${item.name} (home)` })),
    youtubeQuery: 'home workout no equipment tutorial',
    note: 'Keep rest tight and tempo controlled.',
  };
}

export function buildCoachReply(profile: Profile, text: string, focus: Focus) {
  const lower = text.toLowerCase();
  const food = recommendFood(profile, focus);
  const workout = recommendWorkout(profile, focus);
  const home = recommendHomeWorkout(profile);
  const targets = calculateTargets(profile);
  const lead =
    lower.includes('food') || lower.includes('eat') || lower.includes('meal')
      ? food.message
      : lower.includes('home') || lower.includes('no gym')
      ? `Use this home version today. It matches your ${profile.bodyType} body type, saves time, and keeps the streak moving.`
      : lower.includes('video') || lower.includes('youtube')
      ? `Open the exercise demo for ${workout.exercises[0]?.name ?? 'your exercise'} and follow the form cues carefully.`
      : `Coach mode on for ${profile.name}. For ${focusLabel(focus).toLowerCase()}, stay on ${Math.round(targets.protein)}g protein and around ${Math.round(targets.calories)} calories today.`;

  const followUp =
    lower.includes('tired') || lower.includes('sore')
      ? 'Because you sound tired, keep the workout lighter and choose the recovery meal first.'
      : lower.includes('bulk')
      ? 'For bulking, keep protein high and do not fear carbs around training.'
      : lower.includes('cut')
      ? 'For cutting, keep the meal lower in fat and use clean protein with controlled carbs.'
      : `This is a ${focusLabel(focus).toLowerCase()} suggestion built to fit your training history.`;

  return {
    reply: `${lead} ${followUp}`,
    food,
    workout,
    home,
    targets,
    memoryLine: `${new Date().toLocaleDateString()}: asked about ${focusLabel(focus).toLowerCase()} and received a personalized answer.`,
  };
}

export function serializeMemory(memory: MemoryState) {
  return JSON.stringify(memory, null, 2);
}

export function hydrateMemory(raw: string | null): MemoryState {
  if (!raw) return defaultMemory;
  try {
    const parsed = JSON.parse(raw) as Partial<MemoryState>;
    return {
      ...defaultMemory,
      ...parsed,
      profile: { ...defaultProfile, ...(parsed.profile || {}) },
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      workoutLog: Array.isArray(parsed.workoutLog) ? parsed.workoutLog : [],
      foodLog: Array.isArray(parsed.foodLog) ? parsed.foodLog : [],
      summaries: Array.isArray(parsed.summaries) ? parsed.summaries : [],
    };
  } catch {
    return defaultMemory;
  }
}

export function nextFocus(current: Focus): Focus {
  const index = focusOrder.indexOf(current);
  return focusOrder[(index + 1) % focusOrder.length];
}
