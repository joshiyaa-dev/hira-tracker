# AI Engine Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

```bash
cd ai-engine

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### Run AI Engine

```bash
python app.py
```

Server runs at `http://localhost:8000`

API docs available at `http://localhost:8000/docs`

## 📚 Project Structure

```
ai-engine/
├── src/
│   ├── data_loader.py       # Load datasets
│   ├── model.py             # ML models
│   ├── recommendation_engine.py  # Main logic
│   └── __init__.py
├── data/                    # Datasets (auto-loaded)
├── models/                  # Trained models (optional)
├── app.py                   # FastAPI app
├── requirements.txt
└── .env.example
```

## 🧠 Core Modules

### 1. **data_loader.py**
Loads and manages datasets:
- Workouts database
- Foods database (Indian cuisine)
- Exercises by muscle group
- Foods by diet type

```python
from src.data_loader import DataLoader
loader = DataLoader()
exercises = loader.get_exercises_by_muscle('chest')
foods = loader.search_foods('chicken')
```

### 2. **model.py**
Machine learning models:
- Calorie prediction
- Protein requirement
- Intensity suggestion
- Rule-based fallbacks

```python
from src.model import FitnessModel
model = FitnessModel()
calories = model.predict_calories(user_data)
protein = model.predict_protein(user_data)
intensity = model.predict_intensity(user_data)
```

### 3. **recommendation_engine.py**
Main recommendation logic:
- Workout generation
- Meal suggestions
- Readiness scoring
- Intensity adjustments

```python
from src.recommendation_engine import RecommendationEngine
engine = RecommendationEngine()
workout = engine.generate_workout(user_data)
meals = engine.suggest_meals(user_data)
readiness = engine.calculate_readiness_score(checkin_data)
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Generate Workout Plan
```
POST /generate-plan
Body: {
  "user_id": "string",
  "age": 25,
  "weight": 75,
  "height": 180,
  "gender": "male",
  "body_type": "mesomorph",
  "lifestyle": "moderate",
  "gym_experience": "intermediate",
  "fitness_goal": "muscle-gain",
  "readiness_score": 75
}

Response: {
  "success": true,
  "data": {
    "exercises": [...],
    "total_duration": 60,
    "intensity": "normal",
    "tips": [...]
  }
}
```

### Meal Suggestions
```
POST /meal-suggestions
Body: { Same user data }

Response: {
  "success": true,
  "data": {
    "breakfast": [...],
    "lunch": [...],
    "dinner": [...],
    "daily_targets": {...}
  }
}
```

### Readiness Score
```
POST /readiness-score
Body: {
  "energy": 8,
  "sleep": 7,
  "stress": 3,
  "soreness": 2
}

Response: {
  "success": true,
  "data": {
    "score": 82,
    "factors": {...},
    "recommendation": "..."
  }
}
```

### Adjust Intensity
```
POST /adjust-intensity
Body: {
  "user_id": "string",
  ...user_data,
  "intensity": "normal"
}

Response: {
  "success": true,
  "data": { "intensity": "light" }
}
```

## 🗂️ Dataset Structure

### Workouts (exercises.json)
```json
{
  "id": "ex_001",
  "name": "Bench Press",
  "muscle_group": "chest",
  "difficulty": "intermediate",
  "equipment": "barbell",
  "sets": 4,
  "reps": 6,
  "safety_tips": [...]
}
```

### Foods (indian_foods.json)
```json
{
  "id": "food_001",
  "name": "Boiled Egg",
  "calories": 78,
  "protein": 6.3,
  "carbs": 0.6,
  "fat": 5.3,
  "serving_size": "1 egg",
  "cuisine": "Indian",
  "diet_type": "non-veg"
}
```

## 🧬 AI/ML Features

### Rule-Based Logic
- Sleep deprived (<5h) → light intensity
- High stress (>7/10) → reduce intensity  
- High soreness (>7/10) → recovery workout
- Protein target based on goal and weight

### Machine Learning
- Calorie calculation (Harris-Benedict)
- Protein requirement (based on goal)
- Intensity recommendation
- Fallback to rule-based if ML fails

## 🔐 Environment Variables

```env
PORT=8000
DEBUG=True
BACKEND_URL=http://localhost:5000
API_KEY=your_api_key_here
MODEL_PATH=./models/
DATA_PATH=./data/
LOG_LEVEL=DEBUG
```

## 📊 Datasets Information

### Included Datasets
- **Workouts**: 20+ exercises
- **Foods**: 60+ Indian foods
- **Muscle Groups**: Chest, Back, Shoulders, Legs, Arms

### Extending Datasets

Create `/data/workouts.json`:
```bash
mkdir -p ai-engine/data
# Add exercises.json here
```

Create `/data/foods.json`:
```bash
# Add indian_foods.json here
```

## 🚀 Deployment

### Using Gunicorn (Production)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "app.py"]
```

## 🧪 Testing

```bash
# Test an endpoint
curl -X POST "http://localhost:8000/generate-plan" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"1","age":25,...}'

# View API docs
# Visit: http://localhost:8000/docs
```

## 📈 Performance Optimization

- Datasets loaded at startup
- Models cached in memory  
- Rule-based fallback for speed
- Async API endpoints (FastAPI)

## 🛠️ Key Technologies

- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pandas** - Data processing
- **Scikit-learn** - Machine learning
- **NumPy** - Numerical operations
- **Pydantic** - Data validation

## 📝 Further Reading

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Scikit-learn](https://scikit-learn.org)
- [Pandas](https://pandas.pydata.org)
- [NumPy](https://numpy.org)

## 🚨 Troubleshooting

### Module not found
```bash
# Verify in correct directory
cd ai-engine

# Reinstall dependencies
pip install -r requirements.txt
```

### Port already in use
```bash
python app.py --port 8001
```

### Python version issue
```bash
python --version  # Should be 3.9+
```
