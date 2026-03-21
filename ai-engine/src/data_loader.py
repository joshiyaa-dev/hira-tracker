import pandas as pd
import numpy as np
import json
import os
from pathlib import Path
from typing import List, Dict, Any

# Resolve dataset paths relative to this file's location
_SRC_DIR = Path(__file__).parent          # ai-engine/src/
_AI_DIR = _SRC_DIR.parent                 # ai-engine/
_REPO_ROOT = _AI_DIR.parent              # repo root

_DEFAULT_WORKOUTS = _REPO_ROOT / "datasets" / "workouts" / "exercises.json"
_DEFAULT_FOODS = _REPO_ROOT / "datasets" / "foods" / "indian_foods.json"


class DataLoader:
    def __init__(self, data_path: str = ""):
        # data_path is ignored; we use the resolved paths above
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
            path = Path(os.getenv("WORKOUTS_DATA_PATH", str(_DEFAULT_WORKOUTS)))
            return pd.read_json(path)
        except Exception as e:
            print(f"Warning: Could not load workouts: {e}")
            return pd.DataFrame()

    def load_foods(self) -> pd.DataFrame:
        """Load food dataset"""
        try:
            path = Path(os.getenv("FOODS_DATA_PATH", str(_DEFAULT_FOODS)))
            return pd.read_json(path)
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
    
    def get_all_foods(self) -> List[Dict]:
        """Get all foods regardless of diet type"""
        if self.food_data.empty:
            return []
        return self.food_data.to_dict('records')

    def search_foods(self, query: str) -> List[Dict]:
        """Search foods by name"""
        if self.food_data.empty:
            return []
        query_lower = query.lower()
        filtered = self.food_data[
            self.food_data['name'].str.lower().str.contains(query_lower)
        ]
        return filtered.to_dict('records')
