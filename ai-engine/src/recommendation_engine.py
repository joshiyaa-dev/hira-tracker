import random
from collections import defaultdict
from typing import Dict, List, Any, Optional

try:
    from src.model import FitnessModel
    from src.data_loader import DataLoader
except ImportError:
    from model import FitnessModel  # type: ignore
    from data_loader import DataLoader  # type: ignore


class RecommendationEngine:
    """Main recommendation engine for HIRA — rule-based + scoring system"""

    def __init__(self):
        self.model = FitnessModel()
        self.data_loader = DataLoader()
        # In-memory user history (user_id → list of workout/meal records)
        self._workout_history: Dict[str, List[Dict]] = defaultdict(list)
        self._missed_workouts: Dict[str, int] = defaultdict(int)

    # ------------------------------------------------------------------ #
    #  PUBLIC API                                                          #
    # ------------------------------------------------------------------ #

    def generate_workout(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized workout plan with progressive overload."""
        experience = user_data.get('gym_experience', 'intermediate')
        goal = user_data.get('fitness_goal', 'general-fitness')
        readiness = user_data.get('readiness_score', 75)
        user_id = user_data.get('user_id', 'anonymous')

        # Compute intensity from readiness and missed-workout history
        intensity = self._determine_intensity(readiness, user_id)

        # Select exercises, skipping muscle groups done yesterday
        exercises = self._select_exercises(goal, experience, intensity, user_id)

        # Apply progressive overload or regression
        exercises = self._apply_progressive_overload(exercises, user_id)

        duration = self._calculate_duration(experience, len(exercises))
        explanation = self._explain_plan(readiness, intensity, user_id)

        # Record workout in history
        self._record_workout(user_id, exercises)

        return {
            'exercises': exercises,
            'total_duration': duration,
            'intensity': intensity,
            'readiness_score': readiness,
            'tips': self._generate_tips(experience),
            'explanation': explanation,
        }

    def suggest_meals(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalised Indian meal suggestions."""
        diet_type = user_data.get('diet_type', 'non-veg')
        daily_calories = self.model.predict_calories(user_data)
        daily_protein = self.model.predict_protein(user_data)

        current_protein = float(user_data.get('current_protein', 0))
        protein_deficit = daily_protein - current_protein
        protein_deficient = protein_deficit > daily_protein * 0.4

        available_foods = self.data_loader.get_foods_by_diet(diet_type)
        if not available_foods:
            available_foods = self.data_loader.get_all_foods()

        # If protein deficient, bias food selection toward high-protein items
        if protein_deficient:
            high_protein = [
                f for f in available_foods
                if float(f.get('protein', 0)) >= 10
            ]
            if high_protein:
                available_foods = high_protein

        breakfast = self._suggest_meal(available_foods, 'breakfast', daily_calories * 0.25)
        lunch = self._suggest_meal(available_foods, 'lunch', daily_calories * 0.35)
        dinner = self._suggest_meal(available_foods, 'dinner', daily_calories * 0.30)
        snacks = self._suggest_meal(available_foods, 'snack', daily_calories * 0.10)

        alert = None
        if protein_deficient:
            alert = (
                f"⚠️ You are {int(protein_deficit)}g short of your protein target. "
                "High-protein Indian foods like Paneer, Chicken, Dal, or Curd are suggested."
            )

        return {
            'breakfast': breakfast,
            'lunch': lunch,
            'dinner': dinner,
            'snacks': snacks,
            'daily_targets': {
                'calories': daily_calories,
                'protein_grams': daily_protein,
            },
            'protein_alert': alert,
        }

    def adjust_intensity(self, user_data: Dict[str, Any], readiness: Dict[str, Any]) -> str:
        """Adjust workout intensity from readiness check-in data."""
        sleep = readiness.get('sleep', 7)
        stress = readiness.get('stress', 5)
        soreness = readiness.get('soreness', 3)
        energy = readiness.get('energy', 5)

        # Hard safety rules first
        if sleep < 5 or soreness > 7:
            return 'light'
        if stress > 7 or energy <= 3:
            return 'light'
        if sleep < 6 or soreness > 5:
            return 'normal'

        return self.model.predict_intensity(user_data)

    def calculate_readiness_score(self, checkin_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate daily readiness score (0-100)."""
        energy = float(checkin_data.get('energy', 5))   # 1-10
        sleep = float(checkin_data.get('sleep', 7))     # hours
        stress = float(checkin_data.get('stress', 5))   # 1-10
        soreness = float(checkin_data.get('soreness', 3))  # 1-10

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

    # ------------------------------------------------------------------ #
    #  HISTORY & PROGRESSIVE OVERLOAD                                     #
    # ------------------------------------------------------------------ #

    def _record_workout(self, user_id: str, exercises: List[Dict]) -> None:
        history = self._workout_history[user_id]
        history.append({'exercises': exercises})
        # Keep last 7 sessions only
        self._workout_history[user_id] = history[-7:]
        # Reset missed-workout counter on successful plan generation
        self._missed_workouts[user_id] = 0

    def _get_recent_muscle_groups(self, user_id: str) -> List[str]:
        """Return muscle groups trained in the last session."""
        history = self._workout_history.get(user_id, [])
        if not history:
            return []
        last = history[-1].get('exercises', [])
        return [e.get('muscle_group', '') for e in last]

    def _apply_progressive_overload(
        self, exercises: List[Dict], user_id: str
    ) -> List[Dict]:
        """Increase sets/reps if user is consistent; reduce if missed workouts."""
        history = self._workout_history.get(user_id, [])
        missed = self._missed_workouts.get(user_id, 0)
        sessions_done = len(history)

        result = []
        for ex in exercises:
            sets = int(ex.get('sets', 3))
            reps = int(ex.get('reps', 10))

            if missed >= 3:
                # Reduce load after 3+ missed workouts
                sets = max(2, sets - 1)
                reps = max(6, reps - 2)
            elif sessions_done >= 3:
                # Progressive overload after 3+ consistent sessions
                sets = min(sets + 1, 5)
                reps = min(reps + 2, 20)

            result.append({**ex, 'sets': sets, 'reps': reps})
        return result

    # ------------------------------------------------------------------ #
    #  EXERCISE SELECTION                                                  #
    # ------------------------------------------------------------------ #

    def _select_exercises(
        self, goal: str, experience: str, intensity: str, user_id: str
    ) -> List[Dict]:
        """Select exercises, rotating muscle groups to avoid repetition."""
        if 'muscle' in goal:
            all_groups = ['chest', 'back', 'shoulders', 'arms', 'legs']
        elif 'strength' in goal:
            all_groups = ['chest', 'back', 'legs']
        elif 'fat' in goal:
            all_groups = ['legs', 'chest', 'back', 'shoulders']
        else:
            all_groups = ['chest', 'back', 'legs', 'shoulders']

        # Rotate: skip muscle groups from last session
        recent = set(self._get_recent_muscle_groups(user_id))
        rotated = [g for g in all_groups if g not in recent]
        if not rotated:
            rotated = all_groups  # fallback if everything was done

        exercises = []
        for muscle in rotated:
            available = self.data_loader.get_exercises_by_muscle(muscle)
            if not available:
                continue

            # Filter by experience; for light intensity use beginner exercises
            if intensity == 'light':
                filtered = [e for e in available if e.get('difficulty') == 'beginner']
            else:
                filtered = [
                    e for e in available
                    if e.get('difficulty') in (experience, 'beginner', 'intermediate')
                ]

            pool = filtered if filtered else available
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

    # ------------------------------------------------------------------ #
    #  HELPERS                                                             #
    # ------------------------------------------------------------------ #

    def _determine_intensity(self, readiness: float, user_id: str) -> str:
        missed = self._missed_workouts.get(user_id, 0)
        if missed >= 3:
            return 'light'
        return self._adjust_intensity_from_readiness(readiness)

    def _explain_plan(self, readiness: float, intensity: str, user_id: str) -> str:
        missed = self._missed_workouts.get(user_id, 0)
        history_len = len(self._workout_history.get(user_id, []))
        parts = []

        if missed >= 3:
            parts.append(
                f"You've missed {missed} sessions, so we've reduced the load to help you ease back."
            )
        elif history_len >= 3:
            parts.append(
                "You've been consistent — sets and reps have been progressively increased."
            )

        if readiness < 50:
            parts.append(
                f"Your readiness score is {int(readiness)}/100 (low), so today is a recovery session."
            )
        elif readiness < 75:
            parts.append(f"Readiness score {int(readiness)}/100 — moderate intensity is appropriate.")
        else:
            parts.append(f"Readiness score {int(readiness)}/100 — you're ready to push hard!")

        recent = self._get_recent_muscle_groups(user_id)
        if recent:
            parts.append(
                f"Muscle groups from your last session ({', '.join(set(recent))}) have been swapped out for variety."
            )

        return " ".join(parts) if parts else f"Today's {intensity} intensity plan is tailored to your profile."

    @staticmethod
    def _adjust_intensity_from_readiness(readiness: float) -> str:
        if readiness < 50:
            return 'light'
        elif readiness < 75:
            return 'normal'
        else:
            return 'push'

    @staticmethod
    def _calculate_duration(experience: str, num_exercises: int) -> int:
        base_time = 8 if experience == 'beginner' else 10
        return min(60, base_time * num_exercises)

    @staticmethod
    def _suggest_meal(foods: List[Dict], meal_type: str, target_calories: float) -> List[Dict]:
        if not foods:
            return []
        suggested = random.sample(foods, min(3, len(foods)))
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
    def _generate_tips(experience: str) -> List[str]:
        tips_map = {
            'beginner': [
                'Focus on proper form over heavy weights',
                'Rest 90 seconds between sets',
                'Stay hydrated throughout',
            ],
            'intermediate': [
                'Increase weight by 2.5-5kg weekly',
                'Rest 60-90 seconds between sets',
                'Track your lifts',
            ],
            'advanced': [
                'Use progressive overload',
                'Minimise rest to 60 seconds',
                'Challenge yourself safely',
            ],
        }
        return tips_map.get(experience, tips_map['intermediate'])

    @staticmethod
    def _get_recommendation(score: float) -> str:
        if score < 40:
            return 'Take a rest day or do light stretching'
        elif score < 60:
            return 'Do a lighter workout today'
        elif score < 80:
            return 'Normal intensity workout is fine'
        else:
            return 'You are ready for a challenging workout!'
