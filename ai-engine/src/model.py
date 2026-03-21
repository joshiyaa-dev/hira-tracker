import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import joblib
from pathlib import Path
from typing import Dict, Any, Tuple

class FitnessModel:
    """Machine Learning model for fitness recommendations"""
    
    def __init__(self, model_path: str = "./models/"):
        self.model_path = Path(model_path)
        self.scaler = StandardScaler()
        self.calorie_model = None
        self.protein_model = None
        self.intensity_model = None
        self.load_models()
    
    def load_models(self):
        """Load pre-trained models or train on synthetic data"""
        try:
            self.calorie_model = joblib.load(self.model_path / "calorie_model.pkl")
            self.protein_model = joblib.load(self.model_path / "protein_model.pkl")
            self.intensity_model = joblib.load(self.model_path / "intensity_model.pkl")
        except Exception:
            self._train_on_synthetic_data()
    
    def initialize_models(self):
        """Initialize fresh (unfitted) models"""
        self.calorie_model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.protein_model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.intensity_model = RandomForestRegressor(n_estimators=50, random_state=42)

    def _train_on_synthetic_data(self):
        """Train models on synthetic data derived from rule-based formulas."""
        self.initialize_models()
        rng = np.random.default_rng(42)
        n = 500

        ages = rng.integers(16, 60, n).astype(float)
        weights = rng.uniform(45, 120, n)
        heights = rng.uniform(150, 200, n)
        genders = rng.integers(0, 2, n).astype(float)
        body_types = rng.integers(0, 3, n).astype(float)
        lifestyles = rng.integers(0, 3, n).astype(float)
        experiences = rng.integers(0, 3, n).astype(float)
        goals = rng.integers(0, 4, n).astype(float)

        X = np.column_stack([ages, weights, heights, genders, body_types, lifestyles, experiences, goals])

        # Build targets using rule-based formulas
        calorie_targets = []
        protein_targets = []
        intensity_targets = []

        factors_map = {0: 1.2, 1: 1.55, 2: 1.9}
        protein_mult = {0: 2.0, 1: 2.2, 2: 1.8, 3: 1.6}

        for i in range(n):
            age, weight, height, gender, _, lifestyle, experience, goal = X[i]
            if gender == 0:
                bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
            else:
                bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
            factor = factors_map.get(int(lifestyle), 1.55)
            calorie_targets.append(round(bmr * factor))

            mult = protein_mult.get(int(goal), 1.6)
            protein_targets.append(round(weight * mult))

            if experience == 0:
                intensity = 0.3
            elif experience == 1:
                intensity = 0.6
            else:
                intensity = 0.9
            if lifestyle == 2:
                intensity = min(1.0, intensity + 0.1)
            intensity_targets.append(intensity)

        self.calorie_model.fit(X, calorie_targets)
        self.protein_model.fit(X, protein_targets)
        self.intensity_model.fit(X, intensity_targets)
        print("✅ AI models trained on synthetic data")
    
    def prepare_features(self, user_data: Dict[str, Any]) -> np.ndarray:
        """Prepare user data as features for model"""
        features = [
            user_data.get('age', 25),
            user_data.get('weight', 75),
            user_data.get('height', 180),
            self._encode_gender(user_data.get('gender', 'male')),
            self._encode_body_type(user_data.get('body_type', 'mesomorph')),
            self._encode_lifestyle(user_data.get('lifestyle', 'moderate')),
            self._encode_experience(user_data.get('gym_experience', 'intermediate')),
            self._encode_goal(user_data.get('fitness_goal', 'general-fitness')),
        ]
        return np.array(features).reshape(1, -1)
    
    @staticmethod
    def _encode_gender(gender: str) -> int:
        """Encode gender as numeric"""
        mapping = {'male': 0, 'female': 1, 'other': 2}
        return mapping.get(gender.lower(), 0)
    
    @staticmethod
    def _encode_body_type(body_type: str) -> int:
        """Encode body type as numeric"""
        mapping = {'ectomorph': 0, 'mesomorph': 1, 'endomorph': 2}
        return mapping.get(body_type.lower(), 1)
    
    @staticmethod
    def _encode_lifestyle(lifestyle: str) -> int:
        """Encode lifestyle as numeric"""
        mapping = {'sedentary': 0, 'moderate': 1, 'active': 2}
        return mapping.get(lifestyle.lower(), 1)
    
    @staticmethod
    def _encode_experience(exp: str) -> int:
        """Encode gym experience as numeric"""
        mapping = {'beginner': 0, 'intermediate': 1, 'advanced': 2}
        return mapping.get(exp.lower(), 1)
    
    @staticmethod
    def _encode_goal(goal: str) -> int:
        """Encode fitness goal as numeric"""
        mapping = {
            'fat-loss': 0,
            'muscle-gain': 1,
            'strength': 2,
            'general-fitness': 3,
        }
        return mapping.get(goal.lower(), 3)
    
    def predict_calories(self, user_data: Dict[str, Any]) -> float:
        """Predict daily calorie requirement"""
        features = self.prepare_features(user_data)
        try:
            if self.calorie_model is not None:
                return float(self.calorie_model.predict(features)[0])
        except Exception:
            pass
        return self._calculate_calorie_rule_based(user_data)
    
    def predict_protein(self, user_data: Dict[str, Any]) -> float:
        """Predict daily protein requirement (grams)"""
        features = self.prepare_features(user_data)
        try:
            if self.protein_model is not None:
                return float(self.protein_model.predict(features)[0])
        except Exception:
            pass
        return self._calculate_protein_rule_based(user_data)
    
    def predict_intensity(self, user_data: Dict[str, Any]) -> str:
        """Predict recommended intensity"""
        features = self.prepare_features(user_data)
        try:
            if self.intensity_model is not None:
                prediction = float(self.intensity_model.predict(features)[0])
                if prediction < 0.4:
                    return 'light'
                elif prediction < 0.7:
                    return 'normal'
                else:
                    return 'push'
        except Exception:
            pass
        return self._calculate_intensity_rule_based(user_data)
    
    @staticmethod
    def _calculate_calorie_rule_based(user_data: Dict[str, Any]) -> float:
        """Rule-based calorie calculation"""
        weight = user_data.get('weight', 75)
        height = user_data.get('height', 180)
        age = user_data.get('age', 25)
        gender = user_data.get('gender', 'male')
        
        # Harris-Benedict equation
        if gender.lower() == 'male':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        # Apply activity factor
        lifestyle = user_data.get('lifestyle', 'moderate')
        factors = {'sedentary': 1.2, 'moderate': 1.55, 'active': 1.9}
        tdee = bmr * factors.get(lifestyle.lower(), 1.55)
        
        return round(tdee)
    
    @staticmethod
    def _calculate_protein_rule_based(user_data: Dict[str, Any]) -> float:
        """Rule-based protein calculation"""
        weight = user_data.get('weight', 75)
        goal = user_data.get('fitness_goal', 'general-fitness').lower()
        
        # Protein per kg based on goal
        if 'muscle' in goal:
            multiplier = 2.2  # 2.2g per kg for muscle gain
        elif 'strength' in goal:
            multiplier = 1.8
        elif 'fat' in goal:
            multiplier = 2.0  # Higher during deficit
        else:
            multiplier = 1.6  # General fitness
        
        return round(weight * multiplier)
    
    @staticmethod
    def _calculate_intensity_rule_based(user_data: Dict[str, Any]) -> str:
        """Rule-based intensity selection"""
        exp = user_data.get('gym_experience', 'intermediate').lower()
        goal = user_data.get('fitness_goal', 'general-fitness').lower()
        
        if exp == 'beginner':
            return 'normal'
        elif 'strength' in goal:
            return 'push'
        else:
            return 'normal'
