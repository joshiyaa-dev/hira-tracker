import random
import hashlib
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from model import FitnessModel
from data_loader import DataLoader

# In-memory user history store (keyed by user_id)
_user_history: Dict[str, Dict] = {}

# High-protein Indian foods for deficiency detection
HIGH_PROTEIN_INDIAN_FOODS = [
    {'name': 'Paneer (Cottage Cheese)', 'protein': 28, 'serving': '100g', 'calories': 265},
    {'name': 'Chicken Breast', 'protein': 31, 'serving': '100g', 'calories': 165},
    {'name': 'Boiled Eggs', 'protein': 13, 'serving': '2 eggs', 'calories': 156},
    {'name': 'Dal (Lentils)', 'protein': 9, 'serving': '1 cup cooked', 'calories': 230},
    {'name': 'Curd (Yogurt)', 'protein': 10, 'serving': '200g', 'calories': 196},
    {'name': 'Peanuts', 'protein': 7, 'serving': '30g', 'calories': 170},
    {'name': 'Whey Protein (shake)', 'protein': 24, 'serving': '1 scoop (30g)', 'calories': 120},
    {'name': 'Soya Chunks', 'protein': 52, 'serving': '100g dry', 'calories': 345},
    {'name': 'Chickpeas (Chana)', 'protein': 9, 'serving': '1 cup cooked', 'calories': 269},
    {'name': 'Fish Curry', 'protein': 22, 'serving': '100g', 'calories': 180},
]

# Recovery exercises for light/rest days
RECOVERY_EXERCISES = [
    {
        'id': 'rec_001', 'name': 'Cat-Cow Stretch', 'muscle_group': 'core',
        'sets': 2, 'reps': 10, 'equipment': 'bodyweight',
        'safety_tips': ['Move slowly and breathe deeply', 'No pain — stop if it hurts'],
    },
    {
        'id': 'rec_002', 'name': 'Child\'s Pose', 'muscle_group': 'back',
        'sets': 2, 'reps': 30, 'equipment': 'bodyweight',
        'safety_tips': ['Hold for 30 seconds each', 'Breathe deeply'],
    },
    {
        'id': 'rec_003', 'name': 'Hip Flexor Stretch', 'muscle_group': 'legs',
        'sets': 2, 'reps': 30, 'equipment': 'bodyweight',
        'safety_tips': ['Hold 30 seconds each side', 'Keep back straight'],
    },
    {
        'id': 'rec_004', 'name': 'Standing Quad Stretch', 'muscle_group': 'legs',
        'sets': 2, 'reps': 30, 'equipment': 'bodyweight',
        'safety_tips': ['Hold 30 seconds each leg', 'Balance carefully'],
    },
    {
        'id': 'rec_005', 'name': 'Shoulder Rolls', 'muscle_group': 'shoulders',
        'sets': 2, 'reps': 10, 'equipment': 'bodyweight',
        'safety_tips': ['Slow controlled movements', 'Both directions'],
    },
]


def _get_user_history(user_id: str) -> Dict:
    """Get or initialise user history"""
    if user_id not in _user_history:
        _user_history[user_id] = {
            'past_exercises': [],     # list of exercise IDs done recently
            'missed_days': 0,         # consecutive missed workout days
            'consecutive_days': 0,    # consecutive workout days (streak)
            'last_workout_date': None,
            'last_protein_pct': 1.0,  # last protein intake as fraction of target
            'week_workouts': 0,       # workouts completed this week
        }
    return _user_history[user_id]


class RecommendationEngine:
    """Main recommendation engine for HIRA"""
    
    def __init__(self):
        self.model = FitnessModel()
        self.data_loader = DataLoader()
    
    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_workout(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized workout plan with explanation"""
        user_id = user_data.get('user_id', 'unknown')
        history = _get_user_history(user_id)

        experience = user_data.get('gym_experience', 'intermediate')
        goal = user_data.get('fitness_goal', 'general-fitness')
        readiness = user_data.get('readiness_score', 75)

        # Adjust intensity: incorporate missed-day penalty
        intensity = self._compute_intensity(readiness, history)

        # If very low readiness → recovery day
        if readiness < 35:
            exercises = RECOVERY_EXERCISES[:4]
            duration = 20
            explanation = (
                'Your readiness is very low today. A recovery session with gentle '
                'stretches will help your body repair and prepare for tomorrow.'
            )
        else:
            exercises = self._select_exercises(
                goal, experience, intensity, history.get('past_exercises', [])
            )
            duration = self._calculate_duration(experience, len(exercises))
            explanation = self._build_explanation(
                readiness, intensity, history, experience, goal
            )

        # Apply progressive overload adjustments
        exercises = self._apply_progressive_overload(exercises, history, intensity)

        # Track exercise IDs to avoid repetition
        exercise_ids = [e.get('id') for e in exercises if e.get('id')]
        history['past_exercises'] = (exercise_ids + history['past_exercises'])[:20]

        return {
            'exercises': exercises,
            'total_duration': duration,
            'intensity': intensity,
            'readiness_score': readiness,
            'tips': self._generate_tips(experience, intensity),
            'explanation': explanation,
        }

    def suggest_meals(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate meal suggestions with protein-deficiency awareness"""
        user_id = user_data.get('user_id', 'unknown')
        history = _get_user_history(user_id)

        diet_type = user_data.get('diet_type', 'non-veg')
        protein_pct = user_data.get('protein_pct', history.get('last_protein_pct', 1.0))

        daily_calories = self.model.predict_calories(user_data)
        daily_protein = self.model.predict_protein(user_data)

        available_foods = self.data_loader.get_foods_by_diet(diet_type)

        # Sort by protein for protein-deficient users
        protein_deficient = protein_pct < 0.7
        if protein_deficient and available_foods:
            available_foods = sorted(
                available_foods,
                key=lambda f: float(f.get('protein', 0)),
                reverse=True,
            )

        breakfast = self._suggest_meal(available_foods, 'breakfast', daily_calories * 0.25)
        lunch = self._suggest_meal(available_foods, 'lunch', daily_calories * 0.35)
        dinner = self._suggest_meal(available_foods, 'dinner', daily_calories * 0.30)
        snacks = self._suggest_meal(available_foods, 'snack', daily_calories * 0.10)

        result: Dict[str, Any] = {
            'breakfast': breakfast,
            'lunch': lunch,
            'dinner': dinner,
            'snacks': snacks,
            'daily_targets': {
                'calories': daily_calories,
                'protein_grams': daily_protein,
            },
        }

        if protein_deficient:
            result['protein_alert'] = True
            result['protein_boost_suggestions'] = self._get_protein_boost_suggestions(
                diet_type, daily_protein
            )
            result['protein_message'] = (
                f'Your protein intake was only {int(protein_pct * 100)}% of your '
                f'{int(daily_protein)}g target. Here are high-protein Indian foods '
                'to help you reach your goal.'
            )

        return result

    def adjust_intensity(self, user_data: Dict[str, Any], readiness: Dict[str, Any]) -> str:
        """Adjust workout intensity based on readiness check-in"""
        sleep = readiness.get('sleep', 7)
        stress = readiness.get('stress', 5)
        soreness = readiness.get('soreness', 3)
        energy = readiness.get('energy', 5)

        score = self._score_from_factors(energy, sleep, stress, soreness)

        # Hard overrides for safety
        if sleep < 4:
            return 'light'
        if soreness > 8:
            return 'light'
        if stress > 8:
            return 'light'

        if score < 50:
            return 'light'
        elif score < 75:
            return 'normal'
        else:
            return 'push'

    def adjust_plan(self, user_data: Dict[str, Any], checkin: Dict[str, Any]) -> Dict[str, Any]:
        """Full plan adjustment based on daily check-in (Phase 4 /adjust-plan endpoint)"""
        user_id = user_data.get('user_id', 'unknown')
        history = _get_user_history(user_id)

        intensity = self.adjust_intensity(user_data, checkin)
        readiness_result = self.calculate_readiness_score(checkin)
        readiness_score = int(readiness_result['score'])

        user_data_with_readiness = {**user_data, 'readiness_score': readiness_score}
        workout = self.generate_workout(user_data_with_readiness)

        return {
            'intensity': intensity,
            'readiness': readiness_result,
            'workout': workout,
        }

    def calculate_readiness_score(self, checkin_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate daily readiness score from check-in data"""
        energy = checkin_data.get('energy', 5)
        sleep = checkin_data.get('sleep', 7)
        stress = checkin_data.get('stress', 5)
        soreness = checkin_data.get('soreness', 3)

        energy_score = energy * 10
        sleep_score = min(sleep / 8 * 100, 100)
        stress_score = (10 - stress) * 10
        soreness_score = (10 - soreness) * 10

        readiness_score = (
            energy_score * 0.25
            + sleep_score * 0.35
            + stress_score * 0.25
            + soreness_score * 0.15
        )
        readiness_score = max(0.0, min(100.0, readiness_score))

        return {
            'score': round(readiness_score, 1),
            'factors': {
                'sleep': round(sleep_score / 100, 2),
                'energy': round(energy_score / 100, 2),
                'stress': round(stress_score / 100, 2),
                'soreness': round(soreness_score / 100, 2),
            },
            'recommendation': self._get_recommendation(readiness_score),
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _score_from_factors(energy: float, sleep: float, stress: float, soreness: float) -> float:
        energy_score = energy * 10
        sleep_score = min(sleep / 8 * 100, 100)
        stress_score = (10 - stress) * 10
        soreness_score = (10 - soreness) * 10
        return (energy_score * 0.25 + sleep_score * 0.35 + stress_score * 0.25 + soreness_score * 0.15)

    @staticmethod
    def _compute_intensity(readiness: float, history: Dict) -> str:
        """Intensity from readiness + missed-day penalty"""
        missed = history.get('missed_days', 0)

        # After 2+ consecutive misses, ease back in
        if missed >= 2:
            if readiness >= 75:
                return 'normal'
            return 'light'

        if readiness < 50:
            return 'light'
        elif readiness < 75:
            return 'normal'
        else:
            return 'push'

    def _select_exercises(
        self,
        goal: str,
        experience: str,
        intensity: str,
        recent_ids: List[str],
    ) -> List[Dict]:
        """Select exercises with variation (avoid recent repeats)"""
        if 'muscle' in goal:
            muscle_groups = ['chest', 'back', 'shoulders', 'arms', 'legs']
        elif 'strength' in goal:
            muscle_groups = ['chest', 'back', 'legs']
        elif 'fat' in goal:
            muscle_groups = ['legs', 'chest', 'back', 'shoulders']
        else:
            muscle_groups = ['chest', 'back', 'legs', 'shoulders']

        exercises = []
        for muscle in muscle_groups:
            available = self.data_loader.get_exercises_by_muscle(muscle)
            if not available:
                continue
            # Filter by difficulty (beginner gets beginner/intermediate, etc.)
            if experience == 'beginner':
                filtered = [e for e in available if e.get('difficulty') in ('beginner', 'intermediate')]
            elif experience == 'advanced':
                filtered = [e for e in available if e.get('difficulty') in ('intermediate', 'advanced')]
            else:
                filtered = available

            if not filtered:
                filtered = available

            # Prefer exercises not done recently
            fresh = [e for e in filtered if e.get('id') not in recent_ids]
            pool = fresh if fresh else filtered

            exercise = random.choice(pool)
            exercises.append({
                'id': exercise.get('id'),
                'name': exercise.get('name'),
                'muscle_group': muscle,
                'sets': exercise.get('sets', 3),
                'reps': exercise.get('reps', 10),
                'equipment': exercise.get('equipment', 'bodyweight'),
                'safety_tips': exercise.get('safety_tips', []),
            })

        return exercises[:6]

    @staticmethod
    def _apply_progressive_overload(
        exercises: List[Dict], history: Dict, intensity: str
    ) -> List[Dict]:
        """Increase sets/reps for consistent users; reduce for missed workouts"""
        consecutive = history.get('consecutive_days', 0)
        missed = history.get('missed_days', 0)

        adjusted = []
        for ex in exercises:
            ex = dict(ex)  # copy
            sets = ex.get('sets', 3)
            reps = ex.get('reps', 10)

            if intensity == 'light' or missed >= 2:
                # Reduce load
                ex['sets'] = max(2, sets - 1)
                ex['reps'] = max(6, reps - 2)
            elif consecutive >= 5 and intensity == 'push':
                # Progressive overload after 5 consistent days
                ex['sets'] = min(5, sets + 1)
                ex['reps'] = min(15, reps + 2)

            adjusted.append(ex)
        return adjusted

    @staticmethod
    def _calculate_duration(experience: str, num_exercises: int) -> int:
        base_time = 8 if experience == 'beginner' else 10
        return min(60, base_time * num_exercises)

    @staticmethod
    def _suggest_meal(foods: List[Dict], meal_type: str, target_calories: float) -> List[Dict]:
        if not foods:
            return []
        sample_size = min(3, len(foods))
        suggested = random.sample(foods, sample_size)
        return [
            {
                'name': food.get('name'),
                'calories': food.get('calories'),
                'protein': food.get('protein'),
                'serving': food.get('serving_size'),
            }
            for food in suggested
        ]

    @staticmethod
    def _get_protein_boost_suggestions(diet_type: str, target_protein: float) -> List[Dict]:
        """Return high-protein Indian foods suited to diet type"""
        if diet_type == 'veg':
            pool = [f for f in HIGH_PROTEIN_INDIAN_FOODS
                    if f['name'] not in ('Chicken Breast', 'Fish Curry')]
        elif diet_type == 'vegan':
            pool = [f for f in HIGH_PROTEIN_INDIAN_FOODS
                    if f['name'] not in ('Chicken Breast', 'Fish Curry',
                                         'Boiled Eggs', 'Curd (Yogurt)',
                                         'Paneer (Cottage Cheese)', 'Whey Protein (shake)')]
        else:
            pool = HIGH_PROTEIN_INDIAN_FOODS

        return pool[:5]

    @staticmethod
    def _generate_tips(experience: str, intensity: str) -> List[str]:
        tips_map = {
            'beginner': [
                'Focus on proper form over heavy weights',
                'Rest 90 seconds between sets',
                'Stay hydrated throughout',
            ],
            'intermediate': [
                'Increase weight by 2.5–5 kg weekly',
                'Rest 60–90 seconds between sets',
                'Track your lifts for progressive overload',
            ],
            'advanced': [
                'Apply progressive overload every session',
                'Minimise rest to 60 seconds to maximise intensity',
                'Challenge yourself safely and track PRs',
            ],
        }
        base_tips = list(tips_map.get(experience, tips_map['intermediate']))
        if intensity == 'light':
            base_tips.insert(0, 'Today is a lighter session — focus on movement quality')
        elif intensity == 'push':
            base_tips.insert(0, 'High-intensity day — warm up thoroughly before starting')
        return base_tips

    @staticmethod
    def _build_explanation(
        readiness: float,
        intensity: str,
        history: Dict,
        experience: str,
        goal: str,
    ) -> str:
        parts = []

        if readiness >= 80:
            parts.append(f'Your readiness score is high ({int(readiness)}/100)')
        elif readiness >= 60:
            parts.append(f'Your readiness score is moderate ({int(readiness)}/100)')
        else:
            parts.append(f'Your readiness score is low ({int(readiness)}/100)')

        missed = history.get('missed_days', 0)
        consecutive = history.get('consecutive_days', 0)

        if missed >= 2:
            parts.append(f'you missed {missed} recent sessions so we\'ve eased the load')
        elif consecutive >= 5:
            parts.append(f'you\'ve trained {consecutive} days in a row — progressive overload applied')

        intensity_reason = {
            'light': 'a light recovery workout is recommended',
            'normal': 'a normal intensity session suits your current state',
            'push': 'you\'re ready to push hard today',
        }
        parts.append(intensity_reason.get(intensity, 'a normal session is planned'))

        goal_map = {
            'muscle-gain': 'exercises target hypertrophy with compound movements',
            'fat-loss': 'exercises maximise calorie burn',
            'strength': 'compound lifts dominate for maximal strength',
            'general-fitness': 'a balanced mix of muscle groups is covered',
        }
        parts.append(goal_map.get(goal, 'a balanced workout is planned'))

        return '. '.join(p.capitalize() for p in parts) + '.'

    @staticmethod
    def _get_recommendation(score: float) -> str:
        if score < 35:
            return 'Rest day recommended — light stretching only'
        elif score < 50:
            return 'Take a lighter workout or active recovery session'
        elif score < 65:
            return 'Light to normal intensity workout is fine'
        elif score < 80:
            return 'Normal intensity workout is recommended'
        else:
            return 'You are ready for a challenging workout — push hard safely!'
