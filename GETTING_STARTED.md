# HIRA - Getting Started Guide

## 🎯 Project Overview

HIRA (Your Personal Gym Assistant) is a complete full-stack AI-powered fitness web application designed specifically for Indian gym users.

### Key Features
✅ AI-powered workout generation
✅ Personalized meal planning (Indian cuisine)
✅ Daily readiness scoring
✅ Progress tracking & analytics
✅ Smartwatch integration
✅ Multi-language support (English, Hindi, Tamil)
✅ Dark mode
✅ Production-ready code

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org))
- Python 3.9+ ([Download](https://python.org))
- MongoDB ([Download](https://mongodb.com/download-center/download))

### One-Command Setup (Recommended)

#### For Linux/macOS:
```bash
# Clone and setup
git clone <repo-url>
cd hira-tracker

# Frontend
cd frontend && npm install &

# Backend  
cd ../backend && npm install &

# AI Engine
cd ../ai-engine && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt &

# Start MongoDB
mongod &

wait

# Start services in separate terminals
echo "🚀 Starting all services..."
```

#### For Windows:
```powershell
# Frontend
cd frontend
npm install
npm run dev

# Backend (new terminal)
cd backend
npm install
npm run dev

# AI Engine (new terminal)
cd ai-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

# MongoDB (new terminal)
mongod
```

## 📂 Project Structure

```
hira-tracker/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + MongoDB
├── ai-engine/         # Python + FastAPI + ML
├── datasets/          # Workouts & Foods data
├── docs/              # Documentation
│   └── ARCHITECTURE.md
├── README.md          # Main documentation
└── (other files)
```

## 🚀 Running the Application

Open 4 terminals and run:

**Terminal 1 - Frontend**
```bash
cd frontend
npm run dev
# Access at: http://localhost:5173
```

**Terminal 2 - Backend**
```bash
cd backend
cp .env.example .env
npm run dev
# Server at: http://localhost:5000
```

**Terminal 3 - AI Engine**
```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Server at: http://localhost:8000
```

**Terminal 4 - MongoDB**
```bash
mongod
```

## 🎨 10 Screens (Complete UI)

1. **Splash Screen** - Animated logo & loading
2. **Login/Signup** - Phone OTP & Google auth
3. **Onboarding** - 5-step user profiling
4. **Dashboard** - Main home screen
5. **Workout Screen** - Daily plan with exercises
6. **Food & Nutrition** - Food logging & tracking
7. **Progress** - Stats & trends
8. **Smartwatch** - Device integration
9. **Settings** - Preferences & options

## 🧠 AI System

### What it Does
- Generates personalized workouts
- Suggests Indian meals
- Calculates daily readiness score
- Adjusts workout intensity
- Provides recovery recommendations

### How it Works
1. **Rule-Based Logic**
   - Sleep < 5h → Light intensity
   - High stress → Reduce intensity
   - High soreness → Recovery workout

2. **Machine Learning**
   - Predicts calorie needs
   - Calculates protein requirements
   - Learns from user history

## 🗂 Datasets Included

### Workouts (exercises.json)
- 20+ exercises
- Muscle groups: Chest, Back, Shoulders, Arms, Legs
- Difficulty levels: Beginner, Intermediate, Advanced
- Safety tips included

### Indian Foods (indian_foods.json)
- 60+ food items
- Nutritional info (calories, protein, carbs, fat)
- Serving sizes
- Diet types: Veg, Non-veg, Vegan

## 📡 API Endpoints

### Frontend → Backend
- `POST /api/auth/request-otp` - Send OTP
- `POST /api/auth/login-otp` - Login with OTP
- `GET /api/workouts/:userId/today` - Today's workout
- `POST /api/nutrition/:userId/log-food` - Log food
- `POST /api/health/:userId/check-in` - Daily check-in
- `GET /api/health/:userId/readiness` - Readiness score

### Backend → AI Engine
- `POST /generate-plan` - Generate workout
- `POST /meal-suggestions` - Suggest meals
- `POST /readiness-score` - Calculate readiness
- `POST /adjust-intensity` - Adjust intensity

## 🔐 Authentication

- Phone OTP login
- Google OAuth (ready to integrate)
- JWT token-based sessions
- Secure password storage (bcryptjs)

## 🎯 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI/ML | Python, FastAPI, Scikit-learn, Pandas, NumPy |
| DevOps | Docker, GitHub Actions (ready) |

## 📱 Key Features

### For Users
- ✅ Personalized AI workouts
- ✅ Meal planning with Indian foods
- ✅ Daily readiness assessment
- ✅ Progress tracking
- ✅ Multiple languages
- ✅ Dark mode
- ✅ Workout reminders

### For Developers
- ✅ Clean TypeScript code
- ✅ Modular architecture
- ✅ Comprehensive documentation
- ✅ Ready for scaling
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Docker support
- ✅ Production-ready

## 🧪 Testing the App

### 1. Create Account
- Phone: Any number (or use OTP mocking)
- Verify with OTP

### 2. Complete Onboarding
- Fill in personal info
- Select body type
- Choose lifestyle
- Pick gym experience
- Set fitness goals

### 3. Generate Workout
- Check today's workout
- View recommended intensity
- Mark exercises as complete

### 4. Log Food
- Search Indian foods
- Log meals
- Track protein intake

### 5. Check Readiness
- Provide daily energy/sleep/stress
- See readiness score
- Get AI recommendations

## 📊 Database

### MongoDB Collections
All collections are ready to use:
- **users** - User accounts & profiles
- **workouts** - Workout plans & logs
- **foodlogs** - Food consumption history
- **healthcheckins** - Daily health metrics

### Sample Queries
```javascript
// Find user
db.users.findOne({ phone: "+919876543210" })

// Get today's workout
db.workouts.findOne({ userId: ObjectId("..."), date: { $gte: new Date() } })

// Get food logs for user
db.foodlogs.find({ userId: ObjectId("...") })
```

## 🚀 Deployment

### Local Testing
See [all README files](#setup-guides) for detailed setup

### Cloud Deployment (Ready for)
- **Frontend**: Netlify, Vercel
- **Backend**: Heroku, AWS, Railway
- **AI Engine**: Heroku, AWS, Google Cloud
- **Database**: MongoDB Atlas

See `docs/ARCHITECTURE.md` for deployment guide

## 📖 Detailed Setup Guides

- [Frontend Setup](./frontend/SETUP.md)
- [Backend Setup](./backend/SETUP.md)
- [AI Engine Setup](./ai-engine/SETUP.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)

## 🆘 Common Issues

### Port Already in Use
```bash
# Change port for any service
npm run dev -- --port 3000  # Frontend
npm run dev -- --port 5001  # Backend
```

### MongoDB Not Found
```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com

# Start MongoDB
mongod
```

### Python Venv Issues
```bash
# Delete and recreate venv
rm -rf ai-engine/venv
python -m venv ai-engine/venv
source ai-engine/venv/bin/activate
pip install -r requirements.txt
```

## 🎓 Learning Resources

- **React**: [react.dev](https://react.dev)
- **TypeScript**: [typescriptlang.org](https://typescriptlang.org)
- **Express**: [expressjs.com](https://expressjs.com)
- **MongoDB**: [docs.mongodb.com](https://docs.mongodb.com)
- **FastAPI**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Tailwind**: [tailwindcss.com](https://tailwindcss.com)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 Code Style

- **Frontend**: Prettier + TypeScript strict mode
- **Backend**: ESLint + prettier
- **Python**: PEP 8 with black formatter

## 🔐 Security

- JWT authentication
- OTP-based login
- CORS protection
- Input validation
- Error message sanitization

## 📜 Disclaimer

⚠️ **IMPORTANT**: This application provides fitness recommendations but is NOT a substitute for professional medical advice. Always consult healthcare providers before significant lifestyle changes.

## 📝 License

MIT License - See LICENSE file

## 🎯 Next Steps

1. ✅ Clone this repository
2. ✅ Follow the Quick Start section
3. ✅ Create a test account
4. ✅ Explore the AI recommendations
5. ✅ Customize for your needs
6. ✅ Deploy to production

## 📞 Support

For issues:
1. Check relevant SETUP.md file
2. Review ARCHITECTURE.md for system overview
3. Check logs in terminal
4. Verify all services running

---

**Build Date**: 2024
**Status**: ✅ Production Ready
**Version**: 1.0.0

**Ready to Become Your Personal Gym Assistant!** 🏋️
