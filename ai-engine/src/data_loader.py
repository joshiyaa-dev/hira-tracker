import pandas as pd
import numpy as np
import json
import os
from pathlib import Path
from typing import List, Dict, Any


def _find_data_path() -> Path:
    """Locate the dataset directory, searching common relative paths."""
    # 1. Explicit environment variable
    env_path = os.getenv("DATA_PATH")
    if env_path:
        p = Path(env_path)
        if p.exists():
            return p

    # 2. Search relative to this file's location
    base = Path(__file__).parent.parent  # ai-engine/
    candidates = [
        base / "data",
        base.parent / "datasets",  # repo root/datasets
        base / "datasets",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate

    # 3. Fallback — return the default even if it doesn't exist yet
    return base / "data"


class DataLoader:
    def __init__(self, data_path: str = None):
        self.data_path = Path(data_path) if data_path else _find_data_path()
        self.workout_data = None
        self.food_data = None
        self.load_all_data()

    def load_all_data(self):
        """Load all datasets"""
        self.workout_data = self.load_workouts()
        self.food_data = self.load_foods()

    def load_workouts(self) -> pd.DataFrame:
        """Load workout dataset — tries multiple sub-directory layouts"""
        candidates = [
            self.data_path / "workouts.json",
            self.data_path / "workouts" / "exercises.json",
            self.data_path / "exercises.json",
        ]
        for path in candidates:
            try:
                if path.exists():
                    return pd.read_json(path)
            except Exception as e:
                print(f"Warning: Could not load workouts from {path}: {e}")
        print(f"Warning: No workout data found in {self.data_path}")
        return pd.DataFrame()

    def load_foods(self) -> pd.DataFrame:
        """Load food dataset — tries multiple sub-directory layouts"""
        candidates = [
            self.data_path / "foods.json",
            self.data_path / "foods" / "indian_foods.json",
            self.data_path / "indian_foods.json",
        ]
        for path in candidates:
            try:
                if path.exists():
                    return pd.read_json(path)
            except Exception as e:
                print(f"Warning: Could not load foods from {path}: {e}")
        print(f"Warning: No food data found in {self.data_path}")
        return pd.DataFrame()

    @property
    def get_exercises(self) -> List[Dict[str, Any]]:
        """Get all exercises"""
        if self.workout_data is None or self.workout_data.empty:
            return []
        return self.workout_data.to_dict('records')

    @property
    def get_foods(self) -> List[Dict[str, Any]]:
        """Get all foods"""
        if self.food_data is None or self.food_data.empty:
            return []
        return self.food_data.to_dict('records')

    def get_exercises_by_muscle(self, muscle_group: str) -> List[Dict]:
        """Get exercises for specific muscle group"""
        if self.workout_data is None or self.workout_data.empty:
            return []
        filtered = self.workout_data[
            self.workout_data['muscle_group'].str.lower() == muscle_group.lower()
        ]
        return filtered.to_dict('records')

    def get_foods_by_cuisine(self, cuisine: str) -> List[Dict]:
        """Get foods by cuisine type"""
        if self.food_data is None or self.food_data.empty:
            return []
        filtered = self.food_data[
            self.food_data['cuisine'].str.lower() == cuisine.lower()
        ]
        return filtered.to_dict('records')

    def get_foods_by_diet(self, diet_type: str) -> List[Dict]:
        """Get foods matching diet type.

        For veg users: return veg-only foods.
        For non-veg users: return all foods (veg + non-veg).
        For vegan users: return veg foods only (vegan subset).
        """
        if self.food_data is None or self.food_data.empty:
            return []

        if 'diet_type' not in self.food_data.columns:
            return self.food_data.to_dict('records')

        dt = diet_type.lower()
        if dt in ('veg', 'vegan'):
            filtered = self.food_data[
                self.food_data['diet_type'].str.lower() == 'veg'
            ]
        else:
            # non-veg: all foods available
            filtered = self.food_data

        return filtered.to_dict('records')

    def search_foods(self, query: str) -> List[Dict]:
        """Search foods by name"""
        if self.food_data is None or self.food_data.empty:
            return []
        query_lower = query.lower()
        filtered = self.food_data[
            self.food_data['name'].str.lower().str.contains(query_lower, na=False)
        ]
        return filtered.to_dict('records')
