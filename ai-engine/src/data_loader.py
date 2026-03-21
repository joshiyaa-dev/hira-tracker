import pandas as pd
import numpy as np
import json
from pathlib import Path
from typing import List, Dict, Any

class DataLoader:
    def __init__(self, data_path: str = "./data/"):
        self.data_path = Path(data_path)
        self.workout_data = None
        self.food_data = None
        self.load_all_data()
    
    def load_all_data(self):
        """Load all datasets"""
        self.workout_data = self.load_workouts()
        self.food_data = self.load_foods()
    
    def load_workouts(self) -> pd.DataFrame:
        """Load workout dataset"""
        try:
            return pd.read_json(self.data_path / "workouts.json")
        except Exception as e:
            print(f"Warning: Could not load workouts: {e}")
            return pd.DataFrame()
    
    def load_foods(self) -> pd.DataFrame:
        """Load food dataset"""
        try:
            return pd.read_json(self.data_path / "foods.json")
        except Exception as e:
            print(f"Warning: Could not load foods: {e}")
            return pd.DataFrame()
    
    @property
    def get_exercises(self) -> List[Dict[str, Any]]:
        """Get all exercises"""
        if self.workout_data.empty:
            return []
        return self.workout_data.to_dict('records')
    
    @property
    def get_foods(self) -> List[Dict[str, Any]]:
        """Get all foods"""
        if self.food_data.empty:
            return []
        return self.food_data.to_dict('records')
    
    def get_exercises_by_muscle(self, muscle_group: str) -> List[Dict]:
        """Get exercises for specific muscle group"""
        if self.workout_data.empty:
            return []
        filtered = self.workout_data[
            self.workout_data['muscle_group'].str.lower() == muscle_group.lower()
        ]
        return filtered.to_dict('records')
    
    def get_foods_by_cuisine(self, cuisine: str) -> List[Dict]:
        """Get foods by cuisine type"""
        if self.food_data.empty:
            return []
        filtered = self.food_data[
            self.food_data['cuisine'].str.lower() == cuisine.lower()
        ]
        return filtered.to_dict('records')
    
    def get_foods_by_diet(self, diet_type: str) -> List[Dict]:
        """Get foods matching diet type"""
        if self.food_data.empty:
            return []
        filtered = self.food_data[
            self.food_data['diet_type'].str.lower() == diet_type.lower()
        ]
        return filtered.to_dict('records')
    
    def search_foods(self, query: str) -> List[Dict]:
        """Search foods by name"""
        if self.food_data.empty:
            return []
        query_lower = query.lower()
        filtered = self.food_data[
            self.food_data['name'].str.lower().str.contains(query_lower)
        ]
        return filtered.to_dict('records')
