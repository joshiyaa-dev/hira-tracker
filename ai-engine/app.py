from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
import os
from dotenv import load_dotenv

from src.recommendation_engine import RecommendationEngine

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="HIRA AI Engine",
    description="AI-powered fitness recommendation engine for HIRA",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize recommendation engine (single instance — preserves in-memory history)
engine = RecommendationEngine()

# Pydantic models
class UserData(BaseModel):
    user_id: str
    age: int
    weight: float
    height: float
    gender: str
    body_type: str
    lifestyle: str
    gym_experience: str
    fitness_goal: str
    diet_type: Optional[str] = 'non-veg'
    readiness_score: Optional[float] = 75
    current_protein: Optional[float] = 0  # grams consumed so far today

class CheckInData(BaseModel):
    energy: int  # 1-10
    sleep: float  # hours
    stress: int  # 1-10
    soreness: int  # 1-10
    notes: Optional[str] = None

class IntensityAdjustment(BaseModel):
    intensity: str  # light, normal, push

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "HIRA AI Engine",
        "version": "1.0.0",
    }

# Generate workout
@app.post("/generate-plan")
async def generate_workout(user: UserData):
    """Generate personalized workout plan"""
    try:
        user_dict = user.dict()
        workout = engine.generate_workout(user_dict)
        return {
            "success": True,
            "data": workout,
        }
    except Exception as e:
        logger.error(f"Error generating workout: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Meal suggestions
@app.post("/meal-suggestions")
async def get_meal_suggestions(user: UserData):
    """Get meal suggestions with protein deficiency detection"""
    try:
        user_dict = user.dict()
        meals = engine.suggest_meals(user_dict)
        return {
            "success": True,
            "data": meals,
        }
    except Exception as e:
        logger.error(f"Error generating meals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Readiness score
@app.post("/readiness-score")
async def get_readiness_score(checkin: CheckInData):
    """Calculate readiness score"""
    try:
        checkin_dict = checkin.dict()
        readiness = engine.calculate_readiness_score(checkin_dict)
        return {
            "success": True,
            "data": readiness,
        }
    except Exception as e:
        logger.error(f"Error calculating readiness: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Adjust intensity
@app.post("/adjust-intensity")
async def adjust_intensity(user: UserData, intensity_adj: IntensityAdjustment):
    """Adjust workout intensity based on readiness"""
    try:
        user_dict = user.dict()
        intensity = engine.adjust_intensity(user_dict, intensity_adj.dict())
        return {
            "success": True,
            "data": {"intensity": intensity},
        }
    except Exception as e:
        logger.error(f"Error adjusting intensity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "HIRA AI Engine",
        "status": "running",
        "endpoints": [
            "/health",
            "/generate-plan",
            "/meal-suggestions",
            "/readiness-score",
            "/adjust-intensity",
        ],
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
