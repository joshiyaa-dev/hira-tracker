# HIRA – Personal Gym Assistant 🏋️

A complete full-stack AI-powered fitness web app designed specifically for Indian gym users. HIRA replaces personal trainer guidance, adapts daily based on user condition, and provides meal planning with Indian food context.

## 🎯 Features

- **AI-Powered Workout Plans**: Dynamic workout generation based on user profile and readiness
- **Indian Food Database**: 200+ Indian foods with nutritional data
- **Smart Meal Planning**: AI-generated meal suggestions with protein tracking
- **Readiness Scoring**: Daily AI assessment of user condition
- **Progress Tracking**: Visual analytics and streak tracking
- **Smartwatch Integration**: Google Fit and Fitbit support
- **Multi-language**: English, Tamil, Hindi support
- **Dark/Light Mode**: Night-friendly UI

## 🧱 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (fast build tool)
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)

### Backend
- Node.js + Express
- MongoDB
- JWT Authentication
- REST API

### AI Engine
- Python 3.9+
- FastAPI/Flask
- Pandas, Scikit-learn, NumPy
- Rule-based + ML hybrid system

### Databases
- MongoDB (users, logs)
- JSON datasets (foods, workouts)

## 📁 Project Structure

```
hira-tracker/
├── frontend/          # React TypeScript app
├── backend/           # Node.js Express API
├── ai-engine/         # Python AI & ML
├── datasets/          # JSON/CSV data
│   ├── workouts/
│   └── foods/
├── docs/              # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.9+
- MongoDB (local or Atlas)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm start
```

### AI Engine Setup
```bash
cd ai-engine
pip install -r requirements.txt
python app.py
```

## 📱 Complete Screen List

1. **Splash Screen** - Logo animation
2. **Login/Signup** - Phone OTP, Google Auth
3. **Onboarding** - 5-step user profiling
4. **Dashboard** - Main home screen with readiness score
5. **Workout Screen** - Daily workout plan with exercises
6. **Food & Nutrition** - Food logging, protein tracking
7. **Progress** - Weekly stats and trends
8. **Smartwatch Integration** - Connect fitness devices
9. **Settings** - Language, notifications, privacy
10. **Daily Check-in** - Energy, sleep, stress, soreness

## 🧠 AI System

### Input Data
- User profile (age, weight, goal, experience)
- Workout logs
- Food logs
- Sleep data
- Stress levels

### Output
- Daily workout plans
- Meal suggestions
- Protein targets
- Intensity adjustments
- Recovery recommendations

### AI Logic
- **Rule-based**: Sleep < 5h → reduce intensity
- **ML layer**: User profile + history → customized recommendations

## 🗂 Datasets

### Workouts (100+ exercises)
- Exercise name, muscle group, difficulty, equipment, sets/reps

### Indian Foods (200+ items)
- Name, calories, protein, carbs, fat, cuisine type

## ⚠️ Disclaimer

This app provides fitness recommendations but is NOT a substitute for professional medical advice. Always consult healthcare providers before significant lifestyle changes.

## 📝 License

MIT License - See LICENSE file

## 👨‍💻 Author

Built with ❤️ for Indian gym enthusiasts

---

**Get started now and become your own gym assistant!** 🏋️‍♂️
