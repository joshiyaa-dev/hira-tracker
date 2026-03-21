# Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB local or cloud (Atlas)
- npm package manager

### Installation

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
npm run dev
```

Server runs at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## 🗄️ Database Setup

### Local MongoDB

```bash
# Make sure MongoDB is running
mongod

# Create database (automatic on first insert)
# DB name: hira
```

### MongoDB Atlas (Cloud)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create cluster
3. Copy connection string
4. Update `MONGODB_URI` in `.env`

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hira?retryWrites=true&w=majority
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── routes/         # API route handlers
│   ├── models/         # MongoDB schemas
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, error handling
│   ├── utils/          # Helper functions
│   └── index.ts        # Entry point
├── dist/               # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env.example
```

## 📡 API Routes

### Auth
- `POST /api/auth/request-otp` - Send OTP
- `POST /api/auth/login-otp` - Verify OTP & login
- `POST /api/auth/google` - Google login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:userId` - Get profile
- `PUT /api/users/:userId` - Update profile
- `POST /api/users/:userId/onboarding` - Complete onboarding

### Workouts
- `POST /api/workouts/:userId/generate` - Generate plan
- `GET /api/workouts/:userId/today` - Get today's workout
- `POST /api/workouts/:workoutId/log` - Log exercise
- `GET /api/workouts/:userId/history` - Workout history

### Nutrition
- `GET /api/nutrition/:userId/today` - Daily summary
- `POST /api/nutrition/:userId/log-food` - Log food
- `GET /api/nutrition/:userId/suggestions` - Suggestions

### Health
- `POST /api/health/:userId/check-in` - Daily check-in
- `GET /api/health/:userId/today-check-in` - Get check-in
- `GET /api/health/:userId/readiness` - Readiness score

### AI Engine
- `POST /api/ai/:userId/meal-suggestions` - Meal plans
- `POST /api/ai/:userId/adjust-intensity` - Intensity
- `POST /api/ai/:userId/personalized-plan` - Full plan

### Smartwatch
- `POST /api/smartwatch/:userId/connect` - Connect device
- `POST /api/smartwatch/:userId/sync` - Sync data

## 🔐 Environment Variables

Create `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hira

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# AI Engine
AI_ENGINE_URL=http://localhost:8000

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 📝 MongoDB Collections

### Users
```javascript
{
  phone: String (unique),
  email: String,
  name: String,
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  language: String,
  gymExperience: String,
  fitnessGoal: String,
  dietType: String,
  onboardingComplete: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Workouts
```javascript
{
  userId: ObjectId,
  date: Date,
  exercises: Array,
  totalDuration: Number,
  intensity: String,
  readinessScore: Number,
  completed: Boolean,
  completedExercises: Array
}
```

### FoodLogs
```javascript
{
  userId: ObjectId,
  foodId: String,
  servings: Number,
  date: Date,
  mealType: String
}
```

### HealthCheckIns
```javascript
{
  userId: ObjectId,
  date: Date,
  energy: Number,
  sleep: Number,
  stress: Number,
  soreness: Number,
  notes: String
}
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Lint code
npm run lint
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network access if using Atlas

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### TypeScript Errors
```bash
npm run build
```

## 📖 Technology Stack

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **TypeScript** - Type safety
- **CORS** - Cross-origin support

## 🔗 Integration

Frontend connects to:
```
http://localhost:5000/api
```

AI Engine connects to:
```
http://localhost:8000
```

## 📝 Further Reading

- [Express Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com)
- [JWT Auth](https://jwt.io)
