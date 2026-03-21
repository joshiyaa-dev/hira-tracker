import random
from typing import Dict, List, Any
from model import FitnessModel
from data_loader import DataLoader

class RecommendationEngine:
    """Main recommendation engine for HIRA"""
    
    def __init__(self):
        self.model = FitnessModel()
        self.data_loader = DataLoader()
    
    def generate_workout(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized workout plan"""
        # Get user parameters
        experience = user_data.get('gym_experience', 'intermediate')
        goal = user_data.get('fitness_goal', 'general-fitness')
        readiness = user_data.get('readiness_score', 75)
        intensity = self._adjust_intensity_from_readiness(readiness)
        
        # Select exercises based on goal and experience
        exercises = self._select_exercises(goal, experience, intensity)
        
        # Calculate duration
        duration = self._calculate_duration(experience, len(exercises))
        
        return {
            'exercises': exercises,
            'total_duration': duration,
            'intensity': intensity,
            'readiness_score': readiness,
            'tips': self._generate_tips(experience),
        }
    
    def suggest_meals(self, user_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Generate meal suggestions"""
        diet_type = user_data.get('diet_type', 'non-veg')
        fitness_goal = user_data.get('fitness_goal', 'general-fitness')
        
        # Get calorie and protein targets
        daily_calories = self.model.predict_calories(user_data)
        daily_protein = self.model.predict_protein(user_data)
        
        # Filter foods by diet
        available_foods = self.data_loader.get_foods_by_diet(diet_type)
        
        # Create meal plan
        breakfast = self._suggest_meal(available_foods, 'breakfast', daily_calories * 0.25)
        lunch = self._suggest_meal(available_foods, 'lunch', daily_calories * 0.35)
        dinner = self._suggest_meal(available_foods, 'dinner', daily_calories * 0.30)
        snacks = self._suggest_meal(available_foods, 'snack', daily_calories * 0.10)
        
        return {
            'breakfast': breakfast,
            'lunch': lunch,
            'dinner': dinner,
            'snacks': snacks,
            'daily_targets': {
                'calories': daily_calories,
                'protein_grams': daily_protein,
            },
        }
    
    def adjust_intensity(self, user_data: Dict[str, Any], readiness: Dict[str, Any]) -> str:
        """Adjust workout intensity based on readiness"""
        # Rule-based logic
        if readiness.get('sleep', 0) < 5:
            return 'light'
        if readiness.get('stress', 10) > 7:
            return 'light'
        if readiness.get('soreness', 0) > 7:
            return 'light'
        
        return self.model.predict_intensity(user_data)
    
    def calculate_readiness_score(self, checkin_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate daily readiness score"""
        energy = checkin_data.get('energy', 5)  # 1-10
        sleep = checkin_data.get('sleep', 7)    # hours
        stress = checkin_data.get('stress', 5)  # 1-10
        soreness = checkin_data.get('soreness', 3)  # 1-10
        
        # Calculate score (0-100)
        energy_score = energy * 10
        sleep_score = min(sleep / 8 * 100, 100)
        stress_score = (10 - stress) * 10
        soreness_score = (10 - soreness) * 10
        
        readiness_score = (energy_score * 0.25 + sleep_score * 0.35 + 
                          stress_score * 0.25 + soreness_score * 0.15)
        
        return {
            'score': max(0, min(100, readiness_score)),
            'factors': {
                'sleep': sleep_score / 100,
                'energy': energy_score / 100,
                'stress': stress_score / 100,
                'soreness': soreness_score / 100,
            },
            'recommendation': self._get_recommendation(readiness_score),
        }
    
    @staticmethod
    def _adjust_intensity_from_readiness(readiness: int) -> str:
        """Adjust intensity based on readiness score"""
        if readiness < 50:
            return 'light'
        elif readiness < 75:
            return 'normal'
        else:
            return 'push'
    
    def _select_exercises(self, goal: str, experience: str, intensity: str) -> List[Dict]:
        """Select appropriate exercises"""
        exercises = []
        
        # Define muscle groups based on goal
        if 'muscle' in goal:
            muscle_groups = ['chest', 'back', 'shoulders', 'arms', 'legs']
        elif 'strength' in goal:
            muscle_groups = ['chest', 'back', 'legs']
        else:
            muscle_groups = ['chest', 'back', 'legs', 'shoulders']
        
        # Select exercises for each muscle group
        for muscle in muscle_groups:
            available = self.data_loader.get_exercises_by_muscle(muscle)
            if available:
                filtered = [e for e in available 
                           if e.get('difficulty') == experience or 
                           e.get('difficulty') in experience.split()]
                if filtered:
                    exercise = random.choice(filtered)
                    exercises.append({
                        'id': exercise.get('id'),
                        'name': exercise.get('name'),
                        'muscle_group': muscle,
                        'sets': exercise.get('sets', 3),
                        'reps': exercise.get('reps', 10),
                        'equipment': exercise.get('equipment'),
                        'safety_tips': exercise.get('safety_tips', []),
                    })
        
        return exercises[:6]  # Max 6 exercises
    
    @staticmethod
    def _calculate_duration(experience: str, num_exercises: int) -> int:
        """Calculate workout duration"""
        base_time = 8 if experience == 'beginner' else 10
        return min(60, base_time * num_exercises)
    
    @staticmethod
    def _suggest_meal(foods: List[Dict], meal_type: str, target_calories: float) -> List[Dict]:
        """Suggest meal items"""
        if not foods:
            return []
        
        suggested = random.sample(foods, min(3, len(foods)))
        return [{
            'name': food.get('name'),
            'calories': food.get('calories'),
            'protein': food.get('protein'),
            'serving': food.get('serving_size'),
        } for food in suggested]
    
    @staticmethod
    def _generate_tips(experience: str) -> List[str]:
        """Generate workout tips"""
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
                'Minimize rest to 60 seconds',
                'Challenge yourself safely',
            ],
        }
        return tips_map.get(experience, tips_map['intermediate'])
    
    @staticmethod
    def _get_recommendation(score: float) -> str:
        """Get readiness recommendation"""
        if score < 40:
            return 'Take a rest day or do light stretching'
        elif score < 60:
            return 'Do a lighter workout today'
        elif score < 80:
            return 'Normal intensity workout is fine'
        else:
            return 'You are ready for a challenging workout!'
