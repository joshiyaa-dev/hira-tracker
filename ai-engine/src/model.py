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
        """Load pre-trained models or create new ones"""
        # Load or initialize models
        # In production, these would be trained on a larger dataset
        try:
            self.calorie_model = joblib.load(self.model_path / "calorie_model.pkl")
            self.protein_model = joblib.load(self.model_path / "protein_model.pkl")
            self.intensity_model = joblib.load(self.model_path / "intensity_model.pkl")
        except:
            self.initialize_models()
    
    def initialize_models(self):
        """Initialize fresh models"""
        self.calorie_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.protein_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.intensity_model = RandomForestRegressor(n_estimators=100, random_state=42)
    
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
        try:
            from sklearn.utils.validation import check_is_fitted
            check_is_fitted(self.calorie_model)
            features = self.prepare_features(user_data)
            return float(self.calorie_model.predict(features)[0])
        except Exception:
            return self._calculate_calorie_rule_based(user_data)

    def predict_protein(self, user_data: Dict[str, Any]) -> float:
        """Predict daily protein requirement (grams)"""
        try:
            from sklearn.utils.validation import check_is_fitted
            check_is_fitted(self.protein_model)
            features = self.prepare_features(user_data)
            return float(self.protein_model.predict(features)[0])
        except Exception:
            return self._calculate_protein_rule_based(user_data)

    def predict_intensity(self, user_data: Dict[str, Any]) -> str:
        """Predict recommended intensity"""
        try:
            from sklearn.utils.validation import check_is_fitted
            check_is_fitted(self.intensity_model)
            features = self.prepare_features(user_data)
            prediction = float(self.intensity_model.predict(features)[0])
            if prediction < 0.33:
                return 'light'
            elif prediction < 0.66:
                return 'normal'
            else:
                return 'push'
        except Exception:
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
